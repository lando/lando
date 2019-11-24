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
    <div id="tiers" slot="page-bottom">
      <div class="inner">
        <SponsorshipTiers />
      </div>
      <div class="smaller-inner">
        <h3 class="join-sponsors">Join our great list of sponsors</h3>
        <Patriots />
      </div>
    </div>
  </ParentLayout>
</template>

<script>
// Lando components
import ParentLayout from '@theme/layouts/Layout.vue';
import Patriots from '@theme/components/Patriots.vue';
import SponsorshipTiers from '@theme/components/SponsorshipTiers.vue';

export default {
  components: {ParentLayout, Patriots, SponsorshipTiers},
  data() {
    return {
      byline: '',
      title: '',
    };
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      this.byline = this.$frontmatter.byline || '';
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
  .join-sponsors
    text-align: center
    color: $landoPink
@media (max-width: $MQMobile)
  #content
    #hero
      h1
        font-size: 4em
      .byline
        p
          font-size: 1.5em
    #tiers
      .inner
        text-align: center
      .price-tier-third
        width: 90%
</style>
