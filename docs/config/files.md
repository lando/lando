Shared Files
============

While you can also share in additional files and directories via docker volumes (see [Advanced Service Configuration](./advanced.md)), we share a few useful host directories into each service by default.

| Host Location | Container Location |
| -- | -- |
| `/path/to/my/app` | `/app` |
| `$HOME` | `/user` |
| `lando.config.userConfRoot` | `/lando` |

**NOTE:** Unless you've configured a custom `lando` bootstrap `lando.config.userConfRoot` should resolve to `$HOME/.lando`.
