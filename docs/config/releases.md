---
description: Learn how to configure the Lando release channel so you can get a velocity of changes that matches your needs.
---

# Release Channels

Starting with [3.0.2](https://docs.lando.dev/help/2020-changelog.html) Lando provides three release channels: `stable`, `edge` and `none`.

The default `stable` channel will prompt you to update when there is a new release [on GitHub](https://github.com/lando/lando/releases) that has been tagged `Latest release`. These releases undergo a more rigorous vetting process and generally will provide the most stability. This is the best option for most users.

In addition to the updates from the `stable` channel, `edge` will also include all releases on GitHub that are tagged as `Pre-release`. These releases are best suited for intrepid users looking to sacrifice a bit of stability to try out the latest and greatest. They are also suited for users who want to help our team find bugs so we can accelerate the `stable` release cycle.

::: half
![Edge releases](/images/edgerelease.png)
:::
::: half
![Stable releases](/images/stablerelease.png)
:::

Above is what an `edge` and `stable` release look like on GitHub.

You can also choose to opt-out of updates altogether with the `none` channel but we _highly discourage_ this as we generally cannot provide support for older versions.

[[toc]]

## Toggling channels

Toggling the release channel is fairly straightforward. Note that you will need to be on `3.0.0-rrc.3` or later to do this.

```bash
# Set the release channel to edge
lando --channel edge

# Set back to stable
lando --channel stable
```

## Release cycle

The Lando release cycle is fairly simple. All releases are first cut to the `edge` channel. If an `edge` release is deemed _stable enough_ based on user feedback, it loses the `Pre-release` tag in favor of the `Latest release` tag. This bumps the release into the `stable` channel. If an `edge` release is deemed _not stable enough_ then subsequent `edge` releases are cut until one is deemed stable.

Lando has **a lot** of moving parts, a lot of users and a very finite amount of time to work on things. This release cycle is designed to allow users to select a velocity of change they are comfortable with. It is also designed so that users who want to help us report, identify and squash bugs can opt-in to a [more dangerous road](https://www.youtube.com/watch?v=YH4Xr6GIp4U&feature=youtu.be&t=101). This extra help vastly increases our issue throughput, productivity and the stability of our `stable` releases.
