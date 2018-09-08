nginx Example
=============

This example provides a very basic `nginx` web server.

See the `.lando.yml` in this directory for nginx configuration options.

Spin things up
--------------

Run the following commands to get up and running with this example.

```bash
# Start up an nginx server
lando start
```

Testing
-------

Run the following commands to validate things are rolling as they should.

```bash
# Verify we are using Lando certs
lando ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep ssl_certificate | grep /certs/cert.pem"

# Verify the webroot is correct
lando ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep root | grep /app/www"

# Verify the custom config is loaded
lando ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep CUSTOMTHINGGOTLODADED"
```

Cleanup
-------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the nginx server and clean things up
lando destroy -y
```
