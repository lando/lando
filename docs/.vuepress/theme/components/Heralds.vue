<template>
  <div id="heralds" class="smaller-inner">
    <h4 class="strikethrough">heralds</h4>
    <div class="sponsor-herald-block">
      <span v-for="(herald, index) in heralds" :key="index" class="sponsor-herald">
        <a :href="herald.url" target="_blank">{{ herald.name }}</a>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      heralds: [],
    };
  },
  mounted() {
    this.heralds = this.$sponsors.filter(sponsor => sponsor.type == 'herald');
  },
};
</script>

<style lang="stylus">
#heralds
  padding-top: 4em
  padding-bottom: 4em
  line-height 3
  text-align: justify
  h4
    font-family: "Poppins", "Helvetica Neue", Arial, sans-serif
    font-size: 2em
    line-height: .8em
    color: lighten($landoBlue, 20%)
    padding-bottom: 1em
  a
    color: lighten($landoGrey, 20%)
    font-weight: 800
    font-size: 1.2em
    &:after
      content: ', '
  a:hover
    color: lighten($landoPink, 20%)
  .sponsor-herald:last-child
    a
      &:after
        content: ''
  &.smaller-inner
    max-width: 700px
    margin: auto
  .strikethrough
    &:before, &:after
      top: 0.4em
@media (max-width: $MQMobile)
  #heralds
    width: 80%
@media (max-width: $MQMobileNarrow)
  #heralds
    text-align: center
</style>
