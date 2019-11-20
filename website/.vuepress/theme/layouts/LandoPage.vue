<template>
  <ParentLayout>
    <div id="hero" v-if="title" slot="page-top">
      <div class="hero-inner">
        <div class="inner">
          <h1>{{ title }}</h1>
          <div class="byline">
            <p>{{ byline }}</p>
          </div>
        </div>
      </div>
    </div>
    <div id="hs_form" v-if="form" slot="page-bottom">
      <div class="inner">
        <keep-alive>
          <HSForm :form="form" />
        </keep-alive>
      </div>
    </div>
  </ParentLayout>
</template>

<script>
// Lando components
import ParentLayout from '@theme/layouts/Layout.vue';
import HSForm from '@theme/components/HSForm';

// Update data
const updateData = (data) => {

};

export default {
  components: {HSForm, ParentLayout},
  data() {
    return {
      byline: '',
      form: '',
      title: '',
    };
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      this.byline = this.$frontmatter.byline || '';
      this.form = this.$frontmatter.form || '';
      this.title = this.$frontmatter.title || this.$siteTitle;
    },
  },
  watch: {
    '$route.path': function (action) {
      this.refreshData();
    },
  },
};
</script>

<style lang="stylus">
#content
  margin-top: 0
  #hero
    background-image: url("/images/space.jpg")
    background-repeat-y: repeat
    margin-top: -1em
    .hero-inner
      display: flex
      background-color: rgba(#ffffff, .97)
      text-align: center
      padding: 4em 2em
    h1
      padding-top: 0
      margin-top: .5em
      font-size: 5em
    .inner
      max-width: 900px
      align-self: flex-end
    .byline
      color: lighten($landoBlue, 20%)
      p
        line-height: 2
        font-size: 2em
  #hs_form
    .inner
      max-width: 900px
@media (max-width: $MQMobile)
  #content
    #hero
      h1
        font-size: 4em
      .byline
        p
          font-size: 1.5em
@media (max-width: $MQMobileNarrow)
  #content
    #hero
      padding: 20px 10px 10px
      h1
        font-size: 3.5em
</style>
