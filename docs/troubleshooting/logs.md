Accessing Logs
==============

Lando has a few different log layers to help you diagnose any issues you might be having.

Install Logs
------------

If you have a failed installation, you should be able to find logs in the following locations...

* **Windows** - `%TEMP%\Setup Log**.txt`
* **macOS** - `/var/log/install.log`
* **Linux** - Differs per system but check common `apt` or `dnf/yum` logs

Runtime Logs
------------

If you encounter an error during runtime, check out the runtime logs at...

  * **macOS/LINUX** - `~/.lando/logs`
  * **Windows** - `C:\Users\{ME}\.lando\logs`

There should be an `error.log` and a more robust `lando.log`.

> #### Hint::Pro Tip: Use verbose mode
>
> Run the failing command again in verbose mode. You can pass in `-v`, `-vv`, `-vvv` or `-vvvv` as [global options](./../cli/usage.html#global-options) to toggle the level of verbosity. You can also [edit your global config](./../config/config.html) to set the default console log level.

Docker Logs
-----------

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

Container Logs
--------------

While you can get container logs by following some of the steps above you can also access specific container logs by mounting them back out onto your host machine. This is done by modifiying your `.lando.yml` file to override [docker compose](https://docs.docker.com/compose/compose-file/) with some additional volumes.

### Example

Here is a basic example of a `.lando.yml` `php` service that shares the entire `/var/log` directory of your container to `logs` inside of your app's root directory.

```yml
name: lemp
sharing:
  appserver:
    local: www
    remote: /var/www/html
proxy:
  nginx:
    - port: 80/tcp
      default: true
    - port: 443/tcp
      default: true
      secure: true
services:
  appserver:
    type: php:7.0
    via: nginx
    ssl: true
    overrides:
      services:
        volumes
          - $LANDO_APP_ROOT_BIND/logs:/var/log
  database:
    type: mariadb
    portforward: true
```

> #### Hint::Gitignore your log directory
>
> You will want to make sure you add `logs` to your `.gitignore` file.

