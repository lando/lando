SSH Keys
========

By default Lando will forward all the **NOT PASSPHRASE PROTECTED** keys in your `~/.ssh` and `~/.lando/keys` directories into each service. This means that you should be able to use your ssh keys like you were running commands natively on your machine. You can additionally load in passphrase protected keys by setting `loadPassphraseProtectedKeys: true` in the Lando [global config](./config.md).

Please note that `~/.lando/keys` is a location managed by Lando so it is recommended that you do not alter anything in this folder.

| Host Location | Managed |
| -- | -- |
| `~/.ssh` | `no` |
| `~/.lando/keys` | `yes` |

If you are unsure about what keys get loaded you can use the following commands for key discovery.

```bash
# Check whether global passphrase key loading is turned on or not
lando config | grep loadPassphraseProtectedKeys

# Check out service logs for key loading debug output
# Obviously replace appserver with the service you are interested in
lando logs -s appserver

# Check the .ssh config for a given service
# Obviously replace appserver with the service you are interested in
lando ssh appserver -c "cat /etc/ssh/ssh_config"
```
