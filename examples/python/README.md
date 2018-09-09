Python Example
==============

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

Kill the python
---------------

Run the following steps to clean things up

```bash
# Kill the python
lando destroy -y
```
