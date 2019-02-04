#!/bin/bash

# Set default opts
WORD="bird"

# PARSE THE ARGZZ
# TODO: compress the mostly duplicate code below?
while (( "$#" )); do
  case "$1" in
    -w|--word|--word=*)
      if [ "${1##--word=}" != "$1" ]; then
        WORD="${1##--word=}"
        shift
      else
        WORD=$2
        shift 2
      fi
      ;;
    --surprise)
      echo "MUHAHAH! You've found a non explicitly declared option for this script which is going to give you an error!"
      exit 666
      ;;
    --)
      shift
      break
      ;;
    -*|--*=)
      echo "Error: Unsupported flag $1" >&2
      exit 1
      ;;
    *)
      shift
      ;;
  esac
done

# Demonstrate interactive option passthrough
echo "$WORD, $WORD, $WORD the $WORD is the word!"
