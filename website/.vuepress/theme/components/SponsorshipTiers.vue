<template>
  <div id="sponsorship-tiers" slot="page-bottom">
    <div v-for="tier in tiers" :key="tier.level" class="price-tier price-tier-third">
      <Tier
        :benefits="tier.benefits"
        :color="tier.color"
        :level="tier.level"
        :link="tier.link"
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
