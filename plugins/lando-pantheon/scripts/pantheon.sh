#!/bin/sh

set -e

# Kick it off
echo "Pantheon pre-run scripting"

/helpers/add-cert.sh

# Set up some new dirs
mkdir -p /var/www/certs
mkdir -p /srv/bindings
chown -R www-data:www-data /var/www/certs /srv/bindings

# Set up some symlnks
ln -sfn /var/www /srv/bindings/lando
ln -sfn /tmp /srv/bindings/lando/tmp
ln -sfn /app /srv/bindings/lando/code

# Hook up a custom wp-cli.yml file to help with auto search-replace
# See: https://github.com/lando/lando/issues/1409
mkdir -p /var/www/.wp-cli
cat > /var/www/.wp-cli/config.yml <<EOF
path: $LANDO_WEBROOT
EOF

# Do another chown pass
find /var/www -type d -exec chown www-data:www-data {} +
