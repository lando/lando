MailHog Example
===============

This example provides a very basic `mailhog` example built on th Lando LEMP recipe.

See the `.lando.yml` in this directory for `mailhog` configuration options.

Boot it
-------

Run the following commands to get up and running with this example.

```bash
# Start up the mailhog
lando start
```

Validation Commands
-------------------

Run the following commands to confirm things

```bash
# Verify mailhog portforward
docker inspect mailhog_mailhog_1 | grep HostPort | grep 1026
lando info | grep 1026

# Verify the mhsendmail binary was installed
lando ssh appserver -c "ls -lsa /usr/local/bin | grep mhsendmail"

# Verify we can send and recieve mail
lando alert
lando ssh -c "curl mailhog/api/v2/messages | grep leiaorgana@rebellion.mil"
```

Destruction
-----------

Run the following commands to clean up

```bash
# Destroy the mailhog
lando destroy -y
```
