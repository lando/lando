---
description: Learn how to contribute to the Lando metrics express server.
metaTitle: Working on the Lando metrics express server | Lando
---

# Metrics Server

This assumes you've gone through all the steps in our [Getting Involved](contributing) docs and are familiar with contributing.

### Using Lando (recommended)

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Get everything installed and launch core services
lando.dev start

# Open the metrics endpoint
open https://metrics.lndo.site
```

### Using Yarn

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Use yarn to launch the metrics
yarn dev:metrics

# Open the metrics
open http://localhost
```
