Patch Version Example
=====================

This example uses our `nginx` service to illustrate how to use an "unsupported" but "use at your own risk" patch version of a service. **Note that not all services have patch versions available so please consult the documentation for your service.** Also, take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we "officially" support.

[Here](https://hub.docker.com/r/library/nginx/tags/) are all the tags that are available for the `nginx` service.

See the `.lando.yml` in this directory for configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Start up the example
lando start

# Verify the patch version
lando nginx -v
```
