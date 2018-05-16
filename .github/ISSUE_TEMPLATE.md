**Before you submit an issue make sure you have [downloaded](https://github.com/lando/lando/releases) the latest version of Lando and checked to see if the latest version resolves your issue!**

Security
--------

If you have discovered a security issue with Lando, please contact the Lando Security Team directly at
[security@devwithlando.io](mailto:security@devwithlando.io). We manage security issues separately in a private repository until the issue has been resolved.
Even if you're not sure if it's a security problem, please contact the security team before filing an issue, blogging, or
tweeting about it.

Feature Requests and Bug Reports
--------------------------------

Please complete the following steps.

**The more steps you complete the more likely we are to address your issue!**

1.  Update to the [latest version](https://github.com/lando/lando/releases) of Lando and make sure the issue isn't fixed already.
2.  Please review the [current list of issues](https://github.com/lando/lando/issues) to make sure you are not submitting a duplicate.
3.  Fill out either the `BUG REPORT` or `FEATURE REQUEST` below.

Bug Report
==========

**Tell us about your setup**

What is your lando version and operating system? **(note that the older your version the less likely we are to reply)**

*Example: v3.0.0-alpha1 on Windows 10 Professional*

**Tell us about your `.lando.yml`**

Paste in the contents of your `.lando.yml` this is **SUPER HELPFUL** for us.

*Example:*

```yml
name: lamp2
recipe: lamp
config:
  php: '5.6'
  webroot: www
  database: mysql
  xdebug: true
  conf:
    server: config/lamp.conf
    database: config/mysql
    php: config/php.ini
```

It is also helpful to include other relevant config files. For example, include `pantheon.yml` for a `pantheon` recipe if applicable. Include `php.ini` or `mysql.cnf` if you are overriding our defualt config.

**Tell us about the command you were running**

Paste in a series of commands that caused the bug.

*Example:*

```bash
lando init mysite --recipe lamp --webroot web
lando start
# Edited my lando.yml as above
lando rebuild -y
```

**Tell us about the error you got**

Rerun the command that produced your error in `verbose` mode. Paste in the error and the ~100 lines that proceeded it.

*Example:*

```bash
lando CMDTHATFAILED -- -vvvv
```

**Tell us generally about your bug**

*Example: I tried to create a pantheon site but got a `LowerCase` not defined exception*

Please detail the steps we can take to replicate this bug. Be as detailed as possible.

*Example:*

```bash
1. Started up GUI
2. Clicked on my Pantheon account in the sidebar
3. Selected a site and an environment
4. Kept the default create options and pressed submit
```

**Tell us more**

Could better documentation have prevented this issue? if so what should we change?


Does this bug prevent you from using lando?


Feature Request
===============

Please explain your request and its importance in the form of a user story.

*Example: As a lando user who works with Drupal sites that have large databases, I want the option to exclude unnecessary database tables from being pulled when I update my site because I want faster "site pull" actions.*

Please provide some detail on how lando can help solve this problem

*Example: Place an option on the "site pull" screen to exclude cache tables.*
