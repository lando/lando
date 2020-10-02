Custom Landofile Name Example
=============================

This example exists primarily to test the issue:

* <https://github.com/lando/lando/issues/1919>

Start up tests
--------------

```bash
# Should set up the config
bash ./set-config.sh

# Should start successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should merge in all custom named Landofiles correctly
lando node --version
lando npm --version
lando yarn --version
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff

# Should remove custom config.yml and restore old one if applicable
bash ./restore-config.sh
true
```
