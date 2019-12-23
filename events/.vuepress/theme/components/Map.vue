<template>
  <GmapMap
      :center="{lat:10, lng:10}"
      :zoom="7"
      map-type-id="terrain"
      style="width: 500px; height: 300px"
  >
  </GmapMap>
</template>

<script>
  export default {
    name: 'Map',

    computed: {
      data () {
        return {
          events: [],
          frontmatter: this.$page.frontmatter,
        }
      },
    },

    mounted() {
      this.$api(this.$page.apiUrl).get('/v1/events').then(response => {
        this.events = response.data.events || [];
      })
      .catch(error => {
        console.error(error);
      });
    },
  }
</script>
