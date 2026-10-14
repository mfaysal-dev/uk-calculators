const test = require('node:test'); const assert = require('node:assert/strict');
const C = require('../assets/calc.js');
test('SDLT GOV.UK example £295,000 = £4,750', () => assert.equal(C.stampDuty({ price: 295000 }).tax, 4750));
test('SDLT FTB £500,000 = £10,000', () => assert.equal(C.stampDuty({ price: 500000, ftb: true }).tax, 10000));
test('SDLT FTB £300,000 = £0', () => assert.equal(C.stampDuty({ price: 300000, ftb: true }).tax, 0));
test('SDLT FTB £525,000 loses relief = £16,250', () => assert.equal(C.stampDuty({ price: 525000, ftb: true }).tax, 16250));
test('SDLT additional £300,000 = £20,000', () => assert.equal(C.stampDuty({ price: 300000, additional: true }).tax, 20000));
test('SDLT non-resident £300,000 = £11,000', () => assert.equal(C.stampDuty({ price: 300000, nonResident: true }).tax, 11000));
test('LBTT £300,000 = £4,600', () => assert.equal(C.stampDuty({ price: 300000, region: 'sco' }).tax, 4600));
test('LBTT FTB saves £600', () => assert.equal(C.stampDuty({ price: 300000, region: 'sco', ftb: true }).tax, 4000));
test('LBTT ADS 8% £300,000 = £28,600', () => assert.equal(C.stampDuty({ price: 300000, region: 'sco', additional: true }).tax, 28600));
test('LTT £300,000 = £4,500', () => assert.equal(C.stampDuty({ price: 300000, region: 'wal' }).tax, 4500));
test('LTT higher £300,000 = £25,950', () => assert.equal(C.stampDuty({ price: 300000, region: 'wal', additional: true }).tax, 9000 + 5950 + 5000));
test('Student loan GOV.UK example: £3,200/month Plan 1+2 = 9% over £2,241', () =>
  assert.equal(C.studentLoan({ income: 3200, plans: ['plan1', 'plan2'], period: 'month' }).undergrad, 86.31));
test('Student loan Plan 2 £40,000/yr', () => assert.equal(C.studentLoan({ income: 40000, plans: ['plan2'] }).total, 955.35));
test('Postgraduate 6% over £21,000', () => assert.equal(C.studentLoan({ income: 31000, plans: [], pg: true }).total, 600));
test('Below threshold = 0', () => assert.equal(C.studentLoan({ income: 20000, plans: ['plan5'] }).total, 0));
test('VAT add 20% to £100', () => assert.deepEqual(C.vat({ amount: 100 }), { net: 100, vat: 20, gross: 120 }));
test('VAT remove 20% from £120', () => assert.deepEqual(C.vat({ amount: 120, mode: 'remove' }), { net: 100, vat: 20, gross: 120 }));
test('VAT remove 5% from £105', () => assert.equal(C.vat({ amount: 105, mode: 'remove', rate: .05 }).net, 100));
test('Mortgage £200k 5% 25y = £1,169.18', () => assert.equal(C.mortgage({ loan: 200000, rate: 5, years: 25 }).monthly, 1169.18));
test('Mortgage interest-only £200k 5% = £833.33', () => assert.equal(C.mortgage({ loan: 200000, rate: 5, years: 25, type: 'interest' }).monthly, 833.33));
test('Mortgage 0% rate', () => assert.equal(C.mortgage({ loan: 120000, rate: 0, years: 10 }).monthly, 1000));
test('VED petrol 120g first year £455', () => assert.equal(C.carTax({ co2: 120, fuel: 'petrol' }).firstYear, 455));
test('VED diesel 140g first year £1,410', () => assert.equal(C.carTax({ co2: 140, fuel: 'diesel' }).firstYear, 1410));
test('VED EV first year £10, standard £200', () => { const r = C.carTax({ fuel: 'electric', listPrice: 45000 }); assert.equal(r.firstYear, 10); assert.equal(r.standard, 200); });
test('VED EV over £50k = £640', () => assert.equal(C.carTax({ fuel: 'electric', listPrice: 55000 }).standard, 640));
test('VED petrol over £40k = £640, 6-month £352', () => { const r = C.carTax({ co2: 120, listPrice: 45000 }); assert.equal(r.standard, 640); assert.equal(r.sixMonth, 352); });
test('VED DD monthly standard £17.50', () => assert.equal(C.carTax({ co2: 120 }).ddMonthly, 17.5));
// Take-home pay 2026/27 (hand-checked against GOV.UK income tax and NI rates)
test('Take-home £30,000 rUK: tax £3,486, NI £1,394.40', () => { const r = C.takeHome({ salary: 30000 }); assert.equal(r.incomeTax, 3486); assert.equal(r.ni, 1394.4); assert.equal(r.net, 25119.6); });
test('Take-home £60,000 rUK: tax £11,432, NI £3,210.60', () => { const r = C.takeHome({ salary: 60000 }); assert.equal(r.incomeTax, 11432); assert.equal(r.ni, 3210.6); });
test('Personal allowance tapers to 0 at £125,140', () => assert.equal(C.takeHome({ salary: 125140 }).personalAllowance, 0));
test('£110,000 PA = £7,570', () => assert.equal(C.takeHome({ salary: 110000 }).personalAllowance, 7570));
test('£110,000 marginal rate 62% (60% tax + 2% NI)', () => assert.equal(C.takeHome({ salary: 110000 }).marginal, 62));
test('Scotland £30,000 tax: 19%×3,967 + 20%×12,989 + 21%×474', () => assert.equal(C.takeHome({ salary: 30000, region: 'sco' }).incomeTax, 3451.07));
test('Below allowance = no tax, no NI', () => { const r = C.takeHome({ salary: 12000 }); assert.equal(r.incomeTax, 0); assert.equal(r.ni, 0); assert.equal(r.net, 12000); });
test('Salary sacrifice 5% of £40,000 cuts tax and NI', () => { const r = C.takeHome({ salary: 40000, pension: 5, pensionType: 'sacrifice' }); assert.equal(r.pension, 2000); assert.equal(r.incomeTax, 5086); assert.equal(r.ni, 2034.4); });
test('Net-pay pension keeps NI on full pay', () => assert.equal(C.takeHome({ salary: 40000, pension: 5, pensionType: 'net' }).ni, 2194.4));
test('Plan 2 student loan in take-home £40,000 = £955.35', () => assert.equal(C.takeHome({ salary: 40000, plans: ['plan2'] }).studentLoan, 955.35));
// Minimum wage April 2026 (GOV.UK)
test('NLW 21+ = £12.71', () => assert.equal(C.minWage({ age: 25 }).rate, 12.71));
test('18-20 = £10.85', () => assert.equal(C.minWage({ age: 19 }).rate, 10.85));
test('Under 18 = £8.00', () => assert.equal(C.minWage({ age: 17 }).rate, 8));
test('Apprentice 21 first year = £8', () => assert.equal(C.minWage({ age: 21, apprentice: true, firstYear: true }).rate, 8));
test('Apprentice 21 after first year = £12.71', () => assert.equal(C.minWage({ age: 21, apprentice: true }).rate, 12.71));
test('Apprentice 18 (under 19) = £8 any year', () => assert.equal(C.minWage({ age: 18, apprentice: true }).rate, 8));
test('£12.00/hr at 25, 37.5 h: short £0.71/h, £26.63/wk', () => { const r = C.minWage({ age: 25, hourly: 12, hours: 37.5 }); assert.equal(r.ok, false); assert.equal(r.shortPerWeek, 26.63); });
test('2025/26 NLW was £12.21', () => assert.equal(C.minWage({ age: 30, year: '2025' }).rate, 12.21));
test('Full-time NLW yearly 37.5h = £24,784.50', () => assert.equal(C.minWage({ age: 30, hours: 37.5 }).yearlyMin, 24784.5));
// Self-employed 2026/27 (GOV.UK: Class 4 6% £12,570–£50,270, 2% above; Class 2 credited from £7,105)
test('SE £30,000: tax £3,486, Class 4 £1,045.80', () => { const r = C.selfEmployed({ profit: 30000 }); assert.equal(r.incomeTax, 3486); assert.equal(r.class4, 1045.8); assert.equal(r.totalBill, 4531.8); assert.equal(r.class2Credited, true); });
test('SE £60,000: Class 4 = 6%×37,700 + 2%×9,730 = £2,456.60', () => assert.equal(C.selfEmployed({ profit: 60000 }).class4, 2456.6));
test('SE £10,000: no tax, no Class 4', () => { const r = C.selfEmployed({ profit: 10000 }); assert.equal(r.totalBill, 0); });
test('SE £5,000 voluntary Class 2 = £189.80', () => assert.equal(C.selfEmployed({ profit: 5000, voluntaryClass2: true }).class2, 189.8));
test('SE voluntary Class 2 ignored above £7,105', () => assert.equal(C.selfEmployed({ profit: 8000, voluntaryClass2: true }).class2, 0));
test('SE £30,000 payment on account = £2,265.90', () => assert.equal(C.selfEmployed({ profit: 30000 }).paymentOnAccount, 2265.9));
test('SE under £1,000 bill: no payment on account', () => assert.equal(C.selfEmployed({ profit: 15000 }).paymentOnAccount, 0));
test('SE Scotland £30,000 tax = £3,451.07', () => assert.equal(C.selfEmployed({ profit: 30000, region: 'sco' }).incomeTax, 3451.07));
// Dividends 2026/27 (GOV.UK: £500 allowance; 10.75% / 35.75% / 39.35%)
test('GOV.UK example: £29,570 wages + £3,000 dividends = £268.75', () => assert.equal(C.dividendTax({ salary: 29570, dividends: 3000 }).dividendTax, 268.75));
test('£12,570 salary + £10,000 dividends = 10.75%×9,500 = £1,021.25', () => assert.equal(C.dividendTax({ salary: 12570, dividends: 10000 }).dividendTax, 1021.25));
test('Dividends under allowance = £0', () => assert.equal(C.dividendTax({ salary: 40000, dividends: 500 }).dividendTax, 0));
test('Unused PA covers dividends: £0 salary + £13,070 dividends = £0', () => assert.equal(C.dividendTax({ salary: 0, dividends: 13070 }).dividendTax, 0));
test('Higher rate: £60,000 salary + £5,000 div = 35.75%×4,500 = £1,608.75', () => assert.equal(C.dividendTax({ salary: 60000, dividends: 5000 }).dividendTax, 1608.75));
test('Straddle: £45,000 + £10,000 div', () => { const r = C.dividendTax({ salary: 45000, dividends: 10000 }); /* taxable sal 32,430; allowance to 32,930; basic to 37,700: 4,770@10.75=512.775; 4,730@35.75=1690.975 */ assert.equal(r.dividendTax, 2203.75); });
test('Additional rate above £125,140', () => { const r = C.dividendTax({ salary: 150000, dividends: 10000 }); assert.equal(r.personalAllowance, 0); assert.equal(r.dividendTax, r2(9500 * 0.3935)); });
function r2(n){return Math.round((n+Number.EPSILON)*100)/100}
