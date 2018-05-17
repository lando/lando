Advanced Service Configuration
==============================

Using Dockerfiles
-----------------

You can use your own images by overriding any service to build from a `Dockerfile` that lives somewhere inside your app. Here is an example that extends our base `php` image to add another extension.

#### Landofile

{% codesnippet "./../examples/dockerfile/.lando.yml" %}{% endcodesnippet %}

#### Dockerfile

{% codesnippet "./../examples/dockerfile/php/Dockerfile" %}{% endcodesnippet %}

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
