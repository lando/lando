---
description: Lando shares your application codebase, user folder and lando configuration into every container so you can have a predictable and stable setup.
---

# Shared Files

While you can also share in additional files and directories via Docker volumes (see [service overrides](./services.md#overrides)), we share a few useful host directories into each service by default.

| Host Location | Container Location |
| -- | -- |
| `/path/to/my/app` | `/app` |
| `$HOME` | `/user` |
| `lando.config.userConfRoot` | `/lando` |

**NOTE:** Unless you've configured a custom `lando` bootstrap, `lando.config.userConfRoot` should resolve to `$HOME/.lando`.

If you are looking for ways to make file sharing more performant then make sure you also read the [performance docs](./performance.md).
