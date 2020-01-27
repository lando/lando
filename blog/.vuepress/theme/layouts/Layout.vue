<template>
  <div>
    <PostList
      :title="tagTitle"
      v-if="$pagination"
    />
    <Content v-else />
  </div>
</template>


<script>
import PostList from '@theme/components/PostList.vue';

export default {
  components: {PostList},
  computed: {
    tagTitle() {
      if (!this.$currentTag) {
        return 'all';
      } else {
        return this.$currentTag.key;
      }
    },
  },
};
</script>

<style lang="stylus">
</style>
