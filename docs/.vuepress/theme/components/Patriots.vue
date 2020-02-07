<template>
  <div id="patriots">
    <div v-if="!hideHeader" class="sponsor-patriot-block-header">
      <h4>hero<br />patriots</h4>
    </div>
    <div class="sponsor-patriot-block" v-for="(patriot, index) in patriots" :key="index">
      <a :href="patriot.url" target="_blank">
        <div class="sponsor-patriot-block-image"><img :src="patriot.logo" :alt="patriot.name"></div>
      </a>
    </div>
  </div>
</template>


<script>
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
    this.$api.get('/v1/sponsors/patriot').then(response => {
      this.patriots = response.data || [];
    })
    .catch(error => {
      console.error(error);
    });
  },
};
</script>

<style lang="stylus">
#patriots
  padding-top: 4em
  text-align: center
  .sponsor-patriot-block
    max-width: 33%
    display: inline-block
    vertical-align: middle
    box-sizing: border-box
    padding: 2em 1em
  .sponsor-patriot-block-header
    display: block
    margin: auto
    max-width: 250px
    padding: 2em 1em
    background-color: $landoBlue
    text-align: right
    h4
      font-family: "Poppins", "Helvetica Neue", Arial, sans-serif
      font-size: 2.5em
      line-height: .8em
      color: white
  .sponsor-patriot-block-image
    img
      margin: 0
      width: 200px
@media (max-width: $MQMobile)
  #patriots
    text-align: center
    .sponsor-patriot-block-header
      display: block
      margin: auto
      max-width: 250px
      padding: 2em 2em
    .sponsor-patriot-block
      padding-top: 3em
      max-width: 33%
@media (max-width: $MQMobileNarrow)
  #patriots
    .sponsor-patriot-block-header
      h4
        font-size: 2em
    .sponsor-patriot-block
      padding-top: 1em
      padding-bottom: 0
      max-width: 90%
    .sponsor-patriot-block-image
      img
        margin: 0
        width: 200px
</style>
