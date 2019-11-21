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
  </ParentLayout>
</template>

<script>
// Lando components
import ParentLayout from '@theme/layouts/Layout.vue';
import HSForm from '@theme/components/HSForm';

export default {
  components: {HSForm, ParentLayout},
  data() {
    return {
      byline: '',
      form: '',
      formHeight: 1000,
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
  .newsletter-form
    padding-top: 2em
    position: relative
    max-width: 75%
    margin: 0 auto
    box-sizing: border-box
    .button
      font-size: 1.6em
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
@media (max-width: $MQMobile)
  #content
    .newsletter-form
      max-width: 90%
      .button
        font-size: 1.2em
        width: 100%
    #hero
      h1
        font-size: 4em
      .byline
        p
          font-size: 1.5em
@media (max-width: $MQMobileNarrow)
  #content
    #hero
      padding: 20px 10px 10px
      h1
        font-size: 3.5em
</style>
