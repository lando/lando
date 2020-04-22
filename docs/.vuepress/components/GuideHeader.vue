<template>
  <div class="written-by">
    Written by:
    <a :href="link" target="_blank">{{ name }}</a>
    <a :href="link" target="_blank"><img :src="pic" :alt="name" /></a>
    <div v-if="test" class="tested-by">
      Guide Tested: <a :href="test" target="_blank">Yes</a>
    </div>
    <div v-else>
      Guide Tested: <span class="not-tested">No</span>
    </div>
  </div>

</template>

<script>
export default {
  name: 'GuideHeader',
  props: {
    name: {
      type: String,
      default: 'Team Lando',
    },
    pic: {
      type: String,
      default: 'https://www.gravatar.com/avatar/db2470075fb67c330c155cab9698826f',
    },
    link: {
      type: String,
      default: 'https://twitter.com/devwithlando',
    },
    test: {
      type: String,
      default: null,
    },
  },
};
</script>

<style lang="stylus">
.written-by
  font-size .85em
  padding-bottom 1rem
  border-bottom 1px dotted #ddd
  img
    width 24px
    border-radius 100%
    float right
    position relative
    bottom 6px
  .tested-by
    a
      color #2ecc71
  .not-tested
    color red
</style>
