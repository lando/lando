<template>
  <Subscribe title="Holla" />
</template>

<script>
import Subscribe from '@theme/components/Subscribe.vue';

export default {
  name: 'Newsletter',
  components: {Subscribe},
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
