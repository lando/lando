<?php
/**
 * @file
 * Builds placeholder replacement tokens system-wide data.
 */

/**
 * Implements hook_token_info().
 */
function system_token_info() {
  $types['site'] = array(
    'name' => t('Site information'),
    'description' => t('Tokens for site-wide settings and other global information.'),
  );
  $types['current-page'] = array(
    'name' => t('Current page'),
    'description' => t('Tokens related to the current page request.'),
  );
  $types['current-date'] = array(
    'name' => t('Current date'),
    'description' => t('Tokens related to the current date and time.'),
    'type' => 'date',
  );
  $types['date'] = array(
    'name' => t('Dates'),
    'description' => t('Tokens related to times and dates.'),
    'needs-data' => 'date',
  );
  $types['file'] = array(
    'name' => t('Files'),
    'description' => t('Tokens related to uploaded files.'),
    'needs-data' => 'file',
  );
  $types['url'] = array(
    'name' => t('URL'),
    'description' => t('Tokens related to URLs.'),
    'needs-data' => 'path',
  );
  $types['array'] = array(
    'name' => t('Array'),
    'description' => t('Tokens related to arrays of strings.'),
    'needs-data' => 'array',
  );

  // Site-wide global tokens.
  $site['name'] = array(
    'name' => t('Name'),
    'description' => t('The name of the site.'),
  );
  $site['slogan'] = array(
    'name' => t('Slogan'),
    'description' => t('The slogan of the site.'),
  );
  $site['mail'] = array(
    'name' => t('Email'),
    'description' => t('The administrative email address for the site.'),
  );
  $site['url'] = array(
    'name' => t('URL'),
    'description' => t("The URL of the site's front page."),
    'type' => 'url',
  );
  // @deprecated: Replaced by url:brief.
  $site['url-brief'] = array(
    'name' => t('URL (brief)'),
    'description' => t("The URL of the site's front page without the protocol."),
    'deprecated' => TRUE,
  );
  $site['login-url'] = array(
    'name' => t("Login page"),
    'description' => t("The URL of the site's login page."),
    'type' => 'url',
  );

  // Current page tokens.
  $current_page['title'] = array(
    'name' => t('Title'),
    'description' => t('The title of the current page.'),
  );
  $current_page['url'] = array(
    'name' => t('URL'),
    'description' => t('The URL of the current page.'),
    'type' => 'url',
  );
  $current_page['page-number'] = array(
    'name' => t('Page number'),
    'description' => t('The page number of the current page when viewing paged lists.'),
  );
  $current_page['query'] = array(
    'name' => t('Query string value'),
    'description' => t('The value of a specific query string field of the current page.'),
    'dynamic' => TRUE,
  );

  // URL tokens.
  $url['path'] = array(
    'name' => t('Path'),
    'description' => t('The path component of the URL.'),
  );
  $url['relative'] = array(
    'name' => t('Relative URL'),
    'description' => t('The relative URL.'),
  );
  $url['absolute'] = array(
    'name' => t('Absolute URL'),
    'description' => t('The absolute URL.'),
  );
  $url['brief'] = array(
    'name' => t('Brief URL'),
    'description' => t('The URL without the protocol and trailing backslash.'),
  );
  $url['unaliased'] = array(
    'name' => t('Unaliased URL'),
    'description' => t('The unaliased URL.'),
    'type' => 'url',
  );
  $url['args'] = array(
    'name' => t('Arguments'),
    'description' => t("The specific argument of the current page (e.g. 'arg:1' on the page 'node/1' returns '1')."),
    'type' => 'array',
  );

  // Menu link tokens.
  $menu_link['mlid'] = array(
    'name' => t('Link ID'),
    'description' => t('The unique ID of the menu link.'),
  );
  $menu_link['title'] = array(
    'name' => t('Title'),
    'description' => t('The title of the menu link.'),
  );
  $menu_link['url'] = array(
    'name' => t('URL'),
    'description' => t('The URL of the menu link.'),
    'type' => 'url',
  );
  $menu_link['parent'] = array(
    'name' => t('Parent'),
    'description' => t("The menu link's parent."),
    'type' => 'menu-link',
  );
  $menu_link['parents'] = array(
    'name' => t('Parents'),
    'description' => t("An array of all the menu link's parents, starting with the root."),
    'type' => 'array',
  );
  $menu_link['root'] = array(
    'name' => t('Root'),
    'description' => t("The menu link's root."),
    'type' => 'menu-link',
  );

  // Array tokens.
  $array['first'] = array(
    'name' => t('First'),
    'description' => t('The first element of the array.'),
  );
  $array['last'] = array(
    'name' => t('Last'),
    'description' => t('The last element of the array.'),
  );
  $array['count'] = array(
    'name' => t('Count'),
    'description' => t('The number of elements in the array.'),
  );
  $array['reversed'] = array(
    'name' => t('Reversed'),
    'description' => t('The array reversed.'),
    'type' => 'array',
  );
  $array['keys'] = array(
    'name' => t('Keys'),
    'description' => t('The array of keys of the array.'),
    'type' => 'array',
  );
  $array['join'] = array(
    'name' => t('Imploded'),
    'description' => t('The values of the array joined together with a custom string in-between each value.'),
    'dynamic' => TRUE,
  );
  $array['value'] = array(
    'name' => t('Value'),
    'description' => t('The specific value of the array.'),
    'dynamic' => TRUE,
  );

  // Date related tokens.
  $date_format_types = system_get_date_formats();
  foreach ($date_format_types as $machine_name => $date_format_type_info) {
    if (!isset($date_format_type_info['hidden']) || $date_format_type_info['hidden'] == FALSE) {
      $date[$machine_name] = array(
         'name' => check_plain($date_format_type_info['label']),
         'description' => t("A date in '@type' format. (%date)", array('@type' => $machine_name, '%date' => format_date(REQUEST_TIME, $machine_name))),
       );
    }
  }
  $date['custom'] = array(
    'name' => t('Custom format'),
    'description' => t("A date in a custom format. See !php-date for details.", array('!php-date' => l(t('the PHP documentation'), 'http://php.net/manual/en/function.date.php'))),
    'dynamic' => TRUE,
  );
  $date['since'] = array(
    'name' => t('Time-since'),
    'description' => t("A date in 'time-since' format. (%date)", array('%date' => format_interval(REQUEST_TIME - 360, 2))),
  );
  $date['raw'] = array(
    'name' => t('Raw timestamp'),
    'description' => t("A date in UNIX timestamp format (%date)", array('%date' => REQUEST_TIME)),
  );

  // File related tokens.
  $file['fid'] = array(
    'name' => t('File ID'),
    'description' => t('The unique ID of the uploaded file.'),
  );
  $file['name'] = array(
    'name' => t('File name'),
    'description' => t('The name of the file on disk.'),
  );
  $file['basename'] = array(
    'name' => t('Base name'),
    'description' => t('The base name of the file.'),
  );
  $file['path'] = array(
    'name' => t('Path'),
    'description' => t('The location of the file relative to the Backdrop root.'),
  );
  $file['url'] = array(
    'name' => t('URL'),
    'description' => t('The web-accessible URL for the file.'),
  );
  $file['mime'] = array(
    'name' => t('MIME type'),
    'description' => t('The MIME type of the file.'),
  );
  $file['extension'] = array(
    'name' => t('Extension'),
    'description' => t('The extension of the file.'),
  );
  $file['size'] = array(
    'name' => t('File size'),
    'description' => t('The size of the file.'),
  );
  $file['size-raw'] = array(
    'name' => t('File byte size'),
    'description' => t('The size of the file, in bytes.'),
  );
  $file['timestamp'] = array(
    'name' => t('Timestamp'),
    'description' => t('The date the file was most recently changed.'),
    'type' => 'date',
  );
  $file['owner'] = array(
    'name' => t('Owner'),
    'description' => t('The user who originally uploaded the file.'),
    'type' => 'user',
  );

  return array(
    'types' => $types,
    'tokens' => array(
      'site' => $site,
      'current-page' => $current_page,
      'url' => $url,
      'menu-link' => $menu_link,
      'array' => $array,
      'date' => $date,
      'file' => $file,
    ),
  );
}

/**
 * Implements hook_tokens().
 */
function system_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $url_options = array('absolute' => TRUE);
  if (isset($options['language'])) {
    $url_options['language'] = $options['language'];
    $language_code = $options['language']->langcode;
  }
  else {
    $language_code = NULL;
  }
  $sanitize = !empty($options['sanitize']);

  $replacements = array();

  if ($type == 'site') {
    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'name':
          $site_name = config_get('system.core', 'site_name');
          $replacements[$original] = $sanitize ? check_plain($site_name) : $site_name;
          break;

        case 'slogan':
          $slogan = config_get('system.core', 'site_slogan');
          $replacements[$original] = $sanitize ? check_plain($slogan) : $slogan;
          break;

        case 'mail':
          $replacements[$original] = config_get('system.core', 'site_mail');
          break;

        case 'url':
          $replacements[$original] = url('<front>', $url_options);
          break;

        // @deprecated: Use url:brief instead.
        case 'url-brief':
          $replacements[$original] = preg_replace(array('!^https?://!', '!/$!'), '', url('<front>', $url_options));
          break;

        case 'login-url':
          $replacements[$original] = url('user', $url_options);
          break;
      }
    }

    // Chained token relationships.
    if ($url_tokens = token_find_with_prefix($tokens, 'url')) {
      $replacements += token_generate('url', $url_tokens, array('path' => '<front>'), $options);
    }
  }

  // Current page tokens.
  elseif ($type == 'current-page') {
    $current_path = current_path();

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'title':
          $title = backdrop_get_title();
          $replacements[$original] = $sanitize ? $title : decode_entities($title);
          break;
        case 'url':
          $replacements[$original] = url($current_path, $url_options);
          break;
        case 'page-number':
          if ($page = filter_input(INPUT_GET, 'page')) {
            // @see PagerDefault::execute()
            $pager_page_array = explode(',', $page);
            $page = $pager_page_array[0];
          }
          $replacements[$original] = (int) $page + 1;
          break;
      }
    }

    // @deprecated
    // [current-page:arg] dynamic tokens.
    if ($arg_tokens = token_find_with_prefix($tokens, 'arg')) {
      foreach ($arg_tokens as $name => $original) {
        if (is_numeric($name) && ($arg = arg($name)) && isset($arg)) {
          $replacements[$original] = $sanitize ? check_plain($arg) : $arg;
        }
      }
    }

    // [current-page:query] dynamic tokens.
    if ($query_tokens = token_find_with_prefix($tokens, 'query')) {
      foreach ($query_tokens as $name => $original) {
        // @todo Should this use filter_input()?
        if (isset($_GET[$name])) {
          $replacements[$original] = $sanitize ? check_plain($_GET[$name]) : $_GET[$name];
        }
      }
    }

    // Chained token relationships.
    if ($url_tokens = token_find_with_prefix($tokens, 'url')) {
      $replacements += token_generate('url', $url_tokens, array('path' => $current_path), $options);
    }
  }

  // Current date tokens.
  elseif ($type == 'current-date') {
    $replacements += token_generate('date', $tokens, array('date' => REQUEST_TIME), $options);
  }

  // URL tokens.
  elseif ($type == 'url' && !empty($data['path'])) {
    $path = $data['path'];

    if (isset($data['options'])) {
      // Merge in the URL options if available.
      $url_options = $data['options'] + $url_options;
    }

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'path':
          $value = empty($url_options['alias']) ? backdrop_get_path_alias($path, $language_code) : $path;
          $replacements[$original] = $sanitize ? check_plain($value) : $value;
          break;
        case 'alias':
          // @deprecated
          $alias = backdrop_get_path_alias($path, $language_code);
          $replacements[$original] = $sanitize ? check_plain($alias) : $alias;
          break;
        case 'absolute':
          $replacements[$original] = url($path, $url_options);
          break;
        case 'relative':
          $replacements[$original] = url($path, array('absolute' => FALSE) + $url_options);
          break;
        case 'brief':
          $replacements[$original] = preg_replace(array('!^https?://!', '!/$!'), '', url($path, $url_options));
          break;
        case 'unaliased':
          $replacements[$original] = url($path, array('alias' => TRUE) + $url_options);
          break;
        case 'args':
          $value = empty($url_options['alias']) ? backdrop_get_path_alias($path, $language_code) : $path;
          $replacements[$original] = token_render_array(arg(NULL, $value), $options);
          break;
      }
    }

    // [url:arg:*] chained tokens.
    if ($arg_tokens = token_find_with_prefix($tokens, 'args')) {
      $value = empty($url_options['alias']) ? backdrop_get_path_alias($path, $language_code) : $path;
      $replacements += token_generate('array', $arg_tokens, array('array' => arg(NULL, $value)), $options);
    }

    // [url:unaliased:*] chained tokens.
    if ($unaliased_tokens = token_find_with_prefix($tokens, 'unaliased')) {
      $unaliased_token_data['path'] = $path;
      $unaliased_token_data['options'] = isset($data['options']) ? $data['options'] : array();
      $unaliased_token_data['options']['alias'] = TRUE;
      $replacements += token_generate('url', $unaliased_tokens, $unaliased_token_data, $options);
    }
  }

  elseif ($type == 'array' && !empty($data['array']) && is_array($data['array'])) {
    $array = $data['array'];

    if (isset($options['array sort']) ? $options['array sort'] : FALSE) {
      backdrop_sort($array, array('#weight' => SORT_NUMERIC));
    };
    $keys = array();
    foreach ($array as $key => $value) {
      if ($key[0] !== '#') {
        $keys[] = $key;
      }
    }

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'first':
          $value = $array[$keys[0]];
          $value = is_array($value) ? render($value) : (string) $value;
          $replacements[$original] = $sanitize ? check_plain($value) : $value;
          break;
        case 'last':
          $value = $array[$keys[count($keys) - 1]];
          $value = is_array($value) ? render($value) : (string) $value;
          $replacements[$original] = $sanitize ? check_plain($value) : $value;
          break;
        case 'count':
          $replacements[$original] = count($keys);
          break;
        case 'keys':
          $replacements[$original] = token_render_array($keys, $options);
          break;
        case 'reversed':
          $reversed = array_reverse($array, TRUE);
          $replacements[$original] = token_render_array($reversed, $options);
          break;
        case 'join':
          $replacements[$original] = token_render_array($array, array('join' => '') + $options);
          break;
      }
    }

    // [array:value:*] dynamic tokens.
    if ($value_tokens = token_find_with_prefix($tokens, 'value')) {
      foreach ($value_tokens as $key => $original) {
        if ($key[0] !== '#' && isset($array[$key])) {
          $replacements[$original] = token_render_array_value($array[$key], $options);
        }
      }
    }

    // [array:join:*] dynamic tokens.
    if ($join_tokens = token_find_with_prefix($tokens, 'join')) {
      foreach ($join_tokens as $join => $original) {
        $replacements[$original] = token_render_array($array, array('join' => $join) + $options);
      }
    }

    // [array:keys:*] chained tokens.
    if ($key_tokens = token_find_with_prefix($tokens, 'keys')) {
      $options['array sort'] = FALSE;
      $replacements += token_generate('array', $key_tokens, array('array' => $keys), $options);
    }

    // [array:reversed:*] chained tokens.
    if ($reversed_tokens = token_find_with_prefix($tokens, 'reversed')) {
      $replacements += token_generate('array', $reversed_tokens, array('array' => array_reverse($array, TRUE)) + $options);
    }
  }

  elseif ($type == 'date') {
    $date = !empty($data['date']) ? $data['date'] : REQUEST_TIME;
    $date_format_types = system_get_date_formats();

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'since':
          $replacements[$original] = format_interval((REQUEST_TIME - $date), 2, $language_code);
          break;

        case 'raw':
          $replacements[$original] = $sanitize ? check_plain($date) : $date;
          break;

        default:
          if (isset($date_format_types[$name])) {
            $replacements[$original] = format_date($date, $name, '', NULL, $language_code);
          }
          break;
      }
    }

    if ($created_tokens = token_find_with_prefix($tokens, 'custom')) {
      foreach ($created_tokens as $name => $original) {
        $replacements[$original] = format_date($date, 'custom', $name, NULL, $language_code);
      }
    }
  }

  elseif ($type == 'file' && !empty($data['file'])) {
    $file = $data['file'];

    foreach ($tokens as $name => $original) {
      switch ($name) {

        case 'fid':
          $replacements[$original] = $file->fid;
          break;

        case 'name':
          $replacements[$original] = $sanitize ? check_plain($file->filename) : $file->filename;
          break;

        case 'basename':
          $basename = pathinfo($file->uri, PATHINFO_BASENAME);
          $replacements[$original] = $sanitize ? check_plain($basename) : $basename;
          break;

        case 'path':
          $replacements[$original] = $sanitize ? check_plain($file->uri) : $file->uri;
          break;

        case 'url':
          $replacements[$original] = $sanitize ? check_plain(file_create_url($file->uri)) : file_create_url($file->uri);
          break;

        case 'mime':
          $replacements[$original] = $sanitize ? check_plain($file->filemime) : $file->filemime;
          break;

        case 'extension':
          $extension = pathinfo($file->uri, PATHINFO_EXTENSION);
          $replacements[$original] = $sanitize ? check_plain($extension) : $extension;
          break;

        case 'size':
          $replacements[$original] = format_size($file->filesize);
          break;

        case 'size-raw':
          $replacements[$original] = (int) $file->filesize;
          break;

        // These tokens are default variations on the chained tokens handled below.
        case 'timestamp':
          $replacements[$original] = format_date($file->timestamp, 'medium', '', NULL, $language_code);
          break;

        case 'owner':
          $account = user_load($file->uid);
          $name = user_format_name($account);
          $replacements[$original] = $sanitize ? check_plain($name) : $name;
          break;
      }
    }

    if ($date_tokens = token_find_with_prefix($tokens, 'timestamp')) {
      $replacements += token_generate('date', $date_tokens, array('date' => $file->timestamp), $options);
    }

    if (($owner_tokens = token_find_with_prefix($tokens, 'owner')) && $account = user_load($file->uid)) {
      $replacements += token_generate('user', $owner_tokens, array('user' => $account), $options);
    }

    if (($url_tokens = token_find_with_prefix($tokens, 'url'))) {
      $replacements += token_generate('url', $url_tokens, $file->uri(), $options);
    }
  }

  // If the token type specifics a 'needs-data' value, and the value is not
  // present in $data, then throw an error.
  if (!empty($GLOBALS['backdrop_test_info']['test_run_id'])) {
    // Only check when tests are running.
    $type_info = token_get_info($type);
    if (!empty($type_info['needs-data']) && !isset($data[$type_info['needs-data']])) {
      trigger_error(t('Attempting to perform token replacement for token type %type without required data', array('%type' => $type)), E_USER_WARNING);
    }
  }

  return $replacements;
}
