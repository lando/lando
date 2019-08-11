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
            <a class="button white" href="https://github.com/lando/lando/releases">GET LANDO!</a>
            <a class="button" href="#newsletter">JOIN THE ALLIANCE</a>
          </p>
        </div>
      </div>
    </div>

    <div id="whys" v-if="data.whys && data.whys.length">
      <div class="inner">
        <h2>I dig it! but why Lando?</h2>
        <p>{{ data.whyLando }}</p>
        <div class="point" v-for="(why, index) in data.whys" :key="index">
          <h3>{{ why.title }}</h3>
          <p>{{ why.details }}</p>
        </div>
      </div>
    </div>

    <div id="wheres" v-if="data.wheres && data.wheres.length">
      <div class="inner">
        <h2>Where can I use it?</h2>
        <p>{{ data.whereByline }}</p>
        <div class="point" v-for="(where, index) in data.wheres" :key="index">
          <a v-if="where.link" :href="where.link" target="_blank">
            <div class="tech-icon"><i :class="where.icon"></i></div>
            <h3>{{ where.title }}</h3>
          </a>
          <span v-else>
            <div class="tech-icon"><i :class="where.icon"></i></div>
            <h3>{{ where.title }}</h3>
          </span>
        </div>
        <div class="learn-more">
          <a href="https://docs.lando.dev/basics/installation.html" target="_blank">Learn how to install Lando anywhere >></a>
        </div>
      </div>
    </div>

    <div id="whats" >
      <div class="inner">
        <h2>What can it run?</h2>
        <p>{{ data.whatByline }}</p>

        <div class="languages what-section" v-if="data.whatLanguages && data.whatLanguages.length">
          <div class="point" v-for="(language, index) in data.whatLanguages" :key="index">
            <a v-if="language.link" :href="language.link" target="_blank">
              <div class="tech-icon"><i :class="language.icon"></i></div>
              <h3>{{ language.title }}</h3>
            </a>
            <span v-else>
              <div class="tech-icon"><i :class="language.icon"></i></div>
              <h3>{{ language.title }}</h3>
            </span>
          </div>
          <div class="learn-more">
            <a href="https://docs.lando.dev/config/lando.html" target="_blank">Learn about the other languages Lando supports >></a>
          </div>
        </div>

        <div class="frameworks what-section" v-if="data.whatFrameworks && data.whatFrameworks.length">
          <div class="point" v-for="(framework, index) in data.whatFrameworks" :key="index">
            <a v-if="framework.link" :href="framework.link" target="_blank">
              <div class="tech-icon"><i :class="framework.icon"></i></div>
              <h3>{{ framework.title }}</h3>
            </a>
            <span v-else>
              <div class="tech-icon"><i :class="framework.icon"></i></div>
              <h3>{{ framework.title }}</h3>
            </span>
          </div>
          <div class="learn-more">
            <a href="https://docs.lando.dev/config/lando.html" target="_blank">Learn about Backdrop CMS, Pantheon, LAMP, LEMP, MEAN, and the other frameworks Lando supports >></a>
          </div>
        </div>

        <div class="services what-section" v-if="data.whatServices && data.whatServices.length">
          <div class="point" v-for="(service, index) in data.whatServices" :key="index">
            <a v-if="service.link" :href="service.link" target="_blank">
              <div class="tech-icon"><i :class="service.icon"></i></div>
              <h3>{{ service.title }}</h3>
            </a>
            <span v-else>
              <div class="tech-icon"><i :class="service.icon"></i></div>
              <h3>{{ service.title }}</h3>
            </span>
          </div>
          <div class="learn-more">
            <a href="https://docs.lando.dev/config/lando.html" target="_blank">Learn about elasticsearch, MailHog, XDebug, MariaDB, MSSQL, PhpMyAdmin, Solr, Varnish and the other services Lando supports >> </a>
          </div>
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
  #whys,
  #wheres,
  #whats
    background-color: #fff
    padding-bottom: 70px
    .inner
      max-width: 900px;
      margin: 0 auto
      text-align: center
      padding: 0 1.5em;
    h2
      color: lighten(#2c3e50, 18%)
      font-family: "Dosis", "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
      font-size: 3.5em
      font-weight: 400
      margin: 0
      padding: 1.5em 0 0
      border: 0
    p
      font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
      font-size: 1.2em
      font-weight: 600
      font-style: italic
      word-spacing: 0.05em
      color: #4f5959
      line-height: 1.4
      margin-block-start: 1em
      margin-block-end: 1em
      margin-inline-start: 0px
      margin-inline-end: 0px
      padding-bottom: 2em
    .point
      width: 33%
      display: inline-block
      vertical-align: top
      box-sizing: border-box
      padding: 0 2em
      h3
        color: lighten($accentColor, 18%)
        font-size: 1.5em
        font-weight: 400
        margin: 0
        padding: .5em 0
        border: 0
      p
        font-style: normal
        font-weight: 500
        font-size: 1em
        padding-bottom: 0
  #wheres,
  #whats
    h3
      display: none;
    background-color: lighten($accentColor, 90%)
    .point
      width: 25%
      padding-bottom: 2em
      .tech-icon
        font-size: 128px
        color: lighten(#4A617D, 25%)
    .learn-more
      font-size: 1.5em
      a
        font-style: italic
        color: lighten($accentColor, 10%)
  #whats
    background-color: lighten($accentColor, 95%)
    .what-section
      padding-top: 1em
      .learn-more
        padding-bottom: 4em
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
        border: 0
      .button
        font-size: .9em
    #whys,
    #wheres,
    #whats
      .point
        display: block
        margin: 0 auto
        width: 300px
        padding: 0 40px 30px
        &:before
          content: "—"
          color: $accentColor
    #wheres,
    #whats
      .point
        &:before
          content: ""
@media (max-width: $MQMobileNarrow)
  .lando-home
    padding-left 1.5rem
    padding-right 1.5rem
</style>
