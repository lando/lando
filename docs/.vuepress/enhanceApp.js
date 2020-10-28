/*
 * Use this file to augment vuepress with other vue-y things
 */
export default ({ Vue, options, router, siteData }) => { // eslint-disable-line
  if (typeof process === 'undefined') {
    Vue.use({
      install(Vue) {
        Object.defineProperties(Vue.prototype, {
          $contributors: {
            get() {
              return require('./public/api/contributors.json');
            },
          },
          $sponsors: {
            get() {
              return require('./public/api/sponsors.json');
            },
          },
        });
      },
    });
  }
};
