<template>
  <div id="post">
    <div class="post-title">
      <NavLink :link="post.path">{{ post.title }}</NavLink>
    </div>

    <div class="post-meta">
      <PostHeader
        :name="post.frontmatter.author"
        :pic="post.frontmatter.pic"
        :link="post.frontmatter.link"
        :date="post.frontmatter.date"
        :location="post.frontmatter.location"
      />
    </div>

    <p class="post-summary">
      {{ post.frontmatter.description || post.description || post.frontmatter.summary || post.summary  }}
    </p>

    <p class="post-summary">
      <NavLink :link="post.path">Read More</NavLink>
    </p>

  </div>
</template>

<script>
import PostHeader from '@theme/components/PostHeader.vue';

export default {
  components: {PostHeader},
  props: {
    post: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style lang="stylus">
#post
  border: 1px dashed #ccc
  padding: 2em
  margin-top: 1em
  margin-bottom: 1em
  font-family: "PT Serif, Serif"
  .post-title
    padding-bottom: 1em
    a
      font-size: 2em
      color: $landoBlue
      text-decoration: none
  .post-meta
    font-size: 1.2em

</style>
