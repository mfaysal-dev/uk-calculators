# UK Calculators (2026/27)

Seven free, fast, privacy-friendly UK calculators. Everything runs in the browser – no tracking, no data sent anywhere.

**Live:** https://uk-calculators.vercel.app · **Author:** [Mahir Faysal – mfaysal.com](https://mfaysal.com/)

| Tool | What it does |
| --- | --- |
| [Take-Home Pay](https://uk-calculators.vercel.app/take-home-pay-calculator/) | Income tax (rUK & Scotland), National Insurance, pension (net pay / salary sacrifice), student loan – yearly, monthly, weekly |
| [Minimum Wage](https://uk-calculators.vercel.app/minimum-wage-calculator/) | Check hourly pay against the April 2026 National Living Wage / NMW by age and apprenticeship, with shortfall |
| [Stamp Duty](https://uk-calculators.vercel.app/stamp-duty-calculator/) | SDLT (England & NI), LBTT (Scotland), LTT (Wales), first-time buyer relief, second-home & non-resident surcharges |
| [Student Loan](https://uk-calculators.vercel.app/student-loan-repayment-calculator/) | Plan 1, 2, 4, 5 and Postgraduate Loan repayments – yearly, monthly, weekly |
| [VAT](https://uk-calculators.vercel.app/vat-calculator/) | Add or remove VAT at 20%, 5% or 0% |
| [Mortgage](https://uk-calculators.vercel.app/mortgage-calculator/) | Repayment / interest-only payments, total interest, stress test, borrowing range |
| [Car Tax (VED)](https://uk-calculators.vercel.app/car-tax-calculator/) | First-year rate by CO2, £200 standard rate, £440 expensive car supplement, EVs |

## Sources
Rates come from GOV.UK (HMRC, DVLA, Student Loans Company), Revenue Scotland and GOV.WALES – each tool page links its sources.

## Develop
```bash
npm test        # unit tests against GOV.UK worked examples
npm run build   # generates ./public
```
Vanilla HTML/CSS/JS, no dependencies.

## Disclaimer
Estimates only – not financial, tax or legal advice. Always check the official source.

MIT © Mahir Faysal
