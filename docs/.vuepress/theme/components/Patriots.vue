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
    this.patriots = this.$sponsors.filter(sponsor => sponsor.type == 'patriot');
  },
};
</script>

<style lang="stylus">
#patriots
  padding-top: 4em
  text-align: center
  display: flex
  flex-wrap: wrap
  .sponsor-patriot-block
    display: inline-flex
    box-sizing: border-box
    padding: 2em 1em
    flex: 3
    align-items: center
    justify-content: center
  .sponsor-patriot-block-header
    display: block
    margin: auto
    padding: 2em 1em
    background-color: #035785
    text-align: right
    margin: auto
    flex: 0 0 100%
    h4
      font-family: "Poppins", "Helvetica Neue", Arial, sans-serif
      font-size: 2.5em
      line-height: .8em
      color: white
  .sponsor-patriot-block-image
    img
      margin: 0
      max-height: 150px
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
        max-height: none
</style>
