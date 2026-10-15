/* mfaysal.com theme bridge for /free-tools/ (same localStorage key as the main site) */
(function(){var d=document.documentElement;try{var q=new URLSearchParams(location.search).get('theme'),s=q==='light'||q==='dark'?q:localStorage.getItem('mf-theme');if(q==='light'||q==='dark')localStorage.setItem('mf-theme',q);d.setAttribute('data-theme',s==='light'?'light':'dark')}catch(e){d.setAttribute('data-theme','dark')}
window.FT_MODELS='/free-tools/models/';
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-mf-theme]');if(!b)return;var t=d.getAttribute('data-theme')==='light'?'dark':'light';d.setAttribute('data-theme',t);try{localStorage.setItem('mf-theme',t)}catch(x){}});})();
