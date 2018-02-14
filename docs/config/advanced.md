Advanced Service Configuration
==============================

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
