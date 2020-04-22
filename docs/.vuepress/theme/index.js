module.exports = {
  extend: '@vuepress/theme-default',
  plugins: [
    ['container', {
      type: 'half',
      defaultTitle: '',
    }],
    ['container', {
      type: 'third',
      defaultTitle: '',
    }],
    ['container', {
      type: 'center',
      defaultTitle: '',
    }],
  ],
};
