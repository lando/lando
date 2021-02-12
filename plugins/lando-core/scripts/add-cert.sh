#!/bin/sh

set -e

# Set defaults
: ${SILENT:=$1}

# Echo helper to recognize silence
if [ "$SILENT" = "--silent" ]; then
  LANDO_QUIET="yes"
fi

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="addcert"

# Bail if we are not root
if [ $(id -u) != 0 ]; then
  lando_warn "Only the root user can add certs!"
  lando_warn "This may prevent some hostnames from working correctly when served over https"
  exit 0
fi

# Vars and defaults
: ${LANDO_DOMAIN:="lndo.site"}
: ${LANDO_CA_CERT:="/lando/certs/lndo.site.pem"}
: ${LANDO_CA_KEY:="/lando/certs/lndo.site.key"}
: ${LANDO_EXTRA_NAMES}:=""}
: ${LANDO_PROXY_NAMES}:=""}
: ${CA_DIR:="/usr/share/ca-certificates"}
: ${CA_CERT_FILENAME:="${LANDO_DOMAIN}.pem"}
: ${CA_CERT_CONTAINER:="$CA_DIR/$CA_CERT_FILENAME"}

# Common name
COMMON_NAME="${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.internal"

# Make sure our cert directories exists
mkdir -p /certs $CA_DIR

# Setup cert SANz
cat > /certs/cert.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = ${COMMON_NAME}
DNS.2 = ${LANDO_SERVICE_NAME}
DNS.3 = localhost
${LANDO_PROXY_NAMES}
${LANDO_EXTRA_NAMES}
EOF

# Enable SSL on apache if we have to
#
# @NOTE: Once we decouple the php container from apache like we do for nginx we can
# move this to the apache service
if [ -f "/etc/apache2/mods-available/ssl.load" ]; then
  lando_info "Enabling apache ssl modz"
  cp -rf /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled || true
  cp -rf /etc/apache2/mods-available/socache_shmcb* /etc/apache2/mods-enabled || true
fi

# Check if openssl is installed, if not install it
if ! [ -x "$(command -v openssl)" ]; then
  lando_info "Installing openssl..."
  apt-get update -y && apt-get install openssl -y || apk add --no-cache openssl
fi

# Make sure the LANDO_CA_CERT exists
if [ ! -f $LANDO_CA_CERT ]; then
  /helpers/setup-ca.sh
fi

# Validate the certs against the root CA
if [ -f "/certs/cert.pem" ] && ! openssl verify -CAfile $LANDO_CA_CERT /certs/cert.pem >/dev/null; then
  lando_info "Certs are not valid! Lets remove them."
  rm -f /certs/cert.key
  rm -f /certs/cert.csr
  rm -f /certs/cert.crt
  rm -f /certs/cert.pem
fi

# Cert add heating up
lando_info "Cert creation kicking off...."
lando_info ""
lando_debug "=================================================="
lando_debug "LANDO_CA_CERT     : $LANDO_CA_CERT"
lando_debug "LANDO_CA_KEY      : $LANDO_CA_KEY"
lando_debug "CA_DIR            : $CA_DIR"
lando_debug "CA_CERT_FILENAME  : $CA_CERT_FILENAME"
lando_debug "CA_CERT_CONTAINER : $CA_CERT_CONTAINER"
lando_debug "COMMON_NAME       : $COMMON_NAME"
lando_debug "LANDO_PROXY_NAMES : $LANDO_PROXY_NAMES"
lando_debug "LANDO_EXTRA_NAMES : $LANDO_EXTRA_NAMES"
lando_debug "=================================================="
lando_info ""

lando_info "Generating certs..."
openssl genrsa -out /certs/cert.key 2048
openssl req -new -key /certs/cert.key -out /certs/cert.csr -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=Bespin/CN=${COMMON_NAME}"
openssl x509 \
  -req \
  -in /certs/cert.csr \
  -CA $LANDO_CA_CERT \
  -CAkey $LANDO_CA_KEY \
  -CAcreateserial \
  -out /certs/cert.crt \
  -days 825 \
  -sha256 \
  -extfile /certs/cert.ext

# Pemify
cat /certs/cert.crt /certs/cert.key > /certs/cert.pem
# Also copy to our persistent cert volume
cp -f /certs/cert.crt "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.crt"
cp -f /certs/cert.key "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.key"
# This is a weird hack to handle recent changes to bitnami's apache image without causing
# breaking changes
cp -f /certs/cert.crt /certs/server.crt
cp -f /certs/cert.key /certs/server.key
# Set the cert and key on host to host-uid/gid ownership
chown "$LANDO_HOST_UID:$LANDO_HOST_GID" "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.crt"
chown "$LANDO_HOST_UID:$LANDO_HOST_GID" "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.key"
# Change permissions on the folder to let others install certs as needed
chgrp www-data /certs
chmod 775 /certs

# Trust our root CA
if [ ! -f "$CA_CERT_CONTAINER" ]; then
  lando_info "$CA_CERT_CONTAINER not found... copying $LANDO_CA_CERT over"
  cp -f $LANDO_CA_CERT $CA_CERT_CONTAINER
  echo "$CA_CERT_FILENAME" >> /etc/ca-certificates.conf
fi
