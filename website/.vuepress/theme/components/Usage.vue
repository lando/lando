<template>
  <div id="whos">
    <div class="inner">
      <h2>Wait... so who is using this again?</h2>

      <div class="byline">
        Lando is used by professional developers, leading digital agencies, universities and non-profits. It's also the engine that powers tools like <a href="https://pantheon.io/localdev" target="_blank">Pantheon Localdev</a>.
      </div>

      <div class="current-users">
        <div class="current-users-top">BATTLE TESTED BY</div>
        <div class="current-users-number">{{ currentUsers }}</div>
        <div class="current-users-bottom">USERS AND COUNTING</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      growthRate: 0.0000314,
      startingTime: 1565701419,
      startingUsers: 10342,
    };
  },
  computed: {
    currentUsers() {
      const now = Date.now() / 1000;
      const secondsSince = now - this.startingTime;
      const currentUsers = Math.floor(secondsSince * this.growthRate) + this.startingUsers;
      return currentUsers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
  },
};
</script>

<style lang="stylus">
#whos
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  background-color: rgba($landoPink, .92)
  padding-bottom: 5%
  h2
    color: #ffffff
    font-size: 3.3em
  .inner
    max-width: 900px
    margin: 0 auto
    text-align: center
    padding: 0 1.5em
  .byline
    color: lighten($landoPink, 90%)
    padding-top: 1.2em
    padding-bottom: 1.2em
    font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
    font-size: 1.7em
    word-spacing: 10px
    word-spacing: 0.05em
    line-height: 1.4
    a
      color: lighten($landoPink, 90%)
    a:hover
      text-decoration: underline
  .current-users
    color: #ffffff
    padding-top: 2em
    padding-bottom: 2em
  .current-users-number
    font-family: "Poppins", "Helvetica Neue", Arial, sans-serif
    font-size: 6.7em
    color: #ffffff
  .current-users-top,
  .current-users-bottom
    color: #ffffff
    letter-spacing: .5em
  .current-users-top
    font-size: 1.25em
    margin-bottom: -25px
  .current-users-bottom
    font-size: 1.1em
    margin-top: -15px
@media (max-width: $MQMobile)
  #whos
    .current-users-number
      font-size: 5.4em
    .current-users-top
      font-size: 1em
    .current-users-bottom
      font-size: .85em
</style>
