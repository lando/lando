#!/bin/bash

if [ ! -z "$APPLE_CERTS_DATA" ] && [ ! -z "$APPLE_CERTS_PASSWORD" ]; then

  # Export
  echo $APPLE_CERTS_DATA | base64 --decode > /tmp/certs.p12

  # Create keychain and import things
  security create-keychain -p travis macos-build.keychain
  security default-keychain -s macos-build.keychain
  security unlock-keychain -p travis macos-build.keychain
  security set-keychain-settings -t 3600 -u macos-build.keychain
  security import /tmp/certs.p12 -k ~/Library/Keychains/macos-build.keychain -P "$APPLE_CERTS_PASSWORD" -T /usr/bin/codesign -T /usr/bin/productsign

  # Key signing
  security set-key-partition-list -S apple-tool:,apple: -s -k travis macos-build.keychain

  # Verify the things
  security find-identity -v macos-build.keychain | grep FY8GAUX282 | grep "Developer ID Installer"
  security find-identity -v macos-build.keychain | grep FY8GAUX282 | grep "Developer ID Application"

fi
