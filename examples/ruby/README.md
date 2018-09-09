Ruby Example
============

This example provides a very basic Ruby web application.

See the `.lando.yml` in this directory for Ruby configuration options.

Launch ruby
-----------

Run the following steps to get up and running with this example.

```bash
# Start up this ruby app
lando start
```

Verifying
---------

Validate things!

```bash
# Verify we are serving the right thing
lando ssh appserver -c "curl localhost | grep TROUBLETROUBLETROUBLE"

# Verify we have the ruby cli
lando ruby -v

# Verify we have the right ruby version
lando ruby -v | grep 2.4.

# Verify we have bundler cli
lando bundler -v

# Verify we have the gem cli
lando gem -v

# Verify we have the travis cli
lando travis version
```

Nuke everything
---------------

Run the following steps to clean things up

```bash
# Kill ruby
lando destroy -y
```
