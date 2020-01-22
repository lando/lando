const webpack = require('webpack');

module.exports = {
  title: 'Landoblog',
  description: 'A liberating blog about DevOps, local development and Lando.',
  configureWebpack: config => {
    return {plugins: [
      new webpack.EnvironmentPlugin({
        LANDO_API: process.env.LANDO_API || 'https://api.lando.dev',
      }),
    ]};
  },
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
    ['link', {rel: 'stylesheet', href: '/styles/overrides.css'}],
    ['link', {rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Poppins:700|Source+Sans+Pro&display=swap'}],
    ['script', {src: '//js.hs-scripts.com/6478338.js'}],
  ],
  plugins: {
    '@vuepress/blog': {
      directories: [
        {
          id: 'post',
          dirname: 'articles',
          path: '/',
        },
      ],
      feed: {
       canonical_base: 'https://blog.lando.dev',
      },
      frontmatters: [
        {
          id: 'tag',
          keys: ['tag', 'tags'],
          path: '/tag/',
          frontmatter: {title: 'Tag'},
        },
      ],
      sitemap: {
        hostname: 'https://blog.lando.dev',
      },
    },
    '@vuepress/google-analytics': {
      ga: 'UA-74237404-6',
    },
    'autometa': {
      site: {
        name: 'Lando',
        twitter: 'devwithlando',
      },
      canonical_base: 'https://blog.lando.dev',
    },
    'robots': {
      host: 'https://blog.lando.dev',
      sitemap: '/sitemap.xml',
    },
  },
  theme: '@vuepress/theme-blog',
  themeConfig: {
    logo: '/images/logo-pink-small.png',
    docsDir: 'blog',
    docsBranch: 'master',
    search: false,
    editLinks: false,
    nav: [
      {
        text: 'Featured',
        link: '/tag/featured',
      },
      {
        text: 'Case Studies',
        link: '/tag/case-studies',
      },
      {
        text: 'DevOps',
        link: '/tag/devops',
      },
      {
        text: 'Lando',
        link: '/tag/lando',
      },
    ],
  },
};
