Apache Example
==============

This example provides a very basic `apache` web server.

See the `.lando.yml` in this directory for Apache configuration options.

Bootup
------

Run the following commands to get up and running with this example.

```bash
# Start up the example
lando start
```

Testing
-------

Run the following commands to validate things are rolling as they should.

```bash
# Verify we actually have the correct version of apache
lando ssh html -c "apachectl -V | grep Apache/2.2"

# Verify $LANDO_WEBROOT is set correctly
lando ssh html -c "env | grep LANDO_WEBROOT=/app/web"

# Verify that Lando certs are being used
lando ssh html -c "cat /usr/local/apache2/conf/httpd.conf | grep SSLCertificateFile | grep /certs/cert.crt"

# Verify that our custom envvar is in there
lando ssh html -c "env | grep STUFF=THINGS"

# Verify that we've exposed port 8081 correctly
docker inspect apache_html_1 | grep HostPort | grep 8081
lando info | grep http://localhost:8081
```

Cleanup
-------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the example
lando destroy -y
```
