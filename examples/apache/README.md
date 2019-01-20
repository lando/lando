Apache Example
==============

[Apache](https://www.apache.org/) is a very common webserver which you can easily add to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Note that this example exists primarily to test our documentation and verify the service works as intended.
See: https://docs.devwithlando.io/services/apache.html

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
lando ssh html -c "apachectl -V | grep Apache/2.4"

# Verify $LANDO_WEBROOT is set correctly
lando ssh html -c "env | grep LANDO_WEBROOT=/app/web"

# Verify that Lando certs are being used
lando ssh html -c "cat /usr/local/apache2/conf/httpd.conf | grep SSLCertificateFile | grep /certs/cert.crt"

# Verify that our custom envvar is in there
lando ssh html -c "env | grep STUFF=THINGS"

# Verify that we've exposed port 8081 correctly
docker inspect apache_html_1 | grep HostPort | grep 8081
lando info | grep http://localhost:8081

# Verify htaccess-lando is working
curl -I http://apache.lndo.site/folder1 | grep "Location: http://apache.lndo.site/folder2/"
```

Cleanup
-------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the example
lando destroy -y
```
