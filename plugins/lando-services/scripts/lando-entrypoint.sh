#!/bin/sh

set -e

# Run any scripts that we've loaded into the mix
if [ -d "/scripts" ]; then
  run-parts --regex '^.*\.sh$' /scripts
fi;

# Run the COMMAND
echo "Running command $@"
"$@"
