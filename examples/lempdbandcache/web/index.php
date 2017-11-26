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
