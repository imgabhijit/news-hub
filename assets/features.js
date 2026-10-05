// Shared by the news-hub pages: the Long videos / Shorts / Topics tabs and the full-screen Shorts viewer.
// Pages supply their own globals (getTimeRange, filterByRange, fmtViews, formatAgo, openPlayer, filterLabel);
// this file only builds HTML and wires the viewer. Titles come from data/*.json, so everything goes through esc().
(function (root) {
  'use strict';
  const DAY = 86400;
  const SHORT_MAX = 180;   // seconds: under 3 min is Shorts, 3 min and over is Long videos (the fetcher keeps both)

  const VIEWER = `
<div class="sv" id="shortsViewer" hidden role="dialog" aria-label="Shorts viewer">
  <div class="sv-stage" id="svStage" tabindex="-1">
    <iframe id="svFrame" src="about:blank" allow="autoplay; encrypted-media; picture-in-picture" title="Short video"></iframe>
    <div class="sv-gesture" id="svGesture"></div>
    <div class="sv-info"><div class="sv-title" id="svTitle"></div><div class="sv-meta" id="svMeta"></div></div>
    <div class="sv-flash" id="svFlash"></div>
    <div class="sv-hint" id="svHint" hidden>Swipe up for next · swipe down for previous</div>
  </div>
  <div class="sv-count" id="svCount"></div>
  <button class="sv-btn sv-close" id="svClose" aria-label="Close">✕</button>
  <div class="sv-side">
    <button class="sv-btn" id="svUp" aria-label="Previous short">▲</button>
    <button class="sv-btn" id="svMute" aria-label="Mute" aria-pressed="false">🔊</button>
    <a class="sv-btn" id="svYt" href="#" target="_blank" rel="noopener noreferrer" aria-label="Open on YouTube">↗</a>
    <button class="sv-btn" id="svDown" aria-label="Next short">▼</button>
  </div>
</div>`;

  // Duration options for the two split tabs. Other tabs keep the page's own list.
  const SPLIT_OPTIONS = {
    long:  [['all', 'Any (3 min+)'], ['3to60', '3 min – 1 hr'], ['3to15', '3–15 min'], ['15to30', '15–30 min'], ['30to60', '30–60 min'], ['long', '1 hr+']],
    short: [['all', 'Any (under 3 min)'], ['under60', 'Under 60 sec'], ['1to2', '1–2 min'], ['2to3', '2–3 min']],
  };
  let originalDurationOptions = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDur = s => {
    if (!s) return '';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
  };

  // ── duration split ────────────────────────────────────────────────────────
  // Returns null for tabs that are not split, so the page keeps its own duration rules there.
  function matchSplit(d, tab, option) {
    if (tab !== 'long' && tab !== 'short') return null;
    const kindOk = tab === 'long' ? (d >= SHORT_MAX || !d) : (d > 0 && d < SHORT_MAX);
    if (!kindOk) return false;
    switch (option) {
      case 'under60': return d < 60;
      case '1to2':    return d >= 60 && d < 120;
      case '2to3':    return d >= 120 && d < SHORT_MAX;
      case '3to60':   return d >= 180 && d < 3600;
      case '3to15':   return d >= 180 && d < 900;
      case '15to30':  return d >= 900 && d < 1800;
      case '30to60':  return d >= 1800 && d < 3600;
      case 'long':    return d >= 3600;
      default:        return true;
    }
  }
  // Swap the Duration dropdown's options to match the tab; restore the page's own list elsewhere.
  function syncDuration(tab, option) {
    const sel = document.getElementById('durationSelect');
    if (!sel) return;
    if (!originalDurationOptions) originalDurationOptions = sel.innerHTML;
    const opts = SPLIT_OPTIONS[tab];
    if (!opts) { sel.innerHTML = originalDurationOptions; return; }
    sel.innerHTML = opts.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');
    sel.value = opts.some(([v]) => v === option) ? option : 'all';
  }

  // ── Shorts grid and viewer ────────────────────────────────────────────────
  let shortsList = [];
  function shortsGrid(list) {
    shortsList = list;
    return `<div class="video-grid shorts-grid">${list.map((v, i) => `
      <div class="video-card short-card" onclick="HubFeatures.playShort(${i})">
        <div class="thumb-wrap">
          <img src="${esc(v.thumbnail)}" alt="" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${esc(v.video_id)}/mqdefault.jpg'">
          <span class="rank-badge">#${i + 1}</span>${v.duration ? `<span class="duration-badge">${fmtDur(v.duration)}</span>` : ''}
        </div>
        <div class="card-body">
          <div class="card-channel">${esc(v.channel_name)}</div>
          <div class="card-title">${esc(v.title)}</div>
          <div class="card-meta"><span class="card-views">👁 ${fmtViews(v.view_count)}</span><span>${formatAgo(v.timestamp)}</span></div>
        </div>
      </div>`).join('')}</div>`;
  }
  function playShort(i) {
    if (!root.ShortsViewer || !shortsList[i]) return;
    ShortsViewer.open(shortsList.map(v => ({
      id: v.video_id, title: v.title, channel: v.channel_name,
      meta: `👁 ${fmtViews(v.view_count)} · ${formatAgo(v.timestamp)}`,
    })), i);
  }

  // ── Topics ────────────────────────────────────────────────────────────────
  let topicRank = 'rising', topicRules = {}, topicRerender = null;
  const topicMemo = new Map();
  // Function words (data/function_words.json) and the rules file are optional: without them the tab still works,
  // just with more filler in it. Once they arrive the Topics tab is rebuilt.
  function loadRules() {
    const get = f => fetch(f).then(r => r.json()).catch(() => ({}));
    Promise.all([get('data/function_words.json'), get('data/topic_rules.json')]).then(([bank, rules]) => {
      HubTopics.addStopwords(bank);
      topicRules = rules;
      topicMemo.clear();
      if (topicRerender) topicRerender();
    });
  }
  function setTopicRank(mode) { topicRank = mode; if (topicRerender) topicRerender(); }
  function toggleTopic(i) {
    const row = document.querySelector(`.topic-row[data-topic="${i}"]`);
    if (row) row.classList.toggle('open');
  }

  // pool: the page's videos for its main sources (live streams excluded). The window is the selected Time filter;
  // the baseline is the whole pool, so a topic that is suddenly frequent in the window is "rising".
  function renderTopics(panel, pool, filter, label, rerender) {
    topicRerender = rerender;
    const base = pool.filter(v => v.live_broadcast !== 'live');
    const [start, end] = getTimeRange(filter);
    const inWin = base.filter(v => v.timestamp >= start && v.timestamp <= end);
    const windowDays = Math.max((end - start) / DAY, 1 / 24);
    const oldest = base.reduce((m, v) => Math.min(m, v.timestamp), Date.now() / 1000);
    const baselineDays = Math.min(90, Math.max(windowDays, (Date.now() / 1000 - oldest) / DAY));
    const key = [filter, base.length, inWin.length, Math.round(end / 60)].join('|');
    let all = topicMemo.get(key);
    if (!all) {
      all = HubTopics.topics(inWin, base, { windowDays, baselineDays, minChannels: 2, vocab: base, rules: topicRules });
      topicMemo.set(key, all);
    }
    const shown = HubTopics.rank(all, topicRank, 30);
    const byId = new Map(base.map(v => [v.video_id, v]));
    const modes = [['rising', '↑ Rising'], ['mentions', 'Most mentioned']]
      .map(([m, l]) => `<button class="topic-mode${topicRank === m ? ' active' : ''}" onclick="HubFeatures.setTopicRank('${m}')">${l}</button>`).join('');
    const head = `<p class="section-label">Top topics · ${esc(label)} · ${inWin.length} videos analysed</p>
      <div class="topic-modes">${modes}</div>
      <p class="section-blurb">Phrases that show up in the titles of several different channels. ${
        topicRank === 'rising' ? '<b>↑ Rising</b> marks phrases much more frequent in this window than in the rest of the data. ' : ''}Click a topic to see its videos.</p>`;
    if (!shown.length) {
      panel.innerHTML = head + `<div class="empty-state"><h3>Not enough overlap yet</h3><p>Try a longer time window.</p></div>`;
      return;
    }
    const maxCh = Math.max(...shown.map(t => t.channels));
    panel.innerHTML = head + '<div class="topic-list">' + shown.map((t, i) => {
      const vids = t.ids.map(id => byId.get(id)).filter(Boolean).sort((a, b) => b.view_count - a.view_count);
      const top = vids[0];
      return `<div class="topic-row" data-topic="${i}">
        <span class="topic-rank">${i + 1}</span>
        <div class="topic-main" onclick="HubFeatures.toggleTopic(${i})">
          <div class="topic-label">${esc(t.label)}${t.isNew ? ' <span class="topic-new">↑ rising</span>' : ''}</div>
          ${t.variants && t.variants.length ? `<div class="topic-also">also: ${t.variants.map(esc).join(' · ')}</div>` : ''}
          <div class="topic-bar"><span style="width:${Math.round(100 * t.channels / maxCh)}%"></span></div>
          <a class="topic-all" href="topic.html?k=${encodeURIComponent(t.key)}&l=${encodeURIComponent(t.label)}" onclick="event.stopPropagation()">All videos for this topic ↗</a>
          ${top ? `<div class="topic-top">▶ ${esc(top.title)} <i>· ${esc(top.channel_name)} · ${fmtViews(top.view_count)} views</i></div>` : ''}
          <div class="topic-videos">${vids.slice(0, 15).map(v =>
            `<button class="topic-video" onclick="openPlayer('${esc(v.video_id)}','${esc(v.channel_name).replace(/'/g, '&#39;')}')">▶ ${esc(v.title)} <i>· ${esc(v.channel_name)}</i></button>`).join('')}</div>
        </div>
        <div class="topic-stats"><b>${t.channels}</b> channels<br><b>${t.videos}</b> videos<br><b>${fmtViews(t.views)}</b> views</div>
      </div>`;
    }).join('') + '</div>';
  }

  // ── start-up ──────────────────────────────────────────────────────────────
  function start() {
    if (!document.getElementById('shortsViewer')) document.body.insertAdjacentHTML('beforeend', VIEWER);
    loadRules();
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  root.HubFeatures = {
    matchSplit, syncDuration, shortsGrid, playShort, renderTopics, setTopicRank, toggleTopic,
    SHORT_MAX,
  };
})(window);
