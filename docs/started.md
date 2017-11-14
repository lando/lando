Lando Basics
============

Before you can use all the awesome Lando magic you need a Backdrop codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### Option 1. Start with an existing codebase

```bash
# Clone or extract your backdrop site
# See: https://backdropcms.org/installation
git clone https://github.com/backdrop/backdrop.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
lando init --recipe backdrop
```

### Option 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Backdrop .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.devwithlando.io/cli/init.html#github
lando init github --recipe backdrop
```

Once you've initialized the `.lando.yml` file for your app you should commit it to your repository. This will allow you to forgo the `lando init` step in subsequent clones.


Before you can use all the awesome Lando magic you need a codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### Option 1. Start a codebase that already has a `.lando.yml`

```bash
# Clone pantheon codebase from git
# See: https://pantheon.io/docs/git/
git clone ssh://codeserver.dev.PANTHEONID@codeserver.dev.PANTHEONIDdrush.in:2222/~/repository.git mysite

# Go into the cloned site
cd mysite

# Start the site
lando start

# Authorize with pantheon
# NOTE: if you dont do this step you wont be able to do `lando pull/push/switch`
# NOTE: you need to put in the actual machine-token here, not the email
lando terminus auth:login --machine-token=MYSPECIALTOKEN
```

### Option 2. Init a codebase that doesn't yet have a `.lando.yml`

```bash
# Clone a codebase from some git repo
git clone /path/to/git/repo mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
# NOTE: You will need to choose the pantheon site that makes sense
lando init --recipe pantheon
```

### Option 3. Get your site from Pantheon

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Pantheon .lando.yml after getting code from Pantheon
# This require a Pantheon Machine Token
# See: https://docs.devwithlando.io/cli/init.html#pantheon
lando init pantheon
```

### Option 4. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Pantheon .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.devwithlando.io/cli/init.html#github
lando init github --recipe pantheon
```

Once you've initialized the `.lando.yml` file for your app you should commit it to your repository. This will allow you to forgo the `lando init` step in subsequent clones.
