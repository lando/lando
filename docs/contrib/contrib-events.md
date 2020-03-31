---
description: Learn how to contribute to the Lando vuepress events listing.
metaTitle: Working on the Lando vuepress events listing | Lando
---

# Events

This assumes you've gone through all the steps in our [Getting Involved](contributing) docs and are familiar with contributing.

### Using Lando (recommended)

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Get everything installed and launch core services
lando.dev start

# Start up the events
lando.dev events

# Open the events
open https://events.lndo.site
```

### Using Yarn

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Use yarn to launch the events
yarn dev:events

# Open the events
open http://localhost:8006
```
