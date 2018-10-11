Lando Share Example
==================

This example provides a very basic `share` example built on Lando php services.

Bootup
------

Run the following commands to get up and running with this example.

```bash
# Boot up a share example
lando start
```

Testing
-------

```bash
url=$(lando info | grep -oh "http://localhost:\\w*" | head -1)
# Verify the sharing service can start
lando share -u $url
```

Cleanup
-------

Run the following commands to destroy

```bash
# Destroy the example
lando destroy -y
```
