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

from channels import BENGALI_CHANNELS, BENGALI_OPINION_CHANNELS, NATIONAL_ENGLISH_CHANNELS, NATIONAL_HINDI_CHANNELS

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

DATA_DIR       = Path(__file__).parent.parent / "data"
META_FILE      = DATA_DIR / "channels_meta.json"
VIDEOS_FILE    = DATA_DIR / "videos.json"
FETCH_DAYS     = 2
MIN_DURATION   = 60
META_STALE_DAYS = 7

REGIONS = {
    "bengali":          BENGALI_CHANNELS,
    "opinion":          BENGALI_OPINION_CHANNELS,
    "national_english": NATIONAL_ENGLISH_CHANNELS,
    "national_hindi":   NATIONAL_HINDI_CHANNELS,
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


def fetch_playlist_videos(youtube, playlist_id, days):
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
            if pub >= cutoff:
                video_ids.append(item["contentDetails"]["videoId"])
            else:
                return video_ids

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


def fetch_region(youtube, region, channels, meta_channels):
    videos = []
    channel_type = region  # "bengali", "opinion", "national_english", "national_hindi"

    for ch in channels:
        cid     = ch["id"]
        ch_meta = meta_channels.get(cid, {})
        playlist_id = ch_meta.get("playlist_id")
        subscribers = ch_meta.get("subscribers", 0)

        if not playlist_id:
            print(f"  {ch['name']}: no playlist ID in meta, skipping")
            continue

        video_ids = fetch_playlist_videos(youtube, playlist_id, FETCH_DAYS)
        if not video_ids:
            print(f"  {ch['name']}: no videos in last {FETCH_DAYS}d")
            continue

        details = fetch_video_details(youtube, video_ids)
        count = 0
        for vd in details:
            dur  = duration_to_seconds(vd.get("contentDetails", {}).get("duration", ""))
            live = vd["snippet"].get("liveBroadcastContent", "none")

            if dur < MIN_DURATION and live != "live":
                continue

            pub = vd["snippet"].get("publishedAt", "")
            try:
                dt = datetime.datetime.strptime(pub, "%Y-%m-%dT%H:%M:%SZ").replace(
                    tzinfo=datetime.timezone.utc
                )
                timestamp = int(dt.timestamp())
            except Exception:
                timestamp = 0

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

        print(f"  {ch['name']}: {count} videos")

    return videos


def main():
    youtube = get_youtube()
    meta    = load_meta()

    if is_stale(meta):
        meta = refresh_meta(youtube, meta)
    else:
        print(f"[meta] Using cached metadata (updated {meta.get('last_updated', '?')})")

    meta_channels = meta.get("channels", {})
    output = {
        "last_updated":    datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "bengali":         [],
        "opinion":         [],
        "national_english": [],
        "national_hindi":   [],
    }

    cutoff_48h = int(datetime.datetime.now(datetime.timezone.utc).timestamp()) - 172800

    for region, channels in REGIONS.items():
        print(f"\n[fetch] === {region.upper()} ({len(channels)} channels) ===")
        videos = fetch_region(youtube, region, channels, meta_channels)
        purged = [v for v in videos if v["timestamp"] >= cutoff_48h]
        print(f"[fetch] {region}: {len(purged)} videos (last 48h)")
        output[region] = purged

    DATA_DIR.mkdir(exist_ok=True)
    VIDEOS_FILE.write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")
    total = sum(len(output[r]) for r in ["bengali", "opinion", "national_english", "national_hindi"])
    print(f"\n[done] {total} videos saved to {VIDEOS_FILE}")


if __name__ == "__main__":
    main()
