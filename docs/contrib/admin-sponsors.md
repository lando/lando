---
description: Learn how to help administer Lando sponsors.
metaTitle: Administer Lando sponsors | Lando
---

# Sponsorships

Managing Lando sponsors is perhaps the most important thing that adminstrators do. It is essential that we are timely and engaged with the kind folks who have decided to support our mission in this way.

## On and offboarding

### Adding a sponsor

The general flow for adding a new sponsor is...

1. You'll recieve an email from one of our sponsor platforms (GitHub, Patreon or OpenCollective) when a new person sponsors the project.
2. You'll then enter the sponsors email, sponsor level and auth code into our sponsor admin portal. This will enroll the sponsor and ask them to fill out some other details so we can complete their sponsorship.

::: tip Ask about the admin portal
For security reasons we cannot expose the admin portal url or auth code, best bet is to ping another admin for the info!
:::

3. Once the sponsor completes the step above you'll receive another email with the completed details.
4. You will want to use that information to add the sponsor [here](https://github.com/lando/lando/blob/master/api/data/sponsors.yml). This will add the sponsor to all relevant web properties and complete the sponsorship. Note that $4 _hero_ level sponsors do not get added. Also note that _patriot_ or _special_ sponsors may have unique terms so make sure you check in before adding them.

### Removing a sponsor

1. Navigate back to the sponsor admin portal, input the sponsors email and choose to remove them.
2. Remove them from the list of sponsors [here](https://github.com/lando/lando/blob/master/api/data/sponsors.yml).

### Announcing the sponsor

Generally we announce our sponsors but do so differently based on the subscription level.

#### $4 - heroes

We currently do nothing.

#### $9 - heralds

Heralds should be given a shoutout on twitter. If possible you should try to batch up to five heralds in a single tweet so we are not spamming people with constant chatter of new sponsors. We should also only tweet once a day about new heralds.

#### $99 - allies

Allies should also be given a shoutout on twitter. If possible only one ally should be mentioned in a single tweet, however, if we have a bunch of simultaneous sponsorships then this can be bumped to three. We should only tweet about new allies once every other day.

#### $999-$1776 - partners, patriots and special

Partners, patriots and special sponsorships usually have custom announcement terms so make sure you coordinate with those sponsors on rolling out their sponsorships. _Usually_, the rollout consists of some combination of the following...

* Blog posts announcing the partnership
* A newsletter blast announcing the parternship
* Tweets announcing the partnership

## Benefit fulfillment

#### $9 - heralds

Heralds are sent a yearly swag benefit. These are generally batched and distributed once a quarter. For details on this process contact <alec@lando.dev>.

You will also want to make sure that heralds are...

* Put their name on the website(s)
* Given a shoutout on twitter

#### $99 - allies

* Put their logo on the website(s)
* Given a shoutout on twitter

#### $999-$1776 - partners, patriots and special

Partners, patriots and special sponsorships usually have custom benefits. It is important that we are responsive fulfilling these benefits!

## Relationship management

Being as attentive as possible with our sponsors is our goal. Generally sponsor requests will come in to our `admin` or `sponsorships` email accounts however, requests can come in through Slack, twitter or our contact form.

If you get a sponsor question and can address their needs, please do so as soon as possible. If you are unsure how to address the sponsors needs then contact someone on the team who can!

Also be mindful you do not collide with another admin answering the same question at the same time. Two answers, particularly if different, can be more confusing then no answe!
