<template>
  <div class="written-by">
    Written by:
    <a :href="link" target="_blank">{{ name }}</a>
    <a :href="link" target="_blank"><img :src="pic" :alt="name" /></a>
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
  },
};
</script>

<style lang="stylus">
.written-by
  font-size: .85em
  padding-bottom: 1rem
  border-bottom: 1px dotted #ddd
  img
    width: 24px
    border-radius: 100%
    float: right
    position: relative
    bottom: 6px
</style>
