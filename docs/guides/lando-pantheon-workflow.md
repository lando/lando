Pantheon GitHub PR/CI/Behat Workflow Using Lando
================================================

GitHub PR - Composer - CI Service workflows are all the rage these days and Pantheon has [some docs](https://pantheon.io/docs/guides/github-pull-requests/) on how to get rolling with a version of this.

Here is another way to get a nice PR based workflow using Lando that:

1.  Uses GitHub for pull requests
2.  Runs tests like Behat
3.  Pushes code back to Pantheon when pull requests are merged

Before you get started you will want to have

1.  A vanilla Pantheon D8 site **(dont use a preexisting site because we will be overwriting it!!!)**
2.  An empty GitHub repo
3.  A Travis project that is set to track the repo in 2.

Getting Your Code Into GitHub
-----------------------------

You can start by cloning our [example workflow repo](https://github.com/lando/lando-pantheon-ci-workflow-example) and then pushing it up to the GitHub repo you created earlier.

```bash
# Get our example
git clone https://github.com/lando/lando-pantheon-ci-workflow-example.git my-site
cd my-site

# Set up a remote and push back to your repo
git remote add gh git@github.com:path/to/your/repo
git push gh master

# Remove the original origin remote and replace with yours
git remote remove origin
git remote remove gh
git remote add origin git@github.com:path/to/your/repo
```

You should now have a copy of our example pushed up to your new GitHub repo.

Lando-ifying Your Repo
----------------------

Now we want to update the default `.lando.yml` that ships with our example so it is tied to the Pantheon site you created earlier.

```bash
# Update the lando.yml with info about your site
# Go through the interactive prompts
lando init --recipe=pantheon

# Or run it non-interactively
lando init --recipe=pantheon --pantheon-auth=MYPANTHEONMACHINETOKEN --pantheon-site=MYPANTHEONSITEMACHINENAME

# Start up your app
lando start

# Pull down your database and files
lando pull
```

You should be able to see your site locally now.

Configuring Behat and Travis
----------------------------

### Behat

You will have to make two small edits in your `.lando.yml` file to make sure your `behat` tests run smoothly. Eventually we will eliminate this step but for now you need to do things manually. You will want to make a note of two things:

1. Docker Compose assigns hostnames to your services under the hood. When running Behat, we are executing PHP from within the `appserver` service, and we are attempting to access the website over HTTP via the `nginx` service. Since the `nginx` service is available over the network at `http://nginx/`, PHP can access the site at that hostname. You can find more information about your services using `lando info`.
2. The webroot of your app INSIDE LANDO, usually either `/app` or `/app/web`.

You will want to edit the `BEHAT_PARAMS` variable in `.lando.yml` and replace `base_url` and `root` with 1. and 2. from above.

```yml
BEHAT_PARAMS: '{"extensions" : {"Behat\\MinkExtension" : {"base_url" : "http://nginx/"}, "Drupal\\DrupalExtension" : {"drush" :   {  "root":  "/app/web" }}}}'
```

And then restart your app with `lando restart`. Once restarted you should be able to run `behat` tests locally.

```bash
lando behat --config=/app/tests/behat-pantheon.yml
```

### Travis

You will need to generate an encrypted environment variable containing your [Pantheon machine token](https://pantheon.io/docs/machine-tokens/). The easiest way to do this is with the [`travis` cli tool](https://github.com/travis-ci/travis.rb).

```bash
# Reset the encrypted token with your machine token
# Note: It's probably a good idea to manually remove the first secure envvar in
# In your .travis.yml file after this
travis encrypt PANTHEON_MACHINE_TOKEN=MYTOKEN --add
```

Push to GitHub and first Travis run
-----------------------------------

Now you should be in business! Commit these changes, push to your GitHub and watch your tests run in Travis.

```bash
git add -A
git commit -m "All the Lando magic"
git push origin master
```

If you've set up your Travis to track your project already you should see a build happening that looks like [this](https://travis-ci.org/lando/lando-pantheon-ci-workflow-example).

Deploy Back to Pantheon
-----------------------

Eventually this example will include an auto-deploy feature so that any PR merged into `master` makes its way back to Pantheon. In the meantime we recommend you [do something like this](https://pantheon.io/docs/guides/collaborative-development/).

Full Example
------------

* [Lando-Pantheon Workflow Example](https://github.com/lando/lando-pantheon-ci-workflow-example)
