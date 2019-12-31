<template>
  <ParentLayout>
    <div id="hero" v-if="title" slot="page-top">
      <div class="hero-inner">
        <div class="inner">
          <h1>{{ title }}</h1>
          <div class="byline">
            <p>{{ byline }}</p>
          </div>
        </div>
      </div>
    </div>
    <div id="hs_form" v-if="form" slot="page-bottom">
      <div class="inner">
        <HSForm :form="form" :height="formHeight" />
      </div>
    </div>
    <div id="subscribe" v-else-if="Object.keys(subscribe).length > 0" slot="page-bottom">
      <div class="inner">
        <Subscribe
          :buttonLabel="subscribe.buttonLabel"
          :customStyles="subscribe.customStyles"
          :groups="subscribe.groups"
          :passcode="subscribe.passcode"
          :redirect="subscribe.redirect"
          :successMessage="subscribe.successMessage"
          :showAlliance="subscribe.showAlliance"
          :showDevNetwork="subscribe.showDevNetwork"
          :showSponsors="subscribe.showSponsors"
          :theme="subscribe.theme"
          :title="subscribe.title"/>
      </div>
    </div>
  </ParentLayout>
</template>

<script>
// Lando components
import ParentLayout from '@theme/layouts/Layout.vue';
import HSForm from '@theme/components/HSForm';
import Subscribe from '@theme/components/Subscribe';

export default {
  components: {HSForm, ParentLayout, Subscribe},
  data() {
    return {
      byline: '',
      form: '',
      formHeight: 1000,
      subscribe: {},
      title: '',
    };
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      this.byline = this.$frontmatter.byline || '';
      this.form = this.$frontmatter.form || '';
      this.formHeight = this.$frontmatter.formHeight;
      this.subscribe = this.$frontmatter.subscribe || {};
      this.title = this.$frontmatter.title || this.$siteTitle;
    },
  },
  watch: {
    '$route.path': function() {
      this.refreshData();
    },
  },
};
</script>

<style lang="stylus">
#content
  margin-top: 0
  #hero
    background-image: url("/images/space.jpg")
    background-repeat-y: repeat
    margin-top: -1em
    .hero-inner
      display: flex
      background-color: rgba(#ffffff, .97)
      text-align: center
      padding: 4em 2em
    h1
      padding-top: 0
      margin-top: .5em
      font-size: 5em
    .inner
      max-width: 900px
      align-self: flex-end
    .byline
      color: lighten($landoBlue, 20%)
      p
        line-height: 2
        font-size: 2em
  #hs_form
    .inner
      max-width: 900px
.join-alliance
  #content
    #subscribe
      .inner
        max-width: 900px
    .subscribe
      padding: 5em
      margin: auto
      background-color: #024164;
      text-align: left
      h1, h2, h3
        color: #fff
        font-family: "Helvetica Neue", Arial, sans-serif
        font-size: 3.75em
        margin: 0
        padding: 0
        border: 0
        letter-spacing: -2px
        line-height: 1
        font-weight: bold;
    .subscribe-form
      padding-top: 2em
      margin: 0 auto
      box-sizing: border-box
      .button
        font-size: 1.6em
    .subscribe-input
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
@media (max-width: $MQMobile)
  .join-alliance
    #content
      #subscribe
        .inner
          width: 90%
      .subscribe
        padding: 2em
        .button
          font-size: 1.2em
          width: 100%
        form
          margin: auto
        h1, h2, h3
          font-size: 3em
  #content
    #hero
      h1
        font-size: 4em
      .byline
        p
          font-size: 1.5em
@media (max-width: $MQMobileNarrow)
  #content
    #hero
      h1
        font-size: 2.8em
      .byline
        font-size: 1em
</style>
