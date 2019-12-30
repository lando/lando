<template>
  <div :class="{ subscribe: true, 'subscribe-dark': theme === 'dark' }" :style="customStyles">
    <h3 v>{{ title }}</h3>
    <form id="subscribe-user" @submit.prevent="subscribe" class="subscribe-form">
      <div v-if="showAlliance" class="subscribe-alliance">
        <div v-for="(description, key) in allianceRoles" :key="key" class="subscribe-alliance-wrapper">
          <input
            type="checkbox"
            class="subscribe-alliance-checkbox"
            :id="key"
            :value="uppercase(key)" v-model="userGroups">
          <label :for="key">{{ uppercase(key) }} - </label><small>{{ description }}</small>
        </div>
      </div>
      <input
        :disabled="buttonDisabled"
        type="email"
        v-model="email"
        placeholder="Email address"
        name="email"
        class="subscribe-input" />
      <div v-if="showDevNetwork" class="subscribe-devnetwork">
        <div class="subscribe-devnetwork-checkbox">
          <input
            type="checkbox"
            id="WORK"
            value="LOOKING FOR WORK" v-model="userGroups">
          <label for="WORK">I'm a developer looking for contract work, full time employment or other opportunities</label>
        </div>
        <div class="subscribe-devnetwork-checkbox">
          <input
            type="checkbox"
            id="HIRE"
            value="LOOKING TO HIRE" v-model="userGroups">
          <label for="HIRE">I'm an employer looking to hire contractors or employees</label>
        </div>
      </div>
      <div v-if="error" class="subscribe-error">{{ error }}. Try again!</div>
      <div v-if="success" class="subscribe-success">{{ success }}</div>
      <input
        :class="{ button: true, disabled: buttonDisabled }"
        :disabled="buttonDisabled"
        type="submit"
        :value="buttonLabel"
        name="subscribe" />
    </form>
  </div>
</template>

<script>
// Const
const allianceRoles = {
  administrator: 'Help manage the Lando Alliance, our sponsors, marketing, outreach, event logistics, etc!',
  blogger: 'Contribute case studies, training materials and other less-technical content to the Lando blog and get credit for it!',
  contributor: 'Work on Lando\'s code, help manage issues, improve documentation and engage in community support!',
  evangelist: 'Present, train or speak about Lando at various meetups, camps and conferences and generally spread the good word far and wide!',
  guider: 'Share working examples of my Lando config (eg browsersync) on the Lando site and get credit for it!',
  sponsor: 'Sponsor Lando and get swag, shoutouts on Twitter and our websites and other exclusive benefits',
  upseller: 'Help convince my org, boss or relevant decision maker to sponsor Lando or purchase Lando support/services!',
};
const defaultGroups = {
  '36113a4526': false,
  '2abe119d23': false,
  'f020990e25': false,
  '4a81e85359': false,
  'f63decb94d': false,
  '20270ed04e': false,
  '8a2f0956f5': false,
  '57cd8bf7a6': false,
  '99872980bb': false,
};

export default {
  props: {
    buttonLabel: {
      type: String,
      default: 'Subscribe',
    },
    customStyles: {
      type: Object,
      default: () => ({
        width: '90%',
      }),
    },
    groups: {
      type: Array,
      default: () => (['NEWSLETTER']),
    },
    redirect: {
      type: String,
      default: null,
    },
    showAlliance: {
      type: Boolean,
      default: false,
    },
    showDevNetwork: {
      type: Boolean,
      default: false,
    },
    successMessage: {
      type: String,
      default: 'Success! You\'ve subscribed!',
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
      allianceRoles,
      email: '',
      error: '',
      buttonDisabled: false,
      success: '',
      userGroups: [],
    };
  },
  methods: {
    clear() {
      this.success = '';
      this.error = '';
    },
    getDefaultGroups() {
      return (this.showDevNetwork || this.showAlliance) ? defaultGroups : {};
    },
    subscribe() {
      // UX
      this.buttonDisabled = true;
      this.error = '';
      this.success = '';
      // Set data
      const data = {defaults: this.getDefaultGroups(), email: this.email, groups: this.groups.concat(this.userGroups)};
      // Wait and then do things
      setTimeout(() => this.$api(this.$page.apiUrl).put('/v1/subscribe', data).then(response => {
        this.success = this.successMessage;
        this.buttonDisabled = false;
        this.email = '';
        if (this.redirect) this.$router.push(this.redirect);
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
    uppercase(string) {
      return string.toUpperCase();
    },
  },
  watch: {
    '$route.path': function() {
      this.clear();
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
  .subscribe-alliance,
  .subscribe-devnetwork
    padding-top: 2em
    padding-bottom: 2em
    .subscribe-alliance-wrapper,
    .subscribe-devnetwork-checkbox
      padding-top: 1em
      padding-bottom: 1em
      input.subscribe-alliance-checkbox
        font-size: 16px
      label
        cursor: pointer
        color: lighten($landoBlue, 90%)
        font-size: 2em
        font-weight: 800
      small
        font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
        color: lighten($landoBlue, 90%)
        text-align: center;
        font-size: 1.4em;
        letter-spacing: 0;
    .subscribe-devnetwork-checkbox
      padding-top: .5em
      padding-bottom: .5em
      label
        font-size: 1em
  .subscribe-input
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
    .subscribe-input
      width: 90%
</style>
