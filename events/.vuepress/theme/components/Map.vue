<template>
  <GmapMap
      :center="{lat:0, lng:0}"
      :zoom="2"
      map-type-id="terrain"
      style="width: 1000px; height: 500px"
  >
    <GmapMarker
        :key="index"
        v-for="(event, index) in data.events"
        :position="google && geoCode(event.location)"
        :clickable="true"
        :draggable="true"
    />
  </GmapMap>
</template>

<script>
  import {gmapApi} from 'vue2-google-maps';

  export default {
    name: 'Map',

    computed: {
      google: gmapApi,
      data () {
        return {
          events: [
            {
              name: 'Tandem Test 1',
              location: '4 Jersey St, Boston, MA 02215',
              date: '01-01-1901',
              url: 'https://www.mlb.com/redsox',
            },
            {
              name: 'Tandem Test 2',
              location: '100 Legends Way, Boston, MA 02114',
              date: '01-01-1946',
              url: 'https://www.nba.com/celtics',
            },
            {
              name: 'Tandem Test 3',
              location: '1 Patriot Pl, Foxborough, MA 02035',
              date: '01-01-1959',
              url: 'https://www.patriots.com',
            },
          ],
          frontmatter: this.$page.frontmatter,
        }
      },
    },

    methods: {
      geoCode(address) {
        let geocoder = new this.google.maps.Geocoder();
        return geocoder.geocode({ 'address': address }, (results, status) => {
          if (status === 'OK') {
            return results[0].geometry.location;
          }
        });
      }
    },

    mounted() {
      // this.$api(this.$page.apiUrl).get('/v1/events').then(response => {
      //   this.events = response.data.events || [];
      // })
      // .catch(error => {
      //   console.error(error);
      // });
    },
  }
</script>
