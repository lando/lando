#!/bin/bash
KEYID="$1"

# Get our access token from CURLZ
TOKEN=$(curl -X POST \
   -H "Content-Type:application/json" \
   -d \
'{
  "client_id": "$ACQUIA_API_KEY",
  "client_secret": "$ACQUIA_API_SECRET",
  "grant_type": "client_credentials",
  "scope": ""
}' \
 'https://accounts.acquia.com/api/auth/oauth/token' | jq -r '.access_token')

# Discover the key we need to remove
KEY_UUID=$(curl -X GET \
   -H "Authorization: Bearer $TOKEN" \
 'https://cloud.acquia.com/api/account/ssh-keys' | jq '._embedded.items[] | select(.label == "$KEYID")' | jq -r '.uuid')

echo "Trying to remove key $KEY_UUID"...
curl -i -X DELETE \
   -H "Authorization: Bearer $TOKEN" \
 "https://cloud.acquia.com/api/account/ssh-keys/$KEY_UUID"
