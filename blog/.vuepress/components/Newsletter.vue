<template>
  <div class="newsletter post-subscribe">
    <div class="newsletter__wrap">
      <div class="newsletter__title">Join Us</div>
      <div class="newsletter__content">Stay up to date with new content and Lando updates!</div>
      <Subscribe
        successMessage="More awesome blog material will be heading your way!"
        :customStyles="stylez"
        title=""
      />
    </div>
  </div>
</template>

<script>
import NewsletterStyles from '@parent-theme/components/Newsletter.vue';
import Subscribe from '@theme/components/Subscribe.vue';

export default {
  name: 'Newsletter',
  components: {NewsletterStyles, Subscribe}, // eslint-disable-line
  data() {
    return {
      stylez: {
        width: '100%',
      },
    };
  },
};
</script>

<style lang="stylus">
.post-subscribe
  .subscribe
    width: 100%
    padding: 0
  .subscribe-form
    display: grid
    grid-template-columns: 1fr 1fr
    grid-gap: 10px
  .subscribe .button
    font-size: inherit
    border: none
    cursor: pointer
    background: #ed3f7a
    color: #fff
    padding: 0.6rem 1.2rem
    box-sizing: border-box
    border-radius: 3px
    width: 100%
    outline: none
    text-transform: none
    font-weight: 400
    height: auto
  .subscribe-input
    background-color: #fff
    font-size: inherit
    border: 1px solid rgba(0,0,0,0.05)
    width: 100%
    padding: 0.6rem 1.2rem
    box-sizing: border-box
    border-radius: 3px
    margin-bottom: 0.8rem
    outline: none
    height: auto
    margin: 1em 0;
    &:focus
      outline: none
      border-size: 0
      border-color: transparent
  @media (max-width: $MQMobile)
    .subscribe-form
        display block
</style>
