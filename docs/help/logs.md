---
description: Learn how to access logs for general troubleshooting when using Lando for local development.
---

# Accessing Logs

Lando has a few different log layers to help you diagnose any issues you might be having.

## Install Logs

If you have a failed installation, you should be able to find logs in the following locations...

*   **Windows** - `%TEMP%\Setup Log**.txt`
*   **macOS** - `/var/log/install.log`
*   **Linux** - Differs per system but check common `apt` or `dnf/yum` logs

## Runtime Logs

If you encounter an error during runtime, check out the runtime logs at...

*   **macOS/LINUX** - `~/.lando/logs`
*   **Windows** - `C:\Users\{ME}\.lando\logs`

There should be core lando logs called `lando-error.log` and a more robust `lando.log`. There should also be error and verbose logs associated with each of your applications eg `myapp.log` and `myapp-error.log`.

::: tip
Run the failing command again in verbose mode. You can pass in `-v`, `-vv`, `-vvv` or `-vvvv` to toggle the level of verbosity. You can also [edit your global config](./../config/global.html) to set the default console log level.
:::

## Container Logs

```bash
lando logs -s SOME_SERVICE
```

See the [lando logs](./../cli/logs.md) command for more information.

## Advanced Troubleshooting

One of the best ways to troubleshoot an issue is to use Docker commands directly or use the [lando ssh](./../cli/ssh.md) or [lando info --deep](./../cli/info.md) command.

```bash
# List all my containers
docker ps --all

# List all lando containers
docker ps --filter label=io.lando.container=TRUE --all

# List all containers for a particular app
docker ps --all | grep appname

# Inspect a container
docker inspect appname_service_1

# Check out the logs for a container
docker logs appname_service_1

# Attach to a container (this is like SSHing)
docker exec -i -t appname_service_1 bash
```
