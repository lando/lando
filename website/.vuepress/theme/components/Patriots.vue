<template>
  <div id="patriots">
    <div class="sponsor-patriot-block-header">
      <h4>Hero<br />Patriots</h4>
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
  data() {
    return {
      patriots: [],
    };
  },
  mounted() {
    this.patriots = this.$page.sponsors.patriots;
    console.log(this);
  },
};
</script>

<style lang="stylus">
#patriots
  padding-top: 4em
  padding-bottom: 4em
  .sponsor-patriot-block
    max-width: 25%
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
    padding: 0em 1em;
  .sponsor-patriot-block-header
    max-width: 25%
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
    padding: 4em 2em;
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
      width: 125px
      height: 125px
@media (max-width: $MQMobile)
  #patriots
    text-align: center
    .sponsor-patriot-block-header
      display: block
      margin: auto
      max-width: 250px
    .sponsor-patriot-block
      padding-top: 3em
      max-width: 33%
      content-align: middle;
@media (max-width: $MQMobileNarrow)
  #patriots
    .sponsor-patriot-block-header
      h4
        font-size: 2em
    .sponsor-patriot-block
      padding-top: 1em
      padding-bottom: 0
      max-width: 90%
      content-align: middle;
    .sponsor-patriot-block-image
      img
        margin: 0
        width: 200px
        height: auto
</style>
