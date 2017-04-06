<?php
/**
 * @file
 * Date API functions.
 */

/**
 * Set up some constants.
 *
 * Includes standard date types, format strings, strict regex strings for ISO
 * and DATETIME formats (seconds are optional).
 *
 * The loose regex will find any variety of ISO date and time, with or
 * without time, with or without dashes and colons separating the elements,
 * and with either a 'T' or a space separating date and time.
 */
define('DATE_ISO', 'date');
define('DATE_UNIX', 'datestamp');
define('DATE_DATETIME', 'datetime');
define('DATE_ARRAY', 'array');
define('DATE_OBJECT', 'object');
define('DATE_ICAL', 'ical');

define('DATE_FORMAT_ISO', "Y-m-d\TH:i:s");
define('DATE_FORMAT_UNIX', "U");
define('DATE_FORMAT_DATETIME', "Y-m-d H:i:s");
define('DATE_FORMAT_ICAL', "Ymd\THis");
define('DATE_FORMAT_ICAL_DATE', "Ymd");
define('DATE_FORMAT_DATE', 'Y-m-d');

define('DATE_REGEX_ISO', '/(\d{4})?(-(\d{2}))?(-(\d{2}))?([T\s](\d{2}))?(:(\d{2}))?(:(\d{2}))?/');
define('DATE_REGEX_DATETIME', '/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):?(\d{2})?/');
define('DATE_REGEX_LOOSE', '/(\d{4})-?(\d{1,2})-?(\d{1,2})([T\s]?(\d{2}):?(\d{2}):?(\d{2})?(\.\d+)?(Z|[\+\-]\d{2}:?\d{2})?)?/');
define('DATE_REGEX_ICAL_DATE', '/(\d{4})(\d{2})(\d{2})/');
define('DATE_REGEX_ICAL_DATETIME', '/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/');

// There is actually no maximum and minimum year in PHP 5, but a date with
// a year less than 0 would result in negative ISO and DATETIME dates,
// like -1250-01-01T00:00:00, which probably won't make sense or work
// correctly anywhere.
define('DATE_MIN_YEAR', 1);
define('DATE_MAX_YEAR', 4000);

/**
 * Helper function for getting the format string for a date type.
 *
 * @param string $type
 *   A date type format name.
 *
 * @return string
 *   A date type format, like 'Y-m-d H:i:s'.
 */
function date_type_format($type) {
  switch ($type) {
    case DATE_ISO:
      return DATE_FORMAT_ISO;

    case DATE_UNIX:
      return DATE_FORMAT_UNIX;

    case DATE_DATETIME:
      return DATE_FORMAT_DATETIME;

    case DATE_ICAL:
      return DATE_FORMAT_ICAL;
  }
  return FALSE;
}

/**
 * Constructs an untranslated array of month names.
 *
 * Needed for CSS, translation functions, strtotime(), and other places
 * that use the English versions of these words.
 *
 * @return array
 *   An array of month names.
 */
function date_month_names_untranslated() {
  static $month_names;
  if (empty($month_names)) {
    $month_names = array(
      1 => 'January',
      2 => 'February',
      3 => 'March',
      4 => 'April',
      5 => 'May',
      6 => 'June',
      7 => 'July',
      8 => 'August',
      9 => 'September',
      10 => 'October',
      11 => 'November',
      12 => 'December',
    );
  }
  return $month_names;
}

/**
 * Returns a translated array of month names.
 *
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 *
 * @return array
 *   An array of month names.
 */
function date_month_names($required = FALSE) {
  $month_names = array();
  foreach (date_month_names_untranslated() as $key => $month) {
    $month_names[$key] = t($month, array(), array('context' => 'Long month name'));
  }
  $none = array('' => '');
  return !$required ? $none + $month_names : $month_names;
}

/**
 * Constructs a translated array of month name abbreviations.
 *
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 * @param int $length
 *   (optional) The length of the abbreviation. Defaults to 3.
 *
 * @return array
 *   An array of month abbreviations.
 */
function date_month_names_abbr($required = FALSE, $length = 3) {
  $month_names = array();
  foreach (date_month_names_untranslated() as $key => $month) {
    if ($length == 3) {
      $month_names[$key] = t(substr($month, 0, $length), array());
    }
    else {
      $month_names[$key] = t(substr($month, 0, $length), array(), array('context' => 'month_abbr'));
    }
  }
  $none = array('' => '');
  return !$required ? $none + $month_names : $month_names;
}

/**
 * Constructs an untranslated array of week days.
 *
 * Needed for CSS, translation functions, strtotime(), and other places
 * that use the English versions of these words.
 *
 * @return array
 *   An array of week day names
 */
function date_week_days_untranslated() {
  static $weekdays;
  if (empty($weekdays)) {
    $weekdays = array(
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    );
  }
  return $weekdays;
}

/**
 * Returns a translated array of week names.
 *
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 *
 * @return array
 *   An array of week day names
 */
function date_week_days($required = FALSE) {
  $weekdays = array();
  foreach (date_week_days_untranslated() as $key => $day) {
    $weekdays[$key] = t($day, array(), array('context' => ''));
  }
  $none = array('' => '');
  return !$required ? $none + $weekdays : $weekdays;
}

/**
 * Constructs a translated array of week day abbreviations.
 *
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 * @param int $length
 *   (optional) The length of the abbreviation. Defaults to 3.
 *
 * @return array
 *   An array of week day abbreviations
 */
function date_week_days_abbr($required = FALSE, $length = 3) {
  $weekdays = array();
  switch ($length) {
    case 1:
      $context = 'day_abbr1';
      break;

    case 2:
      $context = 'day_abbr2';
      break;

    default:
      $context = '';
      break;
  }
  foreach (date_week_days_untranslated() as $key => $day) {
    $weekdays[$key] = t(substr($day, 0, $length), array(), array('context' => $context));
  }
  $none = array('' => '');
  return !$required ? $none + $weekdays : $weekdays;
}

/**
 * Reorders weekdays to match the first day of the week.
 *
 * @param array $weekdays
 *   An array of weekdays.
 *
 * @return array
 *   An array of weekdays reordered to match the first day of the week.
 */
function date_week_days_ordered($weekdays) {
  $first_day = config_get('system.date','first_day');
  if ($first_day > 0) {
    for ($i = 1; $i <= $first_day; $i++) {
      $last = array_shift($weekdays);
      array_push($weekdays, $last);
    }
  }
  return $weekdays;
}

/**
 * Constructs an array of years.
 *
 * @param int $start
 *   The start year in the array.
 * @param int $end
 *   The end year in the array.
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 *
 * @return array
 *   An array of years in the selected range.
 */
function date_years($start = 0, $end = 0, $required = FALSE) {
  // Ensure $min and $max are valid values.
  if (empty($start)) {
    $start = intval(date('Y', REQUEST_TIME) - 3);
  }
  if (empty($end)) {
    $end = intval(date('Y', REQUEST_TIME) + 3);
  }
  $none = array(0 => '');
  return !$required ? $none + backdrop_map_assoc(range($start, $end)) : backdrop_map_assoc(range($start, $end));
}

/**
 * Constructs an array of days in a month.
 *
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 * @param int $month
 *   (optional) The month in which to find the number of days.
 * @param int $year
 *   (optional) The year in which to find the number of days.
 *
 * @return array
 *   An array of days for the selected month.
 */
function date_days($required = FALSE, $month = NULL, $year = NULL) {
  // If we have a month and year, find the right last day of the month.
  if (!empty($month) && !empty($year)) {
    $date = new BackdropDateTime($year . '-' . $month . '-01 00:00:00', 'UTC');
    $max = $date->format('t');
  }
  // If there is no month and year given, default to 31.
  if (empty($max)) {
    $max = 31;
  }
  $none = array(0 => '');
  return !$required ? $none + backdrop_map_assoc(range(1, $max)) : backdrop_map_assoc(range(1, $max));
}

/**
 * Constructs an array of hours.
 *
 * @param string $format
 *   A date format string.
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 *
 * @return array
 *   An array of hours in the selected format.
 */
function date_hours($format = 'H', $required = FALSE) {
  $hours = array();
  if ($format == 'h' || $format == 'g') {
    $min = 1;
    $max = 12;
  }
  else {
    $min = 0;
    $max = 23;
  }
  for ($i = $min; $i <= $max; $i++) {
    $hours[$i] = $i < 10 && ($format == 'H' || $format == 'h') ? "0$i" : $i;
  }
  $none = array('' => '');
  return !$required ? $none + $hours : $hours;
}

/**
 * Constructs an array of minutes.
 *
 * @param string $format
 *   A date format string.
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 * @param int $increment
 *   (optional) The number by which the minutes should be incremented. Defaults
 *   to 1.
 *
 * @return array
 *   An array of minutes in the selected format.
 */
function date_minutes($format = 'i', $required = FALSE, $increment = 1) {
  $minutes = array();
  // Ensure $increment has a value so we don't loop endlessly.
  if (empty($increment)) {
    $increment = 1;
  }
  for ($i = 0; $i < 60; $i += $increment) {
    $minutes[$i] = $i < 10 && $format == 'i' ? "0$i" : $i;
  }
  $none = array('' => '');
  return !$required ? $none + $minutes : $minutes;
}

/**
 * Constructs an array of seconds.
 *
 * @param string $format
 *   A date format string.
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 * @param int $increment
 *   (optional) The number by which the seconds should be incremented. Defaults
 *   to 1.
 *
 * @return array
 *   An array of seconds in the selected format.
 */
function date_seconds($format = 's', $required = FALSE, $increment = 1) {
  $seconds = array();
  // Ensure $increment has a value so we don't loop endlessly.
  if (empty($increment)) {
    $increment = 1;
  }
  for ($i = 0; $i < 60; $i += $increment) {
    $seconds[$i] = $i < 10 && $format == 's' ? "0$i" : $i;
  }
  $none = array('' => '');
  return !$required ? $none + $seconds : $seconds;
}

/**
 * Constructs an array of AM and PM options.
 *
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 *
 * @return array
 *   An array of AM and PM options.
 */
function date_ampm($required = FALSE) {
  $none = array('' => '');
  $ampm = array(
    'am' => t('am', array(), array('context' => 'ampm')),
    'pm' => t('pm', array(), array('context' => 'ampm')),
  );
  return !$required ? $none + $ampm : $ampm;
}

/**
 * Constructs an array of regex replacement strings for date format elements.
 *
 * @param bool $strict
 *   Whether or not to force 2 digits for elements that sometimes allow either
 *   1 or 2 digits.
 *
 * @return array
 *   An array of date() format letters and their regex equivalents.
 */
function date_format_patterns($strict = FALSE) {
  return array(
    'd' => '\d{' . ($strict ? '2' : '1,2') . '}',
    'm' => '\d{' . ($strict ? '2' : '1,2') . '}',
    'h' => '\d{' . ($strict ? '2' : '1,2') . '}',
    'H' => '\d{' . ($strict ? '2' : '1,2') . '}',
    'i' => '\d{' . ($strict ? '2' : '1,2') . '}',
    's' => '\d{' . ($strict ? '2' : '1,2') . '}',
    'j' => '\d{1,2}',
    'N' => '\d',
    'S' => '\w{2}',
    'w' => '\d',
    'W' => '\d{1,2}',
    'n' => '\d{1,2}',
    't' => '\d{2}',
    'L' => '\d',
    'o' => '\d{4}',
    'Y' => '-?\d{1,6}',
    'y' => '\d{2}',
    'B' => '\d{3}',
    'g' => '\d{1,2}',
    'G' => '\d{1,2}',
    'e' => '\w*',
    'I' => '\d',
    'T' => '\w*',
    'U' => '\d*',
    'z' => '[+-]?\d*',
    // Using S instead of w and 3 as well as 4 to pick up non-ASCII chars like
    // German umlaut. Per http://drupal.org/node/1101284, we may need as little
    // as 2 and as many as 5 characters in some languages.
    'D' => '\S{2,5}',
    'l' => '\S*',
    'M' => '\S{2,5}',
    'F' => '\S*',
    'P' => '[+-]?\d{2}\:\d{2}',
    'O' => '[+-]\d{4}',
    'c' => '(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]?\d{2}\:\d{2})',
    'r' => '(\w{3}), (\d{2})\s(\w{3})\s(\d{2,4})\s(\d{2}):(\d{2}):(\d{2})([+-]?\d{4})?',
  );
}

/**
 * Constructs an array of granularity options and their labels.
 *
 * @return array
 *   An array of translated date parts, keyed by their machine name.
 */
function date_granularity_names() {
  return array(
    'year' => t('Year', array(), array('context' => 'datetime')),
    'month' => t('Month', array(), array('context' => 'datetime')),
    'day' => t('Day', array(), array('context' => 'datetime')),
    'hour' => t('Hour', array(), array('context' => 'datetime')),
    'minute' => t('Minute', array(), array('context' => 'datetime')),
    'second' => t('Second', array(), array('context' => 'datetime')),
  );
}

/**
 * Sorts a granularity array.
 *
 * @param array $granularity
 *   An array of date parts.
 *
 * @return array
 *   The list of date parts sorted from largest to smallest granularity.
 */
function date_granularity_sorted($granularity) {
  return array_intersect(array(
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
  ), $granularity);
}

/**
 * Constructs an array of granularity based on a given precision.
 *
 * @param string $precision
 *   A granularity item.
 *
 * @return array
 *   A granularity array containing the given precision and all those above it.
 *   For example, passing in 'month' will return array('year', 'month').
 */
function date_granularity_array_from_precision($precision) {
  $granularity_array = array('year', 'month', 'day', 'hour', 'minute', 'second');
  switch ($precision) {
    case 'year':
      return array_slice($granularity_array, -6, 1);

    case 'month':
      return array_slice($granularity_array, -6, 2);

    case 'day':
      return array_slice($granularity_array, -6, 3);

    case 'hour':
      return array_slice($granularity_array, -6, 4);

    case 'minute':
      return array_slice($granularity_array, -6, 5);

    default:
      return $granularity_array;
  }
}

/**
 * Give a granularity array, return the highest precision.
 *
 * @param array $granularity_array
 *   An array of date parts.
 *
 * @return string
 *   The most precise element in a granularity array.
 */
function date_granularity_precision($granularity_array) {
  $input = date_granularity_sorted($granularity_array);
  return array_pop($input);
}

/**
 * Returns a translated array of timezone names.
 *
 * Cache the untranslated array, make the translated array a static variable.
 *
 * @param bool $required
 *   (optional) If FALSE, the returned array will include a blank value.
 *   Defaults to FALSE.
 * @param bool $refresh
 *   (optional) Whether to refresh the list. Defaults to FALSE.
 *
 * @return array
 *   An array of timezone names.
 */
function date_timezone_names($required = FALSE, $refresh = FALSE) {
  static $zone_names;
  if (empty($zone_names) || $refresh) {
    $cached = cache_get('date_timezone_identifiers_list');
    $zone_names = !empty($cached) ? $cached->data : array();
    if ($refresh || empty($cached) || empty($zone_names)) {
      $data = timezone_identifiers_list();
      asort($data);
      foreach ($data as $delta => $zone) {
        // Because many timezones exist in PHP only for backward compatibility
        // reasons and should not be used, the list is filtered by a regular
        // expression.
        if (preg_match('!^((Africa|America|Antarctica|Arctic|Asia|Atlantic|Australia|Europe|Indian|Pacific)/|UTC$)!', $zone)) {
          $zone_names[$zone] = $zone;
        }
      }

      if (!empty($zone_names)) {
        cache_set('date_timezone_identifiers_list', $zone_names);
      }
    }
    foreach ($zone_names as $zone) {
      $zone_names[$zone] = t('!timezone', array('!timezone' => t($zone)));
    }
  }
  $none = array('' => '');
  return !$required ? $none + $zone_names : $zone_names;
}

/**
 * Returns an array of system-allowed timezone abbreviations.
 *
 * Cache an array of just the abbreviation names because the whole
 * timezone_abbreviations_list() is huge, so we don't want to retrieve it more
 * than necessary.
 *
 * @param bool $refresh
 *   (optional) Whether to refresh the list. Defaults to TRUE.
 *
 * @return array
 *   An array of allowed timezone abbreviations.
 */
function date_timezone_abbr($refresh = FALSE) {
  $cached = cache_get('date_timezone_abbreviations');
  $data = isset($cached->data) ? $cached->data : array();
  if (empty($data) || $refresh) {
    $data = array_keys(timezone_abbreviations_list());
    cache_set('date_timezone_abbreviations', $data);
  }
  return $data;
}


/**
 * Formats a date, using a date type or a custom date format string.
 *
 * Reworked from Drupal's format_date function to handle pre-1970 and
 * post-2038 dates and accept a date object instead of a timestamp as input.
 * Translates formatted date results, unlike PHP function date_format().
 * Should only be used for display, not input, because it can't be parsed.
 *
 * @param object $date
 *   A date object.
 * @param string $type
 *   (optional) The date format to use. Can be 'small', 'medium' or 'large' for
 *   the preconfigured date formats. If 'custom' is specified, then $format is
 *   required as well. Defaults to 'medium'.
 * @param string $format
 *   (optional) A PHP date format string as required by date(). A backslash
 *   should be used before a character to avoid interpreting the character as
 *   part of a date format. Defaults to an empty string.
 * @param string $langcode
 *   (optional) Language code to translate to. Defaults to NULL.
 *
 * @return string
 *   A translated date string in the requested format.
 *
 * @see format_date()
 */
function date_format_date($date, $type = 'medium', $format = '', $langcode = NULL) {
  if (empty($date)) {
    return '';
  }
  if ($type != 'custom'){
    //check that we have an entry in system.date.json
    $this_format = system_date_format_load($type, $include_hidden = TRUE);
    if (isset($this_format)){
      $format = $this_format['pattern'];
    }else{
      $this_format = system_date_format_load('medium');
      $format = $this_format['pattern'];
    }
  }
  $format = date_limit_format($format, $date->granularity);
  $max = strlen($format);
  $date_string = '';
  for ($i = 0; $i < $max; $i++) {
    $c = $format[$i];
    switch ($c) {
      case 'l':
        $date_string .= t($date->format('l'), array(), array('context' => '', 'langcode' => $langcode));
        break;

      case 'D':
        $date_string .= t($date->format('D'), array(), array('context' => '', 'langcode' => $langcode));
        break;

      case 'F':
        $date_string .= t($date->format('F'), array(), array('context' => 'Long month name', 'langcode' => $langcode));
        break;

      case 'M':
        $date_string .= t($date->format('M'), array(), array('langcode' => $langcode));
        break;

      case 'A':
      case 'a':
        $date_string .= t($date->format($c), array(), array('context' => 'ampm', 'langcode' => $langcode));
        break;

      // The timezone name translations can use t().
      case 'e':
      case 'T':
        $date_string .= t($date->format($c));
        break;

      // Remaining date parts need no translation.
      case 'O':
        $date_string .= sprintf('%s%02d%02d', (date_offset_get($date) < 0 ? '-' : '+'), abs(date_offset_get($date) / 3600), abs(date_offset_get($date) % 3600) / 60);
        break;

      case 'P':
        $date_string .= sprintf('%s%02d:%02d', (date_offset_get($date) < 0 ? '-' : '+'), abs(date_offset_get($date) / 3600), abs(date_offset_get($date) % 3600) / 60);
        break;

      case 'Z':
        $date_string .= date_offset_get($date);
        break;

      case '\\':
        $date_string .= $format[++$i];
        break;

      case 'r':
        $date_string .= date_format_date($date, 'custom', 'D, d M Y H:i:s O', 'en');
        break;

      default:
        if (strpos('BdcgGhHiIjLmnNosStTuUwWYyz', $c) !== FALSE) {
          $date_string .= $date->format($c);
        }
        else {
          $date_string .= $c;
        }
    }
  }
  return $date_string;
}

/**
 * Formats a time interval with granularity, including past and future context.
 *
 * @param object $date
 *   The current date object.
 * @param int $granularity
 *   (optional) Number of units to display in the string. Defaults to 2.
 *
 * @return string
 *   A translated string representation of the interval.
 *
 * @see format_interval()
 */
function date_format_interval($date, $granularity = 2, $display_ago = TRUE) {
  // If no date is sent, then return nothing.
  if (empty($date)) {
    return NULL;
  }

  $interval = REQUEST_TIME - $date->format('U');
  if ($interval > 0) {
    return $display_ago ? t('!time ago', array('!time' => format_interval($interval, $granularity))) :
      t('!time', array('!time' => format_interval($interval, $granularity)));
  }
  else {
    return format_interval(abs($interval), $granularity);
  }
}

/**
 * A date object for the current time.
 *
 * @param object $timezone
 *   (optional) Optionally force time to a specific timezone, defaults to user
 *   timezone, if set, otherwise site timezone. Defaults to NULL.
 *
 * @param bool $reset
 *   (optional) Static cache reset.
 *
 * @return BackdropDateTime
 *   The current time as a date object.
 */
function date_now($timezone = NULL, $reset = FALSE) {
  $now = &backdrop_static(__FUNCTION__ . $timezone);

  if (!isset($now) || $reset) {
    $now = new BackdropDateTime('now', $timezone);
  }

  // Avoid unexpected manipulation of cached $now object
  // by subsequent code execution
  // @see https://drupal.org/node/2261395
  $clone = clone $now;
  return $clone;
}

/**
 * Determines if a timezone string is valid.
 *
 * @param string $timezone
 *   A potentially invalid timezone string.
 *
 * @return bool
 *   TRUE if the timezone is valid, FALSE otherwise.
 */
function date_timezone_is_valid($timezone) {
  static $timezone_names;
  if (empty($timezone_names)) {
    $timezone_names = array_keys(date_timezone_names(TRUE));
  }
  return in_array($timezone, $timezone_names);
}

/**
 * Returns a timezone name to use as a default.
 *
 * @param bool $check_user
 *   (optional) Whether or not to check for a user-configured timezone.
 *   Defaults to TRUE.
 *
 * @return string
 *   The default timezone for a user, if available, otherwise the site.
 */
function date_default_timezone($check_user = TRUE) {
  global $user;
  if ($check_user && config_get('system.date','user_configurable_timezones') && !empty($user->timezone)) {
    return $user->timezone;
  }
  else {
    $default = config_get('system.date','default_timezone');
    return empty($default) ? 'UTC' : $default;
  }
}

/**
 * Returns a timezone object for the default timezone.
 *
 * @param bool $check_user
 *   (optional) Whether or not to check for a user-configured timezone.
 *   Defaults to TRUE.
 *
 * @return object
 *   The default timezone for a user, if available, otherwise the site.
 */
function date_default_timezone_object($check_user = TRUE) {
  return timezone_open(date_default_timezone($check_user));
}

/**
 * Identifies the number of days in a month for a date.
 */
function date_days_in_month($year, $month) {
  // Pick a day in the middle of the month to avoid timezone shifts.
  $datetime = date_pad($year, 4) . '-' . date_pad($month) . '-15 00:00:00';
  $date = new BackdropDateTime($datetime);
  return $date->format('t');
}

/**
 * Identifies the number of days in a year for a date.
 *
 * @param mixed $date
 *   (optional) The current date object, or a date string. Defaults to NULL.
 *
 * @return int
 *   The number of days in the year.
 */
function date_days_in_year($date = NULL) {
  if (empty($date)) {
    $date = date_now();
  }
  elseif (!is_object($date)) {
    $date = new BackdropDateTime($date);
  }
  if (is_object($date)) {
    if ($date->format('L')) {
      return 366;
    }
    else {
      return 365;
    }
  }
  return NULL;
}

/**
 * Identifies the number of ISO weeks in a year for a date.
 *
 * December 28 is always in the last ISO week of the year.
 *
 * @param mixed $date
 *   (optional) The current date object, or a date string. Defaults to NULL.
 *
 * @return int
 *   The number of ISO weeks in a year.
 */
function date_iso_weeks_in_year($date = NULL) {
  if (empty($date)) {
    $date = date_now();
  }
  elseif (!is_object($date)) {
    $date = new BackdropDateTime($date);
  }

  if (is_object($date)) {
    date_date_set($date, $date->format('Y'), 12, 28);
    return $date->format('W');
  }
  return NULL;
}

/**
 * Returns day of week for a given date (0 = Sunday).
 *
 * @param mixed $date
 *   (optional) A date, default is current local day. Defaults to NULL.
 *
 * @return int
 *   The number of the day in the week.
 */
function date_day_of_week($date = NULL) {
  if (empty($date)) {
    $date = date_now();
  }
  elseif (!is_object($date)) {
    $date = new BackdropDateTime($date);
  }

  if (is_object($date)) {
    return $date->format('w');
  }
  return NULL;
}

/**
 * Returns translated name of the day of week for a given date.
 *
 * @param mixed $date
 *   (optional) A date, default is current local day. Defaults to NULL.
 * @param string $abbr
 *   (optional) Whether to return the abbreviated name for that day.
 *   Defaults to TRUE.
 *
 * @return string
 *   The name of the day in the week for that date.
 */
function date_day_of_week_name($date = NULL, $abbr = TRUE) {
  if (!is_object($date)) {
    $date = new BackdropDateTime($date);
  }
  $dow = date_day_of_week($date);
  $days = $abbr ? date_week_days_abbr() : date_week_days();
  return $days[$dow];
}

/**
 * Calculates the start and end dates for a calendar week.
 *
 * The dates are adjusted to use the chosen first day of week for this site.
 *
 * @param int $week
 *   The week value.
 * @param int $year
 *   The year value.
 *
 * @return array
 *   A numeric array containing the start and end dates of a week.
 */
function date_week_range($week, $year) {
  $first_day = config_get('system.date','first_day');

  // If the first day of the week is Monday, use the ISO-8601 defined range.
  // See https://en.wikipedia.org/wiki/Week#Week_numbering
  if ($first_day == 1) {
    return date_iso_week_range($week, $year);
  }

  $min_date = new BackdropDateTime($year . '-01-01 00:00:00');
  $min_date->setTimezone(date_default_timezone_object());

  // Move to the right week.
  date_modify($min_date, '+' . strval(7 * ($week - 1)) . ' days');

  // Move backwards to the first day of the week.
  $day_wday = date_format($min_date, 'w');
  date_modify($min_date, '-' . strval((7 + $day_wday - $first_day) % 7) . ' days');

  // Move forwards to the last day of the week.
  $max_date = clone($min_date);
  date_modify($max_date, '+6 days');

  if (date_format($min_date, 'Y') != $year) {
    $min_date = new BackdropDateTime($year . '-01-01 00:00:00');
  }
  return array($min_date, $max_date);
}

/**
 * Calculates the start and end dates for an ISO week.
 *
 * See https://en.wikipedia.org/wiki/Week#Week_numbering.
 *
 * @param int $week
 *   The week value.
 * @param int $year
 *   The year value.
 *
 * @return array
 *   A numeric array containing the start and end dates of an ISO week.
 */
function date_iso_week_range($week, $year) {
  // Get to the last ISO week of the previous year.
  $min_date = new BackdropDateTime(($year - 1) . '-12-28 00:00:00');
  date_timezone_set($min_date, date_default_timezone_object());

  // Find the first day of the first ISO week in the year.
  date_modify($min_date, '+1 Monday');

  // Jump ahead to the desired week for the beginning of the week range.
  if ($week > 1) {
    date_modify($min_date, '+ ' . ($week - 1) . ' weeks');
  }

  // Move forwards to the last day of the week.
  $max_date = clone($min_date);
  date_modify($max_date, '+6 days');
  return array($min_date, $max_date);
}

/**
 * The number of calendar weeks in a year.
 *
 * PHP week functions return the ISO week, not the calendar week.
 *
 * @param int $year
 *   A year value.
 *
 * @return int
 *   Number of calendar weeks in selected year.
 */
function date_weeks_in_year($year) {
  $date = new BackdropDateTime(($year + 1) . '-01-01 12:00:00', 'UTC');
  date_modify($date, '-1 day');
  return date_week($date->format('Y-m-d'));
}

/**
 * The calendar week number for a date.
 *
 * PHP week functions return the ISO week, not the calendar week.
 *
 * @param string $date
 *   A date string in the format Y-m-d.
 *
 * @return int
 *   The calendar week number.
 */
function date_week($date) {
  $date = substr($date, 0, 10);
  $parts = explode('-', $date);
  $first_day = config_get('system.date','first_day');

  $date = new BackdropDateTime($date . ' 12:00:00', 'UTC');

  // If we are using ISO weeks, this is easy.
  if ($first_day == 1) {
    return intval($date->format('W'));
  }

  $year_date = new BackdropDateTime($parts[0] . '-01-01 12:00:00', 'UTC');
  $week = intval($date->format('W'));
  $year_week = intval(date_format($year_date, 'W'));
  $date_year = intval($date->format('o'));

  // Remove the leap week if it's present.
  if ($date_year > intval($parts[0])) {
    $last_date = clone($date);
    date_modify($last_date, '-7 days');
    $week = date_format($last_date, 'W') + 1;
  }
  elseif ($date_year < intval($parts[0])) {
    $week = 0;
  }

  if ($year_week != 1) {
    $week++;
  }

  // Convert to ISO-8601 day number, to match weeks calculated above.
  $iso_first_day = 1 + ($first_day + 6) % 7;

  // If it's before the starting day, it's the previous week.
  if (intval($date->format('N')) < $iso_first_day) {
    $week--;
  }

  // If the year starts before, it's an extra week at the beginning.
  if (intval(date_format($year_date, 'N')) < $iso_first_day) {
    $week++;
  }

  return $week;
}

/**
 * Helper function to left pad date parts with zeros.
 *
 * Provided because this is needed so often with dates.
 *
 * @param int $value
 *   The value to pad.
 * @param int $size
 *   (optional) Total size expected, usually 2 or 4. Defaults to 2.
 *
 * @return string
 *   The padded value.
 */
function date_pad($value, $size = 2) {
  return sprintf("%0" . $size . "d", $value);
}

/**
 * Determines if the granularity contains a time portion.
 *
 * @param array $granularity
 *   An array of allowed date parts, all others will be removed.
 *
 * @return bool
 *   TRUE if the granularity contains a time portion, FALSE otherwise.
 */
function date_has_time($granularity) {
  if (!is_array($granularity)) {
    $granularity = array();
  }
  $options = array('hour', 'minute', 'second');
  return (bool) count(array_intersect($granularity, $options));
}

/**
 * Determines if the granularity contains a date portion.
 *
 * @param array $granularity
 *   An array of allowed date parts, all others will be removed.
 *
 * @return bool
 *   TRUE if the granularity contains a date portion, FALSE otherwise.
 */
function date_has_date($granularity) {
  if (!is_array($granularity)) {
    $granularity = array();
  }
  $options = array('year', 'month', 'day');
  return (bool) count(array_intersect($granularity, $options));
}

/**
 * Helper function to get a format for a specific part of a date field.
 *
 * @param string $part
 *   The date field part, either 'time' or 'date'.
 * @param string $format
 *   A date format string.
 *
 * @return string
 *   The date format for the given part.
 */
function date_part_format($part, $format) {
  switch ($part) {
    case 'date':
      return date_limit_format($format, array('year', 'month', 'day'));

    case 'time':
      return date_limit_format($format, array('hour', 'minute', 'second'));

    default:
      return date_limit_format($format, array($part));
  }
}

/**
 * Limits a date format to include only elements from a given granularity array.
 *
 * Example:
 *   date_limit_format('F j, Y - H:i', array('year', 'month', 'day'));
 *   returns 'F j, Y'
 *
 * @param string $format
 *   A date format string.
 * @param array $granularity
 *   An array of allowed date parts, all others will be removed.
 *
 * @return string
 *   The format string with all other elements removed.
 */
function date_limit_format($format, $granularity) {
  // Use the advanced backdrop_static() pattern to improve performance.

  static $backdrop_static_fast;
  if (!isset($backdrop_static_fast)) {
    $backdrop_static_fast['formats'] = &backdrop_static(__FUNCTION__);
  }
  $formats = &$backdrop_static_fast['formats'];
  $format_granularity_cid = $format . '|' . implode(',', $granularity);
  if (isset($formats[$format_granularity_cid])) {
    return $formats[$format_granularity_cid];
  }

  // If punctuation has been escaped, remove the escaping. Done using strtr()
  // because it is easier than getting the escape character extracted using
  // preg_replace().
  $replace = array(
    '\-' => '-',
    '\:' => ':',
    "\'" => "'",
    '\. ' => ' . ',
    '\,' => ',',
  );
  $format = strtr($format, $replace);

  // Get the 'T' out of ISO date formats that don't have both date and time.
  if (!date_has_time($granularity) || !date_has_date($granularity)) {
    $format = str_replace('\T', ' ', $format);
    $format = str_replace('T', ' ', $format);
  }

  $regex = array();
  if (!date_has_time($granularity)) {
    $regex[] = '((?<!\\\\)[a|A])';
  }
  // Create regular expressions to remove selected values from string.
  // Use (?<!\\\\) to keep escaped letters from being removed.
  foreach (date_nongranularity($granularity) as $element) {
    switch ($element) {
      case 'year':
        $regex[] = '([\-/\.,:]?\s?(?<!\\\\)[Yy])';
        break;

      case 'day':
        $regex[] = '([\-/\.,:]?\s?(?<!\\\\)[l|D|d|dS|j|jS|N|w|W|z]{1,2})';
        break;

      case 'month':
        $regex[] = '([\-/\.,:]?\s?(?<!\\\\)[FMmn])';
        break;

      case 'hour':
        $regex[] = '([\-/\.,:]?\s?(?<!\\\\)[HhGg])';
        break;

      case 'minute':
        $regex[] = '([\-/\.,:]?\s?(?<!\\\\)[i])';
        break;

      case 'second':
        $regex[] = '([\-/\.,:]?\s?(?<!\\\\)[s])';
        break;

      case 'timezone':
        $regex[] = '([\-/\.,:]?\s?(?<!\\\\)[TOZPe])';
        break;

    }
  }
  // Remove empty parentheses, brackets, pipes.
  $regex[] = '(\(\))';
  $regex[] = '(\[\])';
  $regex[] = '(\|\|)';

  // Remove selected values from string.
  $format = trim(preg_replace($regex, array(), $format));
  // Remove orphaned punctuation at the beginning of the string.
  $format = preg_replace('`^([\-/\.,:\'])`', '', $format);
  // Remove orphaned punctuation at the end of the string.
  $format = preg_replace('([\-/,:\']$)', '', $format);
  $format = preg_replace('(\\$)', '', $format);

  // Trim any whitespace from the result.
  $format = trim($format);

  // After removing the non-desired parts of the format, test if the only things
  // left are escaped, non-date, characters. If so, return nothing.
  // Using S instead of w to pick up non-ASCII characters.
  $test = trim(preg_replace('(\\\\\S{1,3})u', '', $format));
  if (empty($test)) {
    $format = '';
  }

  // Store the return value in the static array for performance.
  $formats[$format_granularity_cid] = $format;

  return $format;
}

/**
 * Converts a format to an ordered array of granularity parts.
 *
 * Example:
 *   date_format_order('m/d/Y H:i')
 *   returns
 *     array(
 *       0 => 'month',
 *       1 => 'day',
 *       2 => 'year',
 *       3 => 'hour',
 *       4 => 'minute',
 *     );
 *
 * @param string $format
 *   A date format string.
 *
 * @return array
 *   An array of ordered granularity elements from the given format string.
 */
function date_format_order($format) {
  $order = array();
  if (empty($format)) {
    return $order;
  }

  $max = strlen($format);
  for ($i = 0; $i <= $max; $i++) {
    if (!isset($format[$i])) {
      break;
    }
    switch ($format[$i]) {
      case 'd':
      case 'j':
        $order[] = 'day';
        break;

      case 'F':
      case 'M':
      case 'm':
      case 'n':
        $order[] = 'month';
        break;

      case 'Y':
      case 'y':
        $order[] = 'year';
        break;

      case 'g':
      case 'G':
      case 'h':
      case 'H':
        $order[] = 'hour';
        break;

      case 'i':
        $order[] = 'minute';
        break;

      case 's':
        $order[] = 'second';
        break;
    }
  }
  return $order;
}

/**
 * Strips out unwanted granularity elements.
 *
 * @param array $granularity
 *   An array like ('year', 'month', 'day', 'hour', 'minute', 'second');
 *
 * @return array
 *   A reduced set of granularitiy elements.
 */
function date_nongranularity($granularity) {
  $options = array(
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
    'timezone',
  );
  return array_diff($options, (array) $granularity);
}


/**
 * Function to figure out which local timezone applies to a date and select it.
 *
 * @param string $handling
 *   The timezone handling.
 * @param string $timezone
 *   (optional) A timezone string. Defaults to an empty string.
 *
 * @return string
 *   The timezone string.
 */
function date_get_timezone($handling, $timezone = '') {
  switch ($handling) {
    case 'date':
      $timezone = !empty($timezone) ? $timezone : date_default_timezone();
      break;

    case 'utc':
      $timezone = 'UTC';
      break;

    default:
      $timezone = date_default_timezone();
  }
  return $timezone > '' ? $timezone : date_default_timezone();
}

/**
 * Function to figure out which DB timezone applies to a date.
 *
 * @param string $handling
 *   The timezone handling.
 * @param string $timezone
 *   (optional) When $handling is 'date', date_get_timezone_db() returns this
 *   value.
 *
 * @return string
 *   The timezone string.
 */
function date_get_timezone_db($handling, $timezone = NULL) {
  switch ($handling) {
    case ('utc'):
    case ('site'):
    case ('user'):
      // These handling modes all convert to UTC before storing in the DB.
      $timezone = 'UTC';
      break;

    case ('date'):
      if ($timezone == NULL) {
        // This shouldn't happen, since it's meaning is undefined. But we need
        // to fall back to *something* that's a legal timezone.
        $timezone = date_default_timezone();
      }
      break;

    case ('none'):
    default:
      $timezone = date_default_timezone();
      break;
  }
  return $timezone;
}

/**
 * Tests validity of a date range string.
 *
 * @param string $string
 *   A min and max year string like '-3:+1'a.
 *
 * @return bool
 *   TRUE if the date range is valid, FALSE otherwise.
 */
function date_range_valid($string) {
  $matches = preg_match('@^([\+\-][0-9]+|[0-9]{4}):([\+\-][0-9]+|[0-9]{4})$@', $string);
  return $matches < 1 ? FALSE : TRUE;
}

/**
 * Splits a string like -3:+3 or 2001:2010 into an array of start and end years.
 *
 * Center the range around the current year, if any, but expand it far
 * enough so it will pick up the year value in the field in case
 * the value in the field is outside the initial range.
 *
 * @param string $string
 *   A min and max year string like '-3:+1'.
 * @param object $date
 *   (optional) A date object. Defaults to NULL.
 *
 * @return array
 *   A numerically indexed array, containing a start and end year.
 */
function date_range_years($string, $date = NULL) {
  $this_year = date_format(date_now(), 'Y');
  list($start_year, $end_year) = explode(':', $string);

  // Valid patterns would be -5:+5, 0:+1, 2008:2010.
  $plus_pattern = '@[\+\-][0-9]{1,4}@';
  $year_pattern = '@^[0-9]{4}@';
  if (!preg_match($year_pattern, $start_year, $matches)) {
    if (preg_match($plus_pattern, $start_year, $matches)) {
      $start_year = $this_year + $matches[0];
    }
    else {
      $start_year = $this_year;
    }
  }
  if (!preg_match($year_pattern, $end_year, $matches)) {
    if (preg_match($plus_pattern, $end_year, $matches)) {
      $end_year = $this_year + $matches[0];
    }
    else {
      $end_year = $this_year;
    }
  }
  // If there is a current value, stretch the range to include it.
  $value_year = is_object($date) ? $date->format('Y') : '';
  if (!empty($value_year)) {
    if ($start_year <= $end_year) {
      $start_year = min($value_year, $start_year);
      $end_year = max($value_year, $end_year);
    }
    else {
      $start_year = max($value_year, $start_year);
      $end_year = min($value_year, $end_year);
    }
  }
  return array($start_year, $end_year);
}

/**
 * Converts a min and max year into a string like '-3:+1'.
 *
 * @param array $years
 *   A numerically indexed array, containing a minimum and maximum year.
 *
 * @return string
 *   A min and max year string like '-3:+1'.
 */
function date_range_string($years) {
  $this_year = date_format(date_now(), 'Y');

  if ($years[0] < $this_year) {
    $min = '-' . ($this_year - $years[0]);
  }
  else {
    $min = '+' . ($years[0] - $this_year);
  }

  if ($years[1] < $this_year) {
    $max = '-' . ($this_year - $years[1]);
  }
  else {
    $max = '+' . ($years[1] - $this_year);
  }

  return $min . ':' . $max;
}


/**
 * Determine if a start/end date combination qualify as 'All day'.
 *
 * @param string $string1
 *   A string date in datetime format for the 'start' date.
 * @param string $string2
 *   A string date in datetime format for the 'end' date.
 * @param string $granularity
 *   (optional) The granularity of the date. Defaults to 'second'.
 * @param int $increment
 *   (optional) The increment of the date. Defaults to 1.
 *
 * @return bool
 *   TRUE if the date is all day, FALSE otherwise.
 */
function date_is_all_day($string1, $string2, $granularity = 'second', $increment = 1) {
  if (empty($string1) || empty($string2)) {
    return FALSE;
  }
  elseif (!in_array($granularity, array('hour', 'minute', 'second'))) {
    return FALSE;
  }

  preg_match('/([0-9]{4}-[0-9]{2}-[0-9]{2}) (([0-9]{2}):([0-9]{2}):([0-9]{2}))/', $string1, $matches);
  $count = count($matches);
  $date1 = $count > 1 ? $matches[1] : '';
  $time1 = $count > 2 ? $matches[2] : '';
  $hour1 = $count > 3 ? intval($matches[3]) : 0;
  $min1 = $count > 4 ? intval($matches[4]) : 0;
  $sec1 = $count > 5 ? intval($matches[5]) : 0;
  preg_match('/([0-9]{4}-[0-9]{2}-[0-9]{2}) (([0-9]{2}):([0-9]{2}):([0-9]{2}))/', $string2, $matches);
  $count = count($matches);
  $date2 = $count > 1 ? $matches[1] : '';
  $time2 = $count > 2 ? $matches[2] : '';
  $hour2 = $count > 3 ? intval($matches[3]) : 0;
  $min2 = $count > 4 ? intval($matches[4]) : 0;
  $sec2 = $count > 5 ? intval($matches[5]) : 0;
  if (empty($date1) || empty($date2)) {
    return FALSE;
  }
  if (empty($time1) || empty($time2)) {
    return FALSE;
  }

  $tmp = date_seconds('s', TRUE, $increment);
  $max_seconds = intval(array_pop($tmp));
  $tmp = date_minutes('i', TRUE, $increment);
  $max_minutes = intval(array_pop($tmp));

  // See if minutes and seconds are the maximum allowed for an increment or the
  // maximum possible (59), or 0.
  switch ($granularity) {
    case 'second':
      $min_match = $time1 == '00:00:00'
        || ($hour1 == 0 && $min1 == 0 && $sec1 == 0);
      $max_match = $time2 == '00:00:00'
        || ($hour2 == 23 && in_array($min2, array($max_minutes, 59)) && in_array($sec2, array($max_seconds, 59)))
        || ($hour1 == 0 && $hour2 == 0 && $min1 == 0 && $min2 == 0 && $sec1 == 0 && $sec2 == 0);
      break;

    case 'minute':
      $min_match = $time1 == '00:00:00'
        || ($hour1 == 0 && $min1 == 0);
      $max_match = $time2 == '00:00:00'
        || ($hour2 == 23 && in_array($min2, array($max_minutes, 59)))
        || ($hour1 == 0 && $hour2 == 0 && $min1 == 0 && $min2 == 0);
      break;

    case 'hour':
      $min_match = $time1 == '00:00:00'
        || ($hour1 == 0);
      $max_match = $time2 == '00:00:00'
        || ($hour2 == 23)
        || ($hour1 == 0 && $hour2 == 0);
      break;

    default:
      $min_match = TRUE;
      $max_match = FALSE;
  }

  if ($min_match && $max_match) {
    return TRUE;
  }

  return FALSE;
}

/**
 * Helper function to round minutes and seconds to requested value.
 */
function date_increment_round(&$date, $increment) {
  // Round minutes and seconds, if necessary.
  if (is_object($date) && $increment > 1) {
    $day = intval(date_format($date, 'j'));
    $hour = intval(date_format($date, 'H'));
    $second = intval(round(intval(date_format($date, 's')) / $increment) * $increment);
    $minute = intval(date_format($date, 'i'));
    if ($second == 60) {
      $minute += 1;
      $second = 0;
    }
    $minute = intval(round($minute / $increment) * $increment);
    if ($minute == 60) {
      $hour += 1;
      $minute = 0;
    }
    date_time_set($date, $hour, $minute, $second);
    if ($hour == 24) {
      $day += 1;
      $hour = 0;
      $year = date_format($date, 'Y');
      $month = date_format($date, 'n');
      date_date_set($date, $year, $month, $day);
    }
  }
  return $date;
}

/**
 * Determines if a date object is valid.
 *
 * @param object $date
 *   The date object to check.
 *
 * @return bool
 *   TRUE if the date is a valid date object, FALSE otherwise.
 */
function date_is_date($date) {
  if (empty($date) || !is_object($date) || !empty($date->errors)) {
    return FALSE;
  }
  return TRUE;
}

/**
 * Replace specific ISO values using patterns.
 *
 * Function will replace ISO values that have the pattern 9999-00-00T00:00:00
 * with a pattern like 9999-01-01T00:00:00, to match the behavior of non-ISO dates
 * and ensure that date objects created from this value contain a valid month
 * and day.
 * Without this fix, the ISO date '2020-00-00T00:00:00' would be created as
 * November 30, 2019 (the previous day in the previous month).
 *
 * @param string $iso_string
 *   An ISO string that needs to be made into a complete, valid date.
 *
 * @return mixed|string
 *   replaced value, or incoming value.
 *
 * @TODO Expand on this to work with all sorts of partial ISO dates.
 */
function date_make_iso_valid($iso_string) {
  // If this isn't a value that uses an ISO pattern, there is nothing to do.
  if (is_numeric($iso_string) || !preg_match(DATE_REGEX_ISO, $iso_string)) {
    return $iso_string;
  }
  // First see if month and day parts are '-00-00'.
  if (substr($iso_string, 4, 6) == '-00-00') {
    return preg_replace('/([\d]{4}-)(00-00)(T[\d]{2}:[\d]{2}:[\d]{2})/', '${1}01-01${3}', $iso_string);
  }
  // Then see if the day part is '-00'.
  elseif (substr($iso_string, 7, 3) == '-00') {
    return preg_replace('/([\d]{4}-[\d]{2}-)(00)(T[\d]{2}:[\d]{2}:[\d]{2})/', '${1}01${3}', $iso_string);
  }

  // Fall through, no changes required.
  return $iso_string;
}
