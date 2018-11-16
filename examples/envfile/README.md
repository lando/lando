.env Example
============

This example uses a basic LEMP stack to showcase `.env` file injection.

See the `.env` in this directory.

Start me up!
------------

You should be able to run the following steps to get up and running with this example.

```bash
# Start up the example
lando start
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Verify the envvar injection
lando info --deep | grep TAYLOR

# Check out other commands you can use with this example
lando
```

Verify .env loaded
------------------

Run the following commands to confirm things

```bash
# Verify .env loaded within app directory
(lando info envfile | grep "Trouble parsing .env" && echo ".env Lost" || echo ".env Loaded") | grep ".env Loaded"

# Verify .env loaded when working in subdirectory
absoluteLandoPath=$(pwd)/../../bin/lando.js
mkdir -p "apples"
cd "apples"
( (lando info envfile || node ${absoluteLandoPath} info envfile) | grep "Trouble parsing .env" && echo ".env Lost" || echo ".env Loaded") | grep ".env Loaded"

# Verify .env loaded when working outside of app root
absoluteLandoPath=$(pwd)/../../bin/lando.js
cd $(mktemp -d)
( (lando info envfile || node ${absoluteLandoPath} info envfile) | grep "Trouble parsing .env" && echo ".env Lost" || echo ".env Loaded") | grep ".env Loaded"
```

Destroy things
--------------

Run the following commands to clean up

```bash
# Destroy the envfile environment
rm -r apples
lando destroy -y
```
