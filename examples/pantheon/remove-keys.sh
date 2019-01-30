#!/bin/bash
for KEY in $(terminus ssh-key:list --fields=Description,ID 2>/dev/null | grep $(hostname) | sort -r | sed -e 's/ *[^ ]* *//'); do
  echo "Trying to remove key $KEY"
  terminus ssh-key:remove $KEY
done
