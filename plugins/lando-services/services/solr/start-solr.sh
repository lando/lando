#!/bin/bash

# Errors and logz
set -e
echo "Executing $0" "$@"

# Reporting
echo "Booting solr with..."
echo "CORE: $LANDO_SOLR_CORE"
echo "CONFIG CUSTOM: $LANDO_SOLR_CUSTOM"
echo "DATADIR: $LANDO_SOLR_DATADIR"
echo "INSTALL DIR": $LANDO_SOLR_INSTALL_DIR

# Make sure the conf dir is good if we have one
if [ "$LANDO_SOLR_CUSTOM" != "none" ]; then
  if [ -f "/solrconf/conf/solrcore.properties" ]; then
    if cat "/solrconf/conf/solrcore.properties" | grep "solr.install.dir"; then
      if cat "/solrconf/conf/solrcore.properties" | grep "solr.install.dir" | grep "$LANDO_SOLR_INSTALL_DIR"; then
        echo "solrcore.properties is good!"
      else
        cp -f "/solrconf/conf/solrcore.properties" "/solrconf/conf/solrcore.properties.old"
        echo "solr.install.dir=$LANDO_SOLR_INSTALL_DIR" >> "/solrconf/conf/solrcore.properties"
      fi
    fi
  fi
fi

# Chownage
mkdir -p /solrconf
chown -R solr:solr /solrconf
chown -R solr:solr /opt/solr

. /opt/docker-solr/scripts/run-initdb

# Go down to solr and run
if [ "$LANDO_SOLR_CUSTOM" != "none" ]; then
  gosu solr:solr docker-entrypoint.sh precreate-core "$LANDO_SOLR_CORE" /solrconf
  gosu solr:solr cp -a "/solrconf/conf/." "/opt/solr/server/solr/mycores/$LANDO_SOLR_CORE/conf/"
else
  gosu solr:solr docker-entrypoint.sh precreate-core "$LANDO_SOLR_CORE"
fi

gosu solr:solr solr -f
