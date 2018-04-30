MongoDB
=======

[MongoDB](https://en.wikipedia.org/wiki/MongoDB)  is a free and open-source cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with schemas. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[3.5](https://hub.docker.com/r/_/mongo/)** **(default)**
*   [3.4](https://hub.docker.com/r/_/mongo/)
*   [3.2](https://hub.docker.com/r/_/mongo/)
*   [3.0](https://hub.docker.com/r/_/mongo/)
*   custom

Example
-------

{% codesnippet "./../examples/mongo/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mongo).

Getting information
-------------------

You can get connection and credential information about your mongo instance by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "database": {
    "type": "mongo",
    "version": "latest",
    "internal_connection": {
      "host": "database",
      "port": 27017
    },
    "external_connection": {
      "host": "localhost",
      "port": "27018"
    }
  },
  "appserver": {
    "type": "node",
    "version": "6.10",
    "urls": [
      "http://localhost:32835",
      "http://mongo.lndo.site",
      "https://mongo.lndo.site"
    ]
  }
}
```
