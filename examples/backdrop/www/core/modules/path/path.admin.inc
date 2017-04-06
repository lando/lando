<?php
/**
 * @file
 * Administrative page callbacks for the path module.
 */

/**
 * Returns a listing of all defined URL aliases.
 *
 * When filter key passed, perform a standard search on the given key,
 * and return the list of matching URL aliases.
 */
function path_admin_overview($keys = NULL) {
  // Add the filter form above the overview table.
  $build['path_admin_filter_form'] = backdrop_get_form('path_admin_filter_form', $keys);
  // Enable language column if language.module is enabled or if we have any
  // alias with a language.
  $alias_exists = (bool) db_query_range('SELECT 1 FROM {url_alias} WHERE langcode <> :langcode', 0, 1, array(':langcode' => LANGUAGE_NONE))->fetchField();
  $multilanguage = (module_exists('language') || $alias_exists);

  $header = array();
  $header[] = array('data' => t('URL alias'), 'field' => 'alias', 'sort' => 'asc');
  $header[] = array('data' => t('System path'), 'field' => 'source');
  if ($multilanguage) {
    $header[] = array('data' => t('Language'), 'field' => 'langcode');
  }
  $header[] = t('Operations');

  $query = db_select('url_alias')->extend('PagerDefault')->extend('TableSort');
  if ($keys) {
    // Replace wildcards with PDO wildcards.
    $query->condition('alias', '%' . preg_replace('!\*+!', '%', $keys) . '%', 'LIKE');
  }
  $result = $query
    ->fields('url_alias')
    ->orderByHeader($header)
    ->limit(50)
    ->execute();

  $rows = array();
  $destination = backdrop_get_destination();
  foreach ($result as $data) {
    $row = array();
    $row['data']['alias'] = l($data->alias, $data->source);
    $row['data']['source'] = l($data->source, $data->source, array('alias' => TRUE));
    if ($multilanguage) {
      $row['data']['language_name'] = language_name($data->langcode);
    }

    $operations = array();
    $operations['edit'] = array(
      'title' => t('Edit'),
      'href' => "admin/config/urls/path/edit/$data->pid",
      'query' => $destination,
    );
    $operations['delete'] = array(
      'title' => t('Delete'),
      'href' => "admin/config/urls/path/delete/$data->pid",
      'query' => $destination,
    );
    $row['data']['operations'] = array(
      'data' => array(
        '#type' => 'operations',
        '#links' => $operations,
      ),
    );

    // If the system path maps to a different URL alias, highlight this table
    // row to let the user know of old aliases.
    if ($data->alias != backdrop_get_path_alias($data->source, $data->langcode)) {
      $row['class'] = array('warning');
    }

    $rows[] = $row;
  }

  $build['path_table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    '#empty' => t('No URL aliases available. <a href="@link">Add URL alias</a>.', array('@link' => url('admin/config/urls/path/add'))),
  );
  $build['path_pager'] = array('#theme' => 'pager');

  return $build;
}

/**
 * Page callback: Returns a form creating or editing an alias.
 *
 * @param $path
 *   An array containing the path ID, source, alias, and language code.
 *
 * @return
 *   A form for adding or editing a URL alias.
 *
 * @see path_menu()
 */
function path_admin_edit($path = array()) {
  if ($path) {
    backdrop_set_title($path['alias']);
    $output = backdrop_get_form('path_admin_form', $path);
  }
  else {
    $output = backdrop_get_form('path_admin_form');
  }

  return $output;
}

/**
 * Form builder; Main URL alias pattern administration form.
 *
 * @param $path
 *   An array containing the path ID, source, alias, and language code.
 *
 * @ingroup forms
 * @see path_admin_form_validate()
 * @see path_admin_form_submit()
 * @see path_admin_form_delete_submit()
 */
function path_admin_form($form, &$form_state, $path = array('source' => '', 'alias' => '', 'langcode' => LANGUAGE_NONE, 'pid' => NULL)) {
  $form['source'] = array(
    '#type' => 'textfield',
    '#title' => t('Existing system path'),
    '#default_value' => $path['source'],
    '#maxlength' => 255,
    '#size' => 45,
    '#description' => t('Specify the existing path you wish to alias. For example: node/28 or taxonomy/term/1.'),
    '#field_prefix' => url(NULL, array('absolute' => TRUE)) . (config_get('system.core', 'clean_url') ? '' : '?q='),
    '#required' => TRUE,
  );
  $form['alias'] = array(
    '#type' => 'textfield',
    '#title' => t('URL alias'),
    '#default_value' => $path['alias'],
    '#maxlength' => 255,
    '#size' => 45,
    '#description' => t('Specify an alternative path where this page will appear. Do not include a trailing slash.'),
    '#field_prefix' => url(NULL, array('absolute' => TRUE)) . (config_get('system.core', 'clean_url') ? '' : '?q='),
    '#required' => TRUE,
  );

  // A hidden value unless language.module is enabled.
  if (module_exists('language')) {
    $languages = language_list(TRUE);
    foreach ($languages as $langcode => $language) {
      $language_options[$langcode] = $language->name;
    }

    $form['langcode'] = array(
      '#type' => 'select',
      '#title' => t('Language'),
      '#options' => $language_options,
      '#empty_value' => LANGUAGE_NONE,
      '#empty_option' => t('- None -'),
      '#default_value' => $path['langcode'],
      '#weight' => -10,
      '#description' => t('A path alias set for a specific language will always be used when displaying this page in that language, and takes precedence over path aliases set as <em>- None -</em>.'),
    );
  }
  else {
    $form['langcode'] = array(
      '#type' => 'value',
      '#value' => $path['langcode']
    );
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save URL alias'),
  );
  if ($path['pid']) {
    $form['pid'] = array(
      '#type' => 'hidden',
      '#value' => $path['pid'],
    );
    $form['actions']['delete'] = array(
      '#type' => 'submit',
      '#value' => t('Delete'),
      '#submit' => array('path_admin_form_delete_submit'),
      '#limit_validation_errors' => array(array('actions'), array('pid')),
    );
  }
  $form['actions']['cancel'] = array(
    '#type' => 'link',
    '#title' => t('Cancel'),
    '#href' => isset($_GET['destination']) ? $_GET['destination'] : 'admin/config/search/path',
  );

  return $form;
}

/**
 * Form submission handler for the 'Delete' button on path_admin_form().
 *
 * @see path_admin_form_validate()
 * @see path_admin_form_submit()
 */
function path_admin_form_delete_submit($form, &$form_state) {
  $destination = array();
  if (isset($_GET['destination'])) {
    $destination = backdrop_get_destination();
    unset($_GET['destination']);
  }
  $form_state['redirect'] = array('admin/config/urls/path/delete/' . $form_state['values']['pid'], array('query' => $destination));
}

/**
 * Form validation handler for path_admin_form().
 *
 * @see path_admin_form_submit()
 * @see path_admin_form_delete_submit()
 */
function path_admin_form_validate($form, &$form_state) {
  $source = &$form_state['values']['source'];
  $source = backdrop_get_normal_path($source);
  $alias = $form_state['values']['alias'];
  $pid = isset($form_state['values']['pid']) ? $form_state['values']['pid'] : 0;
  // Language is only set if language.module is enabled, otherwise save for all
  // languages.
  $langcode = isset($form_state['values']['langcode']) ? $form_state['values']['langcode'] : LANGUAGE_NONE;

  $has_alias = db_query("SELECT COUNT(alias) FROM {url_alias} WHERE pid <> :pid AND alias = :alias AND langcode = :langcode", array(
      ':pid' => $pid,
      ':alias' => $alias,
      ':langcode' => $langcode,
    ))
    ->fetchField();

  if ($has_alias) {
    form_set_error('alias', t('The alias %alias is already in use in this language.', array('%alias' => $alias)));
  }
  if (!backdrop_valid_path($source)) {
    form_set_error('source', t("The path '@link_path' is either invalid or you do not have access to it.", array('@link_path' => $source)));
  }
}

/**
 * Form submission handler for path_admin_form().
 *
 * @see path_admin_form_validate()
 * @see path_admin_form_delete_submit()
 */
function path_admin_form_submit($form, &$form_state) {
  // Remove unnecessary values.
  form_state_values_clean($form_state);

  path_save($form_state['values']);

  backdrop_set_message(t('The alias has been saved.'));
  $form_state['redirect'] = 'admin/config/urls/path';
}

/**
 * Form constructor for the path deletion form.
 *
 * @param $path
 *   The path alias that will be deleted.
 *
 * @see path_admin_delete_confirm_submit()
 */
function path_admin_delete_confirm($form, &$form_state, $path) {
  if (user_access('administer url aliases')) {
    $form_state['path'] = $path;
    return confirm_form(
      $form,
      t('Are you sure you want to delete path alias %title?',
      array('%title' => $path['alias'])),
      'admin/config/urls/path'
    );
  }
  return array();
}

/**
 * Form submission handler for path_admin_delete_confirm().
 */
function path_admin_delete_confirm_submit($form, &$form_state) {
  if ($form_state['values']['confirm']) {
    path_delete($form_state['path']['pid']);
    $form_state['redirect'] = 'admin/config/urls/path';
  }
}

/**
 * Form constructor for the path admin overview filter form.
 *
 * @ingroup forms
 * @see path_admin_filter_form_submit_filter()
 * @see path_admin_filter_form_submit_reset()
 */
function path_admin_filter_form($form, &$form_state, $keys = '') {
  $form['#attributes'] = array('class' => array('search-form'));
  $form['basic'] = array('#type' => 'fieldset',
    '#title' => t('Filter aliases'),
    '#attributes' => array('class' => array('container-inline')),
  );
  $form['basic']['filter'] = array(
    '#type' => 'search',
    '#title' => 'URL alias',
    '#title_display' => 'invisible',
    '#default_value' => $keys,
    '#maxlength' => 128,
    '#size' => 25,
  );
  $form['basic']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Filter'),
    '#submit' => array('path_admin_filter_form_submit_filter'),
    );
  if ($keys) {
    $form['basic']['reset'] = array(
      '#type' => 'submit',
      '#value' => t('Reset'),
      '#submit' => array('path_admin_filter_form_submit_reset'),
    );
  }
  return $form;
}

/**
 * Form submission handler for the path_admin_filter_form() Filter button.
 *
 * @see path_admin_filter_form_submit_reset()
 */
function path_admin_filter_form_submit_filter($form, &$form_state) {
  $form_state['redirect'] = 'admin/config/urls/path/list/' . trim($form_state['values']['filter']);
}

/**
 * Form submission handler for the path_admin_filter_form() Reset button.
 *
 * @see path_admin_filter_form_submit_filter()
 */
function path_admin_filter_form_submit_reset($form, &$form_state) {
  $form_state['redirect'] = 'admin/config/urls/path/list';
}

/**
 * Form builder; Configure the URL alias patterns.
 *
 * @see path_patterns_form_submit()
 * @ingroup forms
 */
function path_patterns_form($form, $form_state) {
  $config = config('path.settings');

  $form['help'] = array(
    '#markup' => '<p>' . t('URL patterns automatically alias new content based on wildcards called "tokens". For example the URL "node/10" might be automatically aliased to "blog/my-first-post" using the pattern "blog/[node:title]".') . '</p>',
  );

  $all_path_info = path_get_info();
  foreach ($all_path_info as $path_type => $path_info) {
    $pattern_description = $path_info['pattern description'];
    $group_header = t('!label URL alias patterns', array('!label' => $path_info['label']));
    $token_types = array();
    if (isset($path_info['entity type'])) {
      $entity_type = entity_get_info($path_info['entity type']);
      if (isset($entity_type['token type'])) {
        $token_types[] = $entity_type['token type'];
      }
    }

    $form[$path_type] = array(
      '#type' => 'fieldset',
      '#title' => $group_header,
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
    );

    // Prompt for the default URL alias pattern for this path type.
    $variable = $path_type . '_pattern';
    $form[$path_type][$variable] = array(
      '#type' => 'textfield',
      '#title' => $pattern_description,
      '#default_value' => $config->get($variable),
      '#size' => 65,
      '#maxlength' => 1280,
      '#element_validate' => array('token_element_validate'),
      '#after_build' => array('token_element_validate'),
      '#token_types' => $token_types,
      '#min_tokens' => 1,
      '#parents' => array($variable),
    );

    // Set up specialized patterns for this path type (e.g. node types).
    if (isset($path_info['pattern items'])) {
      foreach ($path_info['pattern items'] as $item_name => $item_label) {
        $variable = $path_type . '_' . $item_name . '_pattern';
        $form[$path_type][$variable] = array(
          '#type' => 'textfield',
          '#title' => $item_label,
          '#default_value' => $config->get($variable),
          '#size' => 65,
          '#maxlength' => 1280,
          '#element_validate' => array('token_element_validate'),
          '#after_build' => array('token_element_validate'),
          '#token_types' => $token_types,
          '#min_tokens' => 1,
          '#parents' => array($variable),
        );
      }
    }

    // Display the user documentation of placeholders supported by this path
    // type as a description on the last pattern.
    $variables = array(
      'token_types' => $token_types,
      'text' => t('Browse available tokens for @type.', array('@type' => $path_info['label'])),
    );
    $form[$path_type]['#description'] = '<p>' . t('Each of the fields below support tokens.') . ' ' . theme('token_tree_link', $variables) . '</p>';
  }

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Submit handler for path_patterns_form().
 */
function path_patterns_form_submit($form, &$form_state) {
  $config = config('path.settings');
  $values = $form_state['values'];

  $all_path_info = path_get_info();
  foreach ($all_path_info as $path_type => $path_info) {
    // Save default URL alias pattern per path type.
    $variable = $path_type . '_pattern';
    $config->set($variable, $values[$variable]);

    // Save specialized patterns per path type.
    if (isset($path_info['pattern items'])) {
      foreach ($path_info['pattern items'] as $item_name => $item_label) {
        $variable = $path_type . '_' . $item_name . '_pattern';
        $config->set($variable, $values[$variable]);
      }
    }
  }

  $config->save();
  backdrop_set_message(t('The configuration options have been saved.'));
}

/**
 * Form builder; Configure the URL alias pattern settings.
 *
 * @see path_patterns_settings_form_validate()
 * @see path_patterns_settings_form_submit()
 * @ingroup forms
 */
function path_patterns_settings_form($form) {
  module_load_include('inc', 'path');
  $config = config('path.settings');

  $form['#config'] = 'path.settings';
  
  $form['verbose'] = array(
    '#type' => 'checkbox',
    '#title' => t('Verbose'),
    '#default_value' => $config->get('verbose'),
    '#description' => t('Display URL alias pattern changes (except during bulk updates).'),
  );

  $form['separator'] = array(
    '#type' => 'textfield',
    '#title' => t('Separator'),
    '#size' => 1,
    '#maxlength' => 1,
    '#default_value' => $config->get('separator'),
    '#description' => t('Character used to separate words in titles. This will replace any spaces and punctuation characters. Using a space or + character can cause unexpected results.'),
  );

  $form['case'] = array(
    '#type' => 'radios',
    '#title' => t('Character case'),
    '#default_value' => $config->get('case'),
    '#options' => array(
      PATH_CASE_LEAVE_ASIS => t('Leave case the same as source token values.'),
      PATH_CASE_LOWER => t('Change to lower case'),
    ),
  );

  $max_length = _path_get_schema_alias_maxlength();

  $form['max_length'] = array(
    '#type' => 'number',
    '#title' => t('Maximum URL alias length'),
    '#default_value' => $config->get('max_length'),
    '#step' => 1,
    '#min' => 1,
    '#max' => $max_length,
    '#description' => t('Maximum length of URL aliases to generate. 100 is the recommended length. @max is the maximum possible length.', array('@max' => $max_length)),
  );
  $form['max_component_length'] = array(
    '#type' => 'number',
    '#title' => t('Maximum component length'),
    '#default_value' => $config->get('max_component_length'),
    '#step' => 1,
    '#min' => 1,
    '#max' => $max_length,
    '#description' => t('Maximum text length of any component in the URL alias (e.g., [title]). 100 is the recommended length. @max is the maximum possible length.', array('@max' => $max_length)),
  );

  $description = t('The action taken when an item already has a URL alias.');
  $delete_label = t('Create a new URL alias. Delete the old URL alias.');
  if (module_exists('redirect')) {
    $auto_redirect = config_get('redirect.settings', 'auto_redirect');
    $description .= ' ' . t('The <a href="!url">Redirect module settings</a> affect whether a redirect is created when a URL alias is deleted.', array('!url' => url('admin/config/search/redirect/settings')));
    if ($auto_redirect) {
      $delete_label = t('Create a new URL alias. Replace the old URL alias with a redirect.');
    }
  }
  else {
    $description .= ' ' . t('Considering enabling the Redirect module on the <a href="!url">modules page</a> to create redirects when your aliases change.', array('!url' => url('admin/modules')));
  }
  $form['update_action'] = array(
    '#type' => 'radios',
    '#title' => t('Update action'),
    '#default_value' => $config->get('update_action'),
    '#options' => array(
      PATH_UPDATE_ACTION_DELETE => $delete_label,
      PATH_UPDATE_ACTION_LEAVE => t('Create a new URL alias. Leave the existing URL alias functioning.'),
      PATH_UPDATE_ACTION_NO_NEW => t('Do nothing. Leave the old URL alias intact.'),
    ),
    '#description' => $description,
  );

  $form['transliterate'] = array(
    '#type' => 'checkbox',
    '#title' => t('Transliterate prior to creating URL aliases'),
    '#default_value' => $config->get('transliterate'),
    '#description' => t('When the new URL alias includes certain characters (such as those with accents) should these characters be converted into the US-ASCII alphabet?'),
  );

  $form['reduce_ascii'] = array(
    '#type' => 'checkbox',
    '#title' => t('Reduce URL alias characters to letters and numbers'),
    '#default_value' => $config->get('reduce_ascii'),
    '#description' => t('Filters the new URL alias to only letters and numbers found in the ASCII-96 set.'),
  );

  $form['ignore_words'] = array(
    '#type' => 'textarea',
    '#title' => t('Strings to Remove'),
    '#default_value' => $config->get('ignore_words'),
    '#description' => t('Words to strip out of the URL alias, separated by commas. Do not use this to remove punctuation - use the punctuation section below.'),
    '#wysiwyg' => FALSE,
  );

  $form['punctuation'] = array(
    '#type' => 'fieldset',
    '#title' => t('Punctuation'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );

  $punctuation = path_punctuation_chars();
  foreach ($punctuation as $name => $details) {
    $details['default'] = PATH_PUNCTUATION_REMOVE;
    if ($details['value'] == $config->get('separator')) {
      $details['default'] = PATH_PUNCTUATION_REPLACE;
    }
    $form['punctuation']['punctuation_' . $name] = array(
      '#type' => 'select',
      '#title' => $details['name'] . ' (<code>' . check_plain($details['value']) . '</code>)',
      '#default_value' => ($config->get('punctuation_' . $name)) ? $config->get('punctuation_' . $name): $details['default'],
      '#options' => array(
        PATH_PUNCTUATION_REMOVE => t('Remove'),
        PATH_PUNCTUATION_REPLACE => t('Replace by separator'),
        PATH_PUNCTUATION_DO_NOTHING => t('No action (do not replace)'),
      ),
    );
  }

  return system_settings_form($form);
}

/**
 * Validate handler for path_patterns_settings_form().
 */
function path_patterns_settings_form_validate($form, &$form_state) {
  module_load_include('inc', 'path');

  // Perform a basic check for HTML characters in the strings to remove field.
  if (strip_tags($form_state['values']['ignore_words']) != $form_state['values']['ignore_words']) {
    form_set_error('ignore_words', t('The <em>Strings to remove</em> field must not contain HTML. Make sure to disable any WYSIWYG editors for this field.'));
  }

  // Validate that the separator is not set to be removed per http://drupal.org/node/184119
  // This isn't really all that bad so warn, but still allow them to save the value.
  $separator = $form_state['values']['separator'];
  $punctuation = path_punctuation_chars();
  foreach ($punctuation as $name => $details) {
    if ($details['value'] == $separator) {
      $action = $form_state['values']['punctuation_' . $name];
      if ($action == PATH_PUNCTUATION_REMOVE) {
        backdrop_set_message(t('You have configured the @name to be the separator and to be removed when encountered in strings. This can cause problems with your patterns and especially with the term:path token. You should probably set the action for @name to be "replace by separator".', array('@name' => $details['name'])), 'error');
      }
    }
  }
}

/**
 * Form builder; Bulk path alias update form.
 *
 * @see path_bulk_update_form_submit()
 * @ingroup forms
 */
function path_bulk_update_form($form, &$form_state) {
  // Return a confirm form if submitting aliases to be deleted.
  if (isset($form_state['storage']['delete'])) {
    return path_admin_bulk_delete_confirm($form, $form_state);
  }

  $form['#update_callbacks'] = array();
  $form['#tree'] = TRUE;

  $all_path_info = path_get_info();

  $rows = array();

  foreach ($all_path_info as $type => $path_info) {
    if (!empty($path_info['batch update callback'])) {
      $form['update'][$type]['base'] = array(
        '#type' => 'checkbox',
        '#title' => t('!label URL aliases', array('!label' => $path_info['label'])),
        '#attributes' => array(
          'class' => array('path-base'),
          'data-path-type' => array($type),
          'data-path-name' => array('base'),
        ),
      );
      $form['#update_callbacks'][$type] = $path_info;
      // Check if this entity provides bundle types as pattern items and create
      // a row for each of these bundle types. For the Node entity the pattern
      // items would be keyed by be node types; for taxonomy, these would be
      // vocabularies.
      if (isset($path_info['pattern items'])) {
        foreach ($path_info['pattern items'] as $item => $item_label) {
          $form['update'][$type][$item] = array(
            '#type' => 'checkbox',
            '#title' => t('All !label URL aliases', array('!label' => $item)),
            '#attributes' => array(
              'class' => array('path-type', 'path-' . $type),
              'data-path-type' => array($type),
              'data-path-name' => array($item),
            '#parents' => array('update'),
            ),
          );
        }
      }
    }
  }

  // Build the 'Update options' form.
  $form['operations'] = array(
    '#type' => 'fieldset',
    '#title' => t('Operations'),
    '#prefix' => '<div class="container-inline">',
    '#suffix' => '</div>',
    '#attributes' => array(
      'class' => array('path-bulk-operations'),
    ),
  );
  $form['operations']['operation'] = array(
    '#type' => 'select',
    '#title' => '',
    '#options' => array(
      'generate' => t('Generate URL aliases'),
      'update' => t('Update existing URL aliases'),
      'delete' => t('Delete URL aliases'),
    ),
    '#empty_option' => '- ' . t('Choose an action') . ' -',
  );
  $form['operations']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Execute'),
    '#submit' => array('path_bulk_update_form_rebuild_submit'),
    '#validate' => array('path_bulk_update_form_validate'),
  );

  return $form;
}

/**
 * Returns HTML for the Path bulk update page.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_path_bulk_update_form($variables) {
  backdrop_add_css(backdrop_get_path('module', 'path') . '/css/path.admin.css');
  backdrop_add_js(backdrop_get_path('module', 'path') . '/js/path.admin.js');
  $form = $variables['form'];

  foreach (element_children($form['update']) as $base) {
    foreach (element_children($form['update'][$base]) as $key) {
      $row = array();
        $row[] = array(
          'data' => backdrop_render($form['update'][$base][$key]),
          'class' => array('path-alias-generate'),
        );
      $rows[] = $row;
    }
  }
  $header = array(
    'alias' => array('data' => t('All URL aliases'), 'class' => 'path-alias-generate'),
  );

  $output = '';
  $output .= backdrop_render($form['operations']);
  $output .= theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'path-bulk-alias')));
  $output .= backdrop_render_children($form);
  return $output;
}

/**
 * Form submit handler for path alias bulk update form.
 *
 * @see path_bulk_update_form()
 * @see path_admin_bulk_delete_confirm()
 */
function path_bulk_update_form_rebuild_submit($form, &$form_state) {
  // If aliases are being deleted, rebuild the form to show the confirm form.
  // Otherwise aliases are being generated or updated, call the
  // path_bulk_update_form_generate_submit() form.
  if ($form_state['values']['operations']['operation'] == 'delete') {
    $form_state['storage']['delete'] = TRUE;
    $form_state['rebuild'] = TRUE;
  }
  elseif ($form_state['values']['operations']['operation'] == 'generate') {
    path_bulk_update_form_generate_submit($form, $form_state, 'generate');
  }
  elseif ($form_state['values']['operations']['operation'] == 'update') {
    path_bulk_update_form_generate_submit($form, $form_state, 'update');
  }
}

/**
 * Validate handler for path alias bulk generate form.
 *
 * @see path_bulk_update_form()
 * @see path_bulk_update_form_generate_submit()
 */
function path_bulk_update_form_validate($form, &$form_state) {
  $selected = array();
  $reset_errors = array();
  // At least one update checkbox must be checked.
  if (isset($form_state['values']['update'])) {
    foreach ($form_state['values']['update'] as $entity_type) {
      $values = array_filter($entity_type);
      if (!empty($values)) {
        $selected[] = $values;
      }
    }
    if (!$selected) {
      form_set_error('update', t('You must select an alias to update.'));
    }
  }
}

/**
 * Submit handler for path alias bulk generate form.
 *
 * @see path_bulk_update_form()
 * @see path_bulk_update_form_rebuild_submit()
 */
function path_bulk_update_form_generate_submit($form, &$form_state, $op = 'generate') {
    $batch = array(
    'title' => t('Bulk updating URL aliases'),
    'operations' => array(
      array('path_bulk_update_batch_start', array()),
    ),
    'finished' => 'path_bulk_update_batch_finished',
    'file' => backdrop_get_path('module', 'path') . '/path.admin.inc',
  );

  foreach ($form_state['values']['update'] as $entity_types => $entities) {
    $choices = array();
    $entities = array_filter($entities);
    // Build an array of selected entity/bundle choices.
    foreach ($entities as $label => $choice) {
      $choices[$label] = $label;
    }
    if (!empty($choices)) {
      $path_info = $form['#update_callbacks'][$entity_types];
      $path_info['choices'] = empty($choices['base']) ? $choices : array();
      $path_info['op'] = $op;
      $callback = $path_info['batch update callback'];

      if (!empty($path_info['batch file'])) {
        $batch['operations'][] = array('path_bulk_update_batch_process', array($callback, $path_info));
      }
      else {
        $batch['operations'][] = array($callback, array());
      }
    }
  }

  batch_set($batch);
}

/**
 * Batch callback; count the current number of URL aliases for comparison later.
 */
function path_bulk_update_batch_start(&$context) {
  $context['results']['total']['node'] = 0;
  $context['results']['total']['taxonomy_term'] = 0;
  $context['results']['total']['user'] = 0;
  $context['results']['count_before'] = db_select('url_alias')->countQuery()->execute()->fetchField();
}

/**
 * Common batch processing callback for all operations.
 *
 * Required to load our include the proper batch file.
 */
function path_bulk_update_batch_process($callback, $path_info, &$context) {
  if (!empty($path_info['batch file'])) {
    require_once BACKDROP_ROOT . '/' . $path_info['batch file path'] . '/' . $path_info['batch file'];
    $context['choices'] = array_keys($path_info['choices']);
    $context['op'] = $path_info['op'];
  }
  return $callback($context);
}

/**
 * Batch finished callback.
 */
function path_bulk_update_batch_finished($success, $results, $operations) {
  if ($success) {
    // Count the current number of URL aliases after the batch is completed
    // and compare to the count before the batch started.
    $results['count_after'] = db_select('url_alias')->countQuery()->execute()->fetchField();
    $results['count_changed'] = max($results['count_after'] - $results['count_before'], 0);
    if ($results['count_changed']) {
      backdrop_set_message(format_plural($results['count_changed'], 'Generated 1 URL alias.', 'Generated @count URL aliases.'));
    }
    elseif (isset($results['total'])) {
      backdrop_set_message(format_plural(array_sum($results['total']), 'No new URL aliases generated; 1 alias was updated.', 'No new URL aliases generated; @count aliases were updated.'));
    }
    else {
      backdrop_set_message(t('No new URL aliases to generate.'));
    }
  }
  else {
    $error_operation = reset($operations);
    backdrop_set_message(t('An error occurred while processing @operation with arguments : @args', array('@operation' => $error_operation[0], '@args' => print_r($error_operation[0], TRUE))));
  }
}

/**
 * Confirm form for path alias bulk deletion.
 *
 * @see path_bulk_update_form()
 * @see path_bulk_update_form_rebuild_submit()
 */
function path_admin_bulk_delete_confirm($form, $form_state) {
  $all_path_info = path_get_info();
  $delete_list = array();

  foreach ($form_state['values']['update'] as $key => $value) {
    $value = array_filter($value);
    if ($value) {
      if (isset($value['base'])) {
        $delete_list[] = t('All %type aliases', array('%type' => $all_path_info[$key]['label']));
      }
      else {
        foreach (array_keys($value) as $type) {
          $delete_list[] = $all_path_info[$key]['pattern items'][$type];
        }
      }
    }
  }

  $form['delete'] = array(
    '#type' => 'value',
    '#value' => $form_state['values']['update'],
  );
  $form['delete_list'] = array(
    '#markup' => theme('item_list', array('items' => $delete_list)),
  );

  $form['#submit'][] = 'path_bulk_update_form_bulk_delete_submit';

  $question = t('Delete all the following URL aliases?');
  $path = 'admin/config/search/path/bulk-update';
  $description = t('This action cannot be undone.');
  $yes = t('Delete URL aliases');

  return confirm_form($form, $question, $path, $description, $yes);
}

/**
 * Submit handler for path_admin_bulk_delete().
 */
function path_bulk_update_form_bulk_delete_submit($form, &$form_state) {
  $values = array();
  $count_base = 0;

  // Filter out empty choices and count how many entity types had all subtypes
  // selected.
  foreach ($form_state['values']['delete'] as $key => $value) {
    $value = array_filter($value);
    if ($value) {
      if (isset($value['base'])) {
        $count_base++;
      }
      $values[$key] = $value;
    }
  }

  if ($values) {
    $all_path_info = path_get_info();
    // If all entities are to have all aliases deleted, skip straight to delete.
    if ($count_base === count($all_path_info)) {
      db_delete('url_alias')
        ->execute();
      backdrop_set_message(t('All of your path aliases have been deleted.'));
    }
    else {
      foreach ($values as $key => $value) {
        // For those entities where all aliases need to be deleted, delete using
        // a LIKE query.
        if (isset($value['base'])) {
          if (array_key_exists($key, $all_path_info)) {
            $path_prefix = isset($all_path_info[$key]['source prefix']) ? $all_path_info[$key]['source prefix'] : $key . '/';
            db_delete('url_alias')
              ->condition('source', db_like($path_prefix) . '%', 'LIKE')
              ->execute();
            backdrop_set_message(t('All aliases for %type have been deleted.', array('%type' => $all_path_info[$key]['label'])));
          }
        }
        else {
          // At this point the user want to delete a particular type. We cannot
          // be certain for each entity what the source string will look like
          // so use a callback per entity.
          if (isset($all_path_info[$key]['type delete callback'])) {
            $delete_callback = $all_path_info[$key]['type delete callback'];
            $delete_callback(array_keys($value));

            $delete_list = array();
            foreach (array_keys($value) as $type) {
              $delete_list[] = $all_path_info[$key]['pattern items'][$type];
            }
            backdrop_set_message(t('Aliases have been deleted: !type', array('!type' => theme('item_list', array('items' => $delete_list)))));
          }
        }
      }
    }
  }

  $form_state['redirect'] = 'admin/config/urls/path/bulk-update';
}
