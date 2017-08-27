Elasticsearch
=============

[Elasticsearch](https://www.elastic.co/products/elasticsearch) is a search and analytics engine, commonly used as a substitute for Solr or for collecting log and metrics data. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [5.5](https://hub.docker.com/r/itzg/elasticsearch/)
*   [5.4](https://hub.docker.com/r/itzg/elasticsearch/)
*   [5.3](https://hub.docker.com/r/itzg/elasticsearch/)
*   [5.2](https://hub.docker.com/r/itzg/elasticsearch/)
*   [5.1](https://hub.docker.com/r/itzg/elasticsearch/)
*   [latest](https://hub.docker.com/r/itzg/elasticsearch/)
*   custom

Example
-------

{% codesnippet "./../examples/elasticsearch/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/elasticsearch).

Getting information
-------------------

You can get connection and credential information about your elasticsearch instance by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "search": {
    "type": "elasticsearch",
    "version": "5.4",
    "internal_connection": {
      "host": "search",
      "port": 9200
    },
    "external_connection": {
      "host": "localhost",
      "port": "9999"
    }
  },
  "appserver": {
    "type": "node",
    "version": "6.10",
    "urls": [
      "http://localhost:32780",
      "http://elasticsearch.lndo.site:8000"
    ]
  }
}
```
