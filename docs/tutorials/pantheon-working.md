Working with Pantheon
=====================

Lando offers a [recipe](./../recipes/pantheon.md) for spinning up apps that closely mimic the [Pantheon](http://pantheon.io) environment. Let's go over some basic usage. You should also check out Pantheon's [local dev](https://pantheon.io/docs/local-development/) docs.

Make a COMMITment to Lando
--------------------------

You will first want to clone down your Pantheon site so you can configure and commit a `.lando.yml` to your repo. For this example we will be using an external Pantheon repo stored on GitHub.

```bash
# Clone Pantheon Sites
git clone git@github.com:thinktandem/pantheon-workflow-demo.git workflow
cd workflow

# Create a .lando.yml file in the root and populate it with below
touch .lando.yml

# Commit the file to your repo
git add .
git commit -m "You look absolutely beautiful"

# Start the Pantheon app
# If you have composer.json Lando will automatically run composer install
lando start
```

### .lando.yml

```yml
name: workflow
recipe: pantheon
config:
  framework: drupal
  xdebug: true
  id: 0d4eedc2-183e-4d80-8f00-9c9720b5c816
  site: drupal-7-pantheon-basicz
  env: dev
services:
  node:
    type: node:6.10
tooling:
  node:
    service: node
  npm:
    service: node
```

Authenticate with Terminus
--------------------------

If you do not already have a Pantheon [machine token](https://pantheon.io/docs/machine-tokens/) we suggest you [create one](https://pantheon.io/docs/machine-tokens/).

```bash
# Authenticate with terminus
lando terminus auth:login --machine-token=MYTOKEN

# Verify authentication
lando terminus auth:whoami

# Optionally pull down drush aliases
lando terminus aliases

# Verify we have some aliases
lando drush sa
```

Import your Pantheon Database
-----------------------------

```bash
# Create a new backup of your database
lando terminus backup:create drupal-7-pantheon-basicz.dev --element=db

# Download and import backup of the database
lando terminus backup:get drupal-7-pantheon-basicz.dev --element=db --to=/tmp/database.sql.gz
lando ssh -c "cat /tmp/database.sql.gz | gunzip | mysql -h database pantheon"

# Drush to Verify
# If you are using a nested docroot make sure you go into web first
lando drush cc all
lando drush status
```

Import your Pantheon Files
--------------------------

If you've spun up a Lando app using one of our [recipes](./../config/recipes.md) then its likely relevant services are already exposed and ready for access.

```bash
# Create a new backup of your files
lando terminus backup:create drupal-7-pantheon-basicz.dev --element=files

# Download and extract backup of the files
lando terminus backup:get drupal-7-pantheon-basicz.dev --element=files --to=/tmp/files.tar.gz
lando ssh -c "tar -xzvf /tmp/files.tar.gz -C $LANDO_MOUNT/$FILEMOUNT"
```

In the example above you can access the `mariadb` database from your host at `localhost:32787`. Note that this port is automatically assigned by Docker itself and will change every time you restart your app.

That said, Lando provides a way to "lock down" these ports so they are more predictable.

Other Helpful Things
--------------------

```bash
# Get a list of wp-cli commands
lando wp

# Download a dependency with drush
lando drush dl views

# Download a dependency with composer
lando composer config repositories.drupal composer https://packages.drupal.org/8
lando composer require "drupal/search_api_pantheon ~1.0" --prefer-dist

# Download a backdrop dependency
lando drush dl webform
```

Check out our [Pantheon Recipe](./../recipes/pantheon.md) for details on more advanced usage.
