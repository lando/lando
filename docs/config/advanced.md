Advanced Service Configuration
==============================

Our services layer is an abstraction on top of the [Docker compose v3 file format](https://docs.docker.com/compose/compose-file/). Specifically, Lando will translate the configuration you specify for each service into relevant docker compose files and execute them at runtime. This gives you a lot of power to hypertune your services at the docker compose level. You can pass docker compose config into each service using the `overrides` key.

Here is an example of an overriden apache service that uses a custom image and injects some additional environment variables.

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
