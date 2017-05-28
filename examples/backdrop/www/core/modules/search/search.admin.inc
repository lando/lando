<?php
/**
 * @file
 * Admin page callbacks for the search module.
 */

/**
 * Menu callback: confirm wiping of the index.
 */
function search_reindex_confirm() {
  return confirm_form(array(),
    t('Are you sure you want to invalidate the search index?'),
    'admin/config/search/settings',
    t('The search index is not cleared immediately but will be systematically updated. Search will continue to work but new content won\'t be indexed until all existing content has been re-indexed. This action cannot be undone.'),
    t('Invalidate search index'),
    t('Cancel'));
}

/**
 * Handler for wipe confirmation
 */
function search_reindex_confirm_submit(&$form, &$form_state) {
  if ($form['confirm']) {
    search_reindex();
    backdrop_set_message(t('The search index will be invalidated.'));
    $form_state['redirect'] = 'admin/config/search/settings';
    return;
  }
}

/**
 * Helper function to get real module names.
 */
function _search_get_module_names() {

  $search_info = search_get_info(TRUE);
  $system_info = system_get_info('module');
  $names = array();
  foreach ($search_info as $module => $info) {
    $names[$module] = $system_info[$module]['name'];
  }
  asort($names, SORT_STRING);
  return $names;
}

/**
 * Menu callback: displays the search module settings page.
 *
 * @ingroup forms
 *
 * @see search_admin_settings_validate()
 * @see search_admin_settings_submit()
 * @see search_admin_reindex_submit()
 */
function search_admin_settings($form, &$form_state) {
  $config = config('search.settings');


  $form['active'] = array(
    '#type' => 'fieldset',
    '#title' => t('Search items')
  );
  $search_info = search_get_info(TRUE);
  $module_options = array();
  foreach ($search_info as $module => $info) {
    $module_options[$module] = $info['title'];
  }
  $form['active']['search_active_modules'] = array(
    '#title' => t('Available search items'),
    '#type' => 'checkboxes',
    '#default_value' => $config->get('search_active_modules'),
    '#options' => $module_options,
    '#description' => t('Several modules expose items to the search system. Use this setting to limit what can be searched.')
  );
  $form['active']['search_default_module'] = array(
    '#title' => t('Default search'),
    '#type' => 'radios',
    '#default_value' => $config->get('search_default_module'),
    '#options' => $module_options,
    '#description' => t('Only one type of item will be searched by default. This selection will determine what appears at http://www.example.com/search.')
  );
  $form['#validate'][] = 'search_admin_settings_validate';
  $form['#submit'][] = 'search_admin_settings_submit';

  // Per module settings
  foreach ($config->get('search_active_modules') as $module) {
    $added_form = module_invoke($module, 'search_admin');
    if (is_array($added_form)) {
      $form = array_merge($form, $added_form);
    }
  }
  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration')
  );

  // Indexing settings:
  $form['indexing'] = array(
    '#type' => 'fieldset',
    '#title' => t('Indexing'),
    '#description' => t('<p><em>The search index is not cleared immediately when invalidated, instead it will be systematically updated during cron runs. Searching will continue to work but new content won\'t be indexed until all existing content has been re-indexed.</em></p>'),
  );


  // Collect some stats
  $remaining = 0;
  $total = 0;
  foreach ($config->get('search_active_modules') as $module) {
    if ($status = module_invoke($module, 'search_status')) {
      $remaining += $status['remaining'];
      $total += $status['total'];
    }
  }

  $count = format_plural($remaining, 'There is 1 item left to index.', 'There are @count items left to index.');
  $percentage = ((int)min(100, 100 * ($total - $remaining) / max(1, $total))) . '%';
  $status = '<p><strong>' . t('%percentage of the site has been indexed.', array('%percentage' => $percentage)) . ' ' . $count . '</strong></p>';

  $form['indexing']['status'] = array('#markup' => $status);
  $form['indexing']['wipe'] = array(
    '#type' => 'submit',
    '#value' => t('Invalidate search index'),
    '#submit' => array('search_admin_reindex_submit'),
    '#attributes' => array('class' => array('button-danger')),
  );

  $items = backdrop_map_assoc(array(10, 20, 50, 100, 200, 500));
  $form['indexing']['search_cron_limit'] = array(
    '#type' => 'select',
    '#title' => t('Number of items to index during cron runs:'),
    '#default_value' => $config->get('search_cron_limit'),
    '#options' => $items,
    '#description' => t('The maximum number of items indexed in each pass of a <a href="@cron">cron maintenance task</a>. If necessary, reduce this number to prevent timeouts and memory errors while indexing.', array('@cron' => url('admin/reports/status')))
  );

  $form['indexing']['search_minimum_word_size'] = array(
    '#type' => 'number',
    '#title' => t('Minimum word length to index'),
    '#default_value' => $config->get('search_minimum_word_size'),
    '#min' => 1,
    '#max' => 10000,
    '#description' => t('The number of characters a word has to be to be indexed. A lower setting means better search result ranking, but also a larger database. Each search query must contain at least one keyword that is this size (or longer). <strong>Changing this setting will invalidate the search index.</strong>'),
  );
  $form['indexing']['transliteration'] = array(
    '#type' => 'checkbox',
    '#title' => t('Transliterate search index and searched strings.'),
    '#description' => t('Enable to allow searching and indexing using US-ASCII character set, i.e. to treat accented and unaccented letters the same.'),
    '#default_value' => $config->get('transliteration'),
  );
  $form['indexing']['search_overlap_cjk'] = array(
    '#type' => 'checkbox',
    '#title' => t('Simple CJK handling'),
    '#default_value' => $config->get('search_overlap_cjk'),
    '#description' => t('Whether to apply a simple Chinese/Japanese/Korean tokenizer based on overlapping sequences. Turn this off if you want to use an external preprocessor for this instead. Does not affect other languages. <strong>Changing this setting will invalidate the search index.</strong>')
  );

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration')
  );

  return $form;
}

/**
 * Form validation handler for search_admin_settings().
 */
function search_admin_settings_validate($form, &$form_state) {
  // Check whether we selected a valid default.
  if ($form_state['triggering_element']['#value'] != t('Reset to defaults')) {
    $new_modules = array_filter($form_state['values']['search_active_modules']);
    $default = $form_state['values']['search_default_module'];
    if (!in_array($default, $new_modules, TRUE)) {
      form_set_error('search_default_module', t('Your default search module is not selected as an active module.'));
    }
  }
}

/**
 * Form submission handler for search_admin_settings().
 */
function search_admin_settings_submit($form, &$form_state) {
  $config = config('search.settings');
  // If these settings change, the index needs to be rebuilt.
  if (($config->get('search_minimum_word_size') != $form_state['values']['search_minimum_word_size']) || ($config->get('search_overlap_cjk') != $form_state['values']['search_overlap_cjk'])) {
    $config->set('search_minimum_word_size', $form_state['values']['search_minimum_word_size']);
    $config->set('search_overlap_cjk', $form_state['values']['search_overlap_cjk']);
    backdrop_set_message(t('The index will be rebuilt.'));
    search_reindex();
  }
  $config->set('search_cron_limit', $form_state['values']['search_cron_limit']);
  $config->set('search_default_module', $form_state['values']['search_default_module']);
  // Check whether we are resetting the values.
  if ($form_state['triggering_element']['#value'] == t('Reset to defaults')) {
    $new_modules = array('node', 'user');
  }
  else {
    $new_modules = array_filter($form_state['values']['search_active_modules']);
  }
  if ($config->get('search_active_modules') != $new_modules) {
    $config->set('search_active_modules', $new_modules);
    backdrop_set_message(t('The active search modules have been changed.'));
    state_set('menu_rebuild_needed', TRUE);
  }

  // Save all other settings provided by any other modules.
  form_state_values_clean($form_state);
  foreach ($form_state['values'] as $key => $value) {
    if (strpos($key, 'search_') !== 0) {
      $config->set($key, $value);
    }
  }

  $config->save();
}

/**
 * Form submission handler for reindex button on search_admin_settings_form().
 */
function search_admin_reindex_submit($form, &$form_state) {
  // send the user to the confirmation page
  $form_state['redirect'] = 'admin/config/search/settings/reindex';
}
