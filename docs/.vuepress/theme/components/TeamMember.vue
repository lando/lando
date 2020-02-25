<template>
  <div class="team-member">
    <div class="team-member-pic">
      <img :src="member.pic" :alt="member.name" />
    </div>
    <div class="team-member-bio">
      <h2>{{ member.name }}</h2>
      <div class="team-member-title">{{ member.title }}</div>
      <p v-html="member.bio"></p>
      <p class="team-member-helps" v-if="member.role">HELPS WITH: {{ helpText }}</p>
    </div>
    <div class="team-member-details">
      <ul>
        <li v-if="member.location">
          <div class="social-icon">
            <span class="detail-label">{{ member.location }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="map-marker-alt" class="svg-inline--fa fa-map-marker-alt fa-w-12" role="img" viewBox="0 0 384 512"><path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>
          </div>
        </li>
        <li v-if="member.github">
          <a class="social-icon" :href="githubUrl" target="_blank">
            <span class="detail-label">{{ member.github }}</span>
            <svg aria-labelledby="simpleicons-github-icon" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-github-icon" lang="en">GitHub icon</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
          </a>
        </li>
        <li v-if="member.twitter">
          <a class="social-icon" :href="twitterUrl" target="_blank">
            <span class="detail-label">@{{ member.twitter }}</span>
            <svg aria-labelledby="simpleicons-twitter-icon" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title id="simpleicons-twitter-icon" lang="en">Twitter icon</title><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"></path></svg>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: ['member'],
  computed: {
    githubUrl() {
      return `https://github.com/${this.member.github}`;
    },
    twitterUrl() {
      return `https://twitter.com/${this.member.twitter}`;
    },
    helpText() {
      const lowered = this.member.role.map(item => item.toLowerCase());
      let ender = '.';
      if (lowered.length > 1) {
        ender = ` and ${lowered[lowered.length - 1]}.`;
        lowered.pop();
      }
      return `${lowered.join(', ')}${ender}`;
    },
  },
};
</script>

<style lang="stylus">
.team-member
  padding-bottom: 2rem
  padding-top: 2rem
  border-bottom: 1px dotted #ddd
  display: flex
  margin: auto
  &:last-child
    border: none
  .team-member-pic,
  .team-member-bio,
  .team-member-details
    display: inline-block
  .team-member-pic
    width: 15%
    img
      border-radius: 100%
  .team-member-bio
    width: 55%
    h2
      font-size: 1.4rem
      border: 0
      margin: 0
  .team-member-details
    text-align: right
    width: 30%
    ul
      margin: .25em
      list-style: none
    .detail-label
      text-transform: uppercase
      font-weight: 800
      font-size: 0.75rem
      color: $landoGrey
      position: relative
      top: -7px
      right: 4px
  .team-member-title,
  .team-member-helps
    text-transform: uppercase
    font-weight: 800
    font-size: 0.75rem
    color: $landoPink
  .team-member-helps
    color: lighten($landoGrey, 25%)
  .social-icon
    svg
      width: 24px
      height: 24px
      color: $landoPink
      fill: $landoPink
@media (max-width: $MQMobile)
  .team-member
    display: block
    text-align: center
    .team-member-pic,
    .team-member-bio,
    .team-member-details
      display: block
      width: 100%
    .team-member-details
      width: 100%
      margin: auto
      ul
        text-align: center
</style>
