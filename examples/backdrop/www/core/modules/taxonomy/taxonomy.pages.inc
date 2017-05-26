<?php

/**
 * @file
 * Page callbacks for the taxonomy module.
 */

/**
 * Menu callback; displays all nodes associated with a term.
 *
 * @param TaxonomyTerm $term
 *   The taxonomy term entity.
 */
function taxonomy_term_page(TaxonomyTerm $term) {
  // If there is a menu link to this term, the link becomes the last part of
  // the active trail, and the link name becomes the page title. Thus, we must
  // explicitly set the page title to be the term title.
  backdrop_set_title($term->name);

  // Build breadcrumb based on the hierarchy of the term.
  $current = (object) array(
    'tid' => $term->tid,
  );
  // @todo This overrides any other possible breadcrumb and is a pure hard-coded
  //   presumption. Make this behavior configurable per vocabulary or term.
  $breadcrumb = array();
  while ($parents = taxonomy_term_load_parents($current->tid)) {
    $current = array_shift($parents);
    $breadcrumb[] = l($current->name, 'taxonomy/term/' . $current->tid);
  }
  $breadcrumb[] = l(t('Home'), NULL);
  $breadcrumb = array_reverse($breadcrumb);
  backdrop_set_breadcrumb($breadcrumb);
  backdrop_add_feed('taxonomy/term/' . $term->tid . '/feed', 'RSS - ' . $term->name);

  // Set the term path as the canonical URL to prevent duplicate content.
  $uri = entity_uri('taxonomy_term', $term);
  $canonical_secure = config_get('system.core', 'canonical_secure') == 1 ? TRUE : FALSE;
  $uri_options = array('absolute' => TRUE, 'https' => $canonical_secure);
  backdrop_add_html_head_link(array('rel' => 'canonical', 'href' => url($uri['path'], array_merge($uri['options'], $uri_options))), TRUE);

  // Normally we would call taxonomy_term_show() here, but for backwards
  // compatibility in Drupal 7 we do not want to do that (it produces different
  // data structures and HTML markup than what Drupal 7 released with). Calling
  // taxonomy_term_view() directly provides essentially the same thing, but
  // allows us to wrap the rendered term in our desired array structure.
  $build['term_heading'] = array(
    '#prefix' => '<div class="term-listing-heading">',
    '#suffix' => '</div>',
    'term' => taxonomy_term_view($term, 'full'),
  );

  if ($nids = taxonomy_select_nodes($term->tid, TRUE, config_get('system.core', 'default_nodes_main'))) {
    $nodes = node_load_multiple($nids);
    $build += node_view_multiple($nodes);
    $build['pager'] = array(
      '#theme' => 'pager',
      '#weight' => 5,
    );
  }
  else {
    $build['no_content'] = array(
      '#prefix' => '<p>',
      '#markup' => t('There is currently no content classified with this term.'),
      '#suffix' => '</p>',
    );
  }

  backdrop_alter('taxonomy_term_page', $build);

  return $build;
}

/**
 * Generate the content feed for a taxonomy term.
 *
 * @param TaxonomyTerm $term
 *   The taxonomy term entity.
 */
function taxonomy_term_feed(TaxonomyTerm $term) {
  $channel['link'] = url('taxonomy/term/' . $term->tid, array('absolute' => TRUE));
  $channel['title'] = config_get('system.core', 'site_name') . ' - ' . $term->name;
  // Only display the description if we have a single term, to avoid clutter and confusion.
  // HTML will be removed from feed description.
  $channel['description'] = check_markup($term->description, $term->format, '', TRUE);
  $nids = taxonomy_select_nodes($term->tid, FALSE, config_get('system.rss', 'rss_limit'));

  node_feed($nids, $channel);
}

/**
 * Page callback: Outputs JSON for taxonomy autocomplete suggestions.
 *
 * This callback outputs term name suggestions in response to Ajax requests
 * made by the taxonomy autocomplete widget for taxonomy term reference
 * fields. The output is a JSON object of plain-text term suggestions, keyed by
 * the user-entered value with the completed term name appended.  Term names
 * containing commas are wrapped in quotes.
 *
 * For example, suppose the user has entered the string 'red fish, blue' in the
 * field, and there are two taxonomy terms, 'blue fish' and 'blue moon'. The
 * JSON output would have the following structure:
 * @code
 *   {
 *     "red fish, blue fish": "blue fish",
 *     "red fish, blue moon": "blue moon",
 *   };
 * @endcode
 *
 * @param $field_name
 *   The name of the term reference field.
 * @param $tags_typed
 *   (optional) A comma-separated list of term names entered in the
 *   autocomplete form element. Only the last term is used for autocompletion.
 *   Defaults to '' (an empty string).
 *
 * @see taxonomy_menu()
 * @see taxonomy_field_widget_info()
 */
function taxonomy_autocomplete($field_name = '', $tags_typed = '') {
  // Make sure the field exists and is a taxonomy field.
  if (!($field = field_info_field($field_name)) || $field['type'] !== 'taxonomy_term_reference') {
    // Error string. The JavaScript handler will realize this is not JSON and
    // will display it as debugging information.
    print t('Taxonomy field @field_name not found.', array('@field_name' => $field_name));
    exit;
  }

  // The user enters a comma-separated list of tags. We only autocomplete the last tag.
  $tags_typed = backdrop_explode_tags($tags_typed);
  $tag_last = backdrop_strtolower(array_pop($tags_typed));

  $term_matches = array();
  if ($tag_last != '') {
    $query = db_select('taxonomy_term_data', 't');
    $query->addTag('translatable');
    $query->addTag('taxonomy_term_access');

    // Do not select already entered terms.
    if (!empty($tags_typed)) {
      $query->condition('t.name', $tags_typed, 'NOT IN');
    }
    // Select rows that match by term name.
    $vocabulary_list = isset($field['settings']['allowed_values']) ? $field['settings']['allowed_values'] : array();
    $tags_return = $query
      ->fields('t', array('tid', 'name'))
      ->condition('t.vocabulary', $vocabulary_list)
      ->condition('t.name', '%' . db_like($tag_last) . '%', 'LIKE')
      ->range(0, 10)
      ->execute()
      ->fetchAllKeyed();

    $prefix = count($tags_typed) ? backdrop_implode_tags($tags_typed) . ', ' : '';

    foreach ($tags_return as $tid => $name) {
      $n = $name;
      // Term names containing commas or quotes must be wrapped in quotes.
      if (strpos($name, ',') !== FALSE || strpos($name, '"') !== FALSE) {
        $n = '"' . str_replace('"', '""', $name) . '"';
      }
      $term_matches[$prefix . $n] = check_plain($name);
    }
  }

  // Displayed as JSON by delivery callback backdrop_json_deliver().
  return $term_matches;
}
