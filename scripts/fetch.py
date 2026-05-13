"""
Fetches YouTube videos for all channels and saves to data/videos.json.
Channel metadata (playlist IDs + subscribers) is cached in data/channels_meta.json
and only refreshed when older than META_STALE_DAYS (saves ~98% of API quota).

Quota cost per run:
  - Normal (meta cached):  ~2 units per channel (playlistItems + videos.list)
  - Meta refresh (weekly): +1 unit per 50 channels
"""

import os
import re
import sys
import json
import datetime
from pathlib import Path

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from channels import BENGALI_CHANNELS, BENGALI_OPINION_CHANNELS, NATIONAL_ENGLISH_CHANNELS, NATIONAL_HINDI_CHANNELS, WORLD_NEWS_CHANNELS

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

DATA_DIR        = Path(__file__).parent.parent / "data"
META_FILE       = DATA_DIR / "channels_meta.json"
VIDEOS_FILE     = DATA_DIR / "videos.json"
CACHE_FILE      = DATA_DIR / "video_id_cache.json"
FETCH_DAYS      = 1
MIN_DURATION    = 60
META_STALE_DAYS = 7

REGIONS = {
    "bengali":          BENGALI_CHANNELS,
    "opinion":          BENGALI_OPINION_CHANNELS,
    "national_english": NATIONAL_ENGLISH_CHANNELS,
    "national_hindi":   NATIONAL_HINDI_CHANNELS,
    "world_news":       WORLD_NEWS_CHANNELS,
}


def get_youtube():
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if not key:
        raise RuntimeError("YOUTUBE_API_KEY not set. Add it to .env or GitHub Secrets.")
    return build("youtube", "v3", developerKey=key)


def load_meta():
    if META_FILE.exists():
        try:
            return json.loads(META_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def is_stale(meta):
    ts = meta.get("last_updated")
    if not ts:
        return True
    age = datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(ts)
    return age.days >= META_STALE_DAYS


def load_video_cache():
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def purge_video_cache(cache):
    cutoff = int(datetime.datetime.now(datetime.timezone.utc).timestamp()) - 86400
    purged = 0
    for cid in list(cache.keys()):
        before = len(cache[cid])
        cache[cid] = {vid: ts for vid, ts in cache[cid].items() if ts >= cutoff}
        purged += before - len(cache[cid])
        if not cache[cid]:
            del cache[cid]
    if purged:
        print(f"[cache] Purged {purged} video IDs older than 24h")
    return cache


def save_video_cache(cache):
    DATA_DIR.mkdir(exist_ok=True)
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
    total = sum(len(v) for v in cache.values())
    print(f"[cache] Saved {total} video IDs across {len(cache)} channels")


def refresh_meta(youtube, meta):
    print("[meta] Refreshing channel metadata (playlist IDs + subscribers)...")
    all_channels = {}
    for channels in REGIONS.values():
        for ch in channels:
            all_channels[ch["id"]] = ch["name"]

    ids = list(all_channels.keys())
    channel_data = {}

    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        try:
            res = youtube.channels().list(
                part="contentDetails,statistics",
                id=",".join(chunk)
            ).execute()
            for item in res.get("items", []):
                cid = item["id"]
                channel_data[cid] = {
                    "name":        all_channels[cid],
                    "playlist_id": item["contentDetails"]["relatedPlaylists"]["uploads"],
                    "subscribers": int(item["statistics"].get("subscriberCount", 0)),
                }
        except HttpError as e:
            print(f"[meta] API error: {e}")

    meta["channels"]     = channel_data
    meta["last_updated"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    DATA_DIR.mkdir(exist_ok=True)
    META_FILE.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[meta] Saved metadata for {len(channel_data)} channels")
    return meta


def duration_to_seconds(iso):
    if not iso:
        return 0
    m = re.match(r"P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso)
    if not m:
        return 0
    d, h, mi, s = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + s


def fetch_playlist_videos(youtube, playlist_id, days, known_ids=None):
    """Fetch new video IDs from a channel's uploads playlist.

    Stops early when a known (already-cached) video ID is encountered,
    since the playlist is newest-first and everything after is already known.
    """
    cutoff = (
        datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    ).strftime("%Y-%m-%dT%H:%M:%SZ")

    video_ids, next_token = [], None
    while True:
        try:
            res = youtube.playlistItems().list(
                part="contentDetails",
                playlistId=playlist_id,
                maxResults=50,
                pageToken=next_token,
            ).execute()
        except HttpError as e:
            print(f"[fetch] playlistItems error: {e}")
            break

        for item in res.get("items", []):
            pub = item.get("contentDetails", {}).get("videoPublishedAt", "")
            vid = item["contentDetails"]["videoId"]

            if known_ids and vid in known_ids:
                return video_ids  # hit a known ID — everything after is already cached

            if pub >= cutoff:
                video_ids.append(vid)
            else:
                return video_ids  # hit a video older than our window

        next_token = res.get("nextPageToken")
        if not next_token:
            break
    return video_ids


def fetch_video_details(youtube, video_ids):
    details = []
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i:i + 50]
        try:
            res = youtube.videos().list(
                part="snippet,statistics,contentDetails",
                id=",".join(chunk)
            ).execute()
            details.extend(res.get("items", []))
        except HttpError as e:
            print(f"[fetch] videos.list error: {e}")
    return details


def fetch_region(youtube, region, channels, meta_channels, video_cache):
    videos = []
    channel_type = region  # "bengali", "opinion", "national_english", "national_hindi"

    for ch in channels:
        cid         = ch["id"]
        ch_meta     = meta_channels.get(cid, {})
        playlist_id = ch_meta.get("playlist_id")
        subscribers = ch_meta.get("subscribers", 0)

        if not playlist_id:
            print(f"  {ch['name']}: no playlist ID in meta, skipping")
            continue

        # Known IDs for this channel (already cached, published within 24h)
        known = video_cache.get(cid, {})
        known_ids = set(known.keys())

        # Only fetch IDs we haven't seen before; stop early on first known ID
        new_ids = fetch_playlist_videos(youtube, playlist_id, FETCH_DAYS, known_ids)

        # All IDs to fetch metadata for = new + cached (views need refreshing every run)
        all_ids = new_ids + list(known_ids)
        if not all_ids:
            print(f"  {ch['name']}: no videos in last {FETCH_DAYS}d")
            continue

        details = fetch_video_details(youtube, all_ids)
        count = 0
        for vd in details:
            dur  = duration_to_seconds(vd.get("contentDetails", {}).get("duration", ""))
            live = vd["snippet"].get("liveBroadcastContent", "none")

            pub = vd["snippet"].get("publishedAt", "")
            try:
                dt = datetime.datetime.strptime(pub, "%Y-%m-%dT%H:%M:%SZ").replace(
                    tzinfo=datetime.timezone.utc
                )
                timestamp = int(dt.timestamp())
            except Exception:
                timestamp = 0

            # Cache ALL video IDs (including shorts) so early-stop works correctly
            if cid not in video_cache:
                video_cache[cid] = {}
            video_cache[cid][vd["id"]] = timestamp

            if dur < MIN_DURATION and live != "live":
                continue

            stats = vd.get("statistics", {})
            thumb = (
                vd["snippet"].get("thumbnails", {})
                .get("high", {})
                .get("url", f"https://i.ytimg.com/vi/{vd['id']}/mqdefault.jpg")
            )

            videos.append({
                "video_id":       vd["id"],
                "title":          vd["snippet"].get("title", ""),
                "channel_id":     cid,
                "channel_name":   ch["name"],
                "channel_type":   channel_type,
                "view_count":     int(stats.get("viewCount", 0)),
                "subscribers":    subscribers,
                "timestamp":      timestamp,
                "duration":       dur,
                "thumbnail":      thumb,
                "live_broadcast": live,
            })
            count += 1

        print(f"  {ch['name']}: {count} videos ({len(new_ids)} new, {len(known_ids)} cached)")

    return videos


def main():
    youtube = get_youtube()
    meta    = load_meta()

    if is_stale(meta):
        meta = refresh_meta(youtube, meta)
    else:
        print(f"[meta] Using cached metadata (updated {meta.get('last_updated', '?')})")

    meta_channels = meta.get("channels", {})

    # Load video ID cache and purge entries older than 24h
    video_cache = load_video_cache()
    video_cache = purge_video_cache(video_cache)

    output = {
        "last_updated":     datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "bengali":          [],
        "opinion":          [],
        "national_english": [],
        "national_hindi":   [],
    }

    cutoff_24h = int(datetime.datetime.now(datetime.timezone.utc).timestamp()) - 86400

    for region, channels in REGIONS.items():
        print(f"\n[fetch] === {region.upper()} ({len(channels)} channels) ===")
        videos = fetch_region(youtube, region, channels, meta_channels, video_cache)
        purged = [v for v in videos if v["timestamp"] >= cutoff_24h]
        print(f"[fetch] {region}: {len(purged)} videos (last 24h)")
        output[region] = purged

    DATA_DIR.mkdir(exist_ok=True)
    VIDEOS_FILE.write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")

    # Persist updated video ID cache
    save_video_cache(video_cache)

    total = sum(len(output[r]) for r in ["bengali", "opinion", "national_english", "national_hindi"])
    print(f"\n[done] {total} videos saved to {VIDEOS_FILE}")


if __name__ == "__main__":
    main()
