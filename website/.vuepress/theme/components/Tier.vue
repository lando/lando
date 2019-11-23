<template>
  <div id="lando-tier">
    <div class="lando-tier-content">
      <div class="lando-head-price">
        <div class="lando-head-content">
          <div v-bind:class="headerColor"></div>
          <div class="head">
            <span>{{ level }}</span>
            <div class="starting">starting at</div>
          </div>
        </div>
        <div class="lando-price-tag">
          <span class="price">
            <span class="sign">$</span>
            <span class="currency">{{ price }}</span>
            <span class="month">/MON</span>
          </span>
        </div>
      </div>
      <div class="lando-tier-list">
        <ul v-for="benefit in benefits" :key="benefit.key">
          <li>
            <div class="benefit-key">{{ benefit.value }}</div>
            <div class="benefit-value">{{ benefit.key }}</div>
          </li>
        </ul>
      </div>
      <div :class="priceButtonColor">
        <a :href="link" target="_blank"><i class="devicon-github-plain"></i>Sponsor</a>
      </div>
      <div class="other-links">
        <span class="other-link" v-for="other in otherLinks" :key="other.name">
          <a :href="other.url" target="_blank">{{other.name}}</a>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    benefits: {
      type: Array,
      default: () => ([]),
    },
    color: {
      type: String,
      default: 'pink',
    },
    level: {
      type: String,
      default: 'Basic',
    },
    link: {
      type: String,
      default: 'https://github.com/sponsors/lando?preview=true',
    },
    otherLinks: {
      type: Array,
      default: () => ([
        {name: 'Patreon', url: 'https://www.patreon.com/devwithlando'},
        {name: 'OpenCollective', url: 'https://opencollective.com/devwithlando'},
      ]),
    },
    price: {
      type: String,
      default: '4',
    },
  },
  data() {
    return {};
  },
  computed: {
    headerColor() {
      return `head_bg head_bg_${this.color}`;
    },
    priceButtonColor() {
      return `lando-price-button lando-price-button-${this.color}`;
    },
  },
};
</script>

<style lang="stylus">
#lando-tier
  margin: 50px 0 50px 0
  i
    font-size: 1em
    padding-right: .3em
    position: relative
    top: 1px
  .other-links
    padding-bottom: 25px
    a
      color: $landoBlue
      font-size: .7em
      text-transform: uppercase
    .other-link
      margin-right: 5px
      &:after
        content: ' |'
      &:last-child
        &:after
          content: ''
  .lando-tier-content
    border-bottom: 1px solid #cccccc
    background-color: lighten(#efefef, 90%)
    overflow: hidden
    position: relative
    text-align: center
    .lando-head-price
      background-color: #f6f6f6
      margin: 0 0 20px 0
      .lando-head-content
        margin: 0 0 50px 0
        .head_bg
          border-style: solid
          border-width: 90px 1411px 23px 399px
          position: absolute
        .head
          padding-top: 40px
          position: relative
          z-index: 1
          span
            color: #ffffff
            font-size: 28px
            letter-spacing: 2px
            text-transform: uppercase
          .starting
            color: #efefef
      .lando-price-tag
        padding: 0 0 20px
        .price
          display: block
          .sign
            color: #414141
            display: inline-block
            font-size: 28px
            vertical-align: middle
          .currency
            color: #414141
            font-size: 60px
            letter-spacing: -2px
            line-height: 60px
            vertical-align: middle
          .cent
            color: #414141
            display: inline-block
            font-size: 24px
            vertical-align: bottom
        .month
          color: #414141
          font-size: 18px
          letter-spacing: 3px
          vertical-align: bottom
    .lando-tier-list
      ul
        list-style: none
        padding: 0
        margin: 0
        li
          color: #a7a7a7
          font-size: 18px
          padding: 15px 0
          transition: all 0.3s ease-in-out 0s
          .benefit-key
            text-transform: uppercase
            font-size: 1.1em
            color: #414141
          .fa
            padding: 0 10px
          .benefit-value
            width: 95%
            margin: auto
    .lando-price-button
      margin: 20px 0 10px
      a
        border-radius: 50px
        display: inline-block
        font-size: 18px
        outline: medium none
        padding: 12px 30px
        text-decoration: none
        text-transform: uppercase
  .lando-tier-content:hover .lando-price-button a,
  .lando-tier-content.active .lando-price-button a
    color: #fff

  .head_bg_pink
    border-color: $landoPink rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) $landoPink
  .lando-price-button-pink a
    border: 1px solid $landoPink
    color: $landoPink
    border-color: $landoPink
  .lando-tier-content:hover .lando-price-button-pink a,
  .lando-tier-content.active .lando-price-button-pink a
    background-color: $landoPink

  .head_bg_blue
    border-color: $landoBlue rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) $landoBlue
  .lando-price-button-blue a
    border: 1px solid $landoBlue
    color: $landoBlue
    border-color: $landoBlue
  .lando-tier-content:hover .lando-price-button-blue a,
  .lando-tier-content.active .lando-price-button-blue a
    background-color: $landoBlue

  .head_bg_green
    border-color: #2ECC71 rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) #2ECC71
  .lando-price-button-green a
    border: 1px solid #2ECC71
    color: #2ECC71
    border-color: #2ECC71
  .lando-tier-content:hover .lando-price-button-green a,
  .lando-tier-content.active .lando-price-button-green a
    background-color: #2ECC71
</style>
