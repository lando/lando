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
        <h2>I dig it! but why Lando?</h2>
        <p>{{ data.whyLando }}</p>
        <div class="point" v-for="(feature, index) in data.features" :key="index">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.details }}</p>
        </div>
      </div>
    </div>

    <div id="runson">
      <div class="inner">
        <h2>Where can I use it?</h2>
        <p>{{ data.runsOn }}</p>
        <div class="point">
          <div class="tech-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="#ed3f7a"><path d="M97.905 67.885c.174 18.8 16.494 25.057 16.674 25.137-.138.44-2.607 8.916-8.597 17.669-5.178 7.568-10.553 15.108-19.018 15.266-8.318.152-10.993-4.934-20.504-4.934-9.508 0-12.479 4.776-20.354 5.086-8.172.31-14.395-8.185-19.616-15.724-10.668-15.424-18.821-43.585-7.874-62.594 5.438-9.44 15.158-15.417 25.707-15.571 8.024-.153 15.598 5.398 20.503 5.398 4.902 0 14.106-6.676 23.782-5.696 4.051.169 15.421 1.636 22.722 12.324-.587.365-13.566 7.921-13.425 23.639m-15.633-46.166c4.338-5.251 7.258-12.563 6.462-19.836-6.254.251-13.816 4.167-18.301 9.416-4.02 4.647-7.54 12.087-6.591 19.216 6.971.54 14.091-3.542 18.43-8.796"/></svg></div>
        </div>
        <div class="point">
          <div class="tech-icon"><svg viewBox="0 0 128 128" width="128" height="128"><path fill="#ed3f7a" d="M126 1.637l-67 9.834v49.831l67-.534zM1.647 66.709l.003 42.404 50.791 6.983-.04-49.057zM58.467 67.389l.094 49.465 67.376 9.509.016-58.863zM1.61 19.297l.047 42.383 50.791-.289-.023-49.016z"></path></svg></div>
        </div>
        <div class="point">
          <div class="tech-icon"><svg viewBox="0 0 128 128" width="128" height="128"><path fill="#ed3f7a" d="M38.089 77.466l-11.4 4.896 10.559 4.514 12.241-4.514-11.4-4.896zm-17.138 6.12l-.382 22.034 16.679 7.345v-22.876l-16.297-6.503zm34.276 0l-15.073 5.739v21.575l15.073-6.121v-21.193zM73.206 15.035l-11.476 4.896 10.635 4.515 12.241-4.515-11.4-4.896zm-15.914 6.503v22.034l14.231 4.132.459-20.046-14.69-6.12zm31.828 1.224l-13.466 5.738v21.652l13.466-6.121v-21.269zM19.306 46.047l-11.399 4.897 10.558 4.514 12.241-4.514-11.4-4.897zm-17.138 6.121l-.382 22.034 16.679 7.345v-22.876l-16.297-6.503zm34.275 0l-15.071 5.738v21.574l15.071-6.12v-21.192zM56.03 45.231l-11.4 4.897 10.558 4.514 12.241-4.514-11.399-4.897zm-17.137 6.121l-.383 22.035 16.679 7.345v-22.877l-16.296-6.503zm34.275 0l-15.072 5.738v21.576l15.072-6.121v-21.193zM109.076 15.035l-11.399 4.896 10.559 4.515 12.241-4.515-11.401-4.896zm-17.137 6.121l-.382 22.034 16.679 7.344v-22.876l-16.297-6.502zm34.275 0l-15.071 5.738v21.575l15.071-6.12v-21.193z"></path></svg></div>
        </div>
        <div class="point">
          <div class="tech-icon"><svg viewBox="0 0 128 128" width="128" height="128"><path fill-rule="evenodd" fill="#ed3f7a" clip-rule="evenodd" d="M113.823 104.595c-1.795-1.478-3.629-2.921-5.308-4.525-1.87-1.785-3.045-3.944-2.789-6.678.147-1.573-.216-2.926-2.113-3.452.446-1.154.864-1.928 1.033-2.753.188-.92.178-1.887.204-2.834.264-9.96-3.334-18.691-8.663-26.835-2.454-3.748-5.017-7.429-7.633-11.066-4.092-5.688-5.559-12.078-5.633-18.981-.036-3.166-.41-6.38-1.081-9.475-1.313-6.04-4.549-10.763-10.418-13.296-4.497-1.942-9.152-2.327-13.901-1.084-6.901 1.805-11.074 6.934-10.996 14.088.074 6.885.417 13.779.922 20.648.288 3.893-.312 7.252-2.895 10.34-2.484 2.969-4.706 6.172-6.858 9.397-1.229 1.844-2.317 3.853-3.077 5.931-2.07 5.663-3.973 11.373-7.276 16.5-1.224 1.9-1.363 4.026-.494 6.199.225.563.363 1.429.089 1.882-2.354 3.907-5.011 7.345-10.066 8.095-3.976.591-4.172 1.314-4.051 5.413.1 3.337.061 6.705-.28 10.021-.363 3.555.008 4.521 3.442 5.373 7.924 1.968 15.913 3.647 23.492 6.854 3.227 1.365 6.465.891 9.064-1.763 2.713-2.771 6.141-3.855 9.844-3.859 6.285-.005 12.572.298 18.86.369 1.702.02 2.679.653 3.364 2.199.84 1.893 2.26 3.284 4.445 3.526 4.193.462 8.013-.16 11.19-3.359 3.918-3.948 8.436-7.066 13.615-9.227 1.482-.619 2.878-1.592 4.103-2.648 2.231-1.922 2.113-3.146-.135-5zm-51.397-80.475c.758-2.601 2.537-4.289 5.243-4.801 2.276-.43 4.203.688 5.639 3.246 1.546 2.758 2.054 5.64.734 8.658-1.083 2.474-1.591 2.707-4.123 1.868-.474-.157-.937-.343-1.777-.652.708-.594 1.154-1.035 1.664-1.382 1.134-.772 1.452-1.858 1.346-3.148-.139-1.694-1.471-3.194-2.837-3.175-1.225.017-2.262 1.167-2.4 2.915-.086 1.089.095 2.199.173 3.589-3.446-1.023-4.711-3.525-3.662-7.118zm-12.75-2.251c1.274-1.928 3.197-2.314 5.101-1.024 2.029 1.376 3.547 5.256 2.763 7.576-.285.844-1.127 1.5-1.716 2.241l-.604-.374c-.23-1.253-.276-2.585-.757-3.733-.304-.728-1.257-1.184-1.919-1.762-.622.739-1.693 1.443-1.757 2.228-.088 1.084.477 2.28.969 3.331.311.661 1.001 1.145 1.713 1.916l-1.922 1.51c-3.018-2.7-3.915-8.82-1.871-11.909zm37.664 64.206c-.203 2.604-.5 2.713-3.118 3.098-1.859.272-2.359.756-2.453 2.964-.108 2.581-.101 5.171-.012 7.753.061 1.77-.537 3.158-1.755 4.393-6.764 6.856-14.845 10.105-24.512 8.926-4.17-.509-6.896-3.047-9.097-6.639.98-.363 1.705-.607 2.412-.894 3.122-1.27 3.706-3.955 1.213-6.277-1.884-1.757-3.986-3.283-6.007-4.892-1.954-1.555-3.934-3.078-5.891-4.629-1.668-1.323-2.305-3.028-2.345-5.188-.094-5.182.972-10.03 3.138-14.747 1.932-4.209 3.429-8.617 5.239-12.885.935-2.202 1.906-4.455 3.278-6.388 1.319-1.854 2.134-3.669 1.988-5.94-.084-1.276-.016-2.562-.016-3.843l.707-.352c1.141.985 2.302 1.949 3.423 2.959 4.045 3.646 7.892 3.813 12.319.67 1.888-1.341 3.93-2.47 5.927-3.652.497-.294 1.092-.423 1.934-.738 2.151 5.066 4.262 10.033 6.375 15 1.072 2.524 1.932 5.167 3.264 7.547 2.671 4.775 4.092 9.813 4.07 15.272-.012 2.83.137 5.67-.081 8.482z"></path></svg></div>
        </div>
        <div class="point">
          <div class="tech-icon"><svg viewBox="0 0 128 128" width="128" height="128">
          <path fill="#ed3f7a" d="M40 34h18v61h-8v11h28v-12h-7v-61h19v9h10v-18h-71v18h11zM122.2 3h-116.169c-2.026 0-4.031 1.226-4.031 3.225v116.154c0 2 2.005 3.621 4.031 3.621h116.169c2.026 0 2.8-1.621 2.8-3.621v-116.154c0-1.999-.774-3.225-2.8-3.225zm-16.2 45h-21v-9h-9v48h9v24h-40v-23h6v-48h-6v8h-23v-30h84v30z"></path>
          </svg></div>
        </div>
        <div class="point">
          <div class="tech-icon"><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" viewBox="0 0 103.8 105.2" width="128" height="128"><path style="fill:#ed3f7a" inkscape:connector-curvature="0" id="path7" d="m 38.6,52.6 c 0,-6.9 5.6,-12.5 12.5,-12.5 6.9,0 12.5,5.6 12.5,12.5 0,6.9 -5.6,12.5 -12.5,12.5 C 44.2,65.2 38.6,59.5 38.6,52.6 Z M 51.1,0 C 26.5,0 5.9,16.8 0.1,39.6 0.1,39.8 0,39.9 0,40.1 c 0,1.4 1.1,2.5 2.5,2.5 l 21.2,0 c 1,0 1.9,-0.6 2.3,-1.5 l 0,0 C 30.4,31.6 39.9,25 51.1,25 66.3,25 78.7,37.4 78.7,52.6 78.7,67.8 66.3,80.2 51.1,80.2 40,80.2 30.4,73.6 26,64.1 l 0,0 c -0.4,-0.9 -1.3,-1.5 -2.3,-1.5 l -21.2,0 c -1.4,0 -2.5,1.1 -2.5,2.5 0,0.2 0,0.3 0.1,0.5 5.8,22.8 26.4,39.6 51,39.6 29.1,0 52.7,-23.6 52.7,-52.7 C 103.8,23.5 80.2,0 51.1,0 Z"/></svg></div>
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
  #features,
  #runson
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
  #runson
    background-color: lighten($accentColor, 90%)
    .point
      width: 20%
      padding-bottom: 2em;
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
    #features,
    #runson
      .point
        display: block
        margin: 0 auto
        width: 300px
        padding: 0 40px 30px
        &:before
          content: "—"
          color: $accentColor
    #runson
      .point
        &:before
          content: ""
@media (max-width: $MQMobileNarrow)
  .lando-home
    padding-left 1.5rem
    padding-right 1.5rem
</style>
