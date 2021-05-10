#!/bin/bash

# Get our build dir
SRCDIR="$(pwd)/$1"
LANDO_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")

# Throw error if source directory does not exist
if [ ! -d "$SRCDIR" ]; then
  echo "$SRCDIR does not exist!"
  exit 1
fi

NEXT_WAIT_TIME=0
until hdiutil create -volname "Lando $LANDO_VERSION" -srcfolder "$SRCDIR" -ov -format UDZO dist/lando.dmg || [ $NEXT_WAIT_TIME -eq 5 ]; do
  sleep $(( NEXT_WAIT_TIME++ ))
done
