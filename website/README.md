---
home: true
navbar: true
pageClass: lando-front
layout: Lando

heroImage: /images/hero-white.png
byline: Free yourself from the mind-forged manacles of lesser dev tools. Save time, headaches, frustration and do more real work.

whyLando: While developers love Lando because it's easy, powerful and fun... Lando actually exists to solve business problems by removing tons of unneeded complexity from development workflows thereby maximizing value delivery to clients and customers.
whys:
- title: Easy
  details: Don't waste time fighting your tools. Install lando and get your first project rolling in minutes regardless of the tech or your operating system.
- title: Complete
  details: Lando runs most major languages and services in most places. Replace your exisiting suite of dev tools and standardize on only Lando instead.
- title: Battle Tested
  details: 10,000+ developers strong and growing. Lando is battle tested, supported and vetted by a core group of maintainers and a great open source community.
- title: Portable
  details: Specify simple or complex dev requirements in a single config file and ship them to all your devs. Your Lando config can be two lines or it can emulate complex hosting environments and powerful automation.
- title: Sane Defaults
  details: Built on top of Docker Compose, Lando automatically sets up normally arduous things like SSL, SSH keys, pretty urls, cross container networking, build steps, run time automation events and fast file sharing.
- title: Powerful Overrides
  details: Don't like our defaults? Every part of Lando is customizable down to the Docker level. This means you get all the benefits of Lando without sacrificing any of the power.

whereByline: Lando is not meant for production but you can run it pretty much anywhere. For example it works locally on macOS, Linux and Windows, in a continuous integration environment like Travis or CircleCI or as a throwaway preview environment on AWS, among other things!
wheres:
- title: Apple
  icon: devicon-apple-original
- title: Linux
  icon: devicon-linux-plain
- title: Windows
  icon: devicon-windows8-original
- title: Travis
  icon: devicon-travis-plain
- title: Amazon Web Services
  icon: devicon-amazonwebservices-original

runs: Lando runs most major languages, frameworks, services and dev tools all in isolated containers that won't pollute your machine. In fact, you don't need any other tool but Lando! Here are some of the things our users like best...
---

- How does it work?

* 1. lando init a site from cwd, github, pantheon
* 2. start the project
* 3. add in auxiliary services
* 4. add in build steps, automation, events, etc
* 5. now other devs can git clone, alndo start, and get all their shit

- Who uses it?

10,000+ developers

    <div id="runs">
      <div class="inner">
        <h2>What can it run?</h2>
        <p>{{ data.whatCan }}</p>

        <div class="languages">
          <div class="point" v-for="(run, index) in data." :key="index">
            <a v-if="run.link" :href="run.link" target="_blank">
              <div class="tech-icon"><i :class="run.icon"></i></div>
              <h3>{{ run.title }}</h3>
            </a>
            <span v-else>
              <div class="tech-icon"><i :class="run.icon"></i></div>
              <h3>{{ run.title }}</h3>
            </span>
          </div>
        </div>
      </div>
    </div>
