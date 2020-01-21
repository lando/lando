const webpack = require('webpack');

module.exports = {
  title: 'Lando',
  description: 'The liberating local development tool for all your projects.',
  configureWebpack: config => {
    return {plugins: [
      new webpack.EnvironmentPlugin({
        LANDO_API: process.env.LANDO_API || 'https://api.lando.dev',
      }),
    ]};
  },
  extraWatchFiles: [
    '.vuepress/guides.json',
  ],
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
    ['link', {rel: 'stylesheet', href: '/styles/overrides.css'}],
    ['link', {rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Poppins:700|Source+Sans+Pro&display=swap'}],
    ['script', {src: '//js.hs-scripts.com/6478338.js'}],
  ],
  plugins: {
    '@vuepress/google-analytics': {
      ga: 'UA-74237404-5',
    },
    'autometa': {
      site: {
        name: 'Lando',
        twitter: 'devwithlando',
      },
      canonical_base: 'https://docs.lando.dev',
    },
    'canonical': {
      baseURL: 'https://docs.lando.dev',
    },
    'feed': {
      image: 'https://docs.lando.dev/images/hero-pink.png',
      favicon: 'https://docs.lando.dev/favicon.ico',
      canonical_base: 'https://docs.lando.dev',
      posts_directories: [
        '/guides/',
      ],
      count: 100,
    },
    'robots': {
      host: 'https://docs.lando.dev',
      sitemap: '/sitemap.xml',
    },
    'sitemap': {
      hostname: 'https://docs.lando.dev',
      exclude: ['/404.html'],
    },
  },
  themeConfig: {
    docsDir: 'blog',
    docsBranch: 'master',
    logo: '/images/logo-small-white.png',
    search: false,
    editLinks: false,
  },
};
