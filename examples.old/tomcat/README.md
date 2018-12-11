Tomcat Example
============

This example provides a very basic Tomcat web server, ready to deploy webapps placed in the configured `webapps` folder.

See the `.lando.yml` in this directory for Tomcat configuration options.

Important Tomcat-specific configuration
---------------------------------------

The .lando.yml file is configured to look for Tomcat configuration files in the `confg` folder. If you plan to use the Tomcat Manager webapp, you'll need to add a user in the `config/tomcat-users.xml` file. See the [Tomcat documentation](https://tomcat.apache.org/tomcat-8.0-doc/manager-howto.html#Configuring_Manager_Application_Access) for more details.

If you'd like a simple webapp to try first, you should try the useful and handy [Psi-probe](https://github.com/psi-probe/psi-probe/wiki/InstallationApacheTomcat).

Start me up
-----------

Run the following commands to get up and running with this example.

```bash
# Start up the solr
lando start
```

Validate things are good
------------------------

Run the following commands to confirm things

```bash
# Verify tomcat is serving something
lando ssh appserver -c "curl -I tomcat.lndo.site | grep HTTP | grep 200"
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# connect to the Tomcat container as root
lando ssh -u root
```

Destroy things
--------------

Run the following commands to clean up

```bash
# Destroy the tomcat
lando destroy -y
```
