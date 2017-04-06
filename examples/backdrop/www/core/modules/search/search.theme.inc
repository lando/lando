<?php
/**
 * @file
 * Theme functions for the Search module.
 */

/**
 * Process variables for search-results.tpl.php.
 *
 * The $variables array contains the following arguments:
 * - $results: Search results array.
 * - $module: Module the search results came from (module implementing
 *   hook_search_info()).
 *
 * @see search-results.tpl.php
 */
function template_preprocess_search_results(&$variables) {
  global $language;
  $variables['search_results'] = array();
  if (!empty($variables['module'])) {
    $variables['module'] = check_plain($variables['module']);
  }
  foreach ($variables['results'] as $result) {
    $info = array();
    if (empty($result['attributes']))  {
      $attributes = '';
    }
    else {
      $attributes = implode(' ', $result['attributes']);
    }
    if (!empty($result['module'])) {
      $info['module'] = check_plain($result['module']);
    }
    if (!empty($result['user'])) {
      $info['user'] = $result['user'];
    }
    if (!empty($result['date'])) {
      $info['date'] = format_date($result['date'], 'short');
    }
    if (isset($result['extra']) && is_array($result['extra'])) {
      $info = array_merge($info, $result['extra']);
    }

    $variables['search_results'][] = array(
      'result' => $result, 
      'module' => $variables['module'],
      'url' => check_url($result['link']),
      'title' => check_plain($result['title']),
      'snippet' => isset($result['snippet']) ? $result['snippet'] : '',
      'info_split' => $info,
      'info' => implode(' - ', $info),
      'attributes' => $attributes,
    );
    
    if (isset($result['language']) && $result['language'] != $language->langcode && $result['language'] != LANGUAGE_NONE) {
      $variables['content_attributes']['lang'] = $result['language'];
    }
  }
  $variables['pager'] = theme('pager', array('tags' => NULL));
  $variables['theme_hook_suggestions'][] = 'search_results__' . $variables['module'];
}

