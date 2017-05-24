<?php
/**
 * @file
 *
 * Contains classes and interfaces related to implementing alternative HTTP
 * request systems. By default, backdrop_http_request() will execute its own
 * requests, but this can be replaced by an alternative system if desired by
 * specifying an alternative in settings.php:
 *
 * @code
 * $settings['http_system'] = 'MyAlternativeHTTPSystem';
 * @endcode
 *
 * The specified class may either be loaded via the autoloader through
 * hook_autoload_info(), or may be included directly in settings.php. Any
 * alternative HTTP systems should implement the BackdropHTTPSystemInterface
 * interface.
 */

/**
 * Defines the BackdropHTTPSystemInterface class interface.
 */
interface BackdropHTTPSystemInterface {
  /**
   * @param string $url
   *   A string containing a fully qualified URI.
   * @param array $options
   *   An array of options adjusting the behavior of the request. This array
   *   of options matches backdrop_http_request().
   * @return stdClass
   *   An object with the returned data from the request. This object should
   *   match that returned by backdrop_http_request().
   *
   * @see backdrop_http_request().
   */
  public function request($url, array $options);
}
