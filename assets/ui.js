(function(){
  var gbp=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'});
  window.fmt=function(n){return gbp.format(n||0)};
  window.val=function(id){var e=document.getElementById(id);return e.type==='checkbox'?e.checked:e.value};
  window.radio=function(n){var e=document.querySelector('input[name="'+n+'"]:checked');return e&&e.value};
  window.bind=function(form,fn){form.addEventListener('input',fn);form.addEventListener('change',fn);form.addEventListener('submit',function(e){e.preventDefault();fn()});
    // restore from URL
    var q=new URLSearchParams(location.search);q.forEach(function(v,k){var els=form.querySelectorAll('[name="'+k+'"]');els.forEach(function(el){if(el.type==='radio')el.checked=el.value===v;else if(el.type==='checkbox')el.checked=v==='1';else el.value=v})});
    fn();};
})();
