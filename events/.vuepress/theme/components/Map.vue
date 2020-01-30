<template>
  <div id="map">
    <div class="map">
      <GmapMap
          :center="{lat:42.346790, lng:-71.098648}"
          :zoom="8"
          map-type-id="terrain"
          style="width: 1000px; height: 500px"
      >
        <GmapMarker
            :key="index"
            v-for="(event, index) in events"
            :position="google && new google.maps.LatLng(event.location.lat, event.location.lon)"
            :clickable="true"
            :draggable="true"
        />
      </GmapMap>
    </div>
    <div class="listing">
      <div
          :key="index"
          v-for="(event, index) in events">
        <h2>{{ event.name }}</h2>
        <h3>{{ event.location }}</h3>
        <p>{{ event.date }}</p>
        <p><a :href="event.url">{{ event.url }}</a></p>
      </div>
    </div>
  </div>

</template>

<script>
  import {gmapApi} from 'vue2-google-maps';

  export default {
    name: 'Map',

    data() {
      return {
        events: [
          {
            name: 'Tandem Test 1',
            location: {
              lat: '42.346790',
              lon: '-71.098648',
            },
            date: '01-01-1901',
            url: 'https://www.mlb.com/redsox',
          },
          {
            name: 'Tandem Test 2',
            location: {
              lat: '42.366581',
              lon: '-71.061630',
            },
            date: '01-01-1946',
            url: 'https://www.nba.com/celtics',
          },
          {
            name: 'Tandem Test 3',
            location: {
              lat: '42.093811',
              lon: '-71.265800',
            },
            date: '01-01-1959',
            url: 'https://www.patriots.com',
          },
        ],
      };
    },

    computed: {
      google: gmapApi,
    },

    mounted() {
      // this.$api(this.$page.apiUrl).get('/v1/events').then(response => {
      //   this.events = response.data.events || [];
      // })
      // .catch(error => {
      //   console.error(error);
      // });
    },
  };
</script>
