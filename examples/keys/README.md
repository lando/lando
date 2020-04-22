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
lando ssh -s cli -u root -c "cat /etc/ssh/ssh_config" | grep "/lando/keys/badbadkey"
lando ssh -s cli2 -u root -c "cat /etc/ssh/ssh_config" | grep "/lando/keys/ppkey"
lando ssh -s cli2 -u root -c "cat /etc/ssh/ssh_config" | grep "/lando/keys/key with space"
lando ssh -s thesekeys -u root -c "cat /etc/ssh/ssh_config" | grep "/user/.ssh/mykey3"

# Should have the LANDO_LOAD_KEYS envvar set correctly by default
lando ssh -s cli -c "env" | grep LANDO_LOAD_KEYS | grep true

# Should not load user keys if keys is set to false in a Landofile
cp -f .lando.local.yml.nokeys .lando.local.yml
lando rebuild -y
lando ssh -s cli -c "env" | grep LANDO_LOAD_KEYS | grep false
lando ssh -s cli -c "/etc/ssh/ssh_config" | grep "/user/.ssh" || echo "$?" | grep 1

# Should load only user keys specified by user in a Landofile
cp -f .lando.local.yml.thesekeys .lando.local.yml
lando rebuild -y
lando ssh -s thesekeys -c "env" | grep LANDO_LOAD_KEYS | grep "mykey mykey2"
lando ssh -s thesekeys -c "/etc/ssh/ssh_config" | grep "/user/.ssh/mykey"
lando ssh -s thesekeys -c "/etc/ssh/ssh_config" | grep "/user/.ssh/mykey2"
lando ssh -s thesekeys -c "/etc/ssh/ssh_config" | grep "/user/.ssh/mykey3" || echo "$?" | grep 1
```

Destroy tests
-------------

```bash
# Remove generated test keys and files
rm -f .lando.local.yml
lando ssh -s cli -u root -c "rm -f /lando/keys/badbadkey"
lando ssh -s cli -u root -c "rm -f /lando/keys/badbadkey.pub"

# Should destroy successfully
lando destroy -y
lando poweroff
```
