<?php
/**
 * @file
 * Theme functions for the Taxonomy module.
 */

/**
 * Returns HTML for the vocabulary overview form as a sortable list of vocabularies.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @see taxonomy_overview_vocabularies()
 * @ingroup themeable
 */
function theme_taxonomy_overview_vocabularies($variables) {
  $form = $variables['form'];

  $rows = array();

  foreach (element_children($form) as $key) {
    if (isset($form[$key]['name'])) {
      $vocabulary = &$form[$key];

      $row = array();
      $row[] = backdrop_render($vocabulary['name']);
      if (isset($vocabulary['weight'])) {
        $vocabulary['weight']['#attributes']['class'] = array('vocabulary-weight');
        $row[] = backdrop_render($vocabulary['weight']);
      }
      $row[] = backdrop_render($vocabulary['operations']);
      $rows[] = array('data' => $row, 'class' => array('draggable'));
    }
  }

  $header = array(t('Vocabulary name'));
  if (isset($form['actions'])) {
    $header[] = t('Weight');
    backdrop_add_tabledrag('taxonomy', 'order', 'sibling', 'vocabulary-weight');
  }
  $header[] = t('Operations');
  return theme('table', array('header' => $header, 'rows' => $rows, 'empty' => t('No vocabularies available. <a href="@link">Add vocabulary</a>.', array('@link' => url('admin/structure/taxonomy/add'))), 'attributes' => array('id' => 'taxonomy'))) . backdrop_render_children($form);
}

/**
 * Returns HTML for a terms overview form as a sortable list of terms.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @see taxonomy_overview_terms()
 * @ingroup themeable
 */
function theme_taxonomy_overview_terms($variables) {
  $form = $variables['form'];

  $page_increment  = $form['#page_increment'];
  $page_entries    = $form['#page_entries'];
  $back_step     = $form['#back_step'];
  $forward_step  = $form['#forward_step'];

  // Add drag and drop if parent fields are present in the form.
  if ($form['#parent_fields']) {
    backdrop_add_tabledrag('taxonomy', 'match', 'parent', 'term-parent', 'term-parent', 'term-id', FALSE);
    backdrop_add_tabledrag('taxonomy', 'depth', 'group', 'term-depth', NULL, NULL, FALSE);
    backdrop_add_js(backdrop_get_path('module', 'taxonomy') . '/js/taxonomy.admin.js');
    backdrop_add_js(array('taxonomy' => array('backStep' => $back_step, 'forwardStep' => $forward_step)), 'setting');
    backdrop_add_css(backdrop_get_path('module', 'taxonomy') . '/css/taxonomy.css');
  }
  backdrop_add_tabledrag('taxonomy', 'order', 'sibling', 'term-weight');

  $errors = form_get_errors() != FALSE ? form_get_errors() : array();
  $rows = array();
  foreach (element_children($form) as $key) {
    if (isset($form[$key]['#term'])) {
      $term = &$form[$key];

      $row = array();
      $row[] = (isset($term['#term']['depth']) && $term['#term']['depth'] > 0 ? theme('indentation', array('size' => $term['#term']['depth'])) : ''). backdrop_render($term['view']);
      if ($form['#parent_fields']) {
        $term['tid']['#attributes']['class'] = array('term-id');
        $term['parent']['#attributes']['class'] = array('term-parent');
        $term['depth']['#attributes']['class'] = array('term-depth');
        $row[0] .= backdrop_render($term['parent']) . backdrop_render($term['tid']) . backdrop_render($term['depth']);
      }
      $term['weight']['#attributes']['class'] = array('term-weight');
      $row[] = backdrop_render($term['weight']);
      $row[] = backdrop_render($term['operations']);
      $row = array('data' => $row);
      $rows[$key] = $row;
    }
  }

  // Add necessary classes to rows.
  $row_position = 0;
  foreach ($rows as $key => $row) {
    $rows[$key]['class'] = array();
    if (isset($form['#parent_fields'])) {
      $rows[$key]['class'][] = 'draggable';
    }

    // Add classes that mark which terms belong to previous and next pages.
    if ($row_position < $back_step || $row_position >= $page_entries - $forward_step) {
      $rows[$key]['class'][] = 'taxonomy-term-preview';
    }

    if ($row_position !== 0 && $row_position !== count($rows) - 1) {
      if ($row_position == $back_step - 1 || $row_position == $page_entries - $forward_step - 1) {
        $rows[$key]['class'][] = 'taxonomy-term-divider-top';
      }
      elseif ($row_position == $back_step || $row_position == $page_entries - $forward_step) {
        $rows[$key]['class'][] = 'taxonomy-term-divider-bottom';
      }
    }

    // Add an error class if this row contains a form error.
    foreach ($errors as $error_key => $error) {
      if (strpos($error_key, $key) === 0) {
        $rows[$key]['class'][] = 'error';
      }
    }
    $row_position++;
  }

  if (empty($rows)) {
    $rows[] = array(array('data' => $form['#empty_text'], 'colspan' => '3'));
  }

  $header = array(t('Name'), t('Weight'), t('Operations'));
  $output = theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'taxonomy')));
  $output .= backdrop_render_children($form);
  $output .= theme('pager');

  return $output;
}

/**
 * Process variables for taxonomy-term.tpl.php.
 */
function template_preprocess_taxonomy_term(&$variables) {
  $variables['view_mode'] = $variables['elements']['#view_mode'];
  $variables['term'] = $variables['elements']['#term'];
  $term = $variables['term'];

  $uri = entity_uri('taxonomy_term', $term);
  $variables['term_url']  = url($uri['path'], $uri['options']);
  $variables['term_name'] = check_plain($term->name);
  $variables['page']      = $variables['view_mode'] == 'full' && taxonomy_term_is_page($term);

  // Flatten the term object's member fields.
  $variables = array_merge((array) $term, $variables);

  // Helpful $content variable for templates.
  $variables['content'] = array();
  foreach (element_children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }

  // field_attach_preprocess() overwrites the $[field_name] variables with the
  // values of the field in the language that was selected for display, instead
  // of the raw values in $term->[field_name], which contain all values in all
  // languages.
  field_attach_preprocess('taxonomy_term', $term, $variables['content'], $variables);

  // Gather classes, and clean up name so there are no underscores.
  $vocabulary_name_css = backdrop_clean_css_identifier($term->vocabulary);
  $variables['classes'][] = 'vocabulary-' . $vocabulary_name_css;
}

