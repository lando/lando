---
description: Put Lando into experimental mode and get access to more cutting edge features.
---

# Experimental

Deeper changes or more complex features can sometimes take _a long time_ to be ready for even an `edge` release. However, we can shorten the time it takes for these features to reach general availability by allowing users to _opt-in_ to experimental features.

As a rule, the expectation for these features should be fairly low. This is to say that, generally, the length of time the features have been available will be directly proportional to their stability. Of course, this will also depend on the scope, size, complexity and depth of the features in question.

Nevertheless, if you want to live on the wild side, try the absolute bleeding edge and help us improve these features with feedback and bug reports. You can activate experimental features pretty easily. Note that this toggle is only available in [3.0.0-rrc.3](https://docs.lndo.site/help/2020-changelog.html) or later.

```bash
# Toggle experimental mode
lando --experimental
```

While we've tried to document most experimental features, you can also [check the code directly](https://github.com/lando/lando/tree/master/experimental/plugins) for a list of things.
