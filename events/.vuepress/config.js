const webpack = require('webpack');

module.exports = {
  title: 'Lando Events and Meetups',
  description: 'A list of liberating events and meetups.',
  configureWebpack: config => {
    return {plugins: [
      new webpack.EnvironmentPlugin({
        LANDO_API: process.env.LANDO_API || 'https://api.lando.dev',
        LANDO_GOOGLE_API_KEY: process.env.LANDO_GOOGLE_API_KEY,
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
        ga: 'UA-74237404-7',
      },
    ],
    ['autometa',
      {
        site: {
          name: 'Lando',
          twitter: 'devwithlando',
        },
        canonical_base: 'https://events.lando.dev',
        image: 'https://lando.dev/images/logo-pink-medium.png',
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
};
