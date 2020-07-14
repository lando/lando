---
description: Lando injects your SSH keys so they are available, it also will create and post SSH keys for outside services like Pantheon and GitHub as needed.
---

# SSH Keys

By default, Lando will forward all the correctly formatted, owned, and permissioned `ssh` keys, including **PASSPHRASE PROTECTED** keys it finds in your `~/.ssh` and `lando.config.userConfRoot/keys` directories into each service. This means that you should be able to use your ssh keys like you were running commands natively on your machine.

Additionally, Lando will set the default SSH user inside your services to whatever is your host username. You can also make use of the ENVVARS which are injected into every service as follows:

```bash
LANDO_HOST_UID=501
LANDO_HOST_GID=20
LANDO_HOST_USER=me
```

Please note that `lando.config.userConfRoot/keys` is a location managed by Lando so it is recommended that you do not alter anything in this folder.

**NOTE:** Unless you've configured a custom `lando` bootstrap, `lando.config.userConfRoot` should resolve to `$HOME/.lando`. This means, by default, your keys should be available on your host at `$HOME/.lando/keys`.

| Host Location | Managed |
| -- | -- |
| `~/.ssh` | `no` |
| `lando.config.userConfRoot/keys` | `yes` |

If you are unsure about what keys get loaded, you can use the commands for key discovery as follows:

```bash
# Check out service logs for key loading debug output
# Obviously replace appserver with the service you are interested in
lando logs -s appserver

# Check the .ssh config for a given service
# Obviously replace appserver with the service you are interested in
lando ssh -s appserver -c "cat /etc/ssh/ssh_config"
```

[[toc]]

## Customizing

Starting with Lando [3.0.0-rrc.5](./../help/2020-changelog.md#_2020), users can customize the behavior of key loading. This provides the flexibility for users to handle some edge cases in the ways that make the most sense for them.

Generally, we expect that users put these customizations inside their [userspace Lando Override File](lando.md#override-file) because they are likely going to be user specific.

### Disable key loading

The below will completely disable user `ssh` key loading. Note that this will only disable loading keys from your host `~/.ssh` directory. It will continue to load Lando managed keys.

```yaml
keys: false
```

### Loading specific keys

If you have a lot of keys, you may run into the problem expressed [here](https://github.com/lando/lando/issues/2031) and [here](https://github.com/lando/lando/issues/1956). To make sure that Lando tries an actionable key before the `Too many authentication failures` error, you can enumerate the specific keys to use on a given project. Note that these keys **must** live in `~/.ssh`.

```yaml
keys:
  - id_rsa
  - some_other_key
```

### Changing the max key limit

You can also modify your Lando [global config](./global.md) to change the amount of keys that triggers the warning.

```yaml
maxKeyWarning: 25
```

Setting this to a sufficiently large integer effectively disables the warning.

### Using a custom `ssh` config file

If you want complete control over the `ssh` config Lando is using on your project, you should set `keys: false` and also inject a custom `ssh` config into the services that need it.

```yaml
keys: false
services:
  appserver:
    overrides:
      volumes:
        - ./config:/var/www/.ssh/config
```

In the above `.lando.local.yml` example, we are disabling key loading for the project and using a custom `ssh` config for the service named `appserver`.

This assumes your custom file exists in the app root and is named `config`. Also note that you will want to mount at the _user_ `ssh` config location and not the _system_ level one. This file will, generally, live at `$HOME/.ssh/config` which resolves to `/var/www/.ssh/config` for many, but not all, Lando services.

If you are unsure how to to get `$HOME`, you can discover it by watching either [this](https://www.youtube.com/watch?v=JVj61ZX_8Cs) or [this](https://www.youtube.com/watch?v=1vrEljMfXYo) video tutorial or by running the command as follows:

```bash
lando -s SERVICE -c "env | grep HOME"
```
