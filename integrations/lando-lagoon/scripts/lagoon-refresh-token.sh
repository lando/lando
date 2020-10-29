#!/bin/bash

# Validates existing token if it exists...
# Otherwise, attempts to fetch and validate a new one.

# Set DEBUG to 1 for useful detail in output.
DEBUG=0
# If you want to save time and test this directly on your host system,
# set KEY_PATH as the absolute path to ~/.lando/keys. i.e. /Users/mmilano/.lando/keys
# Test with the following command: (Replace argument with the id to test with)
# ./integrations/lando-lagoon/scripts/lagoon-refresh-token.sh lagoon_me-at-example.io_ssh.lagoon.amazeeio.cloud
KEY_PATH="/lando/keys"

# Validate arg 1 is not empty
if [ -z $1 ]; then
  echo "Error: Key KEY_ID arg required"
  exit 0
fi

KEY_ID=$1
KEY_USER=${2:-lagoon}
KEY_HOST=${3:-ssh.lagoon.amazeeio.cloud}
KEY_PORT=${4:-32222}
KEY_URL=${5:-https://api.lagoon.amazeeio.cloud/graphql}
SSH_CMD="ssh  -o StrictHostKeyChecking=no -p ${KEY_PORT} -t ${KEY_USER}@${KEY_HOST} -i ${KEY_PATH}/${KEY_ID} token 2>/dev/null"

KEY_PRIVATE_FILE="${KEY_PATH}/${KEY_ID}"
KEY_PUBLIC_FILE="${KEY_PRIVATE_FILE}.pub"
KEY_TOKEN_FILE="${KEY_PRIVATE_FILE}.token"

if [ $DEBUG == 1 ]; then
  echo "*** ARGS ***"
  echo "- 0: $0"
  echo "- 1: $1"
  echo "- 2: $2"
  echo "- 3: $3"
  echo "- 4: $4"
  echo "- 5: $5"
  echo "*** VARS ***"
  echo "- KEY_ID: ${KEY_ID}"
  echo "- KEY_USER: ${KEY_USER}"
  echo "- KEY_HOST: ${KEY_HOST}"
  echo "- KEY_PORT: ${KEY_PORT}"
  echo "- KEY_URL: ${KEY_URL}"
  echo "- KEY_PATH: ${KEY_PATH}"
  echo "- SSH_CMD: ${SSH_CMD}"
  echo "- KEY_PRIVATE_FILE: ${KEY_PRIVATE_FILE}"
  echo "- KEY_PUBLIC_FILE: ${KEY_PUBLIC_FILE}"
  echo "- KEY_TOKEN_FILE: ${KEY_TOKEN_FILE}"
  echo "*** START ***"
fi

# Validate private key file exists
if [ ! -f $KEY_PRIVATE_FILE ]; then
  echo "Error: SSH Key does not exist on this system."
  echo $KEY_PRIVATE_FILE
  exit 0
fi

# Check if token is valid.
if [ -f $KEY_TOKEN_FILE ]; then
  # Set token value from file.
  TOKEN="$(cat ${KEY_TOKEN_FILE})"
  # Cleanup whitespace in the file.
  TOKEN=${TOKEN//[$'\t\r\n']}

  if [ $DEBUG == 1 ]; then
    echo "- TOKEN found; Attempting to fetch data with existing token"
  fi
fi

# Function to validate token.
function getResponse
{
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${KEY_URL}/graphql \
    --header "Authorization: Bearer ${TOKEN}" \
    --header 'Content-Type: application/json' \
    --data '{"query":"query {me {id}}"}')

  if [ $DEBUG == 1 ]; then
    echo "- Request Sent: ${KEY_URL}/graphql"
    echo "  - RESPONSE: ${RESPONSE}"
  fi
}

# Send request
getResponse

# No Response; Refresh token.
if [ $RESPONSE != "200" ]; then
  if [ $DEBUG == 1 ]; then
    echo "- Refreshing token"
  fi

  # Execute SSH token request.
  TOKEN=$(${SSH_CMD})

  if [ $DEBUG == 1 ]; then
    echo ${SSH_CMD}
  fi

  if [ -z $TOKEN ]; then
    echo "Error: SSH token request failed"
    echo $(cat $KEY_PUBLIC_FILE)
    exit 0
  else
    # Cleanup whitespace in the file.
    TOKEN=${TOKEN//[$'\t\r\n']}
    # Write token to file
    echo $TOKEN > $KEY_TOKEN_FILE
    if [ $DEBUG == 1 ]; then
      echo "- Created token file"
    fi
  fi
else
  # Token is good; No need to refresh.
  if [ $DEBUG == 1 ]; then
    echo "*** Result ***"
    echo "- Successfully validated existing token"
  fi
  exit 0
fi

# Send request with updated token
getResponse

# Refresh token if the response was not valid.
if [ $RESPONSE != "200" ]; then
  echo "Error: Unable validate new token"
  exit 0
else
  if [ $DEBUG == 1 ]; then
    echo "*** Result ***"
    echo "- Successfully created & validated token"
  fi
fi
