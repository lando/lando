Advanced Service Configuration
==============================

> #### Warning::Use at your own peril
>
> While the below options can be very powerful in the hands of a seasoned pro they are not for the faint of heart. Please be careful and note that YMMV. While we will make a good faith effort to support intrepid users please note that once you go down any of these paths you are more or less on your own!

Using Dockerfiles
-----------------

You can use your own images by overriding any service to build from a `Dockerfile` that lives somewhere inside your app. Here is an example that extends our base `php` image to add another extension.

#### Landofile (.lando.yml)


#### Dockerfile


You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/dockerfile).

Overriding with Docker Compose
------------------------------

Our recipes and services layers are two levels of abstraction on top of the [Docker compose v3 file format](https://docs.docker.com/compose/compose-file/).

Lando will translate the configuration you specify for each recipe and/or service into relevant Docker Compose files and execute them at runtime. This gives you a lot of power to hypertune your services at the Docker Compose level.

You can pass Docker Compose config into each service using the `overrides` key.

Here is an example of an overriden `apache` service that uses a custom image and injects some additional environment variables.

```yml
services:
  html:
    type: apache:custom
    overrides:
      services:
        environment:
          STUFF: THINGS
          THINGS: GUYS
        image: pirog/myapache:2
```

Here is an example that uses a particular patch version of `nginx`

```yml
services:
  appserver:
    type: nginx:custom
    overrides:
      services:
        image: nginx:1.12.1
```

Building a Custom Service
-------------------------

You can also use our "catch all" service that allows power users to specify custom services that are not currently one of Lando's "supported" services. Technically speaking, this service is just a way for a user to define a service directly using the [Docker Compose V3](https://docs.docker.com/compose/compose-file/) file format. **THIS MEANS THAT IT IS UP TO THE USER TO DEFINE A SERVICE CORRECTLY**.

This service is useful if you are:

1. Thinking about contributing your own custom Lando service and just want to prototype something
2. Using Docker Compose config from other projects
3. Need a service not currently provided by Lando itself

{% codesnippet "./../examples/compose/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/compose).
