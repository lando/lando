Lando 101
=========

This example tests the [Lando 101](https://docs.lando.dev/guides/lando-101/lando-overview.html) course.

Start up tests
--------------

Run the following commands to get up and running with this example

```bash
# Should poweroff
lando poweroff

# Should start up successfully
mkdir -p lando-101
cd lando-101
cp ../.lando.yml .lando.yml
echo "<?php phpinfo(); ?>" > index.php
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return PHP info
cd lando-101
lando ssh -s appserver -c "curl -L localhost" | grep "PHP Version"

# Should use 7.3 as the default php version
cd lando-101
lando php -v | grep "PHP 7.3"
lando destroy -y

# Should be able to config for PHP 7.4
cd lando-101
cp ../.lando.config.yml .lando.yml
lando rebuild -y
lando php -v | grep "PHP 7.4"
lando destroy -y

# Should be able to add a service via the services key
cd lando-101
cp ../.lando.services.yml .lando.yml
lando rebuild -y
lando ssh -s mailhog -c "ls /usr/local/bin" |grep "MailHog"
lando destroy -y

# Should be able to reach a proxy domain
cd lando-101
cp ../.lando.proxy.yml .lando.yml
lando rebuild -y
curl -s -o /dev/null -X GET -I -w "%{http_code}" http://mail.lando-101.lndo.site | grep 200
lando destroy -y

# Should be able to use added custom tooling
cd lando-101
cp ../.lando.tooling.yml .lando.yml
lando rebuild -y
lando composer require squizlabs/php_codesniffer
lando phpcs --version |grep squiz
lando destroy -y
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd lando-101
lando destroy -y
lando poweroff
cd .. && rm -rf lando-101
```
