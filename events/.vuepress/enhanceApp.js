import axios from 'axios';
import * as VueGoogleMaps from 'vue2-google-maps';

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
              return (base = process.env.LANDO_API) => axios.create({baseURL: base});
            },
          },
        });
      },
    });
  }
  Vue.use(VueGoogleMaps, {
    load: {
      key: process.env.LANDO_GOOGLE_API_KEY,
      libraries: 'places',
    },
  });
};
