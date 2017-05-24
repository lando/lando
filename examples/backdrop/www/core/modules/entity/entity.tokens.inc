<?php
/**
 * @file
 * Token callbacks for the entity module.
 */

/**
 * Implements hook_token_info_alter().
 */
function entity_token_info_alter(&$info) {
  // Add [token:url] tokens for any URI-able entities.
  $entities = entity_get_info();
  foreach ($entities as $entity => $entity_info) {
    if (!isset($entity_info['token type'])) {
      continue;
    }

    $token_type = $entity_info['token type'];
    if (!isset($info['types'][$token_type]) || !isset($info['tokens'][$token_type])) {
      continue;
    }

    // Add [entity:url] tokens if they do not already exist.
    if (!isset($info['tokens'][$token_type]['url']) && !empty($entity_info['uri callback'])) {
      $info['tokens'][$token_type]['url'] = array(
        'name' => t('URL'),
        'description' => t('The URL of the @entity.', array('@entity' => backdrop_strtolower($entity_info['label']))),
        'module' => 'token',
        'type' => 'url',
      );
    }

    // Add [entity:original] tokens if they do not already exist.
    if (!isset($info['tokens'][$token_type]['original'])) {
      $info['tokens'][$token_type]['original'] = array(
        'name' => t('Original @entity', array('@entity' => backdrop_strtolower($entity_info['label']))),
        'description' => t('The original @entity data if the @entity is being updated or saved.', array('@entity' => backdrop_strtolower($entity_info['label']))),
        'module' => 'token',
        'type' => $token_type,
      );
    }
  }
}

/**
 * Implements hook_tokens().
 */
function entity_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $sanitize = !empty($options['sanitize']);
  $replacements = array();
  if (!empty($data[$type]) && is_a($data[$type], 'Entity')) {
    $entity = $data[$type];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'url':
          if (token_get_module($type, 'url') == 'entity' && $uri = $entity->uri()) {
            $uri['options']['absolute'] = TRUE;
            $replacements[$original] = url($uri['path'], $uri['options']);
          }
          break;

        case 'original':
          if (!empty($entity->original)) {
            $label = $entity->original->label();
            $replacements[$original] = $sanitize ? check_plain($label) : $label;
          }
          break;
      }
    }

    // [entity:url:*] chained tokens.
    if (token_get_module($type, 'url') == 'entity' && $url_tokens = token_find_with_prefix($tokens, 'url')) {
      $replacements += token_generate('url', $url_tokens, $entity->uri(), $options);
    }

    // [entity:original:*] chained tokens.
    if (($original_tokens = token_find_with_prefix($tokens, 'original')) && !empty($entity->original)) {
      $replacements += token_generate($type, $original_tokens, array($type => $entity->original), $options);
    }
  }

  return $replacements;
}
