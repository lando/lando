<template>
  <div id="made-by">
    <h3>Made By</h3>
    <a href="https://thinktandem.io/" target="_blank">
      <img src="/images/tandem.png" style="width:160px" alt="Tandem Logo">
      <br>
      <span>An agency-incubator that is magical to work at and with</span>
    </a>
  </div>
</template>

<script>
</script>

<style lang="stylus">
#made-by
  width: 25%;
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  padding: 1em 2em;
  h3
    margin 0
  a
    color: #4e6e8e
  a, span, img
    display: inline-block
    vertical-align: middle
  img
    margin: 15px
@media (max-width: $MQMobile)
  #made-by
    span
      display: block
    img
      width: 125px
</style>
