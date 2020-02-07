<template>
  <div id="base-list-layout" :class="{'posts-list-wrapper': true, 'blog-home': isHome}">
    <div v-if="isHome" class="home-header">
      <h1>Welcome to a tech blog by and for professional developers</h1>
      <div class="home-header-byline">
        We share things about tech, DevOps, workflows and doing the developments to help make other developers lives easier.
      </div>
    </div>
    <CarbonAds :class="{'carbon-ads-home': isHome}"/>
    <hr v-if="isHome" />
    <h1 v-if="!isHome">{{ title }}</h1>
    <div :class="tagClass">
      <div v-if="featured" class="posts-featured">
        <PostSummary :post="featured" />
      </div>
      <div v-if="secondary" class="posts-featured-secondary">
        <div v-for="page in secondary" :key="page.key" class="ui-post">
          <PostSummary :post="page" />
        </div>
      </div>
      <div class="posts-tertiary">
        <div v-for="page in pages" :key="page.key" class="ui-post">
          <PostSummary :post="page" />
        </div>
      </div>
    </div>
    <component
      :is="paginationComponent"
      v-if="$pagination.length > 1 && paginationComponent"
    ></component>
    <Newsletter />
  </div>
</template>

<script>
import CarbonAds from '@theme/components/CarbonAds.vue';
import Vue from 'vue';
import {
  Pagination,
  SimplePagination,
} from '@vuepress/plugin-blog/lib/client/components';
import PostSummary from '@theme/components/PostSummary';

export default {
  components: {CarbonAds, PostSummary},

  props: {
    title: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      paginationComponent: null,
    };
  },

  mounted() {
    console.log(this);
  },

  computed: {
    featured() {
      if (this.top) return this.$pagination.pages.slice(0, 1)[0];
      else return undefined;
    },
    pages() {
      if (!this.top) return this.$pagination.pages;
      else return this.$pagination.pages.slice(4);
    },
    secondary() {
      if (this.top) return this.$pagination.pages.slice(1, 4);
      else return undefined;
    },
    top() {
      return this.$pagination.hasPrev === false;
    },
    isHome() {
      return this.$route.path === '/';
    },
    tagClass() {
      return (this.$currentTag) ? `posts-list ${this.$currentTag.key}` : 'posts-list';
    },
  },

  created() {
    this.paginationComponent = this.getPaginationComponent();
  },

  methods: {
    getPaginationComponent() {
      const n = THEME_BLOG_PAGINATION_COMPONENT;
      if (n === 'Pagination') {
        return Pagination;
      }

      if (n === 'SimplePagination') {
        return SimplePagination;
      }

      return Vue.component(n) || Pagination;
    },
  },
};
</script>

<style lang="stylus">
.blog-home
  hr
    border-bottom: 1px dashed #ccc
  h1
    font-size: 3.14em
  .home-header
    border-bottom: 1px dashed #ccc
  .home-header-byline
    font-size: 1.8em
    letter-spacing: 0px
    font-family: PT Serif, Serif
    color: lighten($landoGrey, 20%)
    padding-bottom: 2em
  .carbon-ads
    text-align: center
    margin: auto
    width: 50%
    padding-bottom: 1em
.posts-list-wrapper
  .carbon-ads
    position: fixed
    max-height: 100vh
    max-width: 320px
    overflow-y: auto
    padding-top: 8em
    top: 0
    right: 10px
    box-sizing: border-box
    z-index: 0
  .carbon-ads-home
    position: relative
    text-align: center
    margin: auto
    width: 50%
    padding-top: 2em
    padding-bottom: 1em
.posts-list
  &.lando
    .posts-featured
      #post
        background-color $landoPink
  &.devops
    .posts-featured
      #post
         background-color $landoBlue
  &.development
    .posts-featured
      #post
        background-color $landoGreen
  &.case-study
    .posts-featured
      #post
        background-color $landoOrange
  &.workflows
    .posts-featured
      #post
        background-color $landoGrey
.posts-featured
  #post
    border 0
    background-color $landoPink
    color #fff
    font-size 1.314em
    a
      color #fff
    a:hover
      color #fff
    .written-by
      color lighten($landoPink, 90%)
      svg
        color lighten($landoPink, 90%)
      a
        color lighten($landoPink, 90%)
      a:hover
        color #fff
    .post-title
      font-size 1.4em
      a
        color #fff
.posts-tertiary
  #post
    padding-bottom 1em
    .post-summary
      display none
    .post-title
      font-size 0.8em
    .written-by
      border 0
@media (max-width: $MQMobile)
  .posts-featured-secondary
      display block
</style>
