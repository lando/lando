<template>
  <div id="special_sponsors">
    <h4>special sponsors</h4>
    <div class="special-sponsor-block" v-for="(patriot, index) in patriots" :key="index">
      <a :href="patriot.url" target="_blank">
        <div class="special-sponsor-image"><img :src="patriot.logo" :alt="patriot.name"></div>
      </a>
    </div>
    <div class="special-sponsor-footer">
      <a href="https://lando.dev/sponsor" target="_blank">become a sponsor</a>
    </div>
  </div>
</template>


<script>
import {filter} from 'lodash';
import sponsors from './../../public/api/sponsors.json';

export default {
  props: {
    hideHeader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      patriots: [],
    };
  },
  mounted() {
    this.patriots = filter(sponsors, sponsor => {
      return sponsor.type == 'patriot';
    });
  },
};
</script>

<style lang="stylus">
#special_sponsors
  padding 3em
  position absolute
  right 2em
  top 6em
  width 150px
  background white
  opacity .75
  text-align center
  font-size .8em
  .special-sponsor-block
    img
      width 100px
      padding-bottom 2em

@media (max-width: 1300px)
  #special_sponsors
    display none
</style>
