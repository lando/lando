<template>
  <div class="written-by">
    <a :href="link" target="_blank">{{ name }}</a>
    from <NavigationIcon /> {{ location }}
    on <ClockIcon /> {{ resolvedDate }}
    <a :href="link" target="_blank"><img :src="pic" :alt="name" /></a>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import {ClockIcon, NavigationIcon} from 'vue-feather-icons';

export default {
  components: {ClockIcon, NavigationIcon},
  name: 'ArticleHeader',
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
    date: {
      type: String,
    },
    location: {
      type: String,
      default: 'The Internet',
    },
  },
  computed: {
    resolvedDate() {
      return dayjs(this.date).format(
        this.$themeConfig.dateFormat || 'ddd MMM DD YYYY'
      );
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
  svg
    width 14px
    height 14px
    color: lighten($landoBlue, 50%)
    position: relative
    top: 3px
    margin-left: 3px
    margin-right: 3px
</style>
