import axios from 'axios';

/*
 * Use this file to augment vuepress with other vue-y things
 */
export default ({ Vue, options, router, siteData }) => { // eslint-disable-line
  if (typeof process === 'undefined') {
    Vue.use({
      install(Vue) {
        Object.defineProperties(Vue.prototype, {
          $api: {
            get() {
              return axios.create({baseURL: process.env.LANDO_API});
            },
          },
        });
      },
    });
  }
};
