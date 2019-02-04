MEAN Example
============

This example exists primarily to test the following documentation:

* [MEAN Recipe](https://docs.devwithlando.io/tutorials/mean.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Initialize an empty mean recipe
rm -rf mean && mkdir -p mean && cd mean
lando init --source cwd --recipe mean --option port=2368 --option command="su - node -c \'/var/www/.npm-global/bin/ghost run -d /app/src -D\'" --name lando-mean

# Should install the ghost cli and install a new ghost app
cd mean
lando ssh -c "npm install ghost-cli@latest -g && mkdir src && cd src && ghost install local --ip 0.0.0.0 && ghost stop"

# Should start up successfully
cd mean
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the ghost default page
cd mean
lando ssh -s appserver -c "curl -L localhost:2368" | grep "Ghost"

# Should use node 10 by default
cd mean
lando node -v | grep v10.

# Should be running mongo 4.0 by default
cd mean
lando ssh -s database -c "mongo --version | grep v4.0"

# Should have yarn available
cd mean
lando yarn -v

# Should have npm available
cd mean
lando npm -v

# Should have node available
cd mean
lando node -v

# Should be able to npm global install
cd mean
lando npm -g install eslint
lando ssh -s appserver -c "eslint -v"

# Should be able to npm install
cd mean
lando npm install eslint
lando ssh -s appserver -c "eslint -v"
lando ssh -s appserver -c "which eslint | grep /app/node_modules"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd mean
lando destroy -y
lando poweroff
```
