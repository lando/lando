<template>
  <div>
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
            <a class="button" href="/alliance/join/">SUPPORT LANDO. JOIN THE ALLIANCE.</a>
          </p>
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
            <a href="https://docs.lando.dev/config/services.html" target="_blank">Learn about the other languages Lando supports >></a>
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
            <a href="https://docs.lando.dev/config/recipes.html" target="_blank">Learn about Backdrop CMS, Pantheon, LAMP, LEMP, MEAN, and the other frameworks Lando supports >></a>
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
            <a href="https://docs.lando.dev/config/services.html" target="_blank">Learn about elasticsearch, MailHog, XDebug, MariaDB, MSSQL, PhpMyAdmin, Solr, Varnish and the other services Lando supports >> </a>
          </div>
        </div>
      </div>
    </div>

    <div id="hows">
      <div class="inner">
        <h2>How does it work?</h2>
        <p>{{ data.howByline }}</p>
        <div class="initialize how-section">
          <div class="init-section"><Content/></div>
        </div>
      </div>
    </div>

    <div id="whos">
      <div class="inner">
        <h2>Wait... so who is using this again?</h2>
        <p>Lando is used by professional developers, leading digital agencies, universities and non-profits to make their dev better. It's also the engine that powers tools like <a href="https://pantheon.io/localdev" target="_blank">Pantheon Localdev</a> and is battle-tested by over</p>
        <div class="current-users">{{ currentUsers }}</div>
        <p>users and counting!</p>
      </div>
    </div>

    <div id="ready">
      <div class="inner">
        <h2>Ready for dev liberation?</h2>
        <p><a class="button blue" href="/download/">GET LANDO!</a></p>
      </div>
    </div>
  </div>
</template>

<script>
// Core components and things
import CarbonAds from '@theme/components/CarbonAds.vue';

export default {
  components: {CarbonAds},
  data() {
    return {
      data: {},
      growthRate: 0.0001,
      startingTime: 1565701419,
      startingUsers: 11212,
    };
  },
  computed: {
    currentUsers() {
      const now = Date.now() / 1000;
      const secondsSince = now - this.startingTime;
      const currentUsers = Math.floor(secondsSince * this.growthRate) + this.startingUsers;
      return currentUsers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
  },
  mounted() {
    this.data = this.$page.frontmatter;
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
      width: 368px;
      height: 368px
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
  .carbon-ads
    min-height: 102px
    padding: 3em
    font-size: 0.88rem
    margin: auto
    width: 300px
  .carbon-ads
    a
     color: lighten($accentColor, 65%)
    .carbon-wrap
      margin-top: 5px
      a
        color: #ffffff
  #whys,
  #wheres,
  #whats,
  #hows,
  #whos,
  #ready,
  #carbon
    background-color: #fff
    padding-bottom: 70px
    .inner
      max-width: 900px;
      margin: 0 auto
      text-align: center
      padding: 0 1.5em;
    h2
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
      font-style: italic
      word-spacing: 0.05em
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
      padding: 1em 2em
      h3
        color: lighten($accentColor, 33%)
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
    .learn-more
      font-size: 1.5em
      a
        font-style: italic
  #wheres
    background-color: $landoBlue
    h2
      color: lighten($landoBlue, 60%)
    h3
      display: none;
    p
      color: lighten($landoBlue, 90%)
    .point
      width: 25%
      padding-bottom: 2em
      .tech-icon
        font-size: 128px
        color: lighten($landoBlue, 95%)
    .learn-more
      a
        color: lighten($landoBlue, 60%)
  #whats
    background-color: $landoGreen
    h2
      color: lighten($landoGreen, 70%)
    h3
      display: none;
    p
      color: lighten($landoGreen, 90%)
    .point
      width: 20%
      padding-bottom: 2em
      .tech-icon
        font-size: 96px;
        color: lighten($landoGreen, 95%)
    .what-section
      padding-top: 1em
    .learn-more
      padding-bottom: 4em
      a
        color: lighten($landoGreen, 80%)
  #hows
    .how-section
      text-align: left
      padding: 0 2em
      p
        font-style: normal
        font-size: 1.4em
        margin: 0
        padding-bottom: 1.2em
        color: lighten($landoGrey, 18%)
      .step-number
        p
          margin-top: 0.10em
          font-size: 3.5em
          color: lighten($landoGrey, 55%)
      h3
        color: lighten($landoPink, 18%)
        font-weight: 300
        font-size: 2em
        padding: .66em 0.24em 0
        margin: 0
      h4
        color: $landoGreen
        font-weight: 300
        font-size: 1.4em
        padding: 1.3em 0 0.24em 0
        margin: 0
    .left, .right
      display: inline-block
      vertical-align: top
    .left
      width: 15%
    .right
      width: 79%
    .learn-more
      text-align: center
      padding-top: 1em
      padding-bottom: 2em
      a
        color: lighten($landoBlue, 18%)
  #whos
    background-color: $landoPink
    .current-users
      color: #ffffff
      font-family: "Dosis", "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
      font-size: 9em
    h2
      color: lighten($landoPink, 70%)
    h3
      display: none
    p
      padding-bottom: 0
      color: lighten($landoPink, 90%)
      a
        color: lighten($landoPink, 90%)
      a:hover
        text-decoration: underline
  #ready,
  #carbon
    padding-bottom: 0
    background-color: darken($landoPink, 13%)
  #ready
    h2
      color: lighten($landoPink, 100%)
    p
      font-style: normal
@media (max-width: $MQNarrow)
  .lando-front
    #hero
      .hero-logo
        width: 240px
        height: 240px
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
    #whats,
    #whos
      .point
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
          color: $accentColor
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
      .left, .right
        text-align: center
        width: 100%
      .step-number
        margin-bottom: 1em
    div[class*=language-]
      margin: .85rem -3.5em
      border-radius: 0
@media (max-width: $MQMobileNarrow)
  .lando-home
    padding-left 1.5rem
    padding-right 1.5rem
    #whys,
    #wheres,
    #whats
      .point
        display: block
        margin: 0 auto
        width: 300px
        padding: 0 40px 30px
        &:before
          content: ""
        .tech-icon
          font-size: 128px
</style>
