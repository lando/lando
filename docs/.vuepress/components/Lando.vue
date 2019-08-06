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
          <h1>The Dev Tool<br/> For Every Project</h1>
          <p>
            <a class="button has-icon" href="/basics/">
              <svg aria-labelledby="simpleicons-play-icon" role="img" viewBox="0 0 100 125" fill="#FFFFFF"><title id="simpleicons-play-icon" lang="en">Play icon</title><path d="M50,3.8C24.5,3.8,3.8,24.5,3.8,50S24.5,96.2,50,96.2S96.2,75.5,96.2,50S75.5,3.8,50,3.8z M71.2,53.3l-30.8,18  c-0.6,0.4-1.3,0.5-1.9,0.5c-0.6,0-1.3-0.1-1.9-0.5c-1.2-0.6-1.9-1.9-1.9-3.3V32c0-1.4,0.8-2.7,1.9-3.3c1.2-0.6,2.7-0.6,3.8,0  l30.8,18c1.2,0.6,1.9,1.9,1.9,3.3S72.3,52.7,71.2,53.3z"></path></svg>
              GET STARTED</a>
            <a class="button white" href="/basics/" target="_blank">LEARN MORE</a>
            <a class="button gray has-icon" href="https://github.com/lando/lando" target="_blank">
              <svg aria-labelledby="simpleicons-github-dark-icon" lang="" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-github-icon" lang="en">GitHub Dark icon</title><path fill="#ffffff" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
              GITHUB</a>
          </p>
        </div>
      </div>
    </div>

    <div class="features" v-if="data.features && data.features.length">
      <div class="feature" v-for="(feature, index) in data.features" :key="index">
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.details }}</p>
      </div>
    </div>

    <div v-if="data.footer" id="footer">
      {{ data.footer }}
    </div>
  </div>
</template>

<script>
import Navbar from '@theme/components/Navbar.vue'
import Sidebar from '@theme/components/Sidebar.vue'
import { resolveSidebarItems } from '@theme/util'
export default {
  components: { Sidebar, Navbar },
  data () {
    return {
      isSidebarOpen: false,
      data: {},
    }
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
    shouldShowSidebar () {
      const { frontmatter } = this.$page
      return (
        !frontmatter.home
        && frontmatter.sidebar !== false
        && this.sidebarItems.length
      )
    },
    sidebarItems () {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
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
  mounted () {
    this.$router.afterEach(() => {
      this.isSidebarOpen = false
    })
    this.data = this.$page.frontmatter;
  },
  methods: {
    toggleSidebar (to) {
      this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen
    },
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

<style lang="stylus">
.lando-home
  a.button,
    input.button
      padding: 0.50em 2em
      border-radius: 2em
      display: inline-block
      color: #fff
      background-color: lighten($accentColor, 8%)
      transition: all .15s ease
      box-sizing: border-box
      border: 1px solid lighten($accentColor, 8%)
      &.has-icon
        position: relative
        text-indent: 1.4em;
        > svg
          position: absolute
          left: 0.4em
          top: 0.3em
          width: 2em
      &.white
        background-color: #fff
        color: $accentColor
      &.gray
        background-color: #4e6e8e
        color: $light
        border-color: #4e6e8e
  header
    background-color: #fff;
    height: 60px;
    padding: 10px 60px;
    position: relative;
    z-index: 100;
  header.navbar
    border: 0;
    .site-name
      font-size: 2.3em;
      top: 0px;
      left: 0px;
    .site-name:before
      content: ""
  #hero
    padding: 70px 40px 30px
    background-color: #fff
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
      width: 215px
      height: 215px
      float: right
      margin-right: 60px
    h1
      font-weight: 200
      margin: 0
      font-size: 3.2em
    h2
      font-family: "Dosis", "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
      font-weight: 500
      font-size: 2.4em
      margin: 0 0 10px
      display: none
    .button
      margin: 1em 0
      font-size: 1.05em
      font-weight: 600
      letter-spacing: .1em
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
  .features
    border-top 1px solid $borderColor
    padding 1.2rem 0
    margin-top 2.5rem
    display flex
    flex-wrap wrap
    align-items flex-start
    align-content stretch
    justify-content space-between
  .feature
    flex-grow 1
    flex-basis 30%
    max-width 30%
    h2
      font-size 1.4rem
      font-weight 500
      border-bottom none
      padding-bottom 0
      color lighten($textColor, 10%)
    p
      color lighten($textColor, 25%)
  #footer
    padding: 40px 0
    color: #fff
    text-align: center
    .social-icon
      margin 0 5px
      svg
        width 18px
        height 18px
    a
      font-weight: 700
      color: #fff
@media (max-width: $MQMobile)
  .lando-home
    .features
      flex-direction column
    .feature
      max-width 100%
      padding 0 2.5rem
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
        border: 0;
      .button
        font-size: .9em
    .feature
      h2
        font-size 1.25rem
@media (max-width: $MQMobileNarrow)
  .lando-home
    padding-left 1.5rem
    padding-right 1.5rem
</style>
