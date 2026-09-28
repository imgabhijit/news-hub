# Refresh scheduling: cron-job.org + GitHub token

The `Refresh Videos` workflow (`.github/workflows/refresh.yml`) no longer uses
GitHub Actions' own `schedule:` trigger. It's triggered externally by
[cron-job.org](https://cron-job.org) calling the workflow's
`workflow_dispatch` API on a schedule.

## Why not GitHub's own `schedule:` trigger

GitHub Actions' `schedule` trigger is documented as best-effort: under load,
GitHub delays or silently drops scheduled runs with no retry. This was
measured directly on this repo:

- Original `0 */2 * * *` (every 2h) cron: **50% checkpoint hit rate**,
  average gap between runs 4.44h, worst gap 7.24h.
- Denser `*/30 * * * *` cron: no improvement over baseline in the runs
  observed.
- Two offset hourly entries (`15 * * * *` + `45 * * * *`, same total
  frequency as `*/30`): **44% checkpoint hit rate** - not better than the
  original baseline.

None of these got materially closer to hitting the reader-facing checkpoints
below. `workflow_dispatch`, by contrast, is an on-demand API call rather than
a scheduled queue entry, and has been 100% reliable in testing (every manual
"Run workflow" click and every cron-job.org test run has fired within
seconds). So the fix was to stop asking GitHub to remember to run something,
and instead have an external service actively call the API at the right
times.

## Checkpoints

Data must be fresh by these times (IST), each ~2-3h apart:

**02:00, 06:00, 09:00, 12:00, 15:00, 17:00, 19:00, 21:00, 23:00** IST

(Originally set 30 minutes later on each - e.g. 23:30 instead of 23:00 -
but 23:30/11:30pm was judged too late to be useful to readers, so the whole
schedule was shifted 30 minutes earlier to land on the hour in IST instead.)

Converted to UTC (cron-job.org's job timezone is set to UTC) these land on
the half-hour:

| IST checkpoint | UTC (cron time) |
|---|---|
| 02:00 | 20:30 (previous day) |
| 06:00 | 00:30 |
| 09:00 | 03:30 |
| 12:00 | 06:30 |
| 15:00 | 09:30 |
| 17:00 | 11:30 |
| 19:00 | 13:30 |
| 21:00 | 15:30 |
| 23:00 | 17:30 |

Crontab expression used in cron-job.org (Custom schedule, timezone UTC):

```
30 20,0,3,6,9,11,13,15,17 * * *
```

## GitHub token setup

The workflow is triggered via GitHub's REST API, which needs a token scoped
as narrowly as possible.

1. Go to **github.com/settings/tokens?type=beta** (fine-grained tokens).
2. **Generate new token**:
   - Token name: `news-hub-refresh-trigger` (or similar)
   - Expiration: a bounded period (e.g. 90 days or 1 year) - avoid "No
     expiration" so a forgotten token can't live forever
   - Resource owner: your account
   - Repository access: **Only select repositories** -> `news-hub`
3. Under **Permissions -> Repository permissions**:
   - **Actions: Read and write** (the only permission actually needed to
     dispatch a workflow run)
   - **Metadata: Read-only** is auto-added and required; leave everything
     else as "No access"
4. Generate, then copy the token immediately - GitHub only shows it once.

If the token is ever exposed (e.g. pasted somewhere it shouldn't be, shown in
a screenshot), revoke it immediately from the tokens page and generate a
replacement, then update the header in cron-job.org (step below).

## cron-job.org job configuration

1. **Title**: `news-hub refresh trigger`
2. **URL**:
   ```
   https://api.github.com/repos/imgabhijit/news-hub/actions/workflows/refresh.yml/dispatches
   ```
3. **Schedule**: Custom, crontab expression `30 20,0,3,6,9,11,13,15,17 * * *`,
   timezone UTC (see table above).
4. **Advanced tab**:
   - Request method: **POST**
   - Headers:
     - `Authorization: Bearer <the fine-grained token from above>`
     - `Accept: application/vnd.github+json`
     - `Content-Type: application/json`
   - Request body:
     ```json
     {"ref":"main"}
     ```
   - Timeout: 30s is enough - `workflow_dispatch` only needs to be
     *acknowledged* (GitHub responds `204 No Content` in ~1-2s); it does not
     wait for the workflow itself to finish running.
5. Optionally enable **"Notify me when execution of the cronjob fails"** so a
   broken token or API change surfaces by email instead of silently going
   stale.

A successful trigger returns **HTTP 204 No Content**. The actual workflow run
then appears on GitHub under **Actions -> Refresh Videos**, listed with
trigger type `workflow_dispatch`, and typically finishes in 1-2 minutes.

## Rotating the token

If the token needs replacing (expired, exposed, or just rotating on a
schedule):

1. Generate a new fine-grained token with the same settings as above.
2. In cron-job.org, edit the job's `Authorization` header value to
   `Bearer <new token>`.
3. Use cron-job.org's "Test run" button to confirm a `204` response.
4. Delete the old token from github.com/settings/tokens.

## Why GitHub's `schedule:` trigger was removed from the workflow

It added no value once cron-job.org became the actual trigger (every
`workflow_dispatch` call already runs the real fetch), and kept the
measured-unreliable code path around as a false sense of redundancy. The
workflow now only listens for `workflow_dispatch` - fired by cron-job.org on
schedule, or manually from the GitHub UI's "Run workflow" button.
