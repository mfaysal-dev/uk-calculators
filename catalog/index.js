module.exports = (h) => { const BASE = (process.env.BASE || 'https://uk-calculators.vercel.app').replace(/\/$/, ''); h = Object.assign({ BASE }, h);
  return ['bg', 'units', 'text', 'dev', 'media', 'random', 'calc', 'fun'].filter(n => require('fs').existsSync(__dirname + '/' + n + '.js')).flatMap(n => require('./' + n + '.js')(h)); };
