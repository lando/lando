Solr Example
============

This example exists primarily to test the following documentation:

* [Solr Service](https://docs.devwithlando.io/tutorials/solr.html)

Start up tests
--------------

Run the following commands to get up and running
with this example.

```bash
# Should start up successfully
lando poweroff
lando start

# Should reset old conf
cp -r 7.x/solrcore.properties.old 7.x/solrcore.properties
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

# Should use version 3.6.x on legacy3 version
lando ssh -s helper -c "curl legacy3:8983/solr/admin/registry.jsp" | grep "solr-spec-version" | grep "3.6"

# Should have lando core by default
lando ssh -s helper -c "curl defaults:8983/solr/admin/cores?action=STATUS" | grep lando

# Should have custom core if given by user
lando ssh -s helper -c "curl custom:8983/solr/admin/cores?action=STATUS" | grep freedom
lando ssh -s helper -c "curl patch:8983/solr/admin/cores?action=STATUS" | grep solo

# Should have correct core permissions
lando ssh -s defaults -c "ls -lsa /opt/solr/server/solr/mycores/lando" | grep "solr solr" | wc -l | grep 5
lando ssh -s custom -c "ls -lsa /opt/solr/server/solr/mycores/freedom" | grep "solr solr" | wc -l | grep 5
lando ssh -s patch -c "ls -lsa /opt/solr/server/solr/mycores/solo" | grep "solr solr" | wc -l | grep 5
lando ssh -s legacy4 -c "ls -lsa /opt/solr-4.10.4/example/solr/collection1" | grep "solr solr" | wc -l | grep 6
lando ssh -s legacy3 -c "ls -lsa /opt/solr/example/solr" | grep "solr solr" | wc -l | grep 7

# Should be able to set a record
lando post-record-custom
lando post-record-defaults
lando post-record-legacy
lando post-record-patch

# Should be able to reload cores
lando ssh -s helper -c "curl http://defaults:8983/solr/admin/cores?action=RELOAD&core=lando"
lando ssh -s helper -c "curl http://custom:8983/solr/admin/cores?action=RELOAD&core=freedom"
lando ssh -s helper -c "curl http://legacy4:8983/solr/admin/cores?action=RELOAD&core=collection1"
lando ssh -s helper -c "curl http://patch:8983/solr/admin/cores?action=RELOAD&core=solo"

# Should have records persist a rebuild on version 4 plus
lando rebuild -y
lando ssh -s helper -c "curl http://custom:8983/solr/freedom/select?q=*:*" | grep "12"
lando ssh -s helper -c "curl http://defaults:8983/solr/lando/select?q=*:*" | grep "Tom Brady"
lando ssh -s helper -c "curl http://legacy4:8983/solr/collection1/select?q=*:*" | grep "12"
lando ssh -s helper -c "curl http://patch:8983/solr/solo/select?q=*:*" | grep "Tom Brady"

# Should load custom config
lando ssh -s custom -c "cat /solrconf/conf/schema.xml" | grep "drupal-6.5-solr-7.x"
lando ssh -s legacy4 -c "cat /opt/solr-4.10.4/example/solr/collection1/conf/schema.xml" | grep "filezzzz"
lando ssh -s legacy3 -c "cat /opt/solr/example/solr/conf/schema.xml" | grep "FOR REAAAAALLLL"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```

