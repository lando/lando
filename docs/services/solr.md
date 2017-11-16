Solr
====

[Solr](http://lucene.apache.org/solr/) is highly reliable, scalable and fault tolerant, providing distributed indexing, replication and load-balanced querying, automated failover and recovery, centralized configuration and more. Solr powers the search and navigation features of many of the world's largest internet sites. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [7.1](https://hub.docker.com/r/_/solr/)
*   [7.0](https://hub.docker.com/r/_/solr/)
*   [6.6](https://hub.docker.com/r/_/solr/)
*   [6.5](https://hub.docker.com/r/_/solr/)
*   [6.4](https://hub.docker.com/r/_/solr/)
*   [6.3](https://hub.docker.com/r/_/solr/)
*   [5.5](https://hub.docker.com/r/_/solr/)
*   [4.10](https://hub.docker.com/r/actency/docker-solr)
*   [3.6](https://hub.docker.com/r/actency/docker-solr)
*   [latest](https://hub.docker.com/r/_/solr/)
*   custom

Example
-------

{% codesnippet "./../examples/solr/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/solr).

Using Earlier Solr Version
--------------------------

Solr versions `3.6` and `4.10` are designed primarily for use with Drupal. If you plan to use these versions with your application make sure you share in your custom `solr` config.

Getting information
-------------------

You can get connection and credential information about your solr instance by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "appserver": {
    "type": "node",
    "version": "6.10",
    "urls": [
      "http://localhost:32797",
      "http://solr.lndo.site"
    ]
  },
  "node": {
    "type": "node",
    "version": "6.10"
  },
  "index": {
    "type": "solr",
    "version": "5.5",
    "internal_connection": {
      "core": "freedom",
      "host": "index",
      "port": 8983
    },
    "external_connection": {
      "core": "freedom",
      "host": "localhost",
      "port": 9999
    }
  }
}
```
