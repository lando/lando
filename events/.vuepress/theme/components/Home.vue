<template>
  <main
      class="home"
      aria-labelledby="main-title"
  >

    <Content class="theme-default-content custom" />

    <Map />

    <div
        v-if="data.footer"
        class="footer"
    >
      {{ data.footer }}
    </div>
  </main>
</template>

<script>
  import Map from '@theme/components/Map.vue';

  export default {
    name: 'Home',

    components: {Map},

    computed: {
      data() {
        return this.$page.frontmatter;
      },
    },
  };
</script>

<style lang="stylus">
  .home
    padding $navbarHeight 2rem 0
    max-width 960px
    margin 0px auto
    display block
    .footer
      padding 2.5rem
      border-top 1px solid $borderColor
      text-align center
      color lighten($textColor, 25%)

  @media (max-width: $MQMobileNarrow)
    .home
      padding-left 1.5rem
      padding-right 1.5rem
</style>
