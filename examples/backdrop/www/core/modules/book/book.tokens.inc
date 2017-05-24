<?php
/**
 * @file
 * Builds placeholder replacement tokens for book-related data.
 */

/**
 * Implements hook_token_info().
 */
function book_token_info() {
  $info['tokens']['node']['book'] = array(
    'name' => t('Book'),
    'description' => t('The book page associated with the node.'),
    'type' => 'menu-link',
  );
  return $info;
}

/**
 * Implements hook_tokens() on behalf of book.module.
 */
function book_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $replacements = array();
  $sanitize = !empty($options['sanitize']);

  // Node tokens.
  if ($type == 'node' && !empty($data['node'])) {
    $node = $data['node'];

    if (!empty($node->book['mlid'])) {
      // Skip access check to generat tokens before node grants are saved.
      $link = book_link_load($node->book['mlid'], TRUE);

      foreach ($tokens as $name => $original) {
        switch ($name) {
          case 'book':
            $replacements[$original] = $sanitize ? check_plain($link['title']) : $link['title'];
            break;
        }
      }

      // Chained token relationships.
      if ($book_tokens = token_find_with_prefix($tokens, 'book')) {
        $replacements += token_generate('menu-link', $book_tokens, array('menu-link' => $link), $options);
      }
    }
  }

  return $replacements;
}
