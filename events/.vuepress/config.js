const webpack = require('webpack');

module.exports = {
  title: 'Lando Events and Meetups',
  description: 'A list of liberating events and meetups.',
  configureWebpack: config => {
    return {plugins: [
      new webpack.EnvironmentPlugin({
        LANDO_API: process.env.LANDO_API || 'https://api.lando.dev',
        LANDO_GOOGLE_API_KEY: process.env.LANDP_GOOGLE_API_KEY,
      }),
    ]};
  },
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
    ['link', {rel: 'stylesheet', href: '/styles/overrides.css'}],
    ['link', {rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Poppins:700|Source+Sans+Pro&display=swap'}],
    ['script', {src: '//js.hs-scripts.com/6478338.js'}],
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
