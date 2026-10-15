/* Free online tools: pure logic (browser: window.FT, Node: module.exports). Original code by Mahir Faysal. */
(function (root) {
  'use strict';
  var U = {
    length: { mm: .001, cm: .01, m: 1, km: 1000, in: .0254, ft: .3048, yd: .9144, mi: 1609.344, nmi: 1852 },
    mass: { mg: 1e-6, g: .001, kg: 1, t: 1000, oz: .028349523125, lb: .45359237, st: 6.35029318 },
    volume: { ml: .001, l: 1, tsp: .00492892159375, tbsp: .01478676478125, floz: .0295735295625, cup: .2365882365, ukfloz: .0284130625, pint: .56826125, gal: 4.54609 },
    data: { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776 },
    time: { s: 1, min: 60, h: 3600, d: 86400, wk: 604800 }
  };
  function round(n, dp) { if (!isFinite(n)) return n; var p = Math.pow(10, dp == null ? 6 : dp); return Math.round(n * p) / p; }
  function convert(kind, v, from, to) { v = +v;
    if (kind === 'temp') { var c = from === 'C' ? v : from === 'F' ? (v - 32) * 5 / 9 : v - 273.15; return to === 'C' ? c : to === 'F' ? c * 9 / 5 + 32 : c + 273.15; }
    var t = U[kind]; return v * t[from] / t[to]; }
  function feetInchesToCm(ft, inch) { return ((+ft || 0) * 12 + (+inch || 0)) * 2.54; }
  function cmToFeetInches(cm) { var ti = (+cm || 0) / 2.54, f = Math.floor(ti / 12); return { ft: f, inch: round(ti - f * 12, 2) }; }
  var small = /^(a|an|and|as|at|but|by|for|in|nor|of|on|or|the|to|up|via|vs)$/i;
  function caseConvert(s, mode) { s = String(s || '');
    var words = function () { return s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_\-]+/g, ' ').trim().split(/\s+/).filter(Boolean); };
    switch (mode) {
      case 'upper': return s.toUpperCase(); case 'lower': return s.toLowerCase();
      case 'title': return s.toLowerCase().replace(/\S+/g, function (w, i) { return (i && small.test(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1); });
      case 'sentence': return s.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/\bi\b/g, 'I');
      case 'camel': return words().map(function (w, i) { w = w.toLowerCase(); return i ? w.charAt(0).toUpperCase() + w.slice(1) : w; }).join('');
      case 'pascal': return words().map(function (w) { w = w.toLowerCase(); return w.charAt(0).toUpperCase() + w.slice(1); }).join('');
      case 'snake': return words().map(function (w) { return w.toLowerCase(); }).join('_');
      case 'kebab': return words().map(function (w) { return w.toLowerCase(); }).join('-');
      case 'constant': return words().map(function (w) { return w.toUpperCase(); }).join('_');
      case 'alternating': var k = 0; return s.replace(/[a-z]/gi, function (c) { return (k++ % 2) ? c.toUpperCase() : c.toLowerCase(); });
      case 'inverse': return s.replace(/[a-z]/gi, function (c) { return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); });
    } return s; }
  function slugify(s, sep) { sep = sep || '-'; return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, sep).replace(new RegExp('^\\' + sep + '+|\\' + sep + '+$', 'g'), ''); }
  function b64enc(s) { var b = new TextEncoder().encode(s), out = ''; for (var i = 0; i < b.length; i++) out += String.fromCharCode(b[i]); return btoa(out); }
  function b64dec(s) { var bin = atob(String(s).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new TextDecoder().decode(a); }
  var ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function htmlEncode(s, all) { return String(s).replace(all ? /[\u00A0-\uFFFF&<>"']/g : /[&<>"']/g, function (c) { return ENT[c] || '&#' + c.codePointAt(0) + ';'; }); }
  var NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®', pound: '£', euro: '€', hellip: '…', mdash: '—', ndash: '–', trade: '™', deg: '°' };
  function htmlDecode(s) { return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (m, e) { if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)); return NAMED[e.toLowerCase()] != null ? NAMED[e.toLowerCase()] : m; }); }
  function baseConvert(str, from, to) { str = String(str).trim().toLowerCase().replace(/^0[xbo]/, ''); if (!str) return ''; var neg = str[0] === '-'; if (neg) str = str.slice(1);
    var digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, from), n = 0n, B = BigInt(from);
    for (var i = 0; i < str.length; i++) { var d = digits.indexOf(str[i]); if (d < 0) return null; n = n * B + BigInt(d); }
    return (neg ? '-' : '') + n.toString(to).toUpperCase(); }
  function toBCD(dec) { return String(dec).replace(/\D/g, '').split('').map(function (d) { return (+d).toString(2).padStart(4, '0'); }).join(' '); }
  function grayToBinary(g) { var b = g[0], out = b; for (var i = 1; i < g.length; i++) { b = b === g[i] ? '0' : '1'; out += b; } return out; }
  function grayHexToHex(hex) { var bits = baseConvert(hex, 16, 2); if (bits == null) return null; return baseConvert(grayToBinary(bits), 2, 16); }
  function hexToAscii(h) { h = String(h).replace(/0x/gi, '').replace(/[^0-9a-f]/gi, ''); if (h.length % 2) return null; var a = new Uint8Array(h.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return new TextDecoder().decode(a); }
  function asciiToHex(s) { return Array.from(new TextEncoder().encode(s)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join(' '); }
  function hexBitwise(a, b, op) { var x = BigInt('0x' + (String(a).replace(/^0x/i, '') || '0')), y = BigInt('0x' + (String(b).replace(/^0x/i, '') || '0'));
    var r = op === 'or' ? x | y : op === 'xor' ? x ^ y : x & y; return r.toString(16).toUpperCase(); }
  function byteCount(s) { return new TextEncoder().encode(String(s)).length; }
  function uuid4(rnd) { var b = rnd(16); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128; var h = Array.from(b, function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20); }
  function randInt(n, rnd) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do { a[0] = rnd(); } while (a[0] >= lim); return a[0] % n; }
  function shuffle(arr, ri) { arr = arr.slice(); for (var i = arr.length - 1; i > 0; i--) { var j = ri(i + 1), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function groups(names, k, ri) { var s = shuffle(names, ri), g = []; for (var i = 0; i < k; i++) g.push([]); s.forEach(function (n, i) { g[i % k].push(n); }); return g; }
  function wpm(typedChars, correctChars, ms) { var min = ms / 60000; return { gross: min ? Math.round(typedChars / 5 / min) : 0, net: min ? Math.round(correctChars / 5 / min) : 0, accuracy: typedChars ? Math.round(correctChars / typedChars * 1000) / 10 : 100 }; }
  function cps(clicks, ms) { return ms ? Math.round(clicks / (ms / 1000) * 100) / 100 : 0; }
  function bpm(taps) { if (taps.length < 2) return 0; var d = []; for (var i = 1; i < taps.length; i++) d.push(taps[i] - taps[i - 1]); var avg = d.reduce(function (a, b) { return a + b; }, 0) / d.length; return Math.round(60000 / avg * 10) / 10; }
  function syllables(word) { var w = String(word).toLowerCase().replace(/[^a-z]/g, ''); if (!w) return 0; if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); var m = w.match(/[aeiouy]{1,2}/g); return Math.max(1, m ? m.length : 1); }
  function lineSyllables(l) { return (String(l).match(/[A-Za-z']+/g) || []).reduce(function (a, w) { return a + syllables(w); }, 0); }
  var PAD = { a: 2, b: 2, c: 2, d: 3, e: 3, f: 3, g: 4, h: 4, i: 4, j: 5, k: 5, l: 5, m: 6, n: 6, o: 6, p: 7, q: 7, r: 7, s: 7, t: 8, u: 8, v: 8, w: 9, x: 9, y: 9, z: 9 };
  function wordToPhone(s) { return String(s).toLowerCase().replace(/[a-z]/g, function (c) { return PAD[c]; }); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function gcdList(l) { return l.reduce(gcd); } function lcmList(l) { return l.reduce(function (a, b) { return a && b ? Math.abs(a * b) / gcd(a, b) : 0; }); }
  function stats(l) { l = l.filter(function (x) { return isFinite(x); }); var n = l.length; if (!n) return null; var s = l.slice().sort(function (a, b) { return a - b; }), sum = s.reduce(function (a, b) { return a + b; }, 0), mean = sum / n;
    var med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2, cnt = {}, mx = 0; s.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; mx = Math.max(mx, cnt[x]); });
    var mode = mx > 1 ? Object.keys(cnt).filter(function (k) { return cnt[k] === mx; }).map(Number) : []; var v = s.reduce(function (a, x) { return a + (x - mean) * (x - mean); }, 0);
    return { n: n, sum: round(sum, 6), mean: round(mean, 6), median: med, mode: mode, min: s[0], max: s[n - 1], range: s[n - 1] - s[0], sdPop: round(Math.sqrt(v / n), 6), sdSample: n > 1 ? round(Math.sqrt(v / (n - 1)), 6) : 0 }; }
  function ohms(o) { var V = o.V === '' ? NaN : +o.V, I = o.I === '' ? NaN : +o.I, R = o.R === '' ? NaN : +o.R;
    if (isFinite(V) && isFinite(I) && !isFinite(R)) R = V / I; else if (isFinite(V) && isFinite(R) && !isFinite(I)) I = V / R; else if (isFinite(I) && isFinite(R) && !isFinite(V)) V = I * R; else if (!(isFinite(V) && isFinite(I))) return null;
    return { V: round(V, 6), I: round(I, 6), R: round(R, 6), P: round(V * I, 6) }; }
  function era(er, ip) { return ip ? round(9 * er / ip, 2) : null; }
  function inningsFromNotation(s) { var p = String(s).split('.'); return (+p[0] || 0) + ((+p[1] || 0) / 3); }
  function tip(o) { var b = +o.bill || 0, t = b * (+o.pct || 0) / 100, n = Math.max(1, Math.floor(+o.people || 1)); return { tip: round(t, 2), total: round(b + t, 2), each: round((b + t) / n, 2), tipEach: round(t / n, 2) }; }
  function salesTax(o) { var a = +o.amount || 0, r = (+o.rate || 0) / 100; return o.mode === 'remove' ? { net: round(a / (1 + r), 2), tax: round(a - a / (1 + r), 2), gross: round(a, 2) } : { net: round(a, 2), tax: round(a * r, 2), gross: round(a * (1 + r), 2) }; }
  function weightedGrade(rows) { var w = 0, s = 0; rows.forEach(function (r) { if (isFinite(r[0]) && isFinite(r[1]) && r[1] > 0) { s += r[0] * r[1]; w += r[1]; } }); return w ? round(s / w, 2) : null; }
  function finalNeeded(current, weightDone, target) { var wf = 100 - weightDone; return wf > 0 ? round((target - current * weightDone / 100) / (wf / 100), 2) : null; }
  function dayOfYear(s) { var a = String(s).split('-'), d = Date.UTC(+a[0], +a[1] - 1, +a[2]), j = Date.UTC(+a[0], 0, 1), y = +a[0], leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0, n = Math.round((d - j) / 864e5) + 1;
    var dt = new Date(d), th = new Date(d); var day = (dt.getUTCDay() + 6) % 7; th.setUTCDate(dt.getUTCDate() - day + 3); var fy = Date.UTC(th.getUTCFullYear(), 0, 4), wk = 1 + Math.round(((th - fy) / 864e5 - 3 + ((new Date(fy).getUTCDay() + 6) % 7)) / 7);
    return { day: n, left: (leap ? 366 : 365) - n, leap: leap, isoWeek: wk }; }
  var Z = [['Capricorn', 1, 19], ['Aquarius', 2, 18], ['Pisces', 3, 20], ['Aries', 4, 19], ['Taurus', 5, 20], ['Gemini', 6, 20], ['Cancer', 7, 22], ['Leo', 8, 22], ['Virgo', 9, 22], ['Libra', 10, 22], ['Scorpio', 11, 21], ['Sagittarius', 12, 21], ['Capricorn', 12, 31]];
  function zodiac(m, d) { for (var i = 0; i < Z.length; i++) if (m < Z[i][1] || (m === Z[i][1] && d <= Z[i][2])) return Z[i][0]; return 'Capricorn'; }
  var CH = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  function chineseAnimal(y) { return CH[((y - 4) % 12 + 12) % 12]; }
  var ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function numWords(n) { n = Math.floor(n); if (n === 0) return 'zero'; var w = function (x) { if (x < 20) return ONES[x]; if (x < 100) return TENS[Math.floor(x / 10)] + (x % 10 ? '-' + ONES[x % 10] : ''); return ONES[Math.floor(x / 100)] + ' hundred' + (x % 100 ? ' and ' + w(x % 100) : ''); };
    var parts = [], sc = ['', ' thousand', ' million']; for (var i = 0; n > 0; i++, n = Math.floor(n / 1000)) { var c = n % 1000; if (c) parts.unshift(w(c) + sc[i]); } return parts.join(' ').replace(/ +/g, ' '); }
  var ORD = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
  function ordWords(n) { var s = numWords(n); return s.replace(/(\w+)$/, function (w) { return ORD[w] || (w.slice(-1) === 'y' ? w.slice(0, -1) + 'ieth' : w + 'th'); }); }
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function dateToWords(s) { var a = String(s).split('-').map(Number); var y = a[0], yw = (y >= 2000 && y < 2010) ? numWords(y) : (y % 100 === 0 ? numWords(y / 100) + ' hundred' : numWords(Math.floor(y / 100)) + ' ' + (y % 100 < 10 ? 'oh-' + numWords(y % 100) : numWords(y % 100)));
    return { uk: 'the ' + ordWords(a[2]) + ' of ' + MON[a[1] - 1] + ' ' + yw, us: MON[a[1] - 1] + ' ' + ordWords(a[2]) + ', ' + yw, cheque: a[2] + ' ' + MON[a[1] - 1] + ' ' + y }; }
  function parseTime(s) { var p = String(s).trim().split(':').map(Number); if (p.some(isNaN)) return NaN; return p.reduce(function (a, x) { return a * 60 + x; }, 0) * (p.length === 1 ? 60 : p.length === 2 ? 60 : 1) / (p.length === 3 ? 1 : 1); }
  function hms(sec) { var neg = sec < 0; sec = Math.round(Math.abs(sec)); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (neg ? '-' : '') + h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }
  function avgTime(list) { var secs = list.map(function (t) { var p = String(t).trim().split(':').map(Number); if (!p.length || p.some(isNaN)) return NaN; while (p.length < 3) p.unshift(0); return p[0] * 3600 + p[1] * 60 + p[2]; }).filter(isFinite); if (!secs.length) return null; var tot = secs.reduce(function (a, b) { return a + b; }, 0); return { n: secs.length, total: hms(tot), avg: hms(tot / secs.length) }; }
  function matMul(A, B) { return A.map(function (r) { return B[0].map(function (_, j) { return r.reduce(function (s, x, k) { return s + x * B[k][j]; }, 0); }); }); }
  function det(M) { var n = M.length; if (n === 1) return M[0][0]; if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0]; var d = 0; for (var j = 0; j < n; j++) d += (j % 2 ? -1 : 1) * M[0][j] * det(M.slice(1).map(function (r) { return r.filter(function (_, k) { return k !== j; }); })); return d; }
  function transpose(M) { return M[0].map(function (_, j) { return M.map(function (r) { return r[j]; }); }); }
  function inverse(M) { var n = M.length, A = M.map(function (r, i) { return r.concat(M.map(function (_, j) { return i === j ? 1 : 0; })); });
    for (var c = 0; c < n; c++) { var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; if (Math.abs(A[p][c]) < 1e-12) return null; var t = A[c]; A[c] = A[p]; A[p] = t; var v = A[c][c]; A[c] = A[c].map(function (x) { return x / v; });
      for (r = 0; r < n; r++) if (r !== c) { var f = A[r][c]; A[r] = A[r].map(function (x, k) { return x - f * A[c][k]; }); } }
    return A.map(function (r) { return r.slice(n).map(function (x) { return round(x, 6); }); }); }
  function classifyChars(s) { return Array.from(String(s)).map(function (c) { var cp = c.codePointAt(0); return { ch: c, cp: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'), dec: cp, utf8: Array.from(new TextEncoder().encode(c), function (b) { return b.toString(16).toUpperCase().padStart(2, '0'); }).join(' ') }; }); }
  var api = { U: U, round: round, convert: convert, feetInchesToCm: feetInchesToCm, cmToFeetInches: cmToFeetInches, caseConvert: caseConvert, slugify: slugify, b64enc: b64enc, b64dec: b64dec, htmlEncode: htmlEncode, htmlDecode: htmlDecode,
    baseConvert: baseConvert, toBCD: toBCD, grayHexToHex: grayHexToHex, grayToBinary: grayToBinary, hexToAscii: hexToAscii, asciiToHex: asciiToHex, hexBitwise: hexBitwise, byteCount: byteCount, uuid4: uuid4, randInt: randInt, shuffle: shuffle, groups: groups,
    wpm: wpm, cps: cps, bpm: bpm, syllables: syllables, lineSyllables: lineSyllables, wordToPhone: wordToPhone, gcdList: gcdList, lcmList: lcmList, stats: stats, ohms: ohms, era: era, inningsFromNotation: inningsFromNotation, tip: tip, salesTax: salesTax,
    weightedGrade: weightedGrade, finalNeeded: finalNeeded, dayOfYear: dayOfYear, zodiac: zodiac, chineseAnimal: chineseAnimal, numWords: numWords, ordWords: ordWords, dateToWords: dateToWords, avgTime: avgTime, hms: hms, matMul: matMul, det: det, transpose: transpose, inverse: inverse, classifyChars: classifyChars };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FT = api;
})(this);
