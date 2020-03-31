Lando Metrics Server
====================

Lightweight node server that powers Lando metrics.

Local Development
-----------------

### Configuration

You'll want to drop a `lando.env` file in the root of this repo with the relevant creds.

```bash
LANDO_METRICS_BUGSNAG={}
LANDO_METRICS_ELASTIC={}
```

You will also want to edit the `config.yml` in the root of this repo so it also points to the local metrics instance. This way you can easily troubleshoot with `lando logs -s metrics -f`

```yaml
stats:
  - report: true
    url: https://metrics.devwithlando.io
  - report: true
    url: http://metrics.lndo.site
```

### Installing

Local development requires [lando](https://docs.lando.dev).

```bash
# Clone the entire lando project
git clone https://github.com/lando/lando.git
cd lando && lando start
```
