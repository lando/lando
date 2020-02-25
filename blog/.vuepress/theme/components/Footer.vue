<template>
  <div id="footer">
    <div class="footer-top">
      <div class="inner">
        <div class="footer-image">
          <img src="/images/logo-pink-small.png" alt="lando logo">
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div>
        <a target="_blank" href="https://docs.lando.dev/contrib/team.html">Contributors</a>
      </div>
      <div>
        <a target="_blank" href="https://twitter.com/devwithlando">Follow us</a> |
        <a target="_blank" href="https://github.com/lando/lando">GitHub</a> |
        <a target="_blank" href="https://docs.lando.dev">Documentation</a> |
        <a target="_blank" href="https://events.lando.dev/">Events & Meetups</a> |
        <a target="_blank" href="https://lando.dev/sponsor">Sponsor</a> |
        <a target="_blank" href="https://lando.dev/join">Join the Alliance</a>
      </div>
      <div>
        <a href="/terms/">Terms</a> |
        <a href="/privacy/">Privacy Policy</a>
      </div>
    </div>
    <div class="footer-copyright">Copyright © 2016-present Tandem</div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="stylus">
#footer
  background-color: white
  text-align: center
  .footer-top
    padding: 2em
    border-top: 1px dashed lighten($landoGrey, 80%)
    max-width: $contentWidth
    margin: auto
    background-color: white
  .footer-bottom
    max-width: $contentWidth
    margin: auto
    text-align: center
    padding-bottom: 2em
    a
      color: $landoGrey
      font-family: PT Serif, Serif
  .footer-copyright
    background-color: lighten($landoGrey, 95%)
    color: lighten($landoGrey, 30%)
    padding: 1em
    margin: auto
    text-align: center
    font-family: PT Serif, Serif
</style>
