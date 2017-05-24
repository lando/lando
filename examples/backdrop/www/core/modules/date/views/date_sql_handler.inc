<?php
/**
 * @file
 * SQL helper for Date API.
 */

/**
 * A class to manipulate date SQL.
 */
class date_sql_handler {
  var $db_type = NULL;
  var $date_type = DATE_DATETIME;
  // A string timezone name.
  var $db_timezone = 'UTC';
  // A string timezone name.
  var $local_timezone = NULL;
  // Use if the db timezone is stored in a field.
  var $db_timezone_field = NULL;
  // Use if the local timezone is stored in a field.
  var $local_timezone_field = NULL;
  // Use if the offset is stored in a field.
  var $offset_field = NULL;

  /**
   * @var string
   * The granularity of the adjustment. Values: SECOND, MINUTE, DAY, HOUR.
   */
  var $granularity;

  /**
   * The object constuctor.
   */
  public function __construct($date_type = DATE_DATETIME, $local_timezone = NULL, $offset = '+00:00') {
    $this->db_type = Database::getConnection()->databaseType();
    $this->date_type = $date_type;
    $this->db_timezone = 'UTC';
    $this->local_timezone = isset($local_timezone) ? $local_timezone : date_default_timezone();
    $this->set_db_timezone($offset);
  }

  /**
   * See if the db has timezone name support.
   */
  public function db_tz_support($reset = FALSE) {
    $has_support = state_get('date_db_tz_support', -1);
    if ($has_support === -1 || $reset) {
      $has_support = FALSE;
      $test = db_query("SELECT CONVERT_TZ('2008-02-15 12:00:00', 'UTC', 'US/Central')")->fetchField();
      if ($test == '2008-02-15 06:00:00') {
        $has_support = TRUE;
      }
      state_set('date_db_tz_support', $has_support);
    }
    return $has_support;
  }

  /**
   * Set the database timzone offset.
   *
   * Setting the db timezone to UTC is done to ensure consistency in date
   * handling whether or not the database can do proper timezone conversion.
   *
   * Views filters that not exposed are cached and won't set the timezone
   * so views date filters should add 'cacheable' => 'no' to their
   * definitions to ensure that the database timezone gets set properly
   * when the query is executed.
   *
   * @param string $offset
   *   An offset value to set the database timezone to. This will only
   *   set a fixed offset, not a timezone, so any value other than
   *   '+00:00' should be used with caution.
   */
  public function set_db_timezone($offset = '+00:00') {
    static $already_set = FALSE;
    $type = Database::getConnection()->databaseType();
    if (!$already_set) {
      switch ($type) {
        case 'mysql':
          db_query("SET @@session.time_zone = '$offset'");
          break;

        case 'pgsql':
          db_query("SET TIME ZONE INTERVAL '$offset' HOUR TO MINUTE");
          break;

        case 'sqlsrv':
          // Issue #1201342, This is the wrong way to set the timezone, this
          // still needs to be fixed. In the meantime, commenting this out makes
          // SQLSRV functional.
          // db_query('TimeZone.setDefault(TimeZone.getTimeZone("GMT"))');
          break;
      }
      $already_set = TRUE;
    }
  }

  /**
   * Return timezone offset for the date being processed.
   */
  public function get_offset($comp_date = NULL) {
    if (!empty($this->db_timezone) && !empty($this->local_timezone)) {
      if ($this->db_timezone != $this->local_timezone) {
        if (empty($comp_date)) {
          $comp_date = date_now($this->db_timezone);
        }
        $comp_date->setTimezone(timezone_open($this->local_timezone));
        return date_offset_get($comp_date);
      }
    }
    return 0;
  }

  /**
   * Helper function to create cross-database SQL dates.
   *
   * @param string $field
   *   The real table and field name, like 'tablename.fieldname' .
   * @param string $offset
   *   The name of a field that holds the timezone offset or an
   *   offset value. If NULL, the normal Backdrop timezone handling
   *   will be used, if $offset = 0 no adjustment will be made.
   *
   * @return string
   *   An appropriate SQL string for the db type and field type.
   */
  function sql_field($field, $offset = NULL, $comp_date = NULL) {
    if (strtoupper($field) == 'NOW') {
      // NOW() will be in UTC since that is what we set the db timezone to.
      $this->local_timezone = 'UTC';
      return $this->sql_offset('NOW()', $offset);
    }
    switch ($this->date_type) {
      case DATE_UNIX:
        $field = "FROM_UNIXTIME($field)";
        break;

      case DATE_ISO:
        $field = "STR_TO_DATE($field, '%Y-%m-%dT%T')";
        break;

      case DATE_DATETIME:
        break;
    }
    // Adjust the resulting value to the right timezone/offset.
    return $this->sql_tz($field, $offset, $comp_date);
  }

  /**
   * Adjust a field value by an offset in seconds.
   */
  function sql_offset($field, $offset = NULL) {
    if (!empty($offset)) {
      return "ADDTIME($field, SEC_TO_TIME($offset))";
    }
    return $field;
  }

  /**
   * Adjusts a field value by time interval.
   *
   * @param string $field
   *   The field to be adjusted.
   * @param string $direction
   *   Either ADD or SUB.
   * @param int $count
   *   The number of values to adjust.
   * @param string $granularity
   *   The granularity of the adjustment, should be singular,
   *   like SECOND, MINUTE, DAY, HOUR.
   */
  function sql_date_math($field, $direction, $count, $granularity) {
    $granularity = strtoupper($granularity);
    switch ($direction) {
      case 'ADD':
        return "DATE_ADD($field, INTERVAL $count $granularity)";

      case 'SUB':
        return "DATE_SUB($field, INTERVAL $count $granularity)";
    }
    return $field;
  }

  /**
   * Select a date value from the database, adjusting the value
   * for the timezone.
   *
   * Check whether database timezone conversion is supported in
   * this system and use it if possible, otherwise use an
   * offset.
   *
   * @param string $field
   *   The field to be adjusted.
   * @param bool $offset
   *   Set a fixed offset or offset field to use for the date.
   *   If set, no timezone conversion will be done and the
   *   offset will be used.
   */
  function sql_tz($field, $offset = NULL, $comp_date = NULL) {
    // If the timezones are values they need to be quoted, but
    // if they are field names they do not.
    $db_zone   = !empty($this->db_timezone_field) ? $this->db_timezone_field : "'{$this->db_timezone}'";
    $localzone = !empty($this->local_timezone_field) ? $this->local_timezone_field : "'{$this->local_timezone}'";
    // If a fixed offset is required, use it.
    if ($offset !== NULL) {
      return $this->sql_offset($field, $offset);
    }
    // If the db and local timezones are the same, make no adjustment.
    elseif ($db_zone == $localzone) {
      return $this->sql_offset($field, 0);
    }
    // If the db has no timezone support, adjust by the offset,
    // could be either a field name or a value.
    elseif (!$this->db_tz_support() || empty($localzone)) {
      if (!empty($this->offset_field)) {
        return $this->sql_offset($field, $this->offset_field);
      }
      else {
        return $this->sql_offset($field, $this->get_offset($comp_date));
      }
    }
    // Otherwise make a database timezone adjustment to the field.
    else {
      return "CONVERT_TZ($field, $db_zone, $localzone)";
    }
  }

  /**
   * Helper function to create cross-database SQL date formatting.
   *
   * @param string $format
   *   A format string for the result, like 'Y-m-d H:i:s' .
   * @param string $field
   *   The real table and field name, like 'tablename.fieldname' .
   *
   * @return string
   *   An appropriate SQL string for the db type and field type.
   */
  function sql_format($format, $field) {
   $replace = array(
      'Y' => '%Y',
      'y' => '%y',
      'M' => '%b',
      'm' => '%m',
      'n' => '%c',
      'F' => '%M',
      'D' => '%a',
      'd' => '%d',
      'l' => '%W',
      'j' => '%e',
      'W' => '%v',
      'H' => '%H',
      'h' => '%h',
      'i' => '%i',
      's' => '%s',
      'A' => '%p',
      '\WW' => 'W%U',
    );
    $format = strtr($format, $replace);
    return "DATE_FORMAT($field, '$format')";
  }

  /**
   * Helper function to create cross-database SQL date extraction.
   *
   * @param string $extract_type
   *   The type of value to extract from the date, like 'MONTH'.
   * @param string $field
   *   The real table and field name, like 'tablename.fieldname'.
   *
   * @return string
   *   An appropriate SQL string for the db type and field type.
   */
  function sql_extract($extract_type, $field) {
    // Note there is no space after FROM to avoid db_rewrite problems
    // see http://drupal.org/node/79904.
    switch (strtoupper($extract_type)) {
      case 'DATE':
        return $field;
      case 'YEAR':
        return "EXTRACT(YEAR FROM($field))";
      case 'MONTH':
        return "EXTRACT(MONTH FROM($field))";
      case 'DAY':
        return "EXTRACT(DAY FROM($field))";
      case 'HOUR':
        return "EXTRACT(HOUR FROM($field))";
      case 'MINUTE':
        return "EXTRACT(MINUTE FROM($field))";
      case 'SECOND':
        return "EXTRACT(SECOND FROM($field))";

      // ISO week number for date.
      case 'WEEK':
        return "WEEK($field, 3)";
      case 'DOW':
        // MySQL returns 1 for Sunday through 7 for Saturday, PHP date
        // functions use 0 for Sunday and 6 for Saturday.
        return "INTEGER(DAYOFWEEK($field) - 1)";
      case 'DOY':
        return "DAYOFYEAR($field)";
    }

    // An unknown function.
    return FALSE;
  }

  /**
   * Creates a where clause to compare a complete date field to a date value.
   *
   * @param string $type
   *   The type of value we're comparing to, could be another field
   *   or a date value.
   * @param string $field
   *   The db table and field name, like "$table.$field".
   * @param string $operator
   *   The db comparison operator to use, like '='.
   * @param int $value
   *   The value to compare the extracted date part to, could be a field name or
   *   a date string or NOW().
   *
   * @return string
   *   SQL for the where clause for this operation.
   */
  function sql_where_date($type, $field, $operator, $value, $adjustment = NULL) {
    $type = strtoupper($type);
    if (strtoupper($value) == 'NOW') {
      $value = $this->sql_field('NOW', $adjustment);
    }
    elseif ($type == 'FIELD') {
      $value = $this->sql_field($value, $adjustment);
    }
    elseif ($type == 'DATE') {
      $date = new BackdropDateTime($value, date_default_timezone(), DATE_FORMAT_DATETIME);
      if (!empty($adjustment)) {
        date_modify($date, $adjustment . ' seconds');
      }
      // When comparing a field to a date we can avoid doing timezone
      // conversion by altering the comparison date to the db timezone.
      // This won't work if the timezone is a field instead of a value.
      if (empty($this->db_timezone_field) && empty($this->local_timezone_field) && $this->db_timezone_field != $this->local_timezone_field) {
        $date->setTimezone(timezone_open($this->db_timezone));
        $this->local_timezone = $this->db_timezone;
      }
      $value = "'" . $date->format(DATE_FORMAT_DATETIME, TRUE) . "'";
    }
    if ($this->local_timezone != $this->db_timezone) {
      $field = $this->sql_field($field);
    }
    else {
      $field = $this->sql_field($field, 0);
    }
    return "$field $operator $value";
  }

  /**
   * Creates a where clause comparing an extracted date part to an integer.
   *
   * @param string $part
   *   The part to extract, YEAR, MONTH, DAY, etc.
   * @param string $field
   *   The db table and field name, like "$table.$field".
   * @param string $operator
   *   The db comparison operator to use, like '=' .
   * @param int $value
   *   The integer value to compare the extracted date part to.
   *
   * @return string
   *   SQL for the where clause for this operation.
   */
  function sql_where_extract($part, $field, $operator, $value, $adjustment = NULL) {
    if (empty($adjustment) && $this->local_timezone != $this->db_timezone) {
      $field = $this->sql_field($field);
    }
    else {
      $field = $this->sql_field($field, $adjustment);
    }
    return $this->sql_extract($part, $field) . " $operator $value";
  }

  /**
   * Create a where clause to compare a formated field to a formated value.
   *
   * @param string $format
   *   The format to use on the date and the value when comparing them.
   * @param string $field
   *   The db table and field name, like "$table.$field".
   * @param string $operator
   *   The db comparison operator to use, like '=' .
   * @param string $value
   *   The value to compare the extracted date part to, could be a
   *   field name or a date string or NOW().
   *
   * @return string
   *   SQL for the where clause for this operation.
   */
  function sql_where_format($format, $field, $operator, $value, $adjustment = NULL) {
    if (empty($adjustment) && $this->local_timezone != $this->db_timezone) {
      $field = $this->sql_field($field);
    }
    else {
      $field = $this->sql_field($field, $adjustment);
    }
    return $this->sql_format($format, $field) . " $operator '$value'";
  }

  /**
   * An array of all date parts,
   * optionally limited to an array of allowed parts.
   */
  function date_parts($limit = NULL) {
    $parts = array(
      'year' => t('Year', array(), array('context' => 'datetime')),
      'month' => t('Month', array(), array('context' => 'datetime')),
      'day' => t('Day', array(), array('context' => 'datetime')),
      'hour' => t('Hour', array(), array('context' => 'datetime')),
      'minute' => t('Minute', array(), array('context' => 'datetime')),
      'second' => t('Second', array(), array('context' => 'datetime')),
    );
    if (!empty($limit)) {
      $last = FALSE;
      foreach ($parts as $key => $part) {
        if ($last) {
          unset($parts[$key]);
        }
        if ($key == $limit) {
          $last = TRUE;
        }
      }
    }
    return $parts;
  }

  /**
   * Part information.
   *
   * @param string $op
   *   'min', 'max', 'format', 'sep', 'empty_now', 'empty_min', 'empty_max' .
   *   Returns all info if empty.
   * @param string $part
   *   'year', 'month', 'day', 'hour', 'minute', or 'second.
   *   returns info for all parts if empty.
   */
  function part_info($op = NULL, $part = NULL) {
    $info = array();
    $info['min'] = array(
      'year' => 100,
      'month' => 1,
      'day' => 1,
      'hour' => 0,
      'minute' => 0,
      'second' => 0,
    );
    $info['max'] = array(
      'year' => 4000,
      'month' => 12,
      'day' => 31,
      'hour' => 23,
      'minute' => 59,
      'second' => 59,
    );
    $info['format'] = array(
      'year' => 'Y',
      'month' => 'm',
      'day' => 'd',
      'hour' => 'H',
      'minute' => 'i',
      'second' => 's',
    );
    $info['sep'] = array(
      'year' => '',
      'month' => '-',
      'day' => '-',
      'hour' => ' ',
      'minute' => ':',
      'second' => ':',
    );
    $info['empty_now'] = array(
      'year' => date('Y'),
      'month' => date('m'),
      'day' => min('28', date('d')),
      'hour' => date('H'),
      'minute' => date('i'),
      'second' => date('s'),
    );
    $info['empty_min'] = array(
      'year' => '1000',
      'month' => '01',
      'day' => '01',
      'hour' => '00',
      'minute' => '00',
      'second' => '00',
    );
    $info['empty_max'] = array(
      'year' => '9999',
      'month' => '12',
      'day' => '31',
      'hour' => '23',
      'minute' => '59',
      'second' => '59',
    );
    if (!empty($op)) {
      if (!empty($part)) {
        return $info[$op][$part];
      }
      else {
        return $info[$op];
      }
    }
    return $info;
  }

  /**
   * Create a complete date/time value out of an incomplete array of values.
   *
   * For example, array('year' => 2008, 'month' => 05) will fill
   * in the day, hour, minute and second with the earliest possible
   * values if type = 'min', the latest possible values if type = 'max',
   * and the current values if type = 'now' .
   */
  function complete_date($selected, $type = 'now') {
    if (empty($selected)) {
      return '';
    }
    // Special case for weeks.
    if (array_key_exists('week', $selected)) {
      $dates = date_week_range($selected['week'], $selected['year']);
      switch ($type) {
        case 'empty_now':
        case 'empty_min':
        case 'min':
          return date_format($dates[0], 'Y-m-d H:i:s');

        case 'empty_max':
        case 'max':
          return date_format($dates[1], 'Y-m-d H:i:s');

        default:
          return '';
      }
    }

    $compare = array_merge($this->part_info('empty_' . $type), $selected);
    // If this is a max date, make sure the last day of
    // the month is the right one for this date.
    if ($type == 'max') {
      $compare['day'] = date_days_in_month($compare['year'], $compare['month']);
    }
    $value = '';
    $separators = $this->part_info('sep');
    foreach ($this->date_parts() as $key => $name) {
      $value .= $separators[$key] . (!empty($selected[$key]) ? $selected[$key] : $compare[$key]);
    }
    return $value;
  }

  /**
   * Converts a format string into help text, i.e. 'Y-m-d' becomes 'YYYY-MM-DD'.
   *
   * @param string $format
   *   A date format string.
   *
   * @return string
   *   The conveted help text.
   */
  function format_help($format) {
    $replace = array(
      'Y' => 'YYYY',
      'm' => 'MM',
      'd' => 'DD',
      'H' => 'HH',
      'i' => 'MM',
      's' => 'SS',
      '\T' => 'T',
    );
    return strtr($format, $replace);
  }

  /**
   * A function to test the validity of various date parts.
   */
  function part_is_valid($value, $type) {
    if (!preg_match('/^[0-9]*$/', $value)) {
      return FALSE;
    }
    $value = intval($value);
    if ($value <= 0) {
      return FALSE;
    }
    switch ($type) {
      case 'year':
        if ($value < DATE_MIN_YEAR) {
          return FALSE;
        }
        break;

      case 'month':
        if ($value < 0 || $value > 12) {
          return FALSE;
        }
        break;

      case 'day':
        if ($value < 0 || $value > 31) {
          return FALSE;
        }
        break;

      case 'week':
        if ($value < 0 || $value > 53) {
          return FALSE;
        }
        break;
    }
    return TRUE;
  }

  /**
   * @todo.
   */
  function views_formats($granularity, $type = 'sql') {
    if (empty($granularity)) {
      return DATE_FORMAT_ISO;
    }
    $formats = array('display', 'sql');
    // Start with the site long date format and add seconds to it.
    $shortformat = system_date_format_load('short');
    $short = str_replace(':i', ':i:s', $shortformat['pattern']);
    switch ($granularity) {
      case 'year':
        $formats['display'] = 'Y';
        $formats['sql'] = 'Y';
        break;

      case 'month':
        $formats['display'] = date_limit_format($short, array('year', 'month'));
        $formats['sql'] = 'Y-m';
        break;

      case 'day':
        $args = array('year', 'month', 'day');
        $formats['display'] = date_limit_format($short, $args);
        $formats['sql'] = 'Y-m-d';
        break;

      case 'hour':
        $args = array('year', 'month', 'day', 'hour');
        $formats['display'] = date_limit_format($short, $args);
        $formats['sql'] = 'Y-m-d\TH';
        break;

      case 'minute':
        $args = array('year', 'month', 'day', 'hour', 'minute');
        $formats['display'] = date_limit_format($short, $args);
        $formats['sql'] = 'Y-m-d\TH:i';
        break;

      case 'second':
        $args = array('year', 'month', 'day', 'hour', 'minute', 'second');
        $formats['display'] = date_limit_format($short, $args);
        $formats['sql'] = 'Y-m-d\TH:i:s';
        break;

      case 'week':
        $formats['display'] = 'F j Y (W)';
        $formats['sql'] = 'Y-\WW';
        break;
    }
    return $formats[$type];
  }

  /**
   * @todo.
   */
  function granularity_form($granularity) {
    $form = array(
      '#title' => t('Granularity'),
      '#type' => 'radios',
      '#default_value' => $granularity,
      '#options' => $this->date_parts(),
    );
    return $form;
  }

  /**
   * Parse date parts from an ISO date argument.
   *
   * Based on ISO 8601 date duration and time interval standards.
   *
   * Parses a value like 2006-01-01--2006-01-15, or 2006-W24, or @P1W.
   * Separate start and end dates or date and period with a double hyphen (--).
   *
   * The 'end' portion of the argument can be eliminated if it is the same as
   * the 'start' portion. Use @ instead of a date to substitute in the current
   * date and time.
   *
   * Use periods (P1H, P1D, P1W, P1M, P1Y) to get next hour/day/week/month/year
   * from now. Use date before P sign to get next hour/day/week/month/year from
   * that date. Use period then date to get a period that ends on the date.
   *
   * @see http://en.wikipedia.org/wiki/ISO_8601#Week_dates
   * @see http://en.wikipedia.org/wiki/ISO_8601#Duration
   */
  function arg_parts($argument) {
    $values = array();
    // Keep mal-formed arguments from creating errors.
    if (empty($argument) || is_array($argument)) {
      return array('date' => array(), 'period' => array());
    }
    $fromto = explode('--', $argument);
    foreach ($fromto as $arg) {
      $parts = array();
      if ($arg == '@') {
        $date = date_now();
        $parts['date'] = $date->toArray();
      }
      elseif (preg_match('/(\d{4})?-?(W)?(\d{1,2})?-?(\d{1,2})?[T\s]?(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/', $arg, $matches)) {
        $date = array();
        if (!empty($matches[1])) {
          $date['year'] = $matches[1];
        }
        if (!empty($matches[3])) {
          if (empty($matches[2])) {
            $date['month'] = $matches[3];
          }
          else {
            $date['week'] = $matches[3];
          }
        }
        if (!empty($matches[4])) {
          $date['day'] = $matches[4];
        }
        if (!empty($matches[5])) {
          $date['hour'] = $matches[5];
        }
        if (!empty($matches[6])) {
          $date['minute'] = $matches[6];
        }
        if (!empty($matches[7])) {
          $date['second'] = $matches[7];
        }
        $parts['date'] = $date;
      }
      if (preg_match('/^P(\d{1,4}[Y])?(\d{1,2}[M])?(\d{1,2}[W])?(\d{1,2}[D])?([T]{0,1})?(\d{1,2}[H])?(\d{1,2}[M])?(\d{1,2}[S])?/', $arg, $matches)) {
        $period = array();
        if (!empty($matches[1])) {
          $period['year'] = str_replace('Y', '', $matches[1]);
        }
        if (!empty($matches[2])) {
          $period['month'] = str_replace('M', '', $matches[2]);
        }
        if (!empty($matches[3])) {
          $period['week'] = str_replace('W', '', $matches[3]);
        }
        if (!empty($matches[4])) {
          $period['day'] = str_replace('D', '', $matches[4]);
        }
        if (!empty($matches[6])) {
          $period['hour'] = str_replace('H', '', $matches[6]);
        }
        if (!empty($matches[7])) {
          $period['minute'] = str_replace('M', '', $matches[7]);
        }
        if (!empty($matches[8])) {
          $period['second'] = str_replace('S', '', $matches[8]);
        }
        $parts['period'] = $period;
      }
      $values[] = $parts;
    }
    return $values;
  }

  /**
   * Convert strings like '+1 day' to the ISO equivalent, like 'P1D' .
   */
  function arg_replace($arg) {
    if (!preg_match('/([+|-])\s?([0-9]{1,32})\s?([day(s)?|week(s)?|month(s)?|year(s)?|hour(s)?|minute(s)?|second(s)?]{1,10})/', $arg, $results)) {
      return str_replace('now', '@', $arg);
    }
    $direction = $results[1];
    $count = $results[2];
    $item = $results[3];
    $replace = array(
      'now' => '@',
      '+' => 'P',
      '-' => 'P-',
      'years' => 'Y',
      'year' => 'Y',
      'months' => 'M',
      'month' => 'M',
      'weeks' => 'W',
      'week' => 'W',
      'days' => 'D',
      'day' => 'D',
      'hours' => 'H',
      'hour' => 'H',
      'minutes' => 'M',
      'minute' => 'M',
      'seconds' => 'S',
      'second' => 'S',
      '  ' => '',
      ' ' => '',
    );
    $args = array('hours', 'hour', 'minutes', 'minute', 'seconds', 'second');
    if (in_array($item, $args)) {
      $prefix = 'T';
    }
    else {
      $prefix = '';
    }
    $return = $prefix;
    $return .= strtr($direction, $replace);
    $return .= $count;
    $return .= strtr($item, $replace);

    return $return;
  }

  /**
   * Granularity arguments handler.
   *
   * Use the parsed values from the ISO argument
   * to determine the granularity of this period.
   */
  function arg_granularity($arg) {
    $granularity = '';
    $parts = $this->arg_parts($arg);
    $date = !empty($parts[0]['date']) ? $parts[0]['date'] : (!empty($parts[1]['date']) ? $parts[1]['date'] : array());
    foreach ($date as $key => $part) {
      $granularity = $key;
    }
    return $granularity;
  }

  /**
   * Use the parsed values from the ISO argument to determine the
   * min and max date for this period.
   */
  function arg_range($arg) {
    // Parse the argument to get its parts.
    $parts = $this->arg_parts($arg);

    // Build a range from a period-only argument (assumes the min date is now.)
    if (empty($parts[0]['date']) && !empty($parts[0]['period']) && (empty($parts[1]))) {
      $min_date = date_now();
      $max_date = clone($min_date);
      foreach ($parts[0]['period'] as $part => $value) {
        date_modify($max_date, "+$value $part");
      }
      date_modify($max_date, '-1 second');
      return array($min_date, $max_date);
    }
    // Build a range from a period to period argument.
    if (empty($parts[0]['date']) && !empty($parts[0]['period']) && !empty($parts[1]['period'])) {
      $min_date = date_now();
      $max_date = clone($min_date);
      foreach ($parts[0]['period'] as $part => $value) {
        date_modify($min_date, "+$value $part");
      }
      date_modify($min_date, '-1 second');
      foreach ($parts[1]['period'] as $part => $value) {
        date_modify($max_date, "+$value $part");
      }
      date_modify($max_date, '-1 second');
      return array($min_date, $max_date);
    }
    if (!empty($parts[0]['date'])) {
      $value = $this->complete_date($parts[0]['date'], 'min');
      $min_date = new BackdropDateTime($value, date_default_timezone(), DATE_FORMAT_DATETIME);
      // Build a range from a single date-only argument.
      if (empty($parts[1]) || (empty($parts[1]['date']) && empty($parts[1]['period']))) {
        $value = $this->complete_date($parts[0]['date'], 'max');
        $max_date = new BackdropDateTime($value, date_default_timezone(), DATE_FORMAT_DATETIME);
        return array($min_date, $max_date);
      }
      // Build a range from start date + period.
      elseif (!empty($parts[1]['period'])) {
        foreach ($parts[1]['period'] as $part => $value) {
          $max_date = clone($min_date);
          date_modify($max_date, "+$value $part");
        }
        date_modify($max_date, '-1 second');
        return array($min_date, $max_date);
      }
    }
    // Build a range from start date and end date.
    if (!empty($parts[1]['date'])) {
      $value = $this->complete_date($parts[1]['date'], 'max');
      $max_date = new BackdropDateTime($value, date_default_timezone(), DATE_FORMAT_DATETIME);
      if (isset($min_date)) {
        return array($min_date, $max_date);
      }
    }
    // Build a range from period + end date.
    if (!empty($parts[0]['period'])) {
      $min_date = date_now();
      foreach ($parts[0]['period'] as $part => $value) {
        date_modify($min_date, "$value $part");
      }
      return array($min_date, $max_date);
    }
    // Intercept invalid info and fall back to the current date.
    $now = date_now();
    return array($now, $now);
  }
}
