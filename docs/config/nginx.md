# nginx

[nginx](https://www.nginx.com/resources/wiki/) is a very common webserver and reverse proxy

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   **[1.14](https://hub.docker.com/r/bitnami/nginx)** **(default)**
*   [custom](./../config/services.md#advanced)

## Patch versions

> #### Warning::Not officially supported!
>
> While we allow users to specify patch versions for this service they are not *officially* supported so if you use one YMMV.

To use a patch version you can do something like this:

```yaml
services:
  my-service:
    type: nginx:1.14.2
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/nginx) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  my-service:
    type: nginx:1.14
    webroot: .
    ssl: false
    config:
      server: SEE BELOW
      vhosts: SEE BELOW
      params: SEE BELOW
```

### Using custom nginx config files

You may need to override our [default nginx config](https://github.com/lando/lando/tree/master/plugins/lando-services/services/nginx) with your own custom [server](https://www.linode.com/docs/web-servers/nginx/how-to-configure-nginx/), [vhosts](https://www.linode.com/docs/web-servers/nginx/how-to-configure-nginx/) or [fastcgi_params](https://www.nginx.com/resources/wiki/start/topics/examples/full/) config.

If you do this you must use files that exists inside your applicaton and express them relative to your project root as below.

Note that the default files may change based on how you set `ssl`.

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory in the below example but you can call it whatever you want such as `.lando`.

```bash
./
|-- config
   |-- default.conf.tpl
   |-- nginx.conf.tpl
   |-- fastcgi_params
|-- index.html
|-- .lando.yml
```

**Landofile using custom nginx config**

```yaml
services:
  my-service:
    type: nginx
    config:
      server: config/nginx.conf.tpl
      vhosts: config/default.conf.tpl
      param: config/fastcgi_params
```
