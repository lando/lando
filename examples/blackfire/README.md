Blackfire Example
=============

This example provides a very basic `blackfire` service.

There are no configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Copy the example env file
cp .env.example .env

# Add your SERVER ID and SERVER TOKEN to the `.env` file...

# Start up the example
lando start

# Checkout the blackfire commands
lando blackfire
```

Note: the blackfire command has to run as root, so if you need to use it, set it up like our example:

```yaml
tooling:
  blackfire:
    service: blackfire
    user: root
```
