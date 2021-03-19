#!/bin/bash

KEY="$1"
SECRET="$2"
KEYID="${3:-Landokey}"

# Get our access token from CURLZ
TOKEN=$(curl -X POST \
   -H "Content-Type:application/json" \
   -d \
'{
  "client_id": "$KEY",
  "client_secret": "$SECRET",
  "grant_type": "client_credentials",
  "scope": ""
}' \
 'https://accounts.acquia.com/api/auth/oauth/token' | jq -r '.access_token')

# Discover the key we need to remove
KEY_UUID=$(curl -X GET \
   -H "Authorization: Bearer $TOKEN" \
 'https://cloud.acquia.com/api/account/ssh-keys' | jq '._embedded.items[]' | KEYID="$KEYID" jq 'select(.label == env.KEYID)' | jq -r '.uuid')

echo "Trying to remove key $KEY_UUID"...
ERROR=$(curl -X DELETE \
 -H "Authorization: Bearer $TOKEN" \
 "https://cloud.acquia.com/api/account/ssh-keys/$KEY_UUID" | jq '.error')

# If we have an error then proceed
if [[ "$ERROR" == "null" ]]; then
  exit 0
else
  curl -X DELETE -H "Authorization: Bearer $TOKEN" "https://cloud.acquia.com/api/account/ssh-keys/$KEY_UUID"
  exit 1
fi
