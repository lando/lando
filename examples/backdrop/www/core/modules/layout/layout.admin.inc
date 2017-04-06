<?php
/**
 * @file
 * Administrative functions for Layout module.
 *
 * This provides the UI to list, create, edit and delete layouts.
 */

/**
 * Output a list of pages that are managed.
 */
function layout_list_page() {
  $layouts = layout_load_all();

  // Group layouts by path.
  $path_groups = array();
  foreach ($layouts as $layout) {
    $path_groups[$layout->getPath()][$layout->name] = $layout;
  }

  // Assemble the rows of the table.
  $rows = array();
  foreach ($path_groups as $path => $group) {
    // Print a row for rearranging a group of layouts.
    $operations = array(
      '#type' => 'dropbutton',
      '#links' => _layout_get_group_operations($path, $group),
    );
    $row = array();
    // Default layouts have a null path.
    if ($path === '') {
      $row[] = array('data' => t('Default layouts (used on all paths without a specific layout)'));
      // Empty columns are intentional so that they may be hidden with
      // priority-low class on the $header array.
      $row[] = '';
      $row[] = '';
    }
    else {
      $path_link = strpos($path, '%') === FALSE ? l($path, $path) : check_plain($path);
      $row[] = array('data' => $path_link);
      // Empty columns are intentional.
      $row[] = '';
      $row[] = '';
    }
    if (count($operations['#links']) !== 0) {
      $row[] = backdrop_render($operations);
    }
    else {
      $row[] = '';
    }
    $rows[] = array('data' => $row, 'class' => array('layout-group'));

    foreach ($group as $layout) {
      $operations = array(
        '#type' => 'dropbutton',
        '#links' => _layout_get_operations($layout),
      );
      if ($layout->storage === LAYOUT_STORAGE_OVERRIDE) {
        $storage = t('Overridden');
      }
      elseif ($layout->storage === LAYOUT_STORAGE_DEFAULT) {
        $storage = t('Default (module-provided)');
      }
      else {
        $storage = t('Custom');
      }

      $row = array();
      $row[] = theme('layout_info', array('layout' => $layout));
      $row[] = theme('layout_condition_info', array('layout' => $layout));
      $row[] = $storage;
      $row[] = backdrop_render($operations);
      $class = array('layout-row');
      if ($layout->disabled) {
        $class[] = 'disabled';
      }
      $rows[] = array('data' => $row, 'class' => $class);
    }
  }

  $header = array(
    array('data' => t('Path and layout'), 'class' => array('layout-title')),
    array('data' => t('Visibility conditions'), 'class' => array('layout-conditions', 'priority-low')),
    array('data' => t('Storage state'), 'class' => array('layout-status', 'priority-low')),
    array('data' => t('Operations'), 'class' => array('layout-operations')),
  );

  $page = array();
  $page['#attached']['css'][] = backdrop_get_path('module', 'layout') . '/css/layout.admin.css';
  $page['table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    '#attributes' => array('id' => 'layout-list'),
    '#empty' => t('No layouts have been created yet.'),
  );
  return $page;
}

/**
 * Given a layout, return a list of operations that can be performed on it.
 */
function _layout_get_operations(Layout $layout) {
  $links = array();
  if ($layout->disabled && !$layout->isDefault()) {
    $links['enable'] = array(
      'title' => t('Enable Layout'),
      'href' => 'admin/structure/layouts/manage/' . $layout->name . '/enable',
      'query' => array('token' => backdrop_get_token('layout-' . $layout->name)),
    );
  }
  $links['edit'] = array(
    'title' => t('Manage blocks'),
    'href' => 'admin/structure/layouts/manage/' . $layout->name,
  );
  $links['settings'] = array(
    'title' => t('Configure Layout'),
    'href' => 'admin/structure/layouts/manage/' . $layout->name . '/configure',
  );
  if (!$layout->isDefault()) {
    $links['clone'] = array(
      'title' => t('Clone Layout'),
      'href' => 'admin/structure/layouts/manage/' . $layout->name . '/clone',
    );
    if (!$layout->disabled) {
      $links['disable'] = array(
        'title' => t('Disable Layout'),
        'href' => 'admin/structure/layouts/manage/' . $layout->name . '/disable',
        'query' => array('token' => backdrop_get_token('layout-' . $layout->name)),
      );
    }
    if ($layout->storage === LAYOUT_STORAGE_NORMAL) {
      $links['delete'] = array(
        'title' => t('Delete Layout'),
        'href' => 'admin/structure/layouts/manage/' . $layout->name . '/delete',
      );
    }
  }

  if ($layout->storage === LAYOUT_STORAGE_OVERRIDE) {
    $links['revert'] = array(
      'title' => t('Revert Layout'),
      'href' => 'admin/structure/layouts/manage/' . $layout->name . '/delete',
    );
  }

  return $links;
}

/**
 * Given a path, return a list of operations for a group of layouts.
 */
function _layout_get_group_operations($path, array $group) {
  $links = array();

  // The default layouts have no operations.
  if ($path === '') {
    return $links;
  }

  $last_layout = end($group);
  reset($group);
  if ($last_layout->menu_item) {
    $links['menu_settings'] = array(
      'title' => t('Menu settings'),
      'href' => 'admin/structure/layouts/menu/' . $last_layout->menu_item->name,
    );
  }
  if (count($group) > 1) {
    $links['reorder'] = array(
      'title' => t('Reorder'),
      'href' => 'admin/structure/layouts/reorder',
      'query' => array('layouts' => array_keys($group)),
    );
  }
  return $links;
}

/**
 * Menu callback; Display the form for adding a new layout.
 */
function layout_add_page() {
  if (isset($_SESSION['layout_new_name'])) {
    $layout = layout_tempstore_load($_SESSION['layout_new_name']);
  }
  if (empty($layout)) {
    $config = array(
      'is_new' => TRUE,
    );
    $layout = new Layout($config);
  }
  backdrop_set_title(t('Add layout'));
  return backdrop_get_form('layout_settings_form', $layout);
}

/**
 * Render the settings form for layout.
 *
 * @ingroup forms
 */
function layout_settings_form($form, &$form_state, Layout $layout) {
  form_load_include($form_state, 'inc', 'layout', 'layout.admin');

  $form_state['layout'] = &$layout;
  $form['#tree'] = TRUE;

  $form['#attached']['js'][] = backdrop_get_path('module', 'layout') . '/js/layout.admin.js';
  $form['#attached']['css'][] = backdrop_get_path('module', 'layout') . '/css/layout.admin.css';

  $messages = array();
  if ($layout->locked) {
    $messages['warning'] = array(
      layout_locked_message($layout, 'layout'),
    );
  }
  $form['messages'] = array(
    '#theme' => 'status_messages',
    '#messages' => $messages,
    '#weight' => -100,
    // Prefix/suffix used to identify in AJAX requests.
    '#prefix' => '<div id="layout-messages">',
    '#suffix' => '</div>',
  );

  $form['title'] = array(
    '#title' => t('Layout name'),
    '#type' => 'textfield',
    '#maxlength' => 128,
    '#default_value' => $layout->title,
    '#required' => TRUE,
    '#access' => !$layout->isDefault(),
  );
  $form['name'] = array(
    '#type' => 'machine_name',
    '#machine_name' => array(
      'source' => array('title'),
      'exists' => 'layout_load',
    ),
    '#maxlength' => 128,
    '#default_value' => $layout->name,
    '#required' => TRUE,
    '#access' => !$layout->isDefault(),
  );
  $form['layout_template'] = array(
    '#title' => t('Layout template'),
    '#type' => 'radios',
    '#default_value' => $layout->layout_template,
    '#options' => array(),
    '#wrapper_attributes' => array('class' => array('clearfix', 'layout-options')),
    '#required' => TRUE,
  );

  // Get the list of layout template options.
  $all_template_info = layout_get_layout_template_info();
  $excluded = config_get('layout.settings', 'excluded_templates');
  foreach ($all_template_info as $template_name => $template_info) {
    if (!in_array($template_name, $excluded)) {
      $form['layout_template']['#options'][$template_name] = theme('layout_template_option', array('template_info' => $template_info));
    }
  }

  $form['path'] = array(
    '#title' => t('Path'),
    '#type' => 'textfield',
    '#default_value' => $layout->getPath(),
    '#required' => TRUE,
    '#description' => t('Use the "%" (percent) symbol to indicate a wildcard in the path. i.e. "node/%" or "node/%/edit".'),
    '#access' => !$layout->isDefault(),
  );
  $form['path_update'] = array(
    '#type' => 'submit',
    '#value' => t('Check path'),
    '#validate' => array(
      'layout_settings_form_validate',
    ),
    '#submit' => array(
      'layout_settings_form_update_layout',
      'layout_settings_form_path_rebuild',
    ),
    '#ajax' => array(
      'callback' => 'layout_settings_form_path_ajax',
      'disable' => FALSE,
      'progress' => 'none',
    ),
    '#attributes' => array(
      'data-layout-path-update' => 'true',
      'class' => array('js-hide'),
    ),
    '#access' => !$layout->isDefault(),
  );

  $contexts = $layout->getContexts();
  $built_in_contexts = isset($contexts['overrides_path']) ? 2 : 1;
  $form['context_wrapper']['#access'] = !$layout->isDefault();
  $form['context_wrapper']['#prefix'] = '<div id="layout-contexts">';
  $form['context_wrapper']['#suffix'] = '</div>';
  $form['context_wrapper']['context'] = array(
    '#title' => t('Contexts'),
    '#type' => 'item',
    '#description' => t('Contexts define what blocks are available within this layout. Most wildcards in the path will be associated with a context automatically.'),
    '#parents' => array('context'),
    // Current user context is always present.
    '#access' => count($contexts) > $built_in_contexts,
  );

  $all_context_info = _layout_get_all_info('layout_context');
  $context_options = array();
  foreach ($all_context_info as $plugin_name => $context_info) {
    if (empty($context_info['hidden'])) {
      $context_options[$plugin_name] = $context_info['title'];
    }
  }

  $form['context_wrapper']['context']['required'] = array(
    '#theme' => 'layout_settings_context_table',
    '#layout_path' => $layout->getPath(),
  );

  foreach ($contexts as $context_key => $layout_context) {
    if ($layout_context->position && $layout_context->locked) {
      $form['context_wrapper']['context']['required'][$context_key]['plugin'] = array(
        '#type' => 'value',
        '#value' => $layout_context->plugin,
      );
      $form['context_wrapper']['context']['required'][$context_key]['label'] = array(
        '#markup' => check_plain($all_context_info[$layout_context->plugin]['title']),
      );
    }
    elseif ($layout_context->position && $layout_context->required) {
      $form['context_wrapper']['context']['required'][$context_key]['plugin'] = array(
        '#type' => 'select',
        '#options' => $context_options,
        '#default_value' => $layout_context->plugin,
      );
    }
    else {
      // @todo: Support adding and removing custom contexts not based on path.
      // e.g. Adding a Node context based on a hard-coded ID.
    }
  }

  // Display a notice if overriding a system path that normally contains
  // wildcards e.g. node/1 instead of node/%. This is usually (but not always)
  // a misconfiguration of the layout.
  $layout_path = $layout->getPath();
  $router_item = menu_get_item($layout_path);
  if ($router_item && $router_item['path'] !== $layout_path && substr_count($router_item['path'], '/') === substr_count($layout_path, '/') && layout_context_required_by_path($router_item['path'])) {
    $message = t('The path entered will create a new page and disable the current "@old_path". If you intended to add a layout for "@old_path", use the path "@new_path" and add a URL path condition for "@old_path".', array('@new_path' => $router_item['path'], '@old_path' => $layout->getPath()));
    if (backdrop_is_ajax()) {
      backdrop_set_message($message, 'warning');
    }
    else {
      $form['messages']['#messages']['warning'][] = $message;
    }
  }

  $form['conditions'] = array(
    '#title' => t('Visibility conditions'),
    '#type' => 'item',
    '#description' => t('Visibility conditions allow this layout to selectively apply to different situations, such as different types of content at the same wildcard path.'),
    '#id' => 'layout-access',
    '#access' => !$layout->isDefault(),
  );
  $form['conditions']['active'] = array(
    '#theme' => 'layout_conditions',
    '#attributes' => array('class' => array('layout-access-list')),
  );
  foreach ($layout->conditions as $access_key => $layout_access) {
    $form['conditions']['active'][$access_key] = array(
      '#type' => 'container',
      '#attributes' => array('class' => array('layout-condition')),
      '#id' => NULL,
    );
    $form['conditions']['active'][$access_key]['label'] = array(
      '#markup' => $layout_access->summary(),
    );
    $form['conditions']['active'][$access_key]['remove'] = array(
      '#type' => 'submit',
      '#value' => t('Remove'),
      '#attributes' => array('class' => array('layout-link-button', 'layout-access-remove')),
      '#validate' => array(),
      '#submit' => array(
        'layout_settings_form_condition_remove',
        'layout_settings_form_update_layout',
      ),
      '#ajax' => array(
        'callback' => 'layout_ajax_form_update',
      ),
      '#name' => 'conditions_' . $access_key . '_remove',
    );
    $form['conditions']['active'][$access_key]['configure'] = array(
      '#type' => 'submit',
      '#value' => t('Configure'),
      '#attributes' => array('class' => array('layout-link-button', 'layout-access-configure')),
      '#validate' => array(
        'layout_settings_form_validate',
      ),
      '#submit' => array(
        'layout_settings_form_condition_edit',
      ),
      '#ajax' => array(
        'callback' => 'layout_ajax_form_open_dialog',
      ),
      '#name' => 'conditions_' . $access_key . '_configure',
    );
  }
  $form['conditions']['add'] = array(
    '#type' => 'submit',
    '#value' => t('Add visibility condition'),
    '#attributes' => array('class' => array('layout-link-button', 'layout-access-add')),
    '#validate' => array(),
    '#submit' => array(
      'layout_settings_form_update_layout',
      'layout_settings_form_condition_add',
    ),
    '#ajax' => array(
      'callback' => 'layout_ajax_form_open_dialog',
    ),
    '#prefix' => '<ul class="action-links"><li>',
    '#suffix' => '</li></ul>',
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => empty($layout->is_new) ? t('Save layout') : t('Create layout'),
    '#validate' => array(
      'layout_settings_form_validate',
    ),
    '#submit' => array(
      'layout_settings_form_update_layout',
      'layout_settings_form_save_submit',
    ),
  );
  if (isset($_SESSION['layout_new_name']) || isset($layout->locked)) {
    $form['actions']['reset'] = array(
      '#type' => 'submit',
      '#value' => t('Cancel'),
      '#limit_validation_errors' => array(array('actions', 'reset')),
      '#validate' => array(),
      '#submit' => array(
        'layout_settings_form_reset',
      ),
    );
  }

  return $form;
}

/**
 * Validates layout_settings_form(), ensuring a valid path.
 */
function layout_settings_form_validate(&$form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];

  // Remove trailing and preceding slashes.
  $path = $form_state['values']['path'] = trim($form_state['values']['path'], '/');

  if (strpos($path, '%') === 0) {
    form_error($form['path'], t('The first part of a path may not be a wildcard.'));
  }

  // Ensure the path is not already an alias to something else.
  if (strpos($path, '%') === FALSE) {
    $alias = db_query('SELECT * FROM {url_alias} WHERE alias = :path', array(':path' => $path))->fetchObject();
    if ($alias) {
      $error = t('That path is currently assigned to be an alias for "@alias".', array('@alias' => $alias->source));
      if (user_access('administer url aliases')) {
        $error .= ' ' . t('<a href="!url">Delete the alias first</a>, then save this layout.', array('!url' => url('admin/config/urls/path/delete/' . $alias->pid, array('query' => array('destination' => $_GET['q'])))));
      }
      form_error($form['path'], $error);
    }
  }

  // Ensure path is properly formed.
  $parts = explode('/', $path);
  foreach ($parts as $part) {
    $wildcard_position = strpos($part, '%');
    if ($wildcard_position !== FALSE && ($wildcard_position > 0 || strlen($part) > 1)) {
      form_error($form['path'], t('Wildcard placeholders must be the only character in their part of the path i.e. "@part" should be "%".', array('@part' => $part)));
    }
  }

  // Ensure that all conditions have context requirements met.
  $context_plugins = array(
    'user', // The user plugin is always available for the current user.
  );
  $contexts = layout_context_required_by_path($path);
  foreach ($contexts as $context) {
    $context_plugins[] = $context->plugin;
  }
  foreach ($layout->conditions as $key => $condition) {
    $required_contexts = $condition->getRequiredContexts();
    if (array_diff($required_contexts, $context_plugins)) {
      form_error($form['conditions']['active'][$key], t('The condition \'@condition\' does not have the required contexts at this path. Remove the condition to save the layout.', array('@condition' => $condition->summary())));
    }
  }
}

/**
 * Submit handler for layout_settings_form() that updates available contexts.
 */
function layout_settings_form_path_rebuild($form, &$form_state) {
  $form_state['rebuild'] = TRUE;
}

/**
 * AJAX handler for layout_settings_form() the returns updated contexts.
 */
function layout_settings_form_path_ajax($form, &$form_state) {
  $commands[] = ajax_command_remove('.l-messages');
  $commands[] = ajax_command_html('#layout-messages', theme('status_messages'));
  $commands[] = ajax_command_html('#layout-contexts', backdrop_render($form['context_wrapper']));
  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * Submit handler for layout_settings_form() that lets the user add a condition.
 */
function layout_settings_form_condition_add($form, &$form_state) {
  // Remove destination flags when adding conditions, otherwise the user will
  // be taken to the destination instead of adding a condition. This only
  // affects non-JS behavior.
  if (isset($_GET['destination'])) {
    unset($_GET['destination']);
  }
  $form_state['redirect'] = 'admin/structure/layouts/manage/' . $form_state['layout']->name . '/condition/add';
}

/**
 * Submit handler for layout_settings_form() that removes a condition.
 */
function layout_settings_form_condition_remove($form, &$form_state) {
  $removed_condition = $form_state['clicked_button']['#array_parents'][2];
  unset($form_state['layout']->conditions[$removed_condition]);
  layout_set_layout_tempstore($form_state['layout']);

  $form_state['ajax_update'] = array('conditions');
}

/**
 * Submit handler for layout_settings_form() that edits an condition.
 */
function layout_settings_form_condition_edit($form, &$form_state) {
  $edit_condition = $form_state['clicked_button']['#array_parents'][2];
  $form_state['redirect'] = 'admin/structure/layouts/manage/' . $form_state['layout']->name . '/condition/edit/layout/' . $edit_condition;
}

/**
 * Submit handler for layout_settings_form() that saves in-progress values.
 */
function layout_settings_form_update_layout($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];

  // Keep track of the original name.
  if (isset($form_state['values']['name'])) {
    if ($form_state['values']['name'] !== $layout->name && !isset($layout->original_name)) {
      $layout->original_name = $layout->name;
    }
  }

  // Update main properties.
  if (isset($form_state['values']['title'])) {
    $layout->title = $form_state['values']['title'];
  }
  if (isset($form_state['values']['name'])) {
    $layout->name = $form_state['values']['name'];
  }
  if (isset($form_state['values']['layout_template'])) {
    $new = $form_state['values']['layout_template'];
    $region_mapping = layout_get_legacy_region_mapping($layout->layout_template, $new);
    $layout->setLayoutTemplate($form_state['values']['layout_template'], $region_mapping);
  }
  if (isset($form_state['values']['path'])) {
    $layout->setPath($form_state['values']['path']);
  }

  // Update contexts.
  // @todo: Provide methods/API for setting menu item arguments.
  if ($layout->menu_item && isset($form_state['values']['context'])) {
    $plugin_counts = array();
    $arguments = array();

    foreach ($layout->getContexts() as $position => $layout_context) {
      if (isset($form_state['values']['context']['required'][$position])) {
        $argument_config = $form_state['values']['context']['required'][$position];
        $plugin = $argument_config['plugin'];
      }
      else {
        $plugin = $layout_context->plugin;
      }

      // Keep track of all utilized plugins, both required and locked.
      $plugin_counts[$plugin] = isset($plugin_counts[$plugin]) ? $plugin_counts[$plugin] + 1 : 1;

      // Locked contexts are forced to be at this path, so they do not need to
      // be saved in the menu item's argument configuration.
      if ($layout_context->locked) {
        continue;
      }

      // Give an automatically generated name such as "node" or "string2".
      $name = $plugin . (($plugin_counts[$plugin] === 1) ? '' : $plugin_counts[$plugin]);

      // Persist machine names if they already exists for this argument.
      if (isset($layout->menu_item->arguments[$position])) {
        $existing_argument = $layout->menu_item->arguments[$position];
        if ($existing_argument['plugin'] === $plugin) {
          $name = $existing_argument['name'];
        }
      }

      $arguments[$position] = array(
        'plugin' => $plugin,
        'name' => $name,
        'position' => $position,
      );
    }
    $layout->menu_item->arguments = $arguments;
  }

  if (!empty($layout->is_new)) {
    $_SESSION['layout_new_name'] = $layout->name;
  }
  else {
    if ($form_state['values']['name'] !== $layout->name) {
      $layout->original_name = $form_state['values']['name'];
    }
  }
  layout_set_layout_tempstore($layout);
}

/**
 * Returns an array of mappings from old region names to new.
 */
function layout_get_legacy_region_mapping($old, $new) {
  $region_mapping = array();
  $legacy = array('one_column', 'two_column', 'two_column_flipped', 'three_three_four_column');
  $bootstrap = array('boxton', 'geary', 'harris', 'moscone', 'moscone_flipped', 'rolph', 'simmons', 'sutro', 'taylor', 'taylor_flipped');

  if (in_array($old, $legacy) && in_array($new, $bootstrap)) {
    $region_mapping = array(
      'sidebar_first'       => 'sidebar',
      'sidebar_second'      => 'sidebar2',
      'triptych_first'      => 'third1',
      'triptych_middle'     => 'third2',
      'triptych_last'       => 'third3',
      'footer_firstcolumn'  => 'quarter1',
      'footer_secondcolumn' => 'quarter2',
      'footer_thirdcolumn'  => 'quarter3',
      'footer_fourthcolumn' => 'quarter4',
    );
  }

  if (in_array($old, $bootstrap) && in_array($new, $legacy)) {
    $region_mapping = array(
      'sidebar'  => 'sidebar_first',
      'sidebar2' => 'sidebar_second',
      'third1'   => 'triptych_first',
      'third2'   => 'triptych_middle',
      'third3'   => 'triptych_last',
      'quarter1' => 'footer_firstcolumn',
      'quarter2' => 'footer_secondcolumn',
      'quarter3' => 'footer_thirdcolumn',
      'quarter4' => 'footer_fourthcolumn',
    );
  }

  return $region_mapping;
}

/**
 * Submit handler for layout_settings_form() that resets in-progress changes.
 */
function layout_settings_form_reset($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  if (isset($_SESSION['layout_new_name'])) {
    unset($_SESSION['layout_new_name']);
  }
  layout_clear_layout_tempstore($layout->name);
  backdrop_set_message(t('Layout changes discarded.'));
  $form_state['redirect'] = 'admin/structure/layouts';
}

/**
 * Submit handler for layout_settings_form() that saves in-progress changes.
 */
function layout_settings_form_save_submit($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  if (isset($_SESSION['layout_new_name'])) {
    unset($_SESSION['layout_new_name']);
  }

  // If this is a new layout, populate blocks from default layout.
  if (!empty($layout->is_new)) {
    $default_layout_name = path_is_admin($layout->getPath()) ? 'admin_default' : 'default';
    $default_layout = layout_load($default_layout_name);
    // Get the template being used by this layout.
    $template_info = layout_get_layout_template_info($layout->layout_template);
    foreach ($default_layout->positions as $region => $region_block_list) {
      if (array_key_exists($region, $template_info['regions'])) {
        foreach ($region_block_list as $uuid) {
          if (isset($default_layout->content[$uuid])) {
            $block = $default_layout->content[$uuid];
            $new_block = $block->getClone();
            // Only add the block from the default if required contexts are
            // present for each block.
            if ($layout->hasContexts($new_block->getRequiredContexts())) {
              $layout->positions[$region][] = $new_block->uuid;
              $layout->content[$new_block->uuid] = $new_block;
            }
          }
        }
      }
    }
  }

  $layout->save();

  layout_clear_layout_tempstore($layout->name);
  if (!empty($layout->is_new)) {
    backdrop_set_message(t('Layout created. Blocks may now be added to this layout.'));
  }
  else {
    backdrop_set_message(t('Layout saved.'));
  }
  $form_state['redirect'] = 'admin/structure/layouts/manage/' . $layout->name;
}

/**
 * Form callback; Main form for editing a layout's content.
 *
 * No validation function is necessary, as all 'validation' is handled
 * either in the lead-up to form rendering (through the selection of
 * specified content types) or by the validation functions specific to
 * the ajax modals & content types.
 *
 * @ingroup forms
 */
function layout_content_form($form, &$form_state, Layout $layout, $renderer_name = NULL) {
  $path = isset($layout->menu_item->path) ? '(' . $layout->menu_item->path . ')' : NULL;
  backdrop_set_title(t('!layout !path', array('!layout' => $layout->title, '!path' => $path)));
  if (!isset($form_state['layout'])) {
    $form_state['layout'] = $layout;
  }
  if ($renderer_name) {
    $renderer = layout_create_renderer($renderer_name, $layout);
  }
  else {
    $renderer = layout_create_renderer('editor', $layout);
  }

  if (!isset($form_state['renderer'])) {
    $form_state['renderer'] = $renderer;
  }

  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var LayoutRendererStandard $renderer */
  $renderer = $form_state['renderer'];

  // Although layout is already set in $form_state, we need this to make it
  // available to the theme layer.
  $form['#layout'] = $layout;

  $form['#attached'] = array(
    'library' => array(
      array('system', 'backdrop.ajax'),
    ),
  );

  $form['messages'] = array(
    '#markup' => $layout->locked ? '<div class="messages warning">' . layout_locked_message($layout, 'layout') . '</div>' : '',
    '#weight' => -100,
    // Prefix/suffix used to identify in AJAX requests.
    '#prefix' => '<div id="layout-messages">',
    '#suffix' => '</div>',
  );

  $form['content'] = array('#tree' => TRUE);
  $form['content']['block'] = array('#tree' => TRUE);

  $form['content']['display'] = array(
    '#markup' => $renderer->render(),
  );

  foreach ($renderer->layout_info['regions'] as $region_id => $title) {
    // Make sure we at least have an empty array for all possible locations.
    if (!isset($layout->positions[$region_id])) {
      $layout->positions[$region_id] = array();
    }

    $form['content']['positions'][$region_id] = array(
      // Use 'hidden' instead of 'value' so the JS can access it.
      '#type' => 'hidden',
      '#default_value' => implode(',', $layout->positions[$region_id]),
    );
  }

  $form['actions'] = array(
    '#type' => 'actions',
  );
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save layout'),
    '#id' => 'layout-edit-save',
    '#submit' => array('layout_content_form_submit'),
  );
  $form['actions']['cancel'] = array(
    '#type' => 'submit',
    '#value' => t('Cancel'),
    '#validate' => array(),
    '#limit_validation_errors' => array(array('actions', 'reset')),
    '#submit' => array('layout_settings_form_reset'),
  );

  return $form;
}

/**
 * Validate the layout settings form.
 */
function layout_content_form_validate($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];

  // Ensure that the main page content block is only positioned once and that
  // default layouts include the main page content.
  $main_blocks_found = 0;
  foreach ($layout->content as $block) {
    if ($block->module === 'system' && $block->delta === 'main') {
      $main_blocks_found++;
    }
  }
  if ($main_blocks_found > 1) {
    form_error($form['content']['positions'], t('The "@block" block may only be added once to this layout.', array('@block' => t('Main page content'))));
  }
  elseif ($main_blocks_found === 0 && ($layout->name === 'default' || $layout->name === 'admin_default')) {
    form_error($form['content']['positions'], t('The "@block" block must be added to this layout.', array('@block' => t('Main page content'))));
  }

  // Ensure that no block is positioned more than once. This is merely a sanity
  // check, it should not occur within the normal interface.
  $all_uuids = array();
  foreach ($layout->positions as $uuids) {
    foreach ($uuids as $uuid) {
      if (in_array($uuid, $all_uuids)) {
        form_error($form['content']['positions'], t('The "@block" block has incorrectly been positioned multiple times. This may indicate an incorrectly saved layout configuration.', array('@block' => $layout->content[$uuid]->getAdminTitle())));
      }
      $all_uuids[] = $uuid;
    }
  }

  // Let the layout do any specific validations.
  $layout->formValidate($form, $form_state);
}

/**
 * Handle form submission of the display content editor.
 *
 * This reads the location of the various blocks from the form, which will
 * have been modified via JavaScript, rearranges them and then saves
 * the display.
 */
function layout_content_form_submit($form, &$form_state) {
  /* @var Layout $layout */
  $layout = &$form_state['layout'];

  // Update the block positions based on the hidden position elements.
  if (!empty($form_state['values']['content']['positions'])) {
    $new_content = array();
    $new_positions = array();

    foreach ($form_state['values']['content']['positions'] as $region_id => $blocks) {
      $new_positions[$region_id] = array();
      if ($blocks) {
        $uuids = array_filter(explode(',', $blocks));
        foreach ($uuids as $uuid) {
          if (isset($layout->content[$uuid])) {
            $new_content[$uuid] = $layout->content[$uuid];
            $new_positions[$region_id][] = $uuid;
          }
        }
      }
    }
    $layout->content = $new_content;
    $layout->positions = $new_positions;
  }

  // Save title settings.
  if (isset($form_state['values']['title_display'])) {
    $layout->settings['title'] = $form_state['values']['title'];
    $layout->settings['title_display'] = $form_state['values']['title_display'];
  }

  // Let layouts save their own settings if needed.
  $layout->formSubmit($form, $form_state);

  // Save the entire layout to configuration.
  $layout->save();

  // Delete the tempstore copy of the layout.
  layout_clear_layout_tempstore($layout->name);

  backdrop_set_message(t('Layout content saved.'));
}

/**
 * Menu callback; Display a list of blocks to be added to a layout.
 */
function layout_block_add_page(Layout $layout, $renderer_name, $region_name, $block_key = NULL) {
  /* @var Layout $layout */
  $form_state['layout'] = $layout;
  $template_info = layout_get_layout_template_info($layout->layout_template);
  if (!array_key_exists($region_name, $template_info['regions'])) {
    return MENU_NOT_FOUND;
  }

  // If a block has been selected, return the block configuration form.
  if (isset($block_key)) {
    list($module, $delta) = explode(':', $block_key);
    $block_info = layout_get_block_info($module, $delta);
    if (!$block_info) {
      return MENU_NOT_FOUND;
    }

    $block = layout_create_handler('block', $block_key);
    return backdrop_get_form('layout_block_configure_form', $layout, $block, $renderer_name, $region_name);
  }

  $blocks = layout_get_block_info();

  // Assemble all blocks into a single list and sort.
  $block_list = array();
  foreach ($blocks as $module => $module_blocks) {
    if (empty($module_blocks)) {
      continue;
    }
    foreach ($module_blocks as $delta => $block_info) {
      /* @var Block $parent_block */
      $parent_block = layout_create_handler('block', $module . ':' . $delta);
      $children = $parent_block->getChildren();
      if (is_array($children)) {
        foreach ($children as $child_id => $child_info) {
          // Skip blocks that don't have context requirements met.
          $required_contexts = isset($child_info['required contexts']) ? $child_info['required contexts'] : array();
          if ($layout->hasContexts($required_contexts)) {
            $block_list[$module . ':' . $delta . ':' . $child_id] = $child_info;
          }
        }
      }
      else {
        $required_contexts = isset($block_info['required contexts']) ? $block_info['required contexts'] : array();
        // Skip blocks that don't have context requirements met.
        if ($layout->hasContexts($required_contexts)) {
          $block_list[$module . ':' . $delta] = $block_info;
        }
      }
    }
  }
  backdrop_sort($block_list, array('info' => SORT_STRING));

  $output['search'] = array(
    '#type' => 'textfield',
    '#title' => 'Search',
    '#attributes' => array(
      'id' => array('layout-block-list-search'),
    ),
    // Hide the search if no JavaScript is available.
    '#wrapper_attributes' => array(
      'class' => array('js-show'),
    ),
  );
  $output['block_list'] = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array('layout-block-list'),
    ),
  );

  $output['block_list']['block_list_inner'] = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array('layout-block-list-wrapper'),
    ),
  );

  foreach ($block_list as $key => $block_info) {
    $output['block_list']['block_list_inner'][$key] = array(
      '#type' => 'item',
      '#markup' => l(
        $block_info['info'],
        'admin/structure/layouts/manage/' . $layout->name . '/add-block/' . $renderer_name . '/' . $region_name . '/' . $key,
        array(
          'attributes' => array(
            'class' => array('use-ajax block-item'),
            'data-dialog' => TRUE,
            'data-dialog-options' => json_encode(array('dialogClass' => 'layout-dialog')),
          )
        )
      ),
      '#description' => isset($block_info['description']) ? $block_info['description'] : NULL,
      '#wrapper_attributes' => array('class' => array('layout-block-add-row'))
    );
  }

  return $output;
}

/**
 * Form callback; Configure layout title type.
 *
 * @ingroup forms
 */
function layout_title_settings_form($form, &$form_state, Layout $layout) {
  form_load_include($form_state, 'inc', 'layout', 'layout.admin');

  $form_state['layout'] = $layout;
  $form_state['menu_item'] = NULL;

  $form['title_display']['#tree'] = FALSE;
  $form['title_display']['title_display'] = array(
    '#type' => 'radios',
    '#default_value' => $layout->settings['title_display'],
    '#options' => array(
      LAYOUT_TITLE_DEFAULT => t('Default page title'),
      LAYOUT_TITLE_CUSTOM => t('Custom page title'),
      LAYOUT_TITLE_BLOCK => t('Copy from block'),
      LAYOUT_TITLE_NONE => t('No title'),
    ),
  );

  $form['title_display']['title_display'][LAYOUT_TITLE_DEFAULT]['#description'] = t('The page title will pull from a default source. For example: on the user account page, a username may be used.');
  $form['title_display']['title_display'][LAYOUT_TITLE_CUSTOM]['#description'] = t('Provide a custom page title for this layout.');
  $form['title_display']['title_display'][LAYOUT_TITLE_BLOCK]['#description'] = t('Copy the page title from a block for this layout.');
  $form['title_display']['title_display'][LAYOUT_TITLE_NONE]['#description'] = t('Hide the page title for this layout.');

  $form['title_display']['title'] = array(
    '#type' => 'textfield',
    '#default_value' => $layout->settings['title'],
    '#title' => t('Custom page title'),
    '#description' => t('If left blank, a default title may be used.'),
    '#states' => array(
      'visible' => array(
        ':input[name="title_display"]' => array('value' => LAYOUT_TITLE_CUSTOM),
      ),
    ),
    '#maxlength' => 255,
  );

  $all_blocks = layout_get_block_info();
  $block_options = array();
  foreach ($layout->content as $uuid => $block) {
    $title = $all_blocks[$block->module][$block->delta]['info'];
    if (!empty($title) && $title !== 'Custom block') {
      $block_options[$uuid] = $title;
    }
  }
  asort($block_options);

  $form['title_display']['title_block'] = array(
    '#type' => 'select',
    '#default_value' => $layout->settings['title_block'],
    '#title' => t('Block to copy'),
    '#description' => t('The page title will be taken from this block\'s title.'),
    '#states' => array(
      'visible' => array(
        ':input[name="title_display"]' => array('value' => LAYOUT_TITLE_BLOCK),
      ),
    ),
    '#options' => $block_options,
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
    '#attributes' => array('class' => array('layout-title-button')),
    '#submit' => array(
      'layout_title_settings_form_submit',
    ),
    '#save_in_progress' => TRUE,
    '#ajax' => array(
      'callback' => 'layout_ajax_form_save_title_dialog',
    ),
  );

  return $form;
}

/**
 * Submit handler for layout_title_settings_form() to change title settings.
 */
function layout_title_settings_form_submit($form, &$form_state) {
  $layout = $form_state['layout'];

  // Save title settings.
  if (isset($form_state['values']['title_display'])) {
    $layout->settings['title'] = $form_state['values']['title'];
    $layout->settings['title_block'] = $form_state['values']['title_block'];
    $layout->settings['title_display'] = $form_state['values']['title_display'];
  }

  // Set the part of the form to be rebuilt via ajax.
  $form_state['ajax_update'] = array('title_display');

  $layout->in_progress['section'] = 'title';
  layout_set_layout_tempstore($layout);
}

/**
 * Menu callback; Redirect to the layout configuration form.
 *
 * This menu callback is utilized by contextual links.
 */
function layout_block_configure_redirect($layout, $block_uuid) {
  $destination = backdrop_get_destination();
  if (isset($_GET['destination'])) {
    unset($_GET['destination']);
  }
  backdrop_goto('admin/structure/layouts/manage/' . $layout->name, array('query' => $destination));
}

/**
 * Form callback; Add or edit a block within a layout.
 *
 * @ingroup forms
 */
function layout_block_configure_form($form, &$form_state, Layout $layout, Block $block, $renderer_name, $region_name = NULL) {
  form_load_include($form_state, 'inc', 'layout', 'layout.admin');

  $form_state['layout'] = $layout;
  $form_state['block'] = $block;
  if (!isset($form_state['renderer'])) {
    $form_state['renderer'] = layout_create_renderer($renderer_name, $layout);
  }
  if (!isset($region_name)) {
    $region_name = $layout->getBlockPosition($block->uuid);
  }

  if (empty($block->uuid)) {
    $form['#title'] = t('Add block "!title"', array('!title' => $block->getAdminTitle()));
  }
  else {
    $form['#title'] = t('Configure block "!title"', array('!title' => $block->getAdminTitle()));
  }

  $template_info = layout_get_layout_template_info($layout->layout_template);
  $form['region'] = array(
    '#type' => 'select',
    '#title' => t('Region'),
    '#default_value' => $region_name,
    '#options' => $template_info['regions'],
    '#access' => backdrop_is_html(), // Only show this on non-JS requests.
  );

  // We overload the layout object with an "in_progress" key to hold information
  // about the block currently being edited, this eases the multi-dialog
  // workflow for a sequence of dialogs affecting existing or new blocks.
  if (!isset($layout->in_progress['block']) || $layout->in_progress['block']->uuid !== $block->uuid) {
    $layout->in_progress = array(
      'block' => $block,
      'region_name' => $region_name,
      'renderer_name' => $renderer_name,
      'section' => NULL,
    );
  }
  // If resuming an in-progress edit, pull out the region name.
  else {
    $form['region']['#default_value'] = $layout->in_progress['region_name'];
  }

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => empty($block->uuid) ? t('Add block') : t('Update block'),
  );

  $form['#tree'] = TRUE;
  $block->form($form, $form_state);

  /* Style settings: */
  $form['style'] = array(
    '#type' => 'fieldset',
    '#title' => t('Style settings'),
    '#collapsed' => $layout->in_progress['section'] !== 'style',
    '#collapsible' => TRUE,
    '#weight' => 10,
  );
  $styles = _layout_get_all_info('layout_style');
  $style_options = array();
  foreach ($styles as $style_name => $style_info) {
    $style_options[$style_name] = $style_info['title'];
  }
  $current_style = $block->settings['style'];
  if (isset($form_state['values']['style'])) {
    $current_style = $form_state['values']['style'];
  }
  $form['style']['style'] = array(
    '#type' => 'select',
    '#title' => t('Style'),
    '#options' => $style_options,
    '#default_value' => $current_style,
    '#ajax' => array(
      'wrapper' => 'block_style_settings',
      'callback' => 'layout_block_configure_ajax_style'
    ),
    '#parents' => array('style'),
  );
  $form['style']['style_settings'] = array(
    '#type' => 'container',
    '#id' => 'block_style_settings',
    '#parents' => array('style_settings'),
  );

  // The style may change in a form rebuild, so we can't use $block->style
  // directly, instead crate a new style handler and use that form.
  $block->style = layout_create_handler('layout_style', $current_style, $block->style->toArray());
  $block->style->form($form['style']['style_settings'], $form_state);
  /* End style settings. */

  /* Visibility conditions: */
  $form['conditions'] = array(
    '#title' => t('Visibility conditions'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => $layout->in_progress['section'] !== 'conditions',
    '#description' => t('Visibility conditions allow this block to be shown only in certain situations, such as for certain roles or types of content.'),
    '#id' => 'block-access',
    '#weight' => 20,
  );
  $form['conditions']['add'] = array(
    '#type' => 'submit',
    '#value' => t('Add visibility condition'),
    '#attributes' => array('class' => array('layout-link-button', 'layout-access-add')),
    '#submit' => array(
      'layout_block_configure_form_submit',
      'layout_block_configure_form_condition_add',
    ),
    '#save_in_progress' => TRUE, // See layout_block_configure_form_submit().
    '#ajax' => array(
      'callback' => 'layout_ajax_form_open_dialog',
    ),
    '#prefix' => '<ul class="action-links"><li>',
    '#suffix' => '</li></ul>',
  );
  $form['conditions']['active'] = array(
    '#type' => 'container',
    '#theme' => 'layout_conditions',
    '#attributes' => array('class' => array('layout-access-list')),
  );
  foreach ($block->conditions as $access_key => $block_access) {
    $form['conditions']['active'][$access_key] = array(
      '#type' => 'container',
      '#attributes' => array('class' => array('layout-condition')),
      '#id' => NULL,
    );
    $form['conditions']['active'][$access_key]['label'] = array(
      '#markup' => $block_access->summary(),
    );
    $form['conditions']['active'][$access_key]['remove'] = array(
      '#type' => 'submit',
      '#value' => t('Remove'),
      '#attributes' => array('class' => array('layout-link-button', 'layout-access-remove')),
      '#submit' => array(
        'layout_block_configure_form_condition_remove',
      ),
      '#ajax' => array(
        'callback' => 'layout_ajax_form_update',
      ),
      '#name' => 'conditions' . $access_key . 'remove',
    );
    $form['conditions']['active'][$access_key]['configure'] = array(
      '#type' => 'submit',
      '#value' => t('Configure'),
      '#attributes' => array('class' => array('layout-link-button', 'layout-access-configure')),
      '#submit' => array(
        'layout_block_configure_form_condition_edit',
      ),
      '#save_in_progress' => TRUE, // See layout_block_configure_form_submit().
      '#ajax' => array(
        'callback' => 'layout_ajax_form_open_dialog',
      ),
      '#name' => 'conditions' . $access_key . 'remove',
    );
  }
  /* End visibility conditions. */

  // Note that we specifically use backdrop_is_ajax() in addition to
  // backdrop_is_dialog() to ensure the #ajax callback is specified when the
  // style dropdown rebuilds the form on changes.
  if (backdrop_is_dialog() || backdrop_is_ajax()) {
    $form['actions']['submit']['#ajax'] = array(
      'callback' => 'layout_block_configure_ajax_update',
    );
  }

  return $form;
}

/**
 * AJAX callback to update the style settings within the block configure form.
 */
function layout_block_configure_ajax_style($form, $form_state) {
  return $form['style']['style_settings'];
}

/**
 * Submit handler for layout_block_configure_form() to add a condition.
 */
function layout_block_configure_form_condition_add($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var Block $block */
  $block = $form_state['block'];

  $layout->in_progress['section'] = 'conditions';
  layout_set_layout_tempstore($layout);
  $form_state['redirect'] = 'admin/structure/layouts/manage/' . $layout->name . '/condition/add/' . $block->uuid;
}

/**
 * Submit handler for layout_block_configure_form() to edit a condition.
 */
function layout_block_configure_form_condition_edit($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var Block $block */
  $block = $form_state['block'];

  $edit_condition = $form_state['clicked_button']['#array_parents'][2];
  $form_state['redirect'] = 'admin/structure/layouts/manage/' . $layout->name . '/condition/edit/' . $block->uuid . '/' . $edit_condition;
}

/**
 * Submit handler for layout_block_configure_form() to remove a condition.
 */
function layout_block_configure_form_condition_remove($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var Block $block */
  $block = $form_state['block'];

  $removed_condition = $form_state['clicked_button']['#array_parents'][2];
  unset($block->conditions[$removed_condition]);
  $layout->in_progress['section'] = 'conditions';
  layout_set_layout_tempstore($layout);

  $form_state['ajax_update'] = array('conditions');
}

/**
 * Form validate handler for layout_block_configure_form().
 */
function layout_block_configure_form_validate($form, &$form_state) {
  /* @var Block $block */
  $block = $form_state['block'];

  // Validate the block settings.
  $block->formValidate($form, $form_state);

  // Replace the current style handler with a new one, in the event it changed.
  $style = layout_create_handler('layout_style', $form_state['values']['style']);
  $style->formValidate($form, $form_state);
  $form_state['style'] = $style;
}

/**
 * Form submit handler for layout_block_configure_form().
 */
function layout_block_configure_form_submit($form, &$form_state) {
  /* @var Block $block */
  $block = $form_state['block'];
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var LayoutStyle $style */
  $style = $form_state['style'];
  /* @var LayoutRendererStandard $renderer */
  $renderer = $form_state['renderer'];
  $block_plugin = $block->plugin;

  // Save the block settings.
  $block->formSubmit($form, $form_state);

  // Allow the block to change it's type by updating the plugin.
  if ($block_plugin !== $block->plugin) {
    $old_block = clone $block;
    $block = layout_create_handler('block', $old_block->plugin);
    $block->settings = $old_block->settings;
    $block->uuid = $old_block->uuid;
    $block->conditions = $old_block->conditions;
    $block->style = $old_block->style;
    $block->contexts = $old_block->contexts;
    $block->is_new = TRUE;
    $form_state['block'] = $block;
  }

  // Save the style settings.
  $style->formSubmit($form['style']['style_settings'], $form_state);
  $block->style = $style;

  // Generate a UUID for the block.
  if (empty($block->uuid)) {
    $uuid = new Uuid();
    $block->uuid = $uuid->generate();
  }

  // Temporarily store any unfinished blocks (those that do not yet have a
  // position but were just added) in the layout so it can be retrieved. See
  // layout_tempstore_block_load().
  if (!empty($form_state['triggering_element']['#save_in_progress'])) {
    $layout->in_progress['region_name'] = $form_state['values']['region'];
    $layout->in_progress['block'] = $block;
    $layout->in_progress['renderer'] = $renderer;
  }
  // Insert new blocks into the layout.
  else {
    $layout->content[$block->uuid] = $block;
    if ($form_state['values']['region']) {
      $layout->setBlockPosition($block->uuid, $form_state['values']['region']);
    }
    // Clean up the in_progress value now that we're fully done.
    $layout->in_progress = NULL;
  }

  $form_state['redirect'] = 'admin/structure/layouts/manage/' . $layout->name;
  layout_set_layout_tempstore($layout);
}

/**
 * AJAX callback to update the underlying layout form after updating a block.
 */
function layout_block_configure_ajax_update($form, $form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var Block $block */
  $block = $form_state['block'];
  /* @var LayoutRendererStandard $renderer */
  $renderer = $form_state['renderer'];
  $added_to_region = $block->is_new ? (isset($layout->in_progress['region_name']) ? $layout->in_progress['region_name'] : $form_state['values']['region']) : FALSE;

  // Display error messages in the form if any.
  if (form_get_errors()) {
    $html = '';
    $html .= theme('status_messages');
    $html .= backdrop_render($form);
    $title = isset($form['#title']) ? $form['#title'] : backdrop_get_title();
    $commands[] = ajax_command_open_modal_dialog($title, $html, array('dialogClass' => 'layout-dialog'));
  }
  // If a new block, add to the bottom of the region.
  elseif ($added_to_region) {
    $commands[] = ajax_command_close_modal_dialog();
    $commands[] = ajax_command_remove('#layout-editor-block-' . $block->uuid);
    $commands[] = ajax_command_append('#layout-editor-region-' . $added_to_region . ' .layout-editor-region-content', $renderer->renderBlock($block));
  }
  // If editing a block, replace the block with its placeholder.
  else {
    $commands[] = ajax_command_close_modal_dialog();
    $commands[] = ajax_command_replace('#layout-editor-block-' . $block->uuid, $renderer->renderBlock($block));
  }

  // Update the messages area.
  if ($message = layout_locked_message($layout, 'layout')) {
    backdrop_set_message($message, 'warning');
  }
  $commands[] = ajax_command_remove('#messages');
  $commands[] = ajax_command_html('#layout-messages', theme('status_messages'));

  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * Menu callback; Remove a block from a layout.
 */
function layout_block_remove_page(Layout $layout, Block $block, $renderer_name) {
  if (backdrop_get_token('layout-' . $layout->name) !== $_GET['token']) {
    return MENU_ACCESS_DENIED;
  }

  $layout->removeBlock($block->uuid);
  layout_set_layout_tempstore($layout);

  if (backdrop_is_ajax()) {
    $commands[] = ajax_command_remove('#layout-editor-block-' . $block->uuid);
    return array(
      '#type' => 'ajax',
      '#commands' => $commands,
    );
  }
  else {
    backdrop_set_message(t('Block "@title" removed.', array('@title' => $block->getAdminTitle())));
    backdrop_goto('admin/structure/layouts/manage/' . $layout->name);
  }
}


/**
 * Form callback; Displays form for adding new conditions to a layout or block.
 *
 * @param Layout $layout
 *   The layout to which a condition is being added.
 * @param Block|null $block
 *   If applying a condition to a particular block, the block instance.
 * @param LayoutMenuItem|null $menu_item
 *   If applying a condition to an menu item, the menu item object.
 * @param int|null $condition_id
 *   The integer ID of the condition being configured. If adding a new
 *   condition, no value will be passed in. Note that this value may be a
 *   FALSE-like value, such as 0, indicating the first condition is being
 *   configured, which is different than a NULL value indicating a new
 *   condition is being added.
 *
 * @ingroup forms
 */
function layout_condition_add_form($form, &$form_state, Layout $layout = NULL, Block $block = NULL, LayoutMenuItem $menu_item = NULL, $condition_id = NULL) {
  form_load_include($form_state, 'inc', 'layout', 'layout.admin');
  $form_state['layout'] = $layout;
  $form_state['block'] = $block;
  $form_state['menu_item'] = $menu_item;
  $form_state['condition_id'] = $condition_id;

  // Condition position may be a zero-value. Use a clear variable for checking
  // the add vs. configure existing status.
  $is_new_condition = TRUE;
  if (isset($condition_id)) {
    $is_new_condition = FALSE;
  }
  // Specify the default value of the current condition if configuring an
  // existing condition.
  if (!isset($form_state['values']['condition'])) {
    $form_state['values']['condition'] = $condition_id;
  }

  $handler = NULL;
  if (isset($menu_item)) {
    $form['#redirect'] = 'admin/structure/layouts/menu/' . $menu_item->name . '/access';
    if ($is_new_condition) {
      $form['#title'] = t('Add visibility condition');
      $help = t('Add a new visibility condition to restrict access to all layouts at this path.');
    }
    else {
      $form['#title'] = t('Configure visibility condition');
      $help = t('Configure this visibility condition to restrict access to all layouts on this path.');
    }
    $handler = isset($menu_item->conditions[$condition_id]) ? $menu_item->conditions[$condition_id] : NULL;
  }
  elseif (isset($block)) {
    $form['#redirect'] = 'admin/structure/layouts/manage/' . $layout->name;
    if ($is_new_condition) {
      $form['#title'] = t('Add visibility condition for "!title" block', array('!title' => $block->getAdminTitle()));
      $help = t('Add a new visibility condition to limit the situations in which this block will be shown.');
    }
    else {
      $form['#title'] = t('Configure visibility condition for "!title" block', array('!title' => $block->getAdminTitle()));
      $help = t('Configure this visibility condition to limit the situations in which this block will be shown.');
    }
    $handler = isset($block->conditions[$condition_id]) ? $block->conditions[$condition_id] : NULL;
  }
  else {
    $form['#redirect'] = 'admin/structure/layouts/manage/' . $layout->name . '/configure';
    if ($is_new_condition) {
      $form['#title'] = t('Add visibility condition for "@title" layout', array('@title' => $layout->title));
      $help = t('Add a new visibility condition to limit the situations in which this layout will apply.');
    }
    else {
      $form['#title'] = t('Configure visibility condition for "@title" layout', array('@title' => $layout->title));
      $help = t('Configure this visibility condition to limit the situations in which this layout will apply.');
    }
    $handler = isset($layout->conditions[$condition_id]) ? $layout->conditions[$condition_id] : NULL;
  }
  $form['help'] = array(
    '#markup' => '<p>' . $help . '</p>',
  );
  $all_access_info = _layout_get_all_info('layout_access');
  backdrop_sort($all_access_info, array('title'));
  $form['condition'] = array(
    '#type' => 'select',
    '#title' => t('Visibility condition'),
    '#options' => array(),
    '#required' => TRUE,
    '#default_value' => isset($handler->plugin) ? $handler->plugin : NULL,
    '#parents' => array('condition'),
    '#ajax' => array(
      'wrapper' => 'condition_settings',
      'callback' => 'layout_condition_ajax_style',
    ),
  );
  foreach ($all_access_info as $access_info) {
    $required_contexts = !empty($access_info['required contexts']) ? $access_info['required contexts'] : array();
    $layout_has_context = $layout && $layout->hasContexts($required_contexts);
    $menu_item_has_context = $menu_item && $menu_item->hasContexts($required_contexts);
    if (empty($required_contexts) || $layout_has_context || $menu_item_has_context) {
      $form['condition']['#options'][$access_info['name']] = $access_info['title'];
    }
  }

  $form['condition_settings'] = array(
    '#type' => 'container',
    '#id' => 'condition_settings',
    '#parents' => array('condition_settings'),
  );
  $form['condition_settings']['content'] = layout_condition_return_form($form['condition_settings'], $form_state);
  $form['actions'] = array(
    '#type' => 'actions',
  );
  $form['load_condition_nojs'] = array(
    '#type' => 'submit',
    '#value' => t('Load condition'),
    '#submit' => array(
      'layout_condition_add_load_condition_nojs',
    ),
    '#attributes' => array(
      'class' => array('js-hide'),
    ),
  );
  $form['actions']['add'] = array(
    '#type' => 'submit',
    '#value' => $is_new_condition ? t('Add visibility condition') : t('Save visibility condition'),
    '#submit' => array(
      'layout_condition_add_form_submit',
    ),
    '#validate' => array(
      'layout_condition_add_form_validate',
    ),
    '#ajax' => array(
      'callback' => 'layout_ajax_form_save_dialog',
    ),
  );
  $form['actions']['cancel'] = array(
    '#type' => 'submit',
    '#value' => t('Cancel'),
    '#limit_validation_errors' => array(),
    '#submit' => array(
      'layout_condition_add_form_cancel',
    ),
    '#ajax' => array(
      'callback' => 'layout_ajax_condition_cancel_dialog',
    ),
  );
  return $form;
}

/**
 * Submit handler for the cancel button on layout_condition_add_form().
 */
function layout_condition_add_form_cancel($form, &$form_state) {
  if (isset($form_state['block'])) {
    /* @var Block $block */
    $block = $form_state['block'];
    /* @var Layout $layout */
    $layout = $form_state['layout'];
    $renderer_name = isset($layout->in_progress['renderer_name']) ? $layout->in_progress['renderer_name'] : 'editor';
    $renderer = layout_create_renderer($renderer_name, $layout);
    $form_state['redirect'] = $renderer->getUrl('configure-block', $block->uuid);
  }
}

/**
 * AJAX callback to update the condition settings.
 */
function layout_condition_ajax_style($form, $form_state) {
  return $form['condition_settings'];
}

/**
 * Submit handler to select a condition. Hidden when JavaScript is enabled.
 */
function layout_condition_add_load_condition_nojs($form, &$form_state) {
  $form_state['rebuild'] = TRUE;
}

/**
 * AJAX handler that cancels the condition edit dialog.
 */
function layout_ajax_condition_cancel_dialog($form, $form_state) {
  $commands = array();
  $commands[] = ajax_command_close_modal_dialog();

  // Reload the block configure dialog if editing block conditions.
  if (!empty($form_state['redirect'])) {
    $dialog_ajax = layout_ajax_form_open_dialog($form, $form_state);
    $commands = array_merge($commands, $dialog_ajax['#commands']);
  }

  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * Helper function to return a partial condition settings form.
 *
 * This can be used to add a condition to either a layout, block, or menu item,
 * based on the values in the $form_state parameter.
 */
function layout_condition_return_form($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var Block $block */
  $block = $form_state['block'];
  /* @var LayoutMenuItem $menu_item */
  $menu_item = $form_state['menu_item'];
  $condition_id = $form_state['condition_id'];

  // If no condition has yet been selected, there is no sub-form to display.
  if (!isset($form_state['values']['condition'])) {
    return array();
  }
  else {
    $handler_id = $form_state['values']['condition'];
  }

  if (isset($condition_id)) {
    if ($menu_item) {
      $handler = &$menu_item->conditions[$condition_id];
    }
    elseif ($block) {
      $handler = &$block->conditions[$condition_id];
    }
    else {
      $handler = &$layout->conditions[$condition_id];
    }

    // Update the condition in the same place if the type of condition has
    // changed entirely (note the $handler is assigned by reference above).
    if (!is_numeric($handler_id) && $condition_id != $handler_id) {
      $handler = layout_create_access($handler_id);
    }
  }
  else {
    $handler = layout_create_access($handler_id);
    $handler->is_new = TRUE;
  }

  $form['#title'] = layout_condition_edit_title($layout, $block, $menu_item, $handler_id);
  $form_state['layout'] = $layout;
  $form_state['block'] = $block;
  $form_state['menu_item'] = $menu_item;
  $form_state['handler'] = $handler;
  $handler->form($form, $form_state);

  return $form;
}

/**
 * Validation handler for layout_condition_add_form().
 */
function layout_condition_add_form_validate($form, &$form_state) {
  if (isset($form_state['handler'])) {
    /* @var LayoutAccess $handler */
    $handler = $form_state['handler'];
    $handler->formValidate($form, $form_state);
  }
}

/**
 * Submit handler for layout_condition_add_form().
 *
 * Saves a condition into the layout, block, or menu item.
 */
function layout_condition_add_form_submit($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var Block $block */
  $block = $form_state['block'];
  /* @var LayoutMenuItem $menu_item */
  $menu_item = $form_state['menu_item'];

  if (!isset($form_state['handler'])) {
    return;
  }
  /* @var LayoutAccess $handler */
  $handler = $form_state['handler'];
  $handler->formSubmit($form, $form_state);
  if (!empty($handler->is_new)) {
    $handler->is_new = FALSE;
    if ($menu_item) {
      $menu_item->conditions[] = $handler;
    }
    elseif ($block) {
      $block->conditions[] = $handler;
    }
    else {
      $layout->conditions[] = $handler;
    }
  }
  if ($menu_item) {
    layout_set_layout_tempstore($menu_item, 'menu_item');
  }
  else {
    layout_set_layout_tempstore($layout);
  }

  // Update the portion of the page for menu item access.
  if ($menu_item) {
    $form_state['ajax_rebuild_form'] = 'layout_menu_item_form';
    $form_state['ajax_rebuild_args'] = array($menu_item);
    $form_state['ajax_update'] = array('conditions');
    $form_state['redirect'] = 'admin/structure/layouts/menu/' . $menu_item->name;
  }
  // Blocks return to the dialog/page for editing that block.
  elseif ($block) {
    $renderer_name = isset($layout->in_progress['renderer_name']) ? $layout->in_progress['renderer_name'] : 'editor';
    $renderer = layout_create_renderer($renderer_name, $layout);
    $form_state['redirect'] = $renderer->getUrl('configure-block', $block->uuid);
  }
  // Set the portion of the page to be updated for layouts.
  else {
    $form_state['ajax_rebuild_form'] = 'layout_settings_form';
    $form_state['ajax_rebuild_args'] = array($layout);
    $form_state['ajax_update'] = array('conditions');
    $form_state['redirect'] = 'admin/structure/layouts/manage/' . $layout->name . '/configure';
  }
}

/**
 * Title callback; Provide the page title for configuring a layout condition.
 */
function layout_condition_edit_title(Layout $layout = NULL, Block $block = NULL, LayoutMenuItem $menu_item = NULL, $handler_id) {
  if (isset($menu_item->conditions[$handler_id])) {
    $plugin_name = $menu_item->conditions[$handler_id]->plugin;
  }
  elseif (isset($block->conditions[$handler_id])) {
    $plugin_name = $block->conditions[$handler_id]->plugin;
  }
  elseif (isset($layout->conditions[$handler_id])) {
    $plugin_name = $layout->conditions[$handler_id]->plugin;
  }
  else {
    $plugin_name = $handler_id;
  }
  $access_info = layout_get_access_info($plugin_name);
  if (isset($access_info['title'])) {
    if ($menu_item) {
      return t('Configure condition "@condition" for "@title"', array('@condition' => $access_info['title'], '@title' => $menu_item->path));
    }
    elseif ($block) {
      return t('Configure condition "@condition" for "@title"', array('@condition' => $access_info['title'], '@title' => $block->getAdminTitle()));
    }
    else {
      return t('Configure condition "@condition"', array('@condition' => $access_info['title']));
    }
  }
}

/**
 * Menu callback; Enable or disable a layout.
 */
function layout_enable_layout($status, Layout $layout) {
  if (backdrop_get_token('layout-' . $layout->name) !== $_GET['token']) {
    return MENU_ACCESS_DENIED;
  }

  if ($status) {
    $layout->enable();
    backdrop_set_message(t('Layout "@title" enabled.', array('@title' => $layout->title)));
  }
  else {
    $layout->disable();
    backdrop_set_message(t('Layout "@title" disabled.', array('@title' => $layout->title)));
  }
  backdrop_goto('admin/structure/layouts');
}

/**
 * Reorder the order of layouts at the same path.
 *
 * @ingroup forms
 */
function layout_reorder_form($form, &$form_state) {
  if (!isset($form_state['layouts'])) {
    $layout_list = isset($_GET['layouts']) ? $_GET['layouts'] : array();
    $layouts = array();
    if (is_array($layout_list)) {
      $layouts = layout_load_multiple($layout_list);
    }
    $form_state['layouts'] = $layouts;
  }

  $layouts = $form_state['layouts'];
  $form['#tree'] = TRUE;

  // Sanity check.
  if (empty($layouts)) {
    backdrop_set_message(t('No layouts specified to reorder.'));
    return $form;
  }

  $form['help'] = array(
    '#markup' => '<p class="help">' . t('Layouts at the same path are selected based on the first layout that matches its conditions. Reorder the layouts on this page to affect the layout that will be used first.') . '</p>',
  );

  $form['layouts'] = array(
    '#theme' => 'layout_reorder_layouts',
  );

  $layout_count = count($layouts);
  foreach ($layouts as $layout) {
    $form['layouts'][$layout->name]['title'] = array(
      '#markup' => check_plain($layout->title),
    );
    $form['layouts'][$layout->name]['weight'] = array(
      '#type' => 'weight',
      '#delta' => $layout_count,
      '#default_value' => $layout->weight,
    );
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save order'),
  );

  return $form;
}

/**
 * Submit handler for layout_reorder_form().
 */
function layout_reorder_form_submit(&$form, &$form_state) {
  foreach ($form_state['layouts'] as $name => $layout) {
    $layout->weight = (int) $form_state['values']['layouts'][$name]['weight'];
    $layout->save();
  }
  backdrop_set_message(t('Layout order saved.'));
  $form_state['redirect'] = 'admin/structure/layouts';
}

/**
 * Menu callback; Break a lock on a layout or menu item.
 *
 * @param $item
 *   Either a Layout or LayoutMenuItem object, which is currently being edited.
 * @param string $type
 *   The type of Layout item, either "layout" or "menu_item".
 *
 * @see layout_locked_message()
 */
function layout_break_lock_page($item, $type = 'layout') {
  if (backdrop_get_token($type . '-' . $item->name) !== $_GET['token']) {
    return MENU_ACCESS_DENIED;
  }

  layout_clear_layout_tempstore($item->name, $type);
  backdrop_set_message(t('The lock has been cleared and all changes discarded. You may now make changes to this page.'));
  backdrop_goto();
}

/**
 * Prepare a message and link based on if a layout item is updated or locked.
 *
 * @see layout_break_lock_page()
 */
function layout_locked_message($item, $type = 'layout') {
  global $user;

  // The path varies based on the item type.
  $path_type = 'manage';
  $button_title = 'Save layout';
  if ($type === 'menu_item') {
    $path_type = 'menu';
    $button_title = 'Save menu settings';
  }

  $message = '';
  if (!empty($item->locked) && $user->uid !== $item->locked['uid']) {
    $account = user_load($item->locked['uid']);
    $lock_user = theme('username', array('account' => $account));
    $lock_age = format_interval(REQUEST_TIME - $item->locked['updated']);
    $lock_break_url = url('admin/structure/layouts/' . $path_type . '/' . $item->name . '/break-lock', array('query' => array('token' => backdrop_get_token($type . '-' . $item->name)) + backdrop_get_destination()));
    $message = t('Settings on this page are being edited by user !user, and is therefore locked from editing by others. This lock is !age old. Click here to <a href="!break">break this lock</a>.',  array('!user' => $lock_user, '!age' => $lock_age, '!break' => $lock_break_url));
  }
  elseif (!empty($item->locked['updated'])) {
    $message = t('This form has unsaved changes. Click "@button" to make changes permanent or "Cancel" to discard changes.', array('@button' => $button_title));
  }

  return $message;
}

/**
 * Form callback; Copy an existing layout into a new layout.
 *
 * @ingroup forms
 */
function layout_clone_form($form, &$form_state, $layout) {
  $layout_clone = $layout->getClone();

  $settings_form = layout_settings_form($form, $form_state, $layout_clone);
  $form['title'] = $settings_form['title'];
  $form['name'] = $settings_form['name'];

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Clone layout'),
  );

  return $form;
}

/**
 * Submit handler for layout_clone_form().
 */
function layout_clone_form_submit($form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  $layout->title = $form_state['values']['title'];
  $layout->name = $form_state['values']['name'];
  $layout->save();

  // Redirect to the full settings form.
  $form_state['redirect'] = array(
    'admin/structure/layouts/manage/' . $layout->name . '/configure',
    array('query' => array('destination' => 'admin/structure/layouts/manage/' . $layout->name)),
  );
  backdrop_set_message(t('Cloned layout @title created. You may now configure the cloned layout.', array('@title' => $layout->title)));
}

/**
 * Form callback; Delete a layout.
 *
 * @ingroup forms
 */
function layout_delete_form($form, &$form_state, $layout) {
  $form_state['layout'] = $layout;

  if ($layout->storage === LAYOUT_STORAGE_NORMAL) {
    $question = t('Delete layout @title?', array('@title' => $layout->title));
    $text = t('Are you sure you want to delete this layout? Deleting a layout cannot be undone.');
    $button_text = t('Delete layout');
  }
  else {
    $question = t('Revert layout @title?', array('@title' => $layout->title));
    $text = t('Reverting the layout will delete any changes, reverting it to the original default layout provided by the %module module.', array('%module' => $layout->module));
    $button_text = t('Revert layout');
  }

  return confirm_form($form, $question, 'admin/structure/layouts', $text, $button_text);
}

/**
 * Submit handler for layout_delete_form(). Deletes a layout.
 */
function layout_delete_form_submit(&$form, &$form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];

  if ($layout->storage === LAYOUT_STORAGE_NORMAL) {
    $layout->delete();
    backdrop_set_message(t('The layout has been deleted.'));
  }
  else {
    $layout->revert();
    backdrop_set_message(t('The layout has been reverted.'));
  }
  $form_state['redirect'] = 'admin/structure/layouts';
}

/**
 * Form callback; Configure a layout menu item.
 *
 * @ingroup forms
 */
function layout_menu_item_form($form, &$form_state, LayoutMenuItem $menu_item) {
  form_load_include($form_state, 'inc', 'layout', 'layout.admin');

  $form_state['menu_item'] = $menu_item;

  $form['#tree'] = TRUE;
  $form['#attached']['js'][] = backdrop_get_path('module', 'layout') . '/js/layout.admin.js';
  $form['#attached']['css'][] = backdrop_get_path('module', 'layout') . '/css/layout.admin.css';

  $messages = array();
  if ($menu_item->locked) {
    $messages['warning'] = array(
      layout_locked_message($menu_item, 'menu_item'),
    );
  }
  $form['messages'] = array(
    '#theme' => 'status_messages',
    '#messages' => $messages,
    '#weight' => -100,
    // Prefix/suffix used to identify in AJAX requests.
    '#prefix' => '<div id="layout-messages">',
    '#suffix' => '</div>',
  );

  $menu_settings = $menu_item->menu;

  $form['menu']['type'] = array(
    '#title' => t('Type'),
    '#type' => 'radios',
    '#options' => array(
      'none' => t('No menu entry'),
      'normal' => t('Normal menu entry'),
      'tab' => t('Menu tab'),
      'default tab' => t('Default menu tab'),
      'action' => t('Local action'),
    ),
    '#default_value' => $menu_settings['type'],
  );

  $form['menu']['title'] = array(
    '#title' => t('Title'),
    '#type' => 'textfield',
    '#default_value' => $menu_settings['title'],
    '#description' => t('If set to normal or tab, enter the text to use for the menu item.'),
    '#states' => array(
      'invisible' => array(
        ':input[name="menu[type]"]' => array('value' => 'none'),
      ),
    ),
  );

  // Only display the menu selector if menu module is enabled.
  if (module_exists('menu')) {
    $form['menu']['name'] = array(
      '#title' => t('Menu'),
      '#type' => 'select',
      '#options' => menu_get_menus(),
      '#default_value' => $menu_settings['name'],
      '#description' => t('Insert item into an available menu.'),
      '#states' => array(
        'visible' => array(
          ':input[name="menu[type]"]' => array('value' => 'normal'),
        ),
      ),
    );
  }
  else {
    $form['menu']['name'] = array(
      '#type' => 'value',
      '#value' => $menu_settings['name'],
    );
    $form['menu']['markup'] = array(
      '#value' => t('Menu selection requires the activation of menu module.'),
    );
  }
  $form['menu']['weight'] = array(
    '#title' => t('Weight'),
    '#type' => 'number',
    '#default_value' => isset($menu_settings['weight']) ? $menu_settings['weight'] : 0,
    '#description' => t('The lower the weight the higher/further left it will appear.'),
    '#states' => array(
      'invisible' => array(
        ':input[name="menu[type]"]' => array('value' => 'none'),
      ),
    ),
  );

  $form['menu']['parent'] = array(
    '#type' => 'fieldset',
    '#title' => t('Parent menu item'),
    '#states' => array(
      'visible' => array(
        ':input[name="menu[type]"]' => array('value' => 'default tab'),
      ),
    ),
  );
  $form['menu']['parent']['type'] = array(
    '#title' => t('Parent menu item'),
    '#title_display' => 'none',
    '#type' => 'radios',
    '#options' => array('none' => t('No menu entry'), 'normal' => t('Normal menu item'), 'tab' => t('Menu tab')),
    '#default_value' => $menu_settings['parent']['type'],
    '#description' => t('When providing a menu item as a default tab, the parent menu item of that tab must be specified. Sometimes the parent will already exist, but other times you will need to have one created. The path of a parent item will always be the same path with the last part left off. i.e, if the path to this layout is <em>foo/bar/baz</em>, the parent path would be <em>foo/bar</em>.'),
  );
  $form['menu']['parent']['title'] = array(
    '#title' => t('Parent item title'),
    '#type' => 'textfield',
    '#default_value' => $menu_settings['parent']['title'],
    '#description' => t('If creating a parent menu item, enter the title of the item.'),
    '#states' => array(
      'invisible' => array(
        ':input[name="menu[parent][type]"]' => array('value' => 'none'),
      ),
    ),
  );
  // Only display the menu selector if menu module is enabled.
  if (module_exists('menu')) {
    $form['menu']['parent']['name'] = array(
      '#title' => t('Parent item menu'),
      '#type' => 'select',
      '#options' => menu_get_menus(),
      '#default_value' => $menu_settings['parent']['name'],
      '#description' => t('Insert item into an available menu.'),
      '#states' => array(
        'visible' => array(
          ':input[name="menu[parent][type]"]' => array('value' => 'normal'),
        ),
      ),
    );
  }
  else {
    $form['menu']['parent']['name'] = array(
      '#type' => 'value',
      '#value' => $menu_settings['parent']['name'],
    );
  }
  $form['menu']['parent']['weight'] = array(
    '#title' => t('Item weight'),
    '#type' => 'textfield',
    '#default_value' => $menu_settings['parent']['weight'],
    '#size' => 5,
    '#description' => t('Enter the weight of the menu item or tab. The lower the number, the earlier in the list it will be.'),
    '#states' => array(
      'invisible' => array(
        ':input[name="menu[parent][type]"]' => array('value' => 'none'),
      ),
    ),
  );

  $form['conditions'] = array(
    '#title' => t('Access conditions'),
    '#type' => 'item',
    '#description' => t('Conditions set at the menu level will prevent access to the entire page and all layouts configured in it.'),
    '#id' => 'layout-access',
  );
  $form['conditions']['active'] = array(
    '#type' => 'container',
    '#theme' => 'layout_conditions',
    '#attributes' => array('class' => array('layout-access-list')),
  );
  foreach ($menu_item->conditions as $access_key => $menu_access) {
    $form['conditions']['active'][$access_key] = array(
      '#type' => 'container',
      '#attributes' => array('class' => array('layout-condition')),
      '#id' => NULL,
    );
    $form['conditions']['active'][$access_key]['label'] = array(
      '#markup' => $menu_access->summary(),
    );
    $form['conditions']['active'][$access_key]['remove'] = array(
      '#type' => 'submit',
      '#value' => t('Remove'),
      '#attributes' => array('class' => array('layout-link-button', 'layout-access-remove')),
      '#submit' => array(
        'layout_menu_item_form_condition_remove',
      ),
      '#ajax' => array(
        'callback' => 'layout_ajax_form_update',
      ),
      '#name' => 'conditions[' . $access_key . '][remove]',
    );
    $form['conditions']['active'][$access_key]['configure'] = array(
      '#type' => 'submit',
      '#value' => t('Configure'),
      '#attributes' => array('class' => array('layout-link-button', 'layout-access-configure')),
      '#submit' => array(
        'layout_menu_item_form_condition_edit',
      ),
      '#ajax' => array(
        'callback' => 'layout_ajax_form_open_dialog',
      ),
      '#name' => 'conditions[' . $access_key . '][configure]',
    );
  }
  $form['conditions']['add'] = array(
    '#type' => 'submit',
    '#value' => t('Add visibility condition'),
    '#attributes' => array('class' => array('layout-link-button', 'layout-access-add')),
    '#submit' => array(
      'layout_menu_item_form_condition_add'
    ),
    '#ajax' => array(
      'callback' => 'layout_ajax_form_open_dialog',
    ),
    '#prefix' => '<ul class="action-links"><li>',
    '#suffix' => '</li></ul>',
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save menu settings'),
  );

  if (isset($menu_item->locked)) {
    $form['actions']['reset'] = array(
      '#type' => 'submit',
      '#value' => t('Cancel'),
      '#limit_validation_errors' => array(array('actions', 'reset')),
      '#validate' => array(),
      '#submit' => array(
        'layout_menu_item_form_reset',
      ),
    );
  }

  return $form;
}

/**
 * Form callback; Configure a layout menu item.
 */
function layout_menu_item_form_submit($form, &$form_state) {
  /* @var LayoutMenuItem $menu_item */
  $menu_item = $form_state['menu_item'];

  // Update the menu settings. Conditions are added already through tempstore.
  $menu_item->menu = $form_state['values']['menu'];
  $menu_item->save();

  layout_clear_layout_tempstore($menu_item->name, 'menu_item');
  backdrop_set_message(t('Menu settings saved for @path.', array('@path' => $menu_item->path)));
  $form_state['redirect'] = 'admin/structure/layouts';
}

/**
 * AJAX handler for layout_settings_form() the returns updated contexts.
 */
function layout_menu_item_form_path_ajax($form, &$form_state) {
  return $form['context_wrapper'];
}

/**
 * Submit handler for layout_settings_form() that lets the user add a condition.
 */
function layout_menu_item_form_condition_add($form, &$form_state) {
  $form_state['redirect'] = 'admin/structure/layouts/menu/' . $form_state['menu_item']->name . '/condition/add';
}

/**
 * Submit handler for layout_settings_form() that removes a condition.
 */
function layout_menu_item_form_condition_remove($form, &$form_state) {
  $removed_condition = $form_state['clicked_button']['#array_parents'][2];
  unset($form_state['menu_item']->conditions[$removed_condition]);
  layout_set_layout_tempstore($form_state['menu_item'], 'menu_item');

  $form_state['ajax_update'] = array('conditions');
}

/**
 * Submit handler for layout_settings_form() that edits an condition.
 */
function layout_menu_item_form_condition_edit($form, &$form_state) {
  $edit_condition = $form_state['clicked_button']['#array_parents'][2];
  $form_state['redirect'] = 'admin/structure/layouts/menu/' . $form_state['menu_item']->name . '/condition/edit/' . $edit_condition;
}

/**
 * Submit handler for layout_menu_item_form() that resets in-progress changes.
 */
function layout_menu_item_form_reset($form, &$form_state) {
  $menu_item = $form_state['menu_item'];
  layout_clear_layout_tempstore($menu_item->name, 'menu_item');
  backdrop_set_message(t('Menu item changes discarded.'));
  $form_state['redirect'] = 'admin/structure/layouts';
}

/**
 * Partial form to generate a select list for selecting context.
 *
 * @param LayoutContext[] $available_contexts
 *   An array of contexts from a layout, as retrieved by Layout::getContexts().
 * @param array $info
 *   An array of block or condition info, as provided by
 *   layout_get_access_info() or layout_get_block_info(). The list of required
 *   contexts is pulled from here (if any).
 * @param array $current_context_settings
 *   An array of current context settings, used for populating the defaults.
 *
 * @return array
 *   The partial form element.
 */
function layout_contexts_form_element(array $available_contexts, array $current_context_settings, array $info) {
  $element = array(
    '#tree' => TRUE,
    '#weight' => -20,
  );
  if (isset($info['required contexts'])) {
    foreach ($info['required contexts'] as $context_key => $context_type) {
      if (isset($info['required contexts labels'][$context_key])) {
        $label = $info['required contexts labels'][$context_key];
      }
      else {
        $context_info = layout_get_context_info($context_type);
        $label = $context_info['title'];
      }
      $options = array();
      foreach ($available_contexts as $layout_context_key => $context) {
        if ($context->plugin === $context_type) {
          $options[$layout_context_key] = $context->label();
        }
      }
      if (count($options) > 1) {
        $element[$context_key] = array(
          '#type' => 'select',
          '#title' => check_plain($label),
          '#default_value' => isset($current_context_settings[$context_key]) ? $current_context_settings[$context_key] : NULL,
          '#options' => $options,
        );
      }
    }
  }
  return $element;
}

/**
 * AJAX handler that opens a form in a dialog.
 *
 * This AJAX handler is used both on the layout settings form and the layout
 * content form.
 *
 * @see layout_settings_form()
 * @see layout_block_configure_form()
 */
function layout_ajax_form_open_dialog($form, &$form_state) {
  // Ensure that no errors have occurred before opening the dialog.
  if (form_get_errors()) {
    $commands[] = ajax_command_remove('#messages');
    $commands[] = ajax_command_html('#layout-messages', theme('status_messages'));
  }
  else {
    // Get the dialog path as set in the redirect.
    $dialog_path = $form_state['redirect'];
    $page_callback_result = NULL;
    if ($router_item = menu_get_item($dialog_path)) {
      if ($router_item['access']) {
        if ($router_item['include_file']) {
          require_once BACKDROP_ROOT . '/' . $router_item['include_file'];
        }
        $page_callback_result = call_user_func_array($router_item['page_callback'], $router_item['page_arguments']);
      }
    }
    $html = is_string($page_callback_result) ? $page_callback_result : backdrop_render($page_callback_result);
    if (isset($page_callback_result['#title'])) {
      $title = $page_callback_result['#title'];
    }
    else {
      $title = $router_item['title'];
    }
    $commands[] = ajax_command_open_modal_dialog($title, $html, array('dialogClass' => 'layout-dialog'));
  }

  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * AJAX handler that saves a form in a dialog and updates the underlying form.
 *
 * This is meant for generic use. It depends on a few variables in $form_state:
 *   - $form_state['ajax_rebuild_form']: The function name that builds the
 *     underlying form that will be updated.
 *   - $form_state['ajax_update']: An array of keys representing the portion
 *     of the form that should be updated.
 *   - $form_state['redirect']: If specified, the redirect location will be
 *     opened as a dialog, acting as a tool to open a sequence of forms in
 *     dialogs.
 *
 * @see layout_ajax_form_update()
 */
function layout_ajax_form_save_dialog($form, $form_state) {
  /* @var Layout $layout */
  $layout = $form_state['layout'];
  /* @var LayoutMenuItem $menu_item */
  $menu_item = isset($form_state['menu_item']) ? $form_state['menu_item']  : '';

  $commands = array();
  $commands[] = ajax_command_close_modal_dialog();

  // If errors occurred in the dialog, show messages and re-display.
  if (form_get_errors()) {
    $html = '';
    $html .= theme('status_messages');
    $html .= backdrop_render($form);
    $title = isset($form['#title']) ? $form['#title'] : backdrop_get_title();
    $commands[] = ajax_command_open_modal_dialog($title, $html, array('dialogClass' => 'layout-dialog'));
  }
  else {
    // If there is a part of the page that needs to be updated, update it.
    if (!empty($form_state['ajax_update'])) {
      $update_ajax = layout_ajax_form_update($form, $form_state);
      $commands = array_merge($commands, $update_ajax['#commands']);
    }

    // If there is a second action that needs to be executed, open the next page.
    elseif (!empty($form_state['redirect'])) {
      $dialog_ajax = layout_ajax_form_open_dialog($form, $form_state);
      $commands = array_merge($commands, $dialog_ajax['#commands']);
    }

    // Clear out previous messages.
    if ($message = layout_locked_message($layout, 'layout')) {
      backdrop_set_message($message, 'warning');
    }
    elseif ($message = layout_locked_message($menu_item, 'menu_item')) {
      backdrop_set_message($message, 'warning');
    }
    $commands[] = ajax_command_remove('#messages');
    $commands[] = ajax_command_html('#layout-messages', theme('status_messages'));
  }

  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

function layout_ajax_form_save_title_dialog($form, $form_state) {
  $layout = $form_state['layout'];

  $commands = array();
  $commands[] = ajax_command_close_modal_dialog();

  // If errors occurred in the dialog, show messages and re-display.
  if (form_get_errors()) {
    $html = '';
    $html .= theme('status_messages');
    $html .= backdrop_render($form);
    $title = isset($form['#title']) ? $form['#title'] : backdrop_get_title();
    $commands[] = ajax_command_open_modal_dialog($title, $html, array('dialogClass' => 'layout-dialog'));
  }
  else {
    // Rebuild the title area description.
    $description = '<span class="description">' . layout_get_title_description($layout) . '</span>';
    $commands[] = ajax_command_replace("#layout-editor-title .description", $description);

    // Clear out previous messages.
    if ($message = layout_locked_message($layout, 'layout')) {
      backdrop_set_message($message, 'warning');
    }
    elseif ($message = layout_locked_message($menu_item, 'menu_item')) {
      backdrop_set_message($message, 'warning');
    }
    $commands[] = ajax_command_remove('#messages');
    $commands[] = ajax_command_html('#layout-messages', theme('status_messages'));
  }

  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * AJAX handler that updates a portion of the form.
 *
 * This is meant for generic use. It depends on a few variables in $form_state:
 *   - $form_state['ajax_rebuild_form']: The function name that builds the
 *     form that will be updated.
 *   - $form_state['ajax_update']: An array of keys representing the portion
 *     of the form that should be updated.
 */
function layout_ajax_form_update($form, $form_state) {
  if (!isset($form_state['ajax_update'])) {
    return NULL;
  }

  // If updating an entirely different form, build the form and pull out the new
  // pieces.
  if (isset($form_state['ajax_rebuild_form'])) {
    $form_state += array(
      'ajax_rebuild_args' => array(),
    );
    $args = array_merge(array($form_state['ajax_rebuild_form']), $form_state['ajax_rebuild_args']);
    $replace_form = call_user_func_array('backdrop_get_form', $args);
  }
  // Or if just rebuilding the current form, rebuild it directly.
  else {
    $replace_form = backdrop_rebuild_form($form['#form_id'], $form_state, $form);
  }

  // Remove any ID incrementation that could happen on the form ID.
  $form_id = preg_replace('/--\d$/', '', $replace_form['#id']);
  $build_id = backdrop_render($replace_form['form_build_id']);

  // Narrow down the form to just the part that will be replaced.
  $replace_portion = $form_state['ajax_update'];
  foreach ($replace_portion as $parent) {
    if (isset($replace_form[$parent])) {
      $replace_form = $replace_form[$parent];
    }
    else {
      $replace_form = FALSE;
      break;
    }
  }

  $commands = array();
  if ($replace_form) {
    // Update the portion of the form.
    $html = backdrop_render($replace_form);
    $commands[] = ajax_command_replace('#' . $replace_form['#id'], $html);
    // And update the build ID so these new values are included when saving.
    $commands[] = ajax_command_replace('#' . $form_id . ' input[name="form_build_id"]', $build_id);
  }
  else {
    // @todo: Provide an error message if the target is not found.
  }

  return array('#type' => 'ajax', '#commands' => $commands);
}

/**
 * Administrative form for layout settings.
 */
function layout_settings_page($form, &$form_state) {
  backdrop_set_title(t('Layout settings'));
  $excluded = config_get('layout.settings', 'excluded_templates');

  $form = array();

  $form['#attached']['js'][] = backdrop_get_path('module', 'layout') . '/js/layout.admin.js';
  $form['#attached']['css'][] = backdrop_get_path('module', 'layout') . '/css/layout.admin.css';
  $form['#attributes']['class'] = array('layout-settings-page');

  // Get the list of layout template options.
  $all_layout_info = layout_get_layout_template_info();
  $options = array();
  $default = array();
  $form_state['hidden_templates'] = array();
  foreach ($all_layout_info as $template_name => $template_info) {
    // Build the default values list.
    if (!in_array($template_name, $excluded)) {
      $default[] = $template_name;
    }

    // Build the list of possible options, either enabled or not hidden.
    if (in_array($template_name, $default) || !$template_info['hidden']) {
      $options[$template_name] = theme('layout_template_option', array('template_info' => $template_info));
    }
    // For disabled and hidden templates, save the fact they are disabled.
    elseif ($template_info['hidden']) {
      $form_state['hidden_templates'][] = $template_name;
    }
  }

  $form['templates'] = array(
    '#title' => t('Available layout templates'),
    '#description' => t('Only templates that are selected here will be available when configuring layouts.'),
    '#type' => 'checkboxes',
    '#default_value' => $default,
    '#options' => $options,
    '#wrapper_attributes' => array('class' => array('clearfix', 'layout-options')),
  );

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  return $form;
}

/**
 * Validation for layout settings page.
 *
 * Ensures that active layouts are not disabled while in use.
 */
function layout_settings_page_validate(&$form, &$form_state) {
  $options = array_keys($form_state['values']['templates']);
  $included = array_values($form_state['values']['templates']);
  $excluded = array_unique(array_diff($options, $included));
  $form_state['excluded_templates'] = array_values(array_merge($excluded, $form_state['hidden_templates']));

  // Ensure all layouts are not disabled.
  if (empty($form_state['values']['templates'])) {
    form_set_error('templates', t('At least one layout template must be enabled.'));
  }

  // Check which layout templates are in use.
  foreach (layout_load_all() as $layout) {
    $info = layout_get_layout_template_info($layout->layout_template);
    if (in_array($layout->layout_template, $excluded)) {
      form_set_error('templates', t('The "@layout" layout template is currently in use and may not be excluded.', array('@layout' => $info['title'])));
    }
  }
}

/**
 * Submit handler for layout advanced settings page.
 */
function layout_settings_page_submit($form, &$form_state) {
  config_set('layout.settings', 'excluded_templates', $form_state['excluded_templates']);
  backdrop_set_message(t('Your configuration has been saved.'));
}

/**
 * Menu callback; Show the region styles form.
 */
function layout_configure_region_page($form, &$form_state, Layout $layout, $renderer_name, $region_name, $block_key = NULL) {
  $form_state['layout'] = $layout;
  $form_state['region_name'] = $region_name;
  $layout_info = layout_get_layout_template_info($layout->layout_template);
  if (!array_key_exists($region_name, $layout_info['regions'])) {
    return MENU_NOT_FOUND;
  }

  $form['#tree'] = TRUE;

  $options = array(
    '' => 'No inner wrapper',
    'div' => 'DIV',
    'nav' => 'NAV',
    'aside' => 'ASIDE',
    'section' => 'SECTION',
  );
  $form['element'] = array(
    '#title' => t('HTML element for inner wrapper'),
    '#type' => 'select',
    '#options' => $options,
    '#default_value' => isset($layout->settings[$region_name]['element']) ? $layout->settings[$region_name]['element'] : '',
  );
  $form['classes'] = array(
    '#title' => t('CSS classes for inner wrapper'),
    '#type' => 'textfield',
    '#default_value' => isset($layout->settings[$region_name]['classes']) ? $layout->settings[$region_name]['classes'] : '',
    '#description' => t('Separate multiple classes with spaces.'),
    '#states' => array(
      'invisible' => array(
        ':input[name="element"]' => array('value' => ''),
      ),
    ),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
    '#submit' => array(
      'layout_configure_region_page_submit',
    ),
    '#ajax' => array(
      'callback' => 'layout_ajax_form_save_dialog',
    ),
  );

  return $form;
}

/**
 * Submit handler for layout_configure_region_page().
 */
function layout_configure_region_page_submit($form, &$form_state) {
  $region_name = $form_state['region_name'];
  $form_state['layout']->settings[$region_name]['element'] = $form_state['values']['element'];
  $form_state['layout']->settings[$region_name]['classes'] = $form_state['values']['classes'];
  layout_set_layout_tempstore($form_state['layout']);
}

/**
 * Menu callback; Lists all blocks and their modules.
 */
function layout_block_list() {
  $rows = array();

  $module_blocks = layout_get_block_info();
  $usage = layout_get_block_usage();

  // Get all blocks.
  foreach ($module_blocks as $module => $blocks) {
    if (!empty($blocks)) {
      foreach ($blocks as $delta => $block) {
        $contexts = !empty($block['required contexts']) ? implode(",", $block['required contexts']) : '';
        $usages = array();
        if (isset($usage[$module][$delta])) {
          foreach ($usage[$module][$delta] as $layout => $layout_use) {
            $instances = array();
            foreach ($layout_use as $position => $block_use) {
              foreach ($block_use as $instance) {
                $instances[$position][] = $instance;
              }
            }
            $positions = implode(', ', array_map('ucfirst', array_keys($instances)));
            $usages[] = l($instance->layout_title . ' (' . $positions . ')', 'admin/structure/layouts/manage/' . $layout);
          }
        }
        $usage_list = $usages ? theme('item_list', array('items' => $usages)) : t('Not in use');
        $block_name = check_plain($block['info']) . ' (' . $delta . ')';
        $rows[] = array('name' => $block_name, 'usage' => $usage_list, 'module' => $module, 'contexts' => $contexts);
      }
    }
  }

  $header = array(
    array('data' => 'Name (delta)', 'field' => 'name', 'sort' => 'ASC'),
    array('data' => 'Usage', 'field' => 'usage', 'sort' => 'ASC'),
    array('data' => 'Module', 'field' => 'module', 'sort' => 'ASC', 'class' => array(RESPONSIVE_PRIORITY_LOW)),
    array('data' => 'Required contexts', 'field' => 'contexts', 'class' => array(RESPONSIVE_PRIORITY_LOW)),
  );

  $order = tablesort_get_order($header);
  $sort = tablesort_get_sort($header);

  backdrop_sort($rows, array($order['sql'] => SORT_STRING));
  $rows = ($sort == 'asc') ? $rows : array_reverse($rows);

  $page['description_container'] = array(
    '#type' => 'container',
  );

  $page['description_container']['description'] = array(
    '#markup' => '<p>' . t("Provides a summary of all available blocks. The 'Usage' column shows which layout and region to which blocks are currently assigned in the format 'Layout name (region)'.") . '<p>',
  );

  $page['table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    '#empty' => t('There are no blocks.'),
  );

  return $page;
}

/**
 * Lists information about blocks in use in layouts.
 *
 * @param string $module
 *   The module providing the required blocks.
 * @param string $delta
 *   The block delta. If $delta is provided, $module is also required since
 *   block deltas are not required to be unique.
 *
 * @return array
 *   An array of block usage instances keyed by block module, delta, layout
 *   machine_name, and position. Each instance is a block object with an
 *   additional key for the layout name.
 */
function layout_get_block_usage($module = NULL, $delta = NULL) {
  $blocks = &backdrop_static(__FUNCTION__, array());
  if (empty($blocks)) {
    $layout_info = layout_load_all();
    foreach ($layout_info as $layout) {
      foreach ($layout->positions as $position => $uuids) {
        foreach ($uuids as $uuid) {
          $block = $layout->content[$uuid];
          $block->layout_title = $layout->title;
          $blocks[$block->module][$block->delta][$layout->name][$position][] = $block;
        }
      }
    }
  }

  if ($module && $delta) {
    return $blocks[$module][$delta];
  }
  elseif ($module) {
    return $blocks[$module];
  }
  return $blocks;
}
