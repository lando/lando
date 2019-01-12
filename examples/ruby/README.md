Ruby Example
============

[Ruby](https://www.ruby-lang.org/en/) A dynamic, open source programming language with a focus on simplicity and productivity. It has an elegant syntax that is natural to read and easy to write. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[2.4](https://hub.docker.com/r/_/ruby/)** **(default)**
*   [2.2](https://hub.docker.com/r/_/ruby/)
*   [2.1](https://hub.docker.com/r/_/ruby/)
*   [1.9](https://hub.docker.com/r/_/ruby/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/ruby/tags/) are all the tags that are available for this service.

Example
-------


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/ruby).

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

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Run ruby cli
lando ruby -v

# Run bundler things
lando bundler

# Use travis gem
lando travis
```

Nuke everything
---------------

Run the following steps to clean things up

```bash
# Kill ruby
lando destroy -y
```
