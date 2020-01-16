<template>
  <div :class="{ subscribe: true, 'subscribe-dark': theme === 'dark' }" :style="customStyles">
    <script src="//cdn.jsdelivr.net/npm/canvas-confetti@1.0.1/dist/confetti.browser.min.js"></script>
    <h3>{{ title }}</h3>
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
        <input
          disabled="true"
          class="hidden-field"
          name="alliance_role"
          type="text"
          :value="getAllianceGroupList()" />
        <input disabled="true" class="hidden-field" name="alliance_member" type="text" :value="true" />
        <input disabled="true" class="hidden-field" name="alliance_joined" type="text" :value="today()" />
      </div>

      <div v-if="showSponsors" class="subscribe-sponsors">
        <div v-for="(description, key) in sponsorRoles" :key="key" class="subscribe-sponsors-wrapper">
          <input
            type="radio"
            class="subscribe-sponsors-radio"
            :id="key"
            :value="uppercase(key)" v-model="sponsor">
          <label :for="key">{{ uppercase(key) }} - </label><small>{{ description }}</small>
        </div>
        <input disabled="true" class="hidden-field" name="sponsorship_level" type="text" :value="sponsor" />
        <input disabled="true" class="hidden-field" name="verified_sponsor" type="text" :value="true" />
        <input disabled="true" class="hidden-field" name="sponsor_joined" type="text" :value="today()" />
        <p>Check out <a href="https://github.com/sponsors/lando" target="_blank">https://github.com/sponsors/lando</a> if you are unclear
          on how to match up the sponsorship levels. Email <strong>sponsorships@lando.dev</strong> if things don't seem to match up anymore.</p>
      </div>

      <input v-if="passcode"
        type="password"
        class="subscribe-input"
        v-model="pw"
        placeholder="Authorization code"
        name="passcode" />

      <input
        :disabled="buttonDisabled"
        type="email"
        v-model="email"
        placeholder="Email address"
        name="email"
        :class="{ 'subscribe-input': true, disabled: buttonDisabled }" />

      <div v-if="showDevNetwork" class="subscribe-devnetwork">
        <div class="subscribe-devnetwork-checkbox">
          <input
            type="checkbox"
            id="WORK"
            value="LOOKING FOR WORK" v-model="userGroups">
          <label for="WORK">I'm a developer looking for contract work, full time employment or other opportunities</label>
          <input
            disabled="true"
            class="hidden-field"
            name="available_for_contract_work"
            type="text"
            :value="lookingWork" />
        </div>
        <div class="subscribe-devnetwork-checkbox">
          <input
            type="checkbox"
            id="HIRE"
            value="LOOKING TO HIRE" v-model="userGroups">
          <label for="HIRE">I'm an employer looking to hire contractors or employees</label>
          <input
            disabled="true"
            class="hidden-field"
            name="looking_for_developers_for_contract_or_hire"
            type="text"
            :value="lookingHire" />
        </div>
      </div>

      <div v-if="error" class="subscribe-error">{{ error }}. Try again!</div>
      <div v-if="success" class="subscribe-success">{{ success }}</div>
      <input
        :class="{ button: true, disabled: buttonDisabled || !email }"
        :disabled="buttonDisabled || !email"
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
const sponsorRoles = {
  hero: '$4',
  herald: '$9',
  ally: '$99',
  partner: '$999',
  patriot: '$1776',
  special: 'Special sponsorship terms',
  former: 'No longer a sponsor',
  none: 'Remove as a sponsor',
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
    passcode: {
      type: String,
      default: null,
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
    showSponsors: {
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
      buttonDisabled: this.passcode,
      email: '',
      error: '',
      pw: '',
      sponsor: '',
      sponsorRoles,
      success: '',
      userGroups: [],
    };
  },
  computed: {
    lookingHire() {
      return this.userGroups.includes('LOOKING TO HIRE');
    },
    lookingWork() {
      return this.userGroups.includes('LOOKING FOR WORK');
    },
  },
  methods: {
    clear() {
      this.buttonDisabled = this.passcode;
      this.error = '';
      this.pw = '';
      this.sponsor = '';
      this.success = '';
      this.userGroups = [];
    },
    encrypt(data) {
      return crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(data)).then(buf => {
        return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
      });
    },
    getAllianceGroupList() {
      return this.userGroups.filter(value => {
        return value !== 'LOOKING FOR WORK' && value !== 'LOOKING TO HIRE';
      }).join(';');
    },
    getDefaultGroups() {
      const defaults = {};
      if (this.showDevNetwork) {
        Object.assign(defaults, {
          '57cd8bf7a6': false,
          '99872980bb': false,
        });
      }
      if (this.showAlliance) {
        Object.assign(defaults, {
          '36113a4526': false,
          '2abe119d23': false,
          'f020990e25': false,
          '4a81e85359': false,
          'f63decb94d': false,
          '20270ed04e': false,
          '8a2f0956f5': false,
        });
      }
      if (this.showSponsors) {
        Object.assign(defaults, {
          '1b08452e4a': false,
          '44db509e64': false,
          '270e92b16a': false,
          'd7754c3552': false,
          'dceea16371': false,
          'b1a136b4a2': false,
          '517d319375': false,
          'f7a6223e35': false,
        });
      }
      return defaults;
    },
    getGroups() {
      if (this.sponsor) this.groups.push(this.sponsor);
      return this.groups.concat(this.userGroups);
    },
    today() {
      return new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime();
    },
    subscribe() {
      // UX
      this.buttonDisabled = true;
      this.error = '';
      this.success = '';
      // Set data
      const data = {defaults: this.getDefaultGroups(), email: this.email, groups: this.getGroups()};
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
    'pw': function() {
      this.encrypt(this.pw).then(hash => {
        if (hash === this.passcode) {
          this.buttonDisabled = this.buttonDisabled && false;
        } else {
          this.buttonDisabled = true;
        }
      });
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
  .hidden-field
    visibility: hidden
  .subscribe-alliance,
  .subscribe-devnetwork,
  .subscribe-sponsors
    padding-top: 2em
    padding-bottom: 2em
    p
      color: lighten($landoBlue, 90%)
      font-size: 1.2em
    .subscribe-alliance-wrapper,
    .subscribe-devnetwork-checkbox,
    .subscribe-sponsors-wrapper
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
    margin-bottom: 1em
    height: 50px
    border-radius: 50px
    border: 1px solid #ccc
    font-size: 16px
    background-color: lighten($landoBlue, 96%)
    &:focus
      outline: none
      border-color: lighten($landoPink, 18%)
    &.disabled
      opacity: .5
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
