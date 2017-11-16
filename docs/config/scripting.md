Scripting
=========

Pre-Run Scripting
-----------------

Lando will run any shell script it finds in your services `/scripts` directory before it boots up each service. We dogfood this functionality in our core plugins to generate self-signed certs and handle user permissions, but it can be used by the user to provide some additional customizations before a service is started. Consider the trivial example below.

An executable (eg `chmod +x`) `bash` script located in `scripts/my-script.sh` in your app root directory.

```bash
#!/bin/sh

echo "Hey this script is actually running!"

```

A `.lando.yml` that injects the script into the `appserver`'s `/scripts` directory.

```yml
sevices:
  appserver:
    scripts:
      - scripts/run-this.sh
```

Expected behavior

```bash
# Restart the app
lando restart

# Inspect the log to see if it printed our message
lando logs -s appserver
Attaching to backdrop_appserver_1
appserver_1        | Generating RSA private key, 2048 bit long modulus
appserver_1        | ..........+++
appserver_1        | .......+++
appserver_1        | e is 65537 (0x10001)
appserver_1        | Hey this script is actually running!
```
