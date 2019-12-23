<template>
  <div
      class="theme-container"
      :class="pageClasses"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
  >
    <Navbar
        v-if="shouldShowNavbar"
        @toggle-sidebar="toggleSidebar"
    />

    <Home v-if="$page.frontmatter.home" />

    <Page
        v-else
        :sidebar-items="sidebarItems"
    >
      <template #top>
        <slot name="page-top" />
      </template>
      <template #bottom>
        <slot name="page-bottom" />
      </template>
    </Page>
  </div>
</template>

<script>
  import Home from '@parent-theme/components/Home.vue'
  import Navbar from '@parent-theme/components/Navbar.vue'
  import Page from '@parent-theme/components/Page.vue'

  export default {
    name: 'Layout',

    components: {
      Home,
      Page,
      Navbar
    },

    computed: {
      shouldShowNavbar () {
        const { themeConfig } = this.$site
        const { frontmatter } = this.$page
        if (
            frontmatter.navbar === false
            || themeConfig.navbar === false) {
          return false
        }
        return (
            this.$title
            || themeConfig.logo
            || themeConfig.repo
            || themeConfig.nav
            || this.$themeLocaleConfig.nav
        )
      },

      pageClasses () {
        const userPageClass = this.$page.frontmatter.pageClass
        return [
          {
            'no-navbar': !this.shouldShowNavbar,
            'sidebar-open': this.isSidebarOpen,
            'no-sidebar': !this.shouldShowSidebar
          },
          userPageClass
        ]
      }
    },

    methods: {
      // side swipe
      onTouchStart (e) {
        this.touchStart = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY
        }
      },

      onTouchEnd (e) {
        const dx = e.changedTouches[0].clientX - this.touchStart.x
        const dy = e.changedTouches[0].clientY - this.touchStart.y
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
          if (dx > 0 && this.touchStart.x <= 80) {
            this.toggleSidebar(true)
          } else {
            this.toggleSidebar(false)
          }
        }
      }
    }
  }
</script>
