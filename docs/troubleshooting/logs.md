Accessing Logs
==============

Lando has a few different log layers to help you diagnose any issues you might be having.

Install Logs
------------

If you have a failed installation, you should be able to find logs in the following locations...

*   **Windows** - `%TEMP%\Setup Log**.txt`
*   **macOS** - `/var/log/install.log`
*   **Linux** - Differs per system but check common `apt` or `dnf/yum` logs

Runtime Logs
------------

If you encounter an error during runtime, check out the runtime logs at...

*   **macOS/LINUX** - `~/.lando/logs`
*   **Windows** - `C:\Users\{ME}\.lando\logs`

There should be an `error.log` and a more robust `lando.log`.

> #### Hint::Pro Tip: Use verbose mode
>
> Run the failing command again in verbose mode. You can pass in `-v`, `-vv`, `-vvv` or `-vvvv` as [global options](./../cli/usage.html#global-options) to toggle the level of verbosity. You can also [edit your global config](./../config/config.html) to set the default console log level.

Container Logs
--------------

See the [lando logs](./../cli/logs.md) command.

Advanced Logs
-------------

One of the best ways to troubleshoot an issue is to use Docker commands directly.

```bash
# List all my containers
docker ps --all

# List all core lando containers
docker ps --all | grep lando

# List all containers for a particular app
docker ps --all | grep appname

# Inspect a container
docker inspect appname_service_1

# Check out the logs for a container
docker logs appname_service_1

# Attach to a container (this is like SSHing)
docker exec -i -t appname_service_1 bash
```
