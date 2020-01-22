module.exports = {
  extend: '@vuepress/theme-blog',
  plugins: [
    ['container', {
      type: 'thumbnail',
      defaultTitle: '',
    }],
    ['container', {
      type: 'caption',
      defaultTitle: '',
    }],
    ['container', {
      type: 'quote',
      defaultTitle: '',
    }],
    ['container', {
      type: 'tip',
      defaultTitle: 'TIP',
    }],
    ['container', {
      type: 'warning',
      defaultTitle: 'WARNING',
    }],
    ['container', {
      type: 'danger',
      defaultTitle: 'DANGER!',
    }],
  ],
};
