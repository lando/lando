Mongo Example
=============

This example exists primarily to test the following documentation:

* [Mongo Service](https://docs.devwithlando.io/tutorials/mongo.html)

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
# Should use 4.0.x as the default version
lando ssh -s defaults -c "mongo --version | grep v4.0."

# Should use the user specified version if given
lando ssh -s custom -c "mongo --version | grep v3.6"

# Should use the user specified patch version if given
lando ssh -s patch -c "mongo --version | grep v4.1.4"

# Should add a new collection
lando mongo test --eval "printjson(db.createCollection(\'lando\'))"

# Should persist data after a rebuild
lando rebuild -y
lando mongo test --eval "printjson(db.getCollectionNames())" | grep lando

# Should use the user specified config if given
lando ssh -s custom -c "cat /opt/bitnami/mongodb/conf/mongodb.conf | grep HELLOTHERE"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
