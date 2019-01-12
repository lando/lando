Apache Example
==============

[Apache](https://www.apache.org/) is a very common webserver which you can easily add to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[2.4](https://hub.docker.com/r/_/httpd/)** **(default)**
*   [2.2](https://hub.docker.com/r/_/httpd/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/httpd/tags/) are all the tags that are available for this service.


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


Example
-------

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/apache).

