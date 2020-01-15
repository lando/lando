<template>
  <ParentLayout>
    <CarbonAds slot="sidebar-top"/>
    <div id="top" v-if="title" slot="page-top">
      <h1>{{ title }}</h1>
      <p>By: {{ author_name }}</p>
      <p>Date: {{ date }}</p>
      <p>Original Post: <a :href="original" target="_blank">{{ original }}</a></p>
      <p>Repo: <a :href="repo" target="_blank">{{ repo }}</a></p>
    </div>
    <div id="subscribe" slot="page-bottom">
      <div class="inner">
        <Subscribe
          title="eghwe"/>
      </div>
    </div>
  </ParentLayout>
</template>

<script>
  import CarbonAds from '@theme/components/CarbonAds.vue';
  import ParentLayout from '@parent-theme/layouts/Layout.vue';
  import Subscribe from '@theme/components/Subscribe';

  export default {
    components: {CarbonAds, ParentLayout, Subscribe},
    data() {
      return {
        title: '',
        date: '',
        original: '',
        repo: '',
        author_name: '',
        author_title: '',
        author_twitter: '',
        author_github: '',
      };
    },
    mounted() {
      this.refreshData();
    },
    methods: {
      refreshData() {
        this.title = this.$frontmatter.title || this.$siteTitle;
        this.date = this.$frontmatter.date || '';
        this.original = this.$frontmatter.original || '';
        this.repo = this.$frontmatter.repo || '';
        this.author_name = this.$frontmatter.author.name || '';
        this.author_twitter = this.$frontmatter.author.twitter || '';
      },
    },
    watch: {
      '$route.path': function() {
        this.refreshData();
      },
    },
  };
</script>

<style lang="stylus">
  #top
    max-width 740px
    margin 0 auto
    padding 4rem 2.5rem 0
</style>

