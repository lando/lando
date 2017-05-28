<?php
/**
 * @file
 * Main Backdrop CMS configuration file.
 */

/**
 * Database configuration:
 *
 * Most sites can configure their database by entering the connection string
 * below. If using master/slave databases or multiple connections, see the
 * advanced database documentation at
 * https://api.backdropcms.org/database-configuration
 */

/**
 * Site configuration files location.
 *
 * By default these directories are stored within the files directory with a
 * hashed path. For the best security, these directories should be in a location
 * that is not publicly accessible through a web browser.
 *
 * Example using directories one parent level up:
 * @code
 * $config_directories['active'] = '../config/active';
 * $config_directories['staging'] = '../config/staging';
 * @endcode
 *
 * Example using absolute paths:
 * @code
 * $config_directories['active'] = '/home/myusername/config/active';
 * $config_directories['staging'] = '/home/myusername/config/staging';
 * @endcode
 */
$config_directories['active'] = 'files/config_842dd5fc6758f6c5a067454962129a69/active';
$config_directories['staging'] = 'files/config_842dd5fc6758f6c5a067454962129a69/staging';

/**
 * Access control for update.php script.
 *
 * If you are updating your Backdrop installation using the update.php script
 * but are not logged in using either an account with the "Administer software
 * updates" permission or the site maintenance account (the account that was
 * created during installation), you will need to modify the access check
 * statement below. Change the FALSE to a TRUE to disable the access check.
 * After finishing the upgrade, be sure to open this file again and change the
 * TRUE back to a FALSE!
 */
$settings['update_free_access'] = FALSE;

/**
 * Salt for one-time login links and cancel links, form tokens, etc.
 *
 * This variable will be set to a random value by the installer. All one-time
 * login links will be invalidated if the value is changed. Note that if your
 * site is deployed on a cluster of web servers, you must ensure that this
 * variable has the same value on each server. If this variable is empty, a hash
 * of the serialized database credentials will be used as a fallback salt.
 *
 * For enhanced security, you may set this variable to a value using the
 * contents of a file outside your docroot that is never saved together
 * with any backups of your Backdrop files and database.
 *
 * Example:
 *   $settings['hash_salt'] = file_get_contents('/home/example/salt.txt');
 *
 */
$settings['hash_salt'] = 'grkBHvh8-i2WtIY8d1km6KAT1hi8l5VHZ7EFHhllIsI';

/**
 * Base URL (optional).
 *
 * If Backdrop is generating incorrect URLs on your site, which could be in HTML
 * headers (links to CSS and JS files) or visible links on pages (such as in
 * menus), uncomment the Base URL statement below and fill in the absolute URL
 * to your Backdrop installation.
 *
 * You might also want to force users to use a given domain.
 * See the .htaccess file for more information.
 *
 * Examples:
 *   $base_url = 'http://www.example.com';
 *   $base_url = 'http://www.example.com:8888';
 *   $base_url = 'http://www.example.com/backdrop';
 *   $base_url = 'https://www.example.com:8888/backdrop';
 *
 * It is not allowed to have a trailing slash; Backdrop will add it for you.
 */
// $base_url = 'http://www.example.com'; // NO trailing slash!

/**
 * PHP settings:
 *
 * To see what PHP settings are possible, including whether they can be set at
 * runtime (by using ini_set()), read the PHP documentation:
 * http://www.php.net/manual/ini.list.php
 * See backdrop_environment_initialize() in includes/bootstrap.inc for required
 * runtime settings and the .htaccess file for non-runtime settings. Settings
 * defined there should not be duplicated here so as to avoid conflict issues.
 */

/**
 * Some distributions of Linux (most notably Debian) ship their PHP
 * installations with garbage collection (gc) disabled. Since Backdrop depends
 * on PHP's garbage collection for clearing sessions, ensure that garbage
 * collection occurs by using the most common settings.
 */
ini_set('session.gc_probability', 1);
ini_set('session.gc_divisor', 100);

/**
 * Set session lifetime (in seconds), i.e. the time from the user's last visit
 * to the active session may be deleted by the session garbage collector. When
 * a session is deleted, authenticated users are logged out, and the contents
 * of the user's $_SESSION variable is discarded.
 */
ini_set('session.gc_maxlifetime', 200000);

/**
 * Set session cookie lifetime (in seconds), i.e. the time from the session is
 * created to the cookie expires, i.e. when the browser is expected to discard
 * the cookie. The value 0 means "until the browser is closed".
 */
ini_set('session.cookie_lifetime', 2000000);

/**
 * If you encounter a situation where users post a large amount of text, and
 * the result is stripped out upon viewing but can still be edited, Backdrop's
 * output filter may not have sufficient memory to process it.  If you
 * experience this issue, you may wish to uncomment the following two lines
 * and increase the limits of these variables.  For more information, see
 * http://php.net/manual/en/pcre.configuration.php.
 */
// ini_set('pcre.backtrack_limit', 200000);
// ini_set('pcre.recursion_limit', 200000);

/**
 * Backdrop automatically generates a unique session cookie name for each site
 * based on its full domain name. If you have multiple domains pointing at the
 * same Backdrop site, you can either redirect them all to a single domain (see
 * comment in .htaccess), or uncomment the line below and specify their shared
 * base domain. Doing so assures that users remain logged in as they cross
 * between your various domains. Make sure to always start the $cookie_domain
 * with a leading dot, as per RFC 2109.
 */
// $cookie_domain = '.example.com';

/**
 * A custom theme can be set for the offline page. This applies when the site
 * is explicitly set to maintenance mode through the administration page or when
 * the database is inactive due to an error. It can be set through the
 * 'maintenance_theme' key. The template file should also be copied into the
 * theme. It is located inside 'core/modules/system/maintenance-page.tpl.php'.
 * Note: This setting does not apply to installation and update pages.
 */
// $settings['maintenance_theme'] = 'bartik';

/**
 * Reverse Proxy Configuration:
 *
 * Reverse proxy servers are often used to enhance the performance
 * of heavily visited sites and may also provide other site caching,
 * security, or encryption benefits. In an environment where Backdrop
 * is behind a reverse proxy, the real IP address of the client should
 * be determined such that the correct client IP address is available
 * to Backdrop's logging and access management systems. In
 * the most simple scenario, the proxy server will add an
 * X-Forwarded-For header to the request that contains the client IP
 * address. However, HTTP headers are vulnerable to spoofing, where a
 * malicious client could bypass restrictions by setting the
 * X-Forwarded-For header directly. Therefore, Backdrop's proxy
 * configuration requires the IP addresses of all remote proxies to be
 * specified in $settings['reverse_proxy_addresses'] to work correctly.
 *
 * Enable this setting to get Backdrop to determine the client IP from
 * the X-Forwarded-For header (or $settings['reverse_proxy_header'] if set).
 * If you are unsure about this setting, do not have a reverse proxy,
 * or Backdrop operates in a shared hosting environment, this setting
 * should remain commented out.
 *
 * In order for this setting to be used you must specify every possible
 * reverse proxy IP address in $settings['reverse_proxy_addresses'].
 * If a complete list of reverse proxies is not available in your
 * environment (for example, if you use a CDN) you may set the
 * $_SERVER['REMOTE_ADDR'] variable directly in settings.php.
 * Be aware, however, that it is likely that this would allow IP
 * address spoofing unless more advanced precautions are taken.
 */
// $settings['reverse_proxy'] = TRUE;

/**
 * Specify every reverse proxy IP address in your environment.
 * This setting is required if $settings['reverse_proxy'] is TRUE.
 */
// $settings['reverse_proxy_addresses'] = array('a.b.c.d', ...);

/**
 * Set this value if your proxy server sends the client IP in a header
 * other than X-Forwarded-For.
 */
// $settings['reverse_proxy_header'] = 'HTTP_X_CLUSTER_CLIENT_IP';

/**
 * Page caching:
 *
 * By default, Backdrop sends a "Vary: Cookie" HTTP header for anonymous page
 * views. This tells a HTTP proxy that it may return a page from its local
 * cache without contacting the web server, if the user sends the same Cookie
 * header as the user who originally requested the cached page. Without "Vary:
 * Cookie", authenticated users would also be served the anonymous page from
 * the cache. If the site has mostly anonymous users except a few known
 * editors/administrators, the Vary header can be omitted. This allows for
 * better caching in HTTP proxies (including reverse proxies), i.e. even if
 * clients send different cookies, they still get content served from the cache.
 * However, authenticated users should access the site directly (i.e. not use an
 * HTTP proxy, and bypass the reverse proxy if one is used) in order to avoid
 * getting cached pages from the proxy.
 */
// $settings['omit_vary_cookie'] = TRUE;

/**
 * String overrides:
 *
 * To override specific strings on your site with or without enabling locale
 * module, add an entry to this list. This functionality allows you to change
 * a small number of your site's default English language interface strings.
 *
 * Uncomment the lines below to enable.
 */
/*
$settings['locale_custom_strings_en'][''] = array(
  'forum'      => 'Discussion board',
  '@count min' => '@count minutes',
);
*/

/**
 * Fast 404 pages:
 *
 * Backdrop can generate fully themed 404 pages. However, some of these
 * responses are for images or other resource files that are not displayed to
 * the user. This can waste bandwidth, and also generate server load.
 *
 * The options below return a simple, fast 404 page for URLs matching a
 * specific pattern:
 * - 404_fast_paths_exclude: A regular expression to match paths to exclude,
 *   such as images generated by image styles, or dynamically-resized images.
 *   The default pattern provided below also excludes the private file system.
 *   If you need to add more paths, you can add '|path' to the expression.
 * - 404_fast_paths: A regular expression to match paths that should return a
 *   simple 404 page, rather than the fully themed 404 page. If you don't have
 *   any aliases ending in htm or html you can add '|s?html?' to the expression.
 * - 404_fast_html: The html to return for simple 404 pages.
 *
 * Comment out this code if you would like to disable this functionality.
 */
$settings['404_fast_paths_exclude'] = '/\/(?:styles)|(?:system\/files)\//';
$settings['404_fast_paths'] = '/\.(?:txt|png|gif|jpe?g|css|js|ico|swf|flv|cgi|bat|pl|dll|exe|asp)$/i';
$settings['404_fast_html'] = '<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>Not Found</h1><p>The requested URL "@path" was not found on this server.</p></body></html>';

/**
 * By default, fast 404s are returned as part of the normal page request
 * process, which will properly serve valid pages that happen to match and will
 * also log actual 404s to the Backdrop log. Alternatively you can choose to
 * return a 404 now by uncommenting the following line. This will reduce server
 * load, but will cause even valid pages that happen to match the pattern to
 * return 404s, rather than the actual page. It will also prevent the Backdrop
 * system log entry. Ensure you understand the effects of this before enabling.
 *
 * To enable this functionality, uncomment the line below.
 */
// fast_404();

/**
 * External access proxy settings:
 *
 * If your site must access the Internet via a web proxy then you can enter
 * the proxy settings here. Currently only basic authentication is supported
 * by using the username and password variables. The proxy_user_agent variable
 * can be set to NULL for proxies that require no User-Agent header or to a
 * non-empty string for proxies that limit requests to a specific agent. The
 * proxy_exceptions variable is an array of host names to be accessed directly,
 * not via proxy.
 */
# $settings['proxy_server'] = '';
# $settings['proxy_port'] = 8080;
# $settings['proxy_username'] = '';
# $settings['proxy_password'] = '';
# $settings['proxy_user_agent'] = '';
# $settings['proxy_exceptions'] = array('127.0.0.1', 'localhost');

/**
 * Authorized file system operations:
 *
 * The Update Manager module included with Backdrop provides a mechanism for
 * site administrators to securely install missing updates for the site
 * directly through the web user interface. On securely-configured servers,
 * the Update manager will require the administrator to provide SSH or FTP
 * credentials before allowing the installation to proceed; this allows the
 * site to update the new files as the user who owns all the Backdrop files,
 * instead of as the user the webserver is running as. On servers where the
 * webserver user is itself the owner of the Backdrop files, the administrator
 * will not be prompted for SSH or FTP credentials (note that these server
 * setups are common on shared hosting, but are inherently insecure).
 *
 * Some sites might wish to disable the above functionality, and only update
 * the code directly via SSH or FTP themselves. This setting completely
 * disables all functionality related to these authorized file operations.
 *
 * Uncomment the line below to disable authorize operations.
 */
// $settings['allow_authorize_operations'] = FALSE;

/**
 * Mixed-mode sessions:
 *
 * Set to TRUE to create both secure and insecure sessions when using HTTPS.
 * Defaults to FALSE.
 */
// $settings['https'] = TRUE;

/**
 * Drupal backwards compatibility.
 *
 * By default, Backdrop 1.0 includes a compatibility layer to keep it compatible
 * with Drupal 7 APIs. Backdrop core itself does not use this compatibility
 * layer however. You may disable it if all the modules you're running were
 * built for Backdrop.
 */
$settings['backdrop_drupal_compatibility'] = TRUE;

/**
 * Include a local settings file.
 *
 * To make local development easier, you can add a file that contains your local
 * database connection information. This local settings file can be ignored in
 * your Git repository so that any updates to settings.php can be pulled in
 * without overwriting your local changes.
 */
if (file_exists(__DIR__ . '/settings.local.php')) {
  include __DIR__ . '/settings.local.php';
}
