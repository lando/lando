module.exports = {
  scripts: [
    './bin/*.js',
    './lib/**/*.js',
    './plugins/**/*.js'
  ],
  assets: [
    'package.json',
    '**/*.yml',
    '**/*.sh',
    '**/*.conf',
    '**/*.cnf',
    '**/*.ini'
  ],
  dirs: [
    './lib',
    './bin',
    './plugins'
  ]
};
