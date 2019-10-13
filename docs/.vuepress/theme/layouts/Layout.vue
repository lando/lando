<template>
  <ParentLayout>
    <CarbonAds v-if="showAds" slot="sidebar-top"/>
  </ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue';
import CarbonAds from '@theme/components/CarbonAds.vue';
export default {
  components: {
    ParentLayout,
    CarbonAds,
  },
  computed: {
    showAds() {
      return this.$frontmatter.home ? !this.$frontmatter.home : true;
    },
  },
};
</script>
