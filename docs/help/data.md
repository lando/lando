---
description: Learn how to handle file syncing issue when using Lando for local development.
---

# Privacy Policy for Humans

Because most sane people are not lawyers we've included this more-human-accessible explanation of Lando's [Privacy Policy](https://github.com/lando/lando/blob/master/PRIVACY.md). Note that this *_is not_* the actual Privacy Policy.

## tl;dr

Lando collects two kinds of information for the sole purpose of improving Lando: _Usage Data_ and _Crash Data_.

We store and process this data in [QBOX](https://qbox.io/). Additionally, we store Crash Data in [Bugsnag](https://www.bugsnag.com/). Lando does not share, sell or transmit your data to any other parties. We have obtained DPAs with both QBOX and Bugsnag for this purpose.

### Usage Data

Usage Data is pseudonymized and automatically collected by default during common Lando runtime events such starting, stopping or destroying an application. Here is an example of usage data collected during a `lando rebuild`.

```json
{
  "context": "local",
  "devMode": false,
  "instance": "fc8bdd13-03bc-4642-b064-b2eda1c64398",
  "nodeVersion": "v10.4.1",
  "mode": "cli",
  "os": {
    "type": "Linux",
    "platform": "linux",
    "release": "5.3.8-300.fc31.x86_64",
    "arch": "x64"
  },
  "product": "lando",
  "version": "3.0.0-rc.22",
  "app": "6424b9c225b9f1b7cd46deffec8599d17d8f3f4e",
  "type": "drupal8",
  "services": [
    "php:7.2",
    "mysql",
    "mailhog"
  ],
  "action": "rebuild",
  "created": "2019-11-26T15:15:52.733Z"
}
```

Each Lando instance is uniquely identifiable by an ID which is stored at `~/.lando/cache/id`. This corresponds to the `instance` property above. While we store this data the only way we can tie specific data to a given Lando user is if the user themselves tells us which instance id belongs to them.

We will also pseudonymize your app's name.

If you would like to see what data is sent you can run either examine the [Lando logs](./logs.md), or run a Lando command with debug verbosity.

```bash
lando start -vvv

# debug: Logging metrics data"command":"lando start","context":"local","devMode":false,"instance":"bdb5354f0597b5b465e86db8255c2b6e1e742f70","nodeVersion":"v10.15.0","mode":"cli","os":{"type":"Darwin","platform":"darwin","release":"19.0.0","arch":"x64"},"product":"lando","version":"3.0.0-rc.22","app":"8e8533752bafe1499af4352e923b4d2e82396927","type":"none","services":["node:10","node:10","node:10","php:7.3"],"action":"start","created":"2019-11-26T15:24:16.468Z"} to [{"report":true,"url":"https://metrics.lando.dev"}]
```

If you would like to opt-out you can do so by adding the following to your [Lando global config](./../config/global.md)

```yaml
stats:
  - report: false
    url: https://metrics.lando.dev
```

## Crash Data

Crash Data will only be sent to Tandem if the user opts in and gives us permission to do so. The user will be prompted the first time Lando detects an error.

```bash
lando start

Lando has crashed!!!

Would you like to report it, and subsequent errors, to Lando?

This data is only used by the Lando team to ensure the application runs as well as it can.
For more details check out https://docs.lando.dev/privacy/

? Send crash reports? (Y/n)
```

Crash Data will include the same information as Usage Data with the addition of the error message and its stack trace.

We try our best to sanitize these additional properties but recognize that path names and other information that we collect may inadvertently include personal data including but not limited to usernames and site names.

If you would like to reset your error reporting preference so that Lando prompts you again on the next error you can run this command.

```bash
rm ~/.lando/cache/report_errors
```
