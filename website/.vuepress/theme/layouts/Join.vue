<template>
  <div class="theme-container" :class="pageClasses" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar"/>

    <div class="sidebar-mask" @click="toggleSidebar(false)"></div>

    <Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
      <slot name="sidebar-top" slot="top" />
      <slot name="sidebar-bottom" slot="bottom" />
    </Sidebar>

    <Home v-if="$page.frontmatter.home"/>

    <div v-else :sidebar-items="sidebarItems" id="section">
      <slot name="page-top" slot="top"/>
      <div class="inner">
        <div class="section-inner">
          <div class="section-inner-section">
            <div class="content__default">
              <h1 id="join-and-support-the-movement">
              <a href="#join-and-support-the-movement" aria-hidden="true" class="header-anchor">#</a> Join and support the movement!</h1>
              <img src="/images/lando-alliance.png">

              <p>Over the last year or so we've watched our community grow from several hundred users to over 10,000 and this exponential growth trajectory doesn't seem to be stopping anytime soon!</p>

              <p>As such we want to make sure Lando has a healthy and sustainable foundation for continued future growth.</p>

              <p>For that reason we are launching our membership program: <em>The Lando Alliance</em>, a movement to liberate developers across the galaxy so they can focus on their most important work.</p>

              <h3>I'd love to join <em>The Alliance</em> as a(n)...</h3>

              <p>
                <script>
                  // Load our hubspot form
                  hbspt.forms.create({
                    portalId: '6478338',
                    formId: '9017bea2-dd0c-402a-8c97-d1b1d7429a00',
                  });
                  // Let's inject some CSS to make things look a bt nicer
                  const hscss = `
                    .inputs-list label {
                      line-height: 26px;
                    }
                    form {
                      margin: auto;
                      padding: 5em;
                      border: 1px #ed3f7a solid;
                    }
                    .inputs-list:first-child {
                      padding-top: 2em;
                    }
                    .inputs-list .hs-form-checkbox  {
                      padding-bottom: 2em;
                    }
                    .inputs-list .hs-form-checkbox small  {
                      color: #4e6e8e;
                    }
                    .multi-container {
                      padding-bottom: 1em;
                    }
                    .hs-custom-style fieldset input:not([type="image"]):not([type="submit"]):not([type="button"]):not([type="radio"]):not([type="checkbox"]):not([type="file"]), .hs-custom-style>div input:not([type="image"]):not([type="submit"]):not([type="button"]):not([type="radio"]):not([type="checkbox"]):not([type="file"]) {
                      -webkit-writing-mode: horizontal-tb !important;
                      text-rendering: auto;
                      color: initial;
                      letter-spacing: normal;
                      word-spacing: normal;
                      text-transform: none;
                      text-indent: 0px;
                      text-shadow: none;
                      display: inline-block;
                      text-align: start;
                      -webkit-appearance: textfield;
                      background-color: white;
                      -webkit-rtl-ordering: logical;
                      cursor: text;
                      margin: 0em;
                      font: 400 11px system-ui;
                      padding: 1px;
                      border-width: 2px;
                      border-style: inset;
                      border-color: initial;
                      border-image: initial;
                      width: 100%;
                      box-sizing: border-box;
                      padding: 10px 80px 10px 20px;
                      height: 50px;
                      border-radius: 50px;
                      border: 1px solid #ccc;
                      font-size: 16px;
                    }
                    .hs-available_for_contract_work label.hs-form-booleancheckbox-display {
                      margin-top: -38px;
                      font-size: 1em;
                    }
                    .hs-available_for_contract_work label.hs-form-booleancheckbox-display span {
                      color: #4e6e8e;
                    }
                  `;
                  window.onload = () => {
                    const joinHTML = document.getElementById("hs-form-iframe-0").contentDocument;
                    joinHTML.body.innerHTML += '<style>' + hscss + '</style>';
                  }
                </script>

              </p>

            </div>
          </div>
        </div>
      </div>
      <slot name="page-bottom" slot="bottom"/>
    </div>
    <MadeByTandem />
    <Newsletter />
    <Footer />
  </div>
</template>

<script>
// Core components and things
import Home from '@theme/components/Home.vue';
import Navbar from '@theme/components/Navbar.vue';
import Sidebar from '@theme/components/Sidebar.vue';
import {resolveSidebarItems} from '@parent-theme/util/index.js';

// Lando components
import MadeByTandem from '@theme/components/MadeByTandem';
import Newsletter from '@theme/components/Newsletter';
import Footer from '@theme/components/Footer';

export default {
  components: {Home, Sidebar, Navbar, MadeByTandem, Newsletter, Footer},
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
#section
  img
    padding: 2em
  background-color: #fff
  padding-bottom: 70px
  padding-top: 4em
  .button
    background-color: $landoPink
    margin: 2em 0
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
  .section-inner
    .step-number
      margin: auto
      p
        margin-top: 0.1em
        font-size: 3.5em
        color: lighten($landoGrey, 55%)
    .step
      margin-bottom: 5em
      &:after
        content: "________"
        color: $accentColor
    .hide-ender
      margin-bottom: 0em
      &:after
        content: ""
    h3
      color: lighten($landoPink, 18%)
      font-weight: 300
      font-size: 2.4em
      padding: .66em 0.24em 0
      margin: 0
  .left, .right
    text-align: center
    width: 100%
  .step-number
    margin-bottom: 1em
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
#hs-form-iframe-0
  text-align: center;
.newsletter-form
  position: relative
  max-width: 550px
  margin: 0 auto
  box-sizing: border-box
  padding: 2em 0
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
  #section
    .button
      background-color: $landoPink
      font-size: 1.5em
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
</style>
