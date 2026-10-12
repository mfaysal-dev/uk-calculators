// Generates static pages. Usage: BASE=https://example.vercel.app node build.js
const fs = require('fs'); const path = require('path');
const BASE = (process.env.BASE || 'https://uk-calculators.vercel.app').replace(/\/$/, '');
const YEAR = '2026/27';
const esc = s => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const money = (id, label, v, hint='') => `<label for="${id}">${label}${hint?` <span class="hint">${hint}</span>`:''}</label><div class="money"><span aria-hidden="true">£</span><input type="number" inputmode="decimal" min="0" step="any" id="${id}" name="${id}" value="${v}"></div>`;
const num = (id, label, v, hint='', step='any') => `<label for="${id}">${label}${hint?` <span class="hint">${hint}</span>`:''}</label><input type="number" inputmode="decimal" min="0" step="${step}" id="${id}" name="${id}" value="${v}">`;
const chk = (id, label, on) => `<label class="check"><input type="checkbox" id="${id}" name="${id}" value="1"${on?' checked':''}> <span>${label}</span></label>`;
const seg = (name, legend, opts, def) => `<fieldset><legend>${legend}</legend><div class="seg">${opts.map(([v,l])=>`<label><input type="radio" name="${name}" value="${v}"${v===def?' checked':''}><span>${l}</span></label>`).join('')}</div></fieldset>`;

const tools = [
{ slug:'stamp-duty-calculator', ico:'🏠', short:'Stamp Duty', title:'Stamp Duty Calculator UK 2026/27 – SDLT, LBTT & LTT',
  h1:'Stamp Duty Calculator (England, NI, Scotland & Wales)',
  desc:'Free UK stamp duty calculator for 2026/27. Work out SDLT (England & Northern Ireland), LBTT (Scotland) and LTT (Wales) with first-time buyer relief and second-home surcharges.',
  intro:'Pick where the property is, enter the price and see exactly how much tax you pay in each band.',
  form: seg('region','Where is the property?',[['eng','England / NI'],['sco','Scotland'],['wal','Wales']],'eng') + money('price','Purchase price',300000) +
    chk('ftb','I am a first-time buyer') + chk('additional','This is an additional property (second home / buy-to-let)') + chk('nonResident','I am not UK resident (England/NI only)'),
  js:`var r=UKCalc.stampDuty({region:radio('region'),price:+val('price'),ftb:val('ftb'),additional:val('additional'),nonResident:val('nonResident')});
  out.innerHTML='<p class="hint">'+r.taxName+'</p><p class="big">'+fmt(r.tax)+'</p><dl class="kv"><dt>Effective rate</dt><dd>'+r.effectiveRate+'%</dd>'+(r.ads?'<dt>Additional Dwelling Supplement</dt><dd>'+fmt(r.ads)+'</dd>':'')+'</dl>'
  +'<table><caption class="sr">Tax by band</caption><thead><tr><th scope="col">Band</th><th scope="col">Rate</th><th scope="col">Tax</th></tr></thead><tbody>'+r.rows.map(function(x){return '<tr><td>'+fmt(x.from)+' – '+(isFinite(x.to)?fmt(x.to):'above')+'</td><td>'+(x.rate*100).toFixed(1).replace('.0','')+'%</td><td>'+fmt(x.tax)+'</td></tr>'}).join('')+'</tbody></table>'
  +(r.notes.length?'<ul class="notes">'+r.notes.map(function(n){return '<li>'+n+'</li>'}).join('')+'</ul>':'');`,
  prose:`<h2>Stamp duty rates ${YEAR}</h2><p><strong>England &amp; Northern Ireland (SDLT):</strong> 0% up to £125,000, 2% to £250,000, 5% to £925,000, 10% to £1.5m and 12% above. First-time buyers pay 0% up to £300,000 and 5% up to £500,000 (no relief above £500,000). Additional properties pay 5% more in every band and non-UK residents pay a further 2%.</p>
  <p><strong>Scotland (LBTT):</strong> 0% to £145,000, 2% to £250,000, 5% to £325,000, 10% to £750,000, 12% above. First-time buyers get a £175,000 nil band. The Additional Dwelling Supplement is 8% of the whole price.</p>
  <p><strong>Wales (LTT):</strong> 0% to £225,000, 6% to £400,000, 7.5% to £750,000, 10% to £1.5m, 12% above. Higher residential rates apply to additional properties. Wales has no first-time buyer relief.</p>
  <h2>Worked example</h2><p>A £295,000 home in England (not a first-time buyer): 0% on £125,000 + 2% on £125,000 (£2,500) + 5% on £45,000 (£2,250) = <strong>£4,750</strong>, matching the GOV.UK example.</p>`,
  sources:[['GOV.UK – Stamp Duty Land Tax residential rates','https://www.gov.uk/stamp-duty-land-tax/residential-property-rates'],['Revenue Scotland – LBTT rates','https://revenue.scot/taxes/land-buildings-transaction-tax/residential-property'],['GOV.WALES – LTT rates and bands','https://www.gov.wales/land-transaction-tax-rates-and-bands']],
  faq:[['Do first-time buyers pay stamp duty in England?','Not on the first £300,000. You pay 5% on the portion from £300,001 to £500,000. If the price is over £500,000, normal rates apply.'],['How much is stamp duty on a second home?','In England/NI add 5% to every band. In Scotland add 8% of the full price (ADS). In Wales the higher residential rates apply.']]},

{ slug:'student-loan-repayment-calculator', ico:'🎓', short:'Student Loan', title:'Student Loan Repayment Calculator UK 2026/27 – Plan 1, 2, 4, 5 & Postgrad',
  h1:'Student Loan Repayment Calculator',
  desc:'Calculate your UK student loan repayments for 2026/27. Supports Plan 1, Plan 2, Plan 4 (Scotland), Plan 5 and Postgraduate Loans – yearly, monthly or weekly.',
  intro:'Tick your loan plans, enter your pay before tax and see what comes out of your wages.',
  form: seg('period','How often are you paid?',[['year','Yearly'],['month','Monthly'],['week','Weekly']],'year') + money('income','Pay before tax for that period',35000) +
   `<fieldset><legend>Your loan plans</legend>${chk('plan1','Plan 1 (England/Wales before Sept 2012, or Northern Ireland)')}${chk('plan2','Plan 2 (England/Wales Sept 2012 – July 2023)',1)}${chk('plan4','Plan 4 (Scotland)')}${chk('plan5','Plan 5 (England, from Aug 2023)')}${chk('pg','Postgraduate Loan')}</fieldset>`,
  js:`var plans=['plan1','plan2','plan4','plan5'].filter(function(k){return val(k)});var p=radio('period');
  var r=UKCalc.studentLoan({income:+val('income'),plans:plans,pg:val('pg'),period:p});var per={year:'year',month:'month',week:'week'}[p];
  var L=UKCalc.RATES.studentLoan;
  out.innerHTML=(!plans.length&&!val('pg'))?'<p>Tick at least one loan plan.</p>':'<p class="hint">Repayment per '+per+'</p><p class="big">'+fmt(r.total)+'</p><dl class="kv">'
  +(r.plan?'<dt>Undergraduate ('+L[r.plan].label+', 9% over '+fmt(r.threshold)+')</dt><dd>'+fmt(r.undergrad)+'</dd>':'')
  +(val('pg')?'<dt>Postgraduate (6% over '+fmt(r.pgThreshold)+')</dt><dd>'+fmt(r.pg)+'</dd>':'')
  +(p!=='year'?'<dt>Approx. per year</dt><dd>'+fmt(r.total*(p==='month'?12:52))+'</dd>':'<dt>Approx. per month</dt><dd>'+fmt(r.total/12)+'</dd>')+'</dl>'
  +(plans.length>1?'<ul class="notes"><li>With more than one undergraduate plan you repay 9% over the lowest threshold.</li></ul>':'');`,
  prose:`<h2>Repayment thresholds ${YEAR}</h2><table><thead><tr><th scope="col">Plan</th><th scope="col">Yearly</th><th scope="col">Monthly</th><th scope="col">Weekly</th></tr></thead><tbody>
  <tr><td>Plan 1</td><td>£26,900</td><td>£2,241</td><td>£517</td></tr><tr><td>Plan 2</td><td>£29,385</td><td>£2,448</td><td>£565</td></tr><tr><td>Plan 4</td><td>£33,795</td><td>£2,816</td><td>£649</td></tr><tr><td>Plan 5</td><td>£25,000</td><td>£2,083</td><td>£480</td></tr><tr><td>Postgraduate</td><td>£21,000</td><td>£1,750</td><td>£403</td></tr></tbody></table>
  <p>You repay 9% of income over the threshold for Plans 1, 2, 4 and 5, and 6% for a Postgraduate Loan (which is paid on top of any undergraduate plan).</p>
  <h2>Worked example</h2><p>GOV.UK example: paid £3,200 a month with Plan 1 and Plan 2 loans – 9% of (£3,200 − £2,241) = <strong>£86.31</strong> a month.</p>`,
  sources:[['GOV.UK – Repaying your student loan: what you pay','https://www.gov.uk/repaying-your-student-loan/what-you-pay'],['GOV.UK – 2026 to 2027 student loan deduction tables','https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables']],
  faq:[['What is the Plan 2 threshold for 2026/27?','£29,385 a year (£2,448 a month, £565 a week).'],['Do I pay student loan on a bonus?','Yes. Deductions are based on each pay period, so a big month can trigger a repayment. You can claim a refund if your yearly income ends up below the threshold.']]},

{ slug:'vat-calculator', ico:'🧾', short:'VAT', title:'VAT Calculator UK – Add or Remove VAT at 20%, 5% or 0%',
  h1:'VAT Calculator (Add or Remove VAT)',
  desc:'Free UK VAT calculator. Add VAT to a net price or remove VAT from a gross price at the 20% standard, 5% reduced or 0% zero rate.',
  intro:'Instantly add VAT to a price or work out the VAT inside a VAT-inclusive amount.',
  form: seg('mode','What do you want to do?',[['add','Add VAT'],['remove','Remove VAT']],'add') + money('amount','Amount',100) +
    seg('rate','VAT rate',[['0.2','20% standard'],['0.05','5% reduced'],['0','0% zero']],'0.2'),
  js:`var r=UKCalc.vat({amount:+val('amount'),mode:radio('mode'),rate:+radio('rate')});
  out.innerHTML='<p class="hint">'+(radio('mode')==='add'?'Price including VAT':'Price excluding VAT')+'</p><p class="big">'+fmt(radio('mode')==='add'?r.gross:r.net)+'</p><dl class="kv"><dt>Net (ex VAT)</dt><dd>'+fmt(r.net)+'</dd><dt>VAT</dt><dd>'+fmt(r.vat)+'</dd><dt>Gross (inc VAT)</dt><dd>'+fmt(r.gross)+'</dd></dl>';`,
  prose:`<h2>UK VAT rates</h2><p>The standard rate is <strong>20%</strong> (most goods and services), the reduced rate is <strong>5%</strong> (for example home energy and children's car seats) and some items are <strong>zero-rated</strong> (most food and children's clothes).</p>
  <h2>How to remove VAT</h2><p>Divide the VAT-inclusive price by 1.2 for 20% VAT (or 1.05 for 5%). Example: £120 ÷ 1.2 = £100 net, so the VAT is £20. Don't just take 20% off the gross – that gives the wrong answer (£96).</p>`,
  sources:[['GOV.UK – VAT rates','https://www.gov.uk/vat-rates'],['GOV.UK – VAT rates on different goods and services','https://www.gov.uk/guidance/rates-of-vat-on-different-goods-and-services']],
  faq:[['How do I calculate 20% VAT?','Multiply the net price by 1.2 to get the gross price, or by 0.2 to get just the VAT.'],['What is the VAT registration threshold?','£90,000 of taxable turnover in a rolling 12 months.']]},

{ slug:'mortgage-calculator', ico:'🏦', short:'Mortgage', title:'Mortgage Calculator UK – Monthly Repayments & Affordability',
  h1:'Mortgage Repayment & Affordability Calculator',
  desc:'Free UK mortgage calculator. Work out monthly repayments for repayment or interest-only mortgages, total interest, a rate-rise stress test and how much you could borrow.',
  intro:'Enter the loan, rate and term to see your monthly payment, total interest and a stress test at a higher rate.',
  form: seg('type','Mortgage type',[['repayment','Repayment'],['interest','Interest-only']],'repayment') + money('loan','Loan amount',200000) +
    num('rate','Interest rate','4.5','% a year','0.01') + num('years','Term','25','years','1') + num('stress','Stress-test rate','7.5','% a year – lenders often test about 3% above','0.01') + money('income','Household income (optional)','', 'for a rough borrowing range'),
  js:`var r=UKCalc.mortgage({loan:+val('loan'),rate:+val('rate'),years:+val('years'),type:radio('type'),income:+val('income')||0,stressRate:+val('stress')});
  out.innerHTML='<p class="hint">Monthly payment</p><p class="big">'+fmt(r.monthly)+'</p><dl class="kv"><dt>Total repaid</dt><dd>'+fmt(r.total)+'</dd><dt>Total interest</dt><dd>'+fmt(r.interest)+'</dd><dt>Payments</dt><dd>'+r.months+'</dd><dt>Monthly at stress rate</dt><dd>'+fmt(r.stressMonthly)+'</dd>'
  +(r.affordLow?'<dt>Typical borrowing range (4–4.5× income)</dt><dd>'+fmt(r.affordLow)+' – '+fmt(r.affordHigh)+'</dd>':'')+'</dl>';`,
  prose:`<h2>How the monthly payment is worked out</h2><p>For a repayment mortgage the standard annuity formula is used: payment = P × i ÷ (1 − (1 + i)<sup>−n</sup>), where P is the loan, i the monthly rate and n the number of months. Example: £200,000 at 5% over 25 years = <strong>£1,169.18</strong> a month. An interest-only mortgage pays just the interest (£833.33 a month here) and the full loan is still owed at the end.</p>
  <h2>How much can I borrow?</h2><p>Most UK lenders lend around 4 to 4.5 times household income, subject to an affordability and stress test. The FCA requires lenders to check you can still afford payments if rates rise.</p>`,
  sources:[['MoneyHelper (government-backed) – Mortgage calculator guidance','https://www.moneyhelper.org.uk/en/homes/buying-a-home/mortgage-calculator'],['FCA – Mortgages: affordability rules (MCOB 11)','https://www.handbook.fca.org.uk/handbook/MCOB/11/'],['Bank of England – Bank Rate','https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate']],
  faq:[['Is a 25-year mortgage better than 35 years?','A shorter term means higher monthly payments but much less interest overall. Use the calculator to compare.'],['Does this include fees?','No. Add arrangement fees, valuation and legal costs separately.']]},

{ slug:'car-tax-calculator', ico:'🚗', short:'Car Tax (VED)', title:'Car Tax Calculator UK 2026/27 – VED by CO2, Fuel & List Price',
  h1:'Car Tax (VED) Calculator',
  desc:'Work out UK car tax (Vehicle Excise Duty) from 1 April 2026: first-year rate by CO2, the £200 standard rate, the £440 expensive car supplement and EV tax.',
  intro:'For cars first registered on or after 1 April 2017. Enter CO2, fuel type and list price.',
  form: seg('fuel','Fuel type',[['petrol','Petrol / hybrid / alt-fuel'],['diesel','Diesel (not RDE2)'],['rde2','Diesel (RDE2)'],['electric','Electric']],'petrol') +
    num('co2','CO2 emissions','120','g/km – on your V5C','1') + money('listPrice','List price when new',30000,'incl. options'),
  js:`var f=radio('fuel');var r=UKCalc.carTax({fuel:f==='rde2'?'petrol':f,co2:+val('co2'),listPrice:+val('listPrice')});
  document.getElementById('co2').disabled=f==='electric';
  out.innerHTML='<p class="hint">Yearly tax after the first year</p><p class="big">'+fmt(r.standard)+'</p><dl class="kv"><dt>First-year tax (new car, from 1 Apr 2026)</dt><dd>'+fmt(r.firstYear)+'</dd><dt>6-month payment</dt><dd>'+fmt(r.sixMonth)+'</dd><dt>Direct Debit monthly</dt><dd>'+fmt(r.ddMonthly)+'</dd><dt>Total first 6 years</dt><dd>'+fmt(r.sixYearTotal)+'</dd></dl>'
  +(r.expensive?'<ul class="notes"><li>Expensive car supplement (£440) applies for 5 years from the second licence.</li></ul>':'');`,
  prose:`<h2>Vehicle tax rates from 1 April 2026</h2><p>The standard rate for cars registered from 1 April 2017 is <strong>£200</strong> a year. Cars with a list price over £40,000 (over £50,000 for zero-emission cars) pay an extra <strong>£440</strong> for five years from the second licence, so £640 a year.</p>
  <h2>First-year rates by CO2 (petrol / RDE2 diesel)</h2><table><thead><tr><th scope="col">CO2 g/km</th><th scope="col">Petrol</th><th scope="col">Other diesel</th></tr></thead><tbody>
  ${[['0','£10','£10'],['1–50','£115','£135'],['51–75','£135','£280'],['76–90','£280','£365'],['91–100','£365','£405'],['101–110','£405','£455'],['111–130','£455','£560'],['131–150','£560','£1,410'],['151–170','£1,410','£2,270'],['171–190','£2,270','£3,420'],['191–225','£3,420','£4,850'],['226–255','£4,850','£5,690'],['Over 255','£5,690','£5,690']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>`,
  sources:[['GOV.UK / DVLA – V149 rates of vehicle tax from 1 April 2026','https://www.gov.uk/government/publications/rates-of-vehicle-tax-v149'],['GOV.UK – Vehicle tax for electric and low emission vehicles','https://www.gov.uk/guidance/vehicle-tax-for-electric-and-low-emissions-vehicles'],['GOV.UK – Check vehicle tax rates','https://www.gov.uk/vehicle-tax-rate-tables']],
  faq:[['Do electric cars pay road tax in 2026?','Yes. Since April 2025 EVs pay £10 in the first year then the £200 standard rate, plus £440 if the list price was over £50,000.'],['Is this for older cars?','No – cars registered before 1 April 2017 are taxed on CO2 bands. Use the GOV.UK vehicle tax checker for those.']]},
];

const nav = cur => `<nav class="nav" aria-label="Main"><a href="/">🇬🇧 UK Calculators</a><div class="links">${tools.map(t=>`<a href="/${t.slug}/"${t.slug===cur?' aria-current="page"':''}>${t.short}</a>`).join('')}</div></nav>`;
const foot = `<footer><div class="wrap"><p>Free UK calculators built by <a href="https://mfaysal.com/">Mahir Faysal – mfaysal.com</a> · <a href="https://github.com/mfaysal-dev/uk-calculators">Source on GitHub</a></p><p>Rates for the ${YEAR} tax year. Estimates only – not financial, tax or legal advice.</p></div></footer>`;
const head = (t, url, ld) => `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t.title)}</title><meta name="description" content="${esc(t.desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${esc(t.desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/og/${t.slug||'home'}.png"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1d4ed8"><link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>£</text></svg>">
<link rel="stylesheet" href="/assets/style.css"><script type="application/ld+json">${JSON.stringify(ld)}</script></head>`;

function page(t) {
  const url = `${BASE}/${t.slug}/`;
  const ld = [{ '@context':'https://schema.org','@type':'WebApplication',name:t.h1,url,description:t.desc,applicationCategory:'FinanceApplication',operatingSystem:'Any',inLanguage:'en-GB',isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'GBP'},author:{'@type':'Person',name:'Mahir Faysal',url:'https://mfaysal.com/'}},
    { '@context':'https://schema.org','@type':'FAQPage',mainEntity:t.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))},
    { '@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'UK Calculators',item:BASE+'/'},{'@type':'ListItem',position:2,name:t.short,item:url}]}];
  return head(t,url,ld)+`<body><a class="skip" href="#calc">Skip to calculator</a><header class="top"><div class="wrap">${nav(t.slug)}<div class="hero"><h1>${t.h1}</h1><p>${t.intro} Updated for ${YEAR}.</p></div></div></header>
<main class="wrap"><div class="grid"><section class="card" id="calc" aria-labelledby="fh"><h2 id="fh">Your details</h2><form id="f" novalidate>${t.form}</form></section>
<section class="card" aria-labelledby="rh"><h2 id="rh">Result</h2><div id="out" aria-live="polite"></div></section></div>
<article class="card prose">${t.prose}<h2>Frequently asked questions</h2>${t.faq.map(([q,a])=>`<h3>${q}</h3><p>${a}</p>`).join('')}
<h2>Sources</h2><ul>${t.sources.map(([n,u])=>`<li><a href="${u}" rel="noopener">${n}</a></li>`).join('')}</ul>
<p class="disclaimer"><strong>Disclaimer:</strong> This calculator gives an estimate using official ${YEAR} rates published on GOV.UK and devolved government sites (checked October 2026). It is not financial, tax or legal advice and may not cover every situation. Always check with the official source, HMRC, your lender or a qualified adviser before making decisions.</p></article></main>
${foot}<script src="/assets/calc.js"></script><script src="/assets/ui.js"></script><script>(function(){var out=document.getElementById('out');bind(document.getElementById('f'),function(){${t.js}});})();</script></body></html>`;
}

function home() {
  const t = { title:'Free UK Calculators 2026/27 – Stamp Duty, Student Loan, VAT, Mortgage & Car Tax', desc:'Five free, fast UK calculators using official 2026/27 GOV.UK rates: stamp duty (SDLT/LBTT/LTT), student loan repayments, VAT, mortgage repayments and car tax.', slug:'' };
  const ld = {'@context':'https://schema.org','@type':'WebSite',name:'UK Calculators',url:BASE+'/',inLanguage:'en-GB',author:{'@type':'Person',name:'Mahir Faysal',url:'https://mfaysal.com/'}};
  return head(t,BASE+'/',ld)+`<body><header class="top"><div class="wrap">${nav('')}<div class="hero"><h1>Free UK Calculators</h1><p>Quick, private and free – everything runs in your browser. Built on official ${YEAR} rates from GOV.UK.</p></div></div></header>
<main class="wrap"><div class="tools">${tools.map(x=>`<a href="/${x.slug}/"><div class="card"><div class="ico" aria-hidden="true">${x.ico}</div><h2>${x.h1}</h2><p>${x.desc}</p></div></a>`).join('')}</div>
<p class="disclaimer">Estimates only, not financial advice. No data leaves your device.</p></main>${foot}</body></html>`;
}

const out = path.join(__dirname, 'public'); fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out+'/assets',{recursive:true});
for (const f of ['style.css','calc.js','ui.js']) fs.copyFileSync(path.join(__dirname,'assets',f), path.join(out,'assets',f));
if (fs.existsSync(path.join(__dirname,'og'))) fs.cpSync(path.join(__dirname,'og'), path.join(out,'og'), {recursive:true});
fs.writeFileSync(out+'/index.html', home());
for (const t of tools) { fs.mkdirSync(out+'/'+t.slug,{recursive:true}); fs.writeFileSync(out+'/'+t.slug+'/index.html', page(t)); }
fs.writeFileSync(out+'/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
fs.writeFileSync(out+'/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['',...tools.map(t=>t.slug+'/')].map(s=>`<url><loc>${BASE}/${s}</loc><lastmod>2026-10-12</lastmod></url>`).join('')}</urlset>\n`);
fs.writeFileSync(out+'/404.html', home().replace('<h1>Free UK Calculators</h1>','<h1>Page not found</h1>'));
fs.writeFileSync(path.join(__dirname,'tools.json'), JSON.stringify(tools.map(t=>({slug:t.slug,title:t.title,h1:t.h1,desc:t.desc,ico:t.ico})),null,1));
console.log('built', tools.length, 'tools ->', BASE);
