#!/bin/bash
set -e

# Verify we have the envvars we need
if [ -z "$APPLE_CERT_DATA" ]; then
  echo "APPLE_CERT_DATA needs to be set with a base64 encoded p12!"
  exit 2
fi
if [ -z "$APPLE_CERT_PASSWORD" ]; then
  echo "APPLE_CERT_PASSWORD needs to be set with your p12 password!"
  exit 3
fi
if [ -z "$APPLE_TEAM_ID" ]; then
  echo "APPLE_TEAM_ID needs to be set with your cert user id!"
  exit 4
fi

# Export certs
echo "$APPLE_CERT_DATA" | base64 --decode > /tmp/certs.p12

# Create keychain
security create-keychain -p actions macos-build.keychain
security default-keychain -s macos-build.keychain
security unlock-keychain -p actions macos-build.keychain
security set-keychain-settings -t 3600 -u macos-build.keychain

# Import certs to keychain
security import /tmp/certs.p12 -k ~/Library/Keychains/macos-build.keychain -P "$APPLE_CERT_PASSWORD" -T /usr/bin/codesign -T /usr/bin/productsign
# Key signing
security set-key-partition-list -S apple-tool:,apple: -s -k actions macos-build.keychain
# Verify the things
security find-identity -v macos-build.keychain | grep "$APPLE_TEAM_ID" | grep "Developer ID Application"
security find-identity -v macos-build.keychain | grep "$APPLE_TEAM_ID" | grep "Developer ID Installer"
