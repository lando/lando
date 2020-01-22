<template>
  <div class="originally-appeared">
    <div class="original-rule"></div>
    <ul v-if="tags" class="post-meta-tags">
      <PostTag v-for="tag in resolvedTags" :key="tag" :tag="tag" />
    </ul>
    <hr>
    <div class="original-article" v-if="original">
      This guide is adapted from other content. If you are interested in the original then <a target="_blank" :href="original">check it out here</a>.
    </div>
    <div class="original-article">
      Want to contribute content here? <a href="https://docs.lando.dev/contrib/blog-intro.html"> Learn how!</a>
    </div>
  </div>
</template>

<script>
import PostTag from '@theme/components/PostTag.vue';

export default {
  components: {PostTag},
  name: 'ArticleFooter',
  props: {
    original: {
      type: String,
      default: '',
    },
    tags: {
      type: [Array, String],
    },
  },
  computed: {
    resolvedTags() {
      if (!this.tags || Array.isArray(this.tags)) return this.tags;
      return [this.tags];
    },
  },
};
</script>

<style lang="stylus">
.originally-appeared
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
