Elasticsearch
=============

[Elasticsearch](https://www.elastic.co/products/elasticsearch) is a search and analytics engine, commonly used as a substitute for Solr or for collecting log and metrics data. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[5.5](https://hub.docker.com/r/itzg/elasticsearch/)** **(default)**
*   [5.4](https://hub.docker.com/r/itzg/elasticsearch/)
*   [5.3](https://hub.docker.com/r/itzg/elasticsearch/)
*   [5.2](https://hub.docker.com/r/itzg/elasticsearch/)
*   [5.1](https://hub.docker.com/r/itzg/elasticsearch/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/itzg/elasticsearch/tags/) are all the tags that are available for this service.

Here is an example of overriding the `nginx` service to use a patched version.

{% codesnippet "./../examples/patchversion/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/patchversion).

Example
-------

{% codesnippet "./../examples/elasticsearch/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/elasticsearch).

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
