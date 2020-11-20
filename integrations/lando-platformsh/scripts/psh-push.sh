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
PLATFORM_PUSH_MOUNTS=()
PLATFORM_PUSH_RELATIONSHIPS=()
PLATFORM_AUTH=${PLATFORMSH_CLI_TOKEN}
PLATFORM_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "master")

# Error if you want to push to master
if [ "$PLATFORM_BRANCH" == 'master' ]; then
  lando_red "Pushing directly to production is not allowed!"
  exit 6
fi

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
        PLATFORM_PUSH_RELATIONSHIPS=($(echo "${1##--relationship=}" | sed -r 's/[,]+/ /g'))
        shift
      else
        shift 2
      fi
      ;;
    -m|--mount|--mount=*)
      if [ "${1##--mount=}" != "$1" ]; then
        PLATFORM_PUSH_MOUNTS=($(echo "${1##--mount=}" | sed -r 's/[,]+/ /g'))
        shift
      else
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

# Validate env
lando_pink "Verifying $PLATFORM_BRANCH is an active environment..."
if ! platform env -I --pipe | grep $PLATFORM_BRANCH >/dev/null; then
  PLATFORM_PARENT=$(platform environment:info -e $PLATFORM_BRANCH parent 2>/dev/null || echo "master")
  lando_yellow "Branch $PLATFORM_BRANCH is inactive... using the parent environment ($PLATFORM_PARENT) instead"
  PLATFORM_BRANCH="$PLATFORM_PARENT"
fi
lando_green "Verified the $PLATFORM_BRANCH environment is active"

# Validate ssh keys are good
lando_pink "Verifying your ssh keys work are deployed to the project..."
if ! platform ssh "true" 2>/dev/null; then
 echo "Could not connect over SSH correctly..."
 lando_info "Redeploying environment to reload keys..."
 platform redeploy -y
fi

# If relationships or mounts contain "none" then unset the whole thing so we skip
for PLATFORM_RELATIONSHIP in "${PLATFORM_PUSH_RELATIONSHIPS[@]}"; do
  if [ "$PLATFORM_RELATIONSHIP" == 'none' ]; then
    unset PLATFORM_PUSH_RELATIONSHIPS
  fi
done
for PLATFORM_MOUNT in "${PLATFORM_PUSH_MOUNTS[@]}"; do
  if [ "$PLATFORM_MOUNT" == 'none' ]; then
    unset PLATFORM_PUSH_MOUNTS
  fi
done

# If there are no relationships specified then indicate that
if [ ${#PLATFORM_PUSH_RELATIONSHIPS[@]} -eq 0 ]; then
  lando_warn "Looks like you did not pass in any relationships!"
  lando_info "That is not a problem. However here is a list of available relationships you can try next time!"
  platform relationships --refresh || true
# Otherwise loop through our relationships and import them
else
  for PLATFORM_RELATIONSHIP in "${PLATFORM_PUSH_RELATIONSHIPS[@]}"; do
    # Try to split PLATFORM_RELATIONSHIP
    IFS=':' read -r -a PLATFORM_RELATIONSHIP_PARTS <<< "$PLATFORM_RELATIONSHIP"
    # Set the source and target
    PLATFORM_RELATIONSHIP_RELATIONSHIP="${PLATFORM_RELATIONSHIP_PARTS[0]}"
    PLATFORM_RELATIONSHIP_SCHEMA="${PLATFORM_RELATIONSHIP_PARTS[1]}"
    # If PLATFORM_RELATIONSHIP_SCHEMA is still empty lets set it to the default schema: usually main
    if [ -z "$PLATFORM_RELATIONSHIP_SCHEMA" ]; then
      eval "PLATFORM_RELATIONSHIP_SCHEMA=\$LANDO_CONNECT_${PLATFORM_RELATIONSHIP_RELATIONSHIP^^}_DEFAULT_SCHEMA"
    fi
    lando_pink "Exporting local data into the remote $PLATFORM_RELATIONSHIP_RELATIONSHIP relationship $PLATFORM_RELATIONSHIP_SCHEMA schema..."
    eval "LD=\$LANDO_DUMP_${PLATFORM_RELATIONSHIP_RELATIONSHIP^^}"
    $LD $PLATFORM_RELATIONSHIP_SCHEMA | platform db:sql -e "$PLATFORM_BRANCH" -r $PLATFORM_RELATIONSHIP_RELATIONSHIP --schema $PLATFORM_RELATIONSHIP_SCHEMA
  done
fi

# If there are no mounts specified then indicate that
if [ ${#PLATFORM_PUSH_MOUNTS[@]} -eq 0 ]; then
  lando_warn "Looks like you did not pass in any mounts!"
  lando_info "That is not a problem. However here is a list of available mounts you can try next time!"
  platform mounts --refresh || true
# Otherwise loop through our mounts and download them them
else
  for PLATFORM_MOUNT in "${PLATFORM_PUSH_MOUNTS[@]}"; do
    # Try to split PLATFORM_MOUNT
    IFS=':' read -r -a PLATFORM_MOUNT_PARTS <<< "$PLATFORM_MOUNT"
    # Set the source and target
    PLATFORM_MOUNT_SOURCE="${PLATFORM_MOUNT_PARTS[0]}"
    PLATFORM_MOUNT_TARGET="${PLATFORM_MOUNT_PARTS[1]}"
    # If PLATFORM_MOUNT_TARGET is still empty lets set it from the source
    if [ -z "$PLATFORM_MOUNT_TARGET" ]; then
      PLATFORM_MOUNT_TARGET="$PLATFORM_MOUNT_SOURCE"
    fi
    lando_pink "Uploading local files from $LANDO_SOURCE_DIR/$PLATFORM_MOUNT_SOURCE into the remote $PLATFORM_MOUNT_TARGET mount"
    platform mount:upload -e "$PLATFORM_BRANCH" --mount $PLATFORM_MOUNT_TARGET --source "$LANDO_SOURCE_DIR/$PLATFORM_MOUNT_SOURCE" -y
  done
fi

# Finish up!
lando_green "Push completed successfully!"
