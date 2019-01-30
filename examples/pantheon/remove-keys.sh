#!/bin/bash

ID=$(ssh-keygen -E md5 -lf /lando/keys/pantheon.lando.id_rsa | awk '{ print $2}' | cut -c 5- | sed 's/://g')

echo "Trying to remove key $ID"
terminus ssh-key:remove "$ID"
