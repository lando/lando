<?php
/**
 * @file
 * Builds placeholder replacement tokens for node-related data.
 */

/**
 * Implements hook_token_info().
 */
function node_token_info() {
  $types = array(
    'node' => array(
      'name' => t('Content'),
      'description' => t('Tokens related to individual pieces of content, or "nodes".'),
      'needs-data' => 'node',
    ),
    'content-type' => array(
      'name' => t('Content types'),
      'description' => t('Tokens related to content types.'),
      'needs-data' => 'node_type',
    ),
  );

  // Node tokens.
  $node['nid'] = array(
    'name' => t('Content ID'),
    'description' => t('The unique ID of the content item, or "node".'),
  );
  $node['content-type'] = array(
    'name' => t('Content type'),
    'description' => t('The human-readable name of the content type.'),
    'type' => 'content-type',
  );
  // @deprecated: Use node:content-type:name
  $node['type-name'] = array(
    'name' => t('Content type name'),
    'description' => t('The human-readable name of the content type.'),
    'deprecated' => TRUE,
  );
  // @deprecated: Use node:content-type
  $node['type'] = array(
    'name' => t('Content type'),
    'description' => t('The machine name of the content type.'),
    'deprecated' => TRUE,
  );
  $node['title'] = array(
    'name' => t('Title'),
    'description' => t('The title of the node.'),
  );
  $node['body'] = array(
    'name' => t('Body'),
    'description' => t('The main body text of the node.'),
  );
  $node['summary'] = array(
    'name' => t('Summary'),
    'description' => t("The summary of the node's main body text."),
  );
  $node['langcode'] = array(
    'name' => t('Language code'),
    'description' => t('The language code of the language the node is written in.'),
  );
  $node['url'] = array(
    'name' => t('URL'),
    'description' => t('The URL of the node.'),
    'type' => 'url',
  );
  $node['edit-url'] = array(
    'name' => t('Edit URL'),
    'description' => t("The URL of the node's edit page."),
    'type' => 'url',
  );
  $node['tnid'] = array(
    'name' => t('Translation set ID'),
    'description' => t('The unique ID of the original-language version of this node, if one exists.'),
  );
  $node['source'] = array(
    'name' => t('Translation source node'),
    'description' => t("The source node for this current node's translation set."),
    'type' => 'node',
  );
  $node['vid'] = array(
    'name' => t('Revision ID'),
    'description' => t("The unique ID of the node's latest revision."),
  );
  $node['log'] = array(
    'name' => t('Revision log message'),
    'description' => t('The explanation of the most recent changes made to the node.'),
  );

  // Chained tokens for nodes.
  $node['created'] = array(
    'name' => t('Date created'),
    'description' => t('The date the node was posted.'),
    'type' => 'date',
  );
  $node['changed'] = array(
    'name' => t('Date changed'),
    'description' => t('The date the node was most recently updated.'),
    'type' => 'date',
  );
  $node['author'] = array(
    'name' => t('Author'),
    'description' => t('The author of the node.'),
    'type' => 'user',
  );

  // Content type tokens.
  $content_type['name'] = array(
    'name' => t('Name'),
    'description' => t('The human-readable name of the content type.'),
  );
  $content_type['machine-name'] = array(
    'name' => t('Machine-readable name'),
    'description' => t('The unique machine-readable name of the content type.'),
  );
  $content_type['description'] = array(
    'name' => t('Description'),
    'description' => t('The optional description of the content type.'),
  );
  $content_type['node-count'] = array(
    'name' => t('Node count'),
    'description' => t('The number of nodes belonging to the content type.'),
  );

  // Check to see if translation modules are enabled before showing tokens.
  if (!module_exists('translation')) {
    $node['tnid']['restricted'] = TRUE;
    $node['source']['restricted'] = TRUE;
  }

  return array(
    'types' => $types,
    'tokens' => array(
      'node' => $node,
      'content-type' => $content_type,
    ),
  );
}

/**
 * Implements hook_tokens().
 */
function node_tokens($type, $tokens, array $data = array(), array $options = array()) {
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

  if ($type == 'node' && !empty($data['node'])) {
    $node = $data['node'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        // Simple key values on the node.
        case 'nid':
          $replacements[$original] = $node->nid;
          break;

        case 'vid':
          $replacements[$original] = $node->vid;
          break;

        case 'type':
          $replacements[$original] = $sanitize ? check_plain($node->type) : $node->type;
          break;

        case 'content-type':
        case 'type-name': // Deprecated.
          $type_name = node_type_get_name($node);
          $replacements[$original] = $sanitize ? check_plain($type_name) : $type_name;
          break;

        case 'title':
          $replacements[$original] = $sanitize ? check_plain($node->title) : $node->title;
          break;

        case 'body':
        case 'summary':
          if ($items = field_get_items('node', $node, 'body', $language_code)) {
            $instance = field_info_instance('node', 'body', $node->type);
            $field_langcode = field_language('node', $node, 'body', $language_code);
            // If the summary was requested and is not empty, use it.
            if ($name == 'summary' && !empty($items[0]['summary'])) {
              $output = $sanitize ? _text_sanitize($instance, $field_langcode, $items[0], 'summary') : $items[0]['summary'];
            }
            // Attempt to provide a suitable version of the 'body' field.
            else {
              $output = $sanitize ? _text_sanitize($instance, $field_langcode, $items[0], 'value') : $items[0]['value'];
              // A summary was requested.
              if ($name == 'summary') {
                if (isset($instance['display']['teaser']['settings']['trim_length'])) {
                  $trim_length = $instance['display']['teaser']['settings']['trim_length'];
                }
                else {
                  // Use default value.
                  $trim_length = NULL;
                }
                // Generate an optionally trimmed summary of the body field.
                $output = text_summary($output, $instance['settings']['text_processing'] ? $items[0]['format'] : NULL, $trim_length);
              }
            }
            $replacements[$original] = $output;
          }
          break;

        case 'langcode':
          $replacements[$original] = $sanitize ? check_plain($node->langcode) : $node->langcode;
          break;

        case 'url':
          $replacements[$original] = url('node/' . $node->nid, $url_options);
          break;

        case 'edit-url':
          $replacements[$original] = url('node/' . $node->nid . '/edit', $url_options);
          break;

        // Default values for the chained tokens handled below.
        case 'author':
          $account = user_load($node->uid);
          $name = user_format_name($account);
          $replacements[$original] = $sanitize ? check_plain($name) : $name;
          break;

        case 'created':
          $replacements[$original] = format_date($node->created, 'medium', '', NULL, $language_code);
          break;

        case 'changed':
          $replacements[$original] = format_date($node->changed, 'medium', '', NULL, $language_code);
          break;

        case 'tnid':
          $replacements[$original] = $node->tnid;
          break;

        case 'source':
          if (!empty($node->tnid) && $source_node = node_load($node->tnid)) {
            $title = $source_node->title;
            $replacements[$original] = $sanitize ? filter_xss($title) : $title;
          }
          break;

        case 'log':
          $replacements[$original] = $sanitize ? filter_xss($node->log) : $node->log;
          break;
      }
    }

    // Chained token relationships.
    if ($author_tokens = token_find_with_prefix($tokens, 'author')) {
      $author = user_load($node->uid);
      $replacements += token_generate('user', $author_tokens, array('user' => $author), $options);
    }

    if ($created_tokens = token_find_with_prefix($tokens, 'created')) {
      $replacements += token_generate('date', $created_tokens, array('date' => $node->created), $options);
    }

    if ($changed_tokens = token_find_with_prefix($tokens, 'changed')) {
      $replacements += token_generate('date', $changed_tokens, array('date' => $node->changed), $options);
    }

    if (!empty($node->tnid) && ($source_tokens = token_find_with_prefix($tokens, 'source')) && $source_node = node_load($node->tnid)) {
      $replacements += token_generate('node', $source_tokens, array('node' => $source_node), $options);
    }

    if (($url_tokens = token_find_with_prefix($tokens, 'url'))) {
      $replacements += token_generate('url', $url_tokens, $node->uri(), $options);
    }

    if (($node_type_tokens = token_find_with_prefix($tokens, 'content-type')) && $node_type = node_type_load($node->type)) {
      $replacements += token_generate('content-type', $node_type_tokens, array('node_type' => $node_type), $options);
    }
  }

  // Content type tokens.
  if ($type == 'content-type' && !empty($data['node_type'])) {
    $node_type = $data['node_type'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'name':
          $replacements[$original] = $sanitize ? check_plain($node_type->name) : $node_type->name;
          break;

        case 'machine-name':
          // This is a machine name so does not ever need to be sanitized.
          $replacements[$original] = $node_type->type;
          break;

        case 'description':
          $replacements[$original] = $sanitize ? filter_xss($node_type->description) : $node_type->description;
          break;

        case 'node-count':
          $query = db_select('node');
          $query->condition('type', $node_type->type);
          $query->addTag('node_type_node_count');
          $count = $query->countQuery()->execute()->fetchField();
          $replacements[$original] = (int) $count;
          break;

        case 'edit-url':
          $replacements[$original] = url("admin/structure/types/manage/{$node_type->type}", $url_options);
          break;
      }
    }
  }

  return $replacements;
}
