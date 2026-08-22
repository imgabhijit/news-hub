# 🌐 News Hub — Multi-Region YouTube News Aggregator PWA

[![Live Site](https://img.shields.io/badge/Live%20Site-imgabhijit.github.io%2Fnews--hub-brightgreen?style=for-the-badge&logo=githubpages)](https://imgabhijit.github.io/news-hub/)
[![Refresh Videos](https://github.com/imgabhijit/news-hub/actions/workflows/refresh.yml/badge.svg)](https://github.com/imgabhijit/news-hub/actions/workflows/refresh.yml)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blue?style=for-the-badge&logo=pwa)](https://imgabhijit.github.io/news-hub/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](LICENSE)

A high-performance, serverless Progressive Web App (PWA) that aggregates, ranks, and filters top YouTube news bulletins and political commentary in real time across **Bengali, National (English & Hindi), World News, Neighboring Nations, and Regional/District feeds**. 

Powered by **GitHub Pages**, **GitHub Actions (cron schedule)**, and **YouTube Data API v3**, the platform runs **100% free with zero backend hosting costs**.

---

## 🚀 Live Demo

- **Main Hub:** [https://imgabhijit.github.io/news-hub/](https://imgabhijit.github.io/news-hub/)
- **Bengali News:** `bengali.html`
- **National News (English & Hindi):** `national.html`
- **World News:** `world.html`
- **Political Opinion & Analysis:** `opinion.html`
- **Neighboring Nations:** `neighbour.html`
- **District & Regional Watch:** `india_watch.html`

---

## 🏗️ Architecture & Serverless Data Flow

```
   ┌─────────────────────────────────────────────────────────┐
   │ GitHub Actions Cron (Runs automatically every 2 hours)  │
   └──────────────────────────┬──────────────────────────────┘
                              │
                              ▼
                   scripts/fetch.py
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
         ▼                                         ▼
YouTube Data API v3                      data/channels_meta.json
(Playlist & Video metrics)              (Cached subscriber count &
         │                               playlist IDs, updated weekly)
         ▼                                         │
 🛠️ Filter & Process                               │
  • Duration >= 60s (Excludes Shorts)              │
  • Time window & velocity scoring                 │
  • Window-based opinion & neighbour sync          │
         │                                         │
         ▼                                         │
  data/videos.json  ◄──────────────────────────────┘
         │
         ▼
 🚀 Git Auto-Commit & Push to GitHub Pages
         │
         ▼
 📱 PWA Static Frontend (Vanilla HTML5 / JS / Service Worker)
```

No databases, server processes, or third-party paid hosting. The frontend fetches optimized `data/videos.json` and renders interactive feeds instantly on client side.

---

## ✨ Key Features & Pages

### 📄 Pages & Modules

| Page | Purpose | Coverage / Regions |
|---|---|---|
| [`index.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/index.html) | Landing Portal | Quick category selection grid & region switcher |
| [`bengali.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/bengali.html) | Bengali Feed | TV News Media (ABP Ananda, Zee 24 Ghanta, TV9) + Print outlets & Opinion YouTubers |
| [`national.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/national.html) | National News | Dual English & Hindi tabs (NDTV, India Today, Aaj Tak, Republic, WION, Lallantop) |
| [`world.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/world.html) | World News | Global networks (BBC, Reuters, Al Jazeera, DW, CNN, AP, France 24) |
| [`opinion.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/opinion.html) | Political Spectrum | Left / Right / Independent political commentary & analysis channels |
| [`neighbour.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/neighbour.html) | South Asia Focus | News updates from Bangladesh, Pakistan, Nepal, and Myanmar |
| [`india_watch.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/india_watch.html) | Regional & District Watch | State and district-specific media streams across India |
| [`player.html`](file:///d:/Antigravity_Workspace/Top_News_Portal_Github/player.html) | Embedded Player | Native YouTube IFrame API modal with autoplay, next-up queues, & growth hooks |

---

### 🎛️ Interactive Controls & Smart Filters

- **Time Windows:**
  - `Last Night` (Yesterday 8 PM → Today 6 AM)
  - `Today` (Today 6 AM → Current time)
  - `Tonight` (Today 6 PM → Current time)
  - `1h` / `3h` / `5h` / `24h` rolling windows
- **Sort Modes:**
  - 🚀 **Velocity:** Views per hour since upload (ranks viral breaking news fastest)
  - 🔥 **Trending:** Subscribers-to-views ratio with exponential time-decay
  - 👁️ **Views:** Absolute view count
  - ⏱️ **Newest / Oldest:** Strict chronological sorting
- **Min View Count Thresholds:** Auto thresholding (filters low-engagement noise) or custom filters (`1K+`, `5K+`, `10K+`, `50K+`, `100K+`, `500K+`).
- **Duration Filtering:** All, `< 1 min`, `1–3 min`, `3–15 min`, `15–30 min`, `30+ min`.
- **Live Stream Tracking:** Dedicated tab for 24/7 ongoing live broadcasts across all channels.

---

## ⚡ YouTube API Quota Optimization

To prevent exceeding the YouTube Data API free limit (10,000 units/day), `scripts/fetch.py` uses an aggressive caching and batching architecture:

| Strategy | Standard Approach | Our Optimized Approach | Saving |
|---|---|---|---|
| **Video Discovery** | `search.list` (100 units / request) | `playlistItems.list` on Uploads Playlist (1 unit / request) | **99% cheaper** |
| **Channel Metadata** | Fetched every run | Cached in `channels_meta.json` (Refreshed every 7 days) | **~98% saved** |
| **Batching** | Single video details call | Batched `videos.list` (Up to 50 video IDs per call) | **50x reduction** |
| **Daily Quota Used** | ~35,000 units (Exceeds free tier) | **~960 - 2,800 units/day** | **70%+ free headroom** |

---

## 📱 Progressive Web App (PWA)

- **Offline Support:** `sw.js` (Service Worker) employs a hybrid strategy: Network-First for dynamic `data/videos.json` and Cache-First for static assets.
- **Installable:** Native app-like experience on Android (Chrome prompt) and iOS (Safari "Add to Home Screen").
- **App Icons:** Custom responsive icons in `icons/` generated via standard library Python scripts (`scripts/create_icons.py`).

---

## 🛠️ Project Structure

```
Top_News_Portal_Github/
├── .github/
│   └── workflows/
│       └── refresh.yml       # GitHub Actions workflow (runs every 2 hours)
├── data/
│   ├── videos.json           # Aggregated video dataset (last 24h)
│   ├── channels_meta.json    # Cached channel uploads playlist IDs & subscriber counts
│   ├── video_id_cache.json   # 24-hour video ID deduplication cache
│   ├── periodic_state.json   # Opinion window state tracker
│   ├── geo-countries.js      # District & country geographical mapping data
│   ├── geo-districts.js
│   └── geo-states.js
├── icons/                    # PWA launcher icons (192x192, 512x512)
├── scripts/
│   ├── channels.py           # Channel registry across all regions
│   ├── fetch.py              # Main Python engine for fetching & ranking videos
│   └── create_icons.py       # PWA icon generator script
├── index.html                # Main landing page & region navigator
├── bengali.html              # Bengali news application
├── national.html             # National (English & Hindi) news application
├── world.html                # World news application
├── opinion.html              # Political commentary application
├── neighbour.html            # South Asian neighbors news application
├── india_watch.html          # State & district regional news application
├── player.html               # Dedicated YouTube player page
├── manifest.json             # PWA Web App Manifest
├── sw.js                     # Service Worker script
├── requirements.txt          # Python runtime dependencies
├── PROJECT.md                # Technical documentation reference
└── README.md                 # Project README
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Python 3.10+ installed
- YouTube Data API v3 Key (from [Google Cloud Console](https://console.cloud.google.com/))

### 2. Installation Steps

```bash
# Clone repository
git clone https://github.com/imgabhijit/news-hub.git
cd news-hub

# Install Python dependencies
pip install -r requirements.txt

# Create .env file in root directory
echo YOUTUBE_API_KEY=your_api_key_here > .env
```

### 3. Run Data Fetcher

```bash
python scripts/fetch.py
```

This populates `data/videos.json`, `data/channels_meta.json`, and `data/video_id_cache.json`.

### 4. Serve Frontend Locally

Serve the directory using any static web server:

```bash
# Using Python builtin HTTP server
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.

---

## ⚙️ Automated Deployment & Workflow

The repository updates automatically via GitHub Actions:

1. **Workflow:** `.github/workflows/refresh.yml`
2. **Schedule:** Triggered every 2 hours (`0 */2 * * *`) + manual trigger (`workflow_dispatch`).
3. **Action Steps:**
   - Checks out `main` branch.
   - Executes `python scripts/fetch.py` with secret `YOUTUBE_API_KEY`.
   - Automatically commits and pushes updated `data/videos.json`.
   - GitHub Pages serves the update within seconds.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
