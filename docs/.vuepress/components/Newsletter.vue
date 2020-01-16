<template>
  <div class="guide-subscribe">
    <Subscribe
      buttonLabel="Sign me up!"
      successMessage="More awesome guide material will be heading your way!"
      title="Want to get informed of new guide content? Then sign up!" />
    </div>
</template>

<script>
import Subscribe from '@theme/components/Subscribe.vue';

export default {
  name: 'Newsletter',
  components: {Subscribe},
};
</script>

<style lang="stylus">
.guide-subscribe
  .subscribe
    h3
      color: $landoBlue
      font-size: 3em
  input.button
    text-align: center
    color: #fff
    box-sizing: border-box
    padding: 10px 20px
    margin-bottom: 1em
    height: 50px
    border-radius: 50px
    font-size: 16px
</style>
