<template>
  <div :class="{ subscribe: true, 'subscribe-dark': theme === 'dark' }" :style="customStyles">
    <h3 v>{{ title }}</h3>
    <div v-if="error" class="subscribe-error">{{ error }}. Try again!</div>
    <div v-if="success" class="subscribe-success">{{ success }}</div>
    <form id="subscribe-user" @submit.prevent="subscribe">
      <input
        :disabled="buttonDisabled"
        type="email"
        v-model="email"
        placeholder="Email address"
        name="email"
        class="newsletter-input" />
      <input
        :class="{ button: true, disabled: buttonDisabled }"
        :disabled="buttonDisabled"
        type="submit"
        :value="button"
        name="subscribe" />
    </form>
  </div>
</template>

<script>
import confetti from 'canvas-confetti';

export default {
  props: {
    alliance: {
      type: Array,
      default: () => ([]),
    },
    button: {
      type: String,
      default: 'Subscribe',
    },
    customStyles: {
      type: Object,
      default: () => ({
        width: '90%',
      }),
    },
    devNetwork: {
      type: Array,
      default: () => ([]),
    },
    personas: {
      type: Array,
      default: () => (['NEWSLETTER']),
    },
    title: {
      type: String,
      default: 'Get the latest updates',
    },
    theme: {
      type: String,
      default: 'light',
    },
  },
  data() {
    return {
      email: '',
      error: '',
      buttonDisabled: false,
      success: '',
    };
  },
  methods: {
    subscribe() {
      // UX
      this.buttonDisabled = true;
      this.error = '';
      this.success = '';
      // Set data
      const data = {
        alliance: this.alliance,
        devNetwork: this.devNetwork,
        email: this.email,
        personas: this.personas,
      };

      // Wait and then do things
      setTimeout(() => this.$api(this.$page.apiUrl).put('/v1/subscribe', data).then(response => {
        this.success = 'Success! You\'ve subscribed!';
        this.buttonDisabled = false;
        this.email = '';
        confetti({
          particleCount: 100,
          spread: 270,
          origin: {
            y: 0.6,
          },
        });
      })
      .catch(error => {
        this.buttonDisabled = false;
        this.email = '';
        this.error = error.message;
      }), 1000);
    },
  },
};
</script>

<style lang="stylus">
.subscribe
  margin: auto
  width: 90%
  padding: 2em 0
  text-align: center
  h3
    color: $landoPink
  &.subscribe-dark
    background-color: darken($landoBlue, 12%)
    h3
      color: lighten($landoBlue, 90%)
  .button
    text-transform: uppercase
    background-color: $landoPink
    margin: 1em 0
    font-size: 1.2em
    font-weight: 500
    letter-spacing: .05em
    min-width: 8em
    text-align: center
    &:not(:last-child)
      margin-right: 1%
    &.disabled
      opacity: .5
  .newsletter-input
    width: 100%
    box-sizing: border-box
    padding: 10px 80px 10px 20px
    height: 50px
    border-radius: 50px
    border: 1px solid #ccc
    font-size: 16px
    background-color: lighten($landoBlue, 96%)
    &:focus
      outline: none
      border-color: lighten($landoPink, 18%)
  .subscribe-error,
  .subscribe-success
    padding: 1em;
    color: red;
    text-transform: uppercase
    font-weight: 800
    font-size: 0.75rem
  .subscribe-success
    color: $landoPink

@media (max-width: $MQMobile)
  .subscribe
    .newsletter-input
      width: 90%
</style>
