Memcached Example
=================

This example exists primarily to test the following documentation:

* [Memcached Service](https://docs.devwithlando.io/tutorials/memcached.html)

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
# Should use 1.x as the default version
lando ssh -s defaults -c "memcached --version | grep 1."

# Should use the user specified version if given
lando ssh -s custom -c "memcached --version | grep 1.5.12"

# Should use the user specifiec patch version if given
lando ssh -s patch -c "memcached --version | grep 1.5.11"

# Should set the default cache size to 64
lando ssh -s defaults -c "env | grep MEMCACHED_CACHE_SIZE=64"

# Should set the user specified cache size if given
lando ssh -s custom -c "env | grep MEMCACHED_CACHE_SIZE=256"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
