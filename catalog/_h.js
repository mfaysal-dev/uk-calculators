// small helpers shared by catalog files
exports.T = (cat) => (slug, ico, short, title, h1, desc, intro, form, js, prose, faq, extra = {}) => Object.assign({ generic:1, cat, slug, ico, short, title, h1, desc, intro, form, js, prose, faq, sources: [] }, extra);
exports.ta = (id, v, rows = 8, lab = 'Your text') => `<label for="${id}">${lab}</label><textarea id="${id}" name="${id}" rows="${rows}">${v}</textarea>`;
exports.txt = (id, lab, v = '', ph = '') => `<label for="${id}">${lab}</label><input type="text" id="${id}" name="${id}" value="${v}" placeholder="${ph}" autocomplete="off" spellcheck="false">`;
exports.sel = (id, lab, opts, d) => `<label for="${id}">${lab}</label><select id="${id}" name="${id}">${opts.map(([v, l]) => `<option value="${v}"${v === d ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
