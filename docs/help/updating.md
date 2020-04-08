---
description: Get some help if you have problems with Lando after updating.
---

# Updating

While we try to make updating as seamless as possible Lando has _a lot_ of moving parts so sometimes there are edge cases we miss. If you find yourself amongst the lucky edge cases we've prepared this guide to help you work through them on your own.

These are ordered from the lightest touch to the heaviest hand so we recommend you try them out in the order presented.

## 1. Do a `lando rebuild`

The vast majority of errors you may run into after updating can be resolved by running a `lando rebuild` on the problematic app. This will ensure your container is clean, up to date and rebuilt against the updated `lando` and `docker` versions.

```bash
lando rebuild -y
```

## 2. Force remove the proxy

If you're having trouble with `*.lndo.site` or custom `proxy` urls, and you've already determined you do not have an issue with [DNS Rebinding protection](./dns-rebind.md) then manually force removing the `proxy` container and restarting your app could help.

```bash
# Remove the proxy
docker rm -f landoproxyhyperion5000gandalfedition_proxy_1

# Restart the app
lando restart
```

Note that if you have other apps running when you force remove the `proxy` you will likely need to `lando restart` them as well.

## 3. Ensure permissions are correct

Due to the way permissions are mapped between containers and your host, particularly on Linux, you can sometimes end up with Lando config files being owned by `root`. If this happens you can remediate by recursively resetting `~/.lando` to be owned by you.

```bash
# Recursively reset ~/.lando to be owned by you
sudo chown -Rv USERNAME ~/.lando

# Or with a group if you know it
sudo chown -Rv USERNAME:GROUP ~/.lando

# Then try a lando restart
lando restart

# Then try a lando rebuild if the restart fails
lando rebuild
```

Note that `sudo` is needed here because some files may be owned by `root`. If you are unsure about your user id or group you can make use of the `id` command.

```bash
# Get information about your user and group
id

# Or just your username
id -un

# Or just your primary group
id -gn
```

## 4. Progressively prune the Lando config directory

More desperate times call for more desperate measures and more desperate measures mean progressively pruning `~/.lando` and then trying to `lando restart` or `lando rebuild`.

```bash
# Start by removing the cache
rm -rf ~/.lando/cache
# And then attempting a restart/rebuild
lando restart || lando rebuild

# Remove more and repeat
rm -rf ~/.lando/cache ~/.lando/compose ~/.lando/config ~/.lando/proxy ~/.lando/scripts
# And then attempting a restart/rebuild
lando restart || lando rebuild

# F it, burn it all down!
rm -rf ~/.lando
# And then attempting a restart/rebuild
lando restart || lando rebuild
```

## 5. Post an issue on GitHub or Slack

If you get this far and things are still not working the most likely scenario is you've found a legitimate bug which you should report. To do that either:

* [Join the Lando slack](https://launchpass.com/devwithlando) and report there
* [Spin up an issue on GitHub](https://github.com/lando/lando/issues/new/choose)
