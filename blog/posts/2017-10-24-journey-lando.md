---
title: "Journey to Lando: Mistakes, Pivots and Vindication"
description: After a Kickstarter campaign, two major versions, tons of feedback, broken promises, blood, sweat, tears and years of making Kalabox 2 we've finally made local dev great again with Lando
summary: After a Kickstarter campaign, two major versions, tons of feedback, broken promises, blood, sweat, tears and years of making Kalabox 2 we've finally made local dev great again with Lando
date: 2017-10-24
original: https://thinktandem.io/blog/2017/10/24/journey-to-lando-mistakes-pivots-and-vindication/

author: Mike Pirog
pic: https://www.gravatar.com/avatar/dc1322b3ddd0ef682862d7f281c821bb
link: https://twitter.com/pirogcommamike

location: San Francisco

tags:
  - case-study
  - devops
  - development
  - lando
  - workflows

feed:
  enable: true
  author:
    - name: Mike Pirog
      email: alliance@lando.dev
      link: https://twitter.com/pirogcommamike
  contributor:
    - name: Mike Pirog
      email: alliance@lando.dev
      link: https://twitter.com/pirogcommamike
---

When we first started the Kalabox project almost (*sigh*) five years ago we wanted to build a stupid easy local development tool for internal usage at [Kalamuna](https://kalamuna.com). The basic idea was a developer should be able to easily get their [Pantheon](https://pantheon.io) site (Kalamuna was using Pantheon exclusively back then) running locally within 10-15 minutes so they could spend more of their time developing and less of their time wiping away the tears caused by a fickle local setup.

Starting with some tech we had developed while working at [Gotham City Drupal](https://www.gothamcitydrupal.com/) called [gothcore](https://github.com/gotham-city-drupal/gothcore) we ended up with what would become the guts of the first iteration of Kalabox: [kalastack](https://github.com/kalamuna/kalastack).

Kalastack was a [Vagrant](https://www.vagrantup.com) and [VirtualBox](https://www.virtualbox.org/) powered development environment that used [Puppet](https://puppet.com/) to provision a Pantheon-esque environment that included [Terminatur](https://github.com/kalamuna/terminatur), a series of [Drush](http://www.drush.org/) add on commands we authored that integrated with Pantheon via the first iteration of its [Terminus](https://github.com/pantheon-systems/terminus-deprecated) CLI tool.

After using it internally with great results we realized we were being selfish so we decided to open source it. More or less right away people started messaging us with glowing reviews and before we knew it we had developed the [first version of Kalabox](https://github.com/kalamuna/kalaboxv1), a NodeJS, macOS-only GUI frontend for Kalastack.

::: thumbnail
![kalabox1-dash](https://thinktandem.io/images/articles/kalabox1.png "Kalabox V1 Dashboard")
::: caption
Kalabox Version 1 Dashboard
:::

We spent the next year or so evangelizing our project; travelling around the country to various events touting its myriad of benefits and how ahead of the curve it was until two critical things changed our destiny forever...

1. [Docker](http://docker.com) and containers became **A THING**
2. A conversation with a developer we respect a lot (**cough** Hawkeye Tenderwolf **cough**) convinced us (me) that Kalabox would never be a widely adopted project until it was less monolithic and more flexible

It wasn't super hard to connect the metaphorical dots of those two points so we [launched a Kickstarter](https://www.kickstarter.com/projects/kalabox/kalabox-advanced-web-tools-for-the-people) and resolved to complete the righteous work of remaking Kalabox as a cross-platform and Docker powered solution.

[Making our own kind of music](https://www.youtube.com/watch?v=PEQxEJ5_5zA) turned out to be a daunting task, an easy order of magnitude more difficult than our original Kalabox 1 project. We hired some people, fired some people, spent **WAY WAY** more money than we originally intended (or wanted) and left the agency we co-founded. But, after a year and a half we *finally* launched Kalabox 2.


::: thumbnail
![kalabox2-dash](https://thinktandem.io/images/articles/kalabox2.png "Kalabox V2 Dashboard")
::: caption
Kalabox Version 2 Dashboard
:::

Within a few months of release it was immediately apparent that even though many people loved (and still love!) Kalabox 2 it had its own set of fundamental flaws and fell very short of our own expectations. These flaws were both a testament to its lengthy development time but also to some critical mistakes we made during that process.

So, what went wrong and what did we learn?

The Mistakes
------------

Looking back, it's almost embarassingly obvious to see we committed some pretty cardinal sins while building Kalabox 2. That said, when hundreds of people have pledged a significant amount of their own money to your project you want to deliver for them. This can definitely cause you to push forward in the face of fairly obvious and common development pitfalls. It also leads us directly to mistake numero uno:

### 1. Don't make a promise you can't keep!

Irrespective of the technology that powers such a solution, telling people you are going to build what amounts to a push-button PaaSS (yes, I mean a Platform as a Service Service) and application migration utility that they can run on their own computer, regardles of operating system and that will *JUST WORK* is **QUITE** the promise. In fact, it's such an obviously impossible promise I feel a considerable amount of shame in reading what I just wrote.

Anyway, beyond the immediate and direct difficulties of keeping such a promise its important to remember that on a local app there are monsters lurking deep within the operating system layer all the way up to the users application code aka basically *everywhere*. Not to mention users have an unique ability for doing all sorts of unpredictable (read: very, very naughty) things to their machines, greatly increasing the variables for which you need to account.

Combining this meta challenge with the very practical reality that Kalabox was to be built on new, unstable and fast moving dependencies and you've got...

### 2. A house divided against itself cannot stand!

To say that Docker has changed a lot since we started building Kalabox 2 would be... uh... an understatement. Consider the following table of core Kalabox components:

| | Kalabox 2 Dev | Lando Dev Starts |
| -- | -- | -- |
| <strong>Container Orchestration</strong> | We wrote our own, `docker-compose` didn't exist yet. | `docker-compose` is a pretty big thing! |
| <strong>Docker Engine</strong> | Boot2Docker (remember that?), then `docker-machine` | Docker for Mac/Windows |
| <strong>File Sharing</strong> | Syncthing, then unison | Docker "native" |
| <strong>Proxy</strong> | DNSmasq, then hipache | traefix |
| <strong>Terminus</strong> | Unstable release | Almost a year stable |

You'll immediately notice a pretty obvious trend: we ended up swapping out all the core components... **SOMETIMES TWICE!!!**. Yeah, not a good sign.

Beyond the large amount of time needed to keep up with all the changes and improvements you can imagine the technical debt that was accumulating each time we replaced a core component with something new and better.

Needless to say developing on a moving target (Docker) and for a moving target (Pantheon) is not a good idea. For that reason...

### 3. Overengineering is bad!

There is a reason why acronyms like [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) and [KISS](https://en.wikipedia.org/wiki/KISS_principle) are thrown around pretty often in development circles, namely, they are both **REALLY GOOD** ideas.

While it might sound like a nice idea to build your software with enough abstraction layers and interfaces so that it can handle all the possible things that could happen down the road it's often way, way better to build the simplest version of what your project *needs right now*. This way you can get it to market and then determine whether additional complexity is warranted. **SPOILER ALERT:** Probably not.

So armed with the lessons of Kalabox 2 what did we do?

The Pivots
----------

We released Kalabox 2 on [September 19, 2016](https://github.com/kalabox/kalabox/releases/tag/v2.0.0) and after some pretty mixed initial reviews we were firmly in denial. Subsequent and mostly ineffective bug fix releases turned denial into anger. Anger turned into bargaining when we decided to rebase the entire project on the new [Docker for Mac](https://www.docker.com/docker-mac) and [Docker for Windows](https://www.docker.com/docker-windows) engines hoping to fix some fundamental upstream flaws.

While this change did provide some much needed improvements it wasn't enough to stop the slide into depression. So we cut our [last](https://github.com/kalabox/kalabox/releases/tag/v2.1.3) release on November 25, 2016 and then sat back to gather more feedback and consider our next steps.

About a month and a half later we had reached acceptance. Big changes were needed to Kalabox. Lando was born on [January 9, 2017](https://github.com/lando/lando/commit/481d74f0b29428623b7986c86b451eec044c5184) aiming to:

* **DO MORE WITH LESS** - Lando is about **50%** less code than Kalabox but offers hundreds of times more power and stability, all in a single, in-repo config file.
* **BE PATIENT** - Kalabox spent inordinate amounts of time trying to compensate and provide hackish workarounds for flaws in its underlying Docker technology (looking at you file sharing!!!). Lando resolved to work on itself while trusting that upstream dependencies would eventually improve.
* **PLAY NICE** - Lando is designed to work even when used in combination with other common development tools. Got something assigned to `port 80` already? We will find a port that works.
* **OPEN THINGS UP** - Kalabox's core technology was great, in fact most of it still lives on in Lando, but it was not very accessible to developers. Lando opens things up so users can easily spin up simple or complex requirements across a wide array of languages and services.
* **WRITE GREAT DOCUMENTATION** - Documentation is always the unsung hero of a good project. We spent a considerable amount of time making sure our documentation was comprehensive and easy to understand.
* **FEEL "NATIVE"** - Kalabox was the first major project to provide container-based tooling like `kbox drush` but it was slow and never really quite felt truly "native". Lando made some considerable improvements to this and running `lando drush` now feels the same as running `drush`.

While [we've only just begun](https://www.youtube.com/watch?v=__VQX2Xn7tI) to market Lando the results are starting to speak for themselves...

The Vindication
---------------

::: thumbnail
![lando](https://thinktandem.io/images/case-studies/lando-screenshot.png "Lando")
::: caption
Lando
:::

We had three major goals when we pivoted to Lando:

* **Diversification** - Make a tool that was useful for all kinds of dev, not just Drupal and WordPress Pantheon users aka make the ONE DEV TOOL TO RULE THEM ALL even if one does not simply make the ONE DEV TOOL TO RULE THEM ALL.
* **Adoption** - Make a project so good that adoption happens quickly and without much marketing. We spent a lot of time and money marketing Kalabox but felt like we needed to struggle to get and keep every single user.
* **Reliability** - Make a project that you can commit to even after only a few dates.

Let's consider some data for each.

### Diversification

::: thumbnail
![lando-by-type](https://thinktandem.io/images/articles/lando-by-type.png "Lando by Type")
::: caption
Lando by Recipe Type
:::

95% of Kalabox users used it specifically for it's Pantheon integration. On Lando that percentage is closer to 33%. Additionally, we've got users using Lando for Laravel, MEAN and Ruby development among others. We're also THE ONLY [recommended solution](https://docs.platform.sh/gettingstarted/local/lando.html) for Platform.sh users.

### Adoption

::: thumbnail
![lando-adoption](https://thinktandem.io/images/articles/lando-adoption.png "Lando Adoption")
::: caption
GitHub Stars Over Time
:::

While the growth of your project's GitHub stars is not necessarily a reflection of adoption it's taken Lando 3 months to reach it's current star count. It took Kalabox 2 years. We did a considerable amount of marketing for Kalabox. We've done almost none for Lando.

### Reliability

::: thumbnail
![lando-reliability](https://thinktandem.io/images/articles/lando-kalabox.png "Lando Reliability")
::: caption
Lando (red) vs. Kalabox (pink)
:::

At the time of writing Lando user totals were poised to exceed those of Kalabox. This is also a good indication of adoption. More importantly, you can see significant ups and downs for Kalabox versions, indicating users coming and going. Lando has hit all time highs for three weeks in a row, a feat never accomplished by Kalabox.

### Finally

All of this is to say: it's [been a long road](https://www.youtube.com/watch?v=ZPn-lTytfGo) getting from there to here. But we had faith of the heart; now vindicated in the best and fatest local dev and DevOps tool in the galaxy: [**Lando**](https://github.com/lando/lando).
