MailHog Example
===============

This example provides a very basic `mailhog` example built on th Lando LEMP recipe.

See the `.lando.yml` in this directory for `mailhog` configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Start up the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Visit the main web application and click "SENT TEST MAIL" to send a test mail
http://mailhog.lndo.site

# Visit the mailhog UI to comfirm the receipt of test mail
http://mail.lemp.lndo.site
```
