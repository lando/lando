---
metaTitle: lando init | Lando
description: lando init is a powerful command that initializes a codebase for usage with a Lando recipe, it can pull code from Pantheon, GitHub and other remote sources.
---

# init

Initializes code for use with lando

This command will create a `.lando.yml` for a given recipe and with code from a given source. This is a good way to initialize a codebase for usage with Lando.

Currently you can initialize code from your current working directory, a remote Git repository, a remote archive, [GitHub](https://github.com) and [Pantheon](https://pantheon.io).

::: tip Do not use if you already have a `.lando.yml` in your codebase
If your code already has a Landofile then this command will likely produce undesirable results.
:::

## Usage

```bash
# Interactively instantiate your code for use with lando
lando init

# Spit out a full Drupal 7 Landofile using code from your current working directory
lando init --source cwd --recipe drupal7 --name d7-hotsauce --webroot . --full

# Pull code from GitHub and set it up as a mean recipe
lando init \
  --source github \
  --recipe mean \
  --github-auth "$MY_GITHUB_TOKEN" \
  --github-repo git@github.com:lando/lando.git \
  --name my-awesome-app

# Interactively pull a site from pantheon
lando init --source pantheon

# Set up a pantheon site but use code from a custom git repo
lando init --source remote --remote-url https://my.git.repo/.git --recipe pantheon

# Set up a local repo with the pantheon recipe
lando init --recipe pantheon

# Set up a mean recipe that runs on a particular port with a particular command
lando init --source cwd \
  --recipe mean \
  --option port=3000 \
  --option command="yarn watch" \
  --name meanest-app-youve-ever-seen

# Pull the latest Drupal 7 and set up drupal7 config to use mariadb instead of mysql
lando init \
  --source remote \
  --remote-url https://ftp.drupal.org/files/projects/drupal-7.71.tar.gz \
  --remote-options="--strip-components 1" \
  --recipe drupal7 \
  --webroot . \
  --option database=mariadb \
  --name my-first-drupal7-app
```

## Getting code from various sources

### Current Working Directory

By default Lando will use the code from the directory you are currently in. Nothing much special here, just navigate to the directory with your code and invoke `lando init`.

```bash
lando init --source cwd
```

### Remote git repo or archive

You can also tell Lando to either clone code from a remote Git repo or extract code from a remote tar archive. Note that if you clone from a git repo it is up to the user to make sure any relevant ssh keys are set up correctly.

```bash
# Let Lando walk you through it
lando init --source remote

# Get Drupal 9 from GitHub
lando init --source remote --remote-url https://github.com/drupal/drupal.git

# Get Drupal 9 from an archive
lando init --source remote --remote-url https://www.drupal.org/download-latest/tar.gz
```

Note that you can also pass in options to alter the behavior of the clone or archive extraction

```bash
# Shallow clone and checkout the 7.x branch
# NOTE: you currently need to use the = below in `--remote-options` for yargs to parse this correctly
lando init \
  --source remote \
  --remote-url https://github.com/drupal/drupal.git \
  --remote-options="--branch 7.x --depth 1"

# Strip the leading component of the tar
# NOTE: you currently need to use the = below in `--remote-options` for yargs to parse this correctly
lando init \
  --source remote \
  --remote-url https://www.drupal.org/download-latest/tar.gz \
  --remote-options="--strip-components=1"
```

### Pantheon

In order to pull down code from Pantheon or use the `pantheon` recipe you will need to make sure you have created a [machine token](https://pantheon.io/docs/machine-tokens/) first. Note that choosing `--source=pantheon` implies `--recipe=pantheon` eg we do not let you grab code from Pantheon and also select a recipe.

That said, `--recipe=pantheon` does not imply `--source=pantheon` which means you can grab code using any of our initialization sources and then choose the `pantheon` recipe.

Note that Lando will automatically create and post a SSH key to Pantheon for you if you use this init source.

```bash
# Let Lando walk you through it
lando init --source pantheon

# Pull my-site from pantheon and set it up as a pantheon recipe
lando init --source pantheon --pantheon-auth "$MY_MACHINE_TOKEN" --pantheon-site my-site

# Clone my code from a git repo and set it up as a pantheon recipe
lando init \
  --source remote \
  --recipe pantheon \
  --remote-url https://github.com/drupal/drupal.git \
  --pantheon-auth "$MY_MACHINE_TOKEN" \
  --pantheon-site my-site
```

### GitHub

In order to pull down code from GitHub you will need to make sure you have created a [personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) and that it has the `repo`, `admin:public_key` and `user` scopes.

Note that Lando will automatically create and post a SSH key to GitHub for you if you use this init source.

```bash
# Let Lando walk you through it
lando init --source github

# Pull git@github.com:lando/lando.git from GitHub and set it up as a pantheon recipe
lando init \
  --source github \
  --github-auth "$MY_GITHUB_TOKEN" \
  --github-repo git@github.com:lando/lando.git

# Pull code from github and set it up as a mean recipe
lando init \
  --source github \
  --recipe mean \
  --github-auth "$MY_GITHUB_TOKEN" \
  --github-repo git@github.com:lando/lando.git \
  --name lando
```

## Options

Run `lando init --help` to get a complete list of options defaults, choices, recipes, sources etc.

```bash
--full            Dump a lower level lando file
--github-auth     A GitHub personal access token
--github-repo     GitHub git url
--help            Shows lando or delegated command help if applicable
--name            The name of the app
--options, -o     Merge additional KEY=VALUE pairs into your recipes config
--pantheon-auth   A Pantheon machine token
--pantheon-site   A Pantheon site machine name
--recipe, -r      The recipe with which to initialize the app
--remote-options  Some options to pass into either the git clone or archive extract command
--remote-url      The URL of your git repo or archive, only works when you set source to remote
--source, --src   The location of your apps code
--verbose, -v     Runs with extra verbosity
--webroot         Specify the webroot relative to app root
--yes, -y         Auto answer yes to prompts
```
