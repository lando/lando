MEAN
====

MEAN is a free and open-source JavaScript software stack for building dynamic web sites and web applications.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [MEAN](https://en.wikipedia.org/wiki/MEAN_%28software_bundle%29) apps.

<!-- toc -->

Getting Started
---------------

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../installation/system-requirements.md) and gotten familar with [its basics](./../started.md)
2. [Initialized](./../cli/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM) here is an example of using the MEAN recipe to run a [Ghost](https://ghost.org/) project.

Note that this could also be used for [ExpressJS](https://expressjs.com/), [Koa](https://koajs.com/), [KeystoneJS](https://keystonejs.com/) or any other MEANish project.

```bash
# Initialize a mean recipe for use with ghost
lando init --source cwd \
  --recipe mean \
  --option port=2368 \
  --option command="su - node -c '/var/www/.npm-global/bin/ghost run -d /app/src -D'" \
  --name meanest-app-youve-ever-seen

# Install ghost
lando ssh -c "npm install ghost-cli@latest -g && mkdir src && cd src && ghost install local --no-start --ip 0.0.0.0"

# Start it up
lando start

# List information about this app.
lando info
```

Configuration
-------------

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe. If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: mean
config:
  node: 10
  build:
    - npm install
  command: npm start
  database: mongo:4.0
  globals: []
  port: '80'
  ssl: false
  config:
    database: SEE BELOW
```

Note that if the above config options are not enough all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a node version

You can set `node` to any version that is available in our [node service](./node.md). However, you should consult the requirements for whatever you are running to make sure that version is actually supported.

Here is the [recipe config](./../config/recipes.md#config) to set the MEAN recipe to use `node` version `8`

```yaml
recipe: mean
config:
  node: 8
```


### Installing application dependencies

Because most MEAN projects will require you `npm install` before they can start successfully Lando will automatically run `npm install` before it runs what you specify as your `commmand`. You can, however, alter this to whatever you need.

```yaml
recipe: mean
config:
  build:
    - yarn install
  command: yarn dev
```

Note that a good rule of thumb is that `build` should install whatever **node** dependencies you need to start your app. If you require other non-node dependencies like server packages consider using a [build step](./../config/services.md#build-steps).

### Setting a command

By default your MEAN recipe will attempt to start the `node` service by running `npm start`. You can easily change this any other command.

**Running a node script directly**

```yaml
recipe: mean
config:
  command: node /app/server.js
```

**Running the `yarn dev` script**

```yaml
recipe: mean
config:
  command: yarn dev
```

Note that whatever `command` you specify you will want to make `build` is also set to something that makes sense.

### Choosing a database backend

By default this recipe will use the default version of our [mongo](./mongo.md) service as the database backend but you can also switch this to use [`mysql`](./mysql.md), [`mariadb`](./mariadb.md) or ['postgres'](./postgres.md) instead.

Note that you can also specify a version *as long as it is a version available for use with lando* for either `mongo`, `mysql`, `mariadb` or `postgres`.

** Using mongo (default) **

```yaml
recipe: mean
config:
  database: mongo
```

** Using MySQL **

```yaml
recipe: mean
config:
  database: mysql
```

** Using MariaDB **

```yaml
recipe: mean
config:
  database: mariadb
```

** Using Postgres **

```yaml
recipe: mean
config:
  database: postgres
```

** Using a custom version **

```yaml
recipe: mean
config:
  database: postgres:9.6
```

### Installing global dependencies

You can also use the `globals` key if you need to install any [global node dependenices](https://docs.npmjs.com/cli/install). This follows the same syntax as your normal [`package.json`](https://docs.npmjs.com/files/package.json) except written as YAML instead of JSON.

Here is an example of globally installing the `latest` `gulp-cli`.

```yaml
recipe: mean
config:
  globals:
    gulp-cli: latest
```

See [install global node dependencies](./node.md#installing-global-dependencies) for more info.

### Using SSL

Also note that `ssl: true` will only generate certs in the [default locations](./../config/security.md) and expose port `443`. It is up to user to use the certs and secure port correctly in their application like as in this `node` snippet:

```js
// Get our ket and cert
const key = fs.readFileSync('/certs/cert.key')
const cert = fs.readFileSync('/certs/cert.crt'),

// Create our servers
https.createServer({key, cert}, app).listen(443);
http.createServer(app).listen(80);

// Basic HTTP response
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  return res.end('<h1>I said "Oh my!" What a marvelous tune!!!</h1>');
});
```

### Setting a port

While we assume your MEAN app is running on port `80` we recognize that many `node` app's also run on port `3000` or otherwise. You can easily change our default to match whatever your app needs.

```yaml
recipe: mean
config:
  port: '3000'
```

### Using custom config files

You may need to override our [default MEAN config](https://github.com/lando/lando/tree/master/plugins/lando-recipes/recipes/mean) with your own.

If you do this you must use files that exists inside your applicaton and express them relative to your project root as below.

**A hypothetical project**

```bash
./
|-- config
   |-- my-custom.cnf
|-- index.php
|-- .lando.yml
```

**Landofile using custom mean config**

```yaml
recipe: mean
config:
  config:
    database: config/my-custom.cnf
```

Connecting to your database
---------------------------

Lando will automatically set up a database with a user and password and also set an environment variables called [`LANDO INFO`](./../guides/lando-info.md) that contains useful information about how your application can access other Lando services.

Here are is the default database connection information for a MEAN site. Note that the `host` is not `localhost` but `database`.

```yaml
host: database

# mongo
user: root
password: none
port: 27017

# mysql/mariadb
# database: mean
# username: mean
# password: mean
# port: 3306

# postgres
# database: mean
# username: postgres
# password: none
# port: 5432
```

You can get also get the above information, and more, by using the [`lando info`](./../cli/info.md) command.

Importing Your Database
-----------------------

**NOTE THIS ONLY APPLIES FOR SQL DATABASES AND NOT MONGO**

Once you've started up your MEAN site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

```bash
# Grab your database dump
curl -fsSL -o database.sql.gz "https://url.to.my.db/database.sql.gz"

# Import the database
# NOTE: db-import can handle uncompressed, gzipped or zipped files
# Due to restrictions in how Docker handles file sharing your database
# dump MUST exist somewhere inside of your app directory.
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./../guides/db-import.md)

Tooling
-------

By default each Lando MEAN recipe will also ship with helpful dev utilities.

This means you can use things like `yarn`, `npm`, `mongo` and `node` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando mongo     Drop into the mongo shell
lando node      Runs node commands
lando npm       Runs npm commands
lando yarn      Runs yarn commands
```

**Usage examples**

```bash
# Install some things globally
lando npm install -g gulp-cli@latest

# Run yarn install
lando yarn install

# Drop into a mongo shell
lando mongo

# Check the node version
lando node --version
```

You can also run `lando` from inside your app directory for a complete list of commands which is always advisable as your list of commands may not 100% be the same as the above. For example if you set `database: postgres` you will get `lando psql` instead of `lando mongo`.

Example
-------

If you are interested in a working example of this recipe that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/mean](https://github.com/lando/lando/tree/master/examples/mean)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
