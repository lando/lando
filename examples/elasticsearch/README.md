Elasticsearch Example
=====================

This example provides Elasticsearch via a basic NodeJS web application.

See the `.lando.yml` in this directory for Elasticsearch configuration options.

Launch the app
--------------

Run the following steps to get up and running with this example.

```bash
# Start up the elastic search example
lando start
```

Validate things
--------------

Run the following steps to get up and running with this example.

```bash
# Verify the portforward
lando info | grep 9999

# Verify we have the node cli at the correct version
lando node -v | grep v6.10.

# Verify we have npm
lando npm -v

# Verify we have yarn
lando yarn --version

# Verify the ES version
lando ssh appserver -c "curl -XGET search:9200 | grep 5.4."

# Verify we can access ES
lando ssh appserver -c "curl localhost | grep \"All is well\""
```

Kill it
-------

Run these to clean up the example

```bash
# Destroy the app
lando destroy -y
```
