import axios from 'axios';
import * as VueGoogleMaps from 'vue2-google-maps'
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
              return (base = 'https://api.lando.dev') => axios.create({baseURL: base});
            },
          },
        });
      },
    });
  }
  Vue.use(VueGoogleMaps, {
    load: {
      key: 'AIzaSyCVn7jO9AOE6vSEZMd_sI8zneL2WZ8-XB4',
      libraries: 'places',
    },
  });
};
