#!/bin/bash
KEYNAME="$1"

for KEY in $(platform ssh-key:list --columns id,title --format csv --no-header 2>/dev/null | grep "$KEYNAME" | sort -r); do
  ID=$(echo "$KEY" | cut -d, -f1)
  echo "Trying to remove key $ID"
  platform ssh-key:delete $ID || true
done
