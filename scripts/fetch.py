"""
Fetches YouTube videos for all channels and saves to data/videos.json.

Channel metadata (playlist IDs + subscribers) is cached in data/channels_meta.json
and only refreshed when older than META_STALE_DAYS.

Quota budget (the YouTube Data API gives 10,000 units/day):
  - 1 unit per channel     -> playlistItems.list, one page in the steady state
  - 1 unit per 50 video IDs -> videos.list, batched across the whole section

  Video details are NOT re-fetched for every cached video on every run. Only
  brand-new IDs, videos younger than STATS_REFRESH_WINDOW, and videos that are
  live/upcoming are refreshed; everything else keeps the record already stored
  in videos.json. That keeps a full run near ~450 units instead of ~800, so
  every section can be fetched on every run instead of a few times a day.
"""

import os
import re
import json
import datetime
from pathlib import Path

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from channels import (
    BENGALI_CHANNELS, BENGALI_OPINION_CHANNELS,
    NATIONAL_ENGLISH_CHANNELS, NATIONAL_HINDI_CHANNELS, WORLD_NEWS_CHANNELS,
    HINDI_RIGHT_OPINION_CHANNELS, HINDI_LEFT_OPINION_CHANNELS,
    BANGLADESH_NEWS_CHANNELS, PAKISTAN_NEWS_CHANNELS, NEPAL_NEWS_CHANNELS,
    MYANMAR_NEWS_CHANNELS,
)

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

DATA_DIR              = Path(__file__).parent.parent / "data"
META_FILE             = DATA_DIR / "channels_meta.json"
VIDEOS_FILE           = DATA_DIR / "videos.json"
CACHE_FILE            = DATA_DIR / "video_id_cache.json"
STATE_FILE            = DATA_DIR / "periodic_state.json"
FETCH_DAYS            = 1
MIN_DURATION          = 60
META_STALE_DAYS       = 7
# View counts are only refreshed for videos younger than this. Older videos in
# the 24h window keep their last known stats, which saves most of the quota.
STATS_REFRESH_WINDOW  = 3 * 3600

IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

# Every section is fetched on every run. The order is rotated between runs so a
# quota shortfall never starves the same sections day after day.
SECTIONS = [
    ("bengali",             BENGALI_CHANNELS),
    ("opinion",             BENGALI_OPINION_CHANNELS),
    ("national_english",    NATIONAL_ENGLISH_CHANNELS),
    ("national_hindi",      NATIONAL_HINDI_CHANNELS),
    ("world_news",          WORLD_NEWS_CHANNELS),
    ("hindi_right_opinion", HINDI_RIGHT_OPINION_CHANNELS),
    ("hindi_left_opinion",  HINDI_LEFT_OPINION_CHANNELS),
    ("bangladesh",          BANGLADESH_NEWS_CHANNELS),
    ("pakistan",            PAKISTAN_NEWS_CHANNELS),
    ("nepal",               NEPAL_NEWS_CHANNELS),
    ("myanmar",             MYANMAR_NEWS_CHANNELS),
]

# Set once the API reports the daily quota is gone. Every later call is skipped
# so the run finishes quickly and carries existing data forward untouched.
QUOTA_EXCEEDED = False


def note_api_error(where, error):
    """Record an API failure; flag daily-quota exhaustion so the run bails out."""
    global QUOTA_EXCEEDED
    text = str(error)
    if "quotaExceeded" in text or "dailyLimitExceeded" in text:
        if not QUOTA_EXCEEDED:
            print(f"[quota] Daily API quota exhausted during {where} - "
                  f"skipping all further API calls and keeping existing data")
        QUOTA_EXCEEDED = True
    else:
        print(f"[{where}] API error: {error}")


def now_utc():
    return datetime.datetime.now(datetime.timezone.utc)


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def save_state(state):
    DATA_DIR.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


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
    age = now_utc() - datetime.datetime.fromisoformat(ts)
    return age.days >= META_STALE_DAYS


def load_video_cache():
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def purge_video_cache(cache):
    cutoff = int(now_utc().timestamp()) - 86400
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


def configured_channels():
    """Return every configured channel, keyed by its YouTube channel ID."""
    all_channels = {}
    for _, channels in SECTIONS:
        for ch in channels:
            all_channels[ch["id"]] = ch["name"]
    return all_channels


def missing_metadata_channels(meta):
    """Configured IDs which cannot yet be fetched from cached metadata."""
    cached_channels = meta.get("channels", {})
    unresolved = set(meta.get("unresolved_channel_ids", []))
    return [
        channel_id for channel_id in configured_channels()
        if (not cached_channels.get(channel_id, {}).get("playlist_id") and
            channel_id not in unresolved)
    ]


def refresh_meta(youtube, meta):
    """Resolve uploads-playlist IDs and subscriber counts for every channel.

    Results are merged into the existing metadata instead of replacing it, so a
    partial failure (quota, transient 5xx) can never wipe metadata that is still
    good and leave every channel unfetchable on the runs that follow.
    """
    print("[meta] Refreshing channel metadata (playlist IDs + subscribers)...")
    all_channels = configured_channels()

    ids = list(all_channels.keys())
    channel_data = {}
    refresh_failed = False

    for i in range(0, len(ids), 50):
        if QUOTA_EXCEEDED:
            refresh_failed = True
            break
        chunk = ids[i:i + 50]
        try:
            res = youtube.channels().list(
                part="contentDetails,statistics,snippet",
                id=",".join(chunk)
            ).execute()
            for item in res.get("items", []):
                cid = item["id"]
                channel_data[cid] = {
                    "name":        item["snippet"]["title"],
                    "playlist_id": item["contentDetails"]["relatedPlaylists"]["uploads"],
                    "subscribers": int(item["statistics"].get("subscriberCount", 0)),
                }
        except HttpError as e:
            note_api_error("meta", e)
            refresh_failed = True

    merged = dict(meta.get("channels", {}))
    merged.update(channel_data)
    meta["channels"] = merged

    # Do not spend quota refreshing on every run for a deleted or invalid channel
    # ID.  New IDs are still missing and trigger an immediate refresh; unresolved
    # IDs are retried with the normal weekly metadata refresh.
    if not refresh_failed:
        meta["unresolved_channel_ids"] = sorted(set(all_channels) - set(channel_data))
        meta["last_updated"] = now_utc().isoformat()
        print(f"[meta] Saved metadata for {len(channel_data)} channels")
    else:
        # Leave last_updated alone so the next run retries instead of treating
        # this incomplete refresh as a fresh one.
        print(f"[meta] Partial refresh: resolved {len(channel_data)}/{len(ids)} "
              f"channels, will retry next run")

    DATA_DIR.mkdir(exist_ok=True)
    META_FILE.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
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

    The uploads playlist covers everything a channel published - regular
    uploads, live streams (the /streams tab) and podcast episodes - so one scan
    per channel is enough; there is no separate endpoint to call for lives.

    Playlist entries are usually newest-first, but active/scheduled live streams
    are not reliably ordered by their video publication time.  So neither a
    cached ID nor an out-of-window date is a safe boundary mid-page: a newer
    upload can sit further down the same page.  Scan the whole page, then stop,
    so a normal refresh still needs only one playlist request per channel.
    """
    cutoff = (now_utc() - datetime.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")

    video_ids, next_token = [], None
    while True:
        if QUOTA_EXCEEDED:
            break
        try:
            res = youtube.playlistItems().list(
                part="contentDetails",
                playlistId=playlist_id,
                maxResults=50,
                pageToken=next_token,
            ).execute()
        except HttpError as e:
            note_api_error("fetch", e)
            break

        stop_after_page = False
        for item in res.get("items", []):
            pub = item.get("contentDetails", {}).get("videoPublishedAt", "")
            vid = item["contentDetails"]["videoId"]

            if known_ids and vid in known_ids:
                # Already known: everything below is old cache territory, but
                # finish this page in case a live stream reordered it.
                stop_after_page = True
            elif not pub:
                # An empty publication time can be an active live stream.
                video_ids.append(vid)
            elif pub >= cutoff:
                video_ids.append(vid)
            else:
                stop_after_page = True

        if stop_after_page:
            return video_ids

        next_token = res.get("nextPageToken")
        if not next_token:
            break
    return video_ids


def fetch_video_details(youtube, video_ids):
    """videos.list over any number of IDs, batched 50 at a time (1 unit each)."""
    details = []
    for i in range(0, len(video_ids), 50):
        if QUOTA_EXCEEDED:
            break
        chunk = video_ids[i:i + 50]
        try:
            res = youtube.videos().list(
                part="snippet,statistics,contentDetails",
                id=",".join(chunk)
            ).execute()
            details.extend(res.get("items", []))
        except HttpError as e:
            note_api_error("fetch", e)
    return details


def needs_stats_refresh(vid, published_ts, existing_by_id, now_ts):
    """Whether a cached video is worth spending quota on again this run."""
    if now_ts - published_ts <= STATS_REFRESH_WINDOW:
        return True
    # A stream that is on air (or about to be) has to be re-checked so it can
    # flip to a finished video with a real duration and a final view count.
    return existing_by_id.get(vid, {}).get("live_broadcast") in ("live", "upcoming")


def fetch_section(youtube, section, channels, meta_channels, video_cache, existing_by_id):
    """Fetch one section in two passes: a playlist scan per channel, then a
    single batched videos.list over every ID the whole section needs."""
    now_ts       = int(now_utc().timestamp())
    ids_to_get   = []   # ordered, de-duplicated
    id_owner     = {}   # video_id -> configured channel id
    channel_info = {}   # channel id -> (display name, subscribers)
    new_counts, cached_counts = {}, {}

    for ch in channels:
        cid         = ch["id"]
        ch_meta     = meta_channels.get(cid, {})
        playlist_id = ch_meta.get("playlist_id")
        ch_name     = ch_meta.get("name") or ch["name"]  # prefer API name over placeholder
        channel_info[cid] = (ch_name, ch_meta.get("subscribers", 0))

        if not playlist_id:
            print(f"  {ch['name']}: no playlist ID in meta, skipping")
            continue
        if QUOTA_EXCEEDED:
            continue

        known     = video_cache.get(cid, {})
        known_ids = set(known.keys())

        new_ids   = fetch_playlist_videos(youtube, playlist_id, FETCH_DAYS, known_ids)
        stale_ids = [vid for vid, ts in known.items()
                     if needs_stats_refresh(vid, ts, existing_by_id, now_ts)]

        new_counts[cid]    = len(new_ids)
        cached_counts[cid] = len(known_ids)

        for vid in new_ids + stale_ids:
            if vid not in id_owner:
                id_owner[vid] = cid
                ids_to_get.append(vid)

    details = fetch_video_details(youtube, ids_to_get)

    videos      = []
    per_channel = {}
    for vd in details:
        cid = id_owner.get(vd["id"], vd["snippet"].get("channelId", ""))
        ch_name, subscribers = channel_info.get(
            cid, (vd["snippet"].get("channelTitle", ""), 0))

        dur  = duration_to_seconds(vd.get("contentDetails", {}).get("duration", ""))
        live = vd["snippet"].get("liveBroadcastContent", "none")

        pub = vd["snippet"].get("publishedAt", "")
        try:
            if pub:
                dt = datetime.datetime.strptime(pub, "%Y-%m-%dT%H:%M:%SZ").replace(
                    tzinfo=datetime.timezone.utc
                )
                timestamp = int(dt.timestamp())
            else:
                # Active live stream - publishedAt is empty; use current time
                timestamp = now_ts
        except Exception:
            timestamp = now_ts

        # Cache ALL video IDs (including shorts) so early-stop works correctly
        video_cache.setdefault(cid, {})[vd["id"]] = timestamp

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
            "channel_name":   ch_name,
            "channel_type":   section,
            "view_count":     int(stats.get("viewCount", 0)),
            "subscribers":    subscribers,
            "timestamp":      timestamp,
            "duration":       dur,
            "thumbnail":      thumb,
            "live_broadcast": live,
        })
        per_channel[cid] = per_channel.get(cid, 0) + 1

    for ch in channels:
        cid = ch["id"]
        if cid in new_counts:
            print(f"  {channel_info[cid][0]}: {per_channel.get(cid, 0)} videos "
                  f"({new_counts[cid]} new, {cached_counts[cid]} cached)")

    print(f"[fetch] {section}: refreshed {len(ids_to_get)} video IDs "
          f"(~{-(-len(ids_to_get) // 50)} videos.list units)")
    return videos


def main():
    youtube = get_youtube()
    meta    = load_meta()
    missing_metadata = missing_metadata_channels(meta)

    if is_stale(meta) or missing_metadata:
        if missing_metadata:
            print(f"[meta] Refreshing because {len(missing_metadata)} configured "
                  f"channel(s) are missing metadata")
        meta = refresh_meta(youtube, meta)
    else:
        print(f"[meta] Using cached metadata (updated {meta.get('last_updated', '?')})")

    meta_channels = meta.get("channels", {})

    # Load video ID cache and purge entries older than 24h
    video_cache = load_video_cache()
    video_cache = purge_video_cache(video_cache)

    existing = {}
    if VIDEOS_FILE.exists():
        try:
            existing = json.loads(VIDEOS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass

    cutoff_24h = int(now_utc().timestamp()) - 86400

    def keep(video):
        """Inside the rolling 24h window, or still on air."""
        return (video.get("timestamp", 0) >= cutoff_24h or
                video.get("live_broadcast") == "live")

    output         = {"last_updated": now_utc().isoformat()}
    existing_by_id = {}
    for section, _ in SECTIONS:
        output[section] = [v for v in existing.get(section, []) if keep(v)]
        for v in output[section]:
            existing_by_id[v["video_id"]] = v

    def update_section(key, new_videos):
        fresh = [v for v in new_videos if keep(v)]
        if fresh:
            merged = {v["video_id"]: v for v in output.get(key, [])}
            for v in fresh:
                merged[v["video_id"]] = v
            output[key] = list(merged.values())
            print(f"[fetch] {key}: updated with {len(fresh)} videos "
                  f"(total {len(output[key])})")
        else:
            print(f"[fetch] {key}: no new videos fetched, keeping "
                  f"{len(output.get(key, []))} existing videos")

    # Rotate which section goes first so an exhausted quota cannot starve the
    # same sections on every run.
    state  = load_state()
    offset = int(state.get("section_offset", 0)) % len(SECTIONS)
    order  = SECTIONS[offset:] + SECTIONS[:offset]

    for section, channels in order:
        if QUOTA_EXCEEDED:
            print(f"\n[fetch] === {section.upper()} - skipped, quota exhausted ===")
            continue
        print(f"\n[fetch] === {section.upper()} ({len(channels)} channels) ===")
        update_section(section, fetch_section(
            youtube, section, channels, meta_channels, video_cache, existing_by_id))

    save_state({
        "section_offset":  (offset + 1) % len(SECTIONS),
        "last_run":        now_utc().isoformat(),
        "quota_exhausted": QUOTA_EXCEEDED,
    })

    DATA_DIR.mkdir(exist_ok=True)
    VIDEOS_FILE.write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")

    save_video_cache(video_cache)

    print("\n[done] videos per section:")
    for section, _ in SECTIONS:
        print(f"  {section:22} {len(output[section])}")
    total = sum(len(output[s]) for s, _ in SECTIONS)
    print(f"[done] {total} videos saved to {VIDEOS_FILE}"
          + (" (INCOMPLETE - daily quota exhausted)" if QUOTA_EXCEEDED else ""))


if __name__ == "__main__":
    main()
