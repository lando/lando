Building a LEMP stack
=====================

Now that you've successfully [started your first Lando app](./first-app.md) it's time to build our first basic example from scratch.

1. Create a new Lando app
-------------------------

```bash
mkdir lemp
git init
echo "name: lemp" > .lando.yml
```

2. Add some basic config
------------------------

Open up the `.lando.yml` we created above and let's add some config.

```yml
name: lemp
proxy:
  nginx:
    - port: 80/tcp
      default: true
    - port: 443/tcp
      default: true
      secure: true
services:
  appserver:
    type: php:7.0
    via: nginx
    ssl: true
  database:
    type: mariadb
    portforward: 3333
```

This should tell Lando to do following:

  * Spin up the latest version of nginx with php7
  * Allow connections to be made over `https`
  * Serve files from the `www` directory inside of our app
  * Spin up the latest version of mariadb and have it accessible at `localhost:3333`

Now, let's add a basic index.php and start our app

```bash
mkdir -p www
echo "<?php phpinfo(); ?>" > www/index.php
lando start
```

3. Test the internal database connection
----------------------------------------

Let's try to connect to our database in `index.php` by using the creds and internal connection info we see by running `lando info` inside our app.

Let's replace `index.php` with the below:

```php
<?php
$link = mysqli_connect("database", "mariadb", "password", "database", "3306");

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

4. Write all the php app
------------------------

Hack away!
