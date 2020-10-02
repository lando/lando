---
description: Learn how to ship Lando releases if you are a maintainer.
---

# Shipping

If you are a maintainer of Lando, you can kick off an official release using our handy `grunt` tasks. **THIS NEEDS TO BE DONE FROM THE MASTER BRANCH!**

```bash
# Interactively do the release
yarn release

# Get help about other release options
yarn release --help

Usage: bump [options]

# Options:
#  -V, --version         output the version number
#  --major               Increase major version
#  --minor               Increase minor version
#  --patch               Increase patch version
#  --premajor            Increase major version, pre-release
#  --preminor            Increase preminor version, pre-release
#  --prepatch            Increase prepatch version, pre-release
#  --prerelease          Increase pre-release version
#  --prompt              Prompt for type of bump (patch, minor, major, pre-major, pre-release, etc.)
#  --preid <name>        The identifier for pre-release versions (default is "beta")
#  --commit [message]    Commit changed files to Git (default message is "release vX.X.X")
#  --tag                 Tag the commit in Git
#  --push                Push the Git commit
#  --all                 Commit/tag/push ALL pending files, not just the ones changed by bump
#  --grep <filespec...>  Files and/or globs to do a text-replace of the old version number with the new one
#  --lock                Also update the package-lock.json
#  -h, --help            output usage information
#  Examples:
#
#    $ bump --patch
#    $ bump --major --tag
#    $ bump --patch --tag --all --grep README.md
#    $ bump --prompt --tag --push --all
```
