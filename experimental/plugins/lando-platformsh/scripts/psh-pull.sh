#!/bin/bash

set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="platformsh"

# Unset PLATFORM_RELATIONSHIPS and PLATFORM_APPLICATION for this script
#
# PLATFORM_RELATIONSHIPS is what the platform cli uses to determine whether
# you are actually on platform or not so if this is set then things like
# platform db:command will use localhost instead of the remote environment
#
# PLATFORM_APPLICATION is similarly used to determine for platform mount:command
OLD_PLATFORM_RELATIONSHIPS=$PLATFORM_RELATIONSHIPS
OLD_PLATFORM_APPLICATION=$PLATFORM_APPLICATION
unset PLATFORM_RELATIONSHIPS
unset PLATFORM_APPLICATION

# Collect mounts and relationships
PLATFORM_PULL_MOUNTS=()
PLATFORM_PULL_RELATIONSHIPS=()
PLATFORM_AUTH=${PLATFORMSH_CLI_TOKEN}

# PARSE THE ARGZZ
while (( "$#" )); do
  case "$1" in
    --auth|--auth=*)
      if [ "${1##--auth=}" != "$1" ]; then
        PLATFORM_AUTH="${1##--auth=}"
        shift
      else
        PLATFORM_AUTH=$2
        shift 2
      fi
      ;;
    -r|--relationship|--relationship=*)
      if [ "${1##--relationship=}" != "$1" ]; then
        PLATFORM_PULL_RELATIONSHIPS=($(echo "${1##--relationship=}" | sed -r 's/[,]+/ /g'))
        shift
      else
        PLATFORM_PULL_RELATIONSHIPS=($(echo "$2" | sed -r 's/[,]+/ /g'))
        shift 2
      fi
      ;;
    -m|--mount|--mount=*)
      if [ "${1##--mount=}" != "$1" ]; then
        PLATFORM_PULL_MOUNTS=($(echo "${1##--mount=}" | sed -r 's/[,]+/ /g'))
        shift
      else
        PLATFORM_PULL_MOUNTS=($(echo "$2" | sed -r 's/[,]+/ /g'))
        shift 2
      fi
      ;;
    --)
      shift
      break
      ;;
    -*|--*=)
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Validate auth
# We re-export in this script just in case PLATFORMSH_CLI_TOKEN has been lost
# which can happen if you destroy and start without reinitializing
export PLATFORMSH_CLI_TOKEN="$PLATFORM_AUTH"
lando_pink "Verifying you are authenticated against platform.sh..."
platform auth:info

# Validate project
lando_pink "Verifying your current project..."
lando_green "Verified project id: $(platform project:info id)"

# If there are no relationships specified then indicate that
if [ ${#PLATFORM_PULL_RELATIONSHIPS[@]} -eq 0 ]; then
  lando_warn "Looks like you did not pass in any relationships!"
  lando_info "That is not a problem. However here is a list of available relationships you can try next time!"
  platform relationships --refresh
# Otherwise loop through our relationships and import them
else
  for PLATFORM_RELATIONSHIP in "${PLATFORM_PULL_RELATIONSHIPS[@]}"; do
    lando_pink "Importing data from the $PLATFORM_RELATIONSHIP relationship..."
    eval "LCD=\$LANDO_CONNECT_${PLATFORM_RELATIONSHIP^^}"
    platform db:dump -r $PLATFORM_RELATIONSHIP -o | $LCD
  done
fi

# If there are no mounts specified then indicate that
if [ ${#PLATFORM_PULL_MOUNTS[@]} -eq 0 ]; then
  lando_warn "Looks like you did not pass in any mounts!"
  lando_info "That is not a problem. However here is a list of available mounts you can try next time!"
  platform mounts --refresh
# Otherwise loop through our mounts and download them them
else
  for PLATFORM_MOUNT in "${PLATFORM_PULL_MOUNTS[@]}"; do
    # Try to split PLATFORM_MOUNT
    IFS=':' read -r -a PLATFORM_MOUNT_PARTS <<< "$PLATFORM_MOUNT"
    # Set the source and target
    PLATFORM_MOUNT_SOURCE="${PLATFORM_MOUNT_PARTS[0]}"
    PLATFORM_MOUNT_TARGET="${PLATFORM_MOUNT_PARTS[1]}"
    # If PLATFORM_MOUNT_TARGET is still empty lets set it from the source
    if [ -z "$PLATFORM_MOUNT_TARGET" ]; then
      PLATFORM_MOUNT_TARGET="/app/$PLATFORM_MOUNT_SOURCE"
    fi
    lando_pink "Downloading files from the $PLATFORM_MOUNT_SOURCE mount into $PLATFORM_MOUNT_TARGET"
    platform mount:download --mount $PLATFORM_MOUNT_SOURCE --target "$PLATFORM_MOUNT_TARGET" -y
  done
fi

# Finish up!
lando_green "Pull completed successfully!"
