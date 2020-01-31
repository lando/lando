<template>
  <main class="home" aria-labelledby="main-title">
    <Map :markers="markers" />
    <div class="overlay">
      <div class="logo">
        <a href="/"><img src="/images/logo-pink-small.png" alt="Lando logo"></a>
      </div>
      <div class="title">
        <h1>Lando events and meetups</h1>
      </div>
      <div class="listing-filters">
        <a href="#" @click="upcoming">upcoming</a> |
        <a href="#" @click="previous">previous</a>
      </div>
      <div class="listing">
        <EventCard
          :key="index"
          v-for="(event, index) in cards"
          :name="event.name"
          :location="event.location"
          :date="event.date"
          :summary="event.summary"
          :link="event.url"
          :presenter="event.presenter"
          :presenter-link="event.presenterLink"
          :presenter-pic="event.presenterPic"
        />
      </div>
      <div class="footer">
        <a href="/privacy/">privacy policy</a> |
        <a href="/terms/">terms of use</a>
        <span class="copyright">copyright © 2016-present Tandem</span>
      </div>
    </div>
  </main>
</template>

<script>
import dayjs from 'dayjs';
import Map from '@theme/components/Map.vue';
import EventCard from '@theme/components/EventCard.vue';

export default {
  name: 'Home',
  components: {EventCard, Map},
  data() {
    return {
      markers: [],
      cards: [],
      events: [
        {
          name: 'Tandem Test 1',
          date: '01-01-2021',
          location: 'Fenway Park',
          presenter: 'Mike Pirog',
          presenterPic: 'https://www.gravatar.com/avatar/dc1322b3ddd0ef682862d7f281c821bb',
          presenterLink: 'https://twitter.com/pirogcommamike',
          summary: 'Get trained on how to do all the things!',
          url: 'https://www.mlb.com/redsox',
        },
        {
          name: 'Tandem Test 4',
          location: 'San Francisco, CA',
          date: '01-01-2021',
          url: 'https://www.mlb.com/redsox',
        },
        {
          name: 'Tandem Test 2',
          location: 'Boston Garden',
          date: '01-01-2021',
          url: 'https://www.nba.com/celtics',
        },
        {
          name: 'Tandem Test 2',
          location: 'Boston Garden',
          date: '01-01-2021',
          url: 'https://www.nba.com/celtics',
        },
        {
          name: 'Tandem Test 3',
          location: 'Irkutsk',
          date: '01-01-1918',
          url: 'https://www.patriots.com',
        },
        {
          name: 'Tandem Test 1',
          date: '01-01-2019',
          location: 'Moscow',
          presenter: 'Mike Pirog',
          presenterPic: 'https://www.gravatar.com/avatar/dc1322b3ddd0ef682862d7f281c821bb',
          presenterLink: 'https://twitter.com/pirogcommamike',
          summary: 'Get trained on how to do all the things!',
          url: 'https://www.mlb.com/redsox',
        },
      ],
    };
  },
  mounted() {
    // @TODO: add API call here first
    Promise.all(this.events.map(event => this.geocode(event))).then(() => {
      this.upcoming();
    });
  },
  methods: {
    geocode(event) {
      return this.$gmaps.get('/geocode/json', {
        params: {
          key: process.env.LANDO_GOOGLE_API_KEY,
          address: event.location,
        },
      })
      .then(result => {
        if (result.status === 200 && !result.data.error_message) {
          event.geocode = result.data.results[0];
          event.lat = event.geocode.geometry.location.lat;
          event.lng = event.geocode.geometry.location.lng;
        }
        return result.status;
      });
    },
    previous() {
      this.cards = this.events.filter(event => dayjs(event.date).isBefore(dayjs()));
      this.markers = this.events.filter(event => dayjs(event.date).isBefore(dayjs()));
    },
    upcoming() {
      this.cards = this.events.filter(event => dayjs(event.date).isAfter(dayjs()));
      this.markers = this.events.filter(event => dayjs(event.date).isAfter(dayjs()));
    },
  }
};
</script>

<style lang="stylus">
.overlay
  .logo
    position absolute
    top 1em
    left 1em
    width: 50px
    display: inline
  .title
    position absolute
    bottom 2em
    left 1em
    width: 50px
    h1
      font-size 4.44em
      line-height 1em
  .listing-filters
    position absolute
    right 1em
    top 2em
    background $landoGrey
    opacity .75
    padding .3em 2em
    overflow scroll
    color white
    text-align center
    a
      color #efefef
    a:hover
      text-decoration underline
  .listing
    position absolute
    right 1em
    top 4em
    width 350px
    background white
    opacity .75
    height 80%
    overflow scroll
  .footer
    position absolute
    bottom 0
    background $landoGrey
    opacity .75
    padding .3em 2em
    overflow scroll
    color white
    text-align center
    a
      color #efefef
    a:hover
      text-decoration underline
    .copyright
      padding-left 3em
      font-size .7em
.home
  padding 0
  margin 0px auto
  display block
  height 100vh
  overflow hidden

@media (max-width: $MQMapless)
  .home
    overflow auto
  .overlay
    margin: auto
    padding 2em
    .logo,
    .title,
    .listing,
    .listing-filters,
    .footer
      position relative
      width 90%
      padding 0
      opacity 1
      display block
      top 0
      left 0
    .title
      h1
        font-size 3em
    .listing-filters
      background white
      a
        color $landoBlue
</style>
