<template>
  <ParentLayout>
    <CarbonAds v-if="showAds" slot="sidebar-top"/>
    <LayoutSponsors slot="page-top"/>
  </ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue';
import CarbonAds from '@theme/components/CarbonAds.vue';
import LayoutSponsors from '@theme/components/LayoutSponsors.vue';
export default {
  components: {
    ParentLayout,
    CarbonAds,
    LayoutSponsors,
  },
  computed: {
    showAds() {
      return this.$frontmatter.home ? !this.$frontmatter.home : true;
    },
  },
};
</script>
