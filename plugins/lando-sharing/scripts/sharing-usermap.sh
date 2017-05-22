#!/bin/sh

set -e

# Adding user to map too if needed
echo "Making sure host user is mappable..."
groupadd --force --gid "$SHARING_GID" "$SHARING_GROUP"
id -u "$SHARING_USER" &>/dev/null || useradd --gid "$SHARING_GID" -M -N --uid "$SHARING_UID" "$SHARING_USER"

# Correctly map users
echo "Remapping ownership to handle docker volume sharing..."
usermod -u "$LANDO_HOST_UID" "$SHARING_USER"
groupmod -g "$LANDO_HOST_GID" "$SHARING_GROUP" || true
