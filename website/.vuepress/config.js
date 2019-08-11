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
    logo: '/images/logo-small-white.png',
    search: false,
    editLinks: false,
    nav: [
      {text: 'Get Lando!', link: '/download/'},
      {text: 'Memberships', link: '/memberships/'},
      {text: 'Services', link: '/services/'},
      {text: 'Support', link: '/support/'},
      {text: 'Documentation', link: 'https://docs.lando.dev'},
    ],
  },
};
