/* UK calculators — core maths (2026/27 rates). Works in browser (window.UKCalc) and Node (module.exports). */
(function (root) {
  'use strict';
  var r2 = function (n) { return Math.round((n + Number.EPSILON) * 100) / 100; };

  // Apply marginal bands: [[upperLimit, rate], ...] last upper = Infinity
  function banded(amount, bands, extra) {
    extra = extra || 0;
    var tax = 0, lower = 0, rows = [];
    for (var i = 0; i < bands.length; i++) {
      var up = bands[i][0], rate = bands[i][1] + extra;
      if (amount > lower) {
        var slice = Math.min(amount, up) - lower;
        var t = slice * rate;
        rows.push({ from: lower, to: Math.min(amount, up), rate: rate, tax: r2(t) });
        tax += t;
      }
      lower = up;
    }
    return { tax: r2(tax), rows: rows };
  }

  var INF = Infinity;
  var RATES = {
    sdlt: { std: [[125000, 0], [250000, .02], [925000, .05], [1500000, .10], [INF, .12]],
            ftb: [[300000, 0], [500000, .05]], ftbMax: 500000, surcharge: .05, nonRes: .02 },
    lbtt: { std: [[145000, 0], [250000, .02], [325000, .05], [750000, .10], [INF, .12]],
            ftb: [[175000, 0], [250000, .02], [325000, .05], [750000, .10], [INF, .12]], ads: .08 },
    ltt:  { std: [[225000, 0], [400000, .06], [750000, .075], [1500000, .10], [INF, .12]],
            higher: [[180000, .05], [250000, .085], [400000, .10], [750000, .125], [1500000, .15], [INF, .17]] },
    studentLoan: {
      plan1: { year: 26900, month: 2241, week: 517, rate: .09, label: 'Plan 1' },
      plan2: { year: 29385, month: 2448, week: 565, rate: .09, label: 'Plan 2' },
      plan4: { year: 33795, month: 2816, week: 649, rate: .09, label: 'Plan 4 (Scotland)' },
      plan5: { year: 25000, month: 2083, week: 480, rate: .09, label: 'Plan 5' },
      pg:    { year: 21000, month: 1750, week: 403, rate: .06, label: 'Postgraduate Loan' }
    },
    ved: {
      // first-year (registered on/after 1 Apr 2026): [maxCO2, petrol/EV/RDE2 diesel, other diesel]
      firstYear: [[0, 10, 10], [50, 115, 135], [75, 135, 280], [90, 280, 365], [100, 365, 405], [110, 405, 455],
                  [130, 455, 560], [150, 560, 1410], [170, 1410, 2270], [190, 2270, 3420], [225, 3420, 4850],
                  [255, 4850, 5690], [INF, 5690, 5690]],
      standard: 200, supplement: 440, threshold: 40000, thresholdEV: 50000,
      sixMonth: 110, ddMonthlyTotal: 210, ddSixMonthly: 105
    },
    vat: { standard: .20, reduced: .05, zero: 0 }
  };

  function stampDuty(o) {
    var p = Math.max(0, +o.price || 0), region = o.region || 'eng';
    var res, note = [];
    if (region === 'eng') {
      var R = RATES.sdlt, extra = 0;
      if (o.additional && p >= 40000) { extra += R.surcharge; note.push('5% higher rates for additional dwellings'); }
      if (o.nonResident && p >= 40000) { extra += R.nonRes; note.push('2% non-UK resident surcharge'); }
      if (o.ftb && !o.additional && p <= R.ftbMax) { res = banded(p, R.ftb, extra); note.push("First-time buyers' relief applied"); }
      else { if (o.ftb && p > R.ftbMax) note.push("No first-time buyers' relief above £500,000"); res = banded(p, R.std, extra); }
      res.taxName = 'Stamp Duty Land Tax (SDLT)';
    } else if (region === 'sco') {
      var S = RATES.lbtt;
      res = banded(p, (o.ftb && !o.additional) ? S.ftb : S.std);
      if (o.ftb && !o.additional) note.push("First-time buyer relief (nil band £175,000)");
      res.ads = 0;
      if (o.additional && p >= 40000) { res.ads = r2(p * S.ads); res.tax = r2(res.tax + res.ads); note.push('8% Additional Dwelling Supplement on the full price'); }
      res.taxName = 'Land and Buildings Transaction Tax (LBTT)';
    } else {
      var W = RATES.ltt;
      if (o.additional && p >= 40000) { res = banded(p, W.higher); note.push('Higher residential rates'); }
      else res = banded(p, W.std);
      if (o.ftb) note.push('Wales has no separate first-time buyer relief');
      res.taxName = 'Land Transaction Tax (LTT)';
    }
    res.effectiveRate = p ? r2(res.tax / p * 100) : 0;
    res.notes = note;
    return res;
  }

  // plans: array of keys among plan1, plan2, plan4, plan5; pg: boolean; period: 'year'|'month'|'week'
  function studentLoan(o) {
    var SL = RATES.studentLoan, period = o.period || 'year', income = Math.max(0, +o.income || 0);
    var plans = (o.plans || []).filter(function (k) { return SL[k]; });
    var out = { undergrad: 0, pg: 0, total: 0, threshold: null, plan: null };
    if (plans.length) {
      var low = plans.reduce(function (a, k) { return SL[k][period] < SL[a][period] ? k : a; }, plans[0]);
      out.plan = low; out.threshold = SL[low][period];
      out.undergrad = r2(Math.max(0, income - out.threshold) * SL[low].rate);
    }
    if (o.pg) { out.pgThreshold = SL.pg[period]; out.pg = r2(Math.max(0, income - SL.pg[period]) * SL.pg.rate); }
    out.total = r2(out.undergrad + out.pg);
    return out;
  }

  function vat(o) {
    var amt = +o.amount || 0, rate = o.rate == null ? .2 : +o.rate;
    if (o.mode === 'remove') { var net = amt / (1 + rate); return { net: r2(net), vat: r2(amt - net), gross: r2(amt) }; }
    return { net: r2(amt), vat: r2(amt * rate), gross: r2(amt * (1 + rate)) };
  }

  function mortgage(o) {
    var P = Math.max(0, +o.loan || 0), yrs = +o.years || 25, n = Math.round(yrs * 12), i = (+o.rate || 0) / 100 / 12;
    var monthly = o.type === 'interest' ? P * i : (i === 0 ? P / n : P * i / (1 - Math.pow(1 + i, -n)));
    var total = o.type === 'interest' ? monthly * n + P : monthly * n;
    var out = { monthly: r2(monthly), total: r2(total), interest: r2(total - P), months: n };
    if (o.income) { out.affordLow = r2(+o.income * 4); out.affordHigh = r2(+o.income * 4.5); }
    if (o.stressRate != null) {
      var j = +o.stressRate / 100 / 12;
      out.stressMonthly = r2(o.type === 'interest' ? P * j : (j === 0 ? P / n : P * j / (1 - Math.pow(1 + j, -n))));
    }
    return out;
  }

  // Cars first registered on/after 1 April 2017
  function carTax(o) {
    var V = RATES.ved, co2 = Math.max(0, +o.co2 || 0), fuel = o.fuel || 'petrol', ev = fuel === 'electric';
    if (ev) co2 = 0;
    var row = V.firstYear.filter(function (b) { return co2 <= b[0]; })[0];
    var first = fuel === 'diesel' ? row[2] : row[1];
    var thr = ev ? V.thresholdEV : V.threshold, expensive = (+o.listPrice || 0) > thr;
    var std = V.standard + (expensive ? V.supplement : 0);
    return { firstYear: first, standard: std, expensive: expensive, supplementYears: expensive ? 5 : 0,
             sixMonth: r2(V.sixMonth * std / V.standard), ddMonthly: r2(std * 1.05 / 12),
             sixYearTotal: first + std * 5 };
  }

  var api = { RATES: RATES, banded: banded, stampDuty: stampDuty, studentLoan: studentLoan, vat: vat, mortgage: mortgage, carTax: carTax };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.UKCalc = api;
})(this);
