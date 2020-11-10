#!/bin/bash

# Validates existing token if it exists...
# Otherwise, attempts to fetch and validate a new one.
KEY_HOST=${1:-ssh.lagoon.amazeeio.cloud}
KEY_USER=${2:-lagoon}
KEY_PORT=${3:-32222}
KEY=${4:-/key}

ssh -o StrictHostKeyChecking=no -p ${KEY_PORT} ${KEY_USER}@${KEY_HOST} -i $KEY token
