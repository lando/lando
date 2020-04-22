<template>
  <div id="ready">
    <div class="inner">
      <h2>Ready for dev liberation?</h2>
      <p><a class="button blue" href="/download/">GET LANDO!</a></p>
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
#ready
  display: flex
  justify-content: flex-end
  flex-direction: column
  background-color: darken(rgba($landoPink, .22), 13%)
  padding-bottom: 2%
  h2
    color: #ffffff;
  .inner
    margin: 0 auto
    text-align: center
    padding: 0 1.5em
@media (max-width: $MQMobile)
  #ready
    padding-bottom: 10%
    h2
      font-size: 3em
</style>
