Could not find an available, non-overlapping IPv4
=================================================

If you see an error similar to this:

```bash
ERROR: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network
Creating network "landoproxyhyperion5000gandalfedition_edge" with driver "bridge"
ERROR: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network
error:  Error: Error: 1
```

For more detail see:

  * [Issue #274](https://github.com/lando/lando/issues/274)
  * [Issue #451](https://github.com/lando/lando/issues/451)

You have two corrective pathways to choose from.

1. Update Lando
---------------

Run `lando version`. If you are below `v3.0.0-beta.34` then [download](https://github.com/lando/lando/releases) the latest release, update your version of `lando` and rerun the `lando` command that failed. Lando should now take corrective action.

2. Manually Prune Your Docker Networks
--------------------------------------

```bash
# Remove all unused networks
# This is the easiest thing to do to get you back on the right track
docker network prune

# Check out all your docker networks and then selectively remove enough to
# placate the error message
docker network ls
docker networm rm NETWORK_ID_OR_NAME_FROM_ABOVE_COMMAND
```

Once you do the above you should be able to rerun the `lando` command that failed.
