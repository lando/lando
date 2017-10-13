Shared Files
============

While you can also share in additional files and directories via docker volumes (see [Advanced Service Configuration](./overrides.md)), we share a few useful host directories into each service by default.

| Host Location | Container Location |
| -- | -- |
| `/path/to/my/app` | `/app` |
| `$HOME` | `/user` |
