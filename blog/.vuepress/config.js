const webpack = require('webpack');

module.exports = {
  title: 'Landob.log',
  description: 'A liberating blog by and for professional developers. We share things about tech, DevOps and development using but not limited to Lando.',
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
          title: 'Home',
          id: 'posts',
          dirname: 'posts',
          path: '/',
        },
      ],
      feed: {
        canonical_base: 'https://blog.lando.dev',
        feed_options: {
          favicon: 'https://lando.dev/favicon.ico',
          image: 'https://lando.dev/images/logo-pink-small.png',
        },
      },
      frontmatters: [
        {
          id: 'tag',
          keys: ['tag', 'tags'],
          path: '/tag/',
          frontmatter: {title: 'Tag'},
          pagination: {
            lengthPerPage: 25,
          },
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
      image: 'https://lando.dev/images/logo-pink-medium.png',
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
        text: 'Case Studies',
        link: '/tag/case-study/',
      },
        {
        text: 'Development',
        link: '/tag/development/',
      },
      {
        text: 'DevOps',
        link: '/tag/devops/',
      },
      {
        text: 'Workflows',
        link: '/tag/workflows/',
      },
      {
        text: 'Lando',
        link: '/tag/lando/',
      },
    ],
  },
};
