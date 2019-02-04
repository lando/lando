Networking Example
==================

This example exists primarily to test the following documentation:

* [Networking](http://docs.devwithlando.io/config/networking.html)

See the [Landofiles](http://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Should init and start a lamp recipe
rm -rf lamp
lando init --source cwd --recipe lamp --name lando-lamp --webroot . --dest lamp
cp -rf index.php lamp/index.php
cd lamp && lando start

# Should init and start a lemp recipe
rm -rf lemp
lando init --source cwd --recipe lemp --name lando-lemp --webroot . --dest lemp
cp -rf index.php lemp/index.php
cd lemp && lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should have the correct entries in /certs/cert.ext
cd lamp
lando ssh -s appserver -c "cat /certs/cert.ext | grep lndo.site"
lando ssh -s appserver -c "cat /certs/cert.ext | grep landolamp.internal"
lando ssh -s appserver -c "cat /certs/cert.ext | grep appserver"
lando ssh -s appserver -c "cat /certs/cert.ext | grep localhost"

# Should be able to curl lemp from lamp at proxy addreses and internal hostname
cd lamp
lando ssh -s appserver -c "curl https://lando-lemp.lndo.site"
lando ssh -s appserver -c "curl https://appserver_nginx.landolemp.internal"

# Should be able to curl lamp from lemp at proxy addreses and internal hostname
cd lemp
lando ssh -s appserver -c "curl https://lando-lamp.lndo.site"
lando ssh -s appserver -c "curl https://appserver.landolamp.internal"

# Should even be able to connect to a database in a different app
cd lamp
lando ssh -s database -c "mysql -uroot -h database.landolemp.internal -e \'quit\'"
```

Destroy tests
-------------

```bash
# Should destroy lamp successfully
cd lamp && lando destroy -y

# Should destroy lemp successfully
cd lemp && lando destroy -y

# Should poweroff
lando poweroff
```
