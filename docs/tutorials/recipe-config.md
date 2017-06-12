Configuring a Recipe
====================

Switching recipes
-----------------

We've determined that we want our app to run using `nginx` instead of `apache`. Luckily there is a [LEMP](./../recipes/lemp.md) recipe we can use to do this. Let's modify our `.lando.yml` and `lando restart` our app.

```yml
name: myapp
recipe: lemp
```

```bash
# Restart my app
lando restart

# Check to see we are now running nginx
lando ssh -c "curl nginx" | grep SERVER_SOFTWARE
```

Configuring Recipes
-------------------

Awesome! We were able to easily switch our app from `apache` to `nginx` by changing recipes. Now, what if we want to do deeper configuration to our app? It's best to consult the documentation to see what config options your recipe has. Here are the [docs](./../recipes/lemp.md) for our current LEMP recipe.

Looks like we can easily change the `php` version, the database we are using, the location of our webroot and which config files our underlying services are using. Let's go ahead and switch a few things around.

```yml
name: myapp
recipe: lemp
config:
    webroot: web
    php: '5.6'
```


```bash
# Make sure we move index.php into our new app root
mkdir -p web
mv index.php web/index.php

# Restart our app
lando restart

# Visit https://myapp.lndo.site to ensure our webroot has been moved correctly
# Page should load the same as before

# Check to see we are now running php 5.6
lando php -v
```

> #### Warning::Not seeing my changes!
>
>  If you are not seeing your changes reflected try a hard rebuild of your app with `lando rebuild`.

Connecting to Services
----------------------

Now lets try to connect with the `database` that ships as part of the LEMP recipe. We can either run `lando info` to get connection info to our database or use the [environmental variables](http://localhost:4000/recipes/lemp.html#environmental-variables) the recipe injects into our appserver.

```bash
# Lets copy index.php to info.php
cd web
cp -rf index.php info.php
```

Now, let's replace our old `index.php` with the following. We will use some special environmental variables set by lando to connect.

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
```

Refresh `myapp.lndo.site` and you should see a message indicating we have connected to the database.
