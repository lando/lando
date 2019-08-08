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
          <h1>Services</h1>
          <p>
            <a class="button has-icon" href="/basics/">
              <svg aria-labelledby="simpleicons-play-icon" role="img" viewBox="0 0 100 125" fill="#FFFFFF"><title id="simpleicons-play-icon" lang="en">Play icon</title><path d="M50,3.8C24.5,3.8,3.8,24.5,3.8,50S24.5,96.2,50,96.2S96.2,75.5,96.2,50S75.5,3.8,50,3.8z M71.2,53.3l-30.8,18  c-0.6,0.4-1.3,0.5-1.9,0.5c-0.6,0-1.3-0.1-1.9-0.5c-1.2-0.6-1.9-1.9-1.9-3.3V32c0-1.4,0.8-2.7,1.9-3.3c1.2-0.6,2.7-0.6,3.8,0  l30.8,18c1.2,0.6,1.9,1.9,1.9,3.3S72.3,52.7,71.2,53.3z"></path></svg>
              GET STARTED</a>
            <a class="button white" href="/basics/" target="_blank">WHY LANDO?</a>
            <a class="button gray has-icon" href="https://github.com/lando/lando" target="_blank">
              <svg aria-labelledby="simpleicons-github-icon" lang="" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-github-icon" lang="en">GitHub Dark icon</title><path fill="#ffffff" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
              GITHUB</a>
          </p>
        </div>
      </div>
    </div>

    <div id="made-by">
      <h3>Made By</h3>
      <a href="https://thinktandem.io/" target="_blank">
        <img src="/images/tandem.png" style="width:160px" alt="Tandem Logo">
        <br>
        <span>An agency-incubator that is magical to work at and with</span>
      </a>
    </div>

    <div id="features" v-if="data.features && data.features.length">
      <div class="inner">
        <div class="point" v-for="(feature, index) in data.features" :key="index">
          <h2>{{ feature.title }}</h2>
          <p>{{ feature.details }}</p>
        </div>
      </div>
    </div>

    <div id="news">
      <div class="inner">
        <h3><label for="member_email">Join the Lando Alliance, get updates</label></h3>
          <div id="mc_embed_signup">
            <form action="https://kalabox.us12.list-manage.com/subscribe/post?u=59874b4d6910fa65e724a4648&amp;id=613837077f" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate newsletter-form" target="_blank" novalidate>
              <div id="mc_embed_signup_scroll">

                <div class="mc-field-group">
                  <input type="email" value="" placeholder="Email address" name="EMAIL" class="required email newsletter-input" id="mce-EMAIL">
                </div>
                <div id="mce-responses" class="clear">
                  <div class="response" id="mce-error-response" style="display:none"></div>
                  <div class="response" id="mce-success-response" style="display:none"></div>
                </div>

                <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_59874b4d6910fa65e724a4648_613837077f" tabindex="-1" value=""></div>
                <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>

              </div>
            </form>
          </div>
      </div>
    </div>

    <div id="footer">
      <p>
        <a class="social-icon" href="https://github.com/lando/lando" target="_blank">
          <svg aria-labelledby="simpleicons-github-icon" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-github-icon" lang="en">GitHub icon</title><path fill="#FFFFFF" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
        </a>

        <a class="social-icon" href="https://twitter.com/devwithlando" target="_blank">
          <svg aria-labelledby="simpleicons-twitter-icon" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-twitter-icon" lang="en">Twitter icon</title><path fill="#FFFFFF" d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"></path></svg>
        </a>

        <a class="social-icon" href="https://www.youtube.com/channel/UCl_QBNuGJNoo7yH-n18K7Kg" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24"><title>YouTube icon</title><path fill="#FFFFFF" d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
        </a>
      </p>
      <p>{{ data.footer }}</p>
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
  #hero,
  #news
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
      width: 205px
      height: 205px
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
  #made-by
    background-color: #fff
    text-align: center
    padding-bottom: 30px
    h3
      margin 0
    a
      color: #4e6e8e
    a, span, img
      display: inline-block
      vertical-align: middle
    img
      margin: 15px
  #features
    background-color: #fff
    padding-bottom: 70px
    .inner
      max-width: 900px;
      margin: 0 auto
      text-align: center
    .point
      width: 33%
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
  #news
    padding: 10px 20px 70px
    text-align: center
    p
      margin-top: 10px
    a
      color: lighten($accentColor, 18%)
    .newsletter-form
      position: relative
      max-width: 550px
      margin: 0 auto
      box-sizing: border-box
    .newsletter-input
      width: 100%
      box-sizing: border-box
      padding: 10px 80px 10px 20px
      height: 50px
      border-radius: 50px
      border: 1px solid #ccc
      font-size: 16px
      &:focus
        outline: none
        border-color: lighten($accentColor, 18%)
    .newsletter-button.button
      position: absolute
      padding: 4px 20px
      margin: 0
      height: calc(100% - 8px)
      right: 4px
      top: 4px
@media (max-width: $MQMobile)
  .lando-home
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
    #made-by
      span
        display: block
      img
        width: 125px
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
