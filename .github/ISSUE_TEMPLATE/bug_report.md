---
name: Report a bug
about: Create a bug report to help us improve lando
labels: bug
---

Before you submit an issue make sure you have [downloaded](https://github.com/lando/lando/releases) the latest version of Lando and checked to see if the latest version resolves your issue!

**If you submit an issue against an older release of Lando there is a good chance your issues will not be addressed.** This is especially true if that issue is for 3.0.0-rc.1 or lower.

Please complete the following steps.

**The more steps you complete the more likely we are to address your issue!**

1.  Update to the [latest version](https://github.com/lando/lando/releases) of Lando and make sure the issue isn't fixed already.
2.  Please review the [current list of issues](https://github.com/lando/lando/issues) to make sure you are not submitting a duplicate.

The **FASTEST** way for us to verify and resolve your bug if for you to [write a functional test that breaks](https://docs.devwithlando.io/dev/testing.html#functional-tests), submit it as a pull request and link to that pull request here.

If you are not sure how to do that then please complete as much of the below section as possible

**Tell us about your setup**

What is your lando version and operating system? **(note that the older your version the less likely we are to reply)**

*Example: v3.0.0-rc.2 on Windows 10 Professional*

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
```

It is also helpful to include other relevant config files. For example, include `pantheon.yml` for a `pantheon` recipe if applicable. Include `php.ini` or `mysql.cnf` if you are overriding our defualt config.

**Tell us about the command you were running**

Paste in a series of commands that caused the bug.

*Example:*

```bash
lando init --sourcer remote --recipe lamp --webroot web
lando start
# Edited my lando.yml as above
lando rebuild -y
```

**Tell us about the error you got**

Rerun the command that produced your error in `debug` mode. Note that `debug` mode is run like this `lando command -vvv`. Paste in the error and the `~100` lines that proceeded it.

*Example:*

```bash
lando php -e "phpinfo();" -vvvv
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
