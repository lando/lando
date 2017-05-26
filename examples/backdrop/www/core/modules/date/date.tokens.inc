<?php
/**
 * @file
 * Token module integration.
 */

/**
 * Implements hook_token_info().
 */
function date_token_info() {
  // All date types can share the same date value type.
  $info['types']['date-field-value'] = array(
    'name' => t('Date field values'),
    'description' => t('Tokens related to date field values.'),
    'needs-data' => 'date-field-value',
    'field-value' => TRUE,
  );
  // Provide two tokens: 'date' (the date or start-date), and 'end-date'.
  $info['tokens']['date-field-value']['date'] = array(
    'name' => t('Date'),
    'description' => t('The date value.'),
    'type' => 'date',
  );
  $info['tokens']['date-field-value']['to-date'] = array(
    'name' => t('End Date'),
    'description' => t('The End date value.'),
    'type' => 'date',
  );

  return $info;
}

/**
 * Implements hook_tokens().
 */
function date_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $replacements = array();
  $language_code = isset($options['language']) ? $options['language']->langcode : NULL;

  if (($type == 'date-field-value') && !empty($data['item'])) {
    $item = $data['item'];

    // Create tokens for the field "Date" or "Start date".
    if (($date_tokens = token_find_with_prefix($tokens, 'date')) && !empty($item['value'])) {
      // Load the Start date and convert to a unix timestamp.
      $date = new BackdropDateTime($item['value'], $item['timezone_db'], date_type_format($item['date_type']));
      if (!empty($date) && $item['timezone_db'] != $item['timezone']) {
        date_timezone_set($date, timezone_open($item['timezone']));
      }
      $timestamp = !empty($date) ? date_format_date($date, 'custom', 'U') : '';
      // Generate the token replacements, using the date token type provided
      // by system.module.
      $replacements += token_generate('date', $date_tokens, array('date' => $timestamp), $options);
    }

    // Create tokens for the field "End date".
    if (($date_tokens = token_find_with_prefix($tokens, 'end-date')) && !empty($item['value2'])) {
      // Load the to date and convert to a unix timestamp.
      $date = new BackdropDateTime($item['value2'], $item['timezone_db'], date_type_format($item['date_type']));
      if (!empty($date) && $item['timezone_db'] != $item['timezone']) {
        date_timezone_set($date, timezone_open($item['timezone']));
      }
      $timestamp = !empty($date) ? date_format_date($date, 'custom', 'U') : '';
      // Generate the token replacements, using the date token type provided
      // by system.module.
      $replacements += token_generate('date', $date_tokens, array('date' => $timestamp), $options);
    }
  }

  return $replacements;
}
