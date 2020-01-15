<template>
  <ParentLayout class="current-team">
    <CarbonAds slot="sidebar-top"/>
    <div id="current-team" class="current-team-wrapper" slot="page-top">
      <h1>Current Team</h1>
      <p>
        Meet the team that makes Lando the best local dev and DevOps tool in the Galaxy.
      </p>
      <div class="current-team-member" v-for="(member, index) in members" :key="index">
        <TeamMember :member="member" />
      </div>
    </div>
  </ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue';
import CarbonAds from '@theme/components/CarbonAds.vue';
import TeamMember from '@theme/components/TeamMember.vue';
export default {
  components: {CarbonAds, ParentLayout, TeamMember},
  data() {
    return {
      members: [],
    };
  },
  mounted() {
    this.$api(this.$page.apiUrl).get('/v1/contributors').then(response => {
      this.members = response.data || [];
    })
    .catch(error => {
      console.error(error);
    });
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
