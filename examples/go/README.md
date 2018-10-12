Go Example
==========

This example provides a very basic `go` web server.

See the `.lando.yml` in this directory for Go configuration options.

Start it
--------

Run the following steps to get up and running with this example.

```bash
# Start up a very basic go app
lando start
```

Validate things
---------------

```bash
# Verify our go cli version
lando go version | grep go1.8.

# Verify we are serving the right thing
lando ssh appserver -c "curl localhost | grep YOUDONTKNOWMEATALL"
```

Purge
-----

Clean up

```bash
# Destroy the dotnet app
lando destroy -y
```
