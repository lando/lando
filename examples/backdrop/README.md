Backdrop Recipe Example
=======================

This example provides a very basic `backdrop` recipe example.

See the `.lando.yml` in this directory for Backdrop configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Get backdrop
# NOTE: Probably want to replace with the latest release
# See: https://github.com/backdrop/backdrop/releases
curl -fsSL "https://github.com/backdrop/backdrop/archive/1.11.3.tar.gz" | tar -xz --strip 1 -C ./www

# Start up the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run Backdrop drush commands
# You need to install Backdrop before you can do this
cd www
lando drush status
```

Bootup
------

Bootup the example for testing.

```bash
# Start the Backdrop example app
lando start
```

Testing
-------

```bash
# Test getting Backdrop codebase
if [ -d "www" ]; then rm -Rf www; fi
git clone https://github.com/backdrop/backdrop.git www

# Verify that there is a backdrop code base
lando ssh -c "ls www |grep index.php"

# Test removing database
lando ssh -c "mysql -ubackdrop -pbackdrop -h database -e \'drop database if exists backdrop\'"

# Test adding a database
lando ssh -c "mysql -ubackdrop -pbackdrop -h database -e \'create database if not exists backdrop\'"

# Test installing Backdrop via drush
lando ssh -c "cd www && drush si --db-url=mysql://backdrop:backdrop@database/backdrop -y"

# Verify that we can visit the homepage
lando ssh -c "curl appserver |grep \'This is your first post! You may edit or delete it.\'"
```

Cleanup
-------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the example
lando destroy -y
```
