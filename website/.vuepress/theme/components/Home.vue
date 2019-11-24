<template>
  <div>
    <div id="hero">
      <div class="inner">
        <div class="hero-header">
          <div class="hero-left">
            <img class="hero-logo" v-if="data.heroImage" :src="$withBase(data.heroImage)" :alt="data.heroAlt || 'lando logo'">
          </div>
          <div class="hero-right">
            <h2 class="hide">Lando.</h2>
            <h1>A Liberating Dev Tool<br/> For All Your Projects</h1>
            <div class="byline">
              <p>{{ data.byline }}</p>
            </div>
            <div class="hero-action">
              <div class="hero-primary">
                <a class="button blue" href="/download/">GET LANDO!</a>
              </div>
              <div class="hero-secondary">
                <a class="button" href="/alliance/join/">JOIN</a>
                <a class="button" href="/sponsor">SPONSOR</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="carbon">
      <div class="inner">
        <CarbonAds />
      </div>
    </div>

    <div id="whys" v-if="data.whys && data.whys.length">
      <div class="inner">
        <h2>I dig it! but why Lando?</h2>

        <div class="byline">{{ data.whyLando }}</div>

        <div class="point" v-for="(why, index) in data.whys" :key="index">
          <h3>{{ why.title }}</h3>
          <p>{{ why.details }}</p>
        </div>
      </div>
    </div>

    <div id="hows">
      <div class="inner">
        <h2>How does it work?</h2>
        <div class="byline">{{ data.howByline }}</div>
        <Content />
        <div class="section-footer">
          <a class="button blue" href="/download/">I'M CONVINCED!</a>
        </div>
      </div>
    </div>

    <div id="wheres" v-if="data.wheres && data.wheres.length">
      <div class="inner">
        <h2>Where can I use it?</h2>

        <div class="byline">{{ data.whereByline }}</div>

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

        <div class="section-footer">
          <a class="button blue" href="/download/">YAH, I'LL USE THAT!</a>
        </div>
      </div>
    </div>

    <div id="whats" >
      <div class="inner">
        <h2>What can it run?</h2>

        <div class="byline">{{ data.whatByline }}</div>

        <div class="what-section" v-if="data.whats && data.whats.length">
          <div class="point" v-for="(language, index) in data.whats" :key="index">
            <a v-if="language.link" :href="language.link" target="_blank">
              <div class="tech-icon"><i :class="language.icon"></i></div>
              <h3>{{ language.title }}</h3>
            </a>
            <span v-else>
              <div class="tech-icon"><i :class="language.icon"></i></div>
              <h3>{{ language.title }}</h3>
            </span>
          </div>

          <div class="section-footer">
            <a class="button green" href="/download/">IM READY TO CLEANSE MY MACHINE!</a>
          </div>
        </div>
      </div>
    </div>

    <Usage />
    <Ready />
  </div>
</template>

<script>
// Core components and things
import CarbonAds from '@theme/components/CarbonAds.vue';
import Ready from '@theme/components/Ready.vue';
import Usage from '@theme/components/Usage.vue';

// Hideable menu ids
const toggleableMenu = [
  'nav-item-get-lando',
  'nav-item-join-the alliance',
  'nav-item-sponsor',
];

export default {
  components: {CarbonAds, Ready, Usage},
  data() {
    return {
      data: {},
    };
  },
  beforeDestroy() {
    // Remove scroll listener
    window.removeEventListener('scroll', this.onScroll);
  },
  mounted() {
    // Dump the frontmatter
    this.data = this.$page.frontmatter;
    // Listen to the scroll
    window.addEventListener('scroll', this.onScroll);
    // Hide the menu to start
    this.hideMenu();
  },
  methods: {
    hideMenu() {
      toggleableMenu.forEach(mid => {
        const navItem = document.getElementById(mid);
        navItem.classList.remove('visible');
        navItem.classList.add('hidden');
      });
    },
    onScroll(e) {
      if (window.screen.availHeight * .666 - window.top.scrollY < 0) {
        this.showMenu();
      } else {
        this.hideMenu();
      }
    },
    showMenu() {
      toggleableMenu.forEach(mid => {
        const navItem = document.getElementById(mid);
        navItem.classList.remove('hidden');
        navItem.classList.add('visible');
      });
    },
  },
};
</script>

<style lang="stylus">
.lando-front
  background-image: url("/images/space.jpg")
  background-repeat-y: repeat
  .nav-item-get-lando,
  .nav-item-join-the,
  .nav-item-sponsor
    visibility: hidden
    opacity: 0
  .visible
    visibility: visible
    opacity: 1
    transition: opacity 1s linear
  .hidden
    visibility: hidden
    opacity: 0
    transition: visibility 0s 1s, opacity 1s linear
  .byline
    color: lighten($accentColor, 80%)
    font-size: 1.5rem
    padding-top: 1em
  header.navbar
   .logo
      display: none
  #hero
    display: flex
    align-items: center
    justify-content: center
    flex-direction: column
    min-height: 100vh
    background-color: rgba($landoPink, .92)
    h1
      padding-top: 0
      margin-top: .5em
      color: #2c3e50
    h2
      font-size: 5em
      margin: 0 0 10px
      padding: 0
      display: none
    .hero-header
      padding-top: 2em
    .hero-left, .hero-right
      display: inline-block
      vertical-align: top
    .hero-left
      width: 38%
    .hero-right
      width: 60%
      text-align: right
    .hero-logo
      width: 555px
      height: 555px
      float: right
      margin-right: 60px
    .hero-primary
      .button
        margin: .1em
      a
        width: 70%
    .hero-secondary
      a
        width: 35%
    .button
      width: 30%
      margin: 1em 0
      font-size: 1.4em
      font-weight: 500
      letter-spacing: .05em
      min-width: 8em
      text-align: center
      &:not(:last-child)
        margin-right: 1%
    .byline
      margin-top: -3em
      color: lighten($landoPink, 80%)
      p
        line-height: 1.67
  #whys,
  #wheres,
  #whats,
  #hows,
  #carbon
    display: flex
    align-items: center
    justify-content: center
    flex-direction: column
    background-color: $accentColor
    background-color: #fff
    padding-bottom: 5%
    .inner
      max-width: 900px
      margin: 0 auto
      text-align: center
      padding: 0 1.5em
    .byline
      color: lighten($landoBlue, 25%)
      padding-top: 1.2em
      padding-bottom: 1.2em
      font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
      font-size: 1.7em
      word-spacing: 10px
      word-spacing: 0.05em
      line-height: 1.4
    .point
      width: 50%
      display: inline-block
      vertical-align: top
      box-sizing: border-box
      padding: 1em 2em
    .button
      margin: 1em 0
      font-size: 2.4em
      font-weight: 500
      letter-spacing: .05em
      min-width: 8em
      text-align: center
      &:not(:last-child)
        margin-right: 1%
  #carbon
    padding-bottom: 0
    background-color: darken(rgba($landoPink, .92), 13%)
    .carbon-ads
      min-height: 102px
      padding: 3em
      font-size: 0.88rem
      margin: auto
      max-width: 300px
    .carbon-ads
      a
       color: lighten($accentColor, 65%)
      .carbon-wrap
        margin-top: 5px
        a
          color: #ffffff
  #wheres
    min-height: 100vh
    background-color: rgba($landoBlue, .92)
    h2
      color: lighten($landoBlue, 60%)
    h3
      display: none
    .byline
      color: lighten($landoBlue, 80%)
    .button
      &.blue
        background-color: darken($landoBlue, 25%)
        border-color: darken($landoBlue, 25%)
    .point
      width: 30%
      padding-bottom: 2em
      .tech-icon
        font-size: 200px
        color: lighten($landoBlue, 95%)
  #whats
    min-height: 100vh
    background-color: rgba($landoGreen, .92)
    h2
      color: lighten($landoGreen, 60%)
    h3
      display: none
    .byline
      color: lighten($landoGreen, 80%)
    .button
      &.green
        background-color: darken($landoGreen, 33%)
        border-color: darken($landoGreen, 33%)
    .point
      width: 20%
      padding-bottom: 2em
      .tech-icon
        font-size: 96px
        color: lighten($landoGreen, 95%)
    .what-section
      padding-top: 1em
  #hows
    justify-content: flex-end
    flex-direction: column
    align-items: unset
    h3
      font-weight: 300
      font-size: 2em
      margin: auto
      width: 55%
    h4
      text-align: left
      font-weight: 100
@media (max-width: 1025px)
  .lando-front
    #hero
      padding-top: 100px
      .hero-logo
        margin-right: -2em
      .button
        font-size: 1.9em
@media (max-width: $MQMobile)
  .lando-front
    .nav-item-get-lando,
    .nav-item-join-the,
    .nav-item-sponsor
      visibility: visible
      opacity: 1
    #hero
      padding: 40px 40px 30px
      h1
        font-size: 3em
      h2
        display: block
        color: #ffffff
        border: 0
      .hero-header
        padding-bottom: 0
      .hero-logo
        float: none
        margin: 30px 0 15px
        width: 240px
        height: 240px
      .hero-left, .hero-right
        text-align: center
        width: 100%
      .hero-primary
        .button
          margin: .1em
        a
          width: 90%
      .hero-secondary
        a
          width: 45%
      .byline
        padding-top: 3em
        p
          font-size: 1.2em
      .button
        font-size: 1.2em
        width: 100%
    #carbon
      .inner
        padding: 0
      .carbon-ads
        padding: 1em
    #whys,
    #wheres,
    #whats,
    #hows
      .point
        width: 90%
        display: inline-block
        vertical-align: top
        box-sizing: border-box
        padding: 0 2em
        h3
          padding-top: 2em
          font-size: 2em
        .tech-icon
          font-size: 128px
        &:after
          content: "________"
          color: $accentColor
      .button
        font-size: 1.4em
        width: 100%
    #wheres,
    #whats
      .point
        width: 50%
        display: inline-block
        vertical-align: top
        box-sizing: border-box
        padding: 0 2em
        &:after
          content: ""
    #hows
      .inner
        margin: 0
      div[class*=language-]
        margin: .85rem -1.5em
        border-radius: 0
@media (max-width: $MQMobileNarrow)
  .lando-front
    #hero
      .hero-primary,
      .hero-secondary
        a
          width: 100%
          margin-bottom: .2em
@media (max-width: 321px)
  .lando-front
    h1,
    h2
      font-size: 3em
    #whys,
    #wheres,
    #whats
      .point
        display: block
        margin: auto
        padding: 0
        .tech-icon
          width: 100%
    #whos
      .inner
        padding: 0
    #hero
      h2
        font-size: 4em
      h1
        font-size: 3em
      .hero-primary,
      .hero-secondary
        a
          width: 100%
</style>
