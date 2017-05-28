<?php
/**
 * @file
 * Administrative page callbacks for the Redirect module.
 */

/**
 * Form callback; Display the list of all redirects.
 */
function redirect_list_form($form, &$form_state) {
  $form['#operations'] = redirect_get_redirect_operations();
  if (isset($form_state['values']['operation']) && empty($form_state['values']['confirm'])) {
    return redirect_list_form_operations_confirm_form($form, $form_state, $form_state['values']['operation'], array_filter($form_state['values']['rids']));
  }

  $destination = backdrop_get_destination();

  // Set up the header.
  $header = array(
    'source' => array('data' => t('From'), 'field' => 'source', 'sort' => 'asc'),
    'redirect' => array('data' => t('To'), 'field' => 'redirect', 'class' => array('priority-medium')),
    'status_code' => array('data' => t('Type'), 'field' => 'status_code', 'class' => array('priority-low')),
    'language' => array('data' => t('Language'), 'field' => 'langcode'),
    'count' => array('data' => t('Count'), 'field' => 'count', 'class' => array('priority-low')),
    'access' => array('data' => t('Last accessed'), 'field' => 'access', 'class' => array('priority-low')),
    'operations' => array('data' => t('Operations')),
  );

  // Do not include the language column if locale is disabled.
  if (!module_exists('locale')) {
    unset($header['language']);
  }

  // Get filter keys and add the filter form.
  $keys = func_get_args();
  $keys = array_splice($keys, 2); // Offset the $form and $form_state parameters.
  $keys = implode('/', $keys);
  $form['redirect_list_filter_form'] = redirect_list_filter_form($keys);

  // Build the 'Update options' form.
  $form['operations'] = array(
    '#type' => 'fieldset',
    '#title' => t('Update options'),
    '#prefix' => '<div class="container-inline">',
    '#suffix' => '</div>',
    '#attributes' => array(
      'class' => array('redirect-list-operations'),
    ),
  );
  $operations = array();
  foreach ($form['#operations'] as $key => $operation) {
    $operations[$key] = $operation['action'];
  }
  $form['operations']['operation'] = array(
    '#type' => 'select',
    '#options' => $operations,
    '#default_value' => 'delete',
  );
  $form['operations']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Update'),
    '#validate' => array('redirect_list_form_operations_validate'),
    '#submit' => array('redirect_list_form_operations_submit'),
  );

  // Building the SQL query and load the redirects.
  $query = db_select('redirect', 'r')->extend('TableSort')->extend('PagerDefault');
  $query->addField('r', 'rid');
  $query->condition('r.type', 'redirect');
  $query->orderByHeader($header);
  $query->limit(50);
  $query->addTag('redirect_list');
  $query->addTag('redirect_access');
  redirect_build_filter_query($query, array('source', 'redirect'), $keys);
  $rids = $query->execute()->fetchCol();
  $redirects = redirect_load_multiple($rids);

  $rows = array();
  foreach ($redirects as $rid => $redirect) {
    $row = array();
    $redirect->source_options = array_merge($redirect->source_options, array('alias' => TRUE));
    $source_url = redirect_url($redirect->source, $redirect->source_options);
    $redirect_url = redirect_url($redirect->redirect, array_merge($redirect->redirect_options, array('alias' => TRUE)));
    backdrop_alter('redirect_url', $redirect->source, $redirect->source_options);
    backdrop_alter('redirect_url', $redirect->redirect, $redirect->redirect_options);
    $row['source'] = l($source_url, $redirect->source, $redirect->source_options);
    $row['redirect'] = l($redirect_url, $redirect->redirect, $redirect->redirect_options);
    $row['status_code'] = $redirect->status_code;
    $row['language'] = language_name($redirect->langcode);
    $row['count'] = $redirect->count;
    if ($redirect->access) {
      $row['access'] = array(
        'data' => t('!interval ago', array('!interval' => format_interval(REQUEST_TIME - $redirect->access))),
        'title' => t('Last accessed on @date', array('@date' => format_date($redirect->access))),
      );
    }
    else {
      $row['access'] = t('Never');
    }

    // Mark redirects that override existing paths with a warning in the table.
    if (backdrop_valid_path($redirect->source)) {
      $row['#attributes']['class'][] = 'warning';
      $row['#attributes']['title'] = t('This redirect overrides an existing internal path.');
    }

    $operations = array();
    if (redirect_access('update', $redirect)) {
      $operations['edit'] = array(
        'title' => t('Edit'),
        'href' => 'admin/config/urls/redirect/edit/' . $rid,
        'query' => $destination,
      );
    }
    if (redirect_access('delete', $redirect)) {
      $operations['delete'] = array(
        'title' => t('Delete'),
        'href' => 'admin/config/urls/redirect/delete/' . $rid,
        'query' => $destination,
      );
    }
    $row['operations'] = array(
      'data' => array(
        '#type' => 'operations',
        '#links' => $operations,
      ),
    );

    $rows[$rid] = $row;
  }

  $form['rids'] = array(
    '#type' => 'tableselect',
    '#header' => $header,
    '#options' => $rows,
    '#empty' => t('No URL redirects available.'),
    '#attributes' => array(
      'class' => array('redirect-list-tableselect'),
    ),
  );
  if (redirect_access('create', 'redirect')) {
    $form['rids']['#empty'] .= ' ' . l(t('Add URL redirect.'), 'admin/config/urls/redirect/add');
  }
  $form['pager'] = array('#theme' => 'pager');
  return $form;
}

/**
 * Return a partial form to filter URL redirects.
 *
 * @param string $filter_value
 *   The default value for the filter textfield.
 *
 * @return array
 *   The partial form for filtering redirects.
 *
 * @see redirect_list_form().
 * @see redirect_list_filter_form_submit()
 *
 * @ingroup forms
 */
function redirect_list_filter_form($filter_value = '') {
  $form['#attributes'] = array('class' => array('search-form'));
  $form['basic'] = array(
    '#type' => 'fieldset',
    '#title' => t('Filter redirects'),
    '#attributes' => array('class' => array('container-inline')),
  );
  $form['basic']['filter'] = array(
    '#type' => 'textfield',
    '#title' => '',
    '#default_value' => $filter_value,
    '#maxlength' => 128,
    '#size' => 25,
  );
  $form['basic']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Filter'),
    '#submit' => array('redirect_list_filter_form_submit'),
  );
  if ($filter_value) {
    $form['basic']['reset'] = array(
      '#type' => 'submit',
      '#value' => t('Reset'),
      '#submit' => array('redirect_list_filter_form_reset'),
    );
  }
  return $form;
}

/**
 * Process filter form submission when the Filter button is pressed.
 */
function redirect_list_filter_form_submit($form, &$form_state) {
  $form_state['redirect'] = 'admin/config/urls/redirect/list/' . trim($form_state['values']['filter']);
}

/**
 * Process filter form submission when the Reset button is pressed.
 */
function redirect_list_filter_form_reset($form, &$form_state) {
  $form_state['redirect'] = 'admin/config/urls/redirect';
}

/**
 * Extends a query object for URL redirect filters.
 *
 * @param QueryAlterableInterface $query
 *   Query object that should be filtered.
 * @param array $fields
 *   The fields within the query that should be checked for the $keys value.
 * @param string $keys
 *   The filter string on which asterisks should be replaced with
 */
function redirect_build_filter_query(SelectQueryInterface $query, array $fields, $keys = '') {
  if ($keys && $fields) {
    // Replace wildcards with PDO wildcards.
    $conditions = db_or();
    $wildcard = '%' . trim(preg_replace('!\*+!', '%', db_like($keys)), '%') . '%';
    foreach ($fields as $field) {
      $conditions->condition($field, $wildcard, 'LIKE');
    }
    $query->condition($conditions);
  }
}

/**
 * Validate redirect_list_form form submissions.
 *
 * Check if any redirects have been selected to perform the chosen
 * 'Update option' on.
 */
function redirect_list_form_operations_validate($form, &$form_state) {
  // Error if there are no redirects selected.
  if (!is_array($form_state['values']['rids']) || !count(array_filter($form_state['values']['rids']))) {
    form_set_error('', t('No redirects selected.'));
  }
}

/**
 * Submit handler for redirect_list_form().
 *
 * Execute the chosen 'Update option' on the selected redirects.
 */
function redirect_list_form_operations_submit($form, &$form_state) {
  $operations = $form['#operations'];
  $operation = $operations[$form_state['values']['operation']];

  // Filter out unchecked redirects
  $rids = array_filter($form_state['values']['rids']);

  if (!empty($operation['confirm']) && empty($form_state['values']['confirm'])) {
    // We need to rebuild the form to go to a second step. For example, to
    // show the confirmation form for the deletion of redirects.
    $form_state['rebuild'] = TRUE;
  }
  else {
    $function = $operation['callback'];

    // Add in callback arguments if present.
    if (isset($operation['callback arguments'])) {
      $args = array_merge(array($rids), $operation['callback arguments']);
    }
    else {
      $args = array($rids);
    }
    call_user_func_array($function, $args);

    $count = count($form_state['values']['rids']);
    watchdog('redirect', '@action @count redirects.', array('@action' => $operation['action_past'], '@count' => $count));
    backdrop_set_message(format_plural(count($rids), '@action @count redirect.', '@action @count redirects.', array('@action' => $operation['action_past'], '@count' => $count)));
  }
}

/**
 * Form callback; Confirm a bulk operation on a list of redirects.
 *
 * @param string $operation
 *   An operation string from hook_redirect_operations().
 * @param int[] $rids
 *   An array of redirect IDs on which the operation will be performed.
 *
 * @see redirect_list_form()
 */
function redirect_list_form_operations_confirm_form($form, &$form_state, $operation, $rids) {
  $operations = $form['#operations'];
  $operation = $operations[$form_state['values']['operation']];

  $form['rids_list'] = array(
    '#theme' => 'item_list',
    '#items' => array(),
  );
  $form['rids'] = array(
    '#type' => 'value',
    '#value' => $rids,
  );

  $redirects = redirect_load_multiple($rids);
  foreach ($redirects as $rid => $redirect) {
    $form['rids_list']['#items'][$rid] = check_plain(redirect_url($redirect->source, $redirect->source_options));
  }

  $form['operation'] = array('#type' => 'hidden', '#value' => $form_state['values']['operation']);
  $form['#submit'][] = 'redirect_list_form_operations_submit';
  $confirm_question = format_plural(count($rids), 'Are you sure you want to @action this redirect?', 'Are you sure you want to @action these redirects?', array('@action' => backdrop_strtolower($operation['action'])));

  // Cancel link returns to the current search if possible.
  $cancel_path = strpos($_GET['q'], 'admin/config/urls/redirect') === 0 ? $_GET['q'] : 'admin/config/urls/redirect';

  return confirm_form(
    $form,
    $confirm_question,
    $cancel_path,
    t('This action cannot be undone.'),
    $operation['action'],
    t('Cancel')
  );
}

/**
 * Page callback; Redirect to the form for creating a redirect.
 */
function redirect_add_redirect_page() {
  backdrop_goto('admin/config/urls/redirect/add');
}

/**
 * Form builder to add or edit an URL redirect.
 *
 * @param Redirect|NULL $redirect
 *   The redirect object to be edited or NULL if creating a new redirect.
 *
 * @see redirect_element_validate_source()
 * @see redirect_element_validate_redirect()
 * @see redirect_edit_form_validate()
 * @see redirect_edit_form_submit()
 *
 * @ingroup forms
 */
function redirect_edit_form($form, &$form_state, $redirect = NULL) {
  if (!isset($redirect)) {
    $redirect = new Redirect(array(
      'source' => isset($_GET['source']) ? urldecode($_GET['source']) : '',
      'source_options' => isset($_GET['source_options']) ? backdrop_get_query_array($_GET['source_options']) : array(),
      'redirect' => isset($_GET['redirect']) ? urldecode($_GET['redirect']) : '',
      'redirect_options' => isset($_GET['redirect_options']) ? backdrop_get_query_array($_GET['redirect_options']) : array(),
      'langcode' => isset($_GET['langcode']) ? urldecode($_GET['langcode']) : LANGUAGE_NONE,
    ));
  }

  $form['rid'] = array(
    '#type' => 'value',
    '#value' => $redirect->rid,
  );
  $form['type'] = array(
    '#type' => 'value',
    '#value' => $redirect->type,
  );
  $form['hash'] = array(
    '#type' => 'value',
    '#value' => $redirect->hash,
  );
  $form['uid'] = array(
    '#type' => 'value',
    '#value' => $redirect->uid,
  );

  $form['source'] = array(
    '#type' => 'textfield',
    '#title' => t('From'),
    '#description' => t('Enter an internal Backdrop path or path alias to redirect (e.g. %example1 or %example2). Fragment anchors (e.g. %anchor) are <strong>not</strong> allowed.', array('%example1' => 'node/123', '%example2' => 'taxonomy/term/123', '%anchor' => '#anchor')),
    '#maxlength' => 560,
    '#default_value' => $redirect->rid || $redirect->source ? redirect_url($redirect->source, $redirect->source_options + array('alter' => FALSE)) : '',
    '#required' => TRUE,
    '#field_prefix' => $GLOBALS['base_url'] . '/' . (config_get('system.core', 'clean_url') ? '' : '?q='),
    '#element_validate' => array('redirect_element_validate_source'),
  );
  $form['source_options'] = array(
    '#type' => 'value',
    '#value' => $redirect->source_options,
    '#tree' => TRUE,
  );
  $form['redirect'] = array(
    '#type' => 'textfield',
    '#title' => t('To'),
    '#maxlength' => 560,
    '#default_value' => $redirect->rid || $redirect->redirect ? redirect_url($redirect->redirect, $redirect->redirect_options, TRUE) : '',
    '#required' => TRUE,
    '#description' => t('Enter an internal Backdrop path, path alias, or complete external URL (like http://example.com/) to which the user will be sent. Use %front to redirect to the front page.', array('%front' => '<front>')),
    '#element_validate' => array('redirect_element_validate_redirect'),
  );
  $form['redirect_options'] = array(
    '#type' => 'value',
    '#value' => $redirect->redirect_options,
    '#tree' => TRUE,
  );

  // This will be a hidden value unless locale module is enabled.
  $form['langcode'] = array(
    '#type' => 'value',
    '#value' => $redirect->langcode,
  );

  $all_statuses = config_get('redirect.settings', 'additional_statuses');
  $options = redirect_status_code_options(NULL, $all_statuses);
  if (!array_key_exists($redirect->status_code, $options)) {
    $options = redirect_status_code_options(NULL, TRUE);
  }
  $form['status_code'] = array(
    '#type' => $all_statuses ? 'select' : 'radios',
    '#title' => t('Redirect type'),
    '#description' => t('<a href="https://wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection">More information about status codes</a>.'),
    '#default_value' => $redirect->status_code,
    '#options' => $options,
  );

  $form['override'] = array(
    '#prefix' => '<div class="messages warning">',
    '#suffix' => '</div>',
    '#access' => FALSE,
    '#weight' => -100,
  );
  $form['override']['confirm'] = array(
    '#type' => 'checkbox',
    '#title' => t('I understand the above warnings and would like to proceed with saving this URL redirect'),
    '#default_value' => FALSE,
    '#parents' => array('override'),
  );

  if (!empty($form_state['storage']['override_messages']) && !count(form_get_errors())) {
    $form['override']['#access'] = TRUE;
    if (count($form_state['storage']['override_messages']) > 1) {
      $message_output = theme('item_list', array('items' => $form_state['storage']['override_messages']));
    }
    else {
      $message_output = implode('', $form_state['storage']['override_messages']);
    }
    $form['override']['messages'] = array(
      '#markup' => $message_output,
      '#weight' => -1,
    );
    // Reset the messages.
    $form_state['storage']['override_messages'] = array();
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save redirect'),
  );
  $form['actions']['delete'] = array(
    '#type' => 'submit',
    '#value' => t('Delete'),
    '#submit' => array('redirect_edit_form_delete_submit'),
    '#limit_validation_errors' => array(array('actions')),
    '#access' => !$redirect->isNew(),
  );
  $form['actions']['cancel'] = array(
    '#type' => 'link',
    '#title' => t('Cancel'),
    '#href' => isset($_GET['destination']) ? $_GET['destination'] : 'admin/config/urls/redirect',
  );

  return $form;
}

/**
 * Element validate handler; validate the source of an URL redirect.
 *
 * @see redirect_edit_form()
 */
function redirect_element_validate_source($element, &$form_state) {
  // Check that the source contains no URL fragment.
  if (strpos($element['#value'], '#') !== FALSE) {
    form_error($element, t('The source path cannot contain an URL fragment anchor.'));
  }

  $parsed_value = _redirect_extract_url_options($element, $form_state);

  // Disallow redirects from the front page.
  if ($parsed_value['path'] === '<front>') {
    form_error($element, t('The source path cannot be the front page.'));
  }

  // Cannot create redirects for valid paths.
  if (empty($form_state['values']['override'])) {
    // Check if this is an alias.
    $alias = path_load(array('alias' => $parsed_value['path']));
    if ($alias) {
      $form_state['storage']['override_messages']['existing-alias'] = t('The source path !path is an existing URL alias. You may prefer to <a href="@url-alias">edit this URL alias</a> rather than using a redirect.', array('!path' => '<em>' . l($parsed_value['path'], $parsed_value['path']) . '</em>', '@url-alias' => url('admin/config/urls/path/edit/' . $alias['pid'])));
      $form_state['rebuild'] = TRUE;
      return $element;
    }
    $path = backdrop_get_normal_path($parsed_value['path'], $form_state['values']['langcode']);
    $menu_item = menu_get_item($path);
    if ($menu_item && $menu_item['page_callback'] != 'redirect_redirect') {
      $form_state['storage']['override_messages']['valid-path'] = t('The source path !path is an existing path. Creating a redirect may make it inaccessible. You may prefer to <a href="@url-alias">create a URL alias</a> for this path rather than a redirect.', array('!path' => '<em>' . l($parsed_value['path'], $parsed_value['path']) . '</em>', '@url-alias' => url('admin/config/urls/path/add')));
      $form_state['rebuild'] = TRUE;
      return $element;
    }
  }

  return $element;
}

/**
 * Element validate handler; validate the redirect of an URL redirect.
 *
 * @see redirect_edit_form()
 */
function redirect_element_validate_redirect($element, &$form_state) {
  $parsed = _redirect_extract_url_options($element, $form_state);
  if (!url_is_external($parsed['url'])) {
    $value = backdrop_get_normal_path($parsed['url'], $form_state['values']['langcode']);
  }
  else {
    $value = $parsed['url'];
  }
  form_set_value($element, $value, $form_state);

  if (!valid_url($value) && !valid_url($value, TRUE) && $value != '<front>' && $value != '' && !file_exists($value)) {
    form_error($element, t('The redirect path %value is not valid.', array('%value' => $value)));
  }

  return $element;
}

/**
 * Extract the query and fragment parts out of an URL field.
 */
function _redirect_extract_url_options(&$element, &$form_state) {
  $value = &$element['#value'];
  $type = $element['#name'];
  $options = &$form_state['values']["{$type}_options"];

  $parsed = redirect_parse_url($value);

  if (isset($parsed['fragment'])) {
    $options['fragment'] = $parsed['fragment'];
  }
  else {
    unset($options['fragment']);
  }

  if (isset($parsed['query'])) {
    $options['query'] = $parsed['query'];
  }
  else {
    unset($options['query']);
  }

  if (isset($parsed['scheme']) && $parsed['scheme'] == 'https') {
    $options['https'] = TRUE;
  }
  else {
    unset($options['https']);
  }

  return $parsed;
}

/**
 * Form validate handler; validate an URL redirect
 *
 * @see redirect_edit_form()
 */
function redirect_edit_form_validate($form, &$form_state) {
  form_state_values_clean($form_state);
  $redirect = new Redirect($form_state['values']);

  if (empty($form_state['values']['override'])) {
    if ($existing = redirect_load_by_source($redirect->source, $redirect->langcode)) {
      if ($redirect->rid != $existing->rid && $redirect->langcode == $existing->langcode) {
        // The "from" path should not conflict with another redirect
        $form_state['storage']['override_messages']['redirect-conflict'] = t('The base source path %source is already being redirected. Do you want to <a href="@edit-page">edit the existing redirect</a>?', array('%source' => $redirect->source, '@edit-page' => url('admin/config/urls/redirect/edit/'. $existing->rid)));
        $form_state['rebuild'] = TRUE;
      }
    }
  }

  redirect_validate($redirect, $form, $form_state);
  $form_state['redirect'] = $redirect;
}

/**
 * Form submit handler; handle the 'Delete' button on redirect_edit_form().
 */
function redirect_edit_form_delete_submit($form, &$form_state) {
  $destination = array();
  if (isset($_GET['destination'])) {
    $destination = backdrop_get_destination();
    unset($_GET['destination']);
  }
  $form_state['redirect'] = array('admin/config/urls/redirect/delete/' . $form_state['redirect']->rid, array('query' => $destination));
}

/**
 * Form submit handler; insert or update an URL redirect.
 *
 * @see redirect_edit_form()
 */
function redirect_edit_form_submit($form, &$form_state) {
  $redirect = $form_state['redirect'];
  redirect_save($redirect);
  backdrop_set_message(t('The redirect has been saved.'));
  $form_state['redirect'] = 'admin/config/urls/redirect';
}

/**
 * Form builder to delete an URL redirect.
 *
 * @param Redirect $redirect
 *   The redirect object to be deleted.
 *
 * @see redirect_delete_form()
 * @see confirm_form()
 *
 * @ingroup forms
 */
function redirect_delete_form($form, &$form_state, Redirect $redirect) {
  $form['rid'] = array(
    '#type' => 'value',
    '#value' => $redirect->rid,
  );

  return confirm_form(
    $form,
    t('Are you sure you want to delete the URL redirect from %source to %redirect?', array('%source' => $redirect->source, '%redirect' => $redirect->redirect)),
    'admin/config/urls/redirect'
  );
}

/**
 * Form submit handler; delete an URL redirect after confirmation.
 *
 * @see redirect_delete_form()
 */
function redirect_delete_form_submit($form, &$form_state) {
  redirect_delete($form_state['values']['rid']);
  backdrop_set_message(t('The redirect has been deleted.'));
  $form_state['redirect'] = 'admin/config/urls/redirect';
}

/**
 * Form builder for redirection settings.
 *
 * @see system_settings_form()
 *
 * @ingroup forms
 */
function redirect_settings_form($form, &$form_state) {
  $config = config('redirect.settings');
  $form['#config'] = 'redirect.settings';
  $form['auto_redirect'] = array(
    '#type' => 'checkbox',
    '#title' => t('Automatically create redirects when URL aliases are changed.'),
    '#default_value' => $config->get('auto_redirect'),
    '#description' => t('This setting is most commonly used when replacing existing URL aliases under the "URL alias upadte action" in the <a href="!url">URL alias settings</a>.', array('!url' => url('admin/config/urls/path/patterns/settings'))),
    '#disabled' => !module_exists('path'),
  );
  $form['passthrough_querystring'] = array(
    '#type' => 'checkbox',
    '#title' => t('Retain query string through redirect.'),
    '#default_value' => $config->get('passthrough_querystring'),
    '#description' => t('For example, given a redirect from %source to %redirect, if a user visits %source_query they would be redirected to %redirect_query. The query strings in the redirection will always take precedence over the current query string.', array('%source' => 'source-path', '%redirect' => 'node?a=apples', '%source_query' => 'source-path?a=alligators&b=bananas', '%redirect_query' => 'node?a=apples&b=bananas')),
  );
  $form['additional_statuses'] = array(
    '#type' => 'radios',
    '#title' => t('Redirect types'),
    '#options' => array(
      '0' => t('Show only common redirect types (301 and 302)'),
      '1' => t('Show all redirect types (300, 301, 302, 303, 304, 305, and 307)'),
    ),
    '#default_value' => $config->get('additional_statuses') ? '1' : '0',
    '#description' => t('<a href="https://wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection">More information about status codes</a>.'),
  );
  $form['purge_inactive'] = array(
    '#type' => 'select',
    '#title' => t('Delete redirects that have not been accessed for'),
    '#default_value' => $config->get('purge_inactive'),
    '#options' => array(0 => t('Never (do not discard)')) + backdrop_map_assoc(array(604800, 1209600, 1814400, 2592000, 5184000, 7776000, 10368000, 15552000, 31536000), 'format_interval'),
    '#description' => t('Only redirects managed by the redirect module itself will be deleted. Redirects managed by other modules will be left alone.'),
  );

  return system_settings_form($form);
}

/**
 * Form callback; Display a list of all recent 404 pages.
 *
 * This callback is only used if the dblog.module is enabled, from which it
 * pulls the list of recent 404 pages.
 */
function redirect_404_list($form = NULL) {
  $destination = backdrop_get_destination();

  // Get filter keys and add the filter form.
  $keys = func_get_args();
  //$keys = array_splice($keys, 2); // Offset the $form and $form_state parameters.
  $keys = implode('/', $keys);
  $build['redirect_list_404_filter_form'] = backdrop_get_form('redirect_list_404_filter_form', $keys);

  $header = array(
    array('data' => t('Page'), 'field' => 'message'),
    array('data' => t('Count'), 'field' => 'count', 'sort' => 'desc'),
    array('data' => t('Last accessed'), 'field' => 'timestamp', 'class' => array('priority-low')),
    array('data' => t('Operations')),
  );

  $count_query = db_select('watchdog', 'w');
  $count_query->addExpression('COUNT(DISTINCT(w.message))');
  $count_query->leftJoin('redirect', 'r', 'w.message = r.source');
  $count_query->condition('w.type', 'page not found');
  $count_query->isNull('r.rid');
  redirect_build_filter_query($count_query, array('w.message'), $keys);

  $query = db_select('watchdog', 'w')->extend('PagerDefault')->extend('TableSort');
  $query->fields('w', array('message'));
  $query->addExpression('COUNT(wid)', 'count');
  $query->addExpression('MAX(timestamp)', 'timestamp');
  $query->leftJoin('redirect', 'r', 'w.message = r.source');
  $query->isNull('r.rid');
  $query->condition('w.type', 'page not found');
  $query->groupBy('w.message');
  $query->orderByHeader($header);
  $query->limit(25);
  redirect_build_filter_query($query, array('w.message'), $keys);
  $query->setCountQuery($count_query);
  $results = $query->execute();

  $rows = array();
  foreach ($results as $result) {
    $row = array();
    $row['source'] = l($result->message, $result->message, array('query' => $destination));
    $row['count'] = $result->count;
    $row['timestamp'] = format_date($result->timestamp, 'short');

    $operations = array();
    if (redirect_access('create', 'redirect')) {
      $operations['add'] = array(
        'title' => t('Add URL redirect'),
        'href' => 'admin/config/urls/redirect/add/',
        'query' => array('source' => $result->message) + $destination,
      );
    }
    $row['operations'] = array(
      'data' => array(
        '#type' => 'operations',
        '#links' => $operations,
      ),
    );

    $rows[] = $row;
  }

  $build['redirect_404_table']  = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    '#empty' => t('No 404 pages without redirects found.'),
  );
  $build['redirect_404_pager'] = array('#theme' => 'pager');
  return $build;
}

/**
 * Return a form to filter URL redirects.
 *
 * @param string $filter_value
 *   The current string by which the list of 404s will be filtered.
 *
 * @see redirect_list_filter_form_submit()
 *
 * @ingroup forms
 */
function redirect_list_404_filter_form($form, &$form_state, $filter_value = '') {
  $form['#attributes'] = array('class' => array('search-form'));
  $form['help'] = array(
    '#type' => 'help',
    '#markup' => t('This page lists all paths that have resulted in 404 errors and do not yet have any redirects assigned to them.'),
  );
  $form['basic'] = array(
    '#type' => 'fieldset',
    '#title' => t('Filter 404s'),
    '#attributes' => array('class' => array('container-inline')),
  );
  $form['basic']['filter'] = array(
    '#type' => 'textfield',
    '#title' => '',
    '#default_value' => $filter_value,
    '#maxlength' => 128,
    '#size' => 25,
  );
  $form['basic']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Filter'),
    '#submit' => array('redirect_list_404_filter_form_submit'),
  );
  if ($filter_value) {
    $form['basic']['reset'] = array(
      '#type' => 'submit',
      '#value' => t('Reset'),
      '#submit' => array('redirect_list_404_filter_form_reset'),
    );
  }
  return $form;
}

/**
 * Process filter form submission when the Filter button is pressed.
 */
function redirect_list_404_filter_form_submit($form, &$form_state) {
  $form_state['redirect'] = 'admin/config/urls/redirect/404/' . trim($form_state['values']['filter']);
}

/**
 * Process filter form submission when the Reset button is pressed.
 */
function redirect_list_404_filter_form_reset($form, &$form_state) {
  $form_state['redirect'] = 'admin/config/urls/redirect/404';
}

/**
 * Display a list of redirects. Used on forms when editing an entity.
 *
 * @param Redirect[] $redirects
 *   An array of Redirect objects.
 * @param $header
 *   The table header columns for the table.
 *
 * @return array
 *   A renderable table element.
 */
function redirect_list_table($redirects, $header) {
  $destination = backdrop_get_destination();
  $config = config('redirect.settings');
  $default_status_code = $config->get('default_status_code');

  // Set up the header.
  $header = array_combine($header, $header);
  $header = array_intersect_key(array(
    'source' => array('data' => t('From'), 'field' => 'source', 'sort' => 'asc'),
    'redirect' => array('data' => t('To'), 'field' => 'redirect'),
    'status_code' => array('data' => t('Type'), 'field' => 'status_code', 'class' => array('priority-low')),
    'language' => array('data' => t('Language'), 'field' => 'langcode'),
    'count' => array('data' => t('Count'), 'field' => 'count', 'class' => array('priority-medium')),
    'access' => array('data' => t('Last accessed'), 'field' => 'access', 'class' => array('priority-low')),
    'operations' => array('data' => t('Operations')),
  ), $header);

  // Do not include the language column if locale is disabled.
  if (!module_exists('locale')) {
    unset($header['language']);
  }

  $rows = array();
  foreach ($redirects as $rid => $redirect) {
    $row = array();
    $redirect->source_options = array_merge($redirect->source_options, array('alias' => TRUE, 'language' => language_load($redirect->langcode)));
    $source_url = redirect_url($redirect->source, $redirect->source_options);
    $redirect_url = redirect_url($redirect->redirect, array_merge($redirect->redirect_options, array('alias' => TRUE)));
    $row['data']['source'] = l($source_url, $redirect->source, $redirect->source_options);
    $row['data']['redirect'] = l($redirect_url, $redirect->redirect, $redirect->redirect_options);
    $row['data']['status_code'] = $redirect->status_code ? $redirect->status_code : t('Default (@default)', array('@default' => $default_status_code));
    $row['data']['language'] = language_name($redirect->langcode);
    $row['data']['count'] = $redirect->count;
    if ($redirect->access) {
      $row['data']['access'] = array(
        'data' => t('!interval ago', array('!interval' => format_interval(REQUEST_TIME - $redirect->access))),
        'title' => t('Last accessed on @date', array('@date' => format_date($redirect->access))),
      );
    }
    else {
      $row['data']['access'] = t('Never');
    }

    // Mark redirects that override existing paths with a warning in the table.
    if (backdrop_valid_path($redirect->source)) {
      $row['class'][] = 'warning';
      $row['title'] = t('This redirect overrides an existing internal path.');
    }

    $operations = array();
    if (redirect_access('update', $redirect)) {
      $operations['edit'] = array(
        'title' => t('Edit'),
        'href' => 'admin/config/urls/redirect/edit/' . $rid,
        'query' => $destination,
      );
    }
    if (redirect_access('delete', $redirect)) {
      $operations['delete'] = array(
        'title' => t('Delete'),
        'href' => 'admin/config/urls/redirect/delete/' . $rid,
        'query' => $destination,
      );
    }
    $row['data']['operations'] = array(
      'data' => array(
        '#type' => 'operations',
        '#links' => $operations,
      ),
    );

    $row['data'] = array_intersect_key($row['data'], $header);
    $rows[$rid] = $row;
  }

  $build['list'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    '#empty' => t('No URL redirects available.'),
    '#attributes' => array('class' => array('redirect-list')),
  );

  return $build;
}
