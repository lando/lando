module.exports = (options = {}, context) => ({
  name: 'lando-api-plugin',
  extendPageData($page) {
    // @TODO: not sure why the below doesnt work?
    // $page.apiUrl = (context.isProd) ? 'https://api.lando.dev' : 'https://api.lndo.site';
    $page.apiUrl = (!process.env.WEBPACK_DEV_SERVER) ? 'https://api.lando.dev' : 'https://api.lndo.site';
  },
});
