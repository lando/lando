Events Example
==============

This example exists primarily to test the following documentation:

* [Events](http://docs.devwithlando.io/config/events.html)

See the [Landofiles](http://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Should start successfully
rm -rf test
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should run events on the appserver container by default
lando ssh -s appserver -c "cat /app/test/appserver-pre-start.txt | grep \\\$(hostname -s)"

# Should run events on the specified service
lando ssh -s web -c "cat /app/test/web-pre-start.txt | grep \\\$(hostname -s)"
lando ssh -s web -c "cat /app/test/web-post-start.txt | grep \\\$(hostname -s)"

# Should run on tooling commands as well
lando thing
lando ssh -s web -c "cat /app/test/web-post-thing.txt | grep \\\$(hostname -s)"

# Should run on rebuild without failin and trigger pre-rebuild event
lando rebuild -y | grep "ET TU, BRUT"
lando ssh -s web -c "cat /app/test/web-pre-rebuild.txt | grep rebuilding"
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff

# Should trigger pre-destroy event
stat test/destroy.txt
```
