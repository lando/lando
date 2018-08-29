Dockerfile Example
==================

This example shows how you can extend our `php` Docker images to add in extra php extensions using a Dockerfile instead of the normal Lando [build steps](https://docs.devwithlando.io/config/build.html) or [overrides](https://docs.devwithlando.io/config/advanced.html).

This method can be used for any of the other images we use to power our other [services](https://docs.devwithlando.io/config/services.html).

See the `.lando.yml` in this directory for configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Start up the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Verify the provided via-dockerfile-php extension is loaded
lando php -i | grep pcntl
```
