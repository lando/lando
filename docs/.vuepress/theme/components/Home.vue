<template>
  <div>
    <div id="hero">
      <div class="inner">
        <div id="hero_header">
          <div class="hero-left">
            <img class="hero-logo" v-if="data.heroImage" :src="$withBase(data.heroImage)" :alt="data.heroAlt || 'lando logo'">
          </div>
          <div class="hero-right">
            <h2 class="hide">Lando</h2>
            <h1>A Liberating Dev Tool<br/> For All Your Projects</h1>
            <p>
              <a class="button has-icon" href="/basics/">
                <svg aria-labelledby="simpleicons-play-icon" role="img" viewBox="0 0 100 125" fill="#FFFFFF"><title id="simpleicons-play-icon" lang="en">Play icon</title><path d="M50,3.8C24.5,3.8,3.8,24.5,3.8,50S24.5,96.2,50,96.2S96.2,75.5,96.2,50S75.5,3.8,50,3.8z M71.2,53.3l-30.8,18  c-0.6,0.4-1.3,0.5-1.9,0.5c-0.6,0-1.3-0.1-1.9-0.5c-1.2-0.6-1.9-1.9-1.9-3.3V32c0-1.4,0.8-2.7,1.9-3.3c1.2-0.6,2.7-0.6,3.8,0  l30.8,18c1.2,0.6,1.9,1.9,1.9,3.3S72.3,52.7,71.2,53.3z"></path></svg>
                GET STARTED</a>
              <a class="button white" href="https://lando.dev" target="_blank">WHY LANDO?</a>
              <a class="button gray has-icon" href="https://github.com/lando/lando" target="_blank">
                <svg aria-labelledby="simpleicons-github-icon" lang="" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-github-icon" lang="en">GitHub Dark icon</title><path fill="#ffffff" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
                GITHUB</a>
            </p>
          </div>
        </div>

        <div id="patriot_sponsors">
          <h4>Special Sponsors</h4>
          <Patriots hide-header />
        </div>

        <div id="features" v-if="data.features && data.features.length">
          <div class="inner">
            <div class="point" v-for="(feature, index) in data.features" :key="index">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.details }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="sponsors">
      <div class="inner">
        <div class="sponsor-button">
          <a class="button transparent" href="https://lando.dev/sponsor">BECOME A SPONSOR</a>
        </div>
        <Allies />
        <Heralds />
        <div class="sponsor-button">
          <a class="button transparent" href="https://lando.dev/sponsor">BECOME A SPONSOR</a>
        </div>
      </div>
    </div>

    <Footer />

  </div>
</template>

<script>
import Allies from '@theme/components/Allies.vue';
import Footer from '@theme/components/Footer.vue';
import Heralds from '@theme/components/Heralds.vue';
import Patriots from '@theme/components/Patriots.vue';

export default {
  components: {Allies, Footer, Heralds, Patriots},
  data() {
    return {
      data: {},
    };
  },
  mounted() {
    this.data = this.$page.frontmatter;
  },
};
</script>

<style lang="stylus">
.lando-home
  a.button,
    input.button
      padding: 0.50em 2em
      border-radius: 2em
      display: inline-block
      color: #fff
      background-color: lighten($landoPink, 8%)
      transition: all .15s ease
      box-sizing: border-box
      border: 1px solid lighten($landoPink, 8%)
      &.has-icon
        position: relative
        text-indent: 1.4em
        > svg
          position: absolute
          left: 0.4em
          top: 0.3em
          width: 2em
      &.white
        background-color: #fff
        color: $landoPink
      &.gray
        background-color: #4e6e8e
        color: $light
        border-color: #4e6e8e
      &.transparent
        background-color: transparent
        color: $landoPink
  header
    background-color: #fff
    height: 60px
    padding: 10px 60px
    position: relative
    z-index: 100
  header.navbar
    border: 0
    .logo
      display: none
  .inner
    width: 1260px
    margin: 0 auto
  .strikethrough
    display: table
    white-space: nowrap
    &:before, &:after
      border-top: 1px solid lighten($landoBlue, 5%)
      content: ''
      display: table-cell
      position: relative
      top: 0.6em
      width: 45%
    &:before
      right: 2.5%
    &:after
      left: 2.5%
  #hero
    display: flex
    align-items: center
    justify-content: center
    flex-direction: column
    min-height: 100vh
    .hero-left, .hero-right
      display: inline-block
      vertical-align: top
    .hero-left
      width: 25%
      text-align: left
    .hero-right
      width: 70%
      text-align: right
    .hero-logo
      width: 205px
      height: 205px
      margin-right: 60px
    h1, h2
      color: #2c3e50
      font-family: "Poppins", "Helvetica Neue", Arial, sans-serif
      font-size: 3.2em
      margin: 0
      border: 0
      letter-spacing: -1px
    h2
      font-size: 2.4em
      margin: 0 0 10px
      display: none
      color $landoPink
    .button
      margin: 1em 0
      font-size: 1em
      font-weight: 500
      letter-spacing: .05em
      min-width: 8em
      text-align: center
      &:not(:last-child)
        margin-right: 1%
  #hero_header
    width: 900px
    margin: auto
  #patriot_sponsors
    padding-top: 4em
    padding-bottom 4em
    text-align: center
    width: 900px
    margin: auto
    #patriots
      padding-top: 1em
    h4
      margin: 0
      color: lighten($landoGrey, 20%)
    .sponsor-patriot-block
      padding: 2em 1em
  #features
    background-color: #fff
    padding-bottom: 1em
    .inner
      max-width: 900px
      margin: 0 auto
      text-align: center
  #sponsors
    padding-top: 2em
    padding-bottom: 2em
    background-color: lighten($landoGrey, 98%)
    margin: 0 auto
    #partners,
    #allies,
    #heralds
      padding-top: 2em
      padding-bottom: 2em
      h4
        padding: 0
      &.smaller-inner
        max-width: 800px
      .strikethrough
        &:before, &:after
          border-top: 1px solid lighten($landoGrey, 85%)
    .sponsor-button
      text-align: center
  #footer
    background-color: white
    .footer-top
      background-color: white
      li
        a
          color: lighten($landoGrey, 30%)
      h3
        color: lighten($landoGrey, 50%)
        a
          color: lighten($landoGrey, 50%)
        &.strikethrough
          &:before, &:after
            border-top: 1px solid lighten($landoGrey, 85%)
      .footer-image
        img
          filter: none
      .newsletter-input
        background-color: lighten($landoGrey, 95%)
    .footer-copyright
      background-color: lighten($landoGrey, 95%)
      color: lighten($landoGrey, 30%)
@media (max-width: $MQMobile)
  .lando-home
    .inner
      width: auto
    #hero
      .hero-logo
        float: none
        margin: 30px 0 15px
        width: 140px
        height: 140px
      .hero-left, .hero-right
        text-align: center
        width: 100%
      h1
        font-size: 2em
      h2
        display: block
        border: 0
      .button
        font-size: .9em
    #hero_header
      width: 80%
    #patriot_sponsors
      width: 80%
@media (max-width: $MQMobileNarrow)
  .lando-home
    padding-left 1.5rem
    padding-right 1.5rem
</style>
