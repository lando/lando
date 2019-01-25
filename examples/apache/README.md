Apache Example
==============

This example exists primarily to test the following documentation:

* [Apache](https://docs.devwithlando.io/services/apache.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Start up the example
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Verify we actually have the correct version of apache
lando ssh -s html -c "apachectl -V | grep Apache/2.2"

# Verify $LANDO_WEBROOT is set correctly
lando ssh -s html -c "env | grep LANDO_WEBROOT=/app/web"

# Verify that Lando certs are being used
lando ssh -s html -c "cat /usr/local/apache2/conf/httpd.conf | grep SSLCertificateFile | grep /certs/cert.crt"

# Verify that our custom envvar is in there
lando ssh -s html -c "env | grep STUFF=THINGS"

# Verify that we've exposed port 8081 correctly
docker inspect apache_html_1 | grep HostPort | grep 8081
lando info | grep http://localhost:8081
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the example
lando destroy -y
```
