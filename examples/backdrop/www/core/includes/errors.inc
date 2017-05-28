<?php

/**
 * @file
 * Functions for error handling.
 */

/**
 * Maps PHP error constants to watchdog severity levels.
 *
 * The error constants are documented at
 * http://php.net/manual/errorfunc.constants.php
 *
 * @ingroup logging_severity_levels
 */
function backdrop_error_levels() {
  $types = array(
    E_ERROR => array('Error', WATCHDOG_ERROR),
    E_WARNING => array('Warning', WATCHDOG_WARNING),
    E_PARSE => array('Parse error', WATCHDOG_ERROR),
    E_NOTICE => array('Notice', WATCHDOG_NOTICE),
    E_CORE_ERROR => array('Core error', WATCHDOG_ERROR),
    E_CORE_WARNING => array('Core warning', WATCHDOG_WARNING),
    E_COMPILE_ERROR => array('Compile error', WATCHDOG_ERROR),
    E_COMPILE_WARNING => array('Compile warning', WATCHDOG_WARNING),
    E_USER_ERROR => array('User error', WATCHDOG_ERROR),
    E_USER_WARNING => array('User warning', WATCHDOG_WARNING),
    E_USER_NOTICE => array('User notice', WATCHDOG_NOTICE),
    E_STRICT => array('Strict warning', WATCHDOG_DEBUG),
    E_RECOVERABLE_ERROR => array('Recoverable fatal error', WATCHDOG_ERROR),
    E_DEPRECATED => array('Deprecated function', WATCHDOG_DEBUG),
    E_USER_DEPRECATED => array('User deprecated function', WATCHDOG_DEBUG),
  );

  return $types;
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
function _backdrop_error_handler_real($error_level, $message, $filename, $line, $context) {
  if ($error_level & error_reporting()) {
    $types = backdrop_error_levels();
    list($severity_msg, $severity_level) = $types[$error_level];
    $caller = _backdrop_get_last_caller(debug_backtrace());

    if (!function_exists('filter_xss_admin')) {
      require_once BACKDROP_ROOT . '/core/includes/common.inc';
    }

    // We treat recoverable errors as fatal.
    _backdrop_log_error(array(
      '%type' => isset($types[$error_level]) ? $severity_msg : 'Unknown error',
      // The standard PHP error handler considers that the error messages
      // are HTML. We mimick this behavior here.
      '!message' => filter_xss_admin($message),
      '%function' => $caller['function'],
      '%file' => $caller['file'],
      '%line' => $caller['line'],
      'severity_level' => $severity_level,
    ), $error_level == E_RECOVERABLE_ERROR);
  }
}

/**
 * Decodes an exception and retrieves the correct caller.
 *
 * @param Exception|Error $exception
 *   The exception or error object that was thrown. PHP 7 throws Error objects
 *   for PHP errors.
 *
 * @return
 *   An error in the format expected by _backdrop_log_error().
 */
function _backdrop_decode_exception($exception) {
  $message = $exception->getMessage();

  $backtrace = $exception->getTrace();
  // Add the line throwing the exception to the backtrace.
  array_unshift($backtrace, array('line' => $exception->getLine(), 'file' => $exception->getFile()));

  // For PDOException errors, we try to return the initial caller,
  // skipping internal functions of the database layer.
  if ($exception instanceof PDOException) {
    // The first element in the stack is the call, the second element gives us the caller.
    // We skip calls that occurred in one of the classes of the database layer
    // or in one of its global functions.
    $db_functions = array('db_query',  'db_query_range');
    while (!empty($backtrace[1]) && ($caller = $backtrace[1]) &&
        ((isset($caller['class']) && (strpos($caller['class'], 'Query') !== FALSE || strpos($caller['class'], 'Database') !== FALSE || strpos($caller['class'], 'PDO') !== FALSE)) ||
        in_array($caller['function'], $db_functions))) {
      // We remove that call.
      array_shift($backtrace);
    }
    if (isset($exception->query_string, $exception->args)) {
      $message .= ": " . $exception->query_string . "; " . print_r($exception->args, TRUE);
    }
  }
  $caller = _backdrop_get_last_caller($backtrace);

  return array(
    '%type' => get_class($exception),
    // The standard PHP exception handler considers that the exception message
    // is plain-text. We mimick this behavior here.
    '!message' => check_plain($message),
    '%function' => $caller['function'],
    '%file' => $caller['file'],
    '%line' => $caller['line'],
    'severity_level' => WATCHDOG_ERROR,
  );
}

/**
 * Renders an exception error message without further exceptions.
 *
 * @param $exception
 *   The exception object that was thrown.
 *
 * @return
 *   An error message.
 */
function _backdrop_render_exception_safe($exception) {
  return check_plain(strtr('%type: !message in %function (line %line of %file).', _backdrop_decode_exception($exception)));
}

/**
 * Determines whether an error should be displayed.
 *
 * When in maintenance mode or when error_level is ERROR_REPORTING_DISPLAY_ALL,
 * all errors should be displayed. For ERROR_REPORTING_DISPLAY_SOME, $error
 * will be examined to determine if it should be displayed.
 *
 * @param $error
 *   Optional error to examine for ERROR_REPORTING_DISPLAY_SOME.
 *
 * @return
 *   TRUE if an error should be displayed.
 */
function error_displayable($error = NULL) {
  try {
    $error_level = function_exists('config_get') ? config_get('system.core', 'error_level') : ERROR_REPORTING_DISPLAY_ALL;
  }
  catch (ConfigException $e) {}
  if (empty($error_level)) {
    $error_level = ERROR_REPORTING_DISPLAY_ALL;
  }

  $updating = (defined('MAINTENANCE_MODE') && MAINTENANCE_MODE == 'update');
  $all_errors_displayed = ($error_level == ERROR_REPORTING_DISPLAY_ALL);
  $error_needs_display = ($error_level == ERROR_REPORTING_DISPLAY_SOME &&
    isset($error) && $error['%type'] != 'Notice' && $error['%type'] != 'Strict warning');

  return ($updating || $all_errors_displayed || $error_needs_display);
}

/**
 * Logs a PHP error or exception and displays an error page in fatal cases.
 *
 * @param $error
 *   An array with the following keys: %type, !message, %function, %file, %line
 *   and severity_level. All the parameters are plain-text, with the exception
 *   of !message, which needs to be a safe HTML string.
 * @param $fatal
 *   TRUE if the error is fatal.
 */
function _backdrop_log_error($error, $fatal = FALSE) {
  // Initialize a maintenance theme if the bootstrap was not complete.
  // Do it early because backdrop_set_message() triggers a backdrop_theme_initialize().
  if ($fatal && (backdrop_get_bootstrap_phase() != BACKDROP_BOOTSTRAP_FULL)) {
    unset($GLOBALS['theme']);
    if (!defined('MAINTENANCE_MODE')) {
      define('MAINTENANCE_MODE', 'error');
    }
    backdrop_maintenance_theme();
  }

  // When running inside the testing framework, we relay the errors
  // to the tested site by the way of HTTP headers.
  $test_info = &$GLOBALS['backdrop_test_info'];
  if (!empty($test_info['in_child_site']) && !headers_sent() && (!defined('SIMPLETEST_COLLECT_ERRORS') || SIMPLETEST_COLLECT_ERRORS)) {
    // $number does not use backdrop_static as it should not be reset
    // as it uniquely identifies each PHP error.
    static $number = 0;
    $assertion = array(
      $error['!message'],
      $error['%type'],
      array(
        'function' => $error['%function'],
        'file' => $error['%file'],
        'line' => $error['%line'],
      ),
    );
    backdrop_add_http_header('X-Backdrop-Assertion-' . $number, rawurlencode(serialize($assertion)));
    $number++;
  }

  watchdog('php', '%type: !message in %function (line %line of %file).', $error, $error['severity_level']);

  if ($fatal) {
    backdrop_add_http_header('Status', '500 Service unavailable (with message)');
  }

  if (backdrop_is_cli()) {
    if ($fatal) {
      // When called from CLI, simply output a plain text message.
      print html_entity_decode(strip_tags(t('%type: !message in %function (line %line of %file).', $error))). "\n";
      exit;
    }
  }

  if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' && $fatal) {
    if (error_displayable($error)) {
      // When called from JavaScript, simply output the error message.
      print t('%type: !message in %function (line %line of %file).', $error);
    }
    exit;
  }
  else {
    // Display the message if the current error reporting level allows this type
    // of message to be displayed, and unconditionnaly in update.php.
    if (error_displayable($error)) {
      $class = 'error';

      // If error type is 'User notice' then treat it as debug information
      // instead of an error message, see dd().
      if ($error['%type'] == 'User notice') {
        $error['%type'] = 'Debug';
        $class = 'status';
      }

      backdrop_set_message(t('%type: !message in %function (line %line of %file).', $error), $class);
    }

    if ($fatal) {
      backdrop_set_title(t('Error'));
      // We fallback to a maintenance page at this point, because the page generation
      // itself can generate errors.
      print theme('maintenance_page', array('content' => t('The website encountered an unexpected error. Please try again later.')));
      exit;
    }
  }
}

/**
 * Gets the last caller from a backtrace.
 *
 * @param $backtrace
 *   A standard PHP backtrace.
 *
 * @return
 *   An associative array with keys 'file', 'line' and 'function'.
 */
function _backdrop_get_last_caller($backtrace) {
  // Errors that occur inside PHP internal functions do not generate
  // information about file and line. Ignore black listed functions.
  $blacklist = array('debug', '_backdrop_error_handler', '_backdrop_exception_handler');
  while (($backtrace && !isset($backtrace[0]['line'])) ||
         (isset($backtrace[1]['function']) && in_array($backtrace[1]['function'], $blacklist))) {
    array_shift($backtrace);
  }

  // The first trace is the call itself.
  // It gives us the line and the file of the last call.
  $call = $backtrace[0];

  // The second call give us the function where the call originated.
  if (isset($backtrace[1])) {
    if (isset($backtrace[1]['class'])) {
      $call['function'] = $backtrace[1]['class'] . $backtrace[1]['type'] . $backtrace[1]['function'] . '()';
    }
    else {
      $call['function'] = $backtrace[1]['function'] . '()';
    }
  }
  else {
    $call['function'] = 'main()';
  }
  return $call;
}
