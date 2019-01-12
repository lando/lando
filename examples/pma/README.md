phpMyAdmin Example
==================


[phpMyAdmin](https://www.phpmyadmin.net/) is a free software tool written in PHP, intended to handle the administration of MySQL over the Web. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[4.7](https://hub.docker.com/r/phpmyadmin/phpmyadmin/)** **(default)**
*   [4.6](https://hub.docker.com/r/phpmyadmin/phpmyadmin/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/phpmyadmin/phpmyadmin/tags/) are all the tags that are available for this service.

Example
-------


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/pma).

This example provides a very basic `phpmyadmin` example built ontop of the LEMP recipe.

See the `.lando.yml` in this directory for phpMyAdmin configuration options.

Starting the example
--------------------

Run the following commands to get up and running with this example.

```bash
# Start up PMA
lando start
```

Testing the example
-------------------

```bash
# Verify the PMA site is working
lando ssh appserver -c "curl -I pma.lemp.lndo.site | grep 200 | grep OK"

# Verify the databases are up and good
lando ssh database -c "mysql -ulemp -plemp lemp -e\"quit\""
lando ssh database2 -c "mysql -umariadb -ppassword database -e\"quit\""

# Verify our databases are hooked up to PMA
lando ssh pma -c "env | grep PMA_HOSTS=database,database2"
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Get URL info for accessing the pma interface
lando info
```

Destroying the examples
-----------------------

Run the following commands to kill this example.

```bash
# Destroy PMA
lando destroy -y
```
