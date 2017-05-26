<?php
/**
 * @file
 * Functions that need to be loaded on every Backdrop request.
 */

/**
 * The current system version.
 */
define('BACKDROP_VERSION', '1.6.3');

/**
 * Core API compatibility.
 */
define('BACKDROP_CORE_COMPATIBILITY', '1.x');

/**
 * Minimum supported version of PHP.
 */
define('BACKDROP_MINIMUM_PHP', '5.3.2');

/**
 * Minimum recommended value of PHP memory_limit.
 */
define('BACKDROP_MINIMUM_PHP_MEMORY_LIMIT', '32M');

/**
 * Error reporting level: display no errors.
 */
define('ERROR_REPORTING_HIDE', 'hide');

/**
 * Error reporting level: display errors and warnings.
 */
define('ERROR_REPORTING_DISPLAY_SOME', 'some');

/**
 * Error reporting level: display all messages.
 */
define('ERROR_REPORTING_DISPLAY_ALL', 'all');

/**
 * Indicates that the item should never be removed unless explicitly selected.
 *
 * The item may be removed using cache()->delete() with a cache ID.
 */
define('CACHE_PERMANENT', 0);

/**
 * Indicates that the item should be removed at the next general cache wipe.
 */
define('CACHE_TEMPORARY', -1);

/**
 * @defgroup logging_severity_levels Logging severity levels
 * @{
 * Logging severity levels as defined in RFC 3164.
 *
 * The WATCHDOG_* constant definitions correspond to the logging severity levels
 * defined in RFC 3164, section 4.1.1. PHP supplies predefined LOG_* constants
 * for use in the syslog() function, but their values on Windows builds do not
 * correspond to RFC 3164. The associated PHP bug report was closed with the
 * comment, "And it's also not a bug, as Windows just have less log levels,"
 * and "So the behavior you're seeing is perfectly normal."
 *
 * @see http://www.faqs.org/rfcs/rfc3164.html
 * @see http://bugs.php.net/bug.php?id=18090
 * @see http://php.net/manual/function.syslog.php
 * @see http://php.net/manual/network.constants.php
 * @see watchdog()
 * @see watchdog_severity_levels()
 */

/**
 * Log message severity -- Emergency: system is unusable.
 */
define('WATCHDOG_EMERGENCY', 0);

/**
 * Log message severity -- Alert: action must be taken immediately.
 */
define('WATCHDOG_ALERT', 1);

/**
 * Log message severity -- Critical conditions.
 */
define('WATCHDOG_CRITICAL', 2);

/**
 * Log message severity -- Error conditions.
 */
define('WATCHDOG_ERROR', 3);

/**
 * Log message severity -- Warning conditions.
 */
define('WATCHDOG_WARNING', 4);

/**
 * Log message severity -- Normal but significant conditions.
 */
define('WATCHDOG_NOTICE', 5);

/**
 * Log message severity -- Informational messages.
 */
define('WATCHDOG_INFO', 6);

/**
 * Log message severity -- Debug-level messages.
 */
define('WATCHDOG_DEBUG', 7);

/**
 * Log message severity -- Deprecated function / feature notices.
 */
define('WATCHDOG_DEPRECATED', 8);

/**
 * @} End of "defgroup logging_severity_levels".
 */

/**
 * First bootstrap phase: initialize configuration.
 */
define('BACKDROP_BOOTSTRAP_CONFIGURATION', 0);

/**
 * Second bootstrap phase: try to serve a cached page.
 */
define('BACKDROP_BOOTSTRAP_PAGE_CACHE', 1);

/**
 * Third bootstrap phase: initialize database layer.
 */
define('BACKDROP_BOOTSTRAP_DATABASE', 2);

/**
 * Fourth bootstrap phase: initialize the lock system.
 */
define('BACKDROP_BOOTSTRAP_LOCK', 3);

/**
 * Fifth bootstrap phase: initialize the variable system.
 */
define('BACKDROP_BOOTSTRAP_VARIABLES', 4);

/**
 * Sixth bootstrap phase: initialize session handling.
 */
define('BACKDROP_BOOTSTRAP_SESSION', 5);

/**
 * Seventh bootstrap phase: set up the page header.
 */
define('BACKDROP_BOOTSTRAP_PAGE_HEADER', 6);

/**
 * Eighth bootstrap phase: find out language of the page.
 */
define('BACKDROP_BOOTSTRAP_LANGUAGE', 7);

/**
 * Final bootstrap phase: Backdrop is fully loaded; validate and fix input data.
 */
define('BACKDROP_BOOTSTRAP_FULL', 8);

/**
 * Role ID for anonymous users.
 */
define('BACKDROP_ANONYMOUS_ROLE', 'anonymous');

/**
 * Role ID for authenticated users.
 */
define('BACKDROP_AUTHENTICATED_ROLE', 'authenticated');

/**
 * The number of bytes in a kilobyte.
 *
 * For more information, visit http://en.wikipedia.org/wiki/Kilobyte.
 */
define('BACKDROP_KILOBYTE', 1024);

/**
 * System language (only applicable to UI).
 *
 * Refers to the language used in Backdrop and module/theme source code.
 */
define('LANGUAGE_SYSTEM', 'system');

/**
 * The language code used when no language is explicitly assigned.
 *
 * Defined by ISO639-2 for "Undetermined".
 */
define('LANGUAGE_NONE', 'und');

/**
 * The type of language used to define the content language.
 */
define('LANGUAGE_TYPE_CONTENT', 'language_content');

/**
 * The type of language used to select the user interface.
 */
define('LANGUAGE_TYPE_INTERFACE', 'language');

/**
 * The type of language used for URLs.
 */
define('LANGUAGE_TYPE_URL', 'language_url');

/**
 * Language written left to right. Possible value of $language->direction.
 */
define('LANGUAGE_LTR', 0);

/**
 * Language written right to left. Possible value of $language->direction.
 */
define('LANGUAGE_RTL', 1);

/**
 * Time of the current request in seconds elapsed since the Unix Epoch.
 *
 * This differs from $_SERVER['REQUEST_TIME'], which is stored as a float
 * since PHP 5.4.0. Float timestamps confuse most PHP functions
 * (including date_create()).
 *
 * @see http://php.net/manual/reserved.variables.server.php
 * @see http://php.net/manual/function.time.php
 */
define('REQUEST_TIME', (int) $_SERVER['REQUEST_TIME']);

/**
  * Flag used to indicate that text is not sanitized, so run check_plain().
  *
  * @see backdrop_set_title()
 */
define('CHECK_PLAIN', 0);

/**
  * Flag used to indicate that text has already been sanitized.
  *
  * @see backdrop_set_title()
 */
define('PASS_THROUGH', -1);

/**
 * Regular expression to match PHP function names.
 *
 * @see http://php.net/manual/language.functions.php
 */
define('BACKDROP_PHP_FUNCTION_PATTERN', '[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*');

// Exit early if running an incompatible PHP version to avoid fatal errors.
if (version_compare(PHP_VERSION, BACKDROP_MINIMUM_PHP) < 0) {
  print 'Your PHP installation is too old. Backdrop CMS requires at least PHP 5.3.2. See the <a href="https://backdropcms.org/requirements">System Requirements</a> page for more information.';
  exit;
}

/**
 * Provides a caching wrapper to be used in place of large array structures.
 *
 * This class should be extended by systems that need to cache large amounts
 * of data and have it represented as an array to calling functions. These
 * arrays can become very large, so ArrayAccess is used to allow different
 * strategies to be used for caching internally (lazy loading, building caches
 * over time etc.). This can dramatically reduce the amount of data that needs
 * to be loaded from cache backends on each request, and memory usage from
 * static caches of that same data.
 *
 * Note that array_* functions do not work with ArrayAccess. Systems using
 * BackdropCacheArray should use this only internally. If providing API functions
 * that return the full array, this can be cached separately or returned
 * directly. However since BackdropCacheArray holds partial content by design, it
 * should be a normal PHP array or otherwise contain the full structure.
 *
 * Note also that due to limitations in PHP prior to 5.3.4, it is impossible to
 * write directly to the contents of nested arrays contained in this object.
 * Only writes to the top-level array elements are possible. So if you
 * previously had set $object['foo'] = array(1, 2, 'bar' => 'baz'), but later
 * want to change the value of 'bar' from 'baz' to 'foobar', you cannot do so
 * a targeted write like $object['foo']['bar'] = 'foobar'. Instead, you must
 * overwrite the entire top-level 'foo' array with the entire set of new
 * values: $object['foo'] = array(1, 2, 'bar' => 'foobar'). Due to this same
 * limitation, attempts to create references to any contained data, nested or
 * otherwise, will fail silently. So $var = &$object['foo'] will not throw an
 * error, and $var will be populated with the contents of $object['foo'], but
 * that data will be passed by value, not reference. For more information on
 * the PHP limitation, see the note in the official PHP documentation at·
 * http://php.net/manual/arrayaccess.offsetget.php on
 * ArrayAccess::offsetGet().
 *
 * By default, the class accounts for caches where calling functions might
 * request keys in the array that won't exist even after a cache rebuild. This
 * prevents situations where a cache rebuild would be triggered over and over
 * due to a 'missing' item. These cases are stored internally as a value of
 * NULL. This means that the offsetGet() and offsetExists() methods
 * must be overridden if caching an array where the top level values can
 * legitimately be NULL, and where $object->offsetExists() needs to correctly
 * return (equivalent to array_key_exists() vs. isset()). This should not
 * be necessary in the majority of cases.
 *
 * Classes extending this class must override at least the
 * resolveCacheMiss() method to have a working implementation.
 *
 * offsetSet() is not overridden by this class by default. In practice this
 * means that assigning an offset via arrayAccess will only apply while the
 * object is in scope and will not be written back to the persistent cache.
 * This follows a similar pattern to static vs. persistent caching in
 * procedural code. Extending classes may wish to alter this behavior, for
 * example by overriding offsetSet() and adding an automatic call to persist().
 *
 * @see SchemaCache
 */
abstract class BackdropCacheArray implements ArrayAccess {

  /**
   * A cid to pass to cache()->set() and cache()->get().
   */
  protected $cid;

  /**
   * A bin to pass to cache()->set() and cache()->get().
   */
  protected $bin;

  /**
   * An array of keys to add to the cache at the end of the request.
   */
  protected $keysToPersist = array();

  /**
   * Storage for the data itself.
   */
  protected $storage = array();

  /**
   * Constructs a BackdropCacheArray object.
   *
   * @param $cid
   *   The cid for the array being cached.
   * @param $bin
   *   The bin to cache the array.
   */
  public function __construct($cid, $bin) {
    $this->cid = $cid;
    $this->bin = $bin;

    if ($cached = cache($bin)->get($this->cid)) {
     $this->storage = $cached->data;
    }
  }

  /**
   * Implements ArrayAccess::offsetExists().
   */
  public function offsetExists($offset) {
    return $this->offsetGet($offset) !== NULL;
  }

  /**
   * Implements ArrayAccess::offsetGet().
   */
  public function offsetGet($offset) {
    if (isset($this->storage[$offset]) || array_key_exists($offset, $this->storage)) {
      return $this->storage[$offset];
    }
    else {
      return $this->resolveCacheMiss($offset);
    }
  }

  /**
   * Implements ArrayAccess::offsetSet().
   */
  public function offsetSet($offset, $value) {
    $this->storage[$offset] = $value;
  }

  /**
   * Implements ArrayAccess::offsetUnset().
   */
  public function offsetUnset($offset) {
    unset($this->storage[$offset]);
  }

  /**
   * Flags an offset value to be written to the persistent cache.
   *
   * If a value is assigned to a cache object with offsetSet(), by default it
   * will not be written to the persistent cache unless it is flagged with this
   * method. This allows items to be cached for the duration of a request,
   * without necessarily writing back to the persistent cache at the end.
   *
   * @param $offset
   *   The array offset that was requested.
   * @param $persist
   *   Optional boolean to specify whether the offset should be persisted or
   *   not, defaults to TRUE. When called with $persist = FALSE the offset will
   *   be unflagged so that it will not be written at the end of the request.
   */
  protected function persist($offset, $persist = TRUE) {
    $this->keysToPersist[$offset] = $persist;
  }

  /**
   * Resolves a cache miss.
   *
   * When an offset is not found in the object, this is treated as a cache
   * miss. This method allows classes implementing the interface to look up
   * the actual value and allow it to be cached.
   *
   * @param $offset
   *   The offset that was requested.
   *
   * @return
   *   The value of the offset, or NULL if no value was found.
   */
  abstract protected function resolveCacheMiss($offset);

  /**
   * Writes a value to the persistent cache immediately.
   *
   * @param $data
   *   The data to write to the persistent cache.
   * @param $lock
   *   Whether to acquire a lock before writing to cache.
   */
  protected function set($data, $lock = TRUE) {
    // Lock cache writes to help avoid stampedes.
    // To implement locking for cache misses, override __construct().
    $lock_name = $this->cid . ':' . $this->bin;
    if (!$lock || lock_acquire($lock_name)) {
      if ($cached = cache($this->bin)->get($this->cid)) {
        $data = $cached->data + $data;
      }
      cache($this->bin)->set($this->cid, $data);
      if ($lock) {
        lock_release($lock_name);
      }
    }
  }

  /**
   * Destructs the BackdropCacheArray object.
   */
  public function __destruct() {
    $data = array();
    foreach ($this->keysToPersist as $offset => $persist) {
      if ($persist) {
        $data[$offset] = $this->storage[$offset];
      }
    }
    if (!empty($data)) {
      $this->set($data);
    }
  }
}

/**
 * Starts the timer with the specified name.
 *
 * If you start and stop the same timer multiple times, the measured intervals
 * will be accumulated.
 *
 * @param $name
 *   The name of the timer.
 */
function timer_start($name) {
  global $timers;

  $timers[$name]['start'] = microtime(TRUE);
  $timers[$name]['count'] = isset($timers[$name]['count']) ? ++$timers[$name]['count'] : 1;
}

/**
 * Reads the current timer value without stopping the timer.
 *
 * @param $name
 *   The name of the timer.
 *
 * @return
 *   The current timer value in ms.
 */
function timer_read($name) {
  global $timers;

  if (isset($timers[$name]['start'])) {
    $stop = microtime(TRUE);
    $diff = round(($stop - $timers[$name]['start']) * 1000, 2);

    if (isset($timers[$name]['time'])) {
      $diff += $timers[$name]['time'];
    }
    return $diff;
  }
  return $timers[$name]['time'];
}

/**
 * Stops the timer with the specified name.
 *
 * @param $name
 *   The name of the timer.
 *
 * @return
 *   A timer array. The array contains the number of times the timer has been
 *   started and stopped (count) and the accumulated timer value in ms (time).
 */
function timer_stop($name) {
  global $timers;

  if (isset($timers[$name]['start'])) {
    $stop = microtime(TRUE);
    $diff = round(($stop - $timers[$name]['start']) * 1000, 2);
    if (isset($timers[$name]['time'])) {
      $timers[$name]['time'] += $diff;
    }
    else {
      $timers[$name]['time'] = $diff;
    }
    unset($timers[$name]['start']);
  }

  return $timers[$name];
}

/**
 * Returns the appropriate configuration directory.
 *
 * Returns the configuration path based on the site's hostname, port, and
 * pathname. Uses find_conf_path() to find the current configuration directory.
 * See sites/sites.php for examples on how the URL is converted to a
 * directory.
 *
 * @param bool $require_settings
 *   Only configuration directories with an existing settings.php file
 *   will be recognized. Defaults to TRUE. During initial installation,
 *   this is set to FALSE so that Backdrop can detect a matching directory,
 *   then create a new settings.php file in it.
 * @param bool $reset
 *   Force a full search for matching directories even if one had been
 *   found previously. Defaults to FALSE.
 *
 * @return
 *   The path of the matching directory.
 *
 * @see settings.php
 */
function conf_path($require_settings = TRUE, $reset = FALSE) {
  $conf = &backdrop_static(__FUNCTION__, '');

  if ($conf && !$reset) {
    return $conf;
  }

  $script_name = $_SERVER['SCRIPT_NAME'];
  if (!$script_name) {
    $script_name = $_SERVER['SCRIPT_FILENAME'];
  }
  $http_host = $_SERVER['HTTP_HOST'];
  $conf = find_conf_path($http_host, $script_name, $require_settings);
  return $conf;
}

/**
 * Finds the appropriate configuration directory for a given host and path.
 *
 * This function is the heart of Backdrop's multisite functionality, determining
 * which directory should be used based on the hostname. If not using multisite,
 * the path returned will be a single period (indicating the current directory).
 *
 * @param $http_host
 *   The hostname and optional port number, e.g. "www.example.com" or
 *   "www.example.com:8080".
 * @param $script_name
 *   The part of the url following the hostname, including the leading slash.
 *
 * @return
 *   The relative path of the matching configuration directory.
 *
 * @see conf_path()
 */
function find_conf_path($http_host, $script_name, $require_settings = TRUE) {
  $conf = '.';
  $sites = array();

  // This will overwrite $sites with any multisite mappings.
  if (file_exists(BACKDROP_ROOT . '/sites/sites.php')) {
    include BACKDROP_ROOT . '/sites/sites.php';
  }

  if ($sites) {
    $uri = explode('/', $script_name);
    $server = explode('.', implode('.', array_reverse(explode(':', rtrim($http_host, '.')))));
    for ($i = count($uri) - 1; $i > 0; $i--) {
      for ($j = count($server); $j > 0; $j--) {
        $dir = implode('.', array_slice($server, -$j)) . implode('.', array_slice($uri, 0, $i));
        if (isset($sites[$dir]) && file_exists(BACKDROP_ROOT . '/sites/' . $sites[$dir])) {
          $dir = $sites[$dir];
        }
        if (file_exists(BACKDROP_ROOT . '/sites/' . $dir . '/settings.php') || (!$require_settings && file_exists(BACKDROP_ROOT . '/sites/' . $dir))) {
          $conf = './sites/' . $dir;
          return $conf;
        }
      }
    }
  }

  return $conf;
}

/**
 * Sets appropriate server variables needed for command line scripts to work.
 *
 * This function can be called by command line scripts before bootstrapping
 * Backdrop, to ensure that the page loads with the desired server parameters.
 * This is because many parts of Backdrop assume that they are running in a web
 * browser and therefore use information from the global PHP $_SERVER variable
 * that does not get set when Backdrop is run from the command line.
 *
 * In many cases, the default way in which this function populates the $_SERVER
 * variable is sufficient, and it can therefore be called without passing in
 * any input. However, command line scripts running on a multisite installation
 * (or on any installation that has settings.php stored somewhere other than
 * the root folder) need to pass in the URL of the site to allow
 * Backdrop to detect the correct location of the settings.php file. Passing in
 * the 'url' parameter is also required for functions like request_uri() to
 * return the expected values.
 *
 * Most other parameters do not need to be passed in, but may be necessary in
 * some cases; for example, if Backdrop's ip_address() function needs to return
 * anything but the standard localhost value ('127.0.0.1'), the command line
 * script should pass in the desired value via the 'REMOTE_ADDR' key.
 *
 * @param $variables
 *   (optional) An associative array of variables within $_SERVER that should
 *   be replaced. If the special element 'url' is provided in this array, it
 *   will be used to populate some of the server defaults; it should be set to
 *   the URL of the current page request, excluding any $_GET request but
 *   including the script name (e.g., http://www.example.com/mysite/index.php).
 *
 * @see conf_path()
 * @see request_uri()
 * @see ip_address()
 */
function backdrop_override_server_variables($variables = array()) {
  // Allow the provided URL to override any existing values in $_SERVER.
  if (isset($variables['url'])) {
    $url = parse_url($variables['url']);
    if (isset($url['host'])) {
      $_SERVER['HTTP_HOST'] = $url['host'];
    }
    if (isset($url['path'])) {
      $_SERVER['SCRIPT_NAME'] = $url['path'];
    }
    unset($variables['url']);
  }
  // Define default values for $_SERVER keys. These will be used if $_SERVER
  // does not already define them and no other values are passed in to this
  // function.
  $defaults = array(
    'HTTP_HOST' => 'localhost',
    'SCRIPT_NAME' => NULL,
    'REMOTE_ADDR' => '127.0.0.1',
    'REQUEST_METHOD' => 'GET',
    'SERVER_NAME' => NULL,
    'SERVER_SOFTWARE' => NULL,
    'HTTP_USER_AGENT' => NULL,
  );
  // Replace elements of the $_SERVER array, as appropriate.
  $_SERVER = $variables + $_SERVER + $defaults;
}

/**
 * Initializes the PHP environment.
 */
function backdrop_environment_initialize() {
  if (!isset($_SERVER['HTTP_REFERER'])) {
    $_SERVER['HTTP_REFERER'] = '';
  }
  if (!isset($_SERVER['SERVER_PROTOCOL']) || ($_SERVER['SERVER_PROTOCOL'] != 'HTTP/1.0' && $_SERVER['SERVER_PROTOCOL'] != 'HTTP/1.1')) {
    $_SERVER['SERVER_PROTOCOL'] = 'HTTP/1.0';
  }

  if (isset($_SERVER['HTTP_HOST'])) {
    // As HTTP_HOST is user input, ensure it only contains characters allowed
    // in hostnames. See RFC 952 (and RFC 2181).
    // $_SERVER['HTTP_HOST'] is lowercased here per specifications.
    $_SERVER['HTTP_HOST'] = strtolower($_SERVER['HTTP_HOST']);
    if (!backdrop_valid_http_host($_SERVER['HTTP_HOST'])) {
      // HTTP_HOST is invalid, e.g. if containing slashes it may be an attack.
      header($_SERVER['SERVER_PROTOCOL'] . ' 400 Bad Request');
      exit;
    }
  }
  else {
    // Some pre-HTTP/1.1 clients will not send a Host header. Ensure the key is
    // defined for E_ALL compliance.
    $_SERVER['HTTP_HOST'] = '';
  }

  // When clean URLs are enabled, emulate ?q=foo/bar using REQUEST_URI. It is
  // not possible to append the query string using mod_rewrite without the B
  // flag (this was added in Apache 2.2.8), because mod_rewrite unescapes the
  // path before passing it on to PHP. This is a problem when the path contains
  // e.g. "&" or "%" that have special meanings in URLs and must be encoded.
  $_GET['q'] = request_path();

  // Enforce E_STRICT, but allow users to set levels not part of E_STRICT.
  error_reporting(E_STRICT | E_ALL | error_reporting());

  // Override PHP settings required for Backdrop to work properly.
  // settings.php contains more runtime settings.
  // The .htaccess file contains settings that cannot be changed at runtime.

  // Don't escape quotes when reading files from the database, disk, etc.
  ini_set('magic_quotes_runtime', '0');
  // Use session cookies, not transparent sessions that puts the session id in
  // the query string.
  ini_set('session.use_cookies', '1');
  ini_set('session.use_only_cookies', '1');
  ini_set('session.use_trans_sid', '0');
  // Don't send HTTP headers using PHP's session handler.
  // An empty string is used here to disable the cache limiter.
  ini_set('session.cache_limiter', '');
  // Use httponly session cookies.
  ini_set('session.cookie_httponly', '1');

  // Set sane locale settings, to ensure consistent string, dates, times and
  // numbers handling.
  setlocale(LC_ALL, 'C');
}

/**
 * Validates that a hostname (for example $_SERVER['HTTP_HOST']) is safe.
 *
 * @return
 *  TRUE if only containing valid characters, or FALSE otherwise.
 */
function backdrop_valid_http_host($host) {
  // Limit the length of the host name to 1000 bytes to prevent DoS attacks with
  // long host names.
  return strlen($host) <= 1000
    // Limit the number of subdomains and port separators to prevent DoS attacks
    // in conf_path().
    && substr_count($host, '.') <= 100
    && substr_count($host, ':') <= 100
    && preg_match('/^\[?(?:[a-zA-Z0-9-:\]_]+\.?)+$/', $host);
}

/**
 * Sets the base URL, cookie domain, and session name from configuration.
 */
function backdrop_settings_initialize() {
  global $base_url, $base_path, $base_root;

  // Export these settings.php variables to the global namespace.
  global $databases, $cookie_domain, $conf, $settings, $installed_profile, $is_https, $base_secure_url, $base_insecure_url, $config_directories;
  $conf = array();
  $settings = array();

  $conf_path = conf_path();
  if (file_exists($conf_path . '/settings.php')) {
    require_once $conf_path . '/settings.php';
  }
  if (!empty($settings['backdrop_drupal_compatibility'])) {
    require_once BACKDROP_ROOT . '/core/includes/drupal.inc';
  }

  // Convert simplified database settings into the full databases array.
  if (!empty($database) && $database !== 'mysql://user:pass@localhost/database_name') {
    $database_parts = parse_url($database);
    $databases['default']['default'] = array(
      'driver' => $database_parts['scheme'],
      'database' => substr($database_parts['path'], 1), // Remove leading slash.
      'username' => isset($database_parts['user']) ? $database_parts['user'] : '',
      'password' => isset($database_parts['pass']) ? $database_parts['pass'] : '',
      'host' => $database_parts['host'],
      'port' => isset($database_parts['port']) ? $database_parts['port'] : NULL,
      'prefix' => !empty($database_prefix) ? $database_prefix : '',
    );
  }

  $is_https = isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) == 'on';

  // Load settings specified by the server, if present
  if (isset($_SERVER['BACKDROP_SETTINGS'])) {
    $server_settings = @json_decode($_SERVER['BACKDROP_SETTINGS'], TRUE);
    if (!is_array($server_settings)) {
      trigger_error('The values in $_SERVER[BACKDROP_SETTINGS] could not be read. Ensure it is a valid JSON string with no spaces.', E_USER_ERROR);
    }
    else {
      foreach ($server_settings as $key => $value) {
        // One level of depth should be enough for $settings and $databases.
        if ($key == 'settings') {
          foreach($value as $settings_key => $settings_value) {
            $settings[$settings_key] = $settings_value;
          }
        }
        elseif ($key == 'databases') {
          // Protect default configuration but allow the specification of
          // additional databases.
          if (!isset($databases) || !is_array($databases)) {
            $databases = array();
          }
          $databases = array_replace_recursive($databases, $value);
        }
        else {
          $$key = $value;
        }
      }
    }
  }

  // Pull in the database charset option if specified. This removes the need
  // to use the long-form array and allows enabling ut8mb4 support even if the
  // server provided options via $_SERVER['BACKDROP_SETTINGS'].
  if (isset($database_charset) && isset($databases['default']['default']) && !isset($databases['default']['default']['charset'])) {
    $databases['default']['default']['charset'] = $database_charset;
  }

  if (isset($base_url)) {
    // Parse fixed base URL from settings.php.
    $parts = parse_url($base_url);
    if (!isset($parts['path'])) {
      $parts['path'] = '';
    }
    $base_path = $parts['path'] . '/';
    // Build $base_root (everything until first slash after "scheme://").
    $base_root = substr($base_url, 0, strlen($base_url) - strlen($parts['path']));
  }
  else {
    // Create base URL.
    $http_protocol = $is_https ? 'https' : 'http';
    $base_root = $http_protocol . '://' . $_SERVER['HTTP_HOST'];

    $base_url = $base_root;

    // $_SERVER['SCRIPT_NAME'] can, in contrast to $_SERVER['PHP_SELF'], not
    // be modified by a visitor.
    if ($dir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '\/')) {
      // Remove "core" directory if present, allowing install.php, update.php,
      // cron.php and others to auto-detect a base path.
      $core_position = strrpos($dir, '/core');
      if ($core_position !== FALSE && strlen($dir) - 5 == $core_position) {
        $base_path = substr($dir, 0, $core_position);
      }
      else {
        $base_path = $dir;
      }
      $base_url .= $base_path;
      $base_path .= '/';
    }
    else {
      $base_path = '/';
    }
  }
  $base_secure_url = str_replace('http://', 'https://', $base_url);
  $base_insecure_url = str_replace('https://', 'http://', $base_url);

  if ($cookie_domain) {
    // If the user specifies the cookie domain, also use it for session name.
    $session_name = $cookie_domain;
  }
  else {
    // Otherwise use $base_url as session name, without the protocol
    // to use the same session identifiers across HTTP and HTTPS.
    list( , $session_name) = explode('://', $base_url, 2);
    // HTTP_HOST can be modified by a visitor, but we already sanitized it
    // in backdrop_settings_initialize().
    if (!empty($_SERVER['HTTP_HOST'])) {
      $cookie_domain = $_SERVER['HTTP_HOST'];
      // Strip leading periods, www., and port numbers from cookie domain.
      $cookie_domain = ltrim($cookie_domain, '.');
      if (strpos($cookie_domain, 'www.') === 0) {
        $cookie_domain = substr($cookie_domain, 4);
      }
      $cookie_domain = explode(':', $cookie_domain);
      $cookie_domain = '.' . $cookie_domain[0];
    }
  }
  // Per RFC 2109, cookie domains must contain at least one dot other than the
  // first. For hosts such as 'localhost' or IP Addresses we don't set a cookie domain.
  if (count(explode('.', $cookie_domain)) > 2 && !is_numeric(str_replace('.', '', $cookie_domain))) {
    ini_set('session.cookie_domain', $cookie_domain);
  }
  // To prevent session cookies from being hijacked, a user can configure the
  // SSL version of their website to only transfer session cookies via SSL by
  // using PHP's session.cookie_secure setting. The browser will then use two
  // separate session cookies for the HTTPS and HTTP versions of the site. So we
  // must use different session identifiers for HTTPS and HTTP to prevent a
  // cookie collision.
  if ($is_https) {
    ini_set('session.cookie_secure', TRUE);
  }
  $prefix = ini_get('session.cookie_secure') ? 'SSESS' : 'SESS';
  session_name($prefix . substr(hash('sha256', $session_name), 0, 32));
}

/**
 * Returns and optionally sets the filename for a system resource.
 *
 * The filename, whether provided, cached, or retrieved from the database, is
 * only returned if the file exists.
 *
 * This function plays a key role in allowing Backdrop's resources (modules,
 * layouts, and themes) to be located in different places depending on a site's
 * configuration. For example, a module 'foo' may legally be located
 * in any of these three places:
 *
 * core/modules/foo/foo.module
 * modules/foo/foo.module
 * sites/example.com/modules/foo/foo.module
 *
 * Calling backdrop_get_filename('module', 'foo') will give you one of
 * the above, depending on where the module is located.
 *
 * @param $type
 *   The type of the item (theme, layout, theme_engine, module, profile).
 * @param $name
 *   The name of the item for which the filename is requested.
 * @param $filename
 *   The filename of the item if it is to be set explicitly rather
 *   than by consulting the database.
 *
 * @return
 *   The filename of the requested item or NULL if the item is not found.
 */
function backdrop_get_filename($type, $name, $filename = NULL) {
  // The location of files will not change during the request, so do not use
  // backdrop_static().
  static $files = array(), $dirs = array();

  // Profiles are a special case: they have a fixed location and naming.
  if ($type == 'profile') {
    $profile_filename = "profiles/$name/$name.profile";
    $files[$type][$name] = file_exists($profile_filename) ? $profile_filename : FALSE;
  }
  if (!isset($files[$type])) {
    $files[$type] = array();
  }

  if (!empty($filename) && file_exists($filename)) {
    $files[$type][$name] = $filename;
  }
  elseif (isset($files[$type][$name])) {
    // The file is in the database but does not exist on the disk.
  }
  // Verify that we have an active database connection, before querying
  // the database. This is required because this function is called both
  // before we have a database connection (i.e. during installation) and
  // when a database connection fails.
  else {
    try {
      // Layouts we use the existing registry rather than the system table.
      if ($type === 'layout' && function_exists('layout_get_layout_template_info')) {
        $layout_info = layout_get_layout_template_info($name);
        if ($layout_info) {
          $files[$type][$name] = $layout_info['path'] . '/' . $layout_info['name'] . '.info';
        }
      }
      // Modules, themes, and profiles pull from the system table.
      elseif (function_exists('db_query')) {
        $file = db_query("SELECT filename FROM {system} WHERE name = :name AND type = :type", array(':name' => $name, ':type' => $type))->fetchField();
        if ($file && file_exists(BACKDROP_ROOT . '/' . $file)) {
          $files[$type][$name] = $file;
        }
      }
    }
    catch (Exception $e) {
      // The database table may not exist because Backdrop is not yet installed,
      // or the database might be down. We have a fallback for this case so we
      // hide the error completely.
    }

    // Fallback to searching the filesystem if the database could not find the
    // file or the file returned by the database is not found.
    if (!isset($files[$type][$name])) {
      // We have a consistent directory naming: modules, themes...
      $dir = $type . 's';
      if ($type == 'theme_engine') {
        $dir = 'themes/engines';
        $extension = 'engine';
      }
      elseif ($type === 'theme' || $type === 'layout') {
        $extension = 'info';
      }
      else {
        $extension = $type;
      }

      if (!isset($dirs[$dir][$extension])) {
        $dirs[$dir][$extension] = TRUE;
        if (!function_exists('backdrop_system_listing')) {
          require_once BACKDROP_ROOT . '/core/includes/common.inc';
        }
        // Scan the appropriate directories for all files with the requested
        // extension, not just the file we are currently looking for. This
        // prevents unnecessary scans from being repeated when this function is
        // called more than once in the same page request.
        $matches = backdrop_system_listing("/^" . BACKDROP_PHP_FUNCTION_PATTERN . "\.$extension$/", $dir, 'name', 0);
        foreach ($matches as $matched_name => $file) {
          $files[$type][$matched_name] = $file->uri;
        }
      }
    }
  }

  return isset($files[$type][$name]) ? $files[$type][$name] : NULL;
}

/**
 * Loads the persistent variable table.
 *
 * The variable table is composed of values that have been saved in the table
 * with variable_set() as well as those explicitly specified in the
 * configuration file.
 *
 * @deprecated since 1.0
 */
function variable_initialize($conf = array()) {
  // watchdog_deprecated_function() is not called here even though this function
  // is deprecated because this function is *always* called during bootstrap.

  // NOTE: caching the variables improves performance by 20% when serving
  // cached pages.
  if ($cached = cache('bootstrap')->get('variables')) {
    $variables = $cached->data;
  }
  else {
    // Cache miss. Avoid a stampede.
    $name = 'variable_init';
    if (!lock_acquire($name, 1)) {
      // Another request is building the variable cache.
      // Wait, then re-run this function.
      lock_wait($name);
      return variable_initialize($conf);
    }
    else {
      // Proceed with variable rebuild.
      $variables = array_map('unserialize', db_query('SELECT name, value FROM {variable}')->fetchAllKeyed());
      cache('bootstrap')->set('variables', $variables);
      lock_release($name);
    }
  }

  foreach ($conf as $name => $value) {
    $variables[$name] = $value;
  }

  return $variables;
}

/**
 * Returns a site-wide setting, usually specified via the settings.php file.
 *
 * This returns values from the global $settings variable, with an optional
 * default if the setting has not be specified. Settings are used for low-level,
 * global configuration. Unlike config_get(), this function is used to retrieve
 * values that cannot be changed via the user-interface, hence why there is no
 * matching settings_set() function.
 *
 * @param string $name
 *   The name of the setting to return.
 * @param mixed $default
 *   (optional) The default value to use if this setting is not set.
 *
 * @return mixed
 *   The value of the setting, the provided default if not set.
 */
function settings_get($name, $default = NULL) {
  global $settings;

  return isset($settings[$name]) ? $settings[$name] : $default;
}

/**
 * Returns a persistent variable.
 *
 * Case-sensitivity of the variable_* functions depends on the database
 * collation used. To avoid problems, always use lower case for persistent
 * variable names.
 *
 * This function is deprecated in Backdrop and will be removed in a future
 * release. Variables are not managed through the configuration system, so they
 * cannot be moved between environments safely. If your module needs to save
 * configuration settings, use config_get() instead. If you need to save an
 * environment-specific setting (such as the last time cron ran), use
 * state_get() instead.
 *
 * @param $name
 *   The name of the variable to return.
 * @param $default
 *   The default value to use if this variable has never been set.
 *
 * @return
 *   The value of the variable. Unserialization is taken care of as necessary.
 *
 * @see variable_del()
 * @see variable_set()
 * @see config_get()
 * @see state_get()
 *
 * @deprecated since 1.0
 */
function variable_get($name, $default = NULL) {
  global $conf;

  watchdog_deprecated_function('bootstrap', __FUNCTION__);
  return isset($conf[$name]) ? $conf[$name] : $default;
}

/**
 * Sets a persistent variable.
 *
 * Case-sensitivity of the variable_* functions depends on the database
 * collation used. To avoid problems, always use lower case for persistent
 * variable names.
 *
 * This function is deprecated in Backdrop and will be removed in a future
 * release. Variables are not managed through the configuration system, so they
 * cannot be moved between environments safely. If your module needs to save
 * configuration settings, use config_set() instead. If you need to save an
 * environment-specific setting (such as the last time cron ran), use
 * state_set() instead.
 *
 * @param $name
 *   The name of the variable to set.
 * @param $value
 *   The value to set. This can be any PHP data type; these functions take care
 *   of serialization as necessary.
 *
 * @see variable_del()
 * @see variable_get()
 * @see config_set()
 * @see state_set()
 *
 * @deprecated since 1.0
 */
function variable_set($name, $value) {
  global $conf;

  watchdog_deprecated_function('bootstrap', __FUNCTION__);

  db_merge('variable')->key(array('name' => $name))->fields(array('value' => serialize($value)))->execute();

  cache('bootstrap')->delete('variables');

  $conf[$name] = $value;
}

/**
 * Unsets a persistent variable.
 *
 * Case-sensitivity of the variable_* functions depends on the database
 * collation used. To avoid problems, always use lower case for persistent
 * variable names.
 *
 * @param $name
 *   The name of the variable to undefine.
 *
 * @see variable_get()
 * @see variable_set()
 *
 * @deprecated since 1.0
 */
function variable_del($name) {
  global $conf;

  watchdog_deprecated_function('bootstrap', __FUNCTION__);

  db_delete('variable')
    ->condition('name', $name)
    ->execute();
  cache('bootstrap')->delete('variables');

  unset($conf[$name]);
}

/**
 * Loads the persistent state table.
 *
 * The state table is composed of values that have been saved in the table
 * with state_set().
 */
function state_initialize() {
  if ($cached = cache('cache')->get('states')) {
    $states = $cached->data;
  }
  else {
    // Cache miss. Avoid a stampede.
    $name = 'state_init';
    if (!lock_acquire($name, 1)) {
      // Another request is building the variable cache.
      // Wait, then re-run this function.
      lock_wait($name);
      return state_initialize();
    }
    else {
      // Proceed with variable rebuild.
      $states = array_map('unserialize', db_query('SELECT name, value FROM {state}')->fetchAllKeyed());
      cache('cache')->set('states', $states);
      lock_release($name);
    }
  }

  return $states;
}

/**
 * Retrieves a "state" value from the database.
 *
 * States are used for saving long-term values in the database that are
 * environment-specific. Some examples of values appropriate for utilizing
 * states include the last time cron was run or the current query string
 * appended to CSS/JS files. These values should not be copied between
 * environments, so they are stored in the state system instead of as
 * configuration files.
 *
 * Case-sensitivity of the state_* functions depends on the database
 * collation used. To avoid problems, always use lower case for persistent
 * state names.
 *
 * @param $name
 *   The name of the state to return.
 * @param $default
 *   The default value to use if this state has never been set.
 *
 * @return
 *   The value of the state. Complex data types such as objects and arrays are
 *   unserialized when returned.
 *
 * @see state_set()
 * @see state_del()
 */
function state_get($name, $default = NULL) {
  $states = &backdrop_static('states');
  if (!isset($states)) {
    $states = state_initialize();
  }
  return isset($states[$name]) ? $states[$name] : $default;
}

/**
 * Sets a persistent state value.
 *
 * @param $name
 *   The name of the state to set.
 * @param $value
 *   The value to set. Complex data types will be serialized upon storage.
 *
 * @see state_get()
 * @see state_del()
 */
function state_set($name, $value) {
  $states = &backdrop_static('states');
  db_merge('state')
    ->key(array('name' => $name))
    ->fields(array('value' => serialize($value)))
    ->execute();
  cache('cache')->delete('states');
  if (isset($states)) {
    $states[$name] = $value;
  }
}

/**
 * Unsets a persistent state value.
 *
 * @param $name
 *   The name of the state to delete.
 *
 * @see state_get()
 * @see state_set()
 */
function state_del($name) {
  $states = &backdrop_static('states', array());
  db_delete('state')
    ->condition('name', $name)
    ->execute();
  cache('cache')->delete('states');
  if ($states && array_key_exists($name, $states)) {
    unset($states[$name]);
  }
}

/**
 * Retrieves the current page from the cache.
 *
 * Note: we do not serve cached pages to authenticated users, or to anonymous
 * users when $_SESSION is non-empty. $_SESSION may contain status messages
 * from a form submission, the contents of a shopping cart, or other user-
 * specific content that should not be cached and displayed to other users.
 *
 * @param bool $check_only
 *   Set to TRUE to only return whether a previous call found a cache entry.
 * @param bool $return_stale
 *   If background fetch is enabled, page cache entries are stored for longer
 *   period of time than the page cache maximum age. This allows stale entries
 *   to be served while generating new cache entries. If set to TRUE, then
 *   these stale cache entries will be returned. If left at the default of
 *   FALSE, only cache entries within the maximum cache lifetime will be
 *   returned.
 *
 * @return stdClass|NULL
 *   The cache object, if the page was found in the cache, NULL otherwise.
 */
function backdrop_page_get_cache($check_only = FALSE, $return_stale = FALSE) {
  global $base_root;
  static $cache_hit = array();

  // Keep two separate cache entries for an expired or non-expired hit.
  $cache_type = $return_stale ? 'stale' : 'fresh';
  if (!isset($cache_hit[$cache_type])) {
    $cache_hit[$cache_type] = FALSE;
  }

  // Return any previous value on checks only.
  if ($check_only) {
    return $cache_hit[$cache_type];
  }

  $cache = NULL;
  if (backdrop_page_is_cacheable()) {
    $cache = cache('page')->get($base_root . request_uri());
    if ($cache !== FALSE) {
      $cache_lifetime = config_get('system.core', 'page_cache_maximum_age');
      $cache_valid = $cache->created + $cache_lifetime >= REQUEST_TIME;
      // Return the cache entry if not expired or if an expired entry is okay.
      if ($cache_valid || $return_stale) {
        $cache_hit[$cache_type] = TRUE;
      }
      else {
        $cache_hit[$cache_type] = FALSE;
        $cache = NULL;
      }
    }
  }
  return $cache;
}

/**
 * Determines the cacheability of the current page.
 *
 * @param $allow_caching
 *   Set to FALSE if you want to prevent this page from being cached.
 *
 * @return
 *   TRUE if the current page can be cached, FALSE otherwise.
 */
function backdrop_page_is_cacheable($allow_caching = NULL) {
  $allow_caching_static = &backdrop_static(__FUNCTION__, TRUE);
  if (isset($allow_caching)) {
    $allow_caching_static = $allow_caching;
  }

  return $allow_caching_static && ($_SERVER['REQUEST_METHOD'] == 'GET' || $_SERVER['REQUEST_METHOD'] == 'HEAD') && !backdrop_is_cli();
}

/**
 * Invokes a bootstrap hook in all bootstrap modules that implement it.
 *
 * @param $hook
 *   The name of the bootstrap hook to invoke.
 *
 * @see bootstrap_hooks()
 */
function bootstrap_invoke_all($hook) {
  // Bootstrap modules should have been loaded when this function is called, so
  // we don't need to tell module_list() to reset its internal list (and we
  // therefore leave the first parameter at its default value of FALSE). We
  // still pass in TRUE for the second parameter, though; in case this is the
  // first time during the bootstrap that module_list() is called, we want to
  // make sure that its internal cache is primed with the bootstrap modules
  // only.
  foreach (module_list(FALSE, TRUE) as $module) {
    backdrop_load('module', $module);
    module_invoke($module, $hook);
  }
}

/**
 * Includes a file with the provided type and name.
 *
 * This prevents including a theme, engine, module, etc., more than once.
 *
 * @param $type
 *   The type of item to load (i.e. theme, theme_engine, module).
 * @param $name
 *   The name of the item to load.
 *
 * @return
 *   TRUE if the item is loaded or has already been loaded.
 */
function backdrop_load($type, $name) {
  // Once a file is included this can't be reversed during a request so do not
  // use backdrop_static() here.
  static $files = array();

  if (isset($files[$type][$name])) {
    return TRUE;
  }

  $filename = backdrop_get_filename($type, $name);

  if ($filename) {
    include_once BACKDROP_ROOT . '/' . $filename;
    $files[$type][$name] = TRUE;

    return TRUE;
  }

  return FALSE;
}

/**
 * Sets an HTTP response header for the current page.
 *
 * Note: When sending a Content-Type header, always include a 'charset' type,
 * too. This is necessary to avoid security bugs (e.g. UTF-7 XSS).
 *
 * @param $name
 *   The HTTP header name, or the special 'Status' header name.
 * @param $value
 *   The HTTP header value; if equal to FALSE, the specified header is unset.
 *   If $name is 'Status', this is expected to be a status code followed by a
 *   reason phrase, e.g. "404 Not Found".
 * @param $append
 *   Whether to append the value to an existing header or to replace it.
 */
function backdrop_add_http_header($name, $value, $append = FALSE) {
  // The headers as name/value pairs.
  $headers = &backdrop_static('backdrop_http_headers', array());

  $name_lower = strtolower($name);
  _backdrop_set_preferred_header_name($name);

  if ($value === FALSE) {
    $headers[$name_lower] = FALSE;
  }
  elseif (isset($headers[$name_lower]) && $append) {
    // Multiple headers with identical names may be combined using comma (RFC
    // 2616, section 4.2).
    $headers[$name_lower] .= ',' . $value;
  }
  else {
    $headers[$name_lower] = $value;
  }
  backdrop_send_headers(array($name => $headers[$name_lower]), TRUE);
}

/**
 * Gets the HTTP response headers for the current page.
 *
 * @param $name
 *   An HTTP header name. If omitted, all headers are returned as name/value
 *   pairs. If an array value is FALSE, the header has been unset.
 *
 * @return
 *   A string containing the header value, or FALSE if the header has been set,
 *   or NULL if the header has not been set.
 */
function backdrop_get_http_header($name = NULL) {
  $headers = &backdrop_static('backdrop_http_headers', array());
  if (isset($name)) {
    $name = strtolower($name);
    return isset($headers[$name]) ? $headers[$name] : NULL;
  }
  else {
    return $headers;
  }
}

/**
 * Sets the preferred name for the HTTP header.
 *
 * Header names are case-insensitive, but for maximum compatibility they should
 * follow "common form" (see RFC 2617, section 4.2).
 *
 * @param string $name
 *   Optional. A header name with the preferred capitalization, e.g.
 *   Cache-Control or Content-Type.
 * @return
 *   The array of all current preferred header names. Keyed by a lower-case
 *   string of each header name.
 */
function _backdrop_set_preferred_header_name($name = NULL) {
  static $header_names = array();

  if (isset($name)) {
    $header_names[strtolower($name)] = $name;
  }
  return $header_names;
}

/**
 * Sends the HTTP response headers that were previously set, adding defaults.
 *
 * Headers are set in backdrop_add_http_header(). Default headers are not set
 * if they have been replaced or unset using backdrop_add_http_header().
 *
 * @param array $default_headers
 *   (optional) An array of headers as name/value pairs.
 * @param bool $only_default
 *   (optional) If TRUE and headers have already been sent, send only the
 *   specified headers.
 */
function backdrop_send_headers($default_headers = array(), $only_default = FALSE) {
  // If we are in background mode, we are unable to send headers because the
  // request has already been delivered back to the client.
  if (backdrop_is_background()) {
    return;
  }

  $headers_sent = &backdrop_static(__FUNCTION__, FALSE);
  $headers = backdrop_get_http_header();
  if ($only_default && $headers_sent) {
    $headers = array();
  }
  $headers_sent = TRUE;

  $header_names = _backdrop_set_preferred_header_name();
  foreach ($default_headers as $name => $value) {
    $name_lower = strtolower($name);
    if (!isset($headers[$name_lower])) {
      $headers[$name_lower] = $value;
      $header_names[$name_lower] = $name;
    }
  }
  foreach ($headers as $name_lower => $value) {
    if ($name_lower == 'status') {
      header($_SERVER['SERVER_PROTOCOL'] . ' ' . $value);
    }
    // Skip headers that have been unset.
    elseif ($value !== FALSE) {
      header($header_names[$name_lower] . ': ' . $value);
    }
  }
}

/**
 * Sets HTTP headers in preparation for a page response.
 *
 * Authenticated users are always given a 'no-cache' header, and will fetch a
 * fresh page on every request. This prevents authenticated users from seeing
 * locally cached pages.
 *
 * Also give each page a unique ETag. This will force clients to include both
 * an If-Modified-Since header and an If-None-Match header when doing
 * conditional requests for the page (required by RFC 2616, section 13.3.4),
 * making the validation more robust. This is a workaround for a bug in Mozilla
 * Firefox that is triggered when Backdrop's caching is enabled and the user
 * accesses Backdrop via an HTTP proxy (see
 * https://bugzilla.mozilla.org/show_bug.cgi?id=269303): When an authenticated
 * user requests a page, and then logs out and requests the same page again,
 * Firefox may send a conditional request based on the page that was cached
 * locally when the user was logged in. If this page did not have an ETag
 * header, the request only contains an If-Modified-Since header. The date will
 * be recent, because with authenticated users the Last-Modified header always
 * refers to the time of the request. If the user accesses Backdrop via a proxy
 * server, and the proxy already has a cached copy of the anonymous page with an
 * older Last-Modified date, the proxy may respond with 304 Not Modified, making
 * the client think that the anonymous and authenticated pageviews are
 * identical.
 *
 * @return bool
 *   TRUE if the headers were sent. FALSE if the headers have already been sent
 *   and may not be sent again.
 *
 * @see backdrop_page_create_cache()
 * @see backdrop_page_save_cache()
 */
function backdrop_page_header() {
  $headers_sent = &backdrop_static(__FUNCTION__, FALSE);
  if ($headers_sent) {
    return FALSE;
  }
  $headers_sent = TRUE;

  $default_headers = array(
    'Expires' => 'Sun, 19 Nov 1978 05:00:00 GMT',
    'Last-Modified' => gmdate(DATE_RFC1123, REQUEST_TIME),
    'Cache-Control' => 'no-cache, must-revalidate',
    'X-Content-Type-Options' => 'nosniff',
    'ETag' => '"' . REQUEST_TIME . '"',
  );
  backdrop_send_headers($default_headers);
  return TRUE;
}

/**
 * Set headers for content-length and content-range.
 *
 * These headers allow the browser to deliver the page to the user without
 * waiting for PHP to finish execution.
 */
function backdrop_set_length_headers($content_length) {
  // Set the total content length.
  backdrop_add_http_header('Content-Length', $content_length);

  // If using chunked content (enabled with Apache mod_deflate), then specifying
  // the content range is required. This delivers the entire page in one chunk.
  backdrop_add_http_header('Content-Range', '0-' . ($content_length - 1) . '/' . $content_length);
}

/**
 * Sets HTTP headers in preparation for a cached page response.
 *
 * The headers allow as much as possible in proxies and browsers without any
 * particular knowledge about the pages. Modules can override these headers
 * using backdrop_add_http_header().
 *
 * If the request is conditional (using If-Modified-Since and If-None-Match),
 * and the conditions match those currently in the cache, a 304 Not Modified
 * response is sent.
 */
function backdrop_serve_page_from_cache(stdClass $cache) {
  $page_content = $cache->data['body'];

  // Negotiate whether to use compression.
  $page_compression = !empty($cache->data['page_compressed']);
  $return_compressed = $page_compression && isset($_SERVER['HTTP_ACCEPT_ENCODING']) && strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== FALSE;

  // Get headers set in hook_boot(). Keys are lower-case.
  $hook_boot_headers = backdrop_get_http_header();

  // Headers generated in this function, that may be replaced or unset using
  // backdrop_add_http_headers(). Keys are mixed-case.
  $default_headers = array();

  foreach ($cache->data['headers'] as $name => $value) {
    // In the case of a 304 response, certain headers must be sent, and the
    // remaining may not (see RFC 2616, section 10.3.5). Do not override
    // headers set in hook_boot().
    $name_lower = strtolower($name);
    if (in_array($name_lower, array('content-location', 'expires', 'cache-control', 'vary')) && !isset($hook_boot_headers[$name_lower])) {
      backdrop_add_http_header($name, $value);
      unset($cache->data['headers'][$name]);
    }
  }

  // If the client sent a session cookie, a cached copy will only be served
  // to that one particular client due to Vary: Cookie. Thus, do not set
  // max-age > 0, allowing the page to be cached by external proxies, when a
  // session cookie is present unless the Vary header has been replaced or
  // unset in hook_boot().
  $max_age = !isset($_COOKIE[session_name()]) || isset($hook_boot_headers['vary']) ? config_get('system.core', 'page_cache_maximum_age') : 0;
  $default_headers['Cache-Control'] = 'public, max-age=' . $max_age;

  // Entity tag should change if the output changes.
  $etag = $cache->created . ($return_compressed ? '-gzip' : '');
  header('Etag: ' . $etag);

  // See if the client has provided the required HTTP headers.
  $if_modified_since = isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) ? strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) : FALSE;
  $if_none_match = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? stripslashes($_SERVER['HTTP_IF_NONE_MATCH']) : FALSE;

  if ($if_modified_since && $if_none_match
      && $if_none_match == $etag // etag must match
      && $if_modified_since == $cache->created) {  // if-modified-since must match
    header($_SERVER['SERVER_PROTOCOL'] . ' 304 Not Modified');
    backdrop_send_headers($default_headers);
    return;
  }

  // Send the remaining headers.
  foreach ($cache->data['headers'] as $name => $value) {
    backdrop_add_http_header($name, $value);
  }

  $default_headers['Last-Modified'] = gmdate(DATE_RFC1123, $cache->created);

  // HTTP/1.0 proxies does not support the Vary header, so prevent any caching
  // by sending an Expires date in the past. HTTP/1.1 clients ignores the
  // Expires header if a Cache-Control: max-age= directive is specified (see RFC
  // 2616, section 14.9.3).
  $default_headers['Expires'] = 'Sun, 19 Nov 1978 05:00:00 GMT';

  backdrop_send_headers($default_headers);

  // Allow HTTP proxies to cache pages for anonymous users without a session
  // cookie. The Vary header is used to indicates the set of request-header
  // fields that fully determines whether a cache is permitted to use the
  // response to reply to a subsequent request for a given URL without
  // revalidation. If a Vary header has been set in hook_boot(), it is assumed
  // that the module knows how to cache the page.
  if (!isset($hook_boot_headers['vary']) && !settings_get('omit_vary_cookie')) {
    header('Vary: Cookie');
  }

  if ($page_compression) {
    header('Vary: Accept-Encoding', FALSE);
    // If page_compression is enabled, the cache contains gzipped data.
    if ($return_compressed) {
      // $cache->data['body'] is already gzip'ed, so make sure
      // zlib.output_compression does not compress it once more.
      ini_set('zlib.output_compression', '0');
      header('Content-Encoding: gzip');
    }
    else {
      // The client does not support compression, so unzip the data in the
      // cache. Strip the gzip header and run uncompress.
      $page_content = gzinflate(substr(substr($page_content, 10), 0, -8));
    }
  }

  // Send the final headers that indicate the page total length, after the
  // decompression of the gzipped HTML.
  $page_length = strlen($page_content);
  backdrop_set_length_headers($page_length);

  // Print the page. If doing an HTTP HEAD request on some servers like
  // Apache, it will abort PHP immediately once content has been returned
  // (because no additional headers would be allowed after that point). So we
  // print nothing for HEAD requests so that background processing may continue
  // if needed. Note that the content is still saved in the page cache even
  // though it is not printed to the page. See backdrop_page_footer().
  if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') {
    print $page_content;
  }
}

/**
 * Defines the critical hooks that force modules to always be loaded.
 */
function bootstrap_hooks() {
  return array('boot', 'exit', 'watchdog', 'language_init', 'language_negotiation_info', 'language_negotiation_info_alter', 'language_types_info', 'language_types_info_alter');
}

/**
 * Unserializes and appends elements from a serialized string.
 *
 * @param $obj
 *   The object to which the elements are appended.
 * @param $field
 *   The attribute of $obj whose value should be unserialized.
 */
function backdrop_unpack($obj, $field = 'data') {
  if ($obj->$field && $data = unserialize($obj->$field)) {
    foreach ($data as $key => $value) {
      if (!empty($key) && !isset($obj->$key)) {
        $obj->$key = $value;
      }
    }
  }
  return $obj;
}

/**
 * Translates a string to the current language or to a given language.
 *
 * The t() function serves two purposes. First, at run-time it translates
 * user-visible text into the appropriate language. Second, various mechanisms
 * that figure out what text needs to be translated work off t() -- the text
 * inside t() calls is added to the database of strings to be translated.
 * These strings are expected to be in English, so the first argument should
 * always be in English. To enable a fully-translatable site, it is important
 * that all human-readable text that will be displayed on the site or sent to
 * a user is passed through the t() function, or a related function. See the
 * @link http://drupal.org/node/322729 Localization API @endlink pages for
 * more information, including recommendations on how to break up or not
 * break up strings for translation.
 *
 * @section sec_translating_vars Translating Variables
 * You should never use t() to translate variables, such as calling
 * @code t($text); @endcode, unless the text that the variable holds has been
 * passed through t() elsewhere (e.g., $text is one of several translated
 * literal strings in an array). It is especially important never to call
 * @code t($user_text); @endcode, where $user_text is some text that a user
 * entered - doing that can lead to cross-site scripting and other security
 * problems. However, you can use variable substitution in your string, to put
 * variable text such as user names or link URLs into translated text. Variable
 * substitution looks like this:
 * @code
 * $text = t("@name's blog", array('@name' => user_format_name($account)));
 * @endcode
 * Basically, you can put variables like "@name" into your string, and t() will
 * substitute their sanitized values at translation time. (See the
 * Localization API pages referenced above and the documentation of
 * format_string() for details about how to define variables in your string.)
 * Translators can then rearrange the string as necessary for the language
 * (e.g., in Spanish, it might be "blog de @name").
 *
 * @section sec_alt_funcs_install Use During Installation Phase
 * During the Backdrop installation phase, some resources used by t() wil not be
 * available to code that needs localization. See st() and get_t() for
 * alternatives.
 *
 * @param $string
 *   A string containing the English string to translate.
 * @param $args
 *   An associative array of replacements to make. Occurrences in $string of
 *   any key in $args are replaced with the corresponding value, after optional
 *   sanitization and formatting. The type of sanitization and formatting
 *   depends on the first character of the key:
 *   - @variable: Escaped to HTML using check_plain(). Use this as the default
 *     choice for anything displayed on a page on the site.
 *   - %variable: Escaped to HTML and formatted using backdrop_placeholder(),
 *     which makes it display as <em>emphasized</em> text.
 *   - !variable: Inserted as is, with no sanitization or formatting. Only use
 *     this for text that has already been prepared for HTML display (for
 *     example, user-supplied text that has already been run through
 *     check_plain() previously, or is expected to contain some limited HTML
 *     tags and has already been run through filter_xss() previously).
 * @param $options
 *   An associative array of additional options, with the following elements:
 *   - 'langcode' (defaults to the current language): The language code to
 *     translate to a language other than what is used to display the page.
 *   - 'context' (defaults to the empty context): The context the source string
 *     belongs to.
 *
 * @return
 *   The translated string.
 *
 * @see st()
 * @see get_t()
 * @see format_string()
 * @ingroup sanitization
 */
function t($string, array $args = array(), array $options = array()) {
  global $language;

  // Use the advanced backdrop_static() pattern, since this is called very often.
  static $backdrop_static_fast;
  if (!isset($backdrop_static_fast)) {
    $backdrop_static_fast['t'] = &backdrop_static(__FUNCTION__, array());
  }
  $custom_strings = &$backdrop_static_fast['t']['custom_strings'];
  $translate_english = &$backdrop_static_fast['t']['translate_english'];

  // Merge in default.
  if (empty($options['langcode'])) {
    $options['langcode'] = isset($language->langcode) ? $language->langcode : LANGUAGE_SYSTEM;
  }
  if (empty($options['context'])) {
    $options['context'] = '';
  }

  // Locale module may not have been enabled, so we check for NULL value here
  // and statically cache the result for performance.
  if (!isset($translate_english)) {
    try {
      $translate_english = (function_exists('config_get') && config_get('locale.settings', 'translate_english')) ? TRUE : FALSE;
    }
    catch (ConfigException $e) {
      $translate_english = FALSE;
    }
  }

  // First, check for an array of customized strings. If present, use the array
  // *instead of* database lookups. This is a high performance way to provide a
  // handful of string replacements. See settings.php for examples.
  // Cache the $custom_strings variable to improve performance.
  if (!isset($custom_strings[$options['langcode']])) {
    $custom_strings[$options['langcode']] = settings_get('locale_custom_strings_' . $options['langcode'], array());
  }
  // Custom strings work for English too, even if locale module is disabled.
  if (isset($custom_strings[$options['langcode']][$options['context']][$string])) {
    $string = $custom_strings[$options['langcode']][$options['context']][$string];
  }
  // Translate with locale module if enabled.
  elseif ($options['langcode'] != LANGUAGE_SYSTEM && ($options['langcode'] != 'en' || $translate_english) && function_exists('locale')) {
    $string = locale($string, $options['context'], $options['langcode']);
  }
  if (empty($args)) {
    return $string;
  }
  else {
    return format_string($string, $args);
  }
}

/**
 * Formats a string for HTML display by replacing variable placeholders.
 *
 * This function replaces variable placeholders in a string with the requested
 * values and escapes the values so they can be safely displayed as HTML. It
 * should be used on any unknown text that is intended to be printed to an HTML
 * page (especially text that may have come from untrusted users, since in that
 * case it prevents cross-site scripting and other security problems).
 *
 * In most cases, you should use t() rather than calling this function
 * directly, since it will translate the text (on non-English-only sites) in
 * addition to formatting it.
 *
 * @param $string
 *   A string containing placeholders.
 * @param $args
 *   An associative array of replacements to make. Occurrences in $string of
 *   any key in $args are replaced with the corresponding value, after optional
 *   sanitization and formatting. The type of sanitization and formatting
 *   depends on the first character of the key:
 *   - @variable: Escaped to HTML using check_plain(). Use this as the default
 *     choice for anything displayed on a page on the site.
 *   - %variable: Escaped to HTML and formatted using backdrop_placeholder(),
 *     which makes it display as <em>emphasized</em> text.
 *   - !variable: Inserted as is, with no sanitization or formatting. Only use
 *     this for text that has already been prepared for HTML display (for
 *     example, user-supplied text that has already been run through
 *     check_plain() previously, or is expected to contain some limited HTML
 *     tags and has already been run through filter_xss() previously).
 *
 * @return string
 *   The provided string with the replacements made from the $args array.
 *
 * @see t()
 * @ingroup sanitization
 */
function format_string($string, array $args = array()) {
  // Transform arguments before inserting them.
  foreach ($args as $key => $value) {
    switch ($key[0]) {
      case '@':
        // Escaped only.
        $args[$key] = check_plain($value);
        break;

      case '%':
      default:
        // Escaped and placeholder.
        $args[$key] = backdrop_placeholder($value);
        break;

      case '!':
        // Pass-through.
    }
  }
  return strtr($string, $args);
}

/**
 * Encodes special characters in a plain-text string for display as HTML.
 *
 * Also validates strings as UTF-8 to prevent cross site scripting attacks on
 * Internet Explorer 6.
 *
 * @param string $text
 *   The text to be checked or processed.
 *
 * @return string
 *   An HTML safe version of $text. If $text is not valid UTF-8, an empty string
 *   is returned and, on PHP < 5.4, a warning may be issued depending on server
 *   configuration (see @link https://bugs.php.net/bug.php?id=47494 @endlink).
 *
 * @see backdrop_validate_utf8()
 * @ingroup sanitization
 */
function check_plain($text) {
  return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

/**
 * Checks whether a string is valid UTF-8.
 *
 * All functions designed to filter input should use backdrop_validate_utf8
 * to ensure they operate on valid UTF-8 strings to prevent bypass of the
 * filter.
 *
 * When text containing an invalid UTF-8 lead byte (0xC0 - 0xFF) is presented
 * as UTF-8 to Internet Explorer 6, the program may misinterpret subsequent
 * bytes. When these subsequent bytes are HTML control characters such as
 * quotes or angle brackets, parts of the text that were deemed safe by filters
 * end up in locations that are potentially unsafe; An onerror attribute that
 * is outside of a tag, and thus deemed safe by a filter, can be interpreted
 * by the browser as if it were inside the tag.
 *
 * The function does not return FALSE for strings containing character codes
 * above U+10FFFF, even though these are prohibited by RFC 3629.
 *
 * @param $text
 *   The text to check.
 *
 * @return
 *   TRUE if the text is valid UTF-8, FALSE if not.
 */
function backdrop_validate_utf8($text) {
  if (strlen($text) == 0) {
    return TRUE;
  }
  // With the PCRE_UTF8 modifier 'u', preg_match() fails silently on strings
  // containing invalid UTF-8 byte sequences. It does not reject character
  // codes above U+10FFFF (represented by 4 or more octets), though.
  return (preg_match('/^./us', $text) == 1);
}

/**
 * Returns the equivalent of Apache's $_SERVER['REQUEST_URI'] variable.
 *
 * Because $_SERVER['REQUEST_URI'] is only available on Apache, we generate an
 * equivalent using other environment variables.
 */
function request_uri() {
  if (isset($_SERVER['REQUEST_URI'])) {
    $uri = $_SERVER['REQUEST_URI'];
  }
  else {
    if (isset($_SERVER['argv'])) {
      $uri = $_SERVER['SCRIPT_NAME'] . '?' . $_SERVER['argv'][0];
    }
    elseif (isset($_SERVER['QUERY_STRING'])) {
      $uri = $_SERVER['SCRIPT_NAME'] . '?' . $_SERVER['QUERY_STRING'];
    }
    else {
      $uri = $_SERVER['SCRIPT_NAME'];
    }
  }
  // Prevent multiple slashes to avoid cross site requests via the Form API.
  $uri = '/' . ltrim($uri, '/');

  return $uri;
}

/**
 * Logs a deprecation warning.
 *
 * This is a wrapper function for watchdog() to record uses of deprecated
 * functions in Backdrop modules. To prevent an explosion of WATCHDOG_DEPRECATED
 * messages, only the first use of a function in a particular file:line will get
 * a watchdog message.
 *
 * @param $type
 *   The category to which this message belongs.
 * @param $func
 *   The function or method deprecated. Usually, __FUNCTION__ or __METHOD__.
 * @param $link
 *   A link to associate with the message.
 *
 * @see watchdog()
 */
function watchdog_deprecated_function($type, $func, $link = NULL) {
  static $deprecated_calls = array();

  // Return early if not logging deprecation warnings.
  if (!watchdog_severity_enabled(WATCHDOG_DEPRECATED)) {
    return;
  }

  require_once BACKDROP_ROOT . '/core/includes/errors.inc';

  // Get the caller of the deprecated function.
  $trace = debug_backtrace();
  array_shift($trace);
  $caller = _backdrop_get_last_caller($trace);

  $caller_sig = $caller['file'] . ':' . $caller['line'];
  if (array_key_exists($caller_sig, $deprecated_calls)) {
    return;
  }
  $deprecated_calls[$caller_sig] = TRUE;

  // Call watchdog()
  $message = 'The function @original_caller (@file:@line) called deprecated function @function(). It will be removed in the next major release of Backdrop.';
  $variables = array(
    '@function' => $func,
    '@original_caller' => $caller['function'],
    '@file' => basename($caller['file']),
    '@line' => $caller['line'],
  );
  watchdog($type, $message, $variables, WATCHDOG_DEPRECATED, $link);
}

/**
 * Logs an exception.
 *
 * This is a wrapper function for watchdog() which automatically decodes an
 * exception.
 *
 * @param $type
 *   The category to which this message belongs.
 * @param $exception
 *   The exception that is going to be logged.
 * @param $message
 *   The message to store in the log. If empty, a text that contains all useful
 *   information about the passed-in exception is used.
 * @param $variables
 *   Array of variables to replace in the message on display. Defaults to the
 *   return value of _backdrop_decode_exception().
 * @param $severity
 *   The severity of the message, as per RFC 3164.
 * @param $link
 *   A link to associate with the message.
 *
 * @see watchdog()
 * @see _backdrop_decode_exception()
 */
function watchdog_exception($type, Exception $exception, $message = NULL, $variables = array(), $severity = WATCHDOG_ERROR, $link = NULL) {

  // Return early if not logging this severity level.
  if (!watchdog_severity_enabled($severity)) {
    return;
  }

   // Use a default value if $message is not set.
   if (empty($message)) {
     // The exception message is run through check_plain() by _backdrop_decode_exception().
     $message = '%type: !message in %function (line %line of %file).';
   }
   // $variables must be an array so that we can add the exception information.
   if (!is_array($variables)) {
     $variables = array();
   }

   require_once BACKDROP_ROOT . '/core/includes/errors.inc';
   $variables += _backdrop_decode_exception($exception);
   watchdog($type, $message, $variables, $severity, $link);
}

/**
 * Check if logging is enabled for a given severity level.
 *
 * @param int $severity
 *   One of the WATCHDOG_* severity constants.
 *
 * @return TRUE if enabled, FALSE otherwise.
 *
 * @since 1.5.0
 *
 * @see watchdog_severity_levels()
 */
function watchdog_severity_enabled($severity = WATCHDOG_NOTICE) {
  try {
    $enabled_severity_levels = config('system.core')->get('watchdog_enabled_severity_levels');
  }
  catch (Exception $e) {
    $enabled_severity_levels = NULL;
  }

  // This may be called before system.core, such as when running update.php or
  // the initial installation. As such we provide the defaults if needed.
  if (!isset($enabled_severity_levels)) {
    $enabled_severity_levels = array(0, 1, 2, 3, 4, 5, 6);
  }

  // Return TRUE if the severity level is enabled.
  return in_array($severity, $enabled_severity_levels);
}

/**
 * Logs a system message.
 *
 * @param $type
 *   The category to which this message belongs. Can be any string, but the
 *   general practice is to use the name of the module calling watchdog().
 * @param $message
 *   The message to store in the log. Keep $message translatable
 *   by not concatenating dynamic values into it! Variables in the
 *   message should be added by using placeholder strings alongside
 *   the variables argument to declare the value of the placeholders.
 *   See t() for documentation on how $message and $variables interact.
 * @param $variables
 *   Array of variables to replace in the message on display or
 *   NULL if message is already translated or not possible to
 *   translate.
 * @param $severity
 *   The severity of the message; one of the following values as defined in
 *   @link http://www.faqs.org/rfcs/rfc3164.html RFC 3164: @endlink
 *   - WATCHDOG_EMERGENCY: Emergency, system is unusable.
 *   - WATCHDOG_ALERT: Alert, action must be taken immediately.
 *   - WATCHDOG_CRITICAL: Critical conditions.
 *   - WATCHDOG_ERROR: Error conditions.
 *   - WATCHDOG_WARNING: Warning conditions.
 *   - WATCHDOG_NOTICE: (default) Normal but significant conditions.
 *   - WATCHDOG_INFO: Informational messages.
 *   - WATCHDOG_DEBUG: Debug-level messages.
 *   - WATCHDOG_DEPRECATED: Use of deprecated functions or features.
 * @param $link
 *   A link to associate with the message.
 *
 * @see watchdog_severity_levels()
 * @see hook_watchdog()
 */
function watchdog($type, $message, $variables = array(), $severity = WATCHDOG_NOTICE, $link = NULL) {
  global $user, $base_root;

  static $in_error_state = FALSE;

  // Don't log messages if not enabled for this severity level.
  if (!watchdog_severity_enabled($severity)) {
    return;
  }

  // It is possible that the error handling will itself trigger an error. In that case, we could
  // end up in an infinite loop. To avoid that, we implement a simple static semaphore.
  if (!$in_error_state && function_exists('module_implements')) {
    $in_error_state = TRUE;

    // The user object may not exist in all conditions, so 0 is substituted if needed.
    $user_uid = isset($user->uid) ? $user->uid : 0;

    // Prepare the fields to be logged
    $log_entry = array(
      'type'        => $type,
      'message'     => $message,
      'variables'   => $variables,
      'severity'    => $severity,
      'link'        => $link,
      'user'        => $user,
      'uid'         => $user_uid,
      'request_uri' => $base_root . request_uri(),
      'referer'     => isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
      'ip'          => ip_address(),
      // Request time isn't accurate for long processes, use time() instead.
      'timestamp'   => time(),
    );

    // Call the logging hooks to log/process the message
    foreach (module_implements('watchdog') as $module) {
      module_invoke($module, 'watchdog', $log_entry);
    }

    // It is critical that the semaphore is only cleared here, in the parent
    // watchdog() call (not outside the loop), to prevent recursive execution.
    $in_error_state = FALSE;
  }
}

/**
 * Sets a message to display to the user.
 *
 * Messages are stored in a session variable and displayed in page.tpl.php via
 * the $messages theme variable.
 *
 * Example usage:
 * @code
 * backdrop_set_message(t('An error occurred and processing did not complete.'), 'error');
 * @endcode
 *
 * @param string $message
 *   (optional) The translated message to be displayed to the user. For
 *   consistency with other messages, it should begin with a capital letter and
 *   end with a period.
 * @param string $type
 *   (optional) The message's type. Defaults to 'status'. These values are
 *   supported:
 *   - 'status'
 *   - 'warning'
 *   - 'error'
 * @param bool $repeat
 *   (optional) If this is FALSE and the message is already set, then the
 *   message won't be repeated. Defaults to TRUE.
 *
 * @return array|null
 *   A multidimensional array with keys corresponding to the set message types.
 *   The indexed array values of each contain the set messages for that type.
 *   Or, if there are no messages set, the function returns NULL.
 *
 * @see backdrop_get_messages()
 * @see theme_status_messages()
 */
function backdrop_set_message($message = NULL, $type = 'status', $repeat = TRUE) {
  if ($message || $message === '0' || $message === 0) {
    if (!isset($_SESSION['messages'][$type])) {
      $_SESSION['messages'][$type] = array();
    }

    if ($repeat || !in_array($message, $_SESSION['messages'][$type])) {
      $_SESSION['messages'][$type][] = $message;
    }

    // Mark this page as being uncacheable.
    backdrop_page_is_cacheable(FALSE);
  }

  // Messages not set when DB connection fails.
  return isset($_SESSION['messages']) ? $_SESSION['messages'] : NULL;
}

/**
 * Returns all messages that have been set with backdrop_set_message().
 *
 * @param string $type
 *   (optional) Limit the messages returned by type. Defaults to NULL, meaning
 *   all types. These values are supported:
 *   - NULL
 *   - 'status'
 *   - 'warning'
 *   - 'error'
 * @param bool $clear_queue
 *   (optional) If this is TRUE, the queue will be cleared of messages of the
 *   type specified in the $type parameter. Otherwise the queue will be left
 *   intact. Defaults to TRUE.
 *
 * @return array
 *   A multidimensional array with keys corresponding to the set message types.
 *   The indexed array values of each contain the set messages for that type.
 *   The messages returned are limited to the type specified in the $type
 *   parameter. If there are no messages of the specified type, an empty array
 *   is returned.
 *
 * @see backdrop_set_message()
 * @see theme_status_messages()
 */
function backdrop_get_messages($type = NULL, $clear_queue = TRUE) {
  if (backdrop_show_messages() && $messages = backdrop_set_message()) {
    if ($type) {
      if ($clear_queue) {
        unset($_SESSION['messages'][$type]);
      }
      if (isset($messages[$type])) {
        return array($type => $messages[$type]);
      }
    }
    else {
      if ($clear_queue) {
        unset($_SESSION['messages']);
      }
      return $messages;
    }
  }
  return array();
}

/**
 * Determines whether or not messages should be shown on the current page.
 *
 * @param bool $show
 *   Set the show messages flag. If not provided, the current status of the flag
 *   will be returned.
 * @return bool
 *   TRUE if messages should be shown on the current page. FALSE if the messages
 *   should be queued until the next page request.
 */
function backdrop_show_messages($show = NULL) {
  $value = &backdrop_static(__FUNCTION__, TRUE);
  if (isset($show)) {
    $value = $show;
  }
  return $value;
}

/**
 * Gets the title of the current page.
 *
 * The title is displayed on the page and in the title bar.
 *
 * @return
 *   The current page's title.
 */
function backdrop_get_title() {
  $title = backdrop_set_title();

  // During a bootstrap, menu.inc is not included and thus we cannot provide a title.
  if (!isset($title) && function_exists('menu_get_active_title')) {
    $title = check_plain(menu_get_active_title());
  }

  return $title;
}

/**
 * Sets the title of the current page.
 *
 * The title is displayed on the page and in the title bar.
 *
 * @param $title
 *   Optional string value to assign to the page title; or if set to NULL
 *   (default), leaves the current title unchanged.
 * @param $output
 *   Optional flag - normally should be left as CHECK_PLAIN. Only set to
 *   PASS_THROUGH if you have already removed any possibly dangerous code
 *   from $title using a function like check_plain() or filter_xss(). With this
 *   flag the string will be passed through unchanged.
 *
 * @return
 *   The updated title of the current page.
 */
function backdrop_set_title($title = NULL, $output = CHECK_PLAIN) {
  $stored_title = &backdrop_static(__FUNCTION__);

  if (isset($title)) {
    $stored_title = ($output == PASS_THROUGH) ? $title : check_plain($title);
  }

  return $stored_title;
}

/**
 * Returns a URL-safe, base64 encoded string of highly randomized bytes (over the full 8-bit range).
 *
 * @param $byte_count
 *   The number of random bytes to fetch and base64 encode.
 *
 * @return string
 *   The base64 encoded result will have a length of up to 4 * $byte_count.
 */
function backdrop_random_key($byte_count = 32) {
  return backdrop_base64_encode(backdrop_random_bytes($byte_count));
}

/**
 * Returns a URL-safe, base64 encoded version of the supplied string.
 *
 * @param $string
 *   The string to convert to base64.
 *
 * @return string
 */
function backdrop_base64_encode($string) {
  $data = base64_encode($string);
  // Modify the output so it's safe to use in URLs.
  return strtr($data, array('+' => '-', '/' => '_', '=' => ''));
}

/**
 * Returns a string of highly randomized bytes (over the full 8-bit range).
 *
 * This function is better than simply calling mt_rand() or any other built-in
 * PHP function because it can return a long string of bytes (compared to < 4
 * bytes normally from mt_rand()) and uses the best available pseudo-random
 * source.
 *
 * @param $count
 *   The number of characters (bytes) to return in the string.
 *
 * @return string
 *   A string of random characters.
 */
function backdrop_random_bytes($count)  {
  // $random_state does not use backdrop_static as it stores random bytes.
  static $random_state, $bytes, $has_openssl;

  $missing_bytes = $count - strlen($bytes);

  if ($missing_bytes > 0) {
    // PHP versions prior 5.3.4 experienced openssl_random_pseudo_bytes()
    // locking on Windows and rendered it unusable.
    if (!isset($has_openssl)) {
      $has_openssl = version_compare(PHP_VERSION, '5.3.4', '>=') && function_exists('openssl_random_pseudo_bytes');
    }

    // openssl_random_pseudo_bytes() will find entropy in a system-dependent
    // way.
    if ($has_openssl) {
      $bytes .= openssl_random_pseudo_bytes($missing_bytes);
    }

    // Else, read directly from /dev/urandom, which is available on many *nix
    // systems and is considered cryptographically secure.
    elseif ($fh = @fopen('/dev/urandom', 'rb')) {
      // PHP only performs buffered reads, so in reality it will always read
      // at least 4096 bytes. Thus, it costs nothing extra to read and store
      // that much so as to speed any additional invocations.
      $bytes .= fread($fh, max(4096, $missing_bytes));
      fclose($fh);
    }

    // If we couldn't get enough entropy, this simple hash-based PRNG will
    // generate a good set of pseudo-random bytes on any system.
    // Note that it may be important that our $random_state is passed
    // through hash() prior to being rolled into $output, that the two hash()
    // invocations are different, and that the extra input into the first one -
    // the microtime() - is prepended rather than appended. This is to avoid
    // directly leaking $random_state via the $output stream, which could
    // allow for trivial prediction of further "random" numbers.
    if (strlen($bytes) < $count) {
      // Initialize on the first call. The contents of $_SERVER includes a mix of
      // user-specific and system information that varies a little with each page.
      if (!isset($random_state)) {
        $random_state = print_r($_SERVER, TRUE);
        if (function_exists('getmypid')) {
          // Further initialize with the somewhat random PHP process ID.
          $random_state .= getmypid();
        }
        $bytes = '';
      }

      do {
        $random_state = hash('sha256', microtime() . mt_rand() . $random_state);
        $bytes .= hash('sha256', mt_rand() . $random_state, TRUE);
      }
      while (strlen($bytes) < $count);
    }
  }
  $output = substr($bytes, 0, $count);
  $bytes = substr($bytes, $count);
  return $output;
}

/**
 * Calculates a base-64 encoded, URL-safe sha-256 hmac.
 *
 * @param string $data
 *   String to be validated with the hmac.
 * @param string $key
 *   A secret string key.
 *
 * @return string
 *   A base-64 encoded sha-256 hmac, with + replaced with -, / with _ and
 *   any = padding characters removed.
 */
function backdrop_hmac_base64($data, $key) {
  // Casting $data and $key to strings here is necessary to avoid empty string
  // results of the hash function if they are not scalar values. As this
  // function is used in security-critical contexts like token validation it is
  // important that it never returns an empty string.
  $hmac = base64_encode(hash_hmac('sha256', (string) $data, (string) $key, TRUE));
  // Modify the hmac so it's safe to use in URLs.
  return strtr($hmac, array('+' => '-', '/' => '_', '=' => ''));
}

/**
 * Calculates a base-64 encoded, URL-safe sha-256 hash.
 *
 * @param $data
 *   String to be hashed.
 *
 * @return
 *   A base-64 encoded sha-256 hash, with + replaced with -, / with _ and
 *   any = padding characters removed.
 */
function backdrop_hash_base64($data) {
  $hash = base64_encode(hash('sha256', $data, TRUE));
  // Modify the hash so it's safe to use in URLs.
  return strtr($hash, array('+' => '-', '/' => '_', '=' => ''));
}

/**
 * Merges multiple arrays, recursively, and returns the merged array.
 *
 * This function is similar to PHP's array_merge_recursive() function, but it
 * handles non-array values differently. When merging values that are not both
 * arrays, the latter value replaces the former rather than merging with it.
 *
 * Example:
 * @code
 * $link_options_1 = array('fragment' => 'x', 'attributes' => array('title' => t('X'), 'class' => array('a', 'b')));
 * $link_options_2 = array('fragment' => 'y', 'attributes' => array('title' => t('Y'), 'class' => array('c', 'd')));
 *
 * // This results in array('fragment' => array('x', 'y'), 'attributes' => array('title' => array(t('X'), t('Y')), 'class' => array('a', 'b', 'c', 'd'))).
 * $incorrect = array_merge_recursive($link_options_1, $link_options_2);
 *
 * // This results in array('fragment' => 'y', 'attributes' => array('title' => t('Y'), 'class' => array('a', 'b', 'c', 'd'))).
 * $correct = backdrop_array_merge_deep($link_options_1, $link_options_2);
 * @endcode
 *
 * @param ...
 *   Arrays to merge.
 *
 * @return
 *   The merged array.
 *
 * @see backdrop_array_merge_deep_array()
 */
function backdrop_array_merge_deep() {
  return backdrop_array_merge_deep_array(func_get_args());
}

/**
 * Merges multiple arrays, recursively, and returns the merged array.
 *
 * This function is equivalent to backdrop_array_merge_deep(), except the
 * input arrays are passed as a single array parameter rather than a variable
 * parameter list.
 *
 * The following are equivalent:
 * - backdrop_array_merge_deep($a, $b);
 * - backdrop_array_merge_deep_array(array($a, $b));
 *
 * The following are also equivalent:
 * - call_user_func_array('backdrop_array_merge_deep', $arrays_to_merge);
 * - backdrop_array_merge_deep_array($arrays_to_merge);
 *
 * @see backdrop_array_merge_deep()
 */
function backdrop_array_merge_deep_array($arrays) {
  $result = array();

  foreach ($arrays as $array) {
    foreach ($array as $key => $value) {
      // Renumber integer keys as array_merge_recursive() does. Note that PHP
      // automatically converts array keys that are integer strings (e.g., '1')
      // to integers.
      if (is_integer($key)) {
        $result[] = $value;
      }
      // Recurse when both values are arrays.
      elseif (isset($result[$key]) && is_array($result[$key]) && is_array($value)) {
        $result[$key] = backdrop_array_merge_deep_array(array($result[$key], $value));
      }
      // Otherwise, use the latter value, overriding any previous value.
      else {
        $result[$key] = $value;
      }
    }
  }

  return $result;
}

/**
 * Generates a default anonymous $user object.
 *
 * @return User
 *   An anonymous user entity object.
 */
function backdrop_anonymous_user() {
  // Because this is called early in the bootstrap (starting the session) it
  // must not use the autoloader, so it's pulled in manually.
  require_once BACKDROP_ROOT . '/core/includes/anonymous.inc';
  $user = new AnonymousUser(array(
    'hostname' => ip_address(),
  ));
  return $user;
}

/**
 * Ensures Backdrop is bootstrapped to the specified phase.
 *
 * In order to bootstrap Backdrop from another PHP script, you can use this code:
 * @code
 *   define('BACKDROP_ROOT', '/path/to/backdrop');
 *   require_once BACKDROP_ROOT . '/core/includes/bootstrap.inc';
 *   backdrop_bootstrap(BACKDROP_BOOTSTRAP_FULL);
 * @endcode
 *
 * @param int $phase
 *   A constant telling which phase to bootstrap to. When you bootstrap to a
 *   particular phase, all earlier phases are run automatically. Possible
 *   values:
 *   - BACKDROP_BOOTSTRAP_CONFIGURATION: Initializes configuration.
 *   - BACKDROP_BOOTSTRAP_PAGE_CACHE: Tries to serve a cached page.
 *   - BACKDROP_BOOTSTRAP_DATABASE: Initializes the database layer.
 *   - BACKDROP_BOOTSTRAP_LOCK: Initializes the locking system.
 *   - BACKDROP_BOOTSTRAP_VARIABLES: Initializes the variable system.
 *   - BACKDROP_BOOTSTRAP_SESSION: Initializes session handling.
 *   - BACKDROP_BOOTSTRAP_PAGE_HEADER: Sets up the page header.
 *   - BACKDROP_BOOTSTRAP_LANGUAGE: Finds out the language of the page.
 *   - BACKDROP_BOOTSTRAP_FULL: Fully loads Backdrop. Validates and fixes input
 *     data.
 * @param boolean $new_phase
 *   A boolean, set to FALSE if calling backdrop_bootstrap from inside a
 *   function called from backdrop_bootstrap (recursion).
 *
 * @return int
 *   The most recently completed phase.
 *
 * @throws Exception
 *   This function rethrows any exceptions it encounters, unless Backdrop has
 *   not yet been installed, in which case it will redirect to the installer.
 */
function backdrop_bootstrap($phase = NULL, $new_phase = TRUE) {
  // Not backdrop_static(), because does not depend on any run-time information.
  static $phases = array(
    BACKDROP_BOOTSTRAP_CONFIGURATION,
    BACKDROP_BOOTSTRAP_PAGE_CACHE,
    BACKDROP_BOOTSTRAP_DATABASE,
    BACKDROP_BOOTSTRAP_LOCK,
    BACKDROP_BOOTSTRAP_VARIABLES,
    BACKDROP_BOOTSTRAP_SESSION,
    BACKDROP_BOOTSTRAP_PAGE_HEADER,
    BACKDROP_BOOTSTRAP_LANGUAGE,
    BACKDROP_BOOTSTRAP_FULL,
  );
  // Not backdrop_static(), because the only legitimate API to control this is to
  // call backdrop_bootstrap() with a new phase parameter.
  static $final_phase;
  // Not backdrop_static(), because it's impossible to roll back to an earlier
  // bootstrap state.
  static $stored_phase = -1;

  if (isset($phase)) {
    // When not recursing, store the phase name so it's not forgotten while
    // recursing but take care of not going backwards.
    if ($new_phase && $phase >= $stored_phase) {
      $final_phase = $phase;
    }

    // Enter the requested phase if it is after the current phase.
    while ($phases && $phase > $stored_phase && $final_phase > $stored_phase) {
      $current_phase = array_shift($phases);

      // This function is re-entrant. Only update the completed phase when the
      // current call actually resulted in a progress in the bootstrap process.
      if ($current_phase > $stored_phase) {
        $stored_phase = $current_phase;
      }

      try {
        switch ($current_phase) {
          case BACKDROP_BOOTSTRAP_CONFIGURATION:
            _backdrop_bootstrap_configuration();
            break;

          case BACKDROP_BOOTSTRAP_PAGE_CACHE:
            _backdrop_bootstrap_page_cache();
            break;

          case BACKDROP_BOOTSTRAP_DATABASE:
            _backdrop_bootstrap_database();
            break;

          case BACKDROP_BOOTSTRAP_LOCK:
            require_once BACKDROP_ROOT . '/' . settings_get('lock_inc', 'core/includes/lock.inc');
            lock_initialize();
            break;

          case BACKDROP_BOOTSTRAP_VARIABLES:
            _backdrop_bootstrap_variables();
            break;

          case BACKDROP_BOOTSTRAP_SESSION:
            require_once BACKDROP_ROOT . '/' . settings_get('session_inc', 'core/includes/session.inc');
            backdrop_session_initialize();
            break;

          case BACKDROP_BOOTSTRAP_PAGE_HEADER:
            _backdrop_bootstrap_page_header();
            break;

          case BACKDROP_BOOTSTRAP_LANGUAGE:
            backdrop_language_initialize();
            break;

          case BACKDROP_BOOTSTRAP_FULL:
            require_once BACKDROP_ROOT . '/core/includes/common.inc';
            _backdrop_bootstrap_full();
            break;
        }
      }
      catch (Exception $e) {
        // Check if we have a valid installation in the first place.
        if (!backdrop_bootstrap_is_installed()) {
          include_once BACKDROP_ROOT . '/core/includes/install.inc';
          install_goto('core/install.php');
        }

        // If Backdrop is installed correctly, rethrow any exceptions to the
        // front-end. The error will be displayed with _backdrop_log_error().
        throw $e;
      }
    }
  }
  return $stored_phase;
}

/**
 * Verify the installation of Backdrop is correct.
 *
 * This is called when an uncaught exception is thrown during the initial
 * bootstrap process. The most common misconfiguration is pointing Backdrop
 * at an empty database. If this happens, redirect the user to install.php.
 */
function backdrop_bootstrap_is_installed() {
  // We may get a situation where the config directory has been specified in
  // settings.php but the database is empty. In which case a config exception
  // is thrown in the first bootstrap phase but the database hasn't been loaded.
  // Skip to loading the database and try checking if it's empty.
  if (backdrop_get_bootstrap_phase() < BACKDROP_BOOTSTRAP_DATABASE) {
    try {
      _backdrop_bootstrap_database();
      // Getting a connection the first time opens it and populates the
      // $GLOBALS['databases'] variable.
      Database::getConnection('default');
    }
    catch (Exception $e) {}
  }

  if (empty($GLOBALS['databases'])) {
    return FALSE;
  }
  elseif (function_exists('db_query')) {
    try {
      db_query('SELECT name FROM {system} WHERE name = :name', array(':name' => 'system'));
    }
    catch (PDOException $e) {
      // System table not found.
      if ($e->getCode() == '42S02') {
        return FALSE;
      }
    }
  }

  return TRUE;
}

/**
 * Returns the time zone of the current user.
 */
function backdrop_get_user_timezone() {
  global $user;
  $config = config('system.date');

  // If the date config has not yet been set (e.g. upgrading from D7), then use
  // the server default time.
  if ($config->isNew()) {
    return @date_default_timezone_get();
  }
  elseif ($config->get('user_configurable_timezones') && $user->uid && $user->timezone) {
    return $user->timezone;
  }
  else {
    // Ignore PHP strict notice if time zone has not yet been set in the php.ini
    // configuration.
    $config_data_default_timezone = $config->get('default_timezone');
    return !empty($config_data_default_timezone) ? $config_data_default_timezone : @date_default_timezone_get();
  }
}

/**
 * Provides custom PHP error handling.
 *
 * @param $error_level
 *   The level of the error raised.
 * @param $message
 *   The error message.
 * @param $filename
 *   The filename that the error was raised in.
 * @param $line
 *   The line number the error was raised at.
 * @param $context
 *   An array that points to the active symbol table at the point the error
 *   occurred.
 */
function _backdrop_error_handler($error_level, $message, $filename, $line, $context) {
  require_once BACKDROP_ROOT . '/core/includes/errors.inc';
  _backdrop_error_handler_real($error_level, $message, $filename, $line, $context);
}

/**
 * Provides custom PHP exception handling.
 *
 * Uncaught exceptions are those not enclosed in a try/catch block. They are
 * always fatal: the execution of the script will stop as soon as the exception
 * handler exits.
 *
 * @param $exception
 *   The exception object that was thrown.
 */
function _backdrop_exception_handler($exception) {
  require_once BACKDROP_ROOT . '/core/includes/errors.inc';

  try {
    // Log the message to the watchdog and return an error page to the user.
    _backdrop_log_error(_backdrop_decode_exception($exception), TRUE);
  }
  catch (Exception $exception2) {
    // Another uncaught exception was thrown while handling the first one.
    // If we are displaying errors, then do so with no possibility of a further uncaught exception being thrown.
    if (error_displayable()) {
      print '<h1>Additional uncaught exception thrown while handling exception.</h1>';
      print '<h2>Original</h2><p>' . _backdrop_render_exception_safe($exception) . '</p>';
      print '<h2>Additional</h2><p>' . _backdrop_render_exception_safe($exception2) . '</p><hr />';
    }
  }
}

/**
 * Sets up the script environment and loads settings.php.
 */
function _backdrop_bootstrap_configuration() {
  // Set the Backdrop custom error handler.
  set_error_handler('_backdrop_error_handler');
  set_exception_handler('_backdrop_exception_handler');

  backdrop_environment_initialize();
  // Start a page timer:
  timer_start('page');
  // Initialize the configuration, including variables from settings.php.
  backdrop_settings_initialize();

  // Sanitize the destination parameter (which is often used for redirects) to
  // prevent open redirect attacks leading to other domains. Sanitize both
  // $_GET['destination'] and $_REQUEST['destination'] to protect code that
  // relies on either, but do not sanitize $_POST to avoid interfering with
  // unrelated form submissions. The sanitization happens here because
  // url_is_external() requires settings.php variables to be available.
  if (isset($_GET['destination']) || isset($_REQUEST['destination'])) {
    require_once BACKDROP_ROOT . '/core/includes/common.inc';
    // If the destination is an external URL, remove it.
    if (isset($_GET['destination']) && url_is_external($_GET['destination'])) {
      unset($_GET['destination']);
      unset($_REQUEST['destination']);
    }
    // If there's still something in $_REQUEST['destination'] that didn't come
    // from $_GET, check it too.
    if (isset($_REQUEST['destination']) && (!isset($_GET['destination']) || $_REQUEST['destination'] != $_GET['destination']) && url_is_external($_REQUEST['destination'])) {
      unset($_REQUEST['destination']);
    }
  }

  // Load configuration classes and functions.
  require_once BACKDROP_ROOT . '/core/includes/config.inc';

  // Redirect the user to the installation script if Backdrop has not been
  // installed yet (i.e., if no $databases array has been defined in the
  // settings.php file) and we are not already installing.
  if (empty($GLOBALS['databases']) && !backdrop_installation_attempted()) {
    include_once BACKDROP_ROOT . '/core/includes/install.inc';
    install_goto('core/install.php');
  }

  // Check that the config directory is not empty.
  if (!defined('MAINTENANCE_MODE') && ($config_storage = config_get_config_storage('active'))) {
    if (!($config_storage->exists('system.core') || $config_storage->exists('system.performance'))) {
      $directory = config_get_config_directory('active');
      throw new Exception("The configuration directory in settings.php is specified as '$directory', but this directory is either empty or missing crucial files. Check that the \$config_directories variable is correct in settings.php.");
    }
  }
}

/**
 * Attempts to serve a page from the cache.
 */
function _backdrop_bootstrap_page_cache() {
  global $user;

  // Allow specifying special cache handlers in settings.php, like
  // using memcached or files for storing cache information.
  require_once BACKDROP_ROOT . '/core/includes/cache.inc';
  foreach (settings_get('cache_backends', array()) as $include) {
    require_once BACKDROP_ROOT . '/' . $include;
  }

  try {
    $cache_enabled = config_get('system.core', 'cache') ? TRUE : FALSE;
  }
  catch (ConfigException $e) {
    $cache_enabled = FALSE;
  }

  if (!backdrop_page_is_cacheable()) {
    $cache_enabled = FALSE;
  }

  // If there is no session cookie and cache is enabled, serve a cached page.
  if (!isset($_COOKIE[session_name()]) && $cache_enabled) {
    // Make sure there is a user object because its timestamp will be
    // checked, hook_boot might check for anonymous user etc.
    $user = backdrop_anonymous_user();
    // Get the page from the cache.
    $background_fetch_enabled = config_get('system.core', 'page_cache_background_fetch');
    $cache = backdrop_page_get_cache(FALSE, $background_fetch_enabled);
    // If there is a cached page, display it.
    if (is_object($cache)) {
      header('X-Backdrop-Cache: HIT');

      // Although a cached page was found, it may be expired if background
      // fetch is enabled. So we calculate if it is within the max age based
      // on its creation date.
      $lifetime = config_get('system.core', 'page_cache_maximum_age');
      $expires_on = $cache->created + $lifetime;
      $cache_expired = REQUEST_TIME > $expires_on;

      // Start a buffer for hook_boot(), the cached page, and hook_exit().
      ob_start();

      // Calls to hook_boot() on page cache requests is deprecated, though they
      // can still be enabled via settings.php
      if (settings_get('page_cache_invoke_hooks', FALSE)) {
        // Restore the metadata cached with the page for hook_boot().
        $_GET['q'] = $cache->data['path'];
        backdrop_set_title($cache->data['title'], PASS_THROUGH);
        date_default_timezone_set(backdrop_get_user_timezone());

        // Load bootstrap modules.
        require_once BACKDROP_ROOT . '/core/includes/module.inc';
        module_load_all(TRUE);
        bootstrap_invoke_all('boot');
      }

      // Deliver the cached page.
      backdrop_serve_page_from_cache($cache);

      // Like hook_boot(), hook_exit() is no longer called on page cache
      // requests unless enabled via settings.php.
      if (settings_get('page_cache_invoke_hooks', FALSE)) {
        bootstrap_invoke_all('exit');
      };

      // Close the connection immediately if we are about to serve an expired
      // cache entry. This allows for background processing without holding up
      // the browser.
      if ($cache_expired) {
        header('Connection: close');
      }

      // End the request and send the response to the browser. This call has
      // error suppression on it as some PHP versions may require it (PHP 5.3)
      // but other PHP versions throw a warning (PHP 5.5).
      @ob_end_flush();

      // Flushing for PHP-FPM based installations.
      if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
      }
      // Flushing for Apache mod_php installations.
      else {
        flush();
      }

      // Continue processing to generate the new cache entry for the next user.
      if ($cache_expired) {
        // Enter background mode (this suppresses any output of headers).
        backdrop_is_background(TRUE);

        // Restore the current path and page title.
        $_GET['q'] = request_path();
        backdrop_static_reset('backdrop_set_title');
        backdrop_static_reset('backdrop_http_headers');
      }
      // No new cache entry needed. Exit immediately after serving the page.
      else {
        exit();
      }
    }
    else {
      header('X-Backdrop-Cache: MISS');
    }
  }
}

/**
 * Initializes the database system and registers autoload functions.
 */
function _backdrop_bootstrap_database() {
  // The user agent header is used to pass a database prefix in the request when
  // running tests. However, for security reasons, it is imperative that we
  // validate we ourselves made the request.
  if ($test_prefix = backdrop_valid_test_ua()) {
    // Set the test run id for use in other parts of Backdrop.
    $test_info = &$GLOBALS['backdrop_test_info'];
    $test_info['test_run_id'] = $test_prefix;
    $test_info['in_child_site'] = TRUE;

    foreach ($GLOBALS['databases']['default'] as &$value) {
      // Extract the current default database prefix.
      if (!isset($value['prefix'])) {
        $current_prefix = '';
      }
      elseif (is_array($value['prefix'])) {
        $current_prefix = $value['prefix']['default'];
      }
      else {
        $current_prefix = $value['prefix'];
      }

      // Remove the current database prefix and replace it by our own.
      $value['prefix'] = array(
        'default' => $current_prefix . $test_prefix,
      );
    }
  }

  // Initialize the database system. Note that the connection
  // won't be initialized until it is actually requested.
  require_once BACKDROP_ROOT . '/core/includes/database/database.inc';

  // Register autoload functions so that we can access classes and interfaces.
  // The database autoload routine comes first so that we can load the database
  // system without hitting the database. That is especially important during
  // the install or upgrade process.
  spl_autoload_register('backdrop_autoload');
}

/**
 * Loads system variables and all enabled bootstrap modules.
 */
function _backdrop_bootstrap_variables() {
  global $conf;

  // Populate global settings for this test if set. Because state_get() has
  // overhead of locking/unlocking, we use the simpler tempstore_get() function
  // when needing to populate settings in tests.
  if ($test_prefix = backdrop_valid_test_ua() && db_table_exists('tempstore')) {
    include_once BACKDROP_ROOT . '/core/includes/common.inc';
    if ($settings = tempstore_get('simpletest', 'settings')) {
      $GLOBALS['settings'] = array_merge($GLOBALS['settings'], $settings);
    }
  }


  // Load variables from the database, but do not overwrite variables set in settings.php.
  $conf = variable_initialize(isset($conf) ? $conf : array());
}

/**
 * Invokes hook_boot() and sends HTTP headers.
 */
function _backdrop_bootstrap_page_header() {
  // Load all bootstrap modules.
  require_once BACKDROP_ROOT . '/core/includes/module.inc';
  module_load_all(TRUE);

  bootstrap_invoke_all('boot');

  if (!backdrop_is_cli()) {
    ob_start();
    backdrop_page_header();
  }
}

/**
 * Returns the current bootstrap phase for this Backdrop process.
 *
 * The current phase is the one most recently completed by backdrop_bootstrap().
 *
 * @see backdrop_bootstrap()
 */
function backdrop_get_bootstrap_phase() {
  return backdrop_bootstrap(NULL, FALSE);
}

/**
 * Returns the test prefix if this is an internal request from SimpleTest.
 *
 * @return
 *   Either the simpletest prefix (the string "simpletest" followed by any
 *   number of digits) or FALSE if the user agent does not contain a valid
 *   HMAC and timestamp.
 */
function backdrop_valid_test_ua() {
  // No reason to reset this.
  static $test_prefix;

  if (isset($test_prefix)) {
    return $test_prefix;
  }

  if (isset($_SERVER['HTTP_USER_AGENT']) && preg_match("/^(simpletest\d+);(.+);(.+);(.+)$/", $_SERVER['HTTP_USER_AGENT'], $matches)) {
    list(, $prefix, $time, $salt, $hmac) = $matches;
    $check_string =  $prefix . ';' . $time . ';' . $salt;
    // We use the salt from settings.php to make the HMAC key, since
    // the database is not yet initialized and we can't access any Backdrop variables.
    // The file properties add more entropy not easily accessible to others.
    $key = settings_get('hash_salt') . filectime(__FILE__) . fileinode(__FILE__);
    $time_diff = REQUEST_TIME - $time;
    // Since we are making a local request a 5 second time window is allowed,
    // and the HMAC must match.
    if ($time_diff >= 0 && $time_diff <= 5 && $hmac == backdrop_hmac_base64($check_string, $key)) {
      $test_prefix = $prefix;
      return $test_prefix;
    }
  }

  $test_prefix = FALSE;
  return $test_prefix;
}

/**
 * Generates a user agent string with a HMAC and timestamp for simpletest.
 */
function backdrop_generate_test_ua($prefix) {
  static $key;

  if (!isset($key)) {
    // We use the salt from settings.php to make the HMAC key, since
    // the database is not yet initialized and we can't access any Backdrop variables.
    // The file properties add more entropy not easily accessible to others.
    $key = settings_get('hash_salt') . filectime(__FILE__) . fileinode(__FILE__);
  }
  // Generate a moderately secure HMAC based on the database credentials.
  $salt = uniqid('', TRUE);
  $check_string = $prefix . ';' . time() . ';' . $salt;
  return $check_string . ';' . backdrop_hmac_base64($check_string, $key);
}

/**
 * Enables use of the theme system without requiring database access.
 *
 * Loads and initializes the theme system for site installs, updates and when
 * the site is in maintenance mode. This also applies when the database fails.
 *
 * @see _backdrop_maintenance_theme()
 */
function backdrop_maintenance_theme() {
  require_once BACKDROP_ROOT . '/core/includes/theme.maintenance.inc';
  _backdrop_maintenance_theme();
}

/**
 * Returns a simple 404 Not Found page.
 *
 * If fast 404 pages are enabled, and this is a matching page then print a
 * simple 404 page and exit.
 *
 * This function is called from backdrop_deliver_html_page() at the time when a
 * a normal 404 page is generated, but it can also optionally be called directly
 * from settings.php to prevent a Backdrop bootstrap on these pages. See
 * documentation in settings.php for the benefits and drawbacks of using this.
 *
 * Paths to dynamically-generated content, such as image styles, should also be
 * accounted for in this function.
 */
function fast_404() {
  $exclude_paths = settings_get('404_fast_paths_exclude', FALSE);
  if ($exclude_paths && !preg_match($exclude_paths, $_GET['q'])) {
    $fast_paths = settings_get('404_fast_paths', FALSE);
    if ($fast_paths && preg_match($fast_paths, $_GET['q'])) {
      backdrop_add_http_header('Status', '404 Not Found');
      $fast_404_html = settings_get('404_fast_html', '<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>Not Found</h1><p>The requested URL "@path" was not found on this server.</p></body></html>');
      // Replace @path in the variable with the page path.
      print strtr($fast_404_html, array('@path' => check_plain(request_uri())));
      exit;
    }
  }
}

/**
 * Returns TRUE if a Backdrop installation is currently being attempted.
 */
function backdrop_installation_attempted() {
  return defined('MAINTENANCE_MODE') && MAINTENANCE_MODE == 'install';
}

/**
 * Returns the name of the proper localization function.
 *
 * get_t() exists to support localization for code that might run during
 * the installation phase, when some elements of the system might not have
 * loaded.
 *
 * This would include implementations of hook_install(), which could run
 * during the Backdrop installation phase, and might also be run during
 * non-installation time, such as while installing the module from the
 * module administration page.
 *
 * Example usage:
 * @code
 *   $t = get_t();
 *   $translated = $t('translate this');
 * @endcode
 *
 * Use t() if your code will never run during the Backdrop installation phase.
 * Use st() if your code will only run during installation and never any other
 * time. Use get_t() if your code could run in either circumstance.
 *
 * @see t()
 * @see st()
 * @ingroup sanitization
 */
function get_t() {
  static $t;
  // This is not converted to backdrop_static because there is no point in
  // resetting this as it can not change in the course of a request.
  if (!isset($t)) {
    $t = backdrop_installation_attempted() ? 'st' : 't';
  }
  return $t;
}

/**
 * Initializes all the defined language types.
 */
function backdrop_language_initialize() {

  // Ensure the language is correctly returned, even without multilanguage
  // support. Also make sure we have a $language fallback, in case a language
  // negotiation callback needs to do a full bootstrap.
  // Useful for eg. XML/HTML 'lang' attributes.
  $default = language_default();
  $default_types = language_types_get_default();
  foreach ($default_types as $type_name => $configurable) {
    $GLOBALS[$type_name] = $default;
  }

  if (language_multilingual()) {
    include_once BACKDROP_ROOT . '/core/includes/language.inc';
    $types = language_types_info();
    foreach ($types as $type_name => $type_info) {
      $GLOBALS[$type_name] = language_types_initialize($type_name);
    }
    // Allow modules to react on language system initialization in multilingual
    // environments.
    bootstrap_invoke_all('language_init');
  }
}

/**
 * Returns a list of the built-in language types.
 *
 * @return
 *   An array of key-values pairs where the key is the language type name and
 *   the value is its configurability (TRUE/FALSE).
 */
function language_types_get_default() {
  return array(
    LANGUAGE_TYPE_INTERFACE => TRUE,
    LANGUAGE_TYPE_CONTENT => FALSE,
    LANGUAGE_TYPE_URL => FALSE,
  );
}

/**
 * Returns TRUE if there is more than one language enabled.
 *
 * @return
 *   TRUE if more than one language is enabled.
 */
function language_multilingual() {
  // The "language_count" variable stores the number of enabled languages to
  // avoid unnecessarily loading the language config on monolingual sites.
  try {
    $multilingual = config_get('system.core', 'language_count') > 1;
  }
  catch (ConfigException $e) {
    $multilingual = FALSE;
  }
  return $multilingual;
}

/**
 * Returns a list of configured languages.
 *
 * @param $only_enabled
 *   (optional) Whether to return only enabled languages.
 * @param $option_list
 *   (optional) Whether to return a list of options instead of objects. This
 *   list is suitable for use in a select list #options array.
 *
 * @return stdClass[]
 *   An associative array of languages, keyed by the language code, ordered by
 *   weight ascending and name ascending.
 */
function language_list($only_enabled = FALSE, $option_list = FALSE) {
  $languages = &backdrop_static(__FUNCTION__);
  // Initialize master language list.
  if (!isset($languages)) {
    // Initialize local language list caches.
    $languages = array('all' => array(), 'enabled' => array());

    // Fill in master language list based on current configuration. This may be
    // in the event of an early bootstrap error, so fallback to defaults.
    try {
      $default_langcode = config_get('system.core', 'language_default');
      $config_languages = config_get('language.settings', 'languages');
    }
    catch (ConfigException $e) {
      $default_langcode = 'en';
      $config_languages = array();
    }

    if ($config_languages) {
      foreach ($config_languages as $langcode => $language) {
        $language += array(
          'enabled' => TRUE,
          'weight' => 0,
        );
        $languages['all'][$langcode] = (object) $language;
      }
    }
    // No languages available, so only English is supported.
    else {
      $default_langcode = 'en';
      $languages['all']['en'] = (object) array(
        'langcode' => 'en',
        'name' => 'English',
        'direction' => 0,
        'enabled' => TRUE,
        'weight' => 0,
        'default' => TRUE,
      );
    }

    // Initialize default property so callers have an easy reference and can
    // save the same object without data loss. Also fill in the filtered list
    // of enabled languages only.
    foreach ($languages['all'] as $langcode => $language) {
      $languages['all'][$langcode]->default = ($langcode == $default_langcode);
      if ($language->enabled) {
        $languages['enabled'][$langcode] = $languages['all'][$langcode];
      }
    }
  }

  if ($option_list) {
    $list = array();
    $this_list = $only_enabled ? $languages['enabled'] : $languages['all'];
    foreach ($this_list as $language) {
      $list[$language->langcode] = $language->name;
    }
    return $list;
  }

  return $only_enabled ? $languages['enabled'] : $languages['all'];
}

/**
 * Loads a language object from the database.
 *
 * @param $langcode
 *   The language code.
 *
 * @return stdClass
 *   A fully-populated language object or FALSE.
 */
function language_load($langcode) {
  $languages = language_list();
  return isset($languages[$langcode]) ? $languages[$langcode] : FALSE;
}

/**
 * Produced the printed name for a language for display.
 *
 * @param $langcode
 *   The language code.
 *
 * @return
 *   The printed name of the language.
 */
function language_name($langcode) {
  if ($langcode == LANGUAGE_NONE) {
    return t('None');
  }

  if ($language = language_load($langcode)) {
    return $language->name;
  }

  return t('Unknown (@langcode)', array('@langcode' => $langcode));
}

/**
 * Returns the default language used on the site.
 *
 * @return
 *   A language object.
 */
function language_default() {
  $default = &backdrop_static(__FUNCTION__);

  if (!isset($default)) {
    try {
      $default_langcode = config_get('system.core', 'language_default');
    }
    catch (ConfigException $e) {}
    if (empty($default_langcode)) {
      $default_langcode = 'en';
    }

    if ($default_langcode !== 'en') {
      $languages = language_list();
      if (isset($languages[$default_langcode])) {
        $default = $languages[$default_langcode];
      }
      else {
        $default = (object) array(
          'langcode' => $default_langcode,
          'name' => 'Default',
          'direction' => 0,
          'enabled' => TRUE,
          'weight' => 0,
        );
      }
    }
    else {
      $default = (object) array(
        'langcode' => 'en',
        'name' => 'English',
        'direction' => 0,
        'enabled' => TRUE,
        'weight' => 0,
      );
    }
    $default->default = TRUE;
  }

  return $default;
}

/**
 * Returns the requested URL path of the page being viewed.
 *
 * Examples:
 * - http://example.com/node/306 returns "node/306".
 * - http://example.com/backdropfolder/node/306 returns "node/306" while
 *   base_path() returns "/backdropfolder/".
 * - http://example.com/path/alias (which is a path alias for node/306) returns
 *   "path/alias" as opposed to the internal path.
 * - http://example.com/index.php returns an empty string (meaning: front page).
 * - http://example.com/index.php?page=1 returns an empty string.
 *
 * @return
 *   The requested Backdrop URL path.
 *
 * @see current_path()
 */
function request_path() {
  static $path;

  if (isset($path)) {
    return $path;
  }

  if (isset($_GET['q']) && is_string($_GET['q'])) {
    // This is a request with a ?q=foo/bar query string. $_GET['q'] is
    // overwritten in backdrop_path_initialize(), but request_path() is called
    // very early in the bootstrap process, so the original value is saved in
    // $path and returned in later calls.
    $path = $_GET['q'];
  }
  elseif (isset($_SERVER['REQUEST_URI'])) {
    // This request is either a clean URL, or 'index.php', or nonsense.
    // Extract the path from REQUEST_URI.
    $request_path = strtok($_SERVER['REQUEST_URI'], '?');
    $base_path_len = strlen(rtrim(dirname($_SERVER['SCRIPT_NAME']), '\/'));
    // Unescape and strip $base_path prefix, leaving q without a leading slash.
    $path = substr(urldecode($request_path), $base_path_len + 1);
    // If the path equals the script filename, either because 'index.php' was
    // explicitly provided in the URL, or because the server added it to
    // $_SERVER['REQUEST_URI'] even when it wasn't provided in the URL (some
    // versions of Microsoft IIS do this), the front page should be served.
    if ($path == basename($_SERVER['PHP_SELF'])) {
      $path = '';
    }
  }
  else {
    // This is the front page.
    $path = '';
  }

  // Under certain conditions Apache's RewriteRule directive prepends the value
  // assigned to $_GET['q'] with a slash. Moreover we can always have a trailing
  // slash in place, hence we need to normalize $_GET['q'].
  $path = trim($path, '/');

  return $path;
}

/**
 * Returns a component of the current Backdrop path.
 *
 * When viewing a page at the path "admin/structure/types", for example, arg(0)
 * returns "admin", arg(1) returns "structure", and arg(2) returns "types".
 *
 * Avoid use of this function where possible, as resulting code is hard to
 * read. In menu callback functions, attempt to use named arguments. See the
 * explanation in menu.inc for how to construct callbacks that take arguments.
 * When attempting to use this function to load an element from the current
 * path, e.g. loading the node on a node page, use menu_get_object() instead.
 *
 * @param $index
 *   The index of the component, where each component is separated by a '/'
 *   (forward-slash), and where the first component has an index of 0 (zero).
 * @param $path
 *   A path to break into components. Defaults to the path of the current page.
 *
 * @return string|NULL
 *   The component specified by $index, or NULL if the specified component was
 *   not found. If called without arguments, it returns an array containing all
 *   the components of the current path.
 */
function arg($index = NULL, $path = NULL) {
  // Even though $arguments doesn't need to be resettable for any functional
  // reasons (the result of explode() does not depend on any run-time
  // information), it should be resettable anyway in case a module needs to
  // free up the memory used by it.
  // Use the advanced backdrop_static() pattern, since this is called very often.
  static $backdrop_static_fast;
  if (!isset($backdrop_static_fast)) {
    $backdrop_static_fast['arguments'] = &backdrop_static(__FUNCTION__);
  }
  $arguments = &$backdrop_static_fast['arguments'];

  if (!isset($path)) {
    $path = $_GET['q'];
  }
  if (!isset($arguments[$path])) {
    $arguments[$path] = explode('/', $path);
  }
  if (!isset($index)) {
    return $arguments[$path];
  }
  if (isset($arguments[$path][$index])) {
    return $arguments[$path][$index];
  }
  // Not found.
  return NULL;
}

/**
 * Returns the IP address of the client machine.
 *
 * If Backdrop is behind a reverse proxy, we use the X-Forwarded-For header
 * instead of $_SERVER['REMOTE_ADDR'], which would be the IP address of
 * the proxy server, and not the client's. The actual header name can be
 * configured by the reverse_proxy_header variable.
 *
 * @return
 *   IP address of client machine, adjusted for reverse proxy and/or cluster
 *   environments.
 */
function ip_address() {
  $ip_address = &backdrop_static(__FUNCTION__);

  if (!isset($ip_address)) {
    $ip_address = $_SERVER['REMOTE_ADDR'];

    if (settings_get('reverse_proxy', 0)) {
      $reverse_proxy_header = settings_get('reverse_proxy_header', 'HTTP_X_FORWARDED_FOR');
      if (!empty($_SERVER[$reverse_proxy_header])) {
        // If an array of known reverse proxy IPs is provided, then trust
        // the XFF header if request really comes from one of them.
        $reverse_proxy_addresses = settings_get('reverse_proxy_addresses', array());

        // Turn XFF header into an array.
        $forwarded = explode(',', $_SERVER[$reverse_proxy_header]);

        // Trim the forwarded IPs; they may have been delimited by commas and spaces.
        $forwarded = array_map('trim', $forwarded);

        // Tack direct client IP onto end of forwarded array.
        $forwarded[] = $ip_address;

        // Eliminate all trusted IPs.
        $untrusted = array_diff($forwarded, $reverse_proxy_addresses);

        // The right-most IP is the most specific we can trust.
        $ip_address = array_pop($untrusted);
      }
    }
  }

  return $ip_address;
}

/**
 * @addtogroup schemaapi
 * @{
 */

/**
 * Gets the schema definition of a table, or the whole database schema.
 *
 * The returned schema will include any modifications made by any
 * module that implements hook_schema_alter(). To get the schema without
 * modifications, use backdrop_get_schema_unprocessed().
 *
 *
 * @param $table
 *   The name of the table. If not given, the schema of all tables is returned.
 * @param $rebuild
 *   If true, the schema will be rebuilt instead of retrieved from the cache.
 *
 * @return array
 *   The schema definition of the requested table.
 */
function backdrop_get_schema($table = NULL, $rebuild = FALSE) {
  static $schema;

  if ($rebuild || !isset($table)) {
    $schema = backdrop_get_complete_schema($rebuild);
  }
  elseif (!isset($schema)) {
    $schema = new SchemaCache();
  }

  if (!isset($table)) {
    return $schema;
  }
  if (isset($schema[$table])) {
    return $schema[$table];
  }
  else {
    return FALSE;
  }
}

/**
 * Extends BackdropCacheArray to allow for dynamic building of the schema cache.
 */
class SchemaCache extends BackdropCacheArray {

  /**
   * Constructs a SchemaCache object.
   */
  public function __construct() {
    // Cache by request method.
    parent::__construct('schema:runtime:' . ($_SERVER['REQUEST_METHOD'] == 'GET'), 'cache');
  }

  /**
   * Overrides BackdropCacheArray::resolveCacheMiss().
   */
  protected function resolveCacheMiss($offset) {
    $complete_schema = backdrop_get_complete_schema();
    $value = isset($complete_schema[$offset]) ? $complete_schema[$offset] :  NULL;
    $this->storage[$offset] = $value;
    $this->persist($offset);
    return $value;
  }
}

/**
 * Gets the whole database schema.
 *
 * The returned schema will include any modifications made by any
 * module that implements hook_schema_alter().
 *
 * @param $rebuild
 *   If true, the schema will be rebuilt instead of retrieved from the cache.
 *
 * @return array
 *   The entire database schema provided by all modules.
 */
function backdrop_get_complete_schema($rebuild = FALSE) {
  static $schema = array();

  if (empty($schema) || $rebuild) {
    // Try to load the schema from cache.
    if (!$rebuild && $cached = cache()->get('schema')) {
      $schema = $cached->data;
    }
    // Otherwise, rebuild the schema cache.
    else {
      $schema = array();
      // Load the .install files to get hook_schema.
      // On some databases this function may be called before bootstrap has
      // been completed, so we force the functions we need to load just in case.
      if (function_exists('module_load_all_includes')) {
        // This function can be called very early in the bootstrap process, so
        // we force the module_list() cache to be refreshed to ensure that it
        // contains the complete list of modules before we go on to call
        // module_load_all_includes().
        module_list(TRUE);
        module_load_all_includes('install');
      }

      require_once BACKDROP_ROOT . '/core/includes/common.inc';
      // Invoke hook_schema for all modules.
      foreach (module_implements('schema') as $module) {
        // Cast the result of hook_schema() to an array, as a NULL return value
        // would cause array_merge() to set the $schema variable to NULL as well.
        // That would break modules which use $schema further down the line.
        $current = (array) module_invoke($module, 'schema');
        // Set 'module' and 'name' keys for each table, and remove descriptions,
        // as they needlessly slow down cache()->get() for every single request.
        _backdrop_schema_initialize($current, $module);
        $schema = array_merge($schema, $current);
      }

      backdrop_alter('schema', $schema);
      // If the schema is empty, avoid saving it: some database engines require
      // the schema to perform queries, and this could lead to infinite loops.
      if (!empty($schema) && (backdrop_get_bootstrap_phase() == BACKDROP_BOOTSTRAP_FULL)) {
        cache()->set('schema', $schema);
      }
      if ($rebuild) {
        cache()->deletePrefix('schema:');
      }
    }
  }

  return $schema;
}

/**
 * @} End of "addtogroup schemaapi".
 */

/**
 * Confirms that a class is available.
 *
 * This function is rarely called directly. Instead, it is registered as an
 * spl_autoload_function() handler, and PHP calls it for us when necessary.
 *
 * @param $class
 *   The name of the class to check or load.
 *
 * @return
 *   TRUE if the class is currently available, FALSE otherwise.
 */
function backdrop_autoload($class) {
  $class_registry = &backdrop_static(__FUNCTION__, NULL);

  if (!isset($class_registry)) {
    include_once BACKDROP_ROOT . '/core/includes/bootstrap.classes.inc';
    $class_registry = backdrop_class_list();
    // Loop through all modules to build the list of classes. We avoid
    // module_invoke_all() because it uses array_merge_recursive(), which is an
    // expensive O(n^2) operation. Instead we use module_implements() and merge
    // the array manually, which is O(n).
    foreach (module_implements('autoload_info') as $module) {
      $module_classes = module_invoke($module, 'autoload_info');
      $module_path = backdrop_get_path('module', $module);
      foreach ($module_classes as $module_class => $relative_path) {
        $class_registry[$module_class] = BACKDROP_ROOT . '/' . $module_path . '/' . $relative_path;
      }
    }
    backdrop_alter('autoload_info', $class_registry);
  }

  if (isset($class_registry[$class])) {
    require_once $class_registry[$class];
    return TRUE;
  }
  else {
    return FALSE;
  }
}

/**
 * Provides central static variable storage.
 *
 * All functions requiring a static variable to persist or cache data within
 * a single page request are encouraged to use this function unless it is
 * absolutely certain that the static variable will not need to be reset during
 * the page request. By centralizing static variable storage through this
 * function, other functions can rely on a consistent API for resetting any
 * other function's static variables.
 *
 * Example:
 * @code
 * function example_list($field = 'default') {
 *   $examples = &backdrop_static(__FUNCTION__);
 *   if (!isset($examples)) {
 *     // If this function is being called for the first time after a reset,
 *     // query the database and execute any other code needed to retrieve
 *     // information.
 *     ...
 *   }
 *   if (!isset($examples[$field])) {
 *     // If this function is being called for the first time for a particular
 *     // index field, then execute code needed to index the information already
 *     // available in $examples by the desired field.
 *     ...
 *   }
 *   // Subsequent invocations of this function for a particular index field
 *   // skip the above two code blocks and quickly return the already indexed
 *   // information.
 *   return $examples[$field];
 * }
 * function examples_admin_overview() {
 *   // When building the content for the overview page, make sure to get
 *   // completely fresh information.
 *   backdrop_static_reset('example_list');
 *   ...
 * }
 * @endcode
 *
 * In a few cases, a function can have certainty that there is no legitimate
 * use-case for resetting that function's static variable. This is rare,
 * because when writing a function, it's hard to forecast all the situations in
 * which it will be used. A guideline is that if a function's static variable
 * does not depend on any information outside of the function that might change
 * during a single page request, then it's ok to use the "static" keyword
 * instead of the backdrop_static() function.
 *
 * Example:
 * @code
 * function actions_execute(...) {
 *   // $stack tracks the number of recursive calls.
 *   static $stack;
 *   $stack++;
 *   if ($stack > config_get('system.core', 'action_recursion_limit', 35)) {
 *     ...
 *     return;
 *   }
 *   ...
 *   $stack--;
 * }
 * @endcode
 *
 * In a few cases, a function needs a resettable static variable, but the
 * function is called many times (100+) during a single page request, so
 * every microsecond of execution time that can be removed from the function
 * counts. These functions can use a more cumbersome, but faster variant of
 * calling backdrop_static(). It works by storing the reference returned by
 * backdrop_static() in the calling function's own static variable, thereby
 * removing the need to call backdrop_static() for each iteration of the function.
 * Conceptually, it replaces:
 * @code
 * $foo = &backdrop_static(__FUNCTION__);
 * @endcode
 * with:
 * @code
 * // Unfortunately, this does not work.
 * static $foo = &backdrop_static(__FUNCTION__);
 * @endcode
 * However, the above line of code does not work, because PHP only allows static
 * variables to be initializied by literal values, and does not allow static
 * variables to be assigned to references.
 * - http://php.net/manual/language.variables.scope.php#language.variables.scope.static
 * - http://php.net/manual/language.variables.scope.php#language.variables.scope.references
 * The example below shows the syntax needed to work around both limitations.
 * For benchmarks and more information, see http://drupal.org/node/619666.
 *
 * Example:
 * @code
 * function user_access($string, $account = NULL) {
 *   // Use the advanced backdrop_static() pattern, since this is called very often.
 *   static $backdrop_static_fast;
 *   if (!isset($backdrop_static_fast)) {
 *     $backdrop_static_fast['perm'] = &backdrop_static(__FUNCTION__);
 *   }
 *   $perm = &$backdrop_static_fast['perm'];
 *   ...
 * }
 * @endcode
 *
 * @param $name
 *   Globally unique name for the variable. For a function with only one static,
 *   variable, the function name (e.g. via the PHP magic __FUNCTION__ constant)
 *   is recommended. For a function with multiple static variables add a
 *   distinguishing suffix to the function name for each one.
 * @param $default_value
 *   Optional default value.
 * @param $reset
 *   TRUE to reset one or all variables(s). This parameter is only used
 *   internally and shouldn't be passed in; use backdrop_static_reset() instead.
 *   (This function's return value should not be used when TRUE is passed in.)
 *
 * @return
 *   Returns a variable by reference.
 *
 * @see backdrop_static_reset()
 */
function &backdrop_static($name, $default_value = NULL, $reset = FALSE) {
  static $data = array(), $default = array();
  // First check if dealing with a previously defined static variable.
  if (isset($data[$name]) || array_key_exists($name, $data)) {
    // Non-NULL $name and both $data[$name] and $default[$name] statics exist.
    if ($reset) {
      // Reset pre-existing static variable to its default value.
      $data[$name] = $default[$name];
    }
    return $data[$name];
  }
  // Neither $data[$name] nor $default[$name] static variables exist.
  if (isset($name)) {
    if ($reset) {
      // Reset was called before a default is set and yet a variable must be
      // returned.
      return $data;
    }
    // First call with new non-NULL $name. Initialize a new static variable.
    $default[$name] = $data[$name] = $default_value;
    return $data[$name];
  }
  // Reset all: ($name == NULL). This needs to be done one at a time so that
  // references returned by earlier invocations of backdrop_static() also get
  // reset.
  foreach ($default as $name => $value) {
    $data[$name] = $value;
  }
  // As the function returns a reference, the return should always be a
  // variable.
  return $data;
}

/**
 * Resets one or all centrally stored static variable(s).
 *
 * @param $name
 *   Name of the static variable to reset. Omit to reset all variables.
 *   Resetting all variables should only be used, for example, for running unit
 *   tests with a clean environment.
 */
function backdrop_static_reset($name = NULL) {
  backdrop_static($name, NULL, TRUE);
}

/**
 * Detects whether the current script is running in a command-line environment.
 */
function backdrop_is_cli() {
  return (!isset($_SERVER['SERVER_SOFTWARE']) && (php_sapi_name() == 'cli' || (is_numeric($_SERVER['argc']) && $_SERVER['argc'] > 0)));
}

/**
 * Detects if this is an HTML HTTP request.
 *
 * This liberal detection considers all requests that lack an Accept header or
 * X-Requested-With (as set by jQuery and other JavaScript libraries) to be
 * an HTML request. Any other types of requests must specify X-Requested-With
 * in order to be returned in an alternative format.
 */
function backdrop_is_html() {
  return empty($_SERVER['HTTP_ACCEPT']) || strpos($_SERVER['HTTP_ACCEPT'], 'text/html') === 0 || empty($_SERVER['HTTP_X_REQUESTED_WITH']);
}

/**
 * Detects if this is an AJAX HTTP request.
 */
function backdrop_is_ajax() {
  return !empty($_POST) && !empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/vnd.backdrop-ajax') === 0;
}

/**
 * Detects if this is a dialog HTTP request.
 */
function backdrop_is_dialog() {
  return !empty($_POST) && !empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/vnd.backdrop-dialog') === 0;
}

/**
 * Stores if Backdrop is currently being executed in the background.
 *
 * If Backdrop has entered into background mode, it can no longer print anything
 * to the page, because the response has already been returned to the browser.
 * Anything that has been output while in background mode will simply be
 * silently discarded. Background mode is extremely useful for doing processing
 * that doesn't require output, such as cron job execution or creating cache
 * entries.
 *
 * Backdrop core uses background mode in two ways:
 *   - After generating a page (logged-in or anonymous) if cron has not run
 *     recently, the page will be returned to the user, and Backdrop will enter
 *     background mode to process the cron jobs.
 *   - If the page cache is turned on, and the "Use background fetch" option is
 *     turned on in the performance settings, then Backdrop will serve a cached
 *     page even after it has expired. After serving the cached page, Backdrop
 *     will enter background mode to generate a new cache entry for the page,
 *     which will be delivered to the next user.
 *
 * @param bool $is_background
 *   May be set to TRUE to indicate entering background mode. Once set, it can
 *   not be set back to FALSE.
 *
 * @return bool
 *   TRUE if the request is in background mode. FALSE if in a normal page
 *   request and output has not yet started.
 */
function backdrop_is_background($is_background = NULL) {
  static $static = FALSE;
  if (isset($is_background) && $is_background === TRUE) {
    $static = $is_background;
  }
  return $static;
}

/**
 * Formats text for emphasized display in a placeholder inside a sentence.
 *
 * Used automatically by format_string().
 *
 * @param $text
 *   The text to format (plain-text).
 *
 * @return
 *   The formatted text (html).
 */
function backdrop_placeholder($text) {
  return '<em class="placeholder">' . check_plain($text) . '</em>';
}

/**
 * Registers a function for execution on shutdown.
 *
 * Wrapper for register_shutdown_function() that catches thrown exceptions to
 * avoid "Exception thrown without a stack frame in Unknown".
 *
 * @param $callback
 *   The shutdown function to register.
 * @param ...
 *   Additional arguments to pass to the shutdown function.
 *
 * @return
 *   Array of shutdown functions to be executed.
 *
 * @see register_shutdown_function()
 * @ingroup php_wrappers
 */
function &backdrop_register_shutdown_function($callback = NULL) {
  // We cannot use backdrop_static() here because the static cache is reset during
  // batch processing, which breaks batch handling.
  static $callbacks = array();

  if (isset($callback)) {
    // Only register the internal shutdown function once.
    if (empty($callbacks)) {
      register_shutdown_function('_backdrop_shutdown_function');
    }
    $args = func_get_args();
    array_shift($args);
    // Save callback and arguments
    $callbacks[] = array('callback' => $callback, 'arguments' => $args);
  }
  return $callbacks;
}

/**
 * Executes registered shutdown functions.
 */
function _backdrop_shutdown_function() {
  $callbacks = &backdrop_register_shutdown_function();

  // Set the CWD to BACKDROP_ROOT as it is not guaranteed to be the same as it
  // was in the normal context of execution.
  chdir(BACKDROP_ROOT);

  try {
    while (list($key, $callback) = each($callbacks)) {
      call_user_func_array($callback['callback'], $callback['arguments']);
    }
  }
  catch (Exception $exception) {
    // If we are displaying errors, then do so with no possibility of a further
    // uncaught exception being thrown.
    require_once BACKDROP_ROOT . '/core/includes/errors.inc';
    $message = '';
    $message .= '<h1>Uncaught exception thrown in shutdown function.</h1>';
    $message .= '<p>' . _backdrop_render_exception_safe($exception) . '</p><hr />';
    try {
      watchdog('system', $message, array(), WATCHDOG_CRITICAL);
    }
    catch (Exception $e) {}
  }
}

/**
 * Compares the memory required for an operation to the available memory.
 *
 * @param $required
 *   The memory required for the operation, expressed as a number of bytes with
 *   optional SI or IEC binary unit prefix (e.g. 2, 3K, 5MB, 10G, 6GiB, 8bytes,
 *   9mbytes).
 * @param $memory_limit
 *   (optional) The memory limit for the operation, expressed as a number of
 *   bytes with optional SI or IEC binary unit prefix (e.g. 2, 3K, 5MB, 10G,
 *   6GiB, 8bytes, 9mbytes). If no value is passed, the current PHP
 *   memory_limit will be used. Defaults to NULL.
 *
 * @return
 *   TRUE if there is sufficient memory to allow the operation, or FALSE
 *   otherwise.
 */
function backdrop_check_memory_limit($required, $memory_limit = NULL) {
  if (!isset($memory_limit)) {
    $memory_limit = ini_get('memory_limit');
  }

  // There is sufficient memory if:
  // - No memory limit is set.
  // - The memory limit is set to unlimited (-1).
  // - The memory limit is greater than the memory required for the operation.
  return ((!$memory_limit) || ($memory_limit == -1) || (parse_size($memory_limit) >= parse_size($required)));
}

/**
 * Invalidates a PHP file from any active opcode caches.
 *
 * If the opcode cache does not support the invalidation of individual files,
 * the entire cache will be flushed.
 *
 * @param string $filepath
 *   The absolute path of the PHP file to invalidate.
 */
function backdrop_clear_opcode_cache($filepath) {
  clearstatcache(TRUE, $filepath);

  // Zend OPcache.
  if (function_exists('opcache_invalidate')) {
    opcache_invalidate($filepath, TRUE);
  }
  // APC.
  if (function_exists('apc_delete_file')) {
    // apc_delete_file() throws a PHP warning in case the specified file was
    // not compiled yet.
    // @see http://php.net/apc-delete-file
    @apc_delete_file($filepath);
  }
}
