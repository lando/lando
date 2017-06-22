#!/bin/sh

set -e

echo "Pantheon pre-run scripting"

# Make tmp dir
mkdir -p /var/www/tmp

# Emulate /srv/bindings
if [ "$LANDO_SERVICE_NAME" == "appserver" ]; then
  mkdir -p /srv/bindings
  ln -sf $LANDO_MOUNT "/srv/bindings/lando" || true
fi

# Wait until our solr crt is ready and then whitelist it
# @todo: this is probably unneeded now that we can use `depends_on`
NEXT_WAIT_TIME=0
until [ -f /user/.lando/keys/pantheon/index.crt ] || [ $NEXT_WAIT_TIME -eq 5 ]; do
  echo "Waiting for index certs to be set up..."
  sleep $(( NEXT_WAIT_TIME++ ))
done

# Whitelist the index cert
mkdir -p /usr/share/ca-certificates/index
cp -rf /user/.lando/keys/pantheon/index.crt /usr/share/ca-certificates/index/index.crt
echo "index/index.crt" >> /etc/ca-certificates.conf
update-ca-certificates --fresh

# If we don't have an SSH key already let's create one
# if [ ! -f "$HOME/keys/${KALABOX_SSH_KEY}" ]; then
#   ssh-keygen -t rsa -N "" -C "${TERMINUS_USER}.kbox" -f "$HOME/keys/${KALABOX_SSH_KEY}"
# fi

# Post that key to pantheon
# NOTE: Pantheon is smart and will not add the same key twice
# terminus ssh-keys add --file="$HOME/keys/${KALABOX_SSH_KEY}.pub"

# If we don't have our dev cert already let's get it
# if [ ! -f "/certs/binding.pem" ]; then
#   $(terminus site connection-info --field=sftp_command):certs/binding.pem /certs/binding.pem
# fi

# Lets also check to see if we should refresh our cert
# if openssl x509 -checkend 86400 -noout -in /certs/binding.pem; then
#  echo "Cert is good!"
# else
#   $(terminus site connection-info --field=sftp_command):certs/binding.pem /certs/binding.pem
# fi

# Set some perms
nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /var/www/tmp &>/dev/null &
