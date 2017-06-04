Solr
====

[solr](http://lucene.apache.org/solr/) is highly reliable, scalable and fault tolerant, providing distributed indexing, replication and load-balanced querying, automated failover and recovery, centralized configuration and more. Solr powers the search and navigation features of many of the world's largest internet sites. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.


### Supported versions

  * 6.5
  * 6.4
  * 6.3
  * 5.5
  * 4.10
  * 3.6
  * latest
  * custom

### Example

{% codesnippet "./../examples/solr/.lando.yml" %}{% endcodesnippet %}

You will need to restart your app with `lando restart` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/solr)

### Using Earlier Solr Version

Solr versions `3.6` and `4.10` are designed primarily for use with Drupal. If you plan to use these versions with your application make sure you share in your custom `solr` config.
