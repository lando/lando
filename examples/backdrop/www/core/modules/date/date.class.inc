<?php

/**
 * Extends PHP DateTime class for use with Backdrop.
 *
 * This class provides granularity handling, merge functionality and
 * slightly more flexible initialization parameters.
 */
class BackdropDateTime extends DateTime {
  public $granularity = array();
  public $errors = array();
  protected static $allgranularity = array(
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
    'timezone'
  );

  /**
   * Returns the date object as a string.
   *
   * @return string
   *   The date object formatted as a string.
   */
  public function __toString() {
    return $this->format(DATE_FORMAT_DATETIME) . ' ' . $this->getTimeZone()->getName();
  }

  /**
   * Constructs a date object.
   *
   * @param string $time
   *   A date/time string or array. Defaults to 'now'.
   * @param object|string|null $tz
   *   PHP DateTimeZone object, string or NULL allowed. Defaults to NULL.
   * @param string $format
   *   PHP date() type format for parsing. Doesn't support timezones; if you
   *   have a timezone, send NULL and the default constructor method will
   *   hopefully parse it. $format is recommended in order to use negative or
   *   large years, on which PHP's parser fails.
   */
  public function __construct($time = 'now', $tz = NULL, $format = NULL) {
    $this->timeOnly = FALSE;
    $this->dateOnly = FALSE;

    // Store the raw time input so it is available for validation.
    $this->originalTime = $time;

    // Allow string timezones.
    if (!empty($tz) && !is_object($tz)) {
      $tz = new DateTimeZone($tz);
    }
    // Default to the site timezone when not explicitly provided.
    elseif (empty($tz)) {
      $tz = date_default_timezone_object();
    }
    // Special handling for Unix timestamps expressed in the local timezone.
    // Create a date object in UTC and convert it to the local timezone. Don't
    // try to turn things like '2010' with a format of 'Y' into a timestamp.
    if (is_numeric($time) && (empty($format) || $format == 'U')) {
      // Assume timestamp.
      $time = "@" . $time;
      $date = new BackdropDateTime($time, 'UTC');
      if ($tz->getName() != 'UTC') {
        $date->setTimezone($tz);
      }
      $time = $date->format(DATE_FORMAT_DATETIME);
      $format = DATE_FORMAT_DATETIME;
      $this->addGranularity('timezone');
    }
    elseif (is_array($time)) {
      // Assume we were passed an indexed array.
      if (empty($time['year']) && empty($time['month']) && empty($time['day'])) {
        $this->timeOnly = TRUE;
      }
      if (empty($time['hour']) && empty($time['minute']) && empty($time['second'])) {
        $this->dateOnly = TRUE;
      }
      $this->errors = $this->arrayErrors($time);
      // Make this into an ISO date, forcing a full ISO date even if some values
      // are missing.
      $time = $this->toISO($time, TRUE);
      // We checked for errors already, skip parsing the input values.
      $format = NULL;
    }
    else {
      // Make sure dates like 2010-00-00T00:00:00 get converted to
      // 2010-01-01T00:00:00 before creating a date object
      // to avoid unintended changes in the month or day.
      $time = date_make_iso_valid($time);
    }

    // The parse function will also set errors on the date parts.
    $successfully_parsed = FALSE;
    if (!empty($format)) {
      $arg = self::$allgranularity;
      $element = array_pop($arg);
      while (!$this->parse($time, $tz, $format) && $element != 'year') {
        $element = array_pop($arg);
        $format = date_limit_format($format, $arg);
      }
      $successfully_parsed = empty($this->errors);

      // Remove the invalid error so it can be tried again by PHP's parser.
      if (isset($this->errors['invalid'])) {
        unset($this->errors['invalid']);
      }
    }
    if (!$successfully_parsed && is_string($time)) {
      // PHP < 5.3 doesn't like the GMT- notation for parsing timezones.
      $time = str_replace("GMT-", "-", $time);
      $time = str_replace("GMT+", "+", $time);
      // We are going to let the parent DateTime object do a best effort attempt
      // to turn this string into a valid date. It might fail and we want to
      // control the error messages.
      if (strtotime($time) !== FALSE) {
        parent::__construct($time, $tz);
      }
      else {
        $this->errors['date'] = t('The date "!date" does not match the expected format.', array('!date' => $time));
        return;
      }
      if (empty($this->granularity)) {
        $this->setGranularityFromTime($time, $tz);
      }
    }

    // If we haven't got a valid timezone name yet, we need to set one or
    // we will get undefined index errors.
    // This can happen if $time had an offset or no timezone.
    if (!$this->getTimezone() || !preg_match('/[a-zA-Z]/', $this->getTimezone()->getName())) {

      // If the original $tz has a name, use it.
      if (preg_match('/[a-zA-Z]/', $tz->getName())) {
        $this->setTimezone($tz);
      }
      // We have no information about the timezone so must fallback to a default.
      else {
        $this->setTimezone(new DateTimeZone("UTC"));
        $this->errors['timezone'] = t('No valid timezone name was provided.');
      }
    }
  }

  /**
   * Merges two date objects together using the current date values as defaults.
   *
   * @param BackdropDateTime $other
   *   Another date object to merge with.
   *
   * @return BackdropDateTime
   *   A merged date object.
   */
  public function merge(BackdropDateTime $other) {
    $other_tz = $other->getTimezone();
    $this_tz = $this->getTimezone();
    // Figure out which timezone to use for combination.
    $use_tz = ($this->hasGranularity('timezone') || !$other->hasGranularity('timezone')) ? $this_tz : $other_tz;

    $this2 = clone $this;
    $this2->setTimezone($use_tz);
    $other->setTimezone($use_tz);
    $val = $this2->toArray(TRUE);
    $otherval = $other->toArray();
    foreach (self::$allgranularity as $g) {
      if ($other->hasGranularity($g) && !$this2->hasGranularity($g)) {
        // The other class has a property we don't; steal it.
        $this2->addGranularity($g);
        $val[$g] = $otherval[$g];
      }
    }
    $other->setTimezone($other_tz);

    $this2->setDate($val['year'], $val['month'], $val['day']);
    $this2->setTime($val['hour'], $val['minute'], $val['second']);
    return $this2;
  }

  /**
   * Sets the time zone for the current date.
   *
   * Overrides default DateTime function. Only changes output values if
   * actually had time granularity. This should be used as a "converter" for
   * output, to switch tzs.
   *
   * In order to set a timezone for a datetime that doesn't have such
   * granularity, merge() it with one that does.
   *
   * @param DateTimeZone $timezone
   *   A timezone object.
   * @param bool $force
   *   Whether or not to skip a date with no time. Defaults to FALSE.
   *
   * @return DateTime
   *   This object with the timezone updated.
   */
  public function setTimezone($timezone, $force = FALSE) {
    if (!$this->hasTime() || !$this->hasGranularity('timezone') || $force) {
      // This has no time or timezone granularity, so timezone doesn't mean
      // much. We set the timezone using the method, which will change the
      // day/hour, but then we switch back.
      $arr = $this->toArray(TRUE);
      parent::setTimezone($timezone);
      $this->setDate($arr['year'], $arr['month'], $arr['day']);
      $this->setTime($arr['hour'], $arr['minute'], $arr['second']);
      $this->addGranularity('timezone');
      return $this;
    }
    return parent::setTimezone($timezone);
  }

  /**
   * Returns date formatted according to given format.
   *
   * Overrides base format function, formats this date according to its
   * available granularity, unless $force'ed not to limit to granularity.
   *
   * @TODO Add translation into this so translated names will be provided.
   *
   * @param string $format
   *   A date format string.
   * @param bool $force
   *   Whether or not to limit the granularity. Defaults to FALSE.
   *
   * @return string|false
   *   Returns the formatted date string on success or FALSE on failure.
   */
  public function format($format, $force = FALSE) {
    return parent::format($force ? $format : date_limit_format($format, $this->granularity));
  }

  /**
   * Adds a granularity entry to the array.
   *
   * @param string $g
   *   A single date part.
   */
  public function addGranularity($g) {
    $this->granularity[] = $g;
    $this->granularity = array_unique($this->granularity);
  }

  /**
   * Removes a granularity entry from the array.
   *
   * @param string $g
   *   A single date part.
   */
  public function removeGranularity($g) {
    if (($key = array_search($g, $this->granularity)) !== FALSE) {
      unset($this->granularity[$key]);
    }
  }

  /**
   * Checks granularity array for a given entry.
   *
   * @param array|null $g
   *   An array of date parts. Defaults to NULL.
   *
   * @returns bool
   *   TRUE if the date part is present in the date's granularity.
   */
  public function hasGranularity($g = NULL) {
    if ($g === NULL) {
      // Just want to know if it has something valid means no lower
      // granularities without higher ones.
      $last = TRUE;
      foreach (self::$allgranularity as $arg) {
        if ($arg == 'timezone') {
          continue;
        }
        if (in_array($arg, $this->granularity) && !$last) {
          return FALSE;
        }
        $last = in_array($arg, $this->granularity);
      }
      return in_array('year', $this->granularity);
    }
    if (is_array($g)) {
      foreach ($g as $gran) {
        if (!in_array($gran, $this->granularity)) {
          return FALSE;
        }
      }
      return TRUE;
    }
    return in_array($g, $this->granularity);
  }

  /**
   * Determines if a a date is valid for a given granularity.
   *
   * @param array|null $granularity
   *   An array of date parts. Defaults to NULL.
   * @param bool $flexible
   *   TRUE if the granuliarty is flexible, FALSE otherwise. Defaults to FALSE.
   *
   * @return bool
   *   Whether a date is valid for a given granularity.
   */
  public function validGranularity($granularity = NULL, $flexible = FALSE) {
    $true = $this->hasGranularity() && (!$granularity || $flexible || $this->hasGranularity($granularity));
    if (!$true && $granularity) {
      foreach ((array) $granularity as $part) {
        if (!$this->hasGranularity($part) && in_array($part, array(
              'second',
              'minute',
              'hour',
              'day',
              'month',
              'year')
          )) {
          switch ($part) {
            case 'second':
              $this->errors[$part] = t('The second is missing.');
              break;

            case 'minute':
              $this->errors[$part] = t('The minute is missing.');
              break;

            case 'hour':
              $this->errors[$part] = t('The hour is missing.');
              break;

            case 'day':
              $this->errors[$part] = t('The day is missing.');
              break;

            case 'month':
              $this->errors[$part] = t('The month is missing.');
              break;

            case 'year':
              $this->errors[$part] = t('The year is missing.');
              break;
          }
        }
      }
    }
    return $true;
  }

  /**
   * Returns whether this object has time set.
   *
   * Used primarily for timezone conversion and formatting.
   *
   * @return bool
   *   TRUE if the date contains time parts, FALSE otherwise.
   */
  public function hasTime() {
    return $this->hasGranularity('hour');
  }

  /**
   * Removes unwanted date parts from a date.
   *
   * In common usage we should not unset timezone through this.
   *
   * @param array $granularity
   *   An array of date parts.
   */
  public function limitGranularity($granularity) {
    foreach ($this->granularity as $key => $val) {
      if ($val != 'timezone' && !in_array($val, $granularity)) {
        unset($this->granularity[$key]);
      }
    }
  }

  /**
   * Determines the granularity of a date based on the constructor's arguments.
   *
   * @param string $time
   *   A date string.
   * @param bool $tz
   *   TRUE if the date has a timezone, FALSE otherwise.
   */
  protected function setGranularityFromTime($time, $tz) {
    $this->granularity = array();
    $temp = date_parse($time);
    // Special case for 'now'.
    if ($time == 'now') {
      $this->granularity = array(
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
      );
    }
    else {
      // This PHP date_parse() method currently doesn't have resolution down to
      // seconds, so if there is some time, all will be set.
      foreach (self::$allgranularity as $g) {
        if ((isset($temp[$g]) && is_numeric($temp[$g])) || ($g == 'timezone' && (isset($temp['zone_type']) && $temp['zone_type'] > 0))) {
          $this->granularity[] = $g;
        }
      }
    }
    if ($tz) {
      $this->addGranularity('timezone');
    }
  }

  /**
   * Converts a date string into a date object.
   *
   * @param string $date
   *   The date string to parse.
   * @param object $tz
   *   A timezone object.
   * @param string $format
   *   The date format string.
   *
   * @return object
   *   Returns the date object.
   */
  protected function parse($date, $tz, $format) {
    $array = date_format_patterns();
    foreach ($array as $key => $value) {
      // The letter with no preceding '\'.
      $patterns[] = "`(^|[^\\\\\\\\])" . $key . "`";
      // A single character.
      $repl1[] = '${1}(.)';
      // The.
      $repl2[] = '${1}(' . $value . ')';
    }
    $patterns[] = "`\\\\\\\\([" . implode(array_keys($array)) . "])`";
    $repl1[] = '${1}';
    $repl2[] = '${1}';

    $format_regexp = preg_quote($format);

    // Extract letters.
    $regex1 = preg_replace($patterns, $repl1, $format_regexp, 1);
    $regex1 = str_replace('A', '(.)', $regex1);
    $regex1 = str_replace('a', '(.)', $regex1);
    preg_match('`^' . $regex1 . '$`', stripslashes($format), $letters);
    array_shift($letters);
    // Extract values.
    $regex2 = preg_replace($patterns, $repl2, $format_regexp, 1);
    $regex2 = str_replace('A', '(AM|PM)', $regex2);
    $regex2 = str_replace('a', '(am|pm)', $regex2);
    preg_match('`^' . $regex2 . '$`u', $date, $values);
    array_shift($values);
    // If we did not find all the values for the patterns in the format, abort.
    if (count($letters) != count($values)) {
      $this->errors['invalid'] = t('The value @date does not match the expected format.', array('@date' => $date));
      return FALSE;
    }
    $this->granularity = array();
    $final_date = array(
      'hour' => 0,
      'minute' => 0,
      'second' => 0,
      'month' => 1,
      'day' => 1,
      'year' => 0,
    );
    foreach ($letters as $i => $letter) {
      $value = $values[$i];
      switch ($letter) {
        case 'd':
        case 'j':
          $final_date['day'] = intval($value);
          $this->addGranularity('day');
          break;

        case 'n':
        case 'm':
          $final_date['month'] = intval($value);
          $this->addGranularity('month');
          break;

        case 'F':
          $array_month_long = array_flip(date_month_names());
          $final_date['month'] = array_key_exists($value, $array_month_long) ? $array_month_long[$value] : -1;
          $this->addGranularity('month');
          break;

        case 'M':
          $array_month = array_flip(date_month_names_abbr());
          $final_date['month'] = array_key_exists($value, $array_month) ? $array_month[$value] : -1;
          $this->addGranularity('month');
          break;

        case 'Y':
          $final_date['year'] = $value;
          $this->addGranularity('year');
          if (strlen($value) < 4) {
            $this->errors['year'] = t('The year is invalid. Please check that entry includes four digits.');
          }
          break;

        case 'y':
          $year = $value;
          // If no century, we add the current one ("06" => "2006").
          $final_date['year'] = str_pad($year, 4, substr(date("Y"), 0, 2), STR_PAD_LEFT);
          $this->addGranularity('year');
          break;

        case 'a':
        case 'A':
          $ampm = strtolower($value);
          break;

        case 'g':
        case 'h':
        case 'G':
        case 'H':
          $final_date['hour'] = intval($value);
          $this->addGranularity('hour');
          break;

        case 'i':
          $final_date['minute'] = intval($value);
          $this->addGranularity('minute');
          break;

        case 's':
          $final_date['second'] = intval($value);
          $this->addGranularity('second');
          break;

        case 'U':
          parent::__construct($value, $tz ? $tz : new DateTimeZone("UTC"));
          $this->addGranularity('year');
          $this->addGranularity('month');
          $this->addGranularity('day');
          $this->addGranularity('hour');
          $this->addGranularity('minute');
          $this->addGranularity('second');
          return $this;

      }
    }
    if (isset($ampm) && $ampm == 'pm' && $final_date['hour'] < 12) {
      $final_date['hour'] += 12;
    }
    elseif (isset($ampm) && $ampm == 'am' && $final_date['hour'] == 12) {
      $final_date['hour'] -= 12;
    }

    // Blank becomes current time, given TZ.
    parent::__construct('', $tz ? $tz : new DateTimeZone("UTC"));
    if ($tz) {
      $this->addGranularity('timezone');
    }

    // SetDate expects an integer value for the year, results can be unexpected
    // if we feed it something like '0100' or '0000'.
    $final_date['year'] = intval($final_date['year']);

    $this->errors += $this->arrayErrors($final_date);
    $granularity = backdrop_map_assoc($this->granularity);

    // If the input value is '0000-00-00', PHP's date class will later
    // incorrectly convert it to something like '-0001-11-30' if we do setDate()
    // here. If we don't do setDate() here, it will default to the current date
    // and we will lose any way to tell that there was no date in the orignal
    // input values. So set a flag we can use later to tell that this date
    // object was created using only time values, and that the date values are
    // artifical.
    if (empty($final_date['year']) && empty($final_date['month']) && empty($final_date['day'])) {
      $this->timeOnly = TRUE;
    }
    elseif (empty($this->errors)) {
      // setDate() expects a valid year, month, and day.
      // Set some defaults for dates that don't use this to
      // keep PHP from interpreting it as the last day of
      // the previous month or last month of the previous year.
      if (empty($granularity['month'])) {
        $final_date['month'] = 1;
      }
      if (empty($granularity['day'])) {
        $final_date['day'] = 1;
      }
      $this->setDate($final_date['year'], $final_date['month'], $final_date['day']);
    }

    if (!isset($final_date['hour']) && !isset($final_date['minute']) && !isset($final_date['second'])) {
      $this->dateOnly = TRUE;
    }
    elseif (empty($this->errors)) {
      $this->setTime($final_date['hour'], $final_date['minute'], $final_date['second']);
    }
    return $this;
  }

  /**
   * Returns all standard date parts in an array.
   *
   * Will return '' for parts in which it lacks granularity.
   *
   * @param bool $force
   *   Whether or not to limit the granularity. Defaults to FALSE.
   *
   * @return array
   *   An array of formatted date part values, keyed by date parts.
   */
  public function toArray($force = FALSE) {
    return array(
      'year' => $this->format('Y', $force),
      'month' => $this->format('n', $force),
      'day' => $this->format('j', $force),
      'hour' => intval($this->format('H', $force)),
      'minute' => intval($this->format('i', $force)),
      'second' => intval($this->format('s', $force)),
      'timezone' => $this->format('e', $force),
    );
  }

  /**
   * Creates an ISO date from an array of values.
   *
   * @param array $arr
   *   An array of date values keyed by date part.
   * @param bool $full
   *   (optional) Whether to force a full date by filling in missing values.
   *   Defaults to FALSE.
   *
   * @return string
   *   The date formatted as an ISO-8601 string.
   */
  public function toISO($arr, $full = FALSE) {
    // Add empty values to avoid errors. The empty values must create a valid
    // date or we will get date slippage, i.e. a value of 2011-00-00 will get
    // interpreted as November of 2010 by PHP.
    if ($full) {
      $arr += array(
        'year' => 0,
        'month' => 1,
        'day' => 1,
        'hour' => 0,
        'minute' => 0,
        'second' => 0,
      );
    }
    else {
      $arr += array(
        'year' => '',
        'month' => '',
        'day' => '',
        'hour' => '',
        'minute' => '',
        'second' => '',
      );
    }
    $datetime = '';
    if ($arr['year'] !== '') {
      $datetime = date_pad(intval($arr['year']), 4);
      if ($full || $arr['month'] !== '') {
        $datetime .= '-' . date_pad(intval($arr['month']));
        if ($full || $arr['day'] !== '') {
          $datetime .= '-' . date_pad(intval($arr['day']));
        }
      }
    }
    if ($arr['hour'] !== '') {
      $datetime .= $datetime ? 'T' : '';
      $datetime .= date_pad(intval($arr['hour']));
      if ($full || $arr['minute'] !== '') {
        $datetime .= ':' . date_pad(intval($arr['minute']));
        if ($full || $arr['second'] !== '') {
          $datetime .= ':' . date_pad(intval($arr['second']));
        }
      }
    }
    return $datetime;
  }

  /**
   * Forces an incomplete date to be valid.
   *
   * e.g. Add a valid year, month, and day if only the time has been defined.
   *
   * @param array|string $date
   *   An array of date parts or a datetime string with values to be massaged
   *   into a valid date object.
   * @param string $format
   *   (optional) The format of the date. Defaults to NULL.
   * @param string $default
   *   (optional) If the fallback should use the first value of the date part,
   *   or the current value of the date part. Defaults to 'first'.
   */
  public function setFuzzyDate($date, $format = NULL, $default = 'first') {
    $timezone = $this->getTimeZone() ? $this->getTimeZone()->getName() : NULL;
    $comp = new BackdropDateTime($date, $timezone, $format);
    $arr = $comp->toArray(TRUE);
    foreach ($arr as $key => $value) {
      // Set to intval here and then test that it is still an integer.
      // Needed because sometimes valid integers come through as strings.
      $arr[$key] = $this->forceValid($key, intval($value), $default, $arr['month'], $arr['year']);
    }
    $this->setDate($arr['year'], $arr['month'], $arr['day']);
    $this->setTime($arr['hour'], $arr['minute'], $arr['second']);
  }

  /**
   * Converts a date part into something that will produce a valid date.
   *
   * @param string $part
   *   The date part.
   * @param int $value
   *   The date value for this part.
   * @param string $default
   *   (optional) If the fallback should use the first value of the date part,
   *   or the current value of the date part. Defaults to 'first'.
   * @param int $month
   *   (optional) Used when the date part is less than 'month' to specify the
   *   date. Defaults to NULL.
   * @param int $year
   *   (optional) Used when the date part is less than 'year' to specify the
   *   date. Defaults to NULL.
   *
   * @return int
   *   A valid date value.
   */
  protected function forceValid($part, $value, $default = 'first', $month = NULL, $year = NULL) {
    $now = date_now();
    switch ($part) {
      case 'year':
        $fallback = $now->format('Y');
        return !is_int($value) || empty($value) || $value < DATE_MIN_YEAR || $value > DATE_MAX_YEAR ? $fallback : $value;

      case 'month':
        $fallback = $default == 'first' ? 1 : $now->format('n');
        return !is_int($value) || empty($value) || $value <= 0 || $value > 12 ? $fallback : $value;

      case 'day':
        $fallback = $default == 'first' ? 1 : $now->format('j');
        $max_day = isset($year) && isset($month) ? @date_days_in_month($year, $month) : 31;
        return !is_int($value) || empty($value) || $value <= 0 || $value > $max_day ? $fallback : $value;

      case 'hour':
        $fallback = $default == 'first' ? 0 : $now->format('G');
        return !is_int($value) || $value < 0 || $value > 23 ? $fallback : $value;

      case 'minute':
        $fallback = $default == 'first' ? 0 : $now->format('i');
        return !is_int($value) || $value < 0 || $value > 59 ? $fallback : $value;

      case 'second':
        $fallback = $default == 'first' ? 0 : $now->format('s');
        return !is_int($value) || $value < 0 || $value > 59 ? $fallback : $value;
    }
    return (int) $value;
  }

  /**
   * Finds possible errors in an array of date part values.
   *
   * The forceValid() function will change an invalid value to a valid one, so
   * we just need to see if the value got altered.
   *
   * @param array $arr
   *   An array of date values, keyed by date part.
   *
   * @return array
   *   An array of error messages, keyed by date part.
   */
  public function arrayErrors($arr) {
    $errors = array();
    $now = date_now();
    $default_month = !empty($arr['month']) ? $arr['month'] : $now->format('n');
    $default_year = !empty($arr['year']) ? $arr['year'] : $now->format('Y');

    $this->granularity = array();
    foreach ($arr as $part => $value) {
      // Explicitly set the granularity to the values in the input array.
      if (is_numeric($value)) {
        $this->addGranularity($part);
      }
      // Avoid false errors when a numeric value is input as a string by casting
      // as an integer.
      $value = intval($value);
      if (!empty($value) && $this->forceValid($part, $value, 'now', $default_month, $default_year) != $value) {
        // Use a switch/case to make translation easier by providing a different
        // message for each part.
        switch ($part) {
          case 'year':
            $errors['year'] = t('The year is invalid.');
            break;

          case 'month':
            $errors['month'] = t('The month is invalid.');
            break;

          case 'day':
            $errors['day'] = t('The day is invalid.');
            break;

          case 'hour':
            $errors['hour'] = t('The hour is invalid.');
            break;

          case 'minute':
            $errors['minute'] = t('The minute is invalid.');
            break;

          case 'second':
            $errors['second'] = t('The second is invalid.');
            break;
        }
      }
    }
    if ($this->hasTime()) {
      $this->addGranularity('timezone');
    }
    return $errors;
  }

  /**
   * Computes difference between two days using a given measure.
   *
   * @param object $date2_in
   *   The stop date.
   * @param string $measure
   *   (optional) A granularity date part. Defaults to 'seconds'.
   * @param bool $absolute
   *   (optional) Indicate whether the absolute value of the difference should
   *   be returned or if the sign should be retained. Defaults to TRUE.
   *
   * @return int
   *   The difference in the measurement of the $measure parameter.
   */
  public function difference($date2_in, $measure = 'seconds', $absolute = TRUE) {
    // Create cloned objects or original dates will be impacted by the
    // date_modify() operations done in this code.
    $date1 = clone($this);
    $date2 = clone($date2_in);
    if (is_object($date1) && is_object($date2)) {
      $diff = date_format($date2, 'U') - date_format($date1, 'U');
      if ($diff == 0) {
        return 0;
      }
      elseif ($diff < 0 && $absolute) {
        // Make sure $date1 is the smaller date.
        $temp = $date2;
        $date2 = $date1;
        $date1 = $temp;
        $diff = date_format($date2, 'U') - date_format($date1, 'U');
      }
      $year_diff = intval(date_format($date2, 'Y') - date_format($date1, 'Y'));
      switch ($measure) {
        // The easy cases first.
        case 'seconds':
          return $diff;

        case 'minutes':
          return $diff / 60;

        case 'hours':
          return $diff / 3600;

        case 'years':
          return $year_diff;

        case 'months':
          $format = 'n';
          $item1 = date_format($date1, $format);
          $item2 = date_format($date2, $format);
          if ($year_diff == 0) {
            return intval($item2 - $item1);
          }
          elseif ($year_diff < 0) {
            $item_diff = 0 - $item1;
            $item_diff -= intval((abs($year_diff) - 1) * 12);
            return $item_diff - (12 - $item2);
          }
          else {
            $item_diff = 12 - $item1;
            $item_diff += intval(($year_diff - 1) * 12);
            return $item_diff + $item2;
          }
          break;

        case 'days':
          $format = 'z';
          $item1 = date_format($date1, $format);
          $item2 = date_format($date2, $format);
          if ($year_diff == 0) {
            return intval($item2 - $item1);
          }
          elseif ($year_diff < 0) {
            $item_diff = 0 - $item1;
            for ($i = 1; $i < abs($year_diff); $i++) {
              date_modify($date1, '-1 year');
              $item_diff -= date_days_in_year($date1);
            }
            return $item_diff - (date_days_in_year($date2) - $item2);
          }
          else {
            $item_diff = date_days_in_year($date1) - $item1;
            for ($i = 1; $i < $year_diff; $i++) {
              date_modify($date1, '+1 year');
              $item_diff += date_days_in_year($date1);
            }
            return $item_diff + $item2;
          }
          break;

        case 'weeks':
          $week_diff = date_format($date2, 'W') - date_format($date1, 'W');
          $year_diff = date_format($date2, 'o') - date_format($date1, 'o');

          $sign = ($year_diff < 0) ? -1 : 1;

          for ($i = 1; $i <= abs($year_diff); $i++) {
            date_modify($date1, (($sign > 0) ? '+' : '-') . '1 year');
            $week_diff += (date_iso_weeks_in_year($date1) * $sign);
          }
          return $week_diff;
      }
    }
    return NULL;
  }
}
