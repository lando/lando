#!/bin/sh

set -e

VERSION="$1"

# NOTE: we should have better protections here
php -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');"

# Allow for a few convenience install methods
if [ "$VERSION" = '1-latest' ]; then
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --1
elif [ "$VERSION" = '1' ]; then
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --1
elif [ "$VERSION" = '2-latest' ]; then
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --2
elif [ "$VERSION" = '2' ]; then
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --2
elif [ "$VERSION" = 'preview' ]; then
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --preview
elif [ "$VERSION" = 'snapshot' ]; then
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --snapshot
else
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --version="$VERSION"
fi

# Remove the setup script
php -r "unlink('/tmp/composer-setup.php');"

# Check if anything is installed globally
if [ -f /var/www/.composer/composer.json ]; then
  # If this is version 2 then let's make sure hirak/prestissimo is removed
  if composer --version 2>/dev/null | grep -E "Composer (version )?2." > /dev/null; then
    composer global remove hirak/prestissimo
  fi
fi
