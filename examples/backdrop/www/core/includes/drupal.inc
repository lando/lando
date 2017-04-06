<?php
/**
 * @file
 * Contains constants and function wrappers for Drupal 7.x compatibility.
 */

/**
 * @defgroup drupal_compatibility Drupal compatibility layer.
 * @{
 * These functions and classes are wrappers around Backdrop functions that allow
 * for Drupal 7 modules to work with Backdrop easily. All of these functions
 * are made available if the "backdrop_drupal_compatibility" option is enabled
 * in your site's settings.php file.
 */

/**
 * The current system version.
 */
define('VERSION', '7.0-dev');

/**
 * Core API compatibility.
 */
define('DRUPAL_CORE_COMPATIBILITY', '7.x');

// Constants from bootstrap.inc.
define('DRUPAL_ROOT', BACKDROP_ROOT);
define('DRUPAL_BOOTSTRAP_CONFIGURATION', BACKDROP_BOOTSTRAP_CONFIGURATION);
define('DRUPAL_BOOTSTRAP_PAGE_CACHE', BACKDROP_BOOTSTRAP_PAGE_CACHE);
define('DRUPAL_BOOTSTRAP_DATABASE', BACKDROP_BOOTSTRAP_DATABASE);
define('DRUPAL_BOOTSTRAP_VARIABLES', BACKDROP_BOOTSTRAP_VARIABLES);
define('DRUPAL_BOOTSTRAP_SESSION', BACKDROP_BOOTSTRAP_SESSION);
define('DRUPAL_BOOTSTRAP_PAGE_HEADER', BACKDROP_BOOTSTRAP_PAGE_HEADER);
define('DRUPAL_BOOTSTRAP_LANGUAGE', BACKDROP_BOOTSTRAP_LANGUAGE);
define('DRUPAL_BOOTSTRAP_FULL', BACKDROP_BOOTSTRAP_FULL);
define('DRUPAL_ANONYMOUS_RID', BACKDROP_ANONYMOUS_ROLE);
define('DRUPAL_AUTHENTICATED_RID', BACKDROP_AUTHENTICATED_ROLE);
define('DRUPAL_KILOBYTE', BACKDROP_KILOBYTE);
define('DRUPAL_PHP_FUNCTION_PATTERN', BACKDROP_PHP_FUNCTION_PATTERN);
define('DRUPAL_MINIMUM_PHP', BACKDROP_MINIMUM_PHP);
define('DRUPAL_MINIMUM_PHP_MEMORY_LIMIT', BACKDROP_MINIMUM_PHP_MEMORY_LIMIT);

// Constants from common.inc.
define('DRUPAL_NO_CACHE', -1);
define('DRUPAL_CACHE_CUSTOM', -2);
define('DRUPAL_CACHE_PER_ROLE', 0x0001);
define('DRUPAL_CACHE_PER_USER', 0x0002);
define('DRUPAL_CACHE_PER_PAGE', 0x0004);
define('DRUPAL_CACHE_GLOBAL', 0x0008);

// Constants from password.inc.
define('DRUPAL_HASH_COUNT', 16);
define('DRUPAL_MIN_HASH_COUNT', 7);
define('DRUPAL_MAX_HASH_COUNT', 30);
define('DRUPAL_HASH_LENGTH', 55);

// Constants from system.module.
define('DRUPAL_MAXIMUM_TEMP_FILE_AGE', 21600);
define('DRUPAL_CRON_DEFAULT_THRESHOLD', 10800);
define('DRUPAL_USER_TIMEZONE_DEFAULT', 0);
define('DRUPAL_USER_TIMEZONE_EMPTY', 1);
define('DRUPAL_USER_TIMEZONE_SELECT', 2);
define('DRUPAL_DISABLED', 0);
define('DRUPAL_OPTIONAL', 1);
define('DRUPAL_REQUIRED', 2);
define('DRUPAL_WEIGHT_SELECT_MAX', 100);

// Functions from bootstrap.inc.

/**
 * Sets appropriate server variables needed for command line scripts to work.
 *
 * @deprecated since 1.0.0
 * @see backdrop_override_server_variables()
 */
function drupal_override_server_variables($variables = array()) {
  backdrop_override_server_variables($variables);
}

/**
 * Initializes the PHP environment.
 *
 * @deprecated since 1.0.0
 * @see backdrop_environment_initialize()
 */
function drupal_environment_initialize() {
  backdrop_environment_initialize();
}

/**
 * Validates that a hostname (for example $_SERVER['HTTP_HOST']) is safe.
 *
 * @deprecated since 1.0.0
 * @see backdrop_valid_http_host()
 */
function drupal_valid_http_host($host) {
  return backdrop_valid_http_host($host);
}

/**
 * Sets the base URL, cookie domain, and session name from configuration.
 *
 * @deprecated since 1.0.0
 * @see backdrop_settings_initialize()
 */
function drupal_settings_initialize() {
  backdrop_settings_initialize();
}

/**
 * Returns and optionally sets the filename for a system resource.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_filename()
 */
function drupal_get_filename($type, $name, $filename = NULL) {
  return backdrop_get_filename($type, $name, $filename);
}

/**
 * Retrieves the current page from the cache.
 *
 * @deprecated since 1.0.0
 * @see backdrop_page_get_cache()
 */
function drupal_page_get_cache($check_only = FALSE) {
  return backdrop_page_get_cache($check_only);
}

/**
 * Determines the cacheability of the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_page_is_cacheable()
 */
function drupal_page_is_cacheable($allow_caching = NULL) {
  return backdrop_page_is_cacheable($allow_caching);
}

/**
 * Includes a file with the provided type and name.
 *
 * @deprecated since 1.0.0
 * @see backdrop_load()
 */
function drupal_load($type, $name) {
  return backdrop_load($type, $name);
}

/**
 * Sets an HTTP response header for the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_http_header()
 */
function drupal_add_http_header($name, $value, $append = FALSE) {
  backdrop_add_http_header($name, $value, $append);
}

/**
 * Gets the HTTP response headers for the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_http_header()
 */
function drupal_get_http_header($name = NULL) {
  return backdrop_get_http_header($name);
}

/**
 * Sends the HTTP response headers that were previously set, adding defaults.
 *
 * @deprecated since 1.0.0
 * @see backdrop_send_headers()
 */
function drupal_send_headers($default_headers = array(), $only_default = FALSE) {
  backdrop_send_headers($default_headers, $only_default);
}

/**
 * Sets HTTP headers in preparation for a page response.
 *
 * @deprecated since 1.0.0
 * @see backdrop_page_header()
 */
function drupal_page_header() {
  return backdrop_page_header();
}

/**
 * Sets HTTP headers in preparation for a cached page response.
 *
 * @deprecated since 1.0.0
 * @see backdrop_serve_page_from_cache()
 */
function drupal_serve_page_from_cache(stdClass $cache) {
  backdrop_serve_page_from_cache($cache);
}

/**
 * Unserializes and appends elements from a serialized string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_unpack()
 */
function drupal_unpack($obj, $field = 'data') {
  return backdrop_unpack($obj, $field);
}

/**
 * Checks whether a string is valid UTF-8.
 *
 * @deprecated since 1.0.0
 * @see backdrop_validate_utf8()
 */
function drupal_validate_utf8($text) {
  return backdrop_validate_utf8($text);
}

/**
 * Sets a message to display to the user.
 *
 * @deprecated since 1.0.0
 * @see backdrop_set_message()
 */
function drupal_set_message($message = NULL, $type = 'status', $repeat = TRUE) {
  return backdrop_set_message($message, $type, $repeat);
}

/**
 * Returns all messages that have been set with backdrop_set_message().
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_messages()
 */
function drupal_get_messages($type = NULL, $clear_queue = TRUE) {
  return backdrop_get_messages($type, $clear_queue);
}

/**
 * Gets the title of the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_title()
 */
function drupal_get_title() {
  return backdrop_get_title();
}

/**
 * Sets the title of the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_set_title()
 */
function drupal_set_title($title = NULL, $output = CHECK_PLAIN) {
  return backdrop_set_title($title, $output);
}

/**
 * Returns a URL-safe, base64 encoded string of highly randomized bytes (over the full 8-bit range).
 *
 * @deprecated since 1.0.0
 * @see backdrop_random_key()
 */
function drupal_random_key($byte_count = 32) {
  return backdrop_random_key($byte_count);
}

/**
 * Returns a URL-safe, base64 encoded version of the supplied string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_base64_encode()
 */
function drupal_base64_encode($string) {
  return backdrop_base64_encode($string);
}

/**
 * Returns a string of highly randomized bytes (over the full 8-bit range).
 *
 * @deprecated since 1.0.0
 * @see backdrop_random_bytes()
 */
function drupal_random_bytes($count) {
  return backdrop_random_bytes($count);
}

/**
 * Calculates a base-64 encoded, URL-safe sha-256 hmac.
 *
 * @deprecated since 1.0.0
 * @see backdrop_hmac_base64()
 */
function drupal_hmac_base64($data, $key) {
  return backdrop_hmac_base64($data, $key);
}

/**
 * Calculates a base-64 encoded, URL-safe sha-256 hash.
 *
 * @deprecated since 1.0.0
 * @see backdrop_hash_base64()
 */
function drupal_hash_base64($data) {
  return backdrop_hash_base64($data);
}

/**
 * Merges multiple arrays, recursively, and returns the merged array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_array_merge_deep()
 */
function drupal_array_merge_deep() {
  $args = func_get_args(); // pass $args to function
  return call_user_func_array('backdrop_array_merge_deep', $args);
}

/**
 * Merges multiple arrays, recursively, and returns the merged array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_array_merge_deep_array()
 */
function drupal_array_merge_deep_array($arrays) {
  return backdrop_array_merge_deep_array($arrays);
}

/**
 * Generates a default anonymous $user object.
 *
 * @deprecated since 1.0.0
 * @see backdrop_anonymous_user()
 */
function drupal_anonymous_user() {
  return backdrop_anonymous_user();
}

/**
 * Ensures Backdrop is bootstrapped to the specified phase.
 *
 * @deprecated since 1.0.0
 * @see backdrop_bootstrap()
 */
function drupal_bootstrap($phase = NULL, $new_phase = TRUE) {
  return backdrop_bootstrap($phase, $new_phase);
}

/**
 * Returns the time zone of the current user.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_user_timezone()
 */
function drupal_get_user_timezone() {
  return backdrop_get_user_timezone();
}

/**
 * Returns the current bootstrap phase for this Backdrop process.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_bootstrap_phase()
 */
function drupal_get_bootstrap_phase() {
  return backdrop_get_bootstrap_phase();
}

/**
 * Returns the test prefix if this is an internal request from SimpleTest.
 *
 * @deprecated since 1.0.0
 * @see backdrop_valid_test_ua()
 */
function drupal_valid_test_ua() {
  return backdrop_valid_test_ua();
}

/**
 * Generates a user agent string with a HMAC and timestamp for simpletest.
 *
 * @deprecated since 1.0.0
 * @see backdrop_generate_test_ua()
 */
function drupal_generate_test_ua($prefix) {
  return backdrop_generate_test_ua($prefix);
}

/**
 * Enables use of the theme system without requiring database access.
 *
 * @deprecated since 1.0.0
 * @see backdrop_maintenance_theme()
 */
function drupal_maintenance_theme() {
  backdrop_maintenance_theme();
}

/**
 * Returns a simple 404 Not Found page.
 *
 * @deprecated since 1.0.0
 * @see fast_404()
 */
function drupal_fast_404() {
  fast_404();
}

/**
 * Returns TRUE if a Backdrop installation is currently being attempted.
 *
 * @deprecated since 1.0.0
 * @see backdrop_installation_attempted()
 */
function drupal_installation_attempted() {
  return backdrop_installation_attempted();
}

/**
 * Initializes all the defined language types.
 *
 * @deprecated since 1.0.0
 * @see backdrop_language_initialize()
 */
function drupal_language_initialize() {
  backdrop_language_initialize();
}

/**
 * Gets the schema definition of a table, or the whole database schema.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_schema()
 */
function drupal_get_schema($table = NULL, $rebuild = FALSE) {
  return backdrop_get_schema($table, $rebuild);
}

/**
 * Gets the whole database schema.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_complete_schema()
 */
function drupal_get_complete_schema($rebuild = FALSE) {
  return backdrop_get_complete_schema($rebuild);
}

/**
 * Confirms that a class is available.
 *
 * @deprecated since 1.0.0
 * @see backdrop_autoload()
 */
function drupal_autoload_interface($interface) {
  return backdrop_autoload($interface);
}

/**
 * Confirms that a class is available.
 *
 * @deprecated since 1.0.0
 * @see backdrop_autoload()
 */
function drupal_autoload_class($class) {
  return backdrop_autoload($class);
}

/**
 * Provides central static variable storage.
 *
 * @deprecated since 1.0.0
 * @see backdrop_static()
 */
function &drupal_static($name, $default_value = NULL, $reset = FALSE) {
  return backdrop_static($name, $default_value, $reset);
}

/**
 * Resets one or all centrally stored static variable(s).
 *
 * @deprecated since 1.0.0
 * @see backdrop_static_reset()
 */
function drupal_static_reset($name = NULL) {
  backdrop_static_reset($name);
}

/**
 * Detects whether the current script is running in a command-line environment.
 *
 * @deprecated since 1.0.0
 * @see backdrop_is_cli()
 */
function drupal_is_cli() {
  return backdrop_is_cli();
}

/**
 * Formats text for emphasized display in a placeholder inside a sentence.
 *
 * @deprecated since 1.0.0
 * @see backdrop_placeholder()
 */
function drupal_placeholder($text) {
  return backdrop_placeholder($text);
}

/**
 * Registers a function for execution on shutdown.
 *
 * @deprecated since 1.0.0
 * @see backdrop_register_shutdown_function()
 */
function &drupal_register_shutdown_function($callback = NULL) {
  return backdrop_register_shutdown_function($callback);
}

// Functions from common.inc.

/**
 * Gets the name of the currently active installation profile.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_profile()
 */
function drupal_get_profile() {
  return backdrop_get_profile();
}

/**
 * Sets the breadcrumb trail for the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_set_breadcrumb()
 */
function drupal_set_breadcrumb($breadcrumb = NULL) {
  return backdrop_set_breadcrumb($breadcrumb);
}

/**
 * Gets the breadcrumb trail for the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_breadcrumb()
 */
function drupal_get_breadcrumb() {
  return backdrop_get_breadcrumb();
}

/**
 * Adds output to the HEAD tag of the HTML page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_html_head()
 */
function drupal_add_html_head($data = NULL, $key = NULL) {
  return backdrop_add_html_head($data, $key);
}

/**
 * Retrieves output to be displayed in the HEAD tag of the HTML page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_html_head()
 */
function drupal_get_html_head() {
  return backdrop_get_html_head();
}

/**
 * Adds a feed URL for the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_feed()
 */
function drupal_add_feed($url = NULL, $title = '') {
  return backdrop_add_feed($url, $title);
}

/**
 * Gets the feed URLs for the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_feeds()
 */
function drupal_get_feeds($delimiter = "\n") {
  return backdrop_get_feeds($delimiter);
}

/**
 * Processes a URL query parameter array to remove unwanted elements.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_query_parameters()
 */
function drupal_get_query_parameters(array $query = NULL, array $exclude = array('q'), $parent = '') {
  return backdrop_get_query_parameters($query, $exclude, $parent);
}

/**
 * Splits a URL-encoded query string into an array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_query_array()
 */
function drupal_get_query_array($query) {
  return backdrop_get_query_array($query);
}

/**
 * Parses an array into a valid, rawurlencoded query string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_http_build_query()
 */
function drupal_http_build_query(array $query, $parent = '') {
  return backdrop_http_build_query($query, $parent);
}

/**
 * Prepares a 'destination' URL query parameter for use with backdrop_goto().
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_destination()
 */
function drupal_get_destination() {
  return backdrop_get_destination();
}

/**
 * Parses a system URL string into an associative array suitable for url().
 *
 * @deprecated since 1.0.0
 * @see backdrop_parse_url()
 */
function drupal_parse_url($url) {
  return backdrop_parse_url($url);
}

/**
 * Encodes a Backdrop path for use in a URL.
 *
 * @deprecated since 1.0.0
 * @see backdrop_encode_path()
 */
function drupal_encode_path($path) {
  return backdrop_encode_path($path);
}

/**
 * Sends the user to a different page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_goto()
 */
function drupal_goto($path = '', array $options = array(), $http_response_code = 302) {
  backdrop_goto($path, $options, $http_response_code);
}

/**
 * Delivers a "site is under maintenance" message to the browser.
 *
 * @deprecated since 1.0.0
 * @see backdrop_site_offline()
 */
function drupal_site_offline() {
  backdrop_site_offline();
}

/**
 * Delivers a "page not found" error to the browser.
 *
 * @deprecated since 1.0.0
 * @see backdrop_not_found()
 */
function drupal_not_found() {
  backdrop_not_found();
}

/**
 * Delivers an "access denied" error to the browser.
 *
 * @deprecated since 1.0.0
 * @see backdrop_access_denied()
 */
function drupal_access_denied() {
  backdrop_access_denied();
}

/**
 * Performs an HTTP request.
 *
 * @deprecated since 1.0.0
 * @see backdrop_http_request()
 */
function drupal_http_request($url, array $options = array()) {
  return backdrop_http_request($url, $options);
}

/**
 * Strips dangerous protocols (e.g. 'javascript:') from a URI.
 *
 * @deprecated since 1.0.0
 * @see backdrop_strip_dangerous_protocols()
 */
function drupal_strip_dangerous_protocols($uri) {
  return backdrop_strip_dangerous_protocols($uri);
}

/**
 * Formats an attribute string for an HTTP header.
 *
 * @deprecated since 1.0.0
 * @see backdrop_http_header_attributes()
 */
function drupal_http_header_attributes(array $attributes = array()) {
  return backdrop_http_header_attributes($attributes);
}

/**
 * Converts an associative array to an XML/HTML tag attribute string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_attributes()
 */
function drupal_attributes(array $attributes = array()) {
  return backdrop_attributes($attributes);
}

/**
 * Delivers a page callback result to the browser in the appropriate format.
 *
 * @deprecated since 1.0.0
 * @see backdrop_deliver_page()
 */
function drupal_deliver_page($page_callback_result, $default_delivery_callback = NULL) {
  backdrop_deliver_page($page_callback_result, $default_delivery_callback);
}

/**
 * Packages and sends the result of a page callback to the browser as HTML.
 *
 * @deprecated since 1.0.0
 * @see backdrop_deliver_html_page()
 */
function drupal_deliver_html_page($page_callback_result) {
  backdrop_deliver_html_page($page_callback_result);
}

/**
 * Performs end-of-request tasks.
 *
 * @deprecated since 1.0.0
 * @see backdrop_page_footer()
 */
function drupal_page_footer() {
  backdrop_page_footer();
}

/**
 * Performs end-of-request tasks.
 *
 * @deprecated since 1.0.0
 * @see backdrop_exit()
 */
function drupal_exit($destination = NULL) {
  backdrop_exit($destination);
}

/**
 * Forms an associative array from a linear array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_map_assoc()
 */
function drupal_map_assoc($array, $function = NULL) {
  return backdrop_map_assoc($array, $function);
}

/**
 * Attempts to set the PHP maximum execution time.
 *
 * @deprecated since 1.0.0
 * @see backdrop_set_time_limit()
 */
function drupal_set_time_limit($time_limit) {
  backdrop_set_time_limit($time_limit);
}

/**
 * Returns the path to a system item (module, theme, etc.).
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_path()
 */
function drupal_get_path($type, $name) {
  return backdrop_get_path($type, $name);
}

/**
 * Adds a LINK tag with a distinct 'rel' attribute to the page's HEAD.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_html_head_link()
 */
function drupal_add_html_head_link($attributes, $header = FALSE) {
  backdrop_add_html_head_link($attributes, $header);
}

/**
 * Adds a cascading stylesheet to the stylesheet queue.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_css()
 */
function drupal_add_css($data = NULL, $options = NULL) {
  return backdrop_add_css($data, $options);
}

/**
 * Returns a themed representation of all stylesheets to attach to the page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_css()
 */
function drupal_get_css($css = NULL, $skip_alter = FALSE) {
  return backdrop_get_css($css, $skip_alter);
}

/**
 * Grouping callback: Groups CSS items by their types, media, and browsers.
 *
 * @deprecated since 1.0.0
 * @see backdrop_group_css()
 */
function drupal_group_css($css) {
  return backdrop_group_css($css);
}

/**
 * Aggregation callback: Aggregates CSS files and inline content.
 *
 * @deprecated since 1.0.0
 * @see backdrop_aggregate_css()
 */
function drupal_aggregate_css(&$css_groups) {
  backdrop_aggregate_css($css_groups);
}

/**
 * Pre-render callback: Adds the elements needed for CSS tags to be rendered.
 *
 * @deprecated since 1.0.0
 * @see backdrop_pre_render_styles()
 */
function drupal_pre_render_styles($elements) {
  return backdrop_pre_render_styles($elements);
}

/**
 * Aggregates and optimizes CSS files into a cache file in the files directory.
 *
 * @deprecated since 1.0.0
 * @see backdrop_build_css_cache()
 */
function drupal_build_css_cache($css) {
  return backdrop_build_css_cache($css);
}

/**
 * Loads the stylesheet and resolves all @import commands.
 *
 * @deprecated since 1.0.0
 * @see backdrop_load_stylesheet()
 */
function drupal_load_stylesheet($file, $optimize = NULL, $reset_basepath = TRUE) {
  return backdrop_load_stylesheet($file, $optimize, $reset_basepath);
}

/**
 * Processes the contents of a stylesheet for aggregation.
 *
 * @deprecated since 1.0.0
 * @see backdrop_load_stylesheet_content()
 */
function drupal_load_stylesheet_content($contents, $optimize = FALSE) {
  return backdrop_load_stylesheet_content($contents, $optimize);
}

/**
 * Deletes old cached CSS files.
 *
 * @deprecated since 1.0.0
 * @see backdrop_clear_css_cache()
 */
function drupal_clear_css_cache() {
  backdrop_clear_css_cache();
}

/**
 * Deletes files modified more than a set time ago.
 *
 * @deprecated since 1.0.0
 * @see backdrop_delete_file_if_stale()
 */
function drupal_delete_file_if_stale($uri) {
  backdrop_delete_file_if_stale($uri);
}

/**
 * Prepares a string for use as a CSS identifier (element, class, or ID name).
 *
 * @deprecated since 1.0.0
 * @see backdrop_clean_css_identifier()
 */
function drupal_clean_css_identifier($identifier, $filter = array(' ' => '-', '_' => '-', '/' => '-', '[' => '-', ']' => '')) {
  return backdrop_clean_css_identifier($identifier, $filter);
}

/**
 * Prepares a string for use as a valid class name.
 *
 * @deprecated since 1.0.0
 * @see backdrop_html_class()
 */
function drupal_html_class($class) {
  return backdrop_html_class($class);
}

/**
 * Prepares a string for use as a valid HTML ID and guarantees uniqueness.
 *
 * @deprecated since 1.0.0
 * @see backdrop_html_id()
 */
function drupal_html_id($id) {
  return backdrop_html_id($id);
}

/**
 * Provides a standard HTML class name that identifies a page region.
 *
 * @deprecated since 1.0.0
 * @see backdrop_region_class()
 */
function drupal_region_class($region) {
  return backdrop_region_class($region);
}

/**
 * Adds a JavaScript file, setting, or inline code to the page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_js()
 */
function drupal_add_js($data = NULL, $options = NULL) {
  return backdrop_add_js($data, $options);
}

/**
 * Constructs an array of the defaults that are used for JavaScript items.
 *
 * @deprecated since 1.0.0
 * @see backdrop_js_defaults()
 */
function drupal_js_defaults($data = NULL) {
  return backdrop_js_defaults($data);
}

/**
 * Returns a themed presentation of all JavaScript code for the current page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_js()
 */
function drupal_get_js($scope = 'header', $javascript = NULL, $skip_alter = FALSE) {
  return backdrop_get_js($scope, $javascript, $skip_alter);
}

/**
 * #pre_render callback to add the elements needed for JavaScript tags to be rendered.
 *
 * @deprecated since 1.0.0
 * @see backdrop_pre_render_scripts()
 */
function drupal_pre_render_scripts($elements) {
  return backdrop_pre_render_scripts($elements);
}

/**
 * Default callback to group JavaScript items.
 *
 * @deprecated since 1.0.0
 * @see backdrop_group_js()
 */
function drupal_group_js($javascript) {
  return backdrop_group_js($javascript);
}

/**
 * Default callback to aggregate JavaScript files.
 *
 * @deprecated since 1.0.0
 * @see backdrop_aggregate_js()
 */
function drupal_aggregate_js(&$js_groups) {
  backdrop_aggregate_js($js_groups);
}

/**
 * Adds attachments to a render() structure.
 *
 * @deprecated since 1.0.0
 * @see backdrop_process_attached()
 */
function drupal_process_attached($elements, $group = JS_DEFAULT, $dependency_check = FALSE, $every_page = NULL) {
  return backdrop_process_attached($elements, $group, $dependency_check, $every_page);
}

/**
 * Adds JavaScript to change the state of an element based on another element.
 *
 * @deprecated since 1.0.0
 * @see backdrop_process_states()
 */
function drupal_process_states(&$elements) {
  backdrop_process_states($elements);
}

/**
 * Adds multiple JavaScript or CSS files at the same time.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_library()
 */
function drupal_add_library($module, $name, $every_page = NULL) {
  // Compatibility with System libraries like "drupal.autocomplete".
  $name = str_replace('drupal.', 'backdrop.', $name);
  return backdrop_add_library($module, $name, $every_page);
}

/**
 * Retrieves information for a JavaScript/CSS library.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_library()
 */
function drupal_get_library($module, $name = NULL) {
  return backdrop_get_library($module, $name);
}

/**
 * Assists in adding the tableDrag JavaScript behavior to a themed table.
 *
 * @deprecated since 1.0.0
 * @see backdrop_add_tabledrag()
 */
function drupal_add_tabledrag($table_id, $action, $relationship, $group, $subgroup = NULL, $source = NULL, $hidden = TRUE, $limit = 0) {
  backdrop_add_tabledrag($table_id, $action, $relationship, $group, $subgroup, $source, $hidden, $limit);
}

/**
 * Aggregates JavaScript files into a cache file in the files directory.
 *
 * @deprecated since 1.0.0
 * @see backdrop_build_js_cache()
 */
function drupal_build_js_cache($files) {
  return backdrop_build_js_cache($files);
}

/**
 * Deletes old cached JavaScript files and variables.
 *
 * @deprecated since 1.0.0
 * @see backdrop_clear_js_cache()
 */
function drupal_clear_js_cache() {
  backdrop_clear_js_cache();
}

/**
 * Converts a PHP variable into its JavaScript equivalent.
 *
 * @deprecated since 1.0.0
 * @see backdrop_json_encode()
 */
function drupal_json_encode($var) {
  return backdrop_json_encode($var);
}

/**
 * Converts an HTML-safe JSON string into its PHP equivalent.
 *
 * @deprecated since 1.0.0
 * @see backdrop_json_decode()
 */
function drupal_json_decode($var) {
  return backdrop_json_decode($var);
}

/**
 * Prints data to the page in JSON format.
 *
 * @deprecated since 1.0.0
 * @see backdrop_json_output()
 */
function drupal_json_output($var = NULL) {
  backdrop_json_output($var);
}

/**
 * Gets a salt useful for hardening against SQL injection.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_hash_salt()
 */
function drupal_get_hash_salt() {
  return backdrop_get_hash_salt();
}

/**
 * Ensures the private key variable used to generate tokens is set.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_private_key()
 */
function drupal_get_private_key() {
  return backdrop_get_private_key();
}

/**
 * Generates a token based on $value, the user session, and the private key.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_token()
 */
function drupal_get_token($value = '') {
  return backdrop_get_token($value);
}

/**
 * Validates a token based on $value, the user session, and the private key.
 *
 * @deprecated since 1.0.0
 * @see backdrop_valid_token()
 */
function drupal_valid_token($token, $value = '', $skip_anonymous = FALSE) {
  return backdrop_valid_token($token, $value, $skip_anonymous);
}

/**
 * Stores the current page in the cache.
 *
 * @deprecated since 1.0.0
 * @see backdrop_page_set_cache()
 */
function drupal_page_set_cache() {
  return backdrop_page_set_cache();
}

/**
 * Executes a cron run when called.
 *
 * @deprecated since 1.0.0
 * @see backdrop_cron_run()
 */
function drupal_cron_run() {
  return backdrop_cron_run();
}

/**
 * Returns information about system object files (modules, themes, etc.).
 *
 * @deprecated since 1.0.0
 * @see backdrop_system_listing()
 */
function drupal_system_listing($mask, $directory, $key = 'name', $min_depth = 1) {
  return backdrop_system_listing($mask, $directory, $key, $min_depth);
}

/**
 * Pre-render callback: Renders #browsers into #prefix and #suffix.
 *
 * @deprecated since 1.0.0
 * @see backdrop_pre_render_conditional_comments()
 */
function drupal_pre_render_conditional_comments($elements) {
  return backdrop_pre_render_conditional_comments($elements);
}

/**
 * Pre-render callback: Renders a link into #markup.
 *
 * @deprecated since 1.0.0
 * @see backdrop_pre_render_link()
 */
function drupal_pre_render_link($element) {
  return backdrop_pre_render_link($element);
}

/**
 * Pre-render callback: Collects child links into a single array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_pre_render_links()
 */
function drupal_pre_render_links($element) {
  return backdrop_pre_render_links($element);
}

/**
 * Pre-render callback: Appends contents in #markup to #children.
 *
 * @deprecated since 1.0.0
 * @see backdrop_pre_render_markup()
 */
function drupal_pre_render_markup($elements) {
  return backdrop_pre_render_markup($elements);
}

/**
 * Renders the page, including the HTML, HEAD, and BODY tags.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_page()
 */
function drupal_render_page($page) {
  return backdrop_render_page($page);
}

/**
 * Renders HTML given a structured array tree.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render()
 */
function drupal_render(&$elements) {
  return backdrop_render($elements);
}

/**
 * Renders children of an element and concatenates them.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_children()
 */
function drupal_render_children(&$element, $children_keys = NULL) {
  return backdrop_render_children($element, $children_keys);
}

/**
 * Gets the rendered output of a renderable element from the cache.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_cache_get()
 */
function drupal_render_cache_get($elements) {
  return backdrop_render_cache_get($elements);
}

/**
 * Caches the rendered output of a renderable element.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_cache_set()
 */
function drupal_render_cache_set(&$markup, $elements) {
  return backdrop_render_cache_set($markup, $elements);
}

/**
 * Collects #attached for an element and its children into a single array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_collect_attached()
 */
function drupal_render_collect_attached($elements, $return = FALSE) {
  return backdrop_render_collect_attached($elements, $return);
}

/**
 * Prepares an element for caching based on a query.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_cache_by_query()
 */
function drupal_render_cache_by_query($query, $function, $expire = CACHE_TEMPORARY, $granularity = NULL) {
  return backdrop_render_cache_by_query($query, $function, $expire, $granularity);
}

/**
 * Returns cache ID parts for building a cache ID.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_cid_parts()
 */
function drupal_render_cid_parts($granularity = NULL) {
  return backdrop_render_cid_parts($granularity);
}

/**
 * Creates the cache ID for a renderable element.
 *
 * @deprecated since 1.0.0
 * @see backdrop_render_cid_create()
 */
function drupal_render_cid_create($elements) {
  return backdrop_render_cid_create($elements);
}

/**
 * Sorts a structured array by '#title' property.
 *
 * @deprecated since 1.0.0
 * @see backdrop_sort()
 */
function element_sort_by_title($a, $b) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  $a_title = (is_array($a) && isset($a['#title'])) ? $a['#title'] : '';
  $b_title = (is_array($b) && isset($b['#title'])) ? $b['#title'] : '';
  return strnatcasecmp($a_title, $b_title);
}

/**
 * Sorts a structured array by '#weight' property.
 *
 * @deprecated since 1.0.0
 * @see backdrop_sort()
 */
function element_sort($a, $b) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  $a_weight = (is_array($a) && isset($a['#weight'])) ? $a['#weight'] : 0;
  $b_weight = (is_array($b) && isset($b['#weight'])) ? $b['#weight'] : 0;
  if ($a_weight == $b_weight) {
    return 0;
  }
  return ($a_weight < $b_weight) ? -1 : 1;
}

/**
 * Sorts a structured array by 'weight' key (no # prefix).
 *
 * @deprecated since 1.0.0
 * @see backdrop_sort()
 */
function drupal_sort_weight($a, $b) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  $a_weight = (is_array($a) && isset($a['weight'])) ? $a['weight'] : 0;
  $b_weight = (is_array($b) && isset($b['weight'])) ? $b['weight'] : 0;
  if ($a_weight == $b_weight) {
    return 0;
  }
  return ($a_weight < $b_weight) ? -1 : 1;
}

/**
 * Sorts a structured array by 'title' key (no # prefix).
 *
 * @deprecated since 1.0.0
 * @see backdrop_sort()
 */
function drupal_sort_title($a, $b) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  if (!isset($b['title'])) {
    return -1;
  }
  if (!isset($a['title'])) {
    return 1;
  }
  return strcasecmp($a['title'], $b['title']);
}

/**
 * Retrieves a value from a nested array with variable depth.
 *
 * @deprecated since 1.0.0
 * @see backdrop_array_get_nested_value()
 */
function &drupal_array_get_nested_value(array &$array, array $parents, &$key_exists = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_array_get_nested_value($array, $parents, $key_exists);
}

/**
 * Sets a value in a nested array with variable depth.
 *
 * @deprecated since 1.0.0
 * @see backdrop_array_set_nested_value()
 */
function drupal_array_set_nested_value(array &$array, array $parents, $value, $force = FALSE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_array_set_nested_value($array, $parents, $value, $force);
}

/**
 * Unsets a value in a nested array with variable depth.
 *
 * @deprecated since 1.0.0
 * @see backdrop_array_unset_nested_value()
 */
function drupal_array_unset_nested_value(array &$array, array $parents, &$key_existed = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_array_unset_nested_value($array, $parents, $key_existed);
}

/**
 * Determines whether a nested array contains the requested keys.
 *
 * @deprecated since 1.0.0
 * @see backdrop_array_nested_key_exists()
 */
function drupal_array_nested_key_exists(array $array, array $parents) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_array_nested_key_exists($array, $parents);
}

/**
 * Provides theme registration for themes across .inc files.
 *
 * @deprecated since 1.0.0
 * @see backdrop_common_theme()
 */
function drupal_common_theme() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_common_theme();
}

/**
 * Creates all tables defined in a module's hook_schema().
 *
 * @deprecated since 1.0.0
 * @see backdrop_install_schema()
 */
function drupal_install_schema($module) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_install_schema($module);
}

/**
 * Removes all tables defined in a module's hook_schema().
 *
 * @deprecated since 1.0.0
 * @see backdrop_uninstall_schema()
 */
function drupal_uninstall_schema($module) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_uninstall_schema($module);
}

/**
 * Returns the unprocessed and unaltered version of a module's schema.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_schema_unprocessed()
 */
function drupal_get_schema_unprocessed($module, $table = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_get_schema_unprocessed($module, $table);
}

/**
 * Retrieves a list of fields from a table schema.
 *
 * @deprecated since 1.0.0
 * @see backdrop_schema_fields_sql()
 */
function drupal_schema_fields_sql($table, $prefix = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_schema_fields_sql($table, $prefix);
}

/**
 * Saves (inserts or updates) a record to the database based upon the schema.
 *
 * @deprecated since 1.0.0
 * @see backdrop_write_record()
 */
function drupal_write_record($table, &$record, $primary_keys = array()) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_write_record($table, $record, $primary_keys);
}

/**
 * Parses Backdrop module and theme .info files.
 *
 * @deprecated since 1.0.0
 * @see backdrop_parse_info_file()
 */
function drupal_parse_info_file($filename, $process_sections = FALSE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_parse_info_file($filename, $process_sections);
}

/**
 * Parses data in Backdrop's .info format.
 *
 * @deprecated since 1.0.0
 * @see backdrop_parse_info_format()
 */
function drupal_parse_info_format($data, $process_sections = FALSE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_parse_info_format($data, $process_sections);
}

/**
 * Explodes a string of tags into an array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_explode_tags()
 */
function drupal_explode_tags($tags) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_explode_tags($tags);
}

/**
 * Implodes an array of tags into a string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_implode_tags()
 */
function drupal_implode_tags($tags) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_implode_tags($tags);
}

/**
 * Flushes all cached data on the site.
 *
 * @deprecated since 1.0.0
 * @see backdrop_flush_all_caches()
 */
function drupal_flush_all_caches() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_flush_all_caches();
}

/**
 * Parses a dependency for comparison by backdrop_check_incompatibility().
 *
 * @deprecated since 1.0.0
 * @see backdrop_parse_dependency()
 */
function drupal_parse_dependency($dependency) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_parse_dependency($dependency);
}

/**
 * Checks whether a version is compatible with a given dependency.
 *
 * @deprecated since 1.0.0
 * @see backdrop_check_incompatibility()
 */
function drupal_check_incompatibility($v, $current_version) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_check_incompatibility($v, $current_version);
}

/**
 * Assembles the Backdrop Updater registry.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_updaters()
 */
function drupal_get_updaters() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_get_updaters();
}

/**
 * Assembles the Backdrop FileTransfer registry.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_filetransfer_info()
 */
function drupal_get_filetransfer_info() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_get_filetransfer_info();
}

/**
 * Format a username.
 *
 * @deprecated since 1.0.0
 */
function format_username($account) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return user_format_name($account);
}

// Functions from errors.inc.

/**
 * Maps PHP error constants to watchdog severity levels.
 *
 * @deprecated since 1.0.0
 * @see backdrop_error_levels()
 */
function drupal_error_levels() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_error_levels();
}

// Functions from file.inc.

/**
 * Moves an uploaded file to a new location.
 *
 * @deprecated since 1.0.0
 * @see backdrop_move_uploaded_file()
 */
function drupal_move_uploaded_file($filename, $uri) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_move_uploaded_file($filename, $uri);
}

/**
 * Sets the permissions on a file or directory.
 *
 * @deprecated since 1.0.0
 * @see backdrop_chmod()
 */
function drupal_chmod($uri, $mode = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_chmod($uri, $mode);
}

/**
 * Deletes a file.
 *
 * @deprecated since 1.0.0
 * @see backdrop_unlink()
 */
function drupal_unlink($uri, $context = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_unlink($uri, $context);
}

/**
 * Resolves the absolute filepath of a local URI or filepath.
 *
 * @deprecated since 1.0.0
 * @see backdrop_realpath()
 */
function drupal_realpath($uri) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_realpath($uri);
}

/**
 * Gets the name of the directory from a given path.
 *
 * @deprecated since 1.0.0
 * @see backdrop_dirname()
 */
function drupal_dirname($uri) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_dirname($uri);
}

/**
 * Gets the filename from a given path.
 *
 * @deprecated since 1.0.0
 * @see backdrop_basename()
 */
function drupal_basename($uri, $suffix = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_basename($uri, $suffix);
}

/**
 * Creates a directory using Backdrop's default mode.
 *
 * @deprecated since 1.0.0
 * @see backdrop_mkdir()
 */
function drupal_mkdir($uri, $mode = NULL, $recursive = FALSE, $context = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_mkdir($uri, $mode, $recursive, $context);
}

/**
 * Removes a directory.
 *
 * @deprecated since 1.0.0
 * @see backdrop_rmdir()
 */
function drupal_rmdir($uri, $context = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_rmdir($uri, $context);
}

/**
 * Creates a file with a unique filename in the specified directory.
 *
 * @deprecated since 1.0.0
 * @see backdrop_tempnam()
 */
function drupal_tempnam($directory, $prefix) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_tempnam($directory, $prefix);
}

/**
 * Creates a .htaccess file in the given directory.
 *
 * @deprecated since 1.0.0
 */
function file_create_htaccess($directory, $private = TRUE, $force_overwrite = FALSE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  file_save_htaccess($directory, $private, $force_overwrite);
}

// Functions from form.inc.

/**
 * Returns a renderable form array for a given form ID.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_form()
 */
function drupal_get_form() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  $args = func_get_args(); // pass $args to form function
  return call_user_func_array('backdrop_get_form', $args);
}

/**
 * Builds and processes a form for a given form ID.
 *
 * @deprecated since 1.0.0
 * @see backdrop_build_form()
 */
function drupal_build_form($form_id, &$form_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_build_form($form_id, $form_state);
}

/**
 * Constructs a new $form from the information in $form_state.
 *
 * @deprecated since 1.0.0
 * @see backdrop_rebuild_form()
 */
function drupal_rebuild_form($form_id, &$form_state, $old_form = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_rebuild_form($form_id, $form_state, $old_form);
}

/**
 * Retrieves, populates, and processes a form.
 *
 * @deprecated since 1.0.0
 * @see backdrop_form_submit()
 */
function drupal_form_submit($form_id, &$form_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_form_submit($form_id, $form_state);
}

/**
 * Retrieves the structured array that defines a given form.
 *
 * @deprecated since 1.0.0
 * @see backdrop_retrieve_form()
 */
function drupal_retrieve_form($form_id, &$form_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_retrieve_form($form_id, $form_state);
}

/**
 * Processes a form submission.
 *
 * @deprecated since 1.0.0
 * @see backdrop_process_form()
 */
function drupal_process_form($form_id, &$form, &$form_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_process_form($form_id, $form, $form_state);
}

/**
 * Prepares a structured form array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_prepare_form()
 */
function drupal_prepare_form($form_id, &$form, &$form_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_prepare_form($form_id, $form, $form_state);
}

/**
 * Validates user-submitted form data in the $form_state array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_validate_form()
 */
function drupal_validate_form($form_id, &$form, &$form_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_validate_form($form_id, $form, $form_state);
}

/**
 * Redirects the user to a URL after a form has been processed.
 *
 * @deprecated since 1.0.0
 * @see backdrop_redirect_form()
 */
function drupal_redirect_form($form_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_redirect_form($form_state);
}

// Functions from graph.inc.

/**
 * Performs a depth-first search and sort on a directed acyclic graph.
 *
 * @deprecated since 1.0.0
 * @see backdrop_depth_first_search()
 */
function drupal_depth_first_search(&$graph) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_depth_first_search($graph);
}

// Functions from install.core.inc.

/**
 * Installs Backdrop either interactively or via an array of passed-in settings.
 *
 * @deprecated since 1.0.0
 * @see install_backdrop()
 */
function install_drupal() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  install_backdrop();
}

// Functions from install.inc.

/**
 * Loads .install files for installed modules to initialize the update system.
 *
 * @deprecated since 1.0.0
 * @see backdrop_load_updates()
 */
function drupal_load_updates() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_load_updates();
}

/**
 * Returns an array of available schema versions for a module.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_schema_versions()
 */
function drupal_get_schema_versions($module) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_get_schema_versions($module);
}

/**
 * Returns the currently installed schema version for a module.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_installed_schema_version()
 */
function drupal_get_installed_schema_version($module, $reset = FALSE, $array = FALSE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_get_installed_schema_version($module, $reset, $array);
}

/**
 * Update the installed version information for a module.
 *
 * @deprecated since 1.0.0
 * @see backdrop_set_installed_schema_version()
 */
function drupal_set_installed_schema_version($module, $version) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_set_installed_schema_version($module, $version);
}

/**
 * Loads the installation profile, extracting its defined distribution name.
 *
 * @deprecated since 1.0.0
 * @see backdrop_install_profile_distribution_name()
 */
function drupal_install_profile_distribution_name() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_install_profile_distribution_name();
}

/**
 * Loads the installation profile, extracting its defined distribution name.
 *
 * @deprecated since 1.0.0
 * @see backdrop_detect_baseurl()
 */
function drupal_detect_baseurl($file = 'core/install.php') {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_detect_baseurl($file);
}

/**
 * Returns all supported database installer objects that are compiled into PHP.
 *
 * @deprecated since 1.0.0
 * @see backdrop_load_database_driver()
 */
function drupal_detect_database_types() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  $installer = backdrop_load_database_driver();
  return array('mysql' => $installer->name());
}

/**
 * Returns all supported database installer objects that are compiled into PHP.
 *
 * @deprecated since 1.0.0
 * @see backdrop_load_database_driver()
 */
function drupal_get_database_types() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  $mysql = backdrop_load_database_driver();
  return array('mysql' => $mysql);
}

/**
 * Replaces values in settings.php with values in the submitted array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_rewrite_settings()
 */
function drupal_rewrite_settings($settings = array()) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_rewrite_settings($settings);
}

/**
 * Verifies an installation profile for installation.
 *
 * @deprecated since 1.0.0
 * @see backdrop_verify_profile()
 */
function drupal_verify_profile($install_state) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_verify_profile($install_state);
}

/**
 * Installs the system module.
 *
 * @deprecated since 1.0.0
 * @see backdrop_install_system()
 */
function drupal_install_system() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_install_system();
}

/**
 * Uninstalls a given list of disabled modules.
 *
 * @deprecated since 1.0.0
 * @see backdrop_uninstall_modules()
 */
function drupal_uninstall_modules($module_list = array(), $uninstall_dependents = TRUE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_uninstall_modules($module_list, $uninstall_dependents);
}

/**
 * Verifies the state of the specified file.
 *
 * @deprecated since 1.0.0
 * @see backdrop_verify_install_file()
 */
function drupal_verify_install_file($file, $mask = NULL, $type = 'file') {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_verify_install_file($file, $mask, $type);
}

/**
 * Creates a directory with the specified permissions.
 *
 * @deprecated since 1.0.0
 * @see backdrop_install_mkdir()
 */
function drupal_install_mkdir($file, $mask, $message = TRUE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_install_mkdir($file, $mask, $message);
}

/**
 * Returns the URL of the current script, with modified query parameters.
 *
 * @deprecated since 1.0.0
 * @see backdrop_current_script_url()
 */
function drupal_current_script_url($query = array()) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_current_script_url($query);
}

/**
 * Returns a URL for proceeding to the next page after a requirements problem.
 *
 * @deprecated since 1.0.0
 * @see backdrop_requirements_url()
 */
function drupal_requirements_url($severity) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_requirements_url($severity);
}

/**
 * Checks an installation profile's requirements.
 *
 * @deprecated since 1.0.0
 * @see backdrop_check_profile()
 */
function drupal_check_profile($profile) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_check_profile($profile);
}

/**
 * Extracts the highest severity from the requirements array.
 *
 * @deprecated since 1.0.0
 * @see backdrop_requirements_severity()
 */
function drupal_requirements_severity(&$requirements) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_requirements_severity($requirements);
}

/**
 * Checks a module's requirements.
 *
 * @deprecated since 1.0.0
 * @see backdrop_check_module()
 */
function drupal_check_module($module) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_check_module($module);
}

// Functions from mail.inc.

/**
 * Composes and optionally sends an e-mail message.
 *
 * @deprecated since 1.0.0
 * @see backdrop_mail()
 */
function drupal_mail($module, $key, $to, $language, $params = array(), $from = NULL, $send = TRUE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_mail($module, $key, $to, $language, $params, $from, $send);
}

/**
 * Returns an object that implements the MailSystemInterface interface.
 *
 * @deprecated since 1.0.0
 * @see backdrop_mail_system()
 */
function drupal_mail_system($module, $key) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_mail_system($module, $key);
}

/**
 * Performs format=flowed soft wrapping for mail (RFC 3676).
 *
 * @deprecated since 1.0.0
 * @see backdrop_wrap_mail()
 */
function drupal_wrap_mail($text, $indent = '') {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_wrap_mail($text, $indent);
}

/**
 * Transforms an HTML string into plain text, preserving its structure.
 *
 * @deprecated since 1.0.0
 * @see backdrop_html_to_text()
 */
function drupal_html_to_text($string, $allowed_tags = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_html_to_text($string, $allowed_tags);
}

// Functions from module.inc.

/**
 * Returns an array of modules required by core.
 *
 * @deprecated since 1.0.0
 * @see backdrop_required_modules()
 */
function drupal_required_modules() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_required_modules();
}

/**
 * Passes alterable variables to specific hook_TYPE_alter() implementations.
 *
 * @deprecated since 1.0.0
 * @see backdrop_alter()
 */
function drupal_alter($type, &$data, &$context1 = NULL, &$context2 = NULL, &$context3 = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_alter($type, $data, $context1, $context2, $context3);
}

// Functions from path.inc.

/**
 * Initialize the $_GET['q'] variable to the proper normal path.
 *
 * @deprecated since 1.0.0
 * @see backdrop_path_initialize()
 */
function drupal_path_initialize() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_path_initialize();
}

/**
 * Given an alias, return its Backdrop system URL if one exists.
 *
 * @deprecated since 1.0.0
 * @see backdrop_lookup_path()
 */
function drupal_lookup_path($action, $path = '', $langcode = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_lookup_path($action, $path, $langcode);
}

/**
 * Cache system paths for a page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_cache_system_paths()
 */
function drupal_cache_system_paths() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_cache_system_paths();
}

/**
 * Given an internal Backdrop path, return the alias set by the administrator.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_path_alias()
 */
function drupal_get_path_alias($path = NULL, $langcode = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_get_path_alias($path, $langcode);
}

/**
 * Given a path alias, return the internal path it represents.
 *
 * @deprecated since 1.0.0
 * @see backdrop_get_normal_path()
 */
function drupal_get_normal_path($path, $langcode = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_get_normal_path($path, $langcode);
}

/**
 * Check if the current page is the front page.
 *
 * @deprecated since 1.0.0
 * @see backdrop_is_front_page()
 */
function drupal_is_front_page() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_is_front_page();
}

/**
 * Check if a path matches any pattern in a set of patterns.
 *
 * @deprecated since 1.0.0
 * @see backdrop_match_path()
 */
function drupal_match_path($path, $patterns) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_match_path($path, $patterns);
}

/**
 * Rebuild the path alias white list.
 *
 * @deprecated since 1.0.0
 */
function drupal_path_alias_whitelist_rebuild($source = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return array();
}

/**
 * Checks a path exists and the current user has access to it.
 *
 * @deprecated since 1.0.0
 * @see backdrop_valid_path()
 */
function drupal_valid_path($path, $dynamic_allowed = FALSE) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_valid_path($path, $dynamic_allowed);
}

/**
 * Clear the path cache.
 *
 * @deprecated since 1.0.0
 * @see backdrop_clear_path_cache()
 */
function drupal_clear_path_cache($source = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_clear_path_cache($source);
}

// Functions from session.inc.

/**
 * Initializes the session handler, starting a session if needed.
 *
 * @deprecated since 1.0.0
 * @see backdrop_session_initialize()
 */
function drupal_session_initialize() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_session_initialize();
}

/**
 * Starts a session forcefully, preserving already set session data.
 *
 * @deprecated since 1.0.0
 * @see backdrop_session_start()
 */
function drupal_session_start() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_session_start();
}

/**
 * Commits the current session, if necessary.
 *
 * @deprecated since 1.0.0
 * @see backdrop_session_commit()
 */
function drupal_session_commit() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_session_commit();
}

/**
 * Returns whether a session has been started.
 *
 * @deprecated since 1.0.0
 * @see backdrop_session_started()
 */
function drupal_session_started($set = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_session_started($set);
}

/**
 * Called when an anonymous user becomes authenticated or vice-versa.
 *
 * @deprecated since 1.0.0
 * @see backdrop_session_regenerate()
 */
function drupal_session_regenerate() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_session_regenerate();
}

/**
 * Ends a specific user's session(s).
 *
 * @deprecated since 1.0.0
 * @see backdrop_session_destroy_uid()
 */
function drupal_session_destroy_uid($uid) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_session_destroy_uid($uid);
}

/**
 * Determines whether to save session data of the current request.
 *
 * @deprecated since 1.0.0
 * @see backdrop_save_session()
 */
function drupal_save_session($status = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_save_session($status);
}

// Functions from theme.inc.

/**
 * Determines if a theme is available to use.
 *
 * @deprecated since 1.0.0
 * @see backdrop_theme_access()
 */
function drupal_theme_access($theme) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_theme_access($theme);
}

/**
 * Initializes the theme system by loading the theme.
 *
 * @deprecated since 1.0.0
 * @see backdrop_theme_initialize()
 */
function drupal_theme_initialize() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_theme_initialize();
}

/**
 * Forces the system to rebuild the theme registry.
 *
 * @deprecated since 1.0.0
 * @see backdrop_theme_rebuild()
 */
function drupal_theme_rebuild() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  backdrop_theme_rebuild();
}

/**
 * Find all the base themes for the specified theme.
 *
 * @deprecated since 1.0.0
 * @see backdrop_find_base_themes()
 */
function drupal_find_base_themes($themes, $key, $used_keys = array()) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_find_base_themes($themes, $key, $used_keys);
}

/**
 * Allows themes and/or theme engines to discover overridden theme functions.
 *
 * @deprecated since 1.0.0
 * @see backdrop_find_theme_functions()
 */
function drupal_find_theme_functions($cache, $prefixes) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_find_theme_functions($cache, $prefixes);
}

/**
 * Allows themes and/or theme engines to easily discover overridden templates.
 *
 * @deprecated since 1.0.0
 * @see backdrop_find_theme_templates()
 */
function drupal_find_theme_templates($cache, $extension, $path) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_find_theme_templates($cache, $extension, $path);
}

// Functions from unicode.inc.

/**
 * Prepares a new XML parser.
 *
 * @deprecated since 1.0.0
 * @see backdrop_xml_parser_create()
 */
function drupal_xml_parser_create(&$data) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_xml_parser_create($data);
}

/**
 * Converts data to UTF-8.
 *
 * @deprecated since 1.0.0
 * @see backdrop_convert_to_utf8()
 */
function drupal_convert_to_utf8($data, $encoding) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_convert_to_utf8($data, $encoding);
}

/**
 * Truncates a UTF-8-encoded string safely to a number of bytes.
 *
 * @deprecated since 1.0.0
 * @see backdrop_truncate_bytes()
 */
function drupal_truncate_bytes($string, $len) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_truncate_bytes($string, $len);
}

/**
 * Counts the number of characters in a UTF-8 string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_strlen()
 */
function drupal_strlen($text) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_strlen($text);
}

/**
 * Uppercase a UTF-8 string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_strtoupper()
 */
function drupal_strtoupper($text) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_strtoupper($text);
}

/**
 * Lowercase a UTF-8 string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_strtolower()
 */
function drupal_strtolower($text) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_strtolower($text);
}

/**
 * Capitalizes the first letter of a UTF-8 string.
 *
 * @deprecated since 1.0.0
 * @see backdrop_ucfirst()
 */
function drupal_ucfirst($text) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_ucfirst($text);
}

/**
 * Cuts off a piece of a string based on character indices and counts.
 *
 * @deprecated since 1.0.0
 * @see backdrop_substr()
 */
function drupal_substr($text, $start, $length = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_substr($text, $start, $length);
}

// Functions from utility.inc.

/**
 * Backdrop-friendly var_export().
 *
 * @deprecated since 1.0.0
 * @see backdrop_var_export()
 */
function drupal_var_export($var, $prefix = '') {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  return backdrop_var_export($var, $prefix);
}

/**
 * Drupal-compatible wrapper for clearing caches.
 *
 * Backdrop no longer needs to "rebuild" its node types, which previously
 * were synced between the code and database in Drupal 7. In Backdrop, all
 * node types are always stored in config.
 *
 * @deprecated since 1.0.0
 */
function node_types_rebuild() {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  node_type_cache_reset();
}

/**
 * Alters Backdrop's list of defined date formats and attributes to return the
 * expected date types and attributes for Drupal's system_get_date_types()
 * function.
 *
 * @deprecated since 1.0.0
 */
function system_get_date_types($type = NULL) {
  watchdog_deprecated_function('drupal', __FUNCTION__);
  $formats = system_get_date_formats($type);

  if ($type) {
    foreach ($formats as &$format) {
      $format['type'] = $format['name'];
      $format['title'] = $format['label'];
      $format['locked'] = isset($format['hidden']) ? $format['hidden'] : '0';
      if (!isset($format['module'])) {
        $format['module'] = '';
      }
      $format['is_new'] = FALSE;
    }
  }
  else {
    $formats['type'] = $formats['name'];
    $formats['title'] = $formats['label'];
    $formats['locked'] = isset($formats['hidden']) ? $formats['hidden'] : '0';
    if (!isset($formats['module'])) {
      $formats['module'] = '';
    }
    $formats['is_new'] = FALSE;
  }

  return $formats;
}

/**
 * @} End of "defgroup drupal_compatibility".
 */
