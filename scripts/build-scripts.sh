#!/bin/bash
set -e

# Get the script type
SCRIPT_TYPE=$1
LANDO_SCRIPTS_DIR=build/installer/scripts
PKG_SCRIPTS_DIR=build/installer/pkg/scripts

# Build scripts
mkdir -p "$PKG_SCRIPTS_DIR/$2"
echo '#!/bin/bash' > "$PKG_SCRIPTS_DIR/$2/$SCRIPT_TYPE"
echo '' >> "$PKG_SCRIPTS_DIR/$2/$SCRIPT_TYPE"
chmod +x "$PKG_SCRIPTS_DIR/$2/$SCRIPT_TYPE"

# Check for lando script
if [ -f "${LANDO_SCRIPTS_DIR}/${SCRIPT_TYPE}" ]; then
  echo '' >> "$PKG_SCRIPTS_DIR/$2/$SCRIPT_TYPE"
  cat "${LANDO_SCRIPTS_DIR}/${SCRIPT_TYPE}" >> "$PKG_SCRIPTS_DIR/$2/$SCRIPT_TYPE"
fi
