<template>
  <div id="sponsorship-tiers" slot="page-bottom">
    <div v-for="tier in tiers" :key="tier.level" class="price-tier price-tier-third">
      <Tier
        :benefits="tier.benefits"
        :color="tier.color"
        :level="tier.level"
        :link="tier.link"
        :link-text="tier.linkText"
        :other-links="tier.otherLinks"
        :price="tier.price"/>
    </div>
  </div>
</template>

<script>
// Lando components
import Tier from '@theme/components/Tier.vue';

export default {
  components: {Tier},
  data() {
    return {
      tiers: [
        {
          benefits: [
            {value: 'support', key: 'get better community support'},
            {value: 'bugs & features', key: 'get more bug fixes and features'},
            {value: 'shoutout', key: 'get a shoutout on twitter and anywhere else we list sponsors'},
            {value: 'swag', key: 'get a yearly surprise swag benefit be it shirt, mug, hoodie or other'},
            {value: '', key: 'hide-1'},
            {value: '', key: 'hide-2'},
            {value: '', key: 'hide-3'},
          ],
          color: 'blue',
          level: 'developer',
          link: 'https://github.com/sponsors/lando',
          price: '4',
        },
        {
          benefits: [
            {value: 'advertise', key: 'get your logo featured anywhere we list sponsors'},
            {value: 'market', key: 'get on demand retweets of your content and an initial twitter shoutout'},
            {value: 'early access', key: 'get exclusive early access to new features'},
            {value: 'surveys', key: 'participate in quarterly surveys to help us prioritize new features and bugs'},
            {value: '', key: 'hide-1'},
            {value: '', key: 'hide-2'},
          ],
          color: 'green',
          level: 'team',
          link: 'https://github.com/sponsors/lando',
          price: '99',
        },
        {
          benefits: [
            {value: 'advertise', key: 'get prominent logo placement of your choosing on our websites and digital marketing'},
            {value: 'market', key: 'get on demand retweets of your orgs content and an initial twitter shoutout'},
            {value: 'connect', key: 'get a private slack channel and regular meetings with the lando team to plan out your needs'},
            {value: 'tailor', key: 'get dedicated hours from the lando team for bugs, features, training or other services'},
          ],
          level: 'special',
          link: 'https://lando.dev/contact/',
          linkText: 'Contact Us',
          otherLinks: [
            {name: 'Plan Details', url: 'https://github.com/sponsors/lando'},
            {name: 'Read More', url: 'https://blog.lando.dev/2020/02/06/why-your-pass-should-sponsor-lando/'},
          ],
          price: '999',
        },
      ],
    };
  },
};
</script>

<style lang="stylus">
#content
  #tiers
    .price-tier-third
      display: inline-block
      vertical-align: top
      width: 30%
      padding-left: 1em
      padding-right: 1em
@media (max-width: $MQMobile)
    #tiers
      .inner
        text-align: center
      .price-tier-third
        width: 90%
</style>
