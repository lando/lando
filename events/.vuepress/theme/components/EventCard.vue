<template>
  <div class="event-card">
    <h2>{{ name }}</h2>
    <div class="event-details">
      at <NavigationIcon /> {{ location }}
      on <ClockIcon /> {{ resolvedDate }}
    </div>

    <div class="event-summary">
      {{ summary }}
    </div>

    <div class="event-presenter">
      featuring <a :href="presenterLink" target="_blank">{{ presenter }}</a>
      <a :href="presenterLink" target="_blank"><img :src="presenterPic" :alt="presenter" /></a>
    </div>
    <div class="event-link">
      <a :href="link" target="_blank">Click for event details</a>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import {ClockIcon, NavigationIcon} from 'vue-feather-icons';

export default {
  components: {ClockIcon, NavigationIcon},
  name: 'EventCard',
  props: {
    date: {
      type: String,
    },
    link: {
      type: String,
    },
    location: {
      type: String,
    },
    name: {
      type: String,
    },
    presenter: {
      type: String,
      default: 'Team Lando',
    },
    presenterPic: {
      type: String,
      default: 'https://www.gravatar.com/avatar/db2470075fb67c330c155cab9698826f',
    },
    presenterLink: {
      type: String,
      default: 'https://twitter.com/devwithlando',
    },
    summary: {
      type: String,
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
.event-card
  font-size .85em
  padding 1rem
  border-bottom 1px dotted #ddd
  .event-summary
    padding-top 1em
    padding-bottom 1em
    font-size 1.1em
    text-color black
  .event-link
    padding-top 1em
  h2
    margin 0
  img
    width 24px
    border-radius 100%
    float right
    position relative
    bottom 6px
  svg
    width 14px
    height 14px
    color lighten($landoBlue, 50%)
    position relative
    top 3px
    margin-left 3px
    margin-right 3px
@media (max-width: $MQMapless)
  .event-card
    padding-left 0
    padding-right 0
</style>
