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

    <div id="hero">
      <div class="inner">
        <div class="left">
          <img class="hero-logo" v-if="data.heroImage" :src="$withBase(data.heroImage)" :alt="data.heroAlt || 'lando logo'">
        </div>
        <div class="right">
          <h2 class="hide">Lando</h2>
          <h1>A Liberating Dev Tool<br/> For All Your Projects</h1>
          <div class="byline">
            <p>{{ data.byline }}</p>
          </div>
          <p>
            <a class="button white" href="/download/">GET LANDO!</a>
            <a class="button" href="/memberships/">JOIN THE ALLIANCE</a>
          </p>
        </div>
      </div>
    </div>

    <div id="features" v-if="data.features && data.features.length">
      <div class="inner">
        <div class="point" v-for="(feature, index) in data.features" :key="index">
          <h2>{{ feature.title }}</h2>
          <p>{{ feature.details }}</p>
        </div>
      </div>
    </div>

    <Newsletter />
    <MadeByTandem />
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
.lando-front
  header.navbar
   .logo
      display: none
  #hero
    padding: 160px 40px 100px
    background-color: $accentColor
    .inner
      max-width: 1260px;
      margin: 0 auto
    .left, .right
      display: inline-block
      vertical-align: top
    .left
      width: 38%
    .right
      width: 60%
    .hero-logo
      width: 311px
      height: 311px
      float: right
      margin-right: 60px
    h1
      font-weight: 200
      margin: 0
      font-size: 3.2em
      color: lighten($accentColor, 75%)
    h2
      font-family: "Dosis", "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
      font-weight: 500
      font-size: 2.4em
      margin: 0 0 10px
      display: none
    .button
      margin: 1em 0
      font-size: 1em
      font-weight: 500
      letter-spacing: .05em
      min-width: 8em
      text-align: center
      &:not(:last-child)
        margin-right: 1%
    .social-buttons
      list-style-type: none
      padding: 0
      li
        display: inline-block
        vertical-align: middle
        margin-right: 15px
    .byline
      color: lighten($accentColor, 80%)
      font-weight: 600
      font-size: 1.5rem
  #features
    background-color: #fff
    padding-bottom: 70px
    .inner
      max-width: 900px;
      margin: 0 auto
      text-align: center
    .point
      width: 40%
      display: inline-block
      vertical-align: top
      box-sizing: border-box
      padding: 0 2em
      h2
        color: lighten($accentColor, 18%)
        font-size: 1.5em
        font-weight: 400
        margin: 0
        padding: .5em 0
        border: 0
      p
        font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
        font-size: 1em
        word-spacing: 0.05em
        color: #4f5959
        line-height: 1.4
        margin-block-start: 1em
        margin-block-end: 1em
        margin-inline-start: 0px
        margin-inline-end: 0px
@media (max-width: $MQMobile)
  .lando-front
    #hero
      padding: 40px 40px 30px
      .hero-logo
        float: none
        margin: 30px 0 15px
        width: 140px
        height: 140px
      .left, .right
        text-align: center
        width: 100%
      h1
        font-size: 2em
      h2
        display: block
        color: lighten($accentColor, 70%)
        border: 0;
      .button
        font-size: .9em
    #features
      .point
        display: block
        margin: 0 auto
        width: 300px
        padding: 0 40px 30px
        &:before
          content: "—"
          color: $green
@media (max-width: $MQMobileNarrow)
  .lando-home
    padding-left 1.5rem
    padding-right 1.5rem
</style>
