<?php
/**
 * @file
 * Theme and preprocess functions for output by Date module.
 */

/**
 * @addtogroup themeable
 * @{
 */

/**
 * Returns HTML for a date timezone element.
 */
function theme_date_timezone($variables) {
  $element = $variables['element'];
  $attributes = $element['#attributes'];

  // Wrap in a div with an ID for #states.
  if (isset($element['#children'])) {
    $element['#children'] = '<div id="' . $element['#id'] . '" class="container-inline-date">' . $element['#children'] . '</div>';
  }
  return '<div ' . backdrop_attributes($attributes) . '>' . theme('form_element', $element) . '</div>';
}

/**
 * Returns HTML for a date text element.
 */
function theme_date_text($variables) {
  $element = $variables['element'];

  // Wrap in a div with an ID for #states.
  if (isset($element['#children'])) {
    $element['#children'] = '<div id="' . $element['#id'] . '" class="container-inline-date">' . $element['#children'] . '</div>';
  }
  return theme('form_element', $element);
}

/**
 * Returns HTML for a "date_select" element, including all child elements.
 */
function theme_date_select($variables) {
  $element = $variables['element'];

  // Wrap in a div with an ID for #states.
  if (isset($element['#children'])) {
    $element['#children'] = '<div id="' . $element['#id'] . '" class="container-inline-date">' . $element['#children'] . '</div>';
  }
  return theme('form_element', $element);
}

/**
 * Returns HTML for a date select input form element.
 *
 * This is for an individual select element (e.g. Year, Month, Day). The
 * complete element is wrapped in theme_date_select().
 */
function theme_date_select_element($variables) {
  $element = $variables['element'];
  $parents = $element['#parents'];
  $part = array_pop($parents);
  return '<div class="date-' . $part . '">' . theme('select', $element) . '</div>';
}

/**
 * Returns HTML for a date textfield input form element.
 */
function theme_date_textfield_element($variables) {
  $element = $variables['element'];
  $parents = $element['#parents'];
  $part = array_pop($parents);
  return '<div class="date-' . $part . '">' . theme('textfield', $element) . '</div>';
}

/**
 * Returns HTML for a date in the format 'time ago'.
 */
function theme_date_time_ago($variables) {
  $start_date = $variables['start_date'];
  $end_date = $variables['end_date'];
  $interval = !empty($variables['interval']) ? $variables['interval'] : 2;
  $display = isset($variables['interval_display']) ? $variables['interval_display'] : 'time ago';

  // If no date is sent, then return nothing.
  if (empty($start_date) || empty($end_date)) {
    return '';
  }

  // Time to compare dates to.
  $now = date_format(date_now(), DATE_FORMAT_UNIX);
  $start = date_format($start_date, DATE_FORMAT_UNIX);

  // Will be positive for a datetime in the past (ago), and negative for a datetime in the future (hence).
  $time_diff = $now - $start;

  // Uses the same options used by Views format_interval.
  switch ($display) {
    case 'raw time ago':
      return format_interval($time_diff, $interval);

    case 'time ago':
      return t('%time ago', array('%time' => format_interval($time_diff, $interval)));

    case 'raw time hence':
      return format_interval(-$time_diff, $interval);

    case 'time hence':
      return t('%time hence', array('%time' => format_interval(-$time_diff, $interval)));

    case 'raw time span':
      return ($time_diff < 0 ? '-' : '') . format_interval(abs($time_diff), $interval);

    case 'inverse time span':
      return ($time_diff > 0 ? '-' : '') . format_interval(abs($time_diff), $interval);

    case 'time span':
      return t(($time_diff < 0 ? '%time hence' : '%time ago'), array('%time' => format_interval(abs($time_diff), $interval)));
  }

  return '';
}

/**
 * Returns HTML for a date element formatted as a Start/End combination.
 *
 *  $entity->date_id
 *    If set, this will show only an individual date on a field with
 *    multiple dates. The value should be a string that contains
 *    the following values, separated with periods:
 *    - module name of the module adding the item
 *    - node nid
 *    - field name
 *    - delta value of the field to be displayed
 *    - other information the module's custom theme might need
 *
 *    Used by the calendar module and available for other uses.
 *    example: 'date.217.field_date.3.test'
 *
 *  $entity->date_repeat_show_all
 *    If true, tells the theme to show all the computed values of a repeating
 *    date. If not true or not set, only the start date and the repeat rule
 *    will be displayed.
 *
 *  $dates['format']
 *    The format string used on these dates
 *  $dates['value']['local']['object']
 *    The local date object for the Start date
 *  $dates['value2']['local']['object']
 *    The local date object for the End date
 *  $dates['value']['local']['datetime']
 *    The datetime value of the Start date database (GMT) value
 *  $dates['value2']['local']['datetime']
 *    The datetime value of the End date database (GMT) value
 *  $dates['value']['formatted']
 *    Formatted Start date, i.e. 'February 15, 2007 2:00 pm';
 *  $dates['value']['formatted_date']
 *    Only the date part of the formatted Start date
 *  $dates['value']['formatted_time']
 *    Only the time part of the formatted Start date
 *  $dates['value2']['formatted']
 *    Formatted End date, i.e. 'February 15, 2007 6:00 pm';
 *  $dates['value2']['formatted_date']
 *    Only the date part of the formatted End date
 *  $dates['value2']['formatted_time']
 *    Only the time part of the formatted End date
 */
function theme_date_display_combination($variables) {
  $entity_type = $variables['entity_type'];
  $entity      = $variables['entity'];
  $field       = $variables['field'];
  $instance    = $variables['instance'];
  $langcode    = $variables['langcode'];
  $item        = $variables['item'];
  $delta       = $variables['delta'];
  $display     = $variables['display'];
  $field_name  = $field['field_name'];
  $formatter   = $display['type'];
  $options     = $display['settings'];
  $dates       = $variables['dates'];
  $attributes  = $variables['attributes'];
  $precision   = date_granularity_precision($field['settings']['granularity']);
  $show_remaining_days = $variables['show_remaining_days'];

  $output = '';

  // If date_id is set for this field and delta doesn't match, don't display it.
  if (!empty($entity->date_id)) {
    foreach ((array) $entity->date_id as $key => $id) {
      list($module, $nid, $field_name, $item_delta, $other) = explode('.', $id . '.');
      if ($field_name == $field['field_name'] && isset($delta) && $item_delta != $delta) {
        return $output;
      }
    }
  }

  // If this is a full node or a pseudo node created by grouping multiple
  // values, see exactly which values are supposed to be visible.
  if (isset($entity->$field_name)) {
    $entity = date_prepare_entity($formatter, $entity_type, $entity, $field, $instance, $langcode, $item, $display);
    // Did the current value get removed by formatter settings?
    if (empty($entity->{$field_name}[$langcode][$delta])) {
      return $output;
    }
    // Adjust the $element values to match the changes.
    $element['#entity'] = $entity;
  }

  switch ($options['fromto']) {
    case 'value':
      $date1 = $dates['value']['formatted'];
      $date2 = $date1;
      break;

    case 'value2':
      $date2 = $dates['value2']['formatted'];
      $date1 = $date2;
      break;

    default:
      $date1 = $dates['value']['formatted'];
      $date2 = $dates['value2']['formatted'];
      break;
  }

  // Pull the timezone, if any, out of the formatted result and tack it back on
  // at the end, if it is in the current formatted date.
  $timezone = $dates['value']['formatted_timezone'];
  if ($timezone) {
    $timezone = ' ' . $timezone;
  }
  $date1 = str_replace($timezone, '', $date1);
  $date2 = str_replace($timezone, '', $date2);
  $time1 = preg_replace('`^([\(\[])`', '', $dates['value']['formatted_time']);
  $time1 = preg_replace('([\)\]]$)', '', $time1);
  $time2 = preg_replace('`^([\(\[])`', '', $dates['value2']['formatted_time']);
  $time2 = preg_replace('([\)\]]$)', '', $time2);

  // A date with a granularity of 'hour' has a time string that is an integer
  // value. We can't use that to replace time strings in formatted dates.
  $has_time_string = date_has_time($field['settings']['granularity']);
  if ($precision == 'hour') {
    $has_time_string = FALSE;
  }

  // Check remaining days.
  $show_remaining_days = '';
  if (!empty($variables['show_remaining_days'])) {
    $remaining_days = floor((strtotime($variables['dates']['value']['formatted_iso'])
    - strtotime('now')) / (24 * 3600));

    // Show remaining days only for future events.
    if ($remaining_days >= 0) {
      $show_remaining_days = theme('date_display_remaining', array(
        'remaining_days' => $remaining_days,
      ));
    }
  }

  // No date values, display nothing.
  if (empty($date1) && empty($date2)) {
    $output .= '';
  }
  // Start and End dates match or there is no End date, display a complete
  // single date.
  elseif ($date1 == $date2 || empty($date2)) {
    $output .= theme('date_display_single', array(
      'date' => $date1,
      'timezone' => $timezone,
      'attributes' => $attributes,
      'dates' => $dates,
      'show_remaining_days' => $show_remaining_days,
    ));
  }
  // Same day, different times, don't repeat the date but show both Start and
  // End times. We can NOT do this if the replacement value is an integer
  // instead of a time string.
  elseif ($has_time_string && $dates['value']['formatted_date'] == $dates['value2']['formatted_date']) {
    // Replace the original time with the start/end time in the formatted start
    // date. Make sure that parentheses or brackets wrapping the time will be
    // retained in the final result.
    $time = theme('date_display_range', array(
      'date1' => $time1,
      'date2' => $time2,
      'timezone' => $timezone,
      'attributes' => $attributes,
      'dates' => $dates,
      'show_remaining_days' => $show_remaining_days,
    ));
    $replaced = str_replace($time1, $time, $date1);
    $output .= theme('date_display_single', array(
      'date' => $replaced,
      'timezone' => $timezone,
      'attributes' => array(),
      'dates' => $dates,
    ));
  }
  // Different days, display both in their entirety.
  else {
    $output .= theme('date_display_range', array(
      'date1' => $date1,
      'date2' => $date2,
      'timezone' => $timezone,
      'attributes' => $attributes,
      'dates' => $dates,
      'show_remaining_days' => $show_remaining_days,
    ));
  }

  return $output;
}

/**
 * Returns HTML for a date element formatted as a single date.
 */
function theme_date_display_single($variables) {
  $date = $variables['date'];
  $timezone = $variables['timezone'];

  $format = $variables['dates']['format'];
  // If timezone is already included in format, suppress it from display
  if ($format == 'Y-m-d\TH:iO') {$timezone = '';}

  $attributes = $variables['attributes'];
  $show_remaining_days = isset($variables['show_remaining_days']) ? $variables['show_remaining_days'] : '';

  // Wrap the result with the attributes.
  $output = '<span class="date-display-single"' . backdrop_attributes($attributes) . '>' . $date . $timezone . '</span>';

  // Add remaining message and return.
  return $output . $show_remaining_days;
}

/**
 * Returns HTML for a date element formatted as a range.
 */
function theme_date_display_range($variables) {
  $date1 = $variables['date1'];
  $date2 = $variables['date2'];
  $timezone = $variables['timezone'];
  $attributes_start = $variables['attributes_start'];
  $attributes_end = $variables['attributes_end'];
  $show_remaining_days = $variables['show_remaining_days'];

  $start_date = '<span class="date-display-start"' . backdrop_attributes($attributes_start) . '>' . $date1 . '</span>';
  $end_date = '<span class="date-display-end"' . backdrop_attributes($attributes_end) . '>' . $date2 . $timezone . '</span>';

  // Wrap the result with the attributes.
  $output = '<span class="date-display-range">' . t('!start-date to !end-date', array(
    '!start-date' => $start_date,
    '!end-date' => $end_date,
  )) . '</span>';

  // Add remaining message and return.
  return $output . $show_remaining_days;
}

/**
 * Returns HTML for a date element formatted as an interval.
 */
function theme_date_display_interval($variables) {
  $entity = $variables['entity'];
  $options = $variables['display']['settings'];
  $dates = $variables['dates'];
  $attributes = $variables['attributes'];

  // Get the formatter settings, either the default settings for this node type
  // or the View settings stored in $entity->date_info.
  if (!empty($entity->date_info) && !empty($entity->date_info->formatter_settings)) {
    $options = $entity->date_info->formatter_settings;
  }

  $time_ago_vars = array(
    'start_date' => $dates['value']['local']['object'],
    'end_date' => $dates['value2']['local']['object'],
    'interval' => $options['interval'],
    'interval_display' => $options['interval_display'],
  );

  if ($return = theme('date_time_ago', $time_ago_vars)) {
    return '<span class="date-display-interval"' . backdrop_attributes($attributes) . ">$return</span>";
  }
  else {
    return '';
  }
}

/**
 * Returns HTML for a start/end date combination on form.
 */
function theme_date_combo($variables) {
  $element = $variables['element'];

  // Group start/end items together in fieldset.
  $fieldset = array(
    '#title' => field_filter_xss(t($element['#title'])) . ' ' . ($element['#delta'] > 0 ? intval($element['#delta'] + 1) : ''),
    '#value' => '',
    '#description' => !empty($element['#fieldset_description']) ? $element['#fieldset_description'] : '',
    '#attributes' => array('class' => array('date-combo')),
    '#children' => $element['#children'],
  );
  // Add marker to required date fields.
  if ($element['#required']) {
    $fieldset['#title'] .= " " . theme('form_required_marker');
  }
  return theme('fieldset', array('element' => $fieldset));
}

/**
 * Returns HTML for the text/select options for date parts in a table.
 */
function theme_date_text_parts($variables) {
  $element = $variables['element'];
  $rows = array();
  foreach (date_granularity_names() as $key => $part) {
    if ($element[$key]['#type'] == 'hidden') {
      $rows[] = backdrop_render($element[$key]);
    }
    else {
      $rows[] = array(
        $part,
        backdrop_render($element[$key][0]),
        backdrop_render($element[$key][1]),
      );
    }
  }
  if ($element['year']['#type'] == 'hidden') {
    return implode($rows) . backdrop_render_children($element);
  }
  else {
    $header = array(t('Date part'), t('Select list'), t('Text field'));
    return theme('table', array('header' => $header, 'rows' => $rows)) . backdrop_render_children($element);
  }
}

/**
 * Format a date popup element.
 *
 * Use a class that will float date and time next to each other.
 */
function theme_date_popup($variables) {
  $element = $variables['element'];

  // Wrap in a div with an ID for #states.
  if (isset($element['#children'])) {
    $element['#children'] = '<div id="' . $element['#id'] . '" class="container-inline-date">' . $element['#children'] . '</div>';
  }
  return theme('form_element', $element);
}

/**
 * Returns HTML for remaining message.
 */
function theme_date_display_remaining($variables) {
  $remaining_days = $variables['remaining_days'];
  $show_remaining_text = t('The upcoming date less then 1 day.');
  if ($remaining_days) {
    $show_remaining_text = format_plural($remaining_days, 'To event remaining 1 day', 'To event remaining @count days');
  }

  return '<div class="date-display-remaining"><span class="date-display-remaining">' . $show_remaining_text . '</span></div>';
}

/**
 * Preprocessor for Date Views filter form.
 */
function template_preprocess_date_views_filter_form(&$vars) {
  $form = $vars['form'];
  $vars['date'] = backdrop_render($form['valuedate']);
  $vars['mindate'] = backdrop_render($form['mindate']);
  $vars['maxdate'] = backdrop_render($form['maxdate']);
  $vars['adjustment'] = backdrop_render($form['valueadjustment']);
  $vars['minadjustment'] = backdrop_render($form['minadjustment']);
  $vars['maxadjustment'] = backdrop_render($form['maxadjustment']);
  $vars['description'] = backdrop_render($form['description']) . backdrop_render($form);
}

/** @} End of addtogroup themeable */
