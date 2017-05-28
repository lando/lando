<?php
/**
 * @file
 * Miscellaneous functions for Path module.
 *
 * This also contains some constants giving human readable names to some numeric
 * settings; they're included here as they're only rarely used outside this file
 * anyway. Use module_load_include('inc', 'path') if the constants need to
 * be available.
 */

/**
 * Case should be left as is in the generated path.
 */
define('PATH_CASE_LEAVE_ASIS', 0);

/**
 * Case should be lowercased in the generated path.
 */
define('PATH_CASE_LOWER', 1);

/**
 * "Do nothing. Leave the old alias intact."
 */
define('PATH_UPDATE_ACTION_NO_NEW', 0);

/**
 * "Create a new alias. Leave the existing alias functioning."
 */
define('PATH_UPDATE_ACTION_LEAVE', 1);

/**
 * "Create a new alias. Delete the old alias."
 */
define('PATH_UPDATE_ACTION_DELETE', 2);

/**
 * Remove the punctuation from the alias.
 */
define('PATH_PUNCTUATION_REMOVE', 0);

/**
 * Replace the punctuation with the separator in the alias.
 */
define('PATH_PUNCTUATION_REPLACE', 1);

/**
 * Leave the punctuation as it is in the alias.
 */
define('PATH_PUNCTUATION_DO_NOTHING', 2);

/**
 * Fetches an existing URL alias given a path and optional language.
 *
 * @param $source
 *   An internal Backdrop path.
 * @param $langcode
 *   An optional language code to look up the path in.
 * @return
 *   FALSE if no alias was found or an associative array containing the
 *   following keys:
 *   - pid: Unique path alias identifier.
 *   - alias: The URL alias.
 */
function _path_load_loosely_by_source($source, $langcode = LANGUAGE_NONE) {
  $pid = db_query_range("SELECT pid FROM {url_alias} WHERE source = :source AND langcode IN (:langcode, :language_none) ORDER BY langcode DESC, pid DESC", 0, 1, array(':source' => $source, ':langcode' => $langcode, ':language_none' => LANGUAGE_NONE))->fetchField();
  return path_load(array('pid' => $pid));
}

/**
 * Clean up a string segment to be used in an URL alias.
 *
 * Performs the following possible alterations:
 * - Remove all HTML tags.
 * - Process the string through the transliteration module.
 * - Replace or remove punctuation with the separator character.
 * - Remove back-slashes.
 * - Replace non-ascii and non-numeric characters with the separator.
 * - Remove common words.
 * - Replace whitespace with the separator character.
 * - Trim duplicate, leading, and trailing separators.
 * - Convert to lower-case.
 * - Shorten to a desired length and logical position based on word boundaries.
 *
 * This function should *not* be called on URL alias or path strings because it
 * is assumed that they are already clean.
 *
 * @param $string
 *   A string to clean.
 * @param array $options
 *   (optional) A keyed array of settings and flags to control the path pattern
 *   string replacement process. Supported options are:
 *   - langcode: A language code to be used when translating strings.
 *
 * @return
 *   The cleaned string.
 */
function path_clean_string($string, array $options = array()) {
  // Use the advanced backdrop_static() pattern, since this is called very often.
  static $backdrop_static_fast;
  if (!isset($backdrop_static_fast)) {
    $backdrop_static_fast['cache'] = &backdrop_static(__FUNCTION__);
  }
  $cache = &$backdrop_static_fast['cache'];

  // Generate and cache variables used in this function so that on the second
  // call to path_clean_string() we focus on processing.
  if (!isset($cache)) {
    $config = config('path.settings');
    $cache = array(
      'separator' => $config->get('separator'),
      'strings' => array(),
      'transliterate' => $config->get('transliterate'),
      'punctuation' => array(),
      'reduce_ascii' => (bool) $config->get('reduce_ascii'),
      'ignore_words_regex' => FALSE,
      'lowercase' => (bool) $config->get('case'),
      'maxlength' => min($config->get('max_component_length'), _path_get_schema_alias_maxlength()),
    );

    // Generate and cache the punctuation replacements for strtr().
    $punctuation = path_punctuation_chars();
    foreach ($punctuation as $name => $details) {
      $action = $config->get('punctuation_' . $name);
      switch ($action) {
        case PATH_PUNCTUATION_REMOVE:
          $cache['punctuation'][$details['value']] = '';
          break;
        case PATH_PUNCTUATION_REPLACE:
          $cache['punctuation'][$details['value']] = $cache['separator'];
          break;
        case PATH_PUNCTUATION_DO_NOTHING:
          // Literally do nothing.
          break;
      }
    }

    // Generate and cache the ignored words regular expression.
    $ignore_words = $config->get('ignore_words');
    $ignore_words_regex = preg_replace(array('/^[,\s]+|[,\s]+$/', '/[,\s]+/'), array('', '\b|\b'), $ignore_words);
    if ($ignore_words_regex) {
      $cache['ignore_words_regex'] = '\b' . $ignore_words_regex . '\b';
      if (function_exists('mb_eregi_replace')) {
        $cache['ignore_words_callback'] = 'mb_eregi_replace';
      }
      else {
        $cache['ignore_words_callback'] = 'preg_replace';
        $cache['ignore_words_regex'] = '/' . $cache['ignore_words_regex'] . '/i';
      }
    }

    // Remove to prevent any unintentional use of $config outside of the cache.
    unset($config);
  }

  // Empty strings do not need any proccessing.
  if ($string === '' || $string === NULL) {
    return '';
  }

  $langcode = LANGUAGE_NONE;
  if (!empty($options['language']->langcode)) {
    $langcode = $options['language']->langcode;
  }
  elseif (!empty($options['langcode'])) {
    $langcode = $options['langcode'];
  }

  // Check if the string has already been processed, and if so return the
  // cached result.
  if (isset($cache['strings'][$langcode][$string])) {
    return $cache['strings'][$langcode][$string];
  }

  // Remove all HTML tags from the string.
  $output = strip_tags(decode_entities($string));

  // Optionally transliterate (by running through the Transliteration module).
  if ($cache['transliterate']) {
    // If the reduce strings to letters and numbers is enabled, don't bother
    // replacing unknown characters with a question mark. Use an empty string
    // instead.
    include_once BACKDROP_ROOT . '/core/includes/transliteration.inc';
    $output = transliteration_get($output, $cache['reduce_ascii'] ? '' : '?', $langcode);
  }

  // Replace or drop punctuation based on user settings.
  $output = strtr($output, $cache['punctuation']);

  // Reduce strings to letters and numbers.
  if ($cache['reduce_ascii']) {
    $output = preg_replace('/[^a-zA-Z0-9\/]+/', $cache['separator'], $output);
  }

  // Get rid of words that are on the ignore list.
  if ($cache['ignore_words_regex']) {
    $words_removed = $cache['ignore_words_callback']($cache['ignore_words_regex'], '', $output);
    if (backdrop_strlen(trim($words_removed)) > 0) {
      $output = $words_removed;
    }
  }

  // Always replace whitespace with the separator.
  $output = preg_replace('/\s+/', $cache['separator'], $output);

  // Trim duplicates and remove trailing and leading separators.
  $output = _path_clean_separators($output, $cache['separator']);

  // Optionally convert to lower case.
  if ($cache['lowercase']) {
    $output = backdrop_strtolower($output);
  }

  // Shorten to a logical place based on word boundaries.
  $output = truncate_utf8($output, $cache['maxlength'], TRUE);

  // Cache this result in the static array.
  $cache['strings'][$langcode][$string] = $output;

  return $output;
}

/**
 * Trims duplicate, leading, and trailing separators from a string.
 *
 * @param $string
 *   The string to clean path separators from.
 * @param $separator
 *   The path separator to use when cleaning.
 * @return
 *   The cleaned version of the string.
 *
 * @see path_clean_string()
 * @see path_clean_alias()
 */
function _path_clean_separators($string, $separator = NULL) {
  $config = config('path.settings');
  static $default_separator;

  if (!isset($separator)) {
    if (!isset($default_separator)) {
      $default_separator = $config->get('separator');
    }
    $separator = $default_separator;
  }

  $output = $string;

  if (strlen($separator)) {
    // Trim any leading or trailing separators.
    $output = trim($output, $separator);

    // Escape the separator for use in regular expressions.
    $seppattern = preg_quote($separator, '/');

    // Replace multiple separators with a single one.
    $output = preg_replace("/$seppattern+/", $separator, $output);

    // Replace trailing separators around slashes.
    if ($separator !== '/') {
      $output = preg_replace("/\/+$seppattern\/+|$seppattern\/+|\/+$seppattern/", "/", $output);
    }
  }

  return $output;
}

/**
 * Clean up a URL alias.
 *
 * Performs the following alterations:
 * - Trim duplicate, leading, and trailing back-slashes.
 * - Trim duplicate, leading, and trailing separators.
 * - Shorten to a desired length and logical position based on word boundaries.
 *
 * @param string $alias
 *   A string with the URL alias to clean up.
 * @return string
 *   The cleaned URL alias.
 */
function path_clean_alias($alias) {
  $config = config('path.settings');
  $cache = &backdrop_static(__FUNCTION__);

  if (!isset($cache)) {
    $cache = array(
      'maxlength' => min($config->get('max_length'), _path_get_schema_alias_maxlength()),
    );
  }

  $output = $alias;

  // Trim duplicate, leading, and trailing separators. Do this before cleaning
  // backslashes since a pattern like "[token1]/[token2]-[token3]/[token4]"
  // could end up like "value1/-/value2" and if backslashes were cleaned first
  // this would result in a duplicate blackslash.
  $output = _path_clean_separators($output);

  // Trim duplicate, leading, and trailing backslashes.
  $output = _path_clean_separators($output, '/');

  // Shorten to a logical place based on word boundaries.
  $output = truncate_utf8($output, $cache['maxlength'], TRUE);

  return $output;
}

/**
 * Check to ensure a path alias is unique and add suffix variants if necessary.
 *
 * Given an alias 'content/test' if a path alias with the exact alias already
 * exists, the function will change the alias to 'content/test-0' and will
 * increase the number suffix until it finds a unique alias.
 *
 * @param string $alias
 *   A string with the alias. Can be altered by reference.
 * @param string $source
 *   A string with the path source.
 * @param string $langcode
 *   A string with a language code.
 */
function path_alias_uniquify(&$alias, $source, $langcode) {
  $config = config('path.settings');
  if (!path_is_alias_reserved($alias, $source, $langcode)) {
    return;
  }

  // If the alias already exists, generate a new, hopefully unique, variant.
  $maxlength = min($config->get('max_length'), _path_get_schema_alias_maxlength());
  $separator = $config->get('separator');
  $original_alias = $alias;

  $i = 1;
  do {
    // Append an incrementing numeric suffix until we find a unique alias.
    $unique_suffix = $separator . $i;
    $alias = truncate_utf8($original_alias, $maxlength - backdrop_strlen($unique_suffix, TRUE)) . $unique_suffix;
    $i++;
  } while (path_is_alias_reserved($alias, $source, $langcode));
}

/**
 * Verify if the given path is a valid menu callback.
 *
 * Taken from menu_execute_active_handler().
 *
 * @param string $path
 *   A string containing a relative path.
 * @return bool
 *   TRUE if the path already exists.
 */
function _path_is_callback($path) {
  $menu = menu_get_item($path);
  if (isset($menu['path']) && $menu['path'] == $path) {
    return TRUE;
  }
  elseif (is_file(BACKDROP_ROOT . '/' . $path) || is_dir(BACKDROP_ROOT . '/' . $path)) {
    // Do not allow existing files or directories to get assigned an automatic
    // alias. Note that we do not need to use is_link() to check for symbolic
    // links since this returns TRUE for either is_file() or is_dir() already.
    return TRUE;
  }
  return FALSE;
}

/**
 * Apply patterns to create an alias for an entity.
 *
 * @param Entity $entity
 *   A node, user, taxonomy term, or other entity for which patterns exist.
 * @param string $source
 *   An internal Backdrop path to be aliased. If not specified, the path of the
 *   provided entity will be used, e.g. node/1.
 * @param string $langcode
 *   A string specify the path's language. If not specified, the language of
 *   the given entity will be used.
 *
 * @return string|FALSE
 *   The automatically generated alias or FALSE if no automatically generated
 *   alias should be created.
 *
 * @see token_replace()
 */
function path_generate_entity_alias(Entity $entity, $source = NULL, $langcode = NULL) {
  $config = config('path.settings');
  $entity_type_name = $entity->entityType();
  $entity_type = entity_get_info($entity_type_name);
  $token_type = isset($entity_type['token type']) ? $entity_type['token type'] : NULL;
  $bundle = $entity->bundle();

  if (!isset($source)) {
    $uri = $entity->uri();
    $source = $uri['path'];
  }
  if (!isset($langcode)) {
    $langcode = isset($entity->langcode) ? $entity->langcode : LANGUAGE_NONE;
  }

  // Retrieve and apply the pattern for this content type.
  $pattern = path_get_pattern_by_entity_type($entity_type_name, $bundle, $langcode);

  // Allow other modules to alter the pattern.
  $context = array(
    'entity' => $entity,
    'source' => $source,
    'langcode' => $langcode,
  );
  backdrop_alter('path_pattern', $pattern, $context);

  if (empty($pattern)) {
    // No pattern? Do nothing (otherwise we may blow away existing aliases...)
    return FALSE;
  }

  // Special handling when updating an item which is already aliased.
  $existing_path = NULL;
  if (!$entity->isNew()) {
    if ($existing_path = _path_load_loosely_by_source($source, $langcode)) {
      switch ($config->get('update_action')) {
        case PATH_UPDATE_ACTION_NO_NEW:
          // If an alias already exists, and the update action is set to do
          // nothing, then return.
          return FALSE;
      }
    }
  }

  // Replace any tokens in the pattern. Uses callback option to clean
  // replacements. No sanitization.
  $data = array();
  if ($token_type) {
    $data[$token_type] = $entity;
  }
  $alias = token_replace($pattern, $data, array(
    'sanitize' => FALSE,
    'clear' => TRUE,
    'callback' => 'path_clean_token_values',
    'langcode' => $langcode,
  ));

  // Check if the token replacement has not actually replaced any values. If
  // that is the case, then stop because we should not generate an alias.
  // @see token_scan()
  $pattern_tokens_removed = preg_replace('/\[[^\s\]:]*:[^\s\]]*\]/', '', $pattern);
  if ($alias === $pattern_tokens_removed) {
    return FALSE;
  }

  $alias = path_clean_alias($alias);

  // Allow other modules to alter the alias.
  $context['source'] = &$source;
  $context['pattern'] = $pattern;
  backdrop_alter('path_alias', $alias, $context);

  // If we have arrived at an empty string, discontinue.
  if (!backdrop_strlen($alias)) {
    return FALSE;
  }

  // If the alias already exists, generate a new, hopefully unique, variant.
  $original_alias = $alias;
  path_alias_uniquify($alias, $source, $langcode);
  if ($original_alias != $alias) {
    // Alert the user why this happened.
    path_verbose_message(t('The automatically generated alias %original_alias conflicted with an existing alias. Alias changed to %alias.', array(
      '%original_alias' => $original_alias,
      '%alias' => $alias,
    )), $entity->isNew() ? 'insert' : 'update');
  }

  return $alias;
}

/**
 * Update the URL aliases for an individual taxonomy term.
 *
 * @param Entity $entity
 *   An entity (node/user/term/etc.) object.
 * @return array
 *   The path array saved into the database or FALSE if the path was not saved.
 */
function path_save_automatic_entity_alias(Entity $entity) {
  $langcode = isset($entity->langcode) ? $entity->langcode : LANGUAGE_NONE;
  $uri = $entity->uri();
  $path = FALSE;
  if ($alias = path_generate_entity_alias($entity, $uri['path'], $langcode)) {
    $path = path_save_automatic_alias($uri['path'], $alias, $langcode);
  }

  return $path;
}

/**
 * Save an automatic alias; replacing or adding aliases based on site settings.
 *
 * @param string $source
 *   The internal system path.
 * @param string $alias
 *   The URL alias to be saved.
 * @param string $langcode
 *   The language code for the alias being saved.
 *
 * @return
 *   The saved path from path_save() or FALSE if the path was not saved.
 *
 * @see path_save()
 */
function path_save_automatic_alias($source, $alias, $langcode) {
  $verbose = path_verbose_message();
  $existing_path = _path_load_loosely_by_source($source, $langcode);

  // Alert users if they are trying to create an alias that is the same as the
  // internal path.
  if ($source == $alias) {
    if ($verbose) {
      path_verbose_message(t('Ignoring alias %alias because it is the same as the internal path.', array('%alias' => $alias)));
    }
    return FALSE;
  }

  // Assemble a path array to be saved.
  $path = array(
    'source' => $source,
    'alias' => $alias,
    'langcode' => $langcode,
    'auto' => TRUE,
    'original' => $existing_path,
  );

  // Skip replacing the current alias with an identical alias.
  if (empty($existing_path) || $existing_path['alias'] != $path['alias'] || empty($existing_path['auto'])) {
    // If there is already an alias, respect some update actions.
    if (!empty($existing_path)) {
      switch (config_get('path.settings', 'update_action')) {
        case PATH_UPDATE_ACTION_NO_NEW:
          // Do not create the alias.
          return FALSE;
        case PATH_UPDATE_ACTION_LEAVE:
          // Create a new alias instead of overwriting the existing by leaving
          // $path['pid'] empty.
          break;
        case PATH_UPDATE_ACTION_DELETE:
          // The delete actions should overwrite the existing alias.
          $path['pid'] = $existing_path['pid'];
          break;
      }
    }

    // Save the path array.
    path_save($path);

    if ($verbose) {
      if (!empty($existing_path['pid'])) {
        path_verbose_message(t('Created new alias %alias for %source, replacing %old_alias.', array('%alias' => $path['alias'], '%source' => $path['source'], '%old_alias' => $existing_path['alias'])));
      }
      else {
        path_verbose_message(t('Created new alias %alias for %source.', array('%alias' => $path['alias'], '%source' => $path['source'])));
      }
    }

    return $path;
  }

  return FALSE;
}

/**
 * Clean tokens so they are URL friendly.
 *
 * This function is a token_replace() callback, hence why $data is passed in
 * but is not used for any reason.
 *
 * @param array $replacements
 *   An array of token replacements that need to be "cleaned" for use in the URL.
 * @param array $data
 *   An array of objects used to generate the replacements.
 * @param array $options
 *   An array of options used to generate the replacements.
 *
 * @see path_generate_entity_alias()
 * @see token_replace()
 */
function path_clean_token_values(array &$replacements, array $data = array(), array $options = array()) {
  foreach ($replacements as $token => $value) {
    // Only clean non-path tokens.
    if (!preg_match('/(path|alias|url|url-brief)\]$/', $token)) {
      $replacements[$token] = path_clean_string($value, $options);
    }
  }
}

/**
 * Return an array of arrays for punctuation values.
 *
 * Returns an array of arrays for punctuation values keyed by a name, including
 * the value and a textual description.
 * Can and should be expanded to include "all" non text punctuation values.
 *
 * @return array
 *   An array of arrays for punctuation values keyed by a name, including the
 *   value and a textual description.
 */
function path_punctuation_chars() {
  global $language_content;
  $punctuation = &backdrop_static(__FUNCTION__);
  $cache_bin = cache();

  if (!isset($punctuation)) {
    $cid = 'path:punctuation:' . $language_content->langcode;
    if ($cache = $cache_bin->get($cid)) {
      $punctuation = $cache->data;
    }
    else {
      $punctuation = array();
      $punctuation['double_quotes']      = array('value' => '"', 'name' => t('Double quotation marks'));
      $punctuation['quotes']             = array('value' => '\'', 'name' => t("Single quotation marks (apostrophe)"));
      $punctuation['backtick']           = array('value' => '`', 'name' => t('Back tick'));
      $punctuation['comma']              = array('value' => ',', 'name' => t('Comma'));
      $punctuation['period']             = array('value' => '.', 'name' => t('Period'));
      $punctuation['hyphen']             = array('value' => '-', 'name' => t('Hyphen'));
      $punctuation['underscore']         = array('value' => '_', 'name' => t('Underscore'));
      $punctuation['colon']              = array('value' => ':', 'name' => t('Colon'));
      $punctuation['semicolon']          = array('value' => ';', 'name' => t('Semicolon'));
      $punctuation['pipe']               = array('value' => '|', 'name' => t('Vertical bar (pipe)'));
      $punctuation['left_curly']         = array('value' => '{', 'name' => t('Left curly bracket'));
      $punctuation['left_square']        = array('value' => '[', 'name' => t('Left square bracket'));
      $punctuation['right_curly']        = array('value' => '}', 'name' => t('Right curly bracket'));
      $punctuation['right_square']       = array('value' => ']', 'name' => t('Right square bracket'));
      $punctuation['plus']               = array('value' => '+', 'name' => t('Plus sign'));
      $punctuation['equal']              = array('value' => '=', 'name' => t('Equal sign'));
      $punctuation['asterisk']           = array('value' => '*', 'name' => t('Asterisk'));
      $punctuation['ampersand']          = array('value' => '&', 'name' => t('Ampersand'));
      $punctuation['percent']            = array('value' => '%', 'name' => t('Percent sign'));
      $punctuation['caret']              = array('value' => '^', 'name' => t('Caret'));
      $punctuation['dollar']             = array('value' => '$', 'name' => t('Dollar sign'));
      $punctuation['hash']               = array('value' => '#', 'name' => t('Number sign (pound sign, hash)'));
      $punctuation['at']                 = array('value' => '@', 'name' => t('At sign'));
      $punctuation['exclamation']        = array('value' => '!', 'name' => t('Exclamation mark'));
      $punctuation['tilde']              = array('value' => '~', 'name' => t('Tilde'));
      $punctuation['left_parenthesis']   = array('value' => '(', 'name' => t('Left parenthesis'));
      $punctuation['right_parenthesis']  = array('value' => ')', 'name' => t('Right parenthesis'));
      $punctuation['question_mark']      = array('value' => '?', 'name' => t('Question mark'));
      $punctuation['less_than']          = array('value' => '<', 'name' => t('Less-than sign'));
      $punctuation['greater_than']       = array('value' => '>', 'name' => t('Greater-than sign'));
      $punctuation['slash']              = array('value' => '/', 'name' => t('Slash'));
      $punctuation['back_slash']         = array('value' => '\\', 'name' => t('Backslash'));

      // Allow modules to alter the punctuation list and cache the result.
      backdrop_alter('path_punctuation_chars', $punctuation);
      $cache_bin->set($cid, $punctuation);
    }
  }

  return $punctuation;
}

/**
 * Fetch the maximum length of the {url_alias}.alias field from the schema.
 *
 * @return int
 *   An integer of the maximum URL alias length allowed by the database.
 */
function _path_get_schema_alias_maxlength() {
  $maxlength = &backdrop_static(__FUNCTION__);
  if (!isset($maxlength)) {
    $schema = backdrop_get_schema('url_alias');
    $maxlength = $schema['fields']['alias']['length'];
  }
  return $maxlength;
}
