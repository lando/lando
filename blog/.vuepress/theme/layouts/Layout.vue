<template>
  <div>
    <Home v-if="$frontmatter.home" />
    <BaseListLayout v-else-if="$pagination" />
    <Content v-else />
  </div>
</template>


<script>
import Home from '@theme/components/home.vue';

export default {
  components: {Home},
};
</script>

<style lang="stylus">
</style>
