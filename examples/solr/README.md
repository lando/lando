Solr Example
============

This example exists primarily to test the following documentation:

* [Solr Service](https://docs.devwithlando.io/tutorial/solr.html)

Start up tests
--------------

Run the following commands to get up and running
with this example.

```bash
# Should start up succesfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should use version 7.x for the default version
lando ssh -s helper -c "curl defaults:8983/solr/admin/info/system?wt=json" | grep "solr-spec-version" | grep "7."

# Should use version 5.5.5 on patch version
lando ssh -s helper -c "curl patch:8983/solr/admin/info/system" | grep "solr-spec-version" | grep "5.5.5"

# Should use version 7.6 on custom version
lando ssh -s helper -c "curl custom:8983/solr/admin/info/system" | grep "solr-spec-version" | grep "7.6"

# Should use version 4.10.x on legacy4 version
lando ssh -s helper -c "curl legacy4:8983/solr/admin/info/system" | grep "solr-spec-version" | grep "4.10"

# Should have lando core by default
lando ssh -s helper -c "curl defaults:8983/solr/admin/cores?action=STATUS" | grep lando

# Should have custom core if given by user
lando ssh -s helper -c "curl custom:8983/solr/admin/cores?action=STATUS" | grep freedom
lando ssh -s helper -c "curl patch:8983/solr/admin/cores?action=STATUS" | grep solo

# Should have correct core permissions
lando ssh -s defaults -c "ls -lsa /opt/solr/server/solr/mycores/lando" | grep "solr solr" | wc -l | grep 5
lando ssh -s custom -c "ls -lsa /opt/solr/server/solr/mycores/freedom" | grep "solr solr" | wc -l | grep 5
lando ssh -s patch -c "ls -lsa /opt/solr/server/solr/mycores/solo" | grep "solr solr" | wc -l | grep 5
lando ssh -s legacy4 -c "ls -lsa /opt/solr-4.10.4/example/solr/collection1/data" | grep "solr solr" | wc -l | grep 5

# Should be able to set a record
lando post-record-defaults
lando post-record-patch

# Should be able to reload cores
lando ssh -s helper -c "curl http://defaults:8983/solr/admin/cores?action=RELOAD&core=lando"
lando ssh -s helper -c "curl http://custom:8983/solr/admin/cores?action=RELOAD&core=freedom"
lando ssh -s helper -c "curl http://patch:8983/solr/admin/cores?action=RELOAD&core=solo"

# Should have records persist a rebuild on version 5 plus
lando rebuild -y
lando ssh -s helper -c "curl http://defaults:8983/solr/lando/select?q=*:*" | grep "Tom Brady"
lando ssh -s helper -c "curl http://patch:8983/solr/solo/select?q=*:*" | grep "Tom Brady"

# Should load custom config
lando ssh -s custom -c "cat /solrconf/conf/schema.xml" | grep "drupal-6.5-solr-7.x"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```

