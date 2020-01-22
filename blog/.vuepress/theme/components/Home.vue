<template>
  <div class="blog-home">
    <div class="home-header">
      <h1>Welcome to a liberating blog by and for professional developers</h1>
      <div class="home-header-byline">
        We share things about tech, DevOps, workflows and doing the developments with but not limited to Lando.
      </div>
    </div>
    <Newsletter />
  </div>
</template>

<script>
import Newsletter from './../components/Newsletter.vue';
// We load the below basically just to get styles we need
import NewsletterStyles from '@parent-theme/components/Newsletter.vue';

export default {
  components: {Newsletter, NewsletterStyles}, // eslint-disable-line
  mounted() {
    console.log(this);
  },
  computed: {
    isHome() {
      return true;
    },
  },
};
</script>

<style lang="stylus">
.blog-home
  h1
    font-size: 3.14em
  .home-header
    border-bottom: 1px dashed #ccc
  .home-header-byline
    font-size: 1.8em
    letter-spacing: 0px
    font-family: PT Serif, Serif
    color: lighten($landoGrey, 20%)
    padding-bottom: 2em
</style>
