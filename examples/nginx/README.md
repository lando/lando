nginx Example
=============

[nginx](https://www.nginx.com/resources/wiki/) is a very common webserver and reverse proxy which you can easily add to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[1.13](https://hub.docker.com/r/_/nginx/)** **(default)**
*   [1.12](https://hub.docker.com/r/_/nginx/)
*   [1.11](https://hub.docker.com/r/_/nginx/)
*   [1.10](https://hub.docker.com/r/_/nginx/)
*   [1.9](https://hub.docker.com/r/_/nginx/)
*   [1.8](https://hub.docker.com/r/_/nginx/)
*   [mainline](https://hub.docker.com/r/_/nginx/)
*   [stable](https://hub.docker.com/r/_/nginx/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/nginx/tags/) are all the tags that are available for this service.

Example
-------


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/nginx).

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
sleep 10
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
