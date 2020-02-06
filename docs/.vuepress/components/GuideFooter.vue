<template>
  <div class="originally-appeared">
    <div v-if="repo" class="tip custom-block">
      <h3>FULL CODE EXAMPLE!</h3>
      <p>If you are interested in checking out the fully-armed and operational source code for this guide then check out <a target="_blank" :href="repo">this repo here</a>.</p>
    </div>
    <div class="original-rule"></div>
    <div class="original-article" v-if="original">
      This guide is adapted from other content. If you are interested in the original then <a target="_blank" :href="original">check it out here</a>.
    </div>
    <div class="original-article">
      Have a Lando question you'd like to see as a guide? <a target="_blank" href="https://github.com/lando/lando/issues/new/choose"> Suggest one!</a>
    </div>
    <div class="original-article">
      Want to write a Lando guide? <a href="./../contrib/guides-intro.html"> Learn how!</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuideFooter',
  props: {
    original: {
      type: String,
      default: '',
    },
    repo: {
      type: String,
      default: '',
    },
    test: {
      type: String,
    },
  },
};
</script>

<style lang="stylus">
.originally-appeared
  margin-top: 2rem
  padding-top: 1rem
  img
    width: 24px
    border-radius: 100%
    float: right
    position: relative
    bottom: 6px
  .original-article
    font-size: .85em
    font-style: italic
  .original-rule
    border-bottom: 1px dotted #ddd
    padding-top: 1em
    margin-bottom 1em
  .custom-block.tip
    border-color: $landoGreen

</style>
