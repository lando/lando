Adding Additional Services and Tooling
======================================

Adding Services
---------------

Sweet! We've spun up a basic LEMP stack and connected to its `database`. Now, what if we want **EVEN MORE** things? Luckily, Lando has a way to add more [services](./../config/services.md) and [tooling](./../config/tooling.md).

Let's add a persistent `redis` cache and an ability to access it via the `redis-cli`.

Modify your `.lando.yml`

```yml
name: myapp
recipe: lemp
config:
    webroot: web
    php: '5.6'
services:
  cache:
    type: redis
    persist: true
tooling:
  redis-cli:
    service: cache
```

And then run `lando restart`. You should immediately be able to see connection info and access creds for your `cache` by running `lando info`. You should also be able to access `redis` via the CLI by running `lando redis-cli`. Now, let's modify our `index.php` to connect to `redis` using the info from `lando info`.

```php
<?php

$link = mysqli_connect(
  getenv("DB_HOST"),
  getenv("DB_USER"),
  getenv("DB_PASSWORD"),
  getenv("DB_NAME"),
  getenv("DB_PORT")
);

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}

echo "Success: A proper connection to MySQL was made! The database is great." . PHP_EOL;
echo "Host information: " . mysqli_get_host_info($link) . PHP_EOL;

mysqli_close($link);

?>

<br />

<?php

$redis = new Redis();

$connected = $redis->connect('cache', 6379);

if ($connected) {
  echo "Tippecanoe and redis too!";
}
else {
  echo "Redis connection failed!";
}

?>
```

Refresh the site in the browser and you should see a message indicating you've connected to redis as well!

Adding Tooling
--------------

Our app also needs some great front end development tools to take things to the next level. Let's add `node` and `npm` to our app. You know the drill at this point: modify `.lando.yml` and `lando restart` your app.

```yml
name: myapp
recipe: lemp
config:
    webroot: web
    php: '5.6'
services:
  cache:
    type: redis
    persist: true
  node:
    type: node:6.10
tooling:
  redis-cli:
    service: cache
  node:
    service: node
  npm:
    service: node
```

Now try the awesomeness of sandboxed, version-locked dev tools for your app.

```bash
# Check the node version
lando node -v

# Check the npm version
lando npm -v

# Run a basic node command to show what OS we are running in our service
lando node -e "console.log(process.platform);"

# Globally install the `grunt-cli`
lando npm install -g grunt-cli

# See the version of grunt we just installed
lando.dev ssh node -c "grunt --version"
```
