<template>
  <div v-if="tag && content.length > 0" class="related-guides">
    <h2>Related Guides and Tutorials</h2>
    <ul>
      <li v-for="page in content" :key="page.key">
        <a :href="page.path">{{ page.title }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import {resolveSidebarItems} from '@parent-theme/util';

export default {
  name: 'RelatedGuides',
  props: {
    tag: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      content: [],
    };
  },
  mounted() {
    const guides = resolveSidebarItems(this.$page, '/guides/', this.$site, '/');
    const section = guides.find(item => item.title.toLowerCase() === this.tag.toLowerCase());
    this.content = section.children;
  },
};
</script>

<style lang="stylus">
.related-guides
  margin-top: 2rem
  padding-top: 1rem
  a
    display: block
    padding-bottom: .3em
</style>
