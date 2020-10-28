#!/bin/sh

set -e

VERSION="$1"

# NOTE: we should have better protections here
php -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');"
php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --version="$VERSION"
php -r "unlink('/tmp/composer-setup.php');"

# If this is version 2 then let's make sure hirak/prestissimo is removed
if composer --version 2>/dev/null | grep "Composer version 2." > /dev/null; then
  composer global remove hirak/prestissimo
fi
