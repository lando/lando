<template>
  <div class="theme-container" :class="pageClasses" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar"/>

    <div class="sidebar-mask" @click="toggleSidebar(false)"></div>

    <Sidebar
      :items="sidebarItems"
      @toggle-sidebar="toggleSidebar">
      <slot
        name="sidebar-top"
        slot="top"/>
      <slot
        name="sidebar-bottom"
        slot="bottom"/>
    </Sidebar>

    <div id="memberships">
      <div class="inner">
        <div class="memberships membership-section">
          <div class="member-section"><Content/></div>
          <a class="button" href="https://www.patreon.com/devwithlando">SUPPORT LANDO. JOIN THE ALLIANCE.</a>
        </div>
      </div>
    </div>

    <MadeByTandem />
    <Newsletter />
    <Footer/>
  </div>
</template>

<script>
// Core components and things
import Navbar from '@theme/components/Navbar.vue';
import Sidebar from '@theme/components/Sidebar.vue';
import {resolveSidebarItems} from '@theme/util';

// Lando components
import MadeByTandem from './MadeByTandem';
import Newsletter from './Newsletter';
import Footer from './Footer';
export default {
  components: {Sidebar, Navbar, MadeByTandem, Newsletter, Footer},
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
.lando-memberships
  #memberships
    background-color: #fff
    padding-bottom: 70px
    padding-top: 4em
    .button
      background-color: $landoPink
      font-size: 2em
      margin-top: 3em
    .inner
      max-width: 900px;
      margin: 0 auto
      text-align: center
      padding: 0 1.5em;
    h1, h2
      color: lighten($landoBlue, 18%)
      font-family: "Dosis", "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
      font-size: 3.5em
      font-weight: 400
      margin: 0
      padding: 1.5em 0 0
      border: 0
    p
      font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
      font-size: 1.5em
      word-spacing: 10px
      font-style: normal
      word-spacing: 0.05em
      line-height: 1.4
      margin-block-start: 1em
      margin-block-end: 1em
      margin-inline-start: 0px
      margin-inline-end: 0px
      padding-bottom: 2em
    .point,
    .benefits
      width: 33%
      display: inline-block
      vertical-align: top
      box-sizing: border-box
      padding: 1em 2em
      h3
        color: lighten($landoPink, 33%)
        font-size: 1.5em
        font-weight: 500
        margin: 0
        padding: .5em 0
        border: 0
      p
        font-style: normal
        font-weight: 500
        font-size: 1.1em
        padding-bottom: 0
    .benefits
      h3
        color: $landoGreen
    .learn-more
      font-size: 1.5em
      a
        font-style: italic
  #news
    background-color: darken($landoBlue, 12%)
    padding: 2em 0
    h3
      font-size: 1.5em
      a
        color: lighten($landoGrey, 75%)
  #made-by
    padding: 7em 0
    margin: 0
@media (max-width: $MQMobile)
  .lando-memberships
    #memberships
      .point,
      .benefits
        width: 90%
        display: inline-block
        vertical-align: top
        box-sizing: border-box
        padding: 0 2em
        h3
          padding-top: 2em
          font-size: 2em
        p
          font-size: 1.2em
        .tech-icon
          font-size: 128px
        &:after
          content: "________"
          color: $landoPink
      .benefits
        &:after
          content: "________"
          color: $landoGreen
      .button
        background-color: $landoPink
        font-size: 1.5em
</style>
