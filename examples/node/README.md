Node Example
============

This example exists primarily to test the following documentation:

* [Node Service](https://docs.devwithlando.io/tutorials/node.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should start up successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should use 10.x as the default version
lando ssh -s defaults -c "env | grep NODE_VERSION=10."

# Should use a user specified version if given
lando ssh -s custom -c "env | grep NODE_VERSION=11."

# Should use a user specified patch version if given
lando ssh -s patch -c "env | grep NODE_VERSION=10.14.2"

# Should serve over port 80 by default
lando ssh -s defaults -c "curl http://localhost | grep tune"

# Should set NODE_EXTRA_CA_CERTS with lando domain CA
lando ssh -s defaults -c \'env | grep NODE_EXTRA_CA_CERTS | grep "$LANDO_CA_CERT"\'

# Should only serve over http by default
lando ssh -s defaults -c "curl -k https://localhost" || echo $? | grep 1

# Should serve over specified port if given
lando ssh -s custom -c "curl http://localhost:3000 | grep tune"

# Should serve over https is ssl is set by user
lando ssh -s custom -c "curl -k https://localhost | grep tune"

# Should install global dependencies if specified by user and have them available in PATH
lando ssh -s custom -c "gulp -v"
lando ssh -s custom -c "which gulp | grep /var/www/.npm-global"

# Should PATH prefer node dependency binaries installed in /app/node_modules over global ones
lando ssh -s custom -c "npm install gulp-cli --no-save"
lando ssh -s custom -c "gulp -v"
lando ssh -s custom -c "which gulp | grep /app/node_modules/.bin"
lando ssh -s custom -c "npm uninstall gulp-cli"
lando ssh -s custom -c "which gulp | grep /var/www/.npm-global"

# Should not serve port for cli
lando ssh -s cli -c "curl http://localhost" || echo $? | grep 1
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
