// Shared geo detection utilities

function normStr(s) {
  return ' ' + s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
}

function bNormStr(s) {
  // Bengali-aware: preserves Bengali Unicode (U+0980-U+09FF) + ASCII
  return ' ' + s.replace(/[^a-z0-9ঀ-৿\s]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase() + ' ';
}
