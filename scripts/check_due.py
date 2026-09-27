"""
Watchdog check for the refresh workflow.

GitHub Actions' `schedule` trigger is not reliable: runs drift by 1-2.5 hours
and are sometimes skipped entirely. Reader-facing checkpoints (times by which
fresh data must exist) can't depend on that alone, so this script is run
frequently and cheaply (no YouTube API calls) to decide whether THIS run
should actually fetch.

A run is due when:
  - we've passed one of today's IST checkpoints and the last successful fetch
    was before that checkpoint, or
  - the last fetch is older than MAX_GAP_HOURS regardless of checkpoints
    (a safety net for the case where every checkpoint got skipped anyway).

Prints "true" or "false" and sets GITHUB_OUTPUT `due=true|false` so the
workflow can conditionally run the real fetch step.
"""

import datetime
import json
import os
import sys
from pathlib import Path

DATA_DIR   = Path(__file__).parent.parent / "data"
STATE_FILE = DATA_DIR / "periodic_state.json"

IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

# Reader-facing checkpoints, in IST. By each of these times, one fetch must
# have completed since the previous checkpoint. 2am is a low-yield but cheap
# checkpoint - most configured channels are India-focused and quiet overnight,
# but world-news channels are in other timezones where 2am IST can be prime
# time, so it stays in as insurance against overnight breaking news.
CHECKPOINTS_IST = [2, 6, 9, 12, 15, 17, 19, 21, 23]

# Safety net: force a fetch if it's been this long regardless of checkpoints,
# so a run isn't starved for a full day if every checkpoint window is missed.
MAX_GAP_HOURS = 5


def load_last_run():
    if not STATE_FILE.exists():
        return None
    try:
        state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        ts = state.get("last_run")
        return datetime.datetime.fromisoformat(ts) if ts else None
    except Exception:
        return None


def most_recent_checkpoint(now_ist):
    """The most recent checkpoint time (today or yesterday) at/before now."""
    today = now_ist.date()
    candidates = []
    for h in CHECKPOINTS_IST:
        candidates.append(datetime.datetime(
            today.year, today.month, today.day, h, 0, 0, tzinfo=IST))
    candidates.append(datetime.datetime(
        today.year, today.month, today.day, 0, 0, 0, tzinfo=IST))  # midnight anchor
    past = [c for c in candidates if c <= now_ist]
    if past:
        return max(past)
    # Before the first checkpoint of the day: compare against yesterday's last one.
    yesterday = today - datetime.timedelta(days=1)
    last_h = CHECKPOINTS_IST[-1]
    return datetime.datetime(
        yesterday.year, yesterday.month, yesterday.day, last_h, 0, 0, tzinfo=IST)


def main():
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    now_ist = now_utc.astimezone(IST)
    last_run = load_last_run()

    if last_run is None:
        due, reason = True, "no previous run recorded"
    else:
        gap_hours = (now_utc - last_run).total_seconds() / 3600
        checkpoint = most_recent_checkpoint(now_ist)
        if last_run.astimezone(IST) < checkpoint:
            due = True
            reason = (f"checkpoint {checkpoint.strftime('%H:%M IST')} passed, "
                       f"last run was {last_run.astimezone(IST).strftime('%Y-%m-%d %H:%M IST')}")
        elif gap_hours >= MAX_GAP_HOURS:
            due = True
            reason = f"safety net: {gap_hours:.1f}h since last run (max {MAX_GAP_HOURS}h)"
        else:
            due = False
            reason = (f"last run {last_run.astimezone(IST).strftime('%H:%M IST')} covers "
                       f"checkpoint {checkpoint.strftime('%H:%M IST')}, "
                       f"{gap_hours:.1f}h ago")

    print(f"[watchdog] now={now_ist.strftime('%Y-%m-%d %H:%M IST')} due={due} ({reason})")

    gh_output = os.environ.get("GITHUB_OUTPUT")
    if gh_output:
        with open(gh_output, "a", encoding="utf-8") as f:
            f.write(f"due={'true' if due else 'false'}\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
