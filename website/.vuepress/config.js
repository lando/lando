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
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
    ['link', {rel: 'stylesheet', href: '/styles/overrides.css'}],
    ['link', {rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Poppins:700|Source+Sans+Pro&display=swap'}],
    ['link', {rel: 'stylesheet', href: '//cdn.rawgit.com/konpa/devicon/df6431e323547add1b4cf45992913f15286456d3/devicon.min.css'}],
    ['link', {rel: 'stylesheet', href: '//cdn.jsdelivr.net/devicons/1.8.0/css/devicons.min.css'}],
    ['script', {src: '//js.hs-scripts.com/6478338.js'}],
  ],
  plugins: {
    '@vuepress/google-analytics': {
      ga: 'UA-74237404-3',
    },
    'autometa': {
      site: {
        name: 'Lando',
        twitter: 'devwithlando',
      },
      canonical_base: 'https://lando.dev',
      image: 'https://lando.dev/images/logo-pink-medium.png',
    },
    'canonical': {
      baseURL: 'https://lando.dev',
    },
    'robots': {
      host: 'https://lando.dev',
      sitemap: '/sitemap.xml',
      policies: [
        {
          userAgent: '*',
          disallow: [
            '/alliance/thanks',
            '/info/',
            '/sponsor/ally/',
            '/sponsor/herald/',
            '/sponsor/hero/',
            '/sponsor/partner/',
            '/sponsor/patriot/',
            '/sponsor/subscribe/',
            '/sponsor/thanks/',
            '/thanks/',
          ],
        },
      ],
    },
    'sitemap': {
      hostname: 'https://lando.dev',
      exclude: [
        '/404.html',
        '/alliance/thanks',
        '/info/',
        '/sponsor/ally/',
        '/sponsor/herald/',
        '/sponsor/hero/',
        '/sponsor/partner/',
        '/sponsor/patriot/',
        '/sponsor/subscribe/',
        '/sponsor/thanks/',
        '/thanks/',
      ],
    },
  },
  themeConfig: {
    docsDir: 'website',
    docsBranch: 'master',
    logo: '/images/logo-small-white.png',
    search: false,
    editLinks: false,
    nav: [
      {text: 'Get Lando!', link: '/download/'},
      {text: 'Join The Alliance', link: '/alliance/join/'},
      {text: 'Sponsor', link: '/sponsor/'},
      {text: 'Documentation', link: 'https://docs.lando.dev'},
      {text: 'Blog', link: 'https://blog.lando.dev'},
      {text: 'Events & Meetups', link: 'https://events.lando.dev'},
      {text: 'Services & Support', link: '/contact/'},
    ],
  },
};
