Python Example
==============

[Python](https://www.python.org/) is a programming language that lets you work more quickly and integrate your systems more effectively. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [3](https://hub.docker.com/r/_/python/)
*   **[3.6](https://hub.docker.com/r/_/python/)** **(default)**
*   [3.5](https://hub.docker.com/r/_/python/)
*   [3.4](https://hub.docker.com/r/_/python/)
*   [3.3](https://hub.docker.com/r/_/python/)
*   [2](https://hub.docker.com/r/_/python/)
*   [2.7](https://hub.docker.com/r/_/python/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/python/tags/) are all the tags that are available for this service.

Example
-------


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/python).
This example provides a very basic `python` web server.

See the `.lando.yml` in this directory for Python configuration options.

This is the dawning of the basic python app
-------------------------------------------

Run the following steps to get up and running with this example.

```bash
# Start up this python app
lando start
```

Verifying
---------

Validate things!

```bash
# Verify we are serving the right thing
lando ssh appserver -c "curl localhost | grep CAUSELOVINGHIMWASRED"

# Verify we have the python cli
lando python --version

# Verify we have the right python version
lando python -V | grep 3.6.

# Verify we have pip cli
lando pip -V

# Verify we have the easy_install cli
lando easy_install --version

# Verify we have the pyvenv cli
lando pyvenv --help

# Verify we have the livereload tool
lando livereload -h
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Run python dev tools
lando python --version
lando pip
lando easy_install
lando pyvenv

# livereload cli
lando livereload
```

Kill the python
---------------

Run the following steps to clean things up

```bash
# Kill the python
lando destroy -y
```
