module.exports = {
  title: 'Lando',
  description: 'The liberating local development tool for all your projects.',
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
    ['link', {rel: 'stylesheet', href: '/styles/overrides.css'}],
    ['link', {rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Dosis&display=swap'}],
    ['link', {rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Source+Sans+Pro&display=swap'}],
  ],
  themeConfig: {
    docsDir: 'website',
    docsBranch: 'master',
    logo: '/images/logo-small.png',
    editLinks: false,
    nav: [
      {text: 'Documentation', link: 'https://docs.lando.dev'},
    ],
  },
};
