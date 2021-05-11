#!/bin/bash
set -e

# Get our file
FILE="$(pwd)/$1"

# Throw error if file does not exist
if [ ! -f "$FILE" ]; then
  echo "$FILE does not exist!"
  exit 1
fi

# Verify we have the envvars we need
if [ -z "$APPLE_NOTARY_USER" ]; then
  echo "APPLE_NOTARY_USER needs to be a valid Apple Developer username"
  exit 2
fi
if [ -z "$APPLE_NOTARY_PASSWORD" ]; then
  echo "APPLE_NOTARY_PASSWORD needs to be set!"
  exit 3
fi

# Start the notarization process
echo "Uploading $FILE for notarization..."
RID=$(xcrun altool \
  --notarize-app \
  --primary-bundle-id "io.lando.mpkg.lando" \
  --username "$APPLE_NOTARY_USER" \
  --password "$APPLE_NOTARY_PASSWORD" \
  --file "$FILE" 2>&1 | awk '/RequestUUID/ { print $NF; }')

# Handle success or fail of upload
echo "Notarization RequestUUID: $RID"
if [[ $RID == "" ]]; then
  echo "Problem uploading!"
  exit 1
fi

# Wait until we good
NOTARY_STATUS="in progress"
while [[ "$NOTARY_STATUS" == "in progress" ]]; do
  echo -n "waiting... "
  sleep 10
  NOTARY_STATUS=$(xcrun altool \
    --notarization-info "$RID" \
    --username "$APPLE_NOTARY_USER" \
    --password "$APPLE_NOTARY_PASSWORD" 2>&1 | awk -F ': ' '/Status:/ { print $2; }' )
  echo "We are currently waiting with status of $NOTARY_STATUS"
done

# Exit if there is an issue
if [[ $NOTARY_STATUS != "success" ]]; then
  echo "Could not notarize Lando! Status: $NOTARY_STATUS"
  exit 1
fi

# Do a final stapling
echo "Stapling $FILE..."
xcrun stapler staple "$FILE"
