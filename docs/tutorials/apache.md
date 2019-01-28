Apache
======

[Apache](https://www.apache.org/) is a very common webserver which you can easily add to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.yml).

<!-- toc -->

Supported versions
------------------

*   **[2.4](https://hub.docker.com/r/bitnami/apache)** **(default)**
*   [custom](./../config/services.md#advanced)

Patch versions
--------------

> #### Warning::Not officially supported!
>
> While we allow users to specify patch versions for this service they are not *officially* supported so if you use one YMMV.

To use a patch version you can do something like this:

```yaml
services:
  my-service:
    type: apache:2.4.33
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/apache/tags) for the underlying image we are using.

Configuration
-------------

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  my-service:
    type: apache:2.4
    webroot: .
    ssl: false
    config:
      server: SEE BELOW
      vhosts: SEE BELOW
```

### Using custom Apache config files

The default `config` files depend on how you have set `ssl` but are all available [here](https://github.com/lando/lando/tree/master/plugins/lando-services/services/apache).

Note that if you set `config` to use your own files then those files should exist inside your applicaton and be expressed relative to your project root as below.

**A hypothetical project**

```bash
./
|-- config
   |-- default.conf
   |-- httpd.conf
|-- docroot
   |-- index.html
|-- .lando.yml
```

**Landofile using custom apache config**

```yaml
services:
  my-service:
    type: apache
    webroot: docroot
    config:
      server: config/httpd.conf
      vhosts: config/default.conf
```

Example
-------

If you are interested in a working example of this service that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/apache](https://github.com/lando/lando/tree/master/examples/apache)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
