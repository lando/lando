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
        <div v-for="tier in tiers" :key="tier.level" class="price-tier price-tier-third">
          <Tier
            :benefits="tier.benefits"
            :color="tier.color"
            :level="tier.level"
            :link="tier.link"
            :price="tier.price"/>
        </div>
      </div>
    </div>
  </ParentLayout>
</template>

<script>
// Lando components
import ParentLayout from '@theme/layouts/Layout.vue';
import Tier from '@theme/components/Tier.vue';

export default {
  components: {ParentLayout, Tier},
  data() {
    return {
      byline: '',
      title: '',
      tiers: [
        {
          benefits: [
            {value: 'shoutout', key: 'on twitter and our websites'},
            {value: 'swag ', key: 'a shirt, mug, etc every year'},
            {value: 'shoutout', key: 'on twitter and our websites'},
            {value: 'swag ', key: 'a shirt, mug, etc every year'},
          ],
          color: 'blue',
          level: 'developer',
          link: 'https://github.com/sponsors/lando?preview=true',
          price: '4',
        },
        {
          benefits: [
            {value: 'advert', key: 'my logo featured on Lando websites'},
            {value: 'marketing', key: 'on-demand retweets of my content'},
            {value: 'early access', key: 'exclusive accesss to new features'},
            {value: 'surveys', key: 'help us prioritize new features and bugs'},
          ],
          color: 'green',
          level: 'team',
          link: 'https://github.com/sponsors/lando?preview=true',
          price: '99',
        },
        {
          benefits: [
            {value: 'advert', key: 'my logo featured on Lando websites'},
            {value: 'marketing', key: 'on-demand retweets of my content'},
            {value: 'early access', key: 'exclusive accesss to new features'},
            {value: 'surveys', key: 'help us prioritize new features and bugs'},
          ],
          level: 'special',
          link: 'https://github.com/sponsors/lando?preview=true',
          price: '999',
        },
      ],
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
  #tiers
    .price-tier-third
      display: inline-block
      vertical-align: top
      width: 30%
      padding-left: 1em
      padding-right: 1em
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
