Elasticsearch Example
=====================

This example exists primarily to test the following documentation:

* [Elasticsearch Service](https://docs.devwithlando.io/tutorials/elasticsearch.html)

Start up tests
--------------

Run the following commands to get up and running
with this example.

```bash
# Should start up successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should use version 6.x for the default version
lando ssh -s defaults -c "curl -XGET localhost:9200" | grep "number" | grep "6."

# Should use 1025m as the default heap size
lando ssh -s defaults -c "env | grep ELASTICSEARCH_HEAP_SIZE=1025m"

# Should not portforward by default
lando info -s defaults | grep "not forwarded"

# Should use version 5.6.14 for the patch service
lando ssh -s patch -c "curl -XGET localhost:9200" | grep "number" | grep 5.6.14

# Should portforward for custom
lando info -s custom | grep "not forwarded" || echo $? | grep 1

# Should use the specified heap size when given
lando ssh -s custom -c "env | grep ELASTICSEARCH_HEAP_SIZE=1026m"

# Should mount custom config to the correct locations
lando ssh -s custom -c "cat /opt/bitnami/elasticsearch/config/elasticsearch_custom.yml | grep 311"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```

