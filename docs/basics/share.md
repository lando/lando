---
metaTitle: lando share | Lando
description: lando share exposes your local site to the world with a publicly accesible URL.
---

# share

Shares your local site publicly.

This is useful for sharing work with clients or testing your local site on multiple devices. The user is *required* to specify the `url` they want to share using the `--url` or `-u` flag. This `url` must be of the form `http://localhost:port`.

SSL is provided via `localtunnel`, the underlying technology lando uses to share local `urls`.

::: tip What URL to use?
Try running `lando info` from inside your app. Any service with a `http://localhost:port` address should be shareable.
:::

## Usage

```bash
lando share -u http://localhost:32785
```

## Options

```bash
--help         Shows lando or delegated command help if applicable
--url, -u      Url to share. Needs to be in the form http://localhost:port
--verbose, -v  Runs with extra verbosity
```
