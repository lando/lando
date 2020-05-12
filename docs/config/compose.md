---
description: If there isn't a service Lando provides out of the box use this to add any other Docker image using Docker Compose syntax.
---

# Compose

This service is a "catch all" that allows power users to specify custom services that are not currently one of Lando's [supported services](./../config/services.md). You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

Technically speaking, this service is just a way for a user to define a service directly using the [Docker Compose V3](https://docs.docker.com/compose/compose-file/) file format.

**THIS MEANS THAT IT IS UP TO THE USER TO DEFINE A SERVICE CORRECTLY**.

This service is useful if you are:

1. Thinking about contributing your own custom Lando service and just want to prototype something
2. Using Docker Compose config from other projects
3. Need a service not currently provided by Lando itself

[[toc]]

## Configuration

Unlike other services, `compose` does not require a `version`, instead it allows you to directly configure Docker Compose's top-level `volumes`, `networks`, and `services` config directly.

::: tip We highly recommend you check the Docker Compose docs!
`services`, `volumes` and `networks` below come directly from Docker Compose so we *highly recommend* you check out their [docs](https://docs.docker.com/compose/compose-file/).
:::

```yaml
services:
  custom-service:
    type: compose
    app_mount: delegated
    services:
      image: drupal:8
      # Required. See Below
      command: docker-php-entrypoint apache2-foreground
      ports:
        - '80'
    volumes:
      my-volume:
    networks:
      my-network:
```

### Setting the app mount

Many Docker images will put code in `/app`. This directly conflicts with Lando's default codebase mount point. If you are running into a problem because of this collision, we recommend you [disable](./services.md#app-mount) the `app_mount` by setting it to `false` or `disabled`.

This will prevent Lando from mounting your codebase to `/app` so the Docker image can use its own code at `/app`.

```yaml
services:
  pghero:
    type: compose
    app_mount: false
    services:
      image: ankane/pghero
      command: puma -C config/puma.rb
```


### Setting the command

Note that while `compose` services also get the same Lando *secret sauce*, there is a notable difference. By default, Lando will hijack the Docker containers `entrypoint`. This means if your custom container sets its own entrypoint, you will need to remove that entrypoint and set it as the first argument in the `command`.

```yaml
services:
  custom-service:
    type: compose
    app_mount: delegated
    services:
      image: drupal:8
      # Required. See Below
      command: docker-php-entrypoint apache2-foreground
      ports:
        - '80'
    volumes:
      my-volume:
    networks:
      my-network:
```

In the example above, `docker-php-entrypoint` is the default `entrypoint` for the `drupal:8` image but we have moved it so that it is the first argument of `command`. This both allows the container to run as expected and allows Lando to do its thing.

### Choosing the user

Many non-Lando containers do not run as the `root` user by default. This is OK but comes with a few caveats. The most relevant are that Lando will not be able to execute its normal boot up steps which:

* Map `host:container` user permissions
* Generate a certificate for the service
* Load user and lando managed SSH keys

Also note that containers that do not have `bash` installed, like some `alpine` ones, will similarly not be able to load up SSH keys.

These factors _may_ or _may not_ be relevant depending on what you are doing so they are here just as a FYI.

If you are using a container that **cannot** run as `root` but still want that Lando magic you can try something like below.

```yaml
services:
  custom-service:
    type: compose
    services:
      user: root
      image: drupal:8
      # Required. See Below
      command: docker-php-entrypoint apache2-foreground
      ports:
        - '80'
      environment:
        LANDO_DROP_USER: otheruser
    volumes:
      my-volume:
    networks:
      my-network:
```

The relevant pieces here are setting `user: root` and then the environment variable `LANDO_DROP_USER` to whatever user the container is suppose to run as.

In this example the container will boot as `root` do the Lando things it needs to do and then run `docker-php-entrypoint apache2-foreground` as `otheruser`.

<RelatedGuides tag="Compose"/>
