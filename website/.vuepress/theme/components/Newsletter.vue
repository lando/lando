<template>
  <div id="news">
    <div class="inner">
      <h3><label for="member_email"><a id="newsletter">Get the latest Alliance updates</a></label></h3>
        <div id="mc_embed_signup">
          <form action="https://kalabox.us12.list-manage.com/subscribe/post?u=59874b4d6910fa65e724a4648&amp;id=613837077f" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate newsletter-form" target="_blank" novalidate>
            <div id="mc_embed_signup_scroll">
              <div class="mc-field-group">
                <input type="email" value="" placeholder="Email address" name="EMAIL" class="required email newsletter-input" id="mce-EMAIL">
              </div>
              <div id="mce-responses" class="clear">
                <div class="response" id="mce-error-response" style="display:none"></div>
                <div class="response" id="mce-success-response" style="display:none"></div>
              </div>

              <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_59874b4d6910fa65e724a4648_613837077f" tabindex="-1" value=""></div>
              <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
            </div>
          </form>
        </div>
    </div>
  </div>
</template>

<script>
</script>

<style lang="stylus">
#news
  background-color: darken($landoBlue, 12%)
  padding: 2em 0
  text-align: center
  h3
    a
      color: lighten($landoBlue, 90%)
  .button
    background-color: $accentColor
    margin: 1em 0
    font-size: 1em
    font-weight: 500
    letter-spacing: .05em
    min-width: 8em
    text-align: center
    &:not(:last-child)
      margin-right: 1%
  .newsletter-form
    position: relative
    max-width: 550px
    margin: 0 auto
    box-sizing: border-box
  .newsletter-input
    width: 100%
    box-sizing: border-box
    padding: 10px 80px 10px 20px
    height: 50px
    border-radius: 50px
    border: 1px solid #ccc
    font-size: 16px
    &:focus
      outline: none
      border-color: lighten($accentColor, 18%)
  .newsletter-button.button
    position: absolute
    padding: 4px 20px
    margin: 0
    height: calc(100% - 8px)
    right: 4px
    top: 4px
@media (max-width: $MQMobile)
  #news
    .newsletter-input
      width: 90%
</style>
