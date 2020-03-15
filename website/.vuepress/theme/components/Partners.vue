<template>
  <div id="partners" class="smaller-inner">
    <h4 class="strikethrough">key<br />partners</h4>
    <div class="sponsor-partner-block" v-for="(partner, index) in partners" :key="index">
      <a :href="partner.url" target="_blank">
        <div class="sponsor-partner-block-image"><img :src="partner.logo" :alt="partner.name"></div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      partners: [],
    };
  },
  mounted() {
    this.$api.get('/v1/sponsors/partner').then(response => {
      this.partners = response.data || [];
    })
    .catch(error => {
      console.error(error);
    });
  },
};
</script>

<style lang="stylus">
#partners
  padding-top: 4em
  padding-bottom: 4em
  h4
    font-family: "Poppins", "Helvetica Neue", Arial, sans-serif
    font-size: 2em
    line-height: .8em
    color: lighten($landoBlue, 20%)
    padding-bottom: 1em
  &.smaller-inner
    max-width: 700px
    margin: auto
  .sponsor-partner-block
    min-width: 120px
    max-width: 25%
    display: inline-block
    vertical-align: middle
    box-sizing: border-box
  .sponsor-partner-block-image
    img
      margin: 0
      width: 125px
      filter: grayscale(1)
  .strikethrough
    &:before, &:after
      border-top: 1px solid lighten($landoGrey, 85%)
#partners:hover
  .sponsor-partner-block-image
    img
      filter: grayscale(0)
@media (max-width: $MQMobile)
  #partners
    padding-top: 1em
    padding-bottom: 1em
    text-align: center
    width: 80%
    .sponsor-partner-block
      padding-top: 3em
      max-width: 33%
      content-align: middle
@media (max-width: $MQMobileNarrow)
  #partners
    .sponsor-partner-block
      padding-top: 1em
      padding-bottom: 0
      width: 40%
    .sponsor-partner-block-image
      img
        margin: 0
        padding: .5em
        width: 100px
</style>
