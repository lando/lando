MailHog
=======

[MailHog](https://github.com/mailhog/MailHog) is an email testing tool for developers.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.yml).

<!-- toc -->

Prefer video tutorials?
{% youtube %}
https://youtu.be/C1XfgfzcUJc
{% endyoutube %}

Supported versions
------------------

*   **[v1.0.0](https://hub.docker.com/r/mailhog/mailhog/)** **(default)**
*   [custom](./../config/services.md#advanced)

Patch versions
--------------

This service does not support patch versions but if you **really** need something like that you could consider using either a [custom compose service](./compose.md) or a service [overrides](./../config/services.md#overrides).

Configuration
-------------

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  my-service:
    type: mailhog:v1.0.0
    portforward: false
    hogfrom: []
```

### Portforwarding

`portforward` will allow you to access this service externally by given you a port directly on your host's `localhost`. Note that `portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  my-service:
    type: mailhog
    portforward: true
```

**Not recommended**

```yaml
services:
  my-service:
    type: mailhog
    portforward: 1025
```

### Hogging Mail

You will need to list the services the wish to hog mail from using the `hogfrom` config key. Note that the services in the list should be other services in your application. They can be discovered by running [lando info](./../cli/info.md).

> #### Warning::Config may differ
>
> While we will automatically configure the underlying `mail` binary for any `php` service you choose to `hogfrom` you may need to consult the documentation for the specific type of service you are choosing to hogfrom.
>

Here is an example of a Landofile's `services` config that hogfroms a `php` service called `appserver`.

```yaml
services:
  my-service:
    type: mailhog:v1.0.0
    portforward: false
    hogfrom:
      - appserver
  appserver:
    type: php
```

Note that we will install the [mhsendmail](https://github.com/mailhog/mhsendmail) binary at `/usr/local/bin/mhsendmail` in each `hogfrom` service for you to use. Each of these services should also be able to access the MailHog STMP server using the `MH_SENDMAIL_SMTP_ADDR` environment variable which his set to `sendmailhog:1025` by default.

Getting information
-------------------

You can get connection and credential information about your mailhog instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

Example
-------

If you are interested in a working example of this service that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/mailhog](https://github.com/lando/lando/tree/master/examples/mailhog)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
