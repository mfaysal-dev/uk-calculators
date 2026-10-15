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
    vat: { standard: .20, reduced: .05, zero: 0 },
    // Income tax 2026/27 – bands are on TAXABLE income (after Personal Allowance)
    incomeTax: { pa: 12570, taperFrom: 100000,
      ruk: [[37700, .20], [125140, .40], [INF, .45]],
      sco: [[3967, .19], [16956, .20], [31092, .21], [62430, .42], [125140, .45], [INF, .48]] },
    // Employee Class 1 NI 2026/27 (annual equivalents of PT £242/wk and UEL £967/wk as used by HMRC: £12,570 / £50,270)
    ni: { pt: 12570, uel: 50270, main: .08, upper: .02 },
    // National Minimum Wage / National Living Wage hourly rates
    // Self-employed NI 2026/27 (GOV.UK self-employed-national-insurance-rates)
    class4: { lpl: 12570, upl: 50270, main: .06, upper: .02 }, class2: { spt: 7105, weekly: 3.65 },
    // Dividends 2026/27 (GOV.UK tax-on-dividends): allowance £500; bands on taxable income use UK (non-Scottish) bands
    redundancy: { weekCap: 751, maxYears: 20, minYears: 2 },
    smp: { rate: 194.32, lel: 129, weeks: 39, higherWeeks: 6 },
    holiday: { weeks: 5.6, maxDays: 28, irregularPct: .1207 },
    bankHolidays: {"eng":[["2025-01-01","New Year\u2019s Day"],["2025-04-18","Good Friday"],["2025-04-21","Easter Monday"],["2025-05-05","Early May bank holiday"],["2025-05-26","Spring bank holiday"],["2025-08-25","Summer bank holiday"],["2025-12-25","Christmas Day"],["2025-12-26","Boxing Day"],["2026-01-01","New Year\u2019s Day"],["2026-04-03","Good Friday"],["2026-04-06","Easter Monday"],["2026-05-04","Early May bank holiday"],["2026-05-25","Spring bank holiday"],["2026-08-31","Summer bank holiday"],["2026-12-25","Christmas Day"],["2026-12-28","Boxing Day"],["2027-01-01","New Year\u2019s Day"],["2027-03-26","Good Friday"],["2027-03-29","Easter Monday"],["2027-05-03","Early May bank holiday"],["2027-05-31","Spring bank holiday"],["2027-08-30","Summer bank holiday"],["2027-12-27","Christmas Day"],["2027-12-28","Boxing Day"],["2028-01-03","New Year\u2019s Day"],["2028-04-14","Good Friday"],["2028-04-17","Easter Monday"],["2028-05-01","Early May bank holiday"],["2028-05-29","Spring bank holiday"],["2028-08-28","Summer bank holiday"],["2028-12-25","Christmas Day"],["2028-12-26","Boxing Day"]],"sco":[["2025-01-01","New Year\u2019s Day"],["2025-01-02","2nd January"],["2025-04-18","Good Friday"],["2025-05-05","Early May bank holiday"],["2025-05-26","Spring bank holiday"],["2025-08-04","Summer bank holiday"],["2025-12-01","St Andrew\u2019s Day"],["2025-12-25","Christmas Day"],["2025-12-26","Boxing Day"],["2026-01-01","New Year\u2019s Day"],["2026-01-02","2nd January"],["2026-04-03","Good Friday"],["2026-05-04","Early May bank holiday"],["2026-05-25","Spring bank holiday"],["2026-06-15","World Cup bank holiday"],["2026-08-03","Summer bank holiday"],["2026-11-30","St Andrew\u2019s Day"],["2026-12-25","Christmas Day"],["2026-12-28","Boxing Day"],["2027-01-01","New Year\u2019s Day"],["2027-01-04","2nd January"],["2027-03-26","Good Friday"],["2027-05-03","Early May bank holiday"],["2027-05-31","Spring bank holiday"],["2027-08-02","Summer bank holiday"],["2027-11-30","St Andrew\u2019s Day"],["2027-12-27","Christmas Day"],["2027-12-28","Boxing Day"],["2028-01-03","New Year\u2019s Day"],["2028-01-04","2nd January"],["2028-04-14","Good Friday"],["2028-05-01","Early May bank holiday"],["2028-05-29","Spring bank holiday"],["2028-08-07","Summer bank holiday"],["2028-11-30","St Andrew\u2019s Day"],["2028-12-25","Christmas Day"],["2028-12-26","Boxing Day"]],"ni":[["2025-01-01","New Year\u2019s Day"],["2025-03-17","St Patrick\u2019s Day"],["2025-04-18","Good Friday"],["2025-04-21","Easter Monday"],["2025-05-05","Early May bank holiday"],["2025-05-26","Spring bank holiday"],["2025-07-14","Battle of the Boyne (Orangemen\u2019s Day)"],["2025-08-25","Summer bank holiday"],["2025-12-25","Christmas Day"],["2025-12-26","Boxing Day"],["2026-01-01","New Year\u2019s Day"],["2026-03-17","St Patrick\u2019s Day"],["2026-04-03","Good Friday"],["2026-04-06","Easter Monday"],["2026-05-04","Early May bank holiday"],["2026-05-25","Spring bank holiday"],["2026-07-13","Battle of the Boyne (Orangemen\u2019s Day)"],["2026-08-31","Summer bank holiday"],["2026-12-25","Christmas Day"],["2026-12-28","Boxing Day"],["2027-01-01","New Year\u2019s Day"],["2027-03-17","St Patrick\u2019s Day"],["2027-03-26","Good Friday"],["2027-03-29","Easter Monday"],["2027-05-03","Early May bank holiday"],["2027-05-31","Spring bank holiday"],["2027-07-12","Battle of the Boyne (Orangemen\u2019s Day)"],["2027-08-30","Summer bank holiday"],["2027-12-27","Christmas Day"],["2027-12-28","Boxing Day"],["2028-01-03","New Year\u2019s Day"],["2028-03-17","St Patrick\u2019s Day"],["2028-04-14","Good Friday"],["2028-04-17","Easter Monday"],["2028-05-01","Early May bank holiday"],["2028-05-29","Spring bank holiday"],["2028-07-12","Battle of the Boyne (Orangemen\u2019s Day)"],["2028-08-28","Summer bank holiday"],["2028-12-25","Christmas Day"],["2028-12-26","Boxing Day"]]},
    dividend: { allowance: 500, basic: .1075, higher: .3575, additional: .3935 },
    nmw: { '2026': { from: '1 April 2026', a21: 12.71, a18: 10.85, u18: 8.00, app: 8.00 },
           '2025': { from: '1 April 2025', a21: 12.21, a18: 10.00, u18: 7.55, app: 7.55 } }
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

  // Take-home pay (annual). o: salary, region 'ruk'|'sco', pension %, pensionType 'none'|'net'|'sacrifice', plans[], pg
  function takeHome(o) {
    var T = RATES.incomeTax, N = RATES.ni, gross = Math.max(0, +o.salary || 0);
    var pct = Math.max(0, +o.pension || 0) / 100, ptype = o.pensionType || 'none';
    var pension = ptype === 'none' ? 0 : r2(gross * pct);
    var niPay = ptype === 'sacrifice' ? gross - pension : gross;       // sacrifice lowers NI-able pay
    var taxPay = gross - pension;                                     // both net pay and sacrifice lower taxable pay
    var pa = Math.max(0, T.pa - Math.floor(Math.max(0, taxPay - T.taperFrom) / 2));
    var taxable = Math.max(0, taxPay - pa);
    var bands = o.region === 'sco' ? T.sco : T.ruk;
    var it = banded(taxable, bands);
    var ni = r2(Math.max(0, Math.min(niPay, N.uel) - N.pt) * N.main + Math.max(0, niPay - N.uel) * N.upper);
    var sl = studentLoan({ income: niPay, plans: o.plans || [], pg: o.pg, period: 'year' });
    var net = r2(gross - pension - it.tax - ni - sl.total);
    return { gross: r2(gross), pension: pension, personalAllowance: pa, taxable: r2(taxable), incomeTax: it.tax, rows: it.rows,
      ni: ni, studentLoan: sl.total, net: net, monthly: r2(net / 12), weekly: r2(net / 52),
      marginal: marginalRate(o), effectiveRate: gross ? r2((it.tax + ni) / gross * 100) : 0 };
  }
  function marginalRate(o) {
    // simple numeric marginal rate on tax + NI for the next £100
    if (o._m) return null;
    var a = takeHomeRaw(o, 0), b = takeHomeRaw(o, 100);
    return r2((1 - (b - a) / 100) * 100);
  }
  function takeHomeRaw(o, add) { var c = {}; for (var k in o) c[k] = o[k]; c._m = 1; c.salary = (+o.salary || 0) + add; return takeHome(c).net; }

  // Minimum wage check. o: age, apprentice, firstYear, hourly, hours (per week), year '2026'|'2025'
  function minWage(o) {
    var R = RATES.nmw[o.year || '2026'], age = +o.age || 0, band, rate;
    if (o.apprentice && (age < 19 || o.firstYear)) { band = 'Apprentice rate'; rate = R.app; }
    else if (age >= 21) { band = 'National Living Wage (21 and over)'; rate = R.a21; }
    else if (age >= 18) { band = 'National Minimum Wage (18 to 20)'; rate = R.a18; }
    else { band = 'National Minimum Wage (under 18)'; rate = R.u18; }
    var hours = Math.max(0, +o.hours || 0), hourly = +o.hourly || 0;
    var res = { band: band, rate: rate, from: R.from, weeklyMin: r2(rate * hours), yearlyMin: r2(rate * hours * 52), monthlyMin: r2(rate * hours * 52 / 12) };
    if (hourly) { res.ok = hourly >= rate; res.shortPerHour = r2(Math.max(0, rate - hourly)); res.shortPerWeek = r2(res.shortPerHour * hours); res.shortPerYear = r2(res.shortPerHour * hours * 52); }
    return res;
  }

  // Tax on a slice of income stacked from `start` (taxable income) using [[upper, rate],...]
  function stacked(start, amount, bands) {
    var tax = 0, rows = [], lower = 0, end = start + amount;
    for (var i = 0; i < bands.length; i++) {
      var up = bands[i][0], a = Math.max(start, lower), b = Math.min(end, up);
      if (b > a) { tax += (b - a) * bands[i][1]; rows.push({ from: a, to: b, rate: bands[i][1], tax: r2((b - a) * bands[i][1]) }); }
      lower = up;
    }
    return { tax: r2(tax), rows: rows };
  }
  function paFor(income) { var T = RATES.incomeTax; return Math.max(0, T.pa - Math.floor(Math.max(0, income - T.taperFrom) / 2)); }

  // Self-employed (sole trader). o: profit, region, plans[], pg, voluntaryClass2
  function selfEmployed(o) {
    var T = RATES.incomeTax, C4 = RATES.class4, C2 = RATES.class2, profit = Math.max(0, +o.profit || 0);
    var pa = paFor(profit), taxable = Math.max(0, profit - pa);
    var it = banded(taxable, o.region === 'sco' ? T.sco : T.ruk);
    var c4 = r2(Math.max(0, Math.min(profit, C4.upl) - C4.lpl) * C4.main + Math.max(0, profit - C4.upl) * C4.upper);
    var c2 = profit < C2.spt && o.voluntaryClass2 ? r2(C2.weekly * 52) : 0;
    var sl = studentLoan({ income: profit, plans: o.plans || [], pg: o.pg, period: 'year' });
    var bill = r2(it.tax + c4 + c2 + sl.total);
    var poaBase = r2(it.tax + c4);              // payments on account cover income tax + Class 4
    var poa = poaBase >= 1000 ? r2(poaBase / 2) : 0;
    return { profit: r2(profit), personalAllowance: pa, taxable: r2(taxable), incomeTax: it.tax, rows: it.rows, class4: c4, class2: c2,
      class2Credited: profit >= C2.spt, studentLoan: sl.total, totalBill: bill, net: r2(profit - bill), monthly: r2((profit - bill) / 12),
      effectiveRate: profit ? r2(bill / profit * 100) : 0, paymentOnAccount: poa, setAsidePct: profit ? Math.ceil(bill / profit * 100) : 0 };
  }

  // Dividend tax. o: salary (other non-savings income), dividends, region
  function dividendTax(o) {
    var T = RATES.incomeTax, D = RATES.dividend, sal = Math.max(0, +o.salary || 0), div = Math.max(0, +o.dividends || 0);
    var pa = paFor(sal + div);
    var salTaxable = Math.max(0, sal - pa), paLeft = Math.max(0, pa - sal);
    var divTaxable = Math.max(0, div - paLeft);
    var salaryTax = banded(salTaxable, o.region === 'sco' ? T.sco : T.ruk).tax;
    var allow = Math.min(D.allowance, divTaxable);
    var bands = [[T.ruk[0][0], D.basic], [T.ruk[1][0], D.higher], [INF, D.additional]];
    var d = stacked(salTaxable + allow, divTaxable - allow, bands);
    return { personalAllowance: pa, paUsedOnDividends: r2(Math.min(paLeft, div)), allowanceUsed: r2(allow), dividendTaxable: r2(divTaxable - allow),
      dividendTax: d.tax, rows: d.rows, salaryTax: salaryTax, totalTax: r2(salaryTax + d.tax), effectiveDivRate: div ? r2(d.tax / div * 100) : 0 };
  }

  function redundancy(o) {
    var R = RATES.redundancy, age = Math.floor(+o.age || 0), yrs = Math.floor(+o.years || 0), pay = Math.max(0, +o.weeklyPay || 0);
    var wk = Math.min(pay, R.weekCap), counted = Math.min(yrs, R.maxYears), weeks = 0, rows = { half: 0, one: 0, oneHalf: 0 };
    if (yrs < R.minYears) return { eligible: false, total: 0, weeks: 0, weekPay: r2(wk), counted: counted, rows: rows };
    for (var i = 0; i < counted; i++) { var a = age - 1 - i; if (a < 0) break; if (a < 22) { weeks += .5; rows.half++; } else if (a < 41) { weeks += 1; rows.one++; } else { weeks += 1.5; rows.oneHalf++; } }
    return { eligible: true, weeks: weeks, weekPay: r2(wk), capped: pay > R.weekCap, counted: counted, rows: rows, total: r2(weeks * wk) };
  }
  function maternityPay(o) {
    var S = RATES.smp, awe = Math.max(0, +o.awe || 0), first = r2(awe * .9), later = r2(Math.min(S.rate, awe * .9));
    if (awe < S.lel) return { eligible: false, first: 0, later: 0, total: 0, lel: S.lel };
    var t1 = r2(first * S.higherWeeks), t2 = r2(later * (S.weeks - S.higherWeeks));
    return { eligible: true, first: first, later: later, firstTotal: t1, laterTotal: t2, total: r2(t1 + t2), lel: S.lel };
  }
  function holiday(o) {
    var H = RATES.holiday, mode = o.mode || 'days', frac = o.months != null && o.months !== '' ? Math.min(12, Math.max(0, +o.months)) / 12 : 1;
    if (mode === 'irregular') { var h = r2(Math.max(0, +o.hoursWorked || 0) * H.irregularPct); return { mode: mode, hours: h }; }
    if (mode === 'hours') { var hpw = Math.max(0, +o.hoursPerWeek || 0), dpw = Math.min(5, Math.max(0, +o.daysPerWeek || 5)) || 5;
      var cap = 28 * hpw / dpw; var full = Math.min(hpw * H.weeks, cap); return { mode: mode, hours: r2(full * frac), fullYear: r2(full) }; }
    var d = Math.min(7, Math.max(0, +o.daysPerWeek || 0)), fy = Math.min(d * H.weeks, H.maxDays), v = fy * frac;
    return { mode: 'days', days: r2(v), roundedUp: Math.ceil(v * 2) / 2, fullYear: r2(fy), capped: d * H.weeks > H.maxDays };
  }
  function workingDays(o) {
    var P = function (s) { var a = String(s).split('-'); return Date.UTC(+a[0], +a[1] - 1, +a[2]); };
    var a = P(o.start), b = P(o.end), DAY = 864e5; if (isNaN(a) || isNaN(b)) return null; var neg = b < a; if (neg) { var t = a; a = b; b = t; }
    var list = RATES.bankHolidays[o.region || 'eng'] || [], set = {}; list.forEach(function (x) { set[P(x[0])] = x[1]; });
    var days = 0, wk = 0, hols = [];
    for (var d = a; d <= b; d += DAY) { days++; var w = new Date(d).getUTCDay(); if (w === 0 || w === 6) continue; if (set[d]) { hols.push([new Date(d).toISOString().slice(0, 10), set[d]]); continue; } wk++; }
    if (o.excludeStart && days) { var w0 = new Date(a).getUTCDay(); days--; if (w0 && w0 < 6 && !set[a]) wk--; }
    return { calendarDays: days, workingDays: wk, weekendDays: 0, bankHolidays: hols, weeks: r2(days / 7) };
  }

  var api = { RATES: RATES, banded: banded, stampDuty: stampDuty, studentLoan: studentLoan, vat: vat, mortgage: mortgage, carTax: carTax, takeHome: takeHome, minWage: minWage, selfEmployed: selfEmployed, dividendTax: dividendTax, stacked: stacked, redundancy: redundancy, maternityPay: maternityPay, holiday: holiday, workingDays: workingDays };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.UKCalc = api;
})(this);
