<template>
  <div id="current-team" class="current-team-wrapper">
    <TeamMember v-for="(member, index) in members" :key="index" :member="member" />
  </div>
</template>

<script>
import TeamMember from '@theme/components/TeamMember.vue';

export default {
  name: 'TeamList',
  components: {TeamMember},
  data() {
    return {
      members: [],
    };
  },
  mounted() {
    this.members = this.$contributors;
  },
};
</script>

<style lang="stylus">
.current-team
  .current-team-wrapper
    max-width: 740px
    margin: 0 auto
    padding: 0rem 2.5rem
    padding-top: 3.75rem
    padding-bottom: 1rem
  .theme-default-content
    max-width: 740px
    margin: 0 auto
    padding: 0rem 2.5rem
    &:not(.custom) > *:first-child
      margin-top: 0px
</style>
