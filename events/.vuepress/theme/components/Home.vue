<template>
  <main class="home" aria-labelledby="main-title">
    <Map :markers="markers" v-on:update-marker="highlightEvent" />
    <div class="overlay">
      <div class="logo">
        <a href="/"><img src="/images/logo-pink-small.png" alt="Lando logo"></a>
      </div>
      <div class="title">
        <h1>Lando events and meetups</h1>
      </div>
      <div class="listing-filters">
        <a href="#" @click="upcoming">upcoming</a> |
        <a href="#" @click="previous">previous</a> |
        <a href="#" @click="newsletterToggle">get event updates</a>
      </div>
      <div v-if="selector === 'events' && cards.length > 0" class="listing">
        <div v-for="event in cards" :key="event.id" class="listing-event">
          <EventCard
            v-on:update-marker="highlightEvent"
            :selected="event.selected"
            :id="event.id"
            :name="event.name"
            :border="getTypeColor(event.type)"
            :location="event.location"
            :date="event.date"
            :summary="event.summary"
            :link="event.url"
            :presenter="event.presenter"
            :presenter-link="event.presenterLink"
            :presenter-pic="event.presenterPic"
          />
        </div>
      </div>
      <div v-else-if="selector === 'events' && cards.length === 0" class="no-events">
        <div class="no-events-block">
          <h3>No upcoming events!</h3>
          <p>Check back soon or <a href="https://docs.lando.dev/contrib/evangelist-events.html">add your event</a> to the listing!</p>
        </div>
      </div>
      <div v-if="selector === 'evangelists'" class="listing-member">
        <TeamMember v-for="member in evangelists" :key="member.id" :member="member" />
      </div>
      <div v-else-if="selector === 'newsletter'" class="newsletter-wrapper">
        <Newsletter />
      </div>
      <div class="newsletter-wrapper-mobile">
        <Newsletter />
      </div>
      <div class="listing-member-mobile">
        <TeamMember v-for="member in evangelists" :key="member.id" :member="member" />
      </div>
      <div class="footer">
        <a target="_blank" href="https://twitter.com/devwithlando">follow us</a> |
        <a target="_blank" href="https://github.com/lando/lando">github</a> |
        <a target="_blank" href="https://docs.lando.dev">docs</a> |
        <a target="_blank" href="https://lando.dev">why lando?</a> |
        <a target="_blank" href="https://blog.lando.dev">blog</a> |
        <a target="_blank" href="https://lando.dev/sponsor">sponsor</a> |
        <a target="_blank" href="https://lando.dev/join">join</a> |
        <a @click="evangelistToggle" href="#">evangelists</a> |
        <a class="special-link" @click="newsletterToggle" href="#">get events updates</a> |
        <a target="_blank" class="special-link" href="https://docs.lando.dev/contrib/evangelist-events.html">add your event</a>
        <span class="copyright">copyright © 2016-present Tandem | </span>
        <span class="policies">
          <a href="/privacy/">privacy policy</a> |
          <a href="/terms/">terms of use</a>
        </span>
      </div>
    </div>
  </main>
</template>

<script>
import dayjs from 'dayjs';
import Map from '@theme/components/Map.vue';
import EventCard from '@theme/components/EventCard.vue';
import TeamMember from '@theme/components/TeamMember.vue';
import {gmapApi} from 'vue2-google-maps';

export default {
  name: 'Home',
  components: {EventCard, Map, TeamMember},
  data() {
    return {
      markers: [],
      cards: ['loading'],
      evangelists: [],
      events: [],
      selector: 'events',
    };
  },
  computed: {
    google: gmapApi,
  },
  mounted() {
    this.$api.get('/v1/events').then(response => {
      this.events = response.data || [];
      Promise.all(this.events.map(event => this.geocode(event))).then(() => {
        this.upcoming();
      });
    })
    .catch(error => {
      console.error(error);
    });
    this.$api.get('/v1/alliance/evangelists').then(response => {
      this.evangelists = response.data || [];
    })
    .catch(error => {
      console.error(error);
    });
  },
  methods: {
    evangelistToggle() {
      this.selector = 'evangelists';
    },
    getIcon(color = 'grey') {
      return {
        path: this.google.maps.SymbolPath.CIRCLE,
        scale: 5,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: color,
      };
    },
    getTypeColor(type) {
      switch (type) {
        case 'conference':
          return '#2ecc71';
        case 'camp':
          return '#ed3f7a';
        case 'meetup':
          return '#ed3f7a';
        case 'other':
          return '#ed3f7a';
        default:
          return '#ed3f7a';
      };
    },
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
          event.icon = this.getIcon();
        }
        return result.status;
      });
    },
    newsletterToggle() {
      this.selector = 'newsletter';
    },
    previous() {
      this.selector = 'events';
      this.cards = this.events.filter(event => dayjs(event.date).isBefore(dayjs()));
      this.markers = this.events.filter(event => dayjs(event.date).isBefore(dayjs()));
    },
    upcoming() {
      this.selector = 'events';
      this.cards = this.events.filter(event => dayjs(event.date).isAfter(dayjs()));
      this.markers = this.events.filter(event => dayjs(event.date).isAfter(dayjs()));
    },
    highlightEvent(id) {
      this.markers = this.markers.map(marker => {
        if (marker.id === id) {
          marker.icon = this.getIcon(this.getTypeColor(marker.type));
        } else {
          marker.icon = this.getIcon();
        }
        return marker;
      });
      this.cards = this.cards.map(card => {
        card.selected = card.id === id;
        return card;
      });
    },
  },
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
  .newsletter-wrapper-mobile,
  .listing-member-mobile
    display none
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
  .listing,
  .no-events,
  .newsletter-wrapper,
  .listing-member
    position absolute
    right 1em
    top 4em
    width 350px
    background white
    opacity .75
    height 80%
    overflow scroll
  .no-events
    height auto
    text-align center
    .no-events-block
      padding 2em 4em
  .newsletter-wrapper
    height: auto
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
      color darken(white, 30%)
    a:hover
      text-decoration underline
    .copyright
      padding-left 3em
      font-size .7em
    .policies
      font-size .7em
    a.special-link
      color white
      font-weight 600
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
    .no-events,
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
    .newsletter-wrapper,
    .listing-member
      display none
    .newsletter-wrapper-mobile,
    .listing-member-mobile
      display block
      border-bottom 1px dashed #ddd
    .listing-filters,
    .footer
      background white
      a
        color $landoBlue
    .footer
      font-size .9em
      padding-top 2em
      .copyright
        display block
        padding 0
        color $landoGrey
</style>
