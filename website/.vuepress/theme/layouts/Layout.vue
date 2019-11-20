<template>
  <div class="theme-container" :class="pageClasses" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar"/>

    <div class="sidebar-mask" @click="toggleSidebar(false)"></div>

    <Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
      <template #top>
        <slot name="sidebar-top" />
      </template>
      <template #bottom>
        <slot name="sidebar-bottom"/>
      </template>
    </Sidebar>

    <Home v-if="$page.frontmatter.home"/>

    <Page v-else :sidebar-items="sidebarItems" id="content">
      <template #top>
        <slot name="page-top"/>
      </template>
      <template #bottom>
        <slot name="page-bottom"/>
      </template>
    </Page>

    <Footer />
  </div>
</template>

<script>
// Core components and things
import Home from '@theme/components/Home.vue';
import Navbar from '@theme/components/Navbar.vue';
import Page from '@parent-theme/components/Page.vue';
import Sidebar from '@theme/components/Sidebar.vue';
import {resolveSidebarItems} from '@parent-theme/util/index.js';

// Lando components
import Footer from '@theme/components/Footer';
export default {
  components: {Home, Footer, Navbar, Page, Sidebar},
  data() {
    return {
      isSidebarOpen: false,
      data: {},
    };
  },
  computed: {
    shouldShowNavbar() {
      const {themeConfig} = this.$site;
      const {frontmatter} = this.$page;
      if (
        frontmatter.navbar === false
        || themeConfig.navbar === false) {
        return false;
      }
      return (
        this.$title
        || themeConfig.logo
        || themeConfig.repo
        || themeConfig.nav
        || this.$themeLocaleConfig.nav
      );
    },
    shouldShowSidebar() {
      const {frontmatter} = this.$page;
      return (
        !frontmatter.home
        && frontmatter.sidebar !== false
        && this.sidebarItems.length
      );
    },
    sidebarItems() {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      );
    },
    pageClasses() {
      const userPageClass = this.$page.frontmatter.pageClass;
      return [
        {
          'no-navbar': !this.shouldShowNavbar,
          'sidebar-open': this.isSidebarOpen,
          'no-sidebar': !this.shouldShowSidebar,
        },
        userPageClass,
      ];
    },
  },
  mounted() {
    this.$router.afterEach(() => {
      this.isSidebarOpen = false;
    });
    this.data = this.$page.frontmatter;
  },
  methods: {
    toggleSidebar(to) {
      this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen;
    },
    // side swipe
    onTouchStart(e) {
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
    },
    onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true);
        } else {
          this.toggleSidebar(false);
        }
      }
    },
  },
};
</script>

<style lang="stylus">
#content
  img
    padding: 2em
  background-color: #fff
  padding-bottom: 70px
  padding-top: 4em
  .button
    background-color: $landoPink
    font-size: 1.2em
    margin: 2em 0
    &.big
      font-size: 2em
  .theme-default-content
    max-width: 900px;
    margin: 0 auto
    text-align: center
    padding: 0 1.5em;
@media (max-width: $MQMobile)
  #content
    .button
      &.big
        font-size: 1.5em
</style>
