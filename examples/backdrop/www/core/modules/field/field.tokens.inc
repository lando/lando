<?php
/**
 * @file
 * Builds placeholder replacement tokens for field-related data.
 */

/**
 * Implements hook_token_info_alter().
 *
 * We use hook_token_info_alter() rather than hook_token_info() as other
 * modules may already have defined some field tokens.
 */
function field_token_info_alter(&$info) {
  $fields = _field_token_info();

  // Attach field tokens to their respective entity tokens.
  foreach ($fields as $field_name => $field) {
    foreach (array_keys($field['bundles']) as $token_type) {
      // If a token already exists for this field, then don't add it.
      if (isset($info['tokens'][$token_type][$field_name])) {
        continue;
      }

      // Ensure both tokens and token types exist.
      if (!isset($info['types'][$token_type]) || !isset($info['tokens'][$token_type])) {
        continue;
      }

      // Comment module provides the comment field as [comment:body].
      if ($token_type == 'comment' && $field_name == 'comment_body') {
        continue;
      }

      $info['tokens'][$token_type][$field_name] = array(
        // Note that label and description have already been sanitized by _field_token_info().
        'name' => $field['label'],
        'description' => $field['description'],
      );
    }
  }
}

/**
 * Implements hook_tokens().
 */
function field_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $replacements = array();
  $sanitize = !empty($options['sanitize']);
  $langcode = isset($options['language']) ? $options['language']->langcode : NULL;

  // Entity tokens.
  if (!empty($data[$type]) && is_a($data[$type], 'Entity')) {
    // The field API does weird stuff to the entity, so let's clone it.
    $entity = clone $data[$type];
    $entity_type = $entity->entityType();
    $bundle = $entity->bundle();

    // Reset the prepared view flag in case token generation is called from
    // inside field_attach_view().
    if (isset($entity->_field_view_prepared)) {
      unset($entity->_field_view_prepared);
    }

    $fields = field_info_instances($entity_type, $bundle);
    foreach (array_keys($fields) as $field_name) {
      // Do not continue if the field is empty.
      if (empty($entity->{$field_name})) {
        continue;
      }

      // Node module already replaces the body field as [node:body].
      if ($entity_type == 'node' && $field_name == 'body') {
        continue;
      }

      if (isset($tokens[$field_name])) {
        $original = $tokens[$field_name];

        $field_output = field_view_field($entity_type, $entity, $field_name, 'token', $langcode);
        $field_output['#token_options'] = $options;
        $field_output['#pre_render'][] = 'field_pre_render_token';
        $replacements[$original] = backdrop_render($field_output);
      }
    }

    // Remove the cloned object from memory.
    unset($entity);
  }

  return $replacements;
}

/**
 * Pre-render callback for field output used with tokens.
 */
function field_pre_render_token(&$elements) {
  // Remove the field theme hook, attachments, and JavaScript states.
  unset($elements['#theme']);
  unset($elements['#states']);
  unset($elements['#attached']);

  // Prevent multi-value fields from appearing smooshed together by appending
  // a join suffix to all but the last value.
  $deltas = element_get_visible_children($elements);
  $count = count($deltas);
  if ($count > 1) {
    $join = isset($elements['#token_options']['join']) ? $elements['#token_options']['join'] : ", ";
    foreach ($deltas as $index => $delta) {
      // Do not add a suffix to the last item.
      if ($index < ($count - 1)) {
        $elements[$delta] += array('#suffix' => $join);
      }
    }
  }
  return $elements;
}

/**
 * Fetch an array of field data used for tokens.
 */
function _field_token_info($field_name = NULL) {
  $info = &backdrop_static(__FUNCTION__);

  $cache = cache('token');

  if (!isset($fields)) {
    if ($cached = $cache->get('field:info')) {
      $info = $cached->data;
    }
    else {
      $info = array();

      $fields = field_info_fields();
      $instances = field_info_instances();
      $type_info = field_info_field_types();
      $entity_info = entity_get_info();

      foreach ($fields as $field) {
        $key = $field['field_name'];
        if (!empty($field['bundles'])) {
          foreach (array_keys($field['bundles']) as $entity_type) {
            // Make sure a token type exists for this entity.
            $token_type = $entity_info[$entity_type]['token type'];
            if (empty($token_type)) {
              continue;
            }

            $info[$key]['token types'][] = $token_type;
            $info[$key] += array('labels' => array(), 'bundles' => array());

            // Find which label is most commonly used.
            foreach ($field['bundles'][$entity_type] as $bundle) {
              // Field information will included fields attached to disabled
              // bundles, so check that the bundle exists before provided a
              // token for it.
              // @see http://drupal.org/node/1252566
              if (!isset($entity_info[$entity_type]['bundles'][$bundle])) {
                continue;
              }

              $info[$key]['labels'][] = $instances[$entity_type][$bundle][$key]['label'];
              $info[$key]['bundles'][$token_type][$bundle] = $entity_info[$entity_type]['bundles'][$bundle]['label'];
            }
          }
        }

        if (isset($info[$key])) {
          $labels = array_count_values($info[$key]['labels']);
          arsort($labels);
          $info[$key]['label'] = check_plain(key($labels));

          // Generate a description for the token.
          $info[$key]['description'] = t('@type field.', array('@type' => $type_info[$field['type']]['label']));
          if ($also_known_as = array_unique(array_diff($info[$key]['labels'], array($info[$key]['label'])))) {
            $info[$key]['description'] .= ' ' . t('Also known as %labels.', array('%labels' => implode(', ', $also_known_as)));
          }
        }
      }

      backdrop_alter('token_field_info', $info);
      $cache->set('field:info', $info);
    }
  }

  if (isset($field_name)) {
    return isset($info[$field_name]) ? $info[$field_name] : FALSE;
  }

  return $info;
}
