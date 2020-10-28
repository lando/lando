<template>
  <div id="allies" class="smaller-inner">
    <h4 class="strikethrough">allies</h4>
    <div class="sponsor-ally-block" v-for="(ally, index) in allies" :key="index">
      <a :href="ally.url" target="_blank">
        <div class="sponsor-ally-block-image"><img :src="ally.logo" :alt="ally.name"></div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      allies: [],
    };
  },
  mounted() {
    this.allies = this.$sponsors.filter(sponsor => sponsor.type == 'ally');
  },
};
</script>

<style lang="stylus">
#allies
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
  .sponsor-ally-block
    min-width: 100px
    max-width: 20%
    display: inline-block
    vertical-align: middle
    box-sizing: border-box
  .sponsor-ally-block-image
    img
      margin: 0
      width: 75px
      filter: grayscale(1)
  .strikethrough
    &:before, &:after
      top: 0.4em
#allies:hover
  .sponsor-ally-block-image
    img
      filter: grayscale(0)
@media (max-width: $MQMobile)
  #allies
    text-align: center
    width: 80%
    .sponsor-ally-block
      padding-top: 3em
      max-width: 50%
@media (max-width: $MQMobileNarrow)
  #allies
    .sponsor-ally-block
      padding-top: 1em
      padding-bottom: 0
      width: 33%
    .sponsor-ally-block-image
      img
        margin: 0
        padding: .5em
        width: 50px
</style>
