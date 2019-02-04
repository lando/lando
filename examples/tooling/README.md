Tooling Example
===============

This example exists primarily to test the following documentation:

* [Tooling](http://docs.devwithlando.io/config/tooling.html)

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
# Should be able to run a few php commands
lando php -v
lando php -m
lando php -r "phpinfo();"

# Should run as the specified user
lando iamroot
lando ssh -s php -c "cat /whoami | grep root"

# Should run as meUser by default
lando whoami | grep www-data

# Should be able to run multiple commands on one service
lando test

# Should be able to define and pass down options to a script
lando word --word bird | grep "bird is the word"
lando word -w gird | grep "gird is the word"

# Should be able to run multiple commands on multiple services
lando env

# Should be able to choose the service to run the command on with an option
lando dynamic --service web
lando dynamic -s php
lando dynamic --service web2

# Should not run twice on failed commands
lando busted | grep "i-do-not-exist" | wc -l | grep 1
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff
```
