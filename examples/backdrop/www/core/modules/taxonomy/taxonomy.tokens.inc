<?php
/**
 * @file
 * Builds placeholder replacement tokens for taxonomy terms and vocabularies.
 */

/**
 * Implements hook_token_info().
 */
function taxonomy_token_info() {
  $types['term'] = array(
    'name' => t('Taxonomy terms'),
    'description' => t('Tokens related to taxonomy terms.'),
    'needs-data' => 'term',
  );
  $types['vocabulary'] = array(
    'name' => t('Vocabularies'),
    'description' => t('Tokens related to taxonomy vocabularies.'),
    'needs-data' => 'vocabulary',
  );

  // Taxonomy term related variables.
  $term['tid'] = array(
    'name' => t('Term ID'),
    'description' => t('The unique ID of the taxonomy term.'),
  );
  $term['name'] = array(
    'name' => t('Name'),
    'description' => t('The name of the taxonomy term.'),
  );
  $term['description'] = array(
    'name' => t('Description'),
    'description' => t('The optional description of the taxonomy term.'),
  );
  $term['node-count'] = array(
    'name' => t('Node count'),
    'description' => t('The number of nodes tagged with the taxonomy term.'),
  );
  $term['url'] = array(
    'name' => t('URL'),
    'description' => t('The URL of the taxonomy term.'),
    'type' => 'url',
  );
  $term['edit-url'] = array(
    'name' => t('Edit URL'),
    'description' => t("The URL of the taxonomy term's edit page."),
    'type' => 'url',
  );
  $term['parents'] = array(
    'name' => t('Parents'),
    'description' => t("An array of all the term's parents, starting with the root."),
    'type' => 'array',
  );
  $term['root'] = array(
    'name' => t('Root term'),
    'description' => t('The root term of the taxonomy term.'),
    'type' => 'term',
  );

  // Taxonomy vocabulary related variables.
  $vocabulary['name'] = array(
    'name' => t('Name'),
    'description' => t('The human-readable name of the taxonomy vocabulary.'),
  );
  $vocabulary['machine-name'] = array(
    'name' => t('Machine-readable name'),
    'description' => t('The unique machine-readable name of the vocabulary.'),
  );
  $vocabulary['description'] = array(
    'name' => t('Description'),
    'description' => t('The optional description of the taxonomy vocabulary.'),
  );
  $vocabulary['node-count'] = array(
    'name' => t('Node count'),
    'description' => t('The number of nodes tagged with terms belonging to the taxonomy vocabulary.'),
  );
  $vocabulary['term-count'] = array(
    'name' => t('Term count'),
    'description' => t('The number of terms belonging to the taxonomy vocabulary.'),
  );
  $vocabulary['edit-url'] = array(
    'name' => t('Edit URL'),
    'description' => t("The URL of the vocabulary's edit page."),
    'type' => 'url',
  );

  // Chained tokens for taxonomies
  $term['parent'] = array(
    'name' => t('Parent term'),
    'description' => t('The parent term of the taxonomy term, if one exists. If more than one parent exists, the first parent.'),
    'type' => 'term',
  );
  $term['vocabulary'] = array(
    'name' => t('Vocabulary'),
    'description' => t('The vocabulary the taxonomy term belongs to.'),
    'type' => 'vocabulary',
  );

  return array(
    'types' => $types,
    'tokens' => array(
      'term' => $term,
      'vocabulary' => $vocabulary,
    ),
  );
}

/**
 * Implements hook_tokens().
 */
function taxonomy_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $replacements = array();
  $sanitize = !empty($options['sanitize']);
  $url_options = array('absolute' => TRUE);

  if ($type == 'term' && !empty($data['term'])) {
    $term = $data['term'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'tid':
          $replacements[$original] = $term->tid;
          break;

        case 'name':
          $replacements[$original] = $sanitize ? check_plain($term->name) : $term->name;
          break;

        case 'description':
          $replacements[$original] = $sanitize ? check_markup($term->description, $term->format, '', TRUE) : $term->description;
          break;

        case 'url':
          $uri = $term->uri();
          $replacements[$original] = url($uri['path'], array_merge($uri['options'], array('absolute' => TRUE)));
          break;

        case 'edit-url':
          $replacements[$original] = url("taxonomy/term/{$term->tid}/edit", $url_options);
          break;

        case 'node-count':
          $query = db_select('taxonomy_index');
          $query->condition('tid', $term->tid);
          $query->addTag('term_node_count');
          $count = $query->countQuery()->execute()->fetchField();
          $replacements[$original] = $count;
          break;

        case 'vocabulary':
          $vocabulary = taxonomy_vocabulary_load($term->vocabulary);
          $replacements[$original] = check_plain($vocabulary->name);
          break;

        case 'parent':
          if ($parents = taxonomy_term_load_parents($term->tid)) {
            $parent = array_pop($parents);
            $replacements[$original] = check_plain($parent->name);
          }
          break;

        case 'parents':
          if ($parents = _taxonomy_token_term_parent_list($term->tid)) {
            $replacements[$original] = token_render_array($parents, $options);
          }
          break;

        case 'root':
          $parents = taxonomy_term_load_parents_all($term->tid);
          $root_term = end($parents);
          if ($root_term->tid != $term->tid) {
            $replacements[$original] = $sanitize ? check_plain($root_term->name) : $root_term->name;
          }
          break;
      }
    }

    // Chained token relationships.
    if ($vocabulary_tokens = token_find_with_prefix($tokens, 'vocabulary')) {
      $vocabulary = taxonomy_vocabulary_load($term->vocabulary);
      $replacements += token_generate('vocabulary', $vocabulary_tokens, array('vocabulary' => $vocabulary), $options);
    }

    if (($vocabulary_tokens = token_find_with_prefix($tokens, 'parent')) && $parents = taxonomy_term_load_parents($term->tid)) {
      $parent = array_pop($parents);
      $replacements += token_generate('term', $vocabulary_tokens, array('term' => $parent), $options);
    }

    if (($url_tokens = token_find_with_prefix($tokens, 'url'))) {
      $replacements += token_generate('url', $url_tokens, $term->uri(), $options);
    }
    // [term:parents:*] chained tokens.
    if ($parents_tokens = token_find_with_prefix($tokens, 'parents')) {
      if ($parents = _taxonomy_token_term_parent_list($term->tid)) {
        $replacements += token_generate('array', $parents_tokens, array('array' => $parents), $options);
      }
    }
    if ($root_tokens = token_find_with_prefix($tokens, 'root')) {
      $parents = taxonomy_term_load_parents_all($term->tid);
      $root_term = end($parents);
      if ($root_term->tid != $term->tid) {
        $replacements += token_generate('term', $root_tokens, array('term' => $root_term), $options);
      }
    }
  }

  elseif ($type == 'vocabulary' && !empty($data['vocabulary'])) {
    $vocabulary = $data['vocabulary'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'name':
          $replacements[$original] = $sanitize ? check_plain($vocabulary->name) : $vocabulary->name;
          break;

        case 'machine-name':
          $replacements[$original] = $vocabulary->machine_name;
          break;

        case 'description':
          $replacements[$original] = $sanitize ? filter_xss($vocabulary->description) : $vocabulary->description;
          break;

        case 'term-count':
          $query = db_select('taxonomy_term_data');
          $query->condition('vocabulary', $vocabulary->machine_name);
          $query->addTag('vocabulary_term_count');
          $count = $query->countQuery()->execute()->fetchField();
          $replacements[$original] = $count;
          break;

        case 'node-count':
          $query = db_select('taxonomy_index', 'ti');
          $query->addExpression('COUNT(DISTINCT ti.nid)');
          $query->leftJoin('taxonomy_term_data', 'td', 'ti.tid = td.tid');
          $query->condition('td.vocabulary', $vocabulary->machine_name);
          $query->addTag('vocabulary_node_count');
          $count = $query->execute()->fetchField();
          $replacements[$original] = $count;
          break;

        case 'edit-url':
          $replacements[$original] = url("admin/structure/taxonomy/{$vocabulary->machine_name}/edit", $url_options);
          break;
      }
    }
  }

  return $replacements;
}

/**
 * Get a list of a term's parents as a term ID to label map.
 *
 * This function is intended for use exclusively for tokens.
 *
 * @param $tid
 *   Taxonomy term ID.
 *
 * @return
 *   Array of taxonomy term names keyed by term ID.
 */
function _taxonomy_token_term_parent_list($tid) {
  if (!is_numeric($tid)) {
    return array();
  }

  $parent_list = array();
  $parents = taxonomy_term_load_parents_all($tid);
  array_shift($parents); // Remove this term from the array.
  $parents = array_reverse($parents);
  foreach ($parents as $term) {
    $parent_list[$term->tid] = $term->label();
  }

  return $parent_list;
}
