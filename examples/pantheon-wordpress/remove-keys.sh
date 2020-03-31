#!/bin/bash
HOSTNAME="$1"

for KEY in $(terminus ssh-key:list --fields=Description,ID 2>/dev/null | grep "$HOSTNAME" | sort -r | sed -e 's/ *[^ ]* *//'); do
  echo "Trying to remove key $KEY"
  terminus ssh-key:remove $KEY
done
