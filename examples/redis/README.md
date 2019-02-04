Redis Example
=============

This example exists primarily to test the following documentation:

* [Redis Service](https://docs.devwithlando.io/tutorials/redis.html)

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
# Should use 5.x as the default version
lando ssh -s defaults -c "redis-server --version | grep v=5.0.3"

# Should be able to connect to redis
lando ssh -s defaults -c "redis-cli CONFIG GET databases"

# Should use the user specified version if given
lando ssh -s custom -c "redis-server --version | grep v=4."

# Should use the user specifiec patch version if given
lando ssh -s patch -c "redis-server --version | grep v=4.0.11"

# Should persist data if specified
docker inspect landoredis_custom_1 | grep appendonly

# Should use custom config if specified
lando ssh -s custom -c "redis-cli CONFIG GET databases" | grep 18

# Should include the redis-cli
lando ssh -s defaults -c "redis-cli --version"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
