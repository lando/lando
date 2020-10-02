---
description: Get the skinny on how to easily update Lando, a local development and DevOps tool, on macOS, Windows and Linux.
---

# Updating

Updating is fairly simple.

1.  Shutdown Lando eg `lando poweroff` and kill any running Lando processes.
2.  Turn off Docker.
3.  Follow the normal installation steps with the new version.

If you run into any issues after that we recommend you check out this [troubleshooting guide](./../help/updating.md).

## Caveats

Lando has tried to maintain backwards compatibility as best as possible on it's road to a stable `3.0.0` release. However it has introduced breaking changes in a few Lando version. For these versions you will likely want to [uninstall](./uninstalling.md) and consult the relevant release notes for the breaking versions.

* [3.0.0-rc.2](https://github.com/lando/lando/releases/tag/v3.0.0-rc.2)
* [3.0.0-rc.1](https://github.com/lando/lando/releases/tag/v3.0.0-rc.1)
* [3.0.0-beta.41](https://github.com/lando/lando/releases/tag/v3.0.0-beta.41)
