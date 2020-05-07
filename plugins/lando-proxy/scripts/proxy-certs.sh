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
LANDO_MODULE="proxycerts"

# Bail if we are not root
if [ $(id -u) != 0 ]; then
  lando_warn "Only the root user can set up proxy certs!"
  lando_warn "This may prevent some SSL proxy routes from working correctly"
  exit 0
fi

# Vars and defaults
: ${LANDO_PROXY_PASSTHRU:="false"}
: ${LANDO_PROXY_CERT:="/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.crt"}
: ${LANDO_PROXY_KEY:="/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.key"}
: ${LANDO_PROXY_CONFIG_FILE:="/proxy_config/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.yaml"}

# Move over any global config set by lando
if [ -d "/lando/proxy/config" ]; then
  cp -rf /lando/proxy/config/* /proxy_config/
fi

# Bail if proxypassthru is off
if [ "$LANDO_PROXY_PASSTHRU" != "true" ]; then
  lando_info "Proxy passthru is off so exiting..."
  exit 0
fi

# If we have certs then lets add the proxy config
# We do this here instead of in the plugin code because it avoids a race condition
# where the proxy config file exists before the certs
if [ -f "$LANDO_PROXY_CERT" ] && [ -f "$LANDO_PROXY_KEY" ]; then
  lando_info "We have proxy certs!"

  # Remove older config if its there
  # We need to do this so traefik recognizes new certs and loads them
  if [ -f "$LANDO_PROXY_CONFIG_FILE" ]; then
    lando_debug "Removing older config"
    rm -f "$LANDO_PROXY_CONFIG_FILE"
  fi

  # Dump the yaml
  cat > "$LANDO_PROXY_CONFIG_FILE" <<EOF
tls:
  certificates:
    - certFile: "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.crt"
      keyFile: "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.key"
EOF

  # Log
  lando_info "Dumped config to ${LANDO_PROXY_CONFIG_FILE}"
  lando_debug $(cat $LANDO_PROXY_CONFIG_FILE)
fi
