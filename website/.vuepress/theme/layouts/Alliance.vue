<template>
  <ParentLayout>
    <div id="section" class="section-inner" slot="page-top">
      <div class="section-inner-section">
        <div class="content__default">
          <h1 id="join-and-support-the-movement">
          <a href="#join-and-support-the-movement" aria-hidden="true" class="header-anchor">#</a> Join and support the movement!</h1>
          <img src="/images/lando-alliance.png">

          <p>Over the last year or so we've watched our community grow from several hundred users to over 10,000 and this exponential growth trajectory doesn't seem to be stopping anytime soon!</p>

          <p>As such we want to make sure Lando has a healthy and sustainable foundation for continued future growth.</p>

          <p>For that reason we are launching our membership program: <em>The Lando Alliance</em>, a movement to liberate developers across the galaxy so they can focus on their most important work.</p>
        </div>
      </div>
    </div>
    <div slot="page-bottom">
      <keep-alive>
        <HSForm form="9017bea2-dd0c-402a-8c97-d1b1d7429a00" />
      </keep-alive>
    </div>
  </ParentLayout>
</template>
<script>
// Lando components
import ParentLayout from '@theme/layouts/Layout.vue';
import HSForm from '@theme/components/HSForm';

export default {
  components: {HSForm, ParentLayout},
};
</script>


<style lang="stylus">
</style>
