module.exports = {
  title: 'Lando',
  description: 'The liberating local development tool for all your projects.',
  extraWatchFiles: [
    '.vuepress/plugins/lando-api/plugin.js',
  ],
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
    ['link', {rel: 'stylesheet', href: '/styles/overrides.css'}],
    ['link', {rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Poppins:700|Source+Sans+Pro&display=swap'}],
    ['script', {src: '//js.hs-scripts.com/6478338.js'}],
    ['script', {src: '//js.hsforms.net/forms/shell.js'}],
  ],
  plugins: [
    ['@vuepress/google-analytics',
      {
        ga: 'UA-74237404-5',
      },
    ],
    ['autometa',
      {
        site: {
          name: 'Lando',
          twitter: 'devwithlando',
        },
        canonical_base: 'https://events.lando.dev',
      },
    ],
    ['canonical',
      {
        baseURL: 'https://events.lando.dev',
      },
    ],
    [require('./plugins/lando-api/plugin.js')],
    ['robots',
      {
        host: 'https://events.lando.dev',
        sitemap: '/sitemap.xml',
      },
    ],
    ['sitemap',
      {
        hostname: 'https://events.lando.dev',
        exclude: ['/404.html'],
      },
    ],
  ],
  themeConfig: {
    algolia: {
      apiKey: '15e332850128e9ec96929f44c62f6c88',
      indexName: 'lando',
      // uncomment the below to make styling inspection easier
      // debug: true,
    },
    docsDir: 'events',
    docsBranch: 'master',
    logo: '/images/logo-small-white.png',
    editLinks: false,
  },
};
