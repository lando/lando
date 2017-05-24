<?php
/**
 * @file
 * Backdrop placeholder/token replacement system.
 *
 * API functions for replacing placeholders in text with meaningful values.
 *
 * For example: When configuring automated emails, an administrator enters
 * standard text for the email. Variables like the title of a node and the date
 * the email was sent can be entered as placeholders like [node:title] and
 * [date:short]. When a Backdrop module prepares to send the email, it can call
 * the token_replace() function, passing in the text. The token system will
 * scan the text for placeholder tokens, give other modules an opportunity to
 * replace them with meaningful text, then return the final product to the
 * original module.
 *
 * Tokens follow the form: [$type:$name], where $type is a general class of
 * tokens like 'node', 'user', or 'comment' and $name is the name of a given
 * placeholder. For example, [node:title] or [node:created:since].
 *
 * In addition to raw text containing placeholders, modules may pass in an array
 * of objects to be used when performing the replacement. The objects should be
 * keyed by the token type they correspond to. For example:
 *
 * @code
 * // Load a node and a user, then replace tokens in the text.
 * $text = 'On [date:short], [user:name] read [node:title].';
 * $node = node_load(1);
 * $user = user_load(1);
 *
 * // [date:...] tokens use the current date automatically.
 * $data = array('node' => $node, 'user' => $user);
 * return token_replace($text, $data);
 * @endcode
 *
 * Some tokens may be chained in the form of [$type:$pointer:$name], where $type
 * is a normal token type, $pointer is a reference to another token type, and
 * $name is the name of a given placeholder. For example, [node:author:mail]. In
 * that example, 'author' is a pointer to the 'user' account that created the
 * node, and 'mail' is a placeholder available for any 'user'.
 *
 * @see token_replace()
 * @see hook_tokens()
 * @see hook_token_info()
 */

/**
 * Replaces all tokens in a given string with appropriate values.
 *
 * @param string $text
 *   A string potentially containing replaceable tokens.
 * @param array $data
 *   (optional) An array of keyed objects. For simple replacement scenarios
 *   'node', 'user', and others are common keys, with an accompanying node or
 *   user object being the value. Some token types, like 'site', do not require
 *   any explicit information from $data and can be replaced even if it is
 *   empty.
 * @param array $options
 *   (optional) A keyed array of settings and flags to control the token
 *   replacement process. Supported options are:
 *   - language: A language object to be used when generating locale-sensitive
 *     tokens.
 *   - callback: A callback function that will be used to post-process the array
 *     of token replacements after they are generated. For example, a module
 *     using tokens in a text-only email might provide a callback to strip HTML
 *     entities from token values before they are inserted into the final text.
 *   - clear: A boolean flag indicating that tokens should be removed from the
 *     final text if no replacement value can be generated.
 *   - sanitize: A boolean flag indicating that tokens should be sanitized for
 *     display to a web browser. Defaults to TRUE. Developers who set this
 *     option to FALSE assume responsibility for running filter_xss(),
 *     check_plain() or other appropriate scrubbing functions before displaying
 *     data to users.
 *
 * @return
 *   Text with tokens replaced.
 */
function token_replace($text, array $data = array(), array $options = array()) {
  $text_tokens = token_scan($text);
  if (empty($text_tokens)) {
    return $text;
  }

  $replacements = array();
  foreach ($text_tokens as $type => $tokens) {
    $replacements += token_generate($type, $tokens, $data, $options);
    if (!empty($options['clear'])) {
      $replacements += array_fill_keys($tokens, '');
    }
  }

  // Optionally alter the list of replacement values.
  if (!empty($options['callback'])) {
    $function = $options['callback'];
    $function($replacements, $data, $options);
  }

  $tokens = array_keys($replacements);
  $values = array_values($replacements);

  return str_replace($tokens, $values, $text);
}

/**
 * Builds a list of all token-like patterns that appear in the text.
 *
 * @param string $text
 *   The text to be scanned for possible tokens.
 *
 * @return array
 *   An associative array of discovered tokens, grouped by type.
 */
function token_scan($text) {
  // Matches tokens with the following pattern: [$type:$name]
  // $type and $name may not contain [ ] characters.
  // $type may not contain : or whitespace characters, but $name may.
  preg_match_all('/
    \[             # [ - pattern start
    ([^\s\[\]:]*)  # match $type not containing whitespace : [ or ]
    :              # : - separator
    ([^\[\]]*)     # match $name not containing [ or ]
    \]             # ] - pattern end
    /x', $text, $matches);

  $types = $matches[1];
  $tokens = $matches[2];

  // Iterate through the matches, building an associative array containing
  // $tokens grouped by $types, pointing to the version of the token found in
  // the source text. For example, $results['node']['title'] = '[node:title]';
  $results = array();
  for ($i = 0; $i < count($tokens); $i++) {
    $results[$types[$i]][$tokens[$i]] = $matches[0][$i];
  }

  return $results;
}

/**
 * Generates replacement values for a list of tokens.
 *
 * @param string $type
 *   The type of token being replaced. 'node', 'user', and 'date' are common.
 * @param array $tokens
 *   An array of tokens to be replaced, keyed by the literal text of the token
 *   as it appeared in the source text.
 * @param array $data
 *   (optional) An array of keyed objects. For simple replacement scenarios
 *   'node', 'user', and others are common keys, with an accompanying node or
 *   user object being the value. Some token types, like 'site', do not require
 *   any explicit information from $data and can be replaced even if it is
 *   empty.
 * @param array $options
 *   (optional) A keyed array of settings and flags to control the token
 *   replacement process. Supported options are:
 *   - language: A language object to be used when generating locale-sensitive
 *     tokens.
 *   - callback: A callback function that will be used to post-process the
 *     array of token replacements after they are generated. Can be used when
 *     modules require special formatting of token text, for example URL
 *     encoding or truncation to a specific length.
 *   - sanitize: A boolean flag indicating that tokens should be sanitized for
 *     display to a web browser. Developers who set this option to FALSE assume
 *     responsibility for running filter_xss(), check_plain() or other
 *     appropriate scrubbing functions before displaying data to users.
 *
 * @return array
 *   An associative array of replacement values, keyed by the original 'raw'
 *   tokens that were found in the source text. For example:
 *   $results['[node:title]'] = 'My new node';
 *
 * @see hook_tokens()
 * @see hook_tokens_alter()
 */
function token_generate($type, array $tokens, array $data = array(), array $options = array()) {
  $options += array('sanitize' => TRUE);
  $replacements = module_invoke_all('tokens', $type, $tokens, $data, $options);

  // Allow other modules to alter the replacements.
  $context = array(
    'type' => $type,
    'tokens' => $tokens,
    'data' => $data,
    'options' => $options,
  );
  backdrop_alter('tokens', $replacements, $context);

  return $replacements;
}

/**
 * Returns a list of tokens that begin with a specific prefix.
 *
 * Used to extract a group of 'chained' tokens (such as [node:author:name])
 * from the full list of tokens found in text. For example:
 * @code
 *   $data = array(
 *     'author:name' => '[node:author:name]',
 *     'title'       => '[node:title]',
 *     'created'     => '[node:created]',
 *   );
 *   $results = token_find_with_prefix($data, 'author');
 *   $results == array('name' => '[node:author:name]');
 * @endcode
 *
 * @param array $tokens
 *   A keyed array of tokens, and their original raw form in the source text.
 * @param string $prefix
 *   A textual string to be matched at the beginning of the token.
 * @param string $delimiter
 *   An optional string containing the character that separates the prefix from
 *   the rest of the token. Defaults to ':'.
 *
 * @return array
 *   An associative array of discovered tokens, with the prefix and delimiter
 *   stripped from the key.
 */
function token_find_with_prefix(array $tokens, $prefix, $delimiter = ':') {
  $results = array();
  foreach ($tokens as $token => $raw) {
    $parts = explode($delimiter, $token, 2);
    if (count($parts) == 2 && $parts[0] == $prefix) {
      $results[$parts[1]] = $raw;
    }
  }
  return $results;
}

/**
 * Returns metadata describing supported tokens.
 *
 * The metadata array contains token type, name, and description data as well
 * as an optional pointer indicating that the token chains to another set of
 * tokens.
 *
 * For example:
 * @code
 *   $data['types']['node'] = array(
 *     'name' => t('Nodes'),
 *     'description' => t('Tokens related to node objects.'),
 *   );
 *   $data['tokens']['node']['title'] = array(
 *     'name' => t('Title'),
 *     'description' => t('The title of the current node.'),
 *   );
 *   $data['tokens']['node']['author'] = array(
 *     'name' => t('Author'),
 *     'description' => t('The author of the current node.'),
 *     'type' => 'user',
 *   );
 * @endcode
 *
 * @return array
 *   An associative array of token information, grouped by token type.
 */
function token_info() {
  $data = &backdrop_static(__FUNCTION__);
  if (!isset($data)) {
    $data = module_invoke_all('token_info');
    backdrop_alter('token_info', $data);
  }
  return $data;
}

/**
 * Retrieve, sort, store token info from the cache.
 *
 * @param string|NULL $token_type
 *   The optional token type that if specified will return
 *   $info['types'][$token_type].
 * @param string|NULL $token_name
 *   The optional token name if specified will return
 *   $info['tokens'][$token_type][$token_name].
 *
 * @return array
 *   An array of all token information from hook_token_info(), or the array
 *   of a token type or specific token.
 *
 * @see hook_token_info()
 * @see hook_token_info_alter()
 */
function token_get_info($token_type = NULL, $token_name = NULL) {
  global $language_content;

  $cache_token = cache('token');

  // Use the advanced backdrop_static() pattern, since this is called very often.
  static $backdrop_static_fast;
  if (!isset($backdrop_static_fast)) {
    $backdrop_static_fast['token_info'] = &backdrop_static(__FUNCTION__);
  }
  $token_info = &$backdrop_static_fast['token_info'];

  if (empty($token_info)) {
    $cid = "info:{$language_content->langcode}";

    if ($cache = $cache_token->get($cid)) {
      $token_info = $cache->data;
    }
    else {
      $token_info = token_info();
      foreach (array_keys($token_info['types']) as $type_key) {
        if (isset($token_info['types'][$type_key]['type'])) {
          $base_type = $token_info['types'][$type_key]['type'];
          // If this token type extends another token type, then merge in
          // the base token type's tokens.
          if (isset($token_info['tokens'][$base_type])) {
            $token_info['tokens'] += array($type_key => array());
            $token_info['tokens'][$type_key] += $token_info['tokens'][$base_type];
          }
        }
        else {
          // Add a 'type' value to each token type so we can properly use
          // token_type_load().
          $token_info['types'][$type_key]['type'] = $type_key;
        }
      }

      // Pre-sort tokens.
      backdrop_sort($token_info['types'], array('name' => SORT_STRING));

      // Store info in cache for future use.
      $cache_token->set($cid, $token_info);
    }
  }

  if (isset($token_type) && isset($token_name)) {
    return isset($token_info['tokens'][$token_type][$token_name]) ? $token_info['tokens'][$token_type][$token_name] : NULL;
  }
  elseif (isset($token_type)) {
    return isset($token_info['types'][$token_type]) ? $token_info['types'][$token_type] : NULL;
  }
  else {
    return $token_info;
  }
}

/**
 * Return the module responsible for a token.
 *
 * @param string $token_type
 *   The token type.
 * @param string $token_name
 *   The token name.
 *
 * @return mixed
 *   The module name that provides the token or NULL if the value does not
 *   exist.
 */
function token_get_module($token_type, $token_name) {
  $token_info = token_get_info($token_type, $token_name);
  return isset($token_info['module']) ? $token_info['module'] : NULL;
}

/**
 * Get a list of token types that can be used without any context (global).
 *
 * @return array
 *   An array of global token types.
 */
function token_get_global_token_types() {
  $global_types = &backdrop_static(__FUNCTION__, array());

  if (empty($global_types)) {
    $token_info = token_get_info();
    foreach ($token_info['types'] as $type => $type_info) {
      // If the token types has not specified that 'needs-data' => TRUE, then
      // it is a global token type that will always be replaced in any context.
      if (empty($type_info['needs-data'])) {
        $global_types[] = $type;
      }
    }
  }

  return $global_types;
}

/**
 * Clear token caches and static variables.
 */
function token_cache_clear() {
  if (db_table_exists('cache_token')) {
    cache('token')->flush();
  }
  backdrop_static_reset('token_get_info');
  backdrop_static_reset('token_get_global_token_types');
  backdrop_static_reset('token_build_tree');
  backdrop_static_reset('_menu_token_link_load');
  backdrop_static_reset('_menu_token_node_link_load');
  backdrop_static_reset('_field_token_info');
}

/**
 * Retrieves the current list of all site tokens and checks for common problems.
 *
 * @return array
 *   An array with problems detected. Each item is keyed by a machine name for
 *   the error and includes:
 *   - label: A description of the problem.
 *   - problems: An array of the problematic tokens.
 *
 * @see system_requirements()
 */
function token_get_token_problems() {
  $token_info = token_info();
  $token_problems = array(
    'not-array' => array(
      'label' => t('The following tokens or token types are not defined as arrays:'),
    ),
    'missing-info' => array(
      'label' => t('The following tokens or token types are missing required name and/or description information:'),
    ),
    'type-no-tokens' => array(
      'label' => t('The following token types do not have any tokens defined:'),
    ),
    'tokens-no-type' => array(
      'label' => t('The following token types are not defined but have tokens:'),
    ),
    'duplicate' => array(
      'label' => t('The following token or token types are defined by multiple modules:')
    ),
  );

  // Check token types for problems.
  foreach ($token_info['types'] as $type => $type_info) {
    $real_type = !empty($type_info['type']) ? $type_info['type'] : $type;
    if (!is_array($type_info)) {
      $token_problems['not-array']['problems'][] = "\$info['types']['$type']";
      continue;
    }
    elseif (!isset($type_info['name']) || !isset($type_info['description'])) {
      $token_problems['missing-info']['problems'][] = "\$info['types']['$type']";
    }
    elseif (empty($token_info['tokens'][$real_type])) {
      $token_problems['type-no-tokens']['problems'][] = "\$info['tokens']['$real_type']";
    }
  }

  // Check tokens for problems.
  foreach ($token_info['tokens'] as $type => $tokens) {
    if (!is_array($tokens)) {
      $token_problems['not-array']['problems'][] = "\$info['tokens']['$type']";
      continue;
    }
    else {
      foreach (array_keys($tokens) as $token) {
        if (!is_array($tokens[$token])) {
          $token_problems['not-array']['problems'][] = "\$info['tokens']['$type']['$token']";
          continue;
        }
        elseif (!isset($tokens[$token]['name']) || !isset($tokens[$token]['description'])) {
          $token_problems['missing-info']['problems'][] = "\$info['tokens']['$type']['$token']";
        }
        elseif (is_array($tokens[$token]['name']) || is_array($tokens[$token]['description'])) {
          $token_problems['duplicate']['problems'][] = "\$info['tokens']['$type']['$token']";
        }
      }
    }
    if (!isset($token_info['types'][$type])) {
      $token_problems['tokens-no-type']['problems'][] = "\$info['types']['$type']";
    }
  }

  return $token_problems;
}

/**
 * Loads a token type.
 *
 * @param string $token_type
 *   A token type name.
 *
 * @return array
 *  An array representing the token type. FALSE if no type found.
 */
function token_type_load($token_type) {
  $info = token_get_info();
  return isset($info['types'][$token_type]) ? $info['types'][$token_type] : FALSE;
}

/**
 * Build a tree array of tokens used for theming or information.
 *
 * @param string $token_type
 *   The token type.
 * @param array $options
 *   An array of options including the following keys:
 *   - flat: A boolean if TRUE will only make a flat array of tokens, otherwise
 *     child tokens will be inside the 'children' parameter of a token.
 *   - restricted: A boolean if TRUE will show restricted tokens. Otherwise they
 *     will be hidden. Default is FALSE.
 *   - depth: An integer with the maximum number of token levels to recurse.
 *   - parents: An optional array with the current parents of the tokens.
 *
 * @return array
 *   An array of token information, keyed by the full token and each containing:
 *   - name: The translated human-readable name of the token.
 *   - description: The translated description of the token.
 *   - raw token: The full token (same as the key of this entry).
 *   - restricted: Optionally present if the token should only be available
 *     in trusted environments.
 *   - deprecated: Optionally present if the token will be removed from a future
 *     version of Backdrop and should not be used.
 *   - token: The last portion of the token. e.g. in [node:nid], the value would
 *     be nid.
 */
function token_build_tree($token_type, array $options = array()) {
  global $language_content;

  $cache_token = cache('token');

  // Static cache of already built token trees.
  $trees = &backdrop_static(__FUNCTION__, array());

  $options += array(
    'restricted' => FALSE,
    'depth' => 4,
    'data' => array(),
    'values' => FALSE,
    'flat' => FALSE,
  );

  // Do not allow past the maximum token information depth.
  $options['depth'] = min($options['depth'], TOKEN_MAX_DEPTH);

  $tree_cid = "tree:{$token_type}:{$language_content->langcode}:{$options['depth']}";

  // If we do not have this base tree in the static cache, check {cache_token}
  // otherwise generate and store it in the cache.
  if (!isset($trees[$tree_cid])) {
    if ($cache = $cache_token->get($tree_cid)) {
      $trees[$tree_cid] = $cache->data;
    }
    else {
      $options['parents'] = array();
      $trees[$tree_cid] = _token_build_tree($token_type, $options);
      cache_set($tree_cid, $trees[$tree_cid], 'cache', CACHE_PERMANENT);
    }
  }

  $tree = $trees[$tree_cid];

  // If the user has requested a flat tree, convert it.
  if (!empty($options['flat'])) {
    $tree = token_flatten_tree($tree);
  }

  // Fill in token values.
  if (!empty($options['values'])) {
    $token_values = array();
    foreach ($tree as $token => $token_info) {
      if (!empty($token_info['dynamic']) || !empty($token_info['restricted'])) {
        continue;
      }
      elseif (!isset($token_info['value'])) {
        $token_values[$token_info['token']] = $token;
      }
    }
    if (!empty($token_values)) {
      $token_values = token_generate($token_type, $token_values, $options['data']);
      foreach ($token_values as $token => $replacement) {
        $tree[$token]['value'] = $replacement;
      }
    }
  }

  return $tree;
}

/**
 * Flatten a token tree.
 *
 * @param array $tree
 *   An array of tokens as returned by token_build_tree().
 * @return array
 *   The array of tokens as flat array.
 */
function token_flatten_tree($tree) {
  $result = array();
  foreach ($tree as $token => $token_info) {
    $result[$token] = $token_info;
    if (isset($token_info['children']) && is_array($token_info['children'])) {
      $result += token_flatten_tree($token_info['children']);
      unset($result[$token]['children']);
    }
  }
  return $result;
}

/**
 * Recursive helper for token_build_tree().
 */
function _token_build_tree($token_type, array $options, $parent_restricted = FALSE) {
  $options += array(
    'parents' => array(),
  );

  $info = token_get_info();
  if ($options['depth'] <= 0 || !isset($info['types'][$token_type]) || !isset($info['tokens'][$token_type])) {
    return array();
  }

  $tree = array();
  foreach ($info['tokens'][$token_type] as $token => $token_info) {
    // Build the raw token string.
    $token_parents = $options['parents'];
    if (empty($token_parents)) {
      // If the parents array is currently empty, assume the token type is its
      // parent.
      $token_parents[] = $token_type;
    }
    elseif (in_array($token, array_slice($token_parents, 1))) {
      // Prevent duplicate recursive tokens. For example, this will prevent
      // the tree from generating the following tokens or deeper:
      // [comment:parent:parent]
      // [comment:parent:root:parent]
      continue;
    }
    elseif (!empty($token_info['restricted']) && !$options['restricted']) {
      // Do not include restricted tokens if the restricted option is FALSE.
      continue;
    }

    $token_parents[] = $token;
    if (!empty($token_info['dynamic'])) {
      $token_parents[] = '?';
    }
    $raw_token = '[' . implode(':', $token_parents) . ']';
    $tree[$raw_token] = $token_info;
    $tree[$raw_token]['raw token'] = $raw_token;

    // Add the token's real name (leave out the base token type).
    $tree[$raw_token]['token'] = implode(':', array_slice($token_parents, 1));

    // Add the token's parent as its raw token value.
    if (!empty($options['parents'])) {
      $tree[$raw_token]['parent'] = '[' . implode(':', $options['parents']) . ']';
    }

    // Inherit the parent token's restricted access flag.
    if ($parent_restricted) {
      $tree[$raw_token]['restricted'] = TRUE;
    }

    // Fetch the child tokens.
    if (!empty($token_info['type'])) {
      $child_options = $options;
      $child_options['depth']--;
      $child_options['parents'] = $token_parents;
      $child_parent_restricted = $parent_restricted || !empty($tree[$raw_token]['restricted']) || !empty($token_info['restricted']);
      $tree[$raw_token]['children'] = _token_build_tree($token_info['type'], $child_options, $child_parent_restricted);
    }
  }

  return $tree;
}

/**
 * Validate a form element that should have tokens in it.
 *
 * Form elements that want to add this validation should have the #token_types
 * parameter defined.
 *
 * For example:
 * @code
 * $form['my_node_text_element'] = array(
 *   '#type' => 'textfield',
 *   '#title' => t('Some text to token-ize that has a node context.'),
 *   '#default_value' => 'The title of this node is [node:title].',
 *   '#element_validate' => array('token_element_validate'),
 *   '#token_types' => array('node'),
 *   '#min_tokens' => 1,
 *   '#max_tokens' => 10,
 * );
 * @endcode
 */
function token_element_validate(&$element, &$form_state) {
  $value = isset($element['#value']) ? $element['#value'] : $element['#default_value'];

  if (!backdrop_strlen($value)) {
    // Empty value needs no further validation since the element should depend
    // on using the '#required' FAPI property.
    return $element;
  }

  $tokens = token_scan($value);
  $title = empty($element['#title']) ? $element['#parents'][0] : $element['#title'];

  // Validate if an element must have a minimum number of tokens.
  if (isset($element['#min_tokens']) && count($tokens) < $element['#min_tokens']) {
    $error = format_plural($element['#min_tokens'], 'The !element-title cannot contain fewer than one token.', 'The !element-title must contain at least @count tokens.', array('!element-title' => $title));
    form_error($element, $error);
  }

  // Validate if an element must have a maximum number of tokens.
  if (isset($element['#max_tokens']) && count($tokens) > $element['#max_tokens']) {
    $error = format_plural($element['#max_tokens'], 'The !element-title may not contain more than one token.', 'The !element-title may not contain more than @count tokens.', array('!element-title' => $title));
    form_error($element, $error);
  }

  // Check if the field defines specific token types.
  if (isset($element['#token_types'])) {
    $invalid_tokens = token_get_invalid_tokens_by_context($tokens, $element['#token_types']);
    if ($invalid_tokens) {
      form_error($element, t('The !element-title is using the following invalid tokens: @invalid-tokens.', array('!element-title' => $title, '@invalid-tokens' => implode(', ', $invalid_tokens))));
    }
  }

  return $element;
}

/**
 * Prepare a string for use as a valid token name.
 *
 * @param string $name
 *   The token name to clean.
 * @return string
 *   The cleaned token name.
 */
function token_clean_token_name($name) {
  static $names = array();

  if (!isset($names[$name])) {
    $cleaned_name = strtr($name, array(' ' => '-', '_' => '-', '/' => '-', '[' => '-', ']' => ''));
    $cleaned_name = preg_replace('/[^\w\-]/i', '', $cleaned_name);
    $cleaned_name = trim($cleaned_name, '-');
    $names[$name] = $cleaned_name;
  }

  return $names[$name];
}

/**
 * Validate an tokens in raw text based on possible contexts.
 *
 * @param string $value
 *   A string with the raw text containing the raw tokens, or an array of
 *   tokens from token_scan().
 * @param array $valid_types
 *   An array of token types that will be used when token replacement is
 *   performed.
 * @return array
 *   An array with the invalid tokens in their original raw forms.
 */
function token_get_invalid_tokens_by_context($value, array $valid_types = array()) {
  if (in_array('all', $valid_types)) {
    $info = token_get_info();
    $valid_types = array_keys($info['types']);
  }
  else {
    // Add the token types that are always valid in global context.
    $valid_types = array_merge($valid_types, token_get_global_token_types());
  }

  $invalid_tokens = array();
  $value_tokens = is_string($value) ? token_scan($value) : $value;

  foreach ($value_tokens as $type => $tokens) {
    if (!in_array($type, $valid_types)) {
      // If the token type is not a valid context, its tokens are invalid.
      $invalid_tokens = array_merge($invalid_tokens, array_values($tokens));
    }
    else {
      // Check each individual token for validity.
      $invalid_tokens = array_merge($invalid_tokens, token_get_invalid_tokens($type, $tokens));
    }
  }

  array_unique($invalid_tokens);
  return $invalid_tokens;
}

/**
 * Validate an array of tokens based on their token type.
 *
 * @param string $type
 *   The type of tokens to validate (e.g. 'node', etc.)
 * @param array $tokens
 *   A keyed array of tokens, and their original raw form in the source text.
 * @return array
 *   An array with the invalid tokens in their original raw forms.
 */
function token_get_invalid_tokens($type, array $tokens) {
  $token_info = token_get_info();
  $invalid_tokens = array();

  foreach ($tokens as $token => $full_token) {
    // Split token up if it has chains.
    $parts = explode(':', $token, 2);

    if (!isset($token_info['tokens'][$type][$parts[0]])) {
      // This is an invalid token (not defined).
      $invalid_tokens[] = $full_token;
    }
    elseif (count($parts) == 2) {
      $sub_token_info = $token_info['tokens'][$type][$parts[0]];
      if (!empty($sub_token_info['dynamic'])) {
        // If this token has been flagged as a dynamic token, skip it.
        continue;
      }
      elseif (empty($sub_token_info['type'])) {
        // If the token has chains, but does not support it, it is invalid.
        $invalid_tokens[] = $full_token;
      }
      else {
        // Resursively check the chained tokens.
        $sub_tokens = token_find_with_prefix(array($token => $full_token), $parts[0]);
        $invalid_tokens = array_merge($invalid_tokens, token_get_invalid_tokens($sub_token_info['type'], $sub_tokens));
      }
    }
  }

  return $invalid_tokens;
}

/**
 * Renders a render array for display as a token.
 *
 * @param array $array
 *   The render array to be converted to HTML.
 * @param array $options
 *   Array of options for rendering.  Values can include:
 *   - sanitize: Runs check_plain() on the rendered output.
 *   - join: Joins rendered items together with a comma.
 *
 * @return string
 *   HTML of rendered item.
 *
 * @see token_render_array_value()
 */
function token_render_array(array $array, array $options = array()) {
  $rendered = array();
  foreach ($array as $key => $value) {
    if ($key[0] === '#') {
      continue;
    }
    $rendered[] = is_array($value) ? render($value) : (string) $value;
  }
  if (!empty($options['sanitize'])) {
    $rendered = array_map('check_plain', $rendered);
  }
  $join = isset($options['join']) ? $options['join'] : ', ';
  return implode($join, $rendered);
}

/**
 * Renders a render array for display as a token.
 *
 * @param string $value
 *   Value OR Render array.
 * @param array $options
 *   Array of options for rendering.  Values can include:
 *   - sanitize: Runs check_plain() on the rendered output.
 *
 * @return
 *   HTML of rendered item.
 *
 * @see token_render_array_value()
 */
function token_render_array_value($value, array $options = array()) {
  $rendered = is_array($value) ? render($value) : (string) $value;
  if (!empty($options['sanitize'])) {
    $rendered = check_plain($rendered);
  }
  return $rendered;
}
