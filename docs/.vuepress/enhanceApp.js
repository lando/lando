// Get our sponsors
import sponsors from './sponsors.js';

/*
 * Use this file to augment vuepress with other vue-y things
 */
export default ({ Vue, options, router, siteData }) => { // eslint-disable-line
  // @TODO: ultimately we want to serve these from some API endpoint so we can
  // surface them across properties from hubspot without a ton of overhead
  siteData.pages.forEach(page => {
    page.sponsors = sponsors;
  });
};
