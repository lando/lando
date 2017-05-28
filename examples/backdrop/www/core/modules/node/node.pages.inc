<?php
/**
 * @file
 * Callbacks for adding, editing, and deleting content and managing revisions.
 *
 * Also includes validation, submission and other helper functions.
 *
 * @see node_menu()
 */

/**
 * Page callback: Presents the node editing form.
 *
 * @see node_menu()
 */
function node_page_edit(Node $node) {
  $type_name = node_type_get_name($node);
  backdrop_set_title(t('<em>Edit @type</em> @title', array('@type' => $type_name, '@title' => $node->title)), PASS_THROUGH);
  return backdrop_get_form($node->type . '_node_form', $node);
}

/**
 * Page callback: Displays add content links for available content types.
 *
 * Redirects to node/add/[type] if only one content type is available.
 *
 * @see node_menu()
 */
function node_add_page() {
  $content = array();
  // Only use node types to which the user has access.
  foreach (node_type_get_types() as $node_type) {
    if (node_access('create', $node_type->type)) {
      $href_url_friendly = str_replace('_', '-', $node_type->type);
      $content[$node_type->type] = array(
        'title' => t($node_type->name),
        'href'=>'node/add/' . $href_url_friendly,
        'localized_options' => array('html' => TRUE),
        'description' => t($node_type->description),
      );
    }
  }
  // If there is more than one content type, sort them by title instead of
  // machine name before displaying the list of links...
  if (count($content) !== 1) {
    backdrop_sort($content, array('title'));
  }
  // ...otherwise bypass the node/add listing and go directly to the
  // node/add/[type] page of the single content type.
  else {
    $item = array_shift($content);
    backdrop_goto($item['href']);
  }
  return theme('node_add_list', array('content' => $content));
}

/**
 * Page callback: Provides the node submission form.
 *
 * @param $type
 *   The node type for the submitted node.
 *
 * @return
 *   Returns a node submission form.
 *
 * @see node_menu()
 */
function node_add($type) {
  global $user;

  $types = node_type_get_types();
  $node = entity_create('node', array(
    'uid' => $user->uid,
    'name' => (isset($user->name) ? $user->name : ''),
    'type' => $type,
    'langcode' => LANGUAGE_NONE,
  ));
  backdrop_set_title(t('Create @name', array('@name' => t($types[$type]->name))), PASS_THROUGH);
  $output = backdrop_get_form($type . '_node_form', $node);

  return $output;
}

/**
 * Form validation handler for node_form().
 *
 * @see node_form_delete_submit()
 * @see node_form_submit()
 * @see node_form_submit_build_node()
 */
function node_form_validate($form, &$form_state) {
  // $form_state['node'] contains the actual entity being edited, but we must
  // not update it with form values that have not yet been validated, so we
  // create a pseudo-entity to use during validation.
  $node = clone $form_state['node'];
  foreach ($form_state['values'] as $key => $value) {
    $node->{$key} = $value;
  }
  node_validate($node, $form, $form_state);
  entity_form_field_validate('node', $form, $form_state);
}

/**
 * Form constructor for the node add/edit form.
 *
 * @see node_form_delete_submit()
 * @see node_form_validate()
 * @see node_form_submit()
 * @see node_form_submit_build_node()
 *
 * @ingroup forms
 */
function node_form($form, &$form_state, Node $node) {
  $config = config('system.core');

  // During initial form build, add the node entity to the form state for use
  // during form building and processing. During a rebuild, use what is in the
  // form state.
  if (!isset($form_state['node'])) {
    node_object_prepare($node);
    $form_state['node'] = $node;
  }
  else {
    $node = $form_state['node'];
  }
  $node_type = node_type_get_type($node->type);

  // Override the default CSS class name, since the user-defined node type name
  // in 'TYPE-node-form' potentially clashes with third-party class names.
  $form['#attributes']['class'][0] = backdrop_html_class('node-' . $node->type . '-form');

  $form['help'] = array(
    '#type' => 'help',
    '#markup' => filter_xss_admin($node_type->help),
    '#access' => !empty($node_type->help),
    '#weight' => -500,
  );

  // Basic node information.
  // These elements are just values so they are not even sent to the client.
  foreach (array('nid', 'vid', 'uid', 'created', 'type') as $key) {
    $form[$key] = array(
      '#type' => 'value',
      '#value' => isset($node->$key) ? $node->$key : NULL,
    );
  }

  // Changed must be sent to the client, for later overwrite error checking.
  $form['changed'] = array(
    '#type' => 'hidden',
    '#default_value' => isset($node->changed) ? $node->changed : NULL,
  );
  // Invoke hook_form() to get the node-specific bits. Can't use node_invoke(),
  // because hook_form() needs to be able to receive $form_state by reference.
  // @todo hook_form() implementations are unable to add #validate or #submit
  //   handlers to the form buttons below. Remove hook_form() entirely.
  $function = node_type_get_base($node) . '_form';
  if (function_exists($function) && ($extra = $function($node, $form_state))) {
    $form = array_merge_recursive($form, $extra);
  }
  // If the node type has a title, and the node type form defined no special
  // weight for it, we default to a weight of -5 for consistency.
  if (isset($form['title']) && !isset($form['title']['#weight'])) {
    $form['title']['#weight'] = -5;
  }
  $form['#node'] = $node;

  if ($node_type->settings['language'] && module_exists('language')) {
    $languages = language_list(TRUE);
    $language_options = array();
    foreach ($languages as $langcode => $language) {
      $language_options[$langcode] = $language->name;
    }
    $form['langcode'] = array(
      '#type' => 'select',
      '#title' => t('Language'),
      '#default_value' => (isset($node->langcode) ? $node->langcode : ''),
      '#options' => $language_options,
      '#empty_value' => LANGUAGE_NONE,
    );
  }
  else {
    $form['langcode'] = array(
      '#type' => 'value',
      // New nodes without multilingual support have undefined language, old
      // nodes keep their language if language.module is not available.
      '#value' => !isset($form['#node']->nid) ? LANGUAGE_NONE : $node->langcode,
    );
  }

  $form['additional_settings'] = array(
    '#type' => 'vertical_tabs',
    '#weight' => 99,
  );

  // Add a log field if the "Create new revision" option is checked, or if the
  // current user has the ability to check that option.
  $form['revision_information'] = array(
    '#type' => 'fieldset',
    '#title' => t('Revision information'),
    '#collapsible' => TRUE,
    // Collapsed by default when "Create new revision" is unchecked
    '#collapsed' => !$node->revision,
    '#group' => 'additional_settings',
    '#attributes' => array(
      'class' => array('node-form-revision-information'),
    ),
    '#attached' => array(
      'js' => array(backdrop_get_path('module', 'node') . '/js/node.js'),
    ),
    '#weight' => 20,
    '#access' => $node->nid && $node_type->settings['revision_enabled'] && ($node->revision || user_access('administer nodes')),
  );
  $form['revision_information']['revision'] = array(
    '#type' => 'checkbox',
    '#title' => t('Create new revision'),
    '#default_value' => $node->revision,
    '#access' => user_access('administer nodes'),
  );
  // Check the revision log checkbox when the log textarea is filled in.
  // This must not happen if "Create new revision" is enabled by default, since
  // the state would auto-disable the checkbox otherwise.
  if (!$node->revision) {
    $form['revision_information']['revision']['#states'] = array(
      'checked' => array(
        'textarea[name="log"]' => array('empty' => FALSE),
      ),
    );
  }
  $form['revision_information']['log'] = array(
    '#type' => 'textarea',
    '#title' => t('Revision log message'),
    '#rows' => 4,
    '#default_value' => !empty($node->log) ? $node->log : '',
    '#description' => t('Briefly describe the changes you have made.'),
  );

  // Node author information for administrators
  $form['author'] = array(
    '#type' => 'fieldset',
    '#access' => user_access('administer nodes'),
    '#title' => t('Authoring information'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#group' => 'additional_settings',
    '#attributes' => array(
      'class' => array('node-form-author'),
    ),
    '#attached' => array(
      'js' => array(
        backdrop_get_path('module', 'node') . '/js/node.js',
        array(
          'type' => 'setting',
          'data' => array('anonymous' => $config->get('anonymous')),
        ),
      ),
    ),
    '#weight' => -5,
  );
  $form['author']['name'] = array(
    '#type' => 'textfield',
    '#title' => t('Authored by'),
    '#maxlength' => 60,
    '#autocomplete_path' => 'user/autocomplete',
    '#default_value' => !empty($node->name) ? $node->name : '',
    '#weight' => -1,
    '#description' => t('Leave blank for %anonymous.', array('%anonymous' => $config->get('anonymous'))),
  );
  $form['author']['date'] = array(
    '#type' => 'textfield',
    '#title' => t('Authored on'),
    '#maxlength' => 25,
    '#description' => t('Format: %time. The date format is YYYY-MM-DD and %timezone is the time zone offset from UTC. Leave blank to use the time of form submission.', array('%time' => !empty($node->date) ? date_format(date_create($node->date), 'Y-m-d H:i:s O') : format_date($node->created, 'custom', 'Y-m-d H:i:s O'), '%timezone' => !empty($node->date) ? date_format(date_create($node->date), 'O') : format_date($node->created, 'custom', 'O'))),
    '#default_value' => !empty($node->date) ? $node->date : '',
    '#attached' => array(
      'library' => array(array('system', 'ui.datepicker')),
      'js' => array(array(
        'data' => "jQuery(function ($) {
          $('#edit-date').datepicker();
        });",
        'type' => 'inline',
      ))
    ),
  );

  // Node options for administrators
  $form['options'] = array(
    '#type' => 'fieldset',
    '#access' => user_access('administer nodes'),
    '#title' => t('Publishing options'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#group' => 'additional_settings',
    '#attributes' => array(
      'class' => array('node-form-options'),
    ),
    '#attached' => array(
      'js' => array(backdrop_get_path('module', 'node') . '/js/node.js'),
    ),
    '#weight' => -10,
  );
  $form['options']['status'] = array(
    '#type' => 'checkbox',
    '#title' => t('Published'),
    '#default_value' => $node->status,
  );
  $form['options']['promote'] = array(
    '#type' => 'checkbox',
    '#title' => t('Promoted'),
    '#default_value' => $node->promote,
    '#access' => $node_type->settings['promote_enabled'],
  );
  $form['options']['sticky'] = array(
    '#type' => 'checkbox',
    '#title' => t('Sticky at top of lists'),
    '#default_value' => $node->sticky,
    '#access' => $node_type->settings['sticky_enabled'],
  );

  // Prepare cancel link.
  if (isset($_GET['destination'])) {
    $path = $_GET['destination'];
  }
  elseif (isset($_SERVER['HTTP_REFERER'])) {
    $path = $_SERVER['HTTP_REFERER'];
  }
  elseif (isset($node->nid)) {
    $path = 'node/' . $node->nid;
  }
  else {
    $path = '<front>';
  }
  $options = backdrop_parse_url($path);
  $options['attributes']['class'][] = 'form-cancel';

  // Add the buttons.
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#access' => (!form_get_errors()),
    '#value' => t('Save'),
    '#weight' => 5,
    '#submit' => array('node_form_submit'),
  );
  if (!empty($node->nid) && node_access('delete', $node)) {
    $form['actions']['delete'] = array(
      '#type' => 'submit',
      '#value' => t('Delete'),
      '#weight' => 15,
      '#submit' => array('node_form_delete_submit'),
    );
  }
  $form['actions']['cancel'] = array(
    '#type' => 'link',
    '#title' => t('Cancel'),
    '#href' => $options['path'],
    '#options' => $options,
    '#weight' => 20,
  );
  // This form uses a button-level #submit handler for the form's main submit
  // action. node_form_submit() manually invokes all form-level #submit handlers
  // of the form. Without explicitly setting #submit, Form API would auto-detect
  // node_form_submit() as submit handler, but that is the button-level #submit
  // handler for the 'Save' action. To maintain backwards compatibility, a
  // #submit handler is auto-suggested for custom node type modules.
  $form['#validate'][] = 'node_form_validate';
  if (!isset($form['#submit']) && function_exists($node->type . '_node_form_submit')) {
    $form['#submit'][] = $node->type . '_node_form_submit';
  }
  $form += array('#submit' => array());

  field_attach_form('node', $node, $form, $form_state, $node->langcode);
  return $form;
}

/**
 * Form submission handler for the 'Delete' button for node_form().
 *
 * @see node_form_validate()
 * @see node_form_submit()
 * @see node_form_submit_build_node()
 */
function node_form_delete_submit($form, &$form_state) {
  $destination = array();
  if (isset($_GET['destination'])) {
    $destination = backdrop_get_destination();
    unset($_GET['destination']);
  }
  $node = $form['#node'];
  $form_state['redirect'] = array('node/' . $node->nid . '/delete', array('query' => $destination));
}

/**
 * Form submission handler that saves the node for node_form().
 *
 * @see node_form_delete_submit()
 * @see node_form_validate()
 * @see node_form_submit_build_node()
 */
function node_form_submit($form, &$form_state) {
  $node = node_form_submit_build_node($form, $form_state);
  $insert = empty($node->nid);
  $node->save();
  $node_link = l(t('view'), 'node/' . $node->nid);
  $watchdog_args = array('@type' => $node->type, '%title' => $node->title);
  $t_args = array('@type' => node_type_get_name($node), '%title' => $node->title);

  if ($insert) {
    watchdog('content', '@type: added %title.', $watchdog_args, WATCHDOG_NOTICE, $node_link);
    backdrop_set_message(t('@type %title has been created.', $t_args));
  }
  else {
    watchdog('content', '@type: updated %title.', $watchdog_args, WATCHDOG_NOTICE, $node_link);
    backdrop_set_message(t('@type %title has been updated.', $t_args));
  }
  if ($node->nid) {
    $form_state['values']['nid'] = $node->nid;
    $form_state['nid'] = $node->nid;
    $form_state['redirect'] = node_access('view', $node) ? 'node/' . $node->nid : '<front>';
  }
  else {
    // In the unlikely case something went wrong on save, the node will be
    // rebuilt and node form redisplayed.
    backdrop_set_message(t('The post could not be saved.'), 'error');
    $form_state['rebuild'] = TRUE;
  }
}

/**
 * Updates the form state's node entity by processing this submission's values.
 *
 * This is the default builder function for the node form. It is called during
 * the "Save" submit handler to retrieve the entity to save. This function can
 * also be called by a "Next" button of a wizard to update the form state's
 * entity with the current step's values before proceeding to the next step.
 *
 * @see node_form()
 * @see node_form_delete_submit()
 * @see node_form_validate()
 * @see node_form_submit()
 */
function node_form_submit_build_node($form, &$form_state) {
  // @todo Legacy support for modules that extend the node form with form-level
  //   submit handlers that adjust $form_state['values'] prior to those values
  //   being used to update the entity. Module authors are encouraged to instead
  //   adjust the node directly within a hook_node_submit() implementation. For
  //   Backdrop 2.x, evaluate whether the pattern of triggering form-level
  //   submit handlers during button-level submit processing is worth supporting
  //   properly, and if so, add a Form API function for doing so.
  unset($form_state['submit_handlers']);
  form_execute_handlers('submit', $form, $form_state);

  $node = $form_state['node'];
  entity_form_submit_build_entity('node', $node, $form, $form_state);

  node_submit($node);
  foreach (module_implements('node_submit') as $module) {
    $function = $module . '_node_submit';
    $function($node, $form, $form_state);
  }
  return $node;
}

/**
 * Page callback: Form constructor for node deletion confirmation form.
 *
 * @see node_menu()
 * @see node_delete_confirm_submit()
 */
function node_delete_confirm($form, &$form_state, $node) {
  $form['#node'] = $node;
  // Always provide entity id in the same form key as in the entity edit form.
  $form['nid'] = array('#type' => 'value', '#value' => $node->nid);
  return confirm_form($form,
    t('Are you sure you want to delete %title?', array('%title' => $node->title)),
    'node/' . $node->nid,
    t('This action cannot be undone.'),
    t('Delete'),
    t('Cancel')
  );
}

/**
 * Form submission handler for node_delete_confirm().
 *
 * @see node_delete_confirm()
 */
function node_delete_confirm_submit($form, &$form_state) {
  if ($form_state['values']['confirm']) {
    $node = node_load($form_state['values']['nid']);
    node_delete($form_state['values']['nid']);
    watchdog('content', '@type: deleted %title.', array('@type' => $node->type, '%title' => $node->title));
    backdrop_set_message(t('@type %title has been deleted.', array('@type' => node_type_get_name($node), '%title' => $node->title)));
  }

  $form_state['redirect'] = '<front>';
}

/**
 * Page callback: Generates an overview table of older revisions of a node.
 *
 * @param Node $node
 *   A node object.
 *
 * @return array
 *   An array as expected by backdrop_render().
 *
 * @see node_menu()
 */
function node_revision_overview($node) {
  backdrop_set_title(t('Revisions for %title', array('%title' => $node->title)), PASS_THROUGH);

  $header = array(t('Revision'), t('Operations'));

  $revisions = node_revision_list($node);

  $rows = array();
  $revert_permission = FALSE;
  if ((user_access('revert revisions') || user_access('administer nodes')) && node_access('update', $node)) {
    $revert_permission = TRUE;
  }
  $delete_permission = FALSE;
  if ((user_access('delete revisions') || user_access('administer nodes')) && node_access('delete', $node)) {
    $delete_permission = TRUE;
  }
  foreach ($revisions as $revision) {
    $row = array();
    if ($revision->current_vid > 0) {
      $row[] = array('data' => t('!date by !username', array('!date' => l(format_date($revision->timestamp, 'short'), "node/$node->nid"), '!username' => theme('username', array('account' => $revision))))
                               . (($revision->log != '') ? '<p class="revision-log">' . filter_xss($revision->log) . '</p>' : ''),
                     'class' => array('revision-current'));
      $row[] = array('data' => backdrop_placeholder(t('current revision')), 'class' => array('revision-current'));
    }
    else {
      $row[] = t('!date by !username', array('!date' => l(format_date($revision->timestamp, 'short'), "node/$node->nid/revisions/$revision->vid/view"), '!username' => theme('username', array('account' => $revision))))
               . (($revision->log != '') ? '<p class="revision-log">' . filter_xss($revision->log) . '</p>' : '');
      if ($revert_permission) {
        $links['revert'] = array(
          'title' => t('Revert'),
          'href' => "node/$node->nid/revisions/$revision->vid/revert",
        );
      }
      if ($delete_permission) {
        $links['delete'] = array(
          'title' => t('Delete'),
          'href' => "node/$node->nid/revisions/$revision->vid/delete",
        );
      }
      $row[] = array(
        'data' => array(
          '#type' => 'operations',
          '#links' => $links,
        ),
      );
    }
    $rows[] = $row;
  }

  $build['node_revisions_table'] = array(
    '#theme' => 'table',
    '#rows' => $rows,
    '#header' => $header,
    '#attached' => array (
      'css' => array(backdrop_get_path('module', 'node') . '/css/node.admin.css'),
    ),
  );

  return $build;
}

/**
 * Asks for confirmation of the reversion to prevent against CSRF attacks.
 *
 * @param int $node_revision
 *   The node revision ID.
 *
 * @return array
 *   An array as expected by backdrop_render().
 *
 * @see node_menu()
 * @see node_revision_revert_confirm_submit()
 *
 * @ingroup forms
 */
function node_revision_revert_confirm($form, $form_state, $node_revision) {
  $form['#node_revision'] = $node_revision;
  return confirm_form($form, t('Are you sure you want to revert to the revision from %revision-date?', array('%revision-date' => format_date($node_revision->revision_timestamp))), 'node/' . $node_revision->nid . '/revisions', '', t('Revert'), t('Cancel'));
}

/**
 * Form submission handler for node_revision_revert_confirm().
 */
function node_revision_revert_confirm_submit($form, &$form_state) {
  $node_revision = $form['#node_revision'];
  $node_revision->revision = 1;
  // The revision timestamp will be updated when the revision is saved. Keep the
  // original one for the confirmation message.
  $original_revision_timestamp = $node_revision->revision_timestamp;

  $node_revision->log = t('Copy of the revision from %date.', array('%date' => format_date($original_revision_timestamp)));

  $node_revision->save();

  watchdog('content', '@type: reverted %title revision %revision.', array('@type' => $node_revision->type, '%title' => $node_revision->title, '%revision' => $node_revision->vid));
  backdrop_set_message(t('@type %title has been reverted back to the revision from %revision-date.', array('@type' => node_type_get_name($node_revision), '%title' => $node_revision->title, '%revision-date' => format_date($original_revision_timestamp))));
  $form_state['redirect'] = 'node/' . $node_revision->nid . '/revisions';
}

/**
 * Form constructor for the revision deletion confirmation form.
 *
 * This form prevents against CSRF attacks.
 *
 * @param $node_revision
 *   The node revision ID.
 *
 * @return
 *   An array as expected by backdrop_render().
 *
 * @see node_menu()
 * @see node_revision_delete_confirm_submit()
 *
 * @ingroup forms
 */
function node_revision_delete_confirm($form, $form_state, $node_revision) {
  $form['#node_revision'] = $node_revision;
  return confirm_form($form, t('Are you sure you want to delete the revision from %revision-date?', array('%revision-date' => format_date($node_revision->revision_timestamp))), 'node/' . $node_revision->nid . '/revisions', t('This action cannot be undone.'), t('Delete'), t('Cancel'));
}

/**
 * Form submission handler for node_revision_delete_confirm().
 */
function node_revision_delete_confirm_submit($form, &$form_state) {
  $node_revision = $form['#node_revision'];
  node_revision_delete($node_revision->vid);

  watchdog('content', '@type: deleted %title revision %revision.', array('@type' => $node_revision->type, '%title' => $node_revision->title, '%revision' => $node_revision->vid));
  backdrop_set_message(t('Revision from %revision-date of @type %title has been deleted.', array('%revision-date' => format_date($node_revision->revision_timestamp), '@type' => node_type_get_name($node_revision), '%title' => $node_revision->title)));
  $form_state['redirect'] = 'node/' . $node_revision->nid;
  if (db_query('SELECT COUNT(vid) FROM {node_revision} WHERE nid = :nid', array(':nid' => $node_revision->nid))->fetchField() > 1) {
    $form_state['redirect'] .= '/revisions';
  }
}

/**
 * Autocomplete callback for nodes by title.
 *
 * Searches for a node by title, but then identifies it by nid, so the actual
 * returned value can be used later by the form.
 *
 * The returned $matches array has
 * - key: The title, with the identifying nid in brackets, like "Some node
 *   title [3325]"
 * - value: the title which will is displayed in the autocomplete pulldown.
 *
 * Note that we must use a key style that can be parsed successfully and
 * unambiguously. For example, if we might have node titles that could have
 * [3325] in them, then we'd have to use a more restrictive token.
 *
 * @param string $string
 *   The string that will be searched.
 */
function node_autocomplete($string = '') {
  $matches = array();
  if ($string) {
    if (is_numeric($string)) {
      $result = db_select('node')
        ->fields('node', array('nid', 'title'))
        ->condition('nid', $string)
        ->addTag('node_access')
        ->execute();
      foreach ($result as $node) {
        $matches[$node->title . " [$node->nid]"] = check_plain($node->title) . ' [' .$node->nid . ']';
      }
    }
    $result = db_select('node')
      ->fields('node', array('nid', 'title'))
      ->condition('title', db_like($string) . '%', 'LIKE')
      ->addTag('node_access')
      ->range(0, 10)
      ->execute();
    foreach ($result as $node) {
      $matches[$node->title . " [$node->nid]"] = check_plain($node->title) . ' [' .$node->nid . ']';
    }
  }

  backdrop_json_output($matches);
}

/**
 * Node title validation handler.
 *
 * Validate handler to convert our string like "Some node title [3325]" into a
 * nid.
 *
 * In case the user did not actually use the autocomplete or have a valid string
 * there, we'll try to look up a result anyway giving it our best guess.
 *
 * Since the user chose a unique node, we must now use the same one in our
 * submit handler, which means we need to look in the string for the nid.
 *
 * @param $string
 *   The string to validate.
 * @return $nid
 *   A node ID if matched, or NULL if no match.
 *
 * @see node_autocomplete()
 */
function node_autocomplete_validate($string) {
  $matches = array();
  $nid = 0;

  // This preg_match() looks for the last pattern like [33334] and if found
  // extracts the numeric portion.
  $result = preg_match('/\[([0-9]+)\]$/', $string, $matches);
  if ($result > 0) {
    // If $result is nonzero, we found a match and can use it as the index into
    // $matches.
    $nid = $matches[$result];
    // Verify that it's a valid nid.
    $node = node_load($nid);
    if (empty($node)) {
      return NULL;
    }
  }
  // If the input was numeric, check that it matches a node.
  elseif (is_numeric($string) && node_load($string)) {
    $nid = (int) $string;
  }
  // Check that the user may have directly entered a node title.
  else {
    $nid = db_select('node')
      ->fields('node', array('nid'))
      ->condition('title', db_like($string) . '%', 'LIKE')
      ->addTag('node_access')
      ->range(0, 1)
      ->execute()
      ->fetchField();
  }

  return (!empty($nid)) ? $nid : NULL;
}
