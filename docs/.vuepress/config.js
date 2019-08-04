module.exports = {
  title: 'Lando',
  description: 'An ancient codex to power agency-incubators that are magical to work at and with.',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'stylesheet', href: '/styles/overrides.css'}],
  ],
  themeConfig: {
    repo: 'lando/lando',
    repoLabel: 'GitHub',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Is this doc out of date? Is there something to make it better? Suggest a change!',
    nav: [
      { text: 'Getting Started', link: '/basics/' },
    ],
    sidebar: {
      '/basics/': [
        {
          title: 'Getting Started',
          collapsable: false,
          children: [
            '',
            'basics',
            'installation',
            'first-app',
            'uninstalling',
          ],
        },
        {
          title: 'Usage',
          collapsable: false,
          children: [
            'usage',
            'config',
            'destroy',
            'init',
            'info',
            'list',
            'logs',
            'poweroff',
            'rebuild',
            'restart',
            'share',
            'ssh',
            'start',
            'stop',
            'version',
          ],
        },
      ],
    },
  },
}
