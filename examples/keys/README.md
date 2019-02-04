Keys Example
============

This example exists primarily to test the following documentation:

* [SSH Keys](https://docs.devwithlando.io/config/ssh.html)

See the [Landofiles](http://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Should start successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should have our keys
lando ssh -s cli -u root -c "cat /etc/ssh/ssh_config | grep /lando/keys/badbadkey"
lando ssh -s cli2 -u root -c "cat /etc/ssh/ssh_config | grep /lando/keys/ppkey"
```

Destroy tests
-------------

```bash
# Remove generated test keys
lando ssh -s cli -u root -c "rm -f /lando/keys/badbadkey"
lando ssh -s cli -u root -c "rm -f /lando/keys/badbadkey.pub"

# Should destroy successfully
lando destroy -y
lando poweroff
```
