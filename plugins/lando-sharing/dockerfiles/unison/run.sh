#!/bin/bash

# Put our ignores and paths into arrays so we can correctly escape spaces
IFS=';'
IGNORES=( $UNISON_IGNORE )
PATHS=( $UNISON_PATHS )
unset IFS

unison \
  -root "${UNISON_CODEROOT}" \
  -root "${UNISON_WEBROOT}" \
  ${UNISON_OPTIONS} \
  "${IGNORES[@]}" \
  "${PATHS[@]}"
