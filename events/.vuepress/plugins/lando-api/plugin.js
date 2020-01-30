module.exports = (options = {}, context) => ({
  name: 'lando-api-plugin',
  extendPageData($page) {
    $page.apiUrl = (context.isProd) ? 'https://api.lando.dev' : 'https://api.lndo.site';
  },
});
