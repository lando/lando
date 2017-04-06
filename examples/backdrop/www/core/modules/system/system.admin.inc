<?php
/**
 * @file
 * Admin page callbacks for the system module.
 */

/**
 * Menu callback; Provide the administration overview page.
 */
function system_admin_config_page() {
  $blocks = array();
  if ($admin = db_query("SELECT menu_name, mlid FROM {menu_links} WHERE link_path = 'admin/config' AND module = 'system'")->fetchAssoc()) {
    $result = db_query("
      SELECT m.*, ml.*
      FROM {menu_links} ml
      INNER JOIN {menu_router} m ON ml.router_path = m.path
      WHERE menu_name = :menu_name AND ml.plid = :mlid AND hidden = 0", $admin, array('fetch' => PDO::FETCH_ASSOC));
    foreach ($result as $item) {
      _menu_link_translate($item);
      if (!$item['access']) {
        continue;
      }
      // The link description, either derived from 'description' in hook_menu()
      // or customized via menu module is used as title attribute.
      if (!empty($item['localized_options']['attributes']['title'])) {
        $item['description'] = $item['localized_options']['attributes']['title'];
        unset($item['localized_options']['attributes']['title']);
      }
      $block = $item;
      $block['content'] = '';
      $block['content'] .= theme('admin_block_content', array('content' => system_admin_menu_block($item)));
      if (!empty($block['content'])) {
        $block['show'] = TRUE;
      }

      // Prepare for sorting as in function _menu_tree_check_access().
      // The weight is offset so it is always positive, with a uniform 5-digits.
      $blocks[(50000 + $item['weight']) . ' ' . $item['title'] . ' ' . $item['mlid']] = $block;
    }
  }
  if ($blocks) {
    ksort($blocks);
    return theme('admin_page', array('blocks' => $blocks));
  }
  else {
    return t('You do not have any administrative items.');
  }
}

/**
 * Provide a single block from the administration menu as a page.
 *
 * This function is often a destination for these blocks.
 * For example, 'admin/structure/types' needs to have a destination to be valid
 * in the Backdrop menu system, but too much information there might be
 * hidden, so we supply the contents of the block.
 *
 * @return
 *   The output HTML.
 */
function system_admin_menu_block_page() {
  $item = menu_get_item();
  if ($content = system_admin_menu_block($item)) {
    $output = theme('admin_block_content', array('content' => $content));
  }
  else {
    $output = t('You do not have any administrative items.');
  }
  return $output;
}

/**
 * Menu callback; prints a listing of admin tasks, organized by module.
 */
function system_admin_index() {
  $module_info = system_get_info('module');
  foreach ($module_info as $module => $info) {
    $module_info[$module] = new stdClass();
    $module_info[$module]->info = $info;
  }
  uasort($module_info, 'system_sort_modules_by_info_name');
  $menu_items = array();

  foreach ($module_info as $module => $info) {
    // Only display a section if there are any available tasks.
    if ($admin_tasks = system_get_module_admin_tasks($module, $info->info)) {
      // Sort links by title.
      backdrop_sort($admin_tasks, array('title' => SORT_STRING));
      // Move 'Configure permissions' links to the bottom of each section.
      $permission_key = "admin/config/people/permissions#module-$module";
      if (isset($admin_tasks[$permission_key])) {
        $permission_task = $admin_tasks[$permission_key];
        unset($admin_tasks[$permission_key]);
        $admin_tasks[$permission_key] = $permission_task;
      }

      $menu_items[$info->info['name']] = array($info->info['description'], $admin_tasks);
    }
  }
  return theme('system_admin_index', array('menu_items' => $menu_items));
}

/**
 * Menu callback; displays a listing of all themes.
 */
function system_themes_page() {
  // Inform the user if theme_debug is enabled.
  $theme_debug_enabled = config_get('system.core', 'theme_debug');
  if ($theme_debug_enabled) {
    backdrop_set_message(t('Theme debugging is enabled. See the <a href="!url">Status report</a> page for more info.', array('!url' => url('admin/reports/status'))), 'warning', FALSE);
  }

  // Get current list of themes.
  $themes = system_rebuild_theme_data();
  uasort($themes, 'system_sort_modules_by_info_name');

  $theme_default = config_get('system.core', 'theme_default');
  $theme_groups  = array(
    'enabled' => array(),
    'disabled' => array(),
  );

  foreach ($themes as &$theme) {
    if (!empty($theme->info['hidden'])) {
      continue;
    }
    $admin_theme_options[$theme->name] = $theme->info['name'];
    $theme->is_default = ($theme->name == $theme_default);

    // Identify theme screenshot.
    $theme->screenshot = NULL;
    // Create a list which includes the current theme and all its base themes.
    if (isset($themes[$theme->name]->base_themes)) {
      $theme_keys = array_keys($themes[$theme->name]->base_themes);
      $theme_keys[] = $theme->name;
    }
    else {
      $theme_keys = array($theme->name);
    }
    // Look for a screenshot in the current theme or in its closest ancestor.
    foreach (array_reverse($theme_keys) as $theme_key) {
      if (isset($themes[$theme_key]) && file_exists($themes[$theme_key]->info['screenshot'])) {
        $theme->screenshot = array(
          'uri' => $themes[$theme_key]->info['screenshot'],
          'alt' => t('Screenshot for !theme theme', array('!theme' => $theme->info['name'])),
          'title' => t('Screenshot for !theme theme', array('!theme' => $theme->info['name'])),
          'attributes' => array('class' => array('screenshot')),
        );
        break;
      }
    }

    if (empty($theme->status)) {
     // Ensure this theme is compatible with this version of core.
      $theme->incompatible_core = !isset($theme->info['backdrop']) || ($theme->info['backdrop'] != BACKDROP_CORE_COMPATIBILITY);
      $theme->incompatible_php = version_compare(phpversion(), $theme->info['php']) < 0;
    }
    $query['token'] = backdrop_get_token('system-theme-operation-link');
    $theme->operations = array();
    if (!empty($theme->status) || !$theme->incompatible_core && !$theme->incompatible_php) {
      // Create the operations links.
      $query['theme'] = $theme->name;
      if (backdrop_theme_access($theme) && theme_has_settings($theme->name)) {
        $theme->operations[] = array(
          'title' => t('Settings'),
          'href' => 'admin/appearance/settings/' . $theme->name,
          'attributes' => array('title' => t('Settings for !theme theme', array('!theme' => $theme->info['name']))),
        );
      }
      if (!empty($theme->status)) {
        if (!$theme->is_default) {
          $theme->operations[] = array(
            'title' => t('Disable'),
            'href' => 'admin/appearance/disable',
            'query' => $query,
            'attributes' => array('title' => t('Disable !theme theme', array('!theme' => $theme->info['name']))),
          );
          $theme->operations[] = array(
            'title' => t('Set default'),
            'href' => 'admin/appearance/default',
            'query' => $query,
            'attributes' => array('title' => t('Set !theme as default theme', array('!theme' => $theme->info['name']))),
          );
        }
      }
      else {
        $theme->operations[] = array(
          'title' => t('Enable'),
          'href' => 'admin/appearance/enable',
          'query' => $query,
          'attributes' => array('title' => t('Enable !theme theme', array('!theme' => $theme->info['name']))),
        );
        $theme->operations[] = array(
          'title' => t('Enable and set default'),
          'href' => 'admin/appearance/default',
          'query' => $query,
          'attributes' => array('title' => t('Enable !theme as default theme', array('!theme' => $theme->info['name']))),
        );
      }
    }

    // Add notes to default and administration theme.
    $theme->notes = array();
    $theme->classes = array();
    if ($theme->is_default) {
      $theme->classes[] = 'theme-default';
      $theme->notes[] = t('default theme');
    }

    // Sort enabled and disabled themes into their own groups.
    $theme_groups[$theme->status ? 'enabled' : 'disabled'][] = $theme;
  }

  // There are two possible theme groups.
  $theme_group_titles = array(
    'enabled' => t('Enabled themes'),
  );
  if (!empty($theme_groups['disabled'])) {
    $theme_group_titles['disabled'] = t('Disabled themes');
  }

  uasort($theme_groups['enabled'], 'system_sort_themes');
  backdrop_alter('system_themes_page', $theme_groups);

  $admin_form = backdrop_get_form('system_themes_admin_form', $admin_theme_options);

  return theme('system_themes_page', array('theme_groups' => $theme_groups, 'theme_group_titles' => $theme_group_titles)) . backdrop_render($admin_form);
}

/**
 * Form to select the administration theme.
 *
 * @ingroup forms
 * @see system_themes_admin_form_submit()
 */
function system_themes_admin_form($form, &$form_state, $theme_options) {
  // Administration theme settings.
  $form['admin_theme'] = array(
    '#type' => 'fieldset',
    '#title' => t('Administration theme'),
  );
  $form['admin_theme']['admin_theme'] = array(
    '#type' => 'select',
    '#options' => array(0 => t('Default theme')) + $theme_options,
    '#title' => t('Administration theme'),
    '#description' => t('Choose "Default theme" to always use the same theme as the rest of the site.'),
    '#default_value' => config_get('system.core', 'admin_theme'),
  );
  $form['admin_theme']['actions'] = array('#type' => 'actions');
  $form['admin_theme']['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  return $form;
}

/**
 * Process system_themes_admin_form form submissions.
 */
function system_themes_admin_form_submit($form, &$form_state) {
  backdrop_set_message(t('The configuration options have been saved.'));
  config_set('system.core', 'admin_theme', $form_state['values']['admin_theme']);
}

/**
 * Menu callback; Enables a theme.
 */
function system_theme_enable() {
  if (isset($_REQUEST['theme']) && isset($_REQUEST['token']) && backdrop_valid_token($_REQUEST['token'], 'system-theme-operation-link')) {
    $theme = $_REQUEST['theme'];
    // Get current list of themes.
    $themes = list_themes();

    // Check if the specified theme is one recognized by the system.
    if (!empty($themes[$theme])) {
      theme_enable(array($theme));
      backdrop_set_message(t('The %theme theme has been enabled.', array('%theme' => $themes[$theme]->info['name'])));
    }
    else {
      backdrop_set_message(t('The %theme theme was not found.', array('%theme' => $theme)), 'error');
    }
    backdrop_goto('admin/appearance');
  }
  return MENU_ACCESS_DENIED;
}

/**
 * Menu callback; Disables a theme.
 */
function system_theme_disable() {
  if (isset($_REQUEST['theme']) && isset($_REQUEST['token']) && backdrop_valid_token($_REQUEST['token'], 'system-theme-operation-link')) {
    $theme = $_REQUEST['theme'];
    // Get current list of themes.
    $themes = list_themes();

    // Check if the specified theme is one recognized by the system.
    if (!empty($themes[$theme])) {
      if ($theme == config_get('system.core', 'theme_default')) {
        // Don't disable the default theme.
        backdrop_set_message(t('%theme is the default theme and cannot be disabled.', array('%theme' => $themes[$theme]->info['name'])), 'error');
      }
      else {
        theme_disable(array($theme));
        backdrop_set_message(t('The %theme theme has been disabled.', array('%theme' => $themes[$theme]->info['name'])));
      }
    }
    else {
      backdrop_set_message(t('The %theme theme was not found.', array('%theme' => $theme)), 'error');
    }
    backdrop_goto('admin/appearance');
  }
  return MENU_ACCESS_DENIED;
}

/**
 * Menu callback; Set the default theme.
 */
function system_theme_default() {
  if (isset($_REQUEST['theme']) && isset($_REQUEST['token']) && backdrop_valid_token($_REQUEST['token'], 'system-theme-operation-link')) {
    $theme = $_REQUEST['theme'];
    // Get current list of themes.
    $themes = list_themes();

    // Check if the specified theme is one recognized by the system.
    if (!empty($themes[$theme])) {
      // Enable the theme if it is currently disabled.
      if (empty($themes[$theme]->status)) {
       theme_enable(array($theme));
      }
      // Set the default theme.
      config_set('system.core', 'theme_default', $theme);

      // Rebuild the menu. This duplicates the menu_rebuild() in theme_enable().
      // However, modules must know the current default theme in order to use
      // this information in hook_menu() or hook_menu_alter() implementations,
      // and doing the config_set() before the theme_enable() could result
      // in a race condition where the theme is default but not enabled.
      menu_rebuild();

      // The status message depends on whether an admin theme is currently in use:
      // a value of 0 means the admin theme is set to be the default theme.
      $admin_theme = config_get('system.core', 'admin_theme');
      if ($admin_theme && $admin_theme != $theme) {
        backdrop_set_message(t('Please note that the administration theme is still set to the %admin_theme theme; consequently, the theme on this page remains unchanged. All non-administrative sections of the site, however, will show the selected %selected_theme theme by default.', array(
          '%admin_theme' => $themes[$admin_theme]->info['name'],
          '%selected_theme' => $themes[$theme]->info['name'],
        )));
      }
      else {
        backdrop_set_message(t('%theme is now the default theme.', array('%theme' => $themes[$theme]->info['name'])));
      }
    }
    else {
      backdrop_set_message(t('The %theme theme was not found.', array('%theme' => $theme)), 'error');
    }
    backdrop_goto('admin/appearance');
  }
  return MENU_ACCESS_DENIED;
}

/**
 * Form builder; display theme configuration for entire site and individual themes.
 *
 * @param $key
 *   A theme name.
 * @return
 *   The form structure.
 *
 * @ingroup forms
 *
 * @see system_theme_settings_submit()
 */
function system_theme_settings($form, &$form_state, $key) {
  $themes = list_themes();

  // Inform the user if theme_debug is enabled.
  $theme_debug_enabled = config_get('system.core', 'theme_debug');
  if ($theme_debug_enabled) {
    backdrop_set_message(t('Theme debugging is enabled. See the <a href="!url">Status report</a> page for more info.', array('!url' => url('admin/reports/status'))), 'warning', FALSE);
  }

  $form['theme'] = array(
    '#type' => 'value',
    '#value' => $key,
  );

  // Create a list which includes the current theme and all its base themes.
  if (isset($themes[$key]->base_themes)) {
    $theme_keys = array_keys($themes[$key]->base_themes);
    $theme_keys[] = $key;
  }
  else {
    $theme_keys = array($key);
  }

  // Process the theme and all its base themes.
  foreach ($theme_keys as $theme) {
    // Include the theme-settings.php file.
    $filename = BACKDROP_ROOT . '/' . str_replace("/$theme.info", '', $themes[$theme]->filename) . '/theme-settings.php';
    if (file_exists($filename)) {
      require_once $filename;
    }

    // Call theme-specific settings.
    $function = $theme . '_form_system_theme_settings_alter';
    if (function_exists($function)) {
      $function($form, $form_state);
    }
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save theme settings'),
  );

  return $form;
}

/**
 * Process system_theme_settings form submissions.
 */
function system_theme_settings_submit($form, &$form_state) {
  $theme = $form_state['values']['theme'];

  // Exclude unnecessary elements before saving.
  form_state_values_clean($form_state);
  unset($form_state['values']['theme']);

  // Save all settings to config.
  $config = config($theme . '.settings');
  foreach ($form_state['values'] as $key => $value) {
    $config->set($key, $value);
  }
  $config->save();
  backdrop_set_message(t('The configuration options have been saved.'));
  cache_clear_all();
}

/**
 * Recursively check compatibility.
 *
 * @param $incompatible
 *   An associative array which at the end of the check contains all
 *   incompatible files as the keys, their values being TRUE.
 * @param $files
 *   The set of files that will be tested.
 * @param $file
 *   The file at which the check starts.
 * @return
 *   Returns TRUE if an incompatible file is found, NULL (no return value)
 *   otherwise.
 */
function _system_is_incompatible(&$incompatible, $files, $file) {
  if (isset($incompatible[$file->name])) {
    return TRUE;
  }
  // Recursively traverse required modules, looking for incompatible modules.
  foreach ($file->requires as $requires) {
    if (isset($files[$requires]) && _system_is_incompatible($incompatible, $files, $files[$requires])) {
      $incompatible[$file->name] = TRUE;
      return TRUE;
    }
  }
}

/**
 * Menu callback; provides module enable/disable interface.
 *
 * The list of modules gets populated by module.info files, which contain each
 * module's name, description, and information about which modules it requires.
 * See backdrop_parse_info_file() for information on module.info descriptors.
 *
 * Dependency checking is performed to ensure that a module:
 * - can not be enabled if there are disabled modules it requires.
 * - can not be disabled if there are enabled modules which depend on it.
 *
 * @param $form_state
 *   An associative array containing the current state of the form.
 *
 * @return
 *   The form array.
 *
 * @ingroup forms
 * @see theme_system_modules()
 * @see system_modules_submit()
 */
function system_modules($form, $form_state = array()) {
  backdrop_set_title('Modules');

  // JS-only table filters.
  $form['filter'] = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array('table-filter', 'js-show'),
    ),
    '#attached' => array(
      'library' => array(array('system', 'backdrop.modules')),
    ),
  );
  $form['filter']['search'] = array(
    '#type' => 'textfield',
    '#title' => t('Filter'),
    '#size' => 30,
    '#placeholder' => t('Enter module name…'),
    '#attributes' => array(
      'class' => array('table-filter-text'),
      'autocomplete' => 'off',
      'title' => t('Enter a part of the module name or description to filter.'),
    ),
  );

  // Get current list of modules.
  $files = system_rebuild_module_data();

  // Remove hidden modules from display list.
  $visible_files = $files;
  foreach ($visible_files as $filename => $file) {
    if (!empty($file->info['hidden'])) {
      unset($visible_files[$filename]);
    }
  }

  uasort($visible_files, 'system_sort_modules_by_info_name');

  // If the modules form was submitted, then system_modules_submit() runs first
  // and if there are unfilled required modules, then $form_state['storage'] is
  // filled, triggering a rebuild. In this case we need to display a
  // confirmation form.
  if (!empty($form_state['storage'])) {
    return system_modules_confirm_form($visible_files, $form_state['storage']);
  }

  $modules = array();
  $form['modules'] = array('#tree' => TRUE);

  // Used when displaying modules that are required by the installation profile.
  require_once BACKDROP_ROOT . '/core/includes/install.inc';
  $distribution_name = check_plain(backdrop_install_profile_distribution_name());

  // Iterate through each of the modules.
  foreach ($visible_files as $filename => $module) {
    $extra = array();
    $extra['enabled'] = (bool) $module->status;
    $extra['disabled'] = (array_key_exists('disabled', $module->info)) ? $module->info['disabled'] : FALSE;
    if ($extra['disabled'] && !empty($module->info['explanation']) ) {
      $extra['required_by'][] = $module->info['explanation'];
    }

    // Check to see if this is a core module.
    if (strstr($module->uri, 'core/modules')) {
      $extra['core'] = TRUE;
    }

    // Some modules are always required by core and cannot be disabled, for
    // example: entity, node, system, and user.
    $extra['required_by_distribution'] = FALSE;
    if (!empty($module->info['required'] )) {
      $extra['disabled'] = TRUE;
      $extra['required_by'][] = $distribution_name . (!empty($module->info['explanation']) ? ' ('. $module->info['explanation'] .')' : '');
      $extra['required_by_distribution'] = TRUE;
    }

    // If this module requires other modules, add them to the array.
    foreach ($module->requires as $requires => $v) {
      if (!isset($files[$requires])) {
        $extra['requires'][$requires] = t('@module (<span class="admin-missing">missing</span>)', array('@module' => backdrop_ucfirst($requires)));
        $extra['disabled'] = TRUE;
      }
      // Only display visible modules.
      elseif (isset($visible_files[$requires])) {
        $requires_name = $files[$requires]->info['name'];

        // Disable this module if it is incompatible with the dependency's version.
        if ($incompatible_version = backdrop_check_incompatibility($v, str_replace(BACKDROP_CORE_COMPATIBILITY . '-', '', $files[$requires]->info['version']))) {
          $extra['requires'][$requires] = t('@module (<span class="admin-missing">incompatible with</span> version @version)', array(
            '@module' => $requires_name . $incompatible_version,
            '@version' => $files[$requires]->info['version'],
          ));
          $extra['disabled'] = TRUE;
        }

        // Disable this module if the dependency is incompatible with this version of Backdrop core.
        elseif (isset($files[$requires]->info['backdrop']) && $files[$requires]->info['backdrop'] != BACKDROP_CORE_COMPATIBILITY) {
          $extra['requires'][$requires] = t('@module (<span class="admin-missing">incompatible with</span> this version of Backdrop core)', array(
            '@module' => $requires_name,
          ));
          $extra['disabled'] = TRUE;
        }
        elseif ($files[$requires]->status) {
          $extra['requires'][$requires] = t('@module (<span class="admin-enabled">enabled</span>)', array('@module' => $requires_name));
        }
        else {
          $extra['requires'][$requires] = t('@module (<span class="admin-disabled">disabled</span>)', array('@module' => $requires_name));
        }
      }
    }

    // Generate link for module's permission, if the user has access to it.
    if ($module->status && user_access('administer permissions') && in_array($filename, module_implements('permission'))) {
      $extra['links']['permissions'] = array(
        'title' => t('Permissions'),
        'href' => 'admin/config/people/permissions',
        'attributes' => array('class' => array('module-link', 'module-link-permissions'), 'title' => t('Configure permissions')),
        'fragment' => 'module-' . $filename,
      );
    }

    // Generate link for module's configuration page, if provided.
    if ($module->status && isset($module->info['configure'])) {
      $configure_link = menu_get_item($module->info['configure']);
      if ($configure_link['access']) {
        $extra['links']['configure'] = array(
          'title' => t('Configure'),
          'href' => $configure_link['href'],
          'attributes' => array('class' => array('module-link', 'module-link-configure'), 'title' => $configure_link['description']),
        );
      }
    }

    // If this module is required by other modules, list those, and then make it
    // impossible to disable this one.
    foreach ($module->required_by as $required_by => $v) {
      // Hidden modules are unset already.
      if (isset($visible_files[$required_by])) {
        if ($files[$required_by]->status == 1 && $module->status == 1) {
          $extra['required_by'][] = t('@module (<span class="admin-enabled">enabled</span>)', array('@module' => $files[$required_by]->info['name']));
          $extra['disabled'] = TRUE;
        }
        else {
          $extra['required_by'][] = t('@module (<span class="admin-disabled">disabled</span>)', array('@module' => $files[$required_by]->info['name']));
        }
      }
    }
    $form['modules'][$module->info['package']][$filename] = _system_modules_build_row($module->info, $extra);
  }

  // Add basic information to the fieldsets.
  foreach (element_children($form['modules']) as $package) {
    $form['modules'][$package] += array(
      '#type' => 'fieldset',
      '#title' => t($package),
      '#collapsible' => TRUE,
      '#theme' => 'system_modules_fieldset',
      '#header' => array(
        array('class' => array('checkbox')),
        t('Name'),
        array('data' => t('Version'), 'class' => array(RESPONSIVE_PRIORITY_MEDIUM)),
        array('data' => t('Description'), 'class' => array(RESPONSIVE_PRIORITY_LOW)),
        array('data' => t('Operations')),
      ),
    );
  }

  // Lastly, sort all fieldsets by title.
  backdrop_sort($form['modules'], array('#title' => SORT_STRING));

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  $form['#action'] = url('admin/modules/list/confirm');

  return $form;
}

/**
 * Array sorting callback; sorts modules or themes by their name.
 */
function system_sort_modules_by_info_name($a, $b) {
  return strcasecmp($a->info['name'], $b->info['name']);
}

/**
 * Array sorting callback; sorts modules or themes by their name.
 */
function system_sort_themes($a, $b) {
  if ($a->is_default) {
    return -1;
  }
  if ($b->is_default) {
    return 1;
  }
  return strcasecmp($a->info['name'], $b->info['name']);
}

/**
 * Build a table row for the system modules page.
 */
function _system_modules_build_row($info, $extra) {
  // Add in the defaults.
  $extra += array(
    'requires' => array(),
    'required_by' => array(),
    'disabled' => FALSE,
    'enabled' => FALSE,
    'links' => array(),
    'core' => FALSE,
  );
  $form = array(
    '#tree' => TRUE,
  );
  // Set the basic properties.
  $form['name'] = array(
    '#markup' => $info['name'],
  );
  $form['description'] = array(
    '#markup' => t($info['description']),
  );
  $form['version'] = array(
    '#markup' => $info['version'],
  );
  $form['#requires'] = $extra['requires'];
  $form['#required_by'] = $extra['required_by'];
  $form['#required_by_distribution'] = $extra['required_by_distribution'];

  // Check the compatibilities.
  $compatible = TRUE;
  $status_short = '';
  $status_long = '';

  // Check if this module was once a contributed module but is now in core.
  if (isset($info['merged_into_core'])) {
    $compatible = FALSE;
    $status_short .= t('No longer needed.') . ' ';
    $status_long .= t('This module is now built-into Backdrop CMS core and is no longer necessary.') . ' ';
  }
  // Check the core compatibility.
  elseif (!isset($info['backdrop']) || $info['backdrop'] != BACKDROP_CORE_COMPATIBILITY) {
    $compatible = FALSE;
    $status_short .= t('Incompatible with this version of Backdrop CMS.') . ' ';
    $status_long .= t('This version is not compatible with Backdrop CMS !core_version and should be replaced.', array('!core_version' => BACKDROP_CORE_COMPATIBILITY)) . ' ';
  }

  // Ensure this module is compatible with the currently installed version of PHP.
  if (version_compare(phpversion(), $info['php']) < 0) {
    $compatible = FALSE;
    $status_short .= t('Incompatible with this version of PHP') . ' ';
    $php_required = $info['php'];
    if (substr_count($info['php'], '.') < 2) {
      $php_required .= '.*';
    }
    $status_long .= t('This module requires PHP version @php_required and is incompatible with PHP version !php_version.', array('@php_required' => $php_required, '!php_version' => phpversion())) . ' ';
  }

  // If this module is compatible, present a checkbox indicating this module
  // may be installed. Otherwise, show a big red X.
  if ($compatible) {
    $form['enable'] = array(
      '#type' => 'checkbox',
      '#title' => t('Enable'),
      '#default_value' => $extra['enabled'],
    );
    if ($extra['disabled']) {
      $form['enable']['#disabled'] = TRUE;
    }
  }
  else {
    $form['enable'] = array(
      '#markup' =>  theme('image', array('uri' => 'core/misc/watchdog-error.png', 'alt' => t('Unable to enable'), 'title' => trim($status_short))),
    );
    $form['description']['#markup'] .= theme('system_modules_incompatible', array('message' => trim($status_long)));
  }

  // Build dropbutton links.
  $links = array();
  foreach (array('configure', 'permissions') as $key) {
    if (isset($extra['links'][$key])) {
      $links[$key] =  $extra['links'][$key];
    }
  }
  if (!empty($links)) {
    $form['links'] = array(
      '#type' => 'dropbutton',
      '#links' => $links,
    );
  }

  return $form;
}

/**
 * Display confirmation form for required modules.
 *
 * @param $modules
 *   Array of module file objects as returned from system_rebuild_module_data().
 * @param $storage
 *   The contents of $form_state['storage']; an array with two
 *   elements: the list of required modules and the list of status
 *   form field values from the previous screen.
 * @ingroup forms
 */
function system_modules_confirm_form($modules, $storage) {
  $items = array();

  $form['validation_modules'] = array('#type' => 'value', '#value' => $modules);
  $form['status']['#tree'] = TRUE;

  foreach ($storage['more_required'] as $info) {
    $t_argument = array(
      '@module' => $info['name'],
      '@required' => implode(', ', $info['requires']),
    );
    $items[] = format_plural(count($info['requires']), 'You must enable the @required module to install @module.', 'You must enable the @required modules to install @module.', $t_argument);
  }

  foreach ($storage['missing_modules'] as $name => $info) {
    $t_argument = array(
      '@module' => $name,
      '@depends' => implode(', ', $info['depends']),
    );
    $items[] = format_plural(count($info['depends']), 'The @module module is missing, so the following module will be disabled: @depends.', 'The @module module is missing, so the following modules will be disabled: @depends.', $t_argument);
  }

  $form['text'] = array('#markup' => theme('item_list', array('items' => $items)));

  if ($form) {
    // Set some default form values
    $form = confirm_form(
      $form,
      t('Some required modules must be enabled'),
      'admin/modules',
      t('Would you like to continue with the above?'),
      t('Continue'),
      t('Cancel'));
    // Removing the button-danger class so that button-primary will be added automatically for us.
    unset($form['actions']['submit']['#attributes']['class']);
    return $form;
  }
}

/**
 * Submit callback; handles modules form submission.
 */
function system_modules_submit($form, &$form_state) {
  include_once BACKDROP_ROOT . '/core/includes/install.inc';

  // Builds list of modules.
  $modules = array();
  // If we're not coming from the confirmation form, build the list of modules.
  if (empty($form_state['storage'])) {
    // If we're not coming from the confirmation form, build the module list.
    foreach ($form_state['values']['modules'] as $group_name => $group) {
      foreach ($group as $module => $enabled) {
        $modules[$module] = array('group' => $group_name, 'enabled' => $enabled['enable']);
      }
    }
  }
  else {
    // If we are coming from the confirmation form, fetch
    // the modules out of $form_state.
    $modules = $form_state['storage']['modules'];
  }

  // Collect data for all modules to be able to determine dependencies.
  $files = system_rebuild_module_data();

  // Sorts modules by weight.
  $sort = array();
  foreach (array_keys($modules) as $module) {
    $sort[$module] = $files[$module]->sort;
  }
  array_multisort($sort, $modules);

  // Makes sure all required modules are set to be enabled.
  $more_required = array();
  $missing_modules = array();
  foreach ($modules as $name => $module) {
    if ($module['enabled']) {
      // Checks that all dependencies are set to be enabled.  Stores the ones
      // that are not in $dependencies variable so that the user can be alerted
      // in the confirmation form that more modules need to be enabled.
      $dependencies = array();
      foreach (array_keys($files[$name]->requires) as $required) {
        if (empty($modules[$required]['enabled'])) {
          if (isset($files[$required])) {
            $dependencies[] = $files[$required]->info['name'];
            $modules[$required]['enabled'] = TRUE;
          }
          else {
            $missing_modules[$required]['depends'][] = $name;
            $modules[$name]['enabled'] = FALSE;
          }
        }
      }

      // Stores additional modules that need to be enabled in $more_required.
      if (!empty($dependencies)) {
        $more_required[$name] = array(
          'name' => $files[$name]->info['name'],
          'requires' => $dependencies,
        );
      }
    }
  }

  // Redirects to confirmation form if more modules need to be enabled.
  if ((!empty($more_required) || !empty($missing_modules)) && !isset($form_state['values']['confirm'])) {
    $form_state['storage'] = array(
      'more_required' => $more_required,
      'modules' => $modules,
      'missing_modules' => $missing_modules,
    );
    $form_state['rebuild'] = TRUE;
    return;
  }

  // Invokes hook_requirements('install').  If failures are detected, makes sure
  // the dependent modules aren't installed either.
  foreach ($modules as $name => $module) {
    // Only invoke hook_requirements() on modules that are going to be installed.
    if ($module['enabled'] && backdrop_get_installed_schema_version($name) == SCHEMA_UNINSTALLED) {
      if (!backdrop_check_module($name)) {
        $modules[$name]['enabled'] = FALSE;
        foreach (array_keys($files[$name]->required_by) as $required_by) {
          $modules[$required_by]['enabled'] = FALSE;
        }
      }
    }
  }

  // Initializes array of actions.
  $actions = array(
    'enable' => array(),
    'disable' => array(),
    'install' => array(),
  );

  // Builds arrays of modules that need to be enabled, disabled, and installed.
  foreach ($modules as $name => $module) {
    if ($module['enabled']) {
      if (backdrop_get_installed_schema_version($name) == SCHEMA_UNINSTALLED) {
        $actions['install'][] = $name;
        $actions['enable'][] = $name;
      }
      elseif (!module_exists($name)) {
        $actions['enable'][] = $name;
      }
    }
    elseif (module_exists($name)) {
      $actions['disable'][] = $name;
    }
  }

  // Gets list of modules prior to install process, unsets $form_state['storage']
  // so we don't get redirected back to the confirmation form.
  $pre_install_list = module_list();
  unset($form_state['storage']);

  // Reverse the 'enable' list, to order dependencies before dependents.
  krsort($actions['enable']);

  // Installs, enables, and disables modules.
  module_enable($actions['enable'], FALSE);
  module_disable($actions['disable'], FALSE);

  // Gets module list after install process, flushes caches and displays a
  // message if there are changes.
  $post_install_list = module_list(TRUE);
  if ($pre_install_list != $post_install_list) {
    backdrop_flush_all_caches();
    backdrop_set_message(t('The configuration options have been saved.'));
  }

  $form_state['redirect'] = 'admin/modules';
}

/**
 * Uninstall functions
 */

/**
 * Builds a form of currently disabled modules.
 *
 * @ingroup forms
 * @see system_modules_uninstall_validate()
 * @see system_modules_uninstall_submit()
 * @param $form_state['values']
 *   Submitted form values.
 * @return
 *   A form array representing the currently disabled modules.
 */
function system_modules_uninstall($form, $form_state = NULL) {
  backdrop_set_title('Uninstall modules');

  // Make sure the install API is available.
  include_once BACKDROP_ROOT . '/core/includes/install.inc';

  // Display the confirm form if any modules have been submitted.
  if (!empty($form_state['storage']) && $confirm_form = system_modules_uninstall_confirm_form($form_state['storage'])) {
    return $confirm_form;
  }

  // Get a list of disabled, installed modules.
  $all_modules = system_rebuild_module_data();
  $disabled_modules = array();
  foreach ($all_modules as $name => $module) {
    if (empty($module->status) && $module->schema_version > SCHEMA_UNINSTALLED) {
      $disabled_modules[$name] = $module;
    }
  }

  // Only build the rest of the form if there are any modules available to
  // uninstall.
  if (!empty($disabled_modules)) {
    $profile = backdrop_get_profile();
    uasort($disabled_modules, 'system_sort_modules_by_info_name');
    $form['uninstall'] = array('#tree' => TRUE);
    foreach ($disabled_modules as $module) {
      $module_name = $module->info['name'] ? $module->info['name'] : $module->name;
      $form['modules'][$module->name]['#module_name'] = $module_name;
      $form['modules'][$module->name]['name']['#markup'] = $module_name;
      $form['modules'][$module->name]['description']['#markup'] = t($module->info['description']);
      $form['uninstall'][$module->name] = array(
        '#type' => 'checkbox',
        '#title' => t('Uninstall @module module', array('@module' => $module_name)),
        '#title_display' => 'invisible',
      );
      // All modules which depend on this one must be uninstalled first, before
      // we can allow this module to be uninstalled. (The installation profile
      // is excluded from this list.)
      foreach (array_keys($module->required_by) as $dependent) {
        if ($dependent != $profile && backdrop_get_installed_schema_version($dependent) != SCHEMA_UNINSTALLED) {
          $dependent_name = isset($all_modules[$dependent]->info['name']) ? $all_modules[$dependent]->info['name'] : $dependent;
          $form['modules'][$module->name]['#required_by'][] = $dependent_name;
          $form['uninstall'][$module->name]['#disabled'] = TRUE;
        }
      }
    }
    $form['actions'] = array('#type' => 'actions');
    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Uninstall'),
    );
    $form['#action'] = url('admin/modules/uninstall/confirm');
  }
  else {
    $form['modules'] = array();
  }

  return $form;
}

/**
 * Confirm uninstall of selected modules.
 *
 * @ingroup forms
 * @param $storage
 *   An associative array of modules selected to be uninstalled.
 * @return
 *   A form array representing modules to confirm.
 */
function system_modules_uninstall_confirm_form($storage) {
  // Nothing to build.
  if (empty($storage)) {
    return;
  }

  // Construct the hidden form elements and list items.
  foreach (array_filter($storage['uninstall']) as $module => $value) {
    $info = backdrop_parse_info_file(backdrop_get_path('module', $module) . '/' . $module . '.info');
    $uninstall[] = $info['name'];
    $form['uninstall'][$module] = array('#type' => 'hidden',
      '#value' => 1,
    );
  }

  // Display a confirm form if modules have been selected.
  if (isset($uninstall)) {
    $form['#confirmed'] = TRUE;
    $form['uninstall']['#tree'] = TRUE;
    $form['modules'] = array('#markup' => '<p>' . t('The following modules will be completely uninstalled from your site, and <em>all data from these modules will be lost</em>!') . '</p>' . theme('item_list', array('items' => $uninstall)));
    $form = confirm_form(
      $form,
      t('Confirm uninstall'),
      'admin/modules/uninstall',
      t('Would you like to continue with uninstalling the above?'),
      t('Uninstall'),
      t('Cancel'));
    return $form;
  }
}

/**
 * Validates the submitted uninstall form.
 */
function system_modules_uninstall_validate($form, &$form_state) {
  // Form submitted, but no modules selected.
  if (!count(array_filter($form_state['values']['uninstall']))) {
    backdrop_set_message(t('No modules selected.'), 'error');
    backdrop_goto('admin/modules/uninstall');
  }
}

/**
 * Processes the submitted uninstall form.
 */
function system_modules_uninstall_submit($form, &$form_state) {
  // Make sure the install API is available.
  include_once BACKDROP_ROOT . '/core/includes/install.inc';

  if (!empty($form['#confirmed'])) {
    // Call the uninstall routine for each selected module.
    $modules = array_keys($form_state['values']['uninstall']);
    backdrop_uninstall_modules($modules);
    backdrop_set_message(t('The selected modules have been uninstalled.'));

    $form_state['redirect'] = 'admin/modules/uninstall';
  }
  else {
    $form_state['storage'] = $form_state['values'];
    $form_state['rebuild'] = TRUE;
  }
}

/**
 * Form builder; The general site information form.
 *
 * @ingroup forms
 */
function system_site_information_settings($form, &$form_state) {
  $site_config = config('system.core');
  $site_mail = $site_config->get('site_mail');
  if (empty($site_mail)) {
    $site_mail = ini_get('sendmail_from');
  }

  $form['#config'] = 'system.core';
  $form['site_information'] = array(
    '#type' => 'fieldset',
    '#title' => t('Site details'),
  );
  $form['site_information']['site_name'] = array(
    '#type' => 'textfield',
    '#title' => t('Site name'),
    '#default_value' => $site_config->get('site_name'),
    '#required' => TRUE
  );

  // Logo settings
  $form['logo'] = array(
    '#type' => 'fieldset',
    '#title' => t('Logo settings'),
    '#attributes' => array('class' => array('theme-settings-bottom')),
  );
  $form['logo']['site_logo_theme'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use the logo supplied by the active theme'),
    '#default_value' => $site_config->get('site_logo_theme'),
    '#tree' => FALSE,
  );
  $form['logo']['settings'] = array(
    '#type' => 'container',
    '#states' => array(
      // Hide the logo settings when using the default logo.
      'invisible' => array(
        'input[name="site_logo_theme"]' => array('checked' => TRUE),
      ),
    ),
  );
  $form['logo']['settings']['site_logo_upload'] = array(
    '#type' => 'file',
    '#title' => t('Upload logo'),
    '#maxlength' => 60,
  );
  $form['logo']['settings']['site_logo_path'] = array(
    '#type' => 'textfield',
    '#title' => t('Path to custom logo'),
    '#default_value' => $site_config->get('site_logo_path'),
  );

  $form['favicon'] = array(
    '#type' => 'fieldset',
    '#title' => t('Shortcut icon settings'),
    '#description' => t("Your shortcut icon, or 'favicon', is displayed in the address bar and bookmarks of most browsers."),
  );
  $form['favicon']['site_favicon_theme'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use the shortcut icon supplied by the active theme'),
    '#default_value' => $site_config->get('site_favicon_theme'),
  );
  $form['favicon']['settings'] = array(
    '#type' => 'container',
    '#states' => array(
      // Hide the favicon settings when using the default favicon.
      'invisible' => array(
        'input[name="site_favicon_theme"]' => array('checked' => TRUE),
      ),
    ),
  );
  $form['favicon']['settings']['site_favicon_upload'] = array(
    '#type' => 'file',
    '#title' => t('Upload icon'),
    '#maxlength' => 60,
  );
  $form['favicon']['settings']['site_favicon_path'] = array(
    '#type' => 'textfield',
    '#title' => t('Path to custom icon'),
    '#default_value' => $site_config->get('site_favicon_path'),
  );

  $form['site_information']['site_slogan'] = array(
    '#type' => 'textfield',
    '#title' => t('Slogan'),
    '#default_value' => $site_config->get('site_slogan'),
    '#description' => t("How this is used depends on your site's theme."),
  );

  $form['site_information']['site_mail'] = array(
    '#type' => 'email',
    '#title' => t('E-mail address'),
    '#default_value' => $site_mail,
    '#description' => t("The <em>From</em> address in automated e-mails sent during registration and new password requests, and other notifications. (Use an address ending in your site's domain to help prevent this e-mail being flagged as spam.)"),
    '#required' => TRUE,
  );

  $form['front_page'] = array(
    '#type' => 'fieldset',
    '#title' => t('Front page'),
  );
  $form['front_page']['site_frontpage'] = array(
    '#type' => 'textfield',
    '#title' => t('Default front page'),
    '#default_value' => ($site_config->get('site_frontpage') != 'user' ? backdrop_get_path_alias($site_config->get('site_frontpage')) : ''),
    '#size' => 40,
    '#description' => t('Optionally, specify a relative URL to display as the front page.  Leave blank to display the default content feed.'),
    '#field_prefix' => url(NULL, array('absolute' => TRUE)) . (config_get('system.core', 'clean_url') ? '' : '?q='),
  );
  $form['front_page']['default_nodes_main'] = array(
    '#type' => 'select', '#title' => t('Number of posts on front page'),
    '#default_value' => $site_config->get('default_nodes_main'),
    '#options' => backdrop_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30)),
    '#description' => t('The maximum number of posts displayed on overview pages such as the front page.'),
    '#access' => (config_get('system.core', 'site_frontpage') == 'node'),
  );
  $form['error_page'] = array(
    '#type' => 'fieldset',
    '#title' => t('Error pages'),
  );
  $form['error_page']['site_403'] = array(
    '#type' => 'textfield',
    '#title' => t('Default 403 (access denied) page'),
    '#default_value' => ($site_config->get('site_403') != '' ? backdrop_get_path_alias($site_config->get('site_403')) : ''),
    '#size' => 40,
    '#description' => t('This page is displayed when the requested document is denied to the current user. Leave blank to display a generic "access denied" page.'),
    '#field_prefix' => url(NULL, array('absolute' => TRUE)) . (config_get('system.core', 'clean_url') ? '' : '?q=')
  );
  $form['error_page']['site_404'] = array(
    '#type' => 'textfield',
    '#title' => t('Default 404 (not found) page'),
    '#default_value' => ($site_config->get('site_404') != '' ? backdrop_get_path_alias($site_config->get('site_404')) : ''),
    '#size' => 40,
    '#description' => t('This page is displayed when no other content matches the requested document. Leave blank to display a generic "page not found" page.'),
    '#field_prefix' => url(NULL, array('absolute' => TRUE)) . (config_get('system.core', 'clean_url') ? '' : '?q=')
  );

  $form['#validate'][] = 'system_site_information_settings_validate';
  $form['#submit'][] = 'system_site_information_settings_submit';

  // Inject human-friendly form element descriptions for logo and favicon.
  foreach (array('logo' => 'logo.png', 'favicon' => 'favicon.ico') as $type => $default) {
    if (isset($form[$type]['settings']['site_' . $type . '_path'])) {
      $element = &$form[$type]['settings']['site_' . $type . '_path'];

      // If path is a public:// URI, display the path relative to the files
      // directory; stream wrappers are not end-user friendly.
      $original_path = $element['#default_value'];
      $friendly_path = NULL;
      if (file_uri_scheme($original_path) == 'public') {
        $friendly_path = file_uri_target($original_path);
        $element['#default_value'] = $friendly_path;
      }

      // Prepare local file path for description.
      if ($original_path && isset($friendly_path)) {
        $local_file = strtr($original_path, array('public:/' => config_get('system.core', 'file_public_path')));
      }
      else {
        $local_file = path_to_theme() . '/' . $default;
      }

      $element['#description'] = t('Examples: <code>@implicit-public-file</code> (for a file in the public filesystem), <code>@explicit-file</code>, or <code>@local-file</code>.', array(
        '@implicit-public-file' => isset($friendly_path) ? $friendly_path : $default,
        '@explicit-file' => file_uri_scheme($original_path) !== FALSE ? $original_path : 'public://' . $default,
        '@local-file' => $local_file,
      ));
    }
  }

  return system_settings_form($form);
}

/**
 * Validates the submitted site-information form.
 */
function system_site_information_settings_validate($form, &$form_state) {
  // Handle file uploads.
  $validators = array('file_validate_is_image' => array());

  // Check for a new uploaded logo.
  $file = file_save_upload('site_logo_upload', $validators);
  if (isset($file)) {
    // File upload was attempted.
    if ($file) {
      // Put the temporary file in form_values so we can save it on submit.
      $form_state['values']['site_logo_upload'] = $file;
    }
    else {
      // File upload failed.
      form_set_error('site_logo_upload', t('The logo could not be uploaded.'));
    }
  }

  $validators = array('file_validate_extensions' => array('ico png gif jpg jpeg apng svg'));

  // Check for a new uploaded favicon.
  $file = file_save_upload('site_favicon_upload', $validators);
  if (isset($file)) {
    // File upload was attempted.
    if ($file) {
      // Put the temporary file in form_values so we can save it on submit.
      $form_state['values']['site_favicon_upload'] = $file;
    }
    else {
      // File upload failed.
      form_set_error('site_favicon_upload', t('The favicon could not be uploaded.'));
    }
  }

  // If the user provided a path for a logo or favicon file, make sure a file
  // exists at that path.
  if (!empty($form_state['values']['site_logo_path'])) {
    $path = _system_site_information_settings_validate_path($form_state['values']['site_logo_path']);
    if (!$path) {
      form_set_error('site_logo_path', t('The custom logo path is invalid.'));
    }
  }
  if (!empty($form_state['values']['site_favicon_path'])) {
    $path = _system_site_information_settings_validate_path($form_state['values']['site_favicon_path']);
    if (!$path) {
      form_set_error('site_favicon_path', t('The custom favicon path is invalid.'));
    }
  }

  // Check for empty front page path.
  if (empty($form_state['values']['site_frontpage'])) {
    // Set to default "user".
    form_set_value($form['front_page']['site_frontpage'], 'user', $form_state);
  }
  else {
    // Get the normal path of the front page.
    form_set_value($form['front_page']['site_frontpage'], backdrop_get_normal_path($form_state['values']['site_frontpage']), $form_state);
  }
  // Validate front page path.
  if (!backdrop_valid_path($form_state['values']['site_frontpage'])) {
    form_set_error('site_frontpage', t("The path '%path' is either invalid or you do not have access to it.", array('%path' => $form_state['values']['site_frontpage'])));
  }
  // Get the normal paths of both error pages.
  if (!empty($form_state['values']['site_403'])) {
    form_set_value($form['error_page']['site_403'], backdrop_get_normal_path($form_state['values']['site_403']), $form_state);
  }
  if (!empty($form_state['values']['site_404'])) {
    form_set_value($form['error_page']['site_404'], backdrop_get_normal_path($form_state['values']['site_404']), $form_state);
  }
  // Validate 403 error path.
  if (!empty($form_state['values']['site_403']) && !backdrop_valid_path($form_state['values']['site_403'])) {
    form_set_error('site_403', t("The path '%path' is either invalid or you do not have access to it.", array('%path' => $form_state['values']['site_403'])));
  }
  // Validate 404 error path.
  if (!empty($form_state['values']['site_404']) && !backdrop_valid_path($form_state['values']['site_404'])) {
    form_set_error('site_404', t("The path '%path' is either invalid or you do not have access to it.", array('%path' => $form_state['values']['site_404'])));
  }
}

/**
 * Helper function for the system_site_information_settings form.
 *
 * Attempts to validate normal system paths, paths relative to the public files
 * directory, or stream wrapper URIs. If the given path is any of the above,
 * returns a valid path or URI that the theme system can display.
 *
 * @param $path
 *   A path relative to the Backdrop root or to the public files directory, or
 *   a stream wrapper URI.
 * @return mixed
 *   A valid path that can be displayed through the theme system, or FALSE if
 *   the path could not be validated.
 */
function _system_site_information_settings_validate_path($path) {
  // Absolute local file paths are invalid.
  if (backdrop_realpath($path) == $path) {
    return FALSE;
  }
  // A path relative to the Backdrop root or a fully qualified URI is valid.
  if (is_file($path)) {
    return $path;
  }
  // Prepend 'public://' for relative file paths within public filesystem.
  if (file_uri_scheme($path) === FALSE) {
    $path = 'public://' . $path;
  }
  if (is_file($path)) {
    return $path;
  }
  return FALSE;
}

/**
 * Form submission handler for system_site_information_settings().
 */
function system_site_information_settings_submit($form, &$form_state) {
  // If the user uploaded a new logo or favicon, save it to a permanent location
  // and use it in place of the default theme-provided file.
  if (!empty($form_state['values']['site_logo_upload'])) {
    $file = $form_state['values']['site_logo_upload'];
    unset($form_state['values']['site_logo_upload']);
    $filename = file_unmanaged_copy($file->uri);
    $form_state['values']['site_logo_theme'] = 0;
    $form_state['values']['site_logo_path'] = $filename;
  }

  if ($form_state['values']['site_logo_path']) {
    $dimensions = @getimagesize($form_state['values']['site_logo_path']);
    $form_state['values']['site_logo_attributes'] = array(
      'width' => $dimensions[0],
      'height' => $dimensions[1],
    );
  }
  else {
    $form_state['values']['site_logo_attributes'] = array(
      'width' => "",
      'height' => "",
    );
  }

  if (!empty($form_state['values']['site_favicon_upload'])) {
    $file = $form_state['values']['site_favicon_upload'];
    unset($form_state['values']['site_favicon_upload']);
    $filename = file_unmanaged_copy($file->uri);
    $form_state['values']['site_favicon_theme'] = 0;
    $form_state['values']['site_favicon_path'] = $filename;
  }

  // If the user entered a path relative to the system files directory for
  // a logo or favicon, store a public:// URI so the theme system can handle it.
  if (!empty($form_state['values']['site_logo_path'])) {
    $form_state['values']['site_logo_path'] = _system_site_information_settings_validate_path($form_state['values']['site_logo_path']);
  }
  if (!empty($form_state['values']['site_favicon_path'])) {
    $form_state['values']['site_favicon_path'] = _system_site_information_settings_validate_path($form_state['values']['site_favicon_path']);
  }

  if (empty($form_state['values']['site_favicon_theme']) && !empty($form_state['values']['site_favicon_path'])) {
    $form_state['values']['site_favicon_mimetype'] = file_get_mimetype($form_state['values']['site_favicon_path']);
  }
  else {
    $form_state['values']['site_favicon_mimetype'] = '';
  }

  config('system.core')
    ->set('site_logo_attributes', $form_state['values']['site_logo_attributes'])
    ->set('site_favicon_theme', $form_state['values']['site_favicon_theme'])
    ->set('site_favicon_path', $form_state['values']['site_favicon_path'])
    ->set('site_favicon_mimetype', $form_state['values']['site_favicon_mimetype'])
    ->save();
}

/**
 * Form builder; Cron form.
 *
 * @ingroup forms
 */
function system_cron_settings($form, &$form_state) {
  global $base_url;
  $form['#config'] = 'system.core';
  $form['description'] = array(
    '#markup' => '<p>' . t('Cron takes care of running periodic tasks like checking for updates and indexing content for search.') . '</p>',
  );
  $form['run'] = array(
    '#type' => 'submit',
    '#value' => t('Run cron'),
    '#submit' => array('system_run_cron_submit'),
  );

  $status = '<p>' . t('Last run: %cron-last ago.', array('%cron-last' => format_interval(REQUEST_TIME - state_get('cron_last')),)) . '</p>';
  $form['status'] = array(
    '#markup' => $status,
  );

  $form['cron_url'] = array(
    '#markup' => '<p>' . t('To run cron from outside the site, go to <a href="!cron">!cron</a>', array('!cron' => url($base_url . '/core/cron.php', array('external' => TRUE, 'query' => array('cron_key' => state_get('cron_key', 'backdrop')))))) . '</p>',
  );

  $form['cron'] = array(
    '#title' => t('Cron configuration'),
    '#type' => 'fieldset',
  );
  $form['cron']['cron_safe_threshold'] = array(
    '#type' => 'select',
    '#title' => t('Run cron every'),
    '#description' => t('More information about setting up scheduled tasks can be found by <a href="@url">reading the cron tutorial on drupal.org</a>.', array('@url' => url('http://drupal.org/cron'))),
    '#default_value' => config('system.core')->get('cron_safe_threshold'),
    '#options' => array(0 => t('Never')) + backdrop_map_assoc(array(3600, 10800, 21600, 43200, 86400, 604800), 'format_interval'),
  );

  return system_settings_form($form);
}

/**
 * Submit callback; run cron.
 *
 * @ingroup forms
 */
function system_run_cron_submit($form, &$form_state) {
  // Run cron manually from Cron form.
  if (backdrop_cron_run()) {
    backdrop_set_message(t('Cron run successfully.'));
  }
  else {
    backdrop_set_message(t('Cron run failed.'), 'error');
  }

  backdrop_goto('admin/config/system/cron');
}

/**
 * Form builder; Configure error reporting settings.
 *
 * @ingroup forms
 * @see system_logging_settings_submit()
 */
function system_logging_settings($form, &$form_state) {
  $form['#config'] = 'system.core';
  $form['error_level'] = array(
    '#type' => 'radios',
    '#title' => t('Error messages to display'),
    '#default_value' => config_get('system.core', 'error_level'),
    '#options' => array(
      ERROR_REPORTING_HIDE => t('None'),
      ERROR_REPORTING_DISPLAY_SOME => t('Errors and warnings'),
      ERROR_REPORTING_DISPLAY_ALL => t('All messages'),
    ),
    '#description' => t('It is recommended that sites running on production environments do not display any errors.'),
  );

  return system_settings_form($form);
}

/**
 * Form builder; Configure site performance settings.
 *
 * @ingroup forms
 * @see system_performance_settings_submit().
 */
function system_performance_settings($form, &$form_state) {
  backdrop_add_js(backdrop_get_path('module', 'system') . '/js/system.admin.js');
  $config = config('system.core');

  $form['#config'] = 'system.core';
  $form['clear_cache'] = array(
    '#type' => 'fieldset',
    '#title' => t('Clear cache'),
  );

  $form['clear_cache']['clear'] = array(
    '#type' => 'submit',
    '#value' => t('Clear all caches'),
    '#submit' => array('system_clear_cache_submit'),
  );

  $form['caching'] = array(
    '#type' => 'fieldset',
    '#title' => t('Caching'),
  );

  $form['caching']['cache'] = array(
    '#type' => 'checkbox',
    '#title' => t('Cache pages for anonymous users'),
    '#default_value' => $config->get('cache'),
    '#weight' => -2,
  );
  $form['caching']['page_cache_background_fetch'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use background fetch for cached pages'),
    '#default_value' => $config->get('page_cache_background_fetch'),
    '#description' => t('Allows serving stale pages while new page cache entries are being generated.'),
    '#states' => array(
      'visible' => array(
        ':input[name="cache"]' => array('checked' => TRUE),
      ),
    ),
  );
  $period = backdrop_map_assoc(array(60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 900, 1800, 2700, 3600, 10800, 21600, 32400, 43200, 86400), 'format_interval');
  $form['caching']['page_cache_maximum_age'] = array(
    '#type' => 'select',
    '#title' => t('Expiration of cached pages'),
    '#default_value' => $config->get('page_cache_maximum_age'),
    '#options' => $period,
    '#description' => t('The maximum time the page cache can use an old version of a page.'),
    '#states' => array(
      'visible' => array(
        ':input[name="cache"]' => array('checked' => TRUE),
      ),
    ),
  );

  $directory = 'public://';
  $is_writable = is_dir($directory) && is_writable($directory);
  $disabled = !$is_writable;
  $disabled_message = '';
  if (!$is_writable) {
    $disabled_message = ' ' . t('<strong class="error">Set up the <a href="!file-system">public files directory</a> to make these optimizations available.</strong>', array('!file-system' => url('admin/config/media/file-system')));
  }

  $form['bandwidth_optimization'] = array(
    '#type' => 'fieldset',
    '#title' => t('Bandwidth optimization'),
    '#description' => t('External resources can be optimized automatically, which can reduce both the size and number of requests made to your website.') . $disabled_message,
  );

  $form['bandwidth_optimization']['page_compression'] = array(
    '#type' => 'checkbox',
    '#title' => t('Compress cached pages.'),
    '#default_value' => $config->get('page_compression'),
    '#states' => array(
      'visible' => array(
        'input[name="cache"]' => array('checked' => TRUE),
      ),
    ),
  );
  $form['bandwidth_optimization']['preprocess_css'] = array(
    '#type' => 'checkbox',
    '#title' => t('Aggregate and compress CSS files.'),
    '#default_value' => $config->get('preprocess_css'),
    '#disabled' => $disabled,
  );
  $form['bandwidth_optimization']['preprocess_js'] = array(
    '#type' => 'checkbox',
    '#title' => t('Aggregate JavaScript files.'),
    '#default_value' => $config->get('preprocess_js'),
    '#disabled' => $disabled,
  );

  $form['#submit'][] = 'backdrop_clear_css_cache';
  $form['#submit'][] = 'backdrop_clear_js_cache';
  // This form allows page compression settings to be changed, which can
  // invalidate the page cache, so it needs to be cleared on form submit.
  $form['#submit'][] = 'system_clear_page_cache_submit';

  return system_settings_form($form);
}

/**
 * Submit callback; clear system caches.
 *
 * @ingroup forms
 */
function system_clear_cache_submit($form, &$form_state) {
  backdrop_flush_all_caches();
  backdrop_set_message(t('Caches cleared.'));
}

/**
 * Submit callback; clear the page cache.
 *
 * @ingroup forms
 */
function system_clear_page_cache_submit($form, &$form_state) {
  cache('page')->flush();
}

/**
 * Form builder; Configure the site file handling.
 *
 * @ingroup forms
 */
function system_file_system_settings() {
  $form['#config'] = 'system.core';
  $form['file_public_path'] = array(
    '#type' => 'textfield',
    '#title' => t('Public file system path'),
    '#default_value' => config_get('system.core', 'file_public_path'),
    '#maxlength' => 255,
    '#description' => t('A local file system path where public files will be stored. This directory must exist and be writable by Backdrop. This directory must be relative to the Backdrop installation directory and be accessible over the web.'),
    '#after_build' => array('system_check_directory'),
  );

  $form['file_private_path'] = array(
    '#type' => 'textfield',
    '#title' => t('Private file system path'),
    '#default_value' => config_get('system.core', 'file_private_path'),
    '#maxlength' => 255,
    '#description' => t('An existing local file system path for storing private files. It should be writable by Backdrop and not accessible over the web. See the online handbook for <a href="@handbook">more information about securing private files</a>.', array('@handbook' => 'http://drupal.org/handbook/modules/file')),
    '#after_build' => array('system_check_directory'),
  );

  $form['file_temporary_path'] = array(
    '#type' => 'textfield',
    '#title' => t('Temporary directory'),
    '#default_value' => file_directory_temp(),
    '#maxlength' => 255,
    '#description' => t('A local file system path where temporary files will be stored. This directory should not be accessible over the web.'),
    '#after_build' => array('system_check_directory'),
  );
  // Any visible, writeable wrapper can potentially be used for the files
  // directory, including a remote file system that integrates with a CDN.
  foreach (file_get_stream_wrappers(STREAM_WRAPPERS_WRITE_VISIBLE) as $scheme => $info) {
    $options[$scheme] = check_plain($info['description']);
  }

  if (!empty($options)) {
    $default_scheme = config_get('system.core', 'file_default_scheme');
    $default_scheme = isset($options[$default_scheme]) ? $default_scheme : key($options);
    $form['file_default_scheme'] = array(
      '#type' => 'radios',
      '#title' => t('Default download method'),
      '#default_value' => $default_scheme,
      '#options' => $options,
      '#description' => t('This setting is used as the preferred download method. The use of public files is more efficient, but does not provide any access control.'),
    );
  }

  $form['transliteration'] = array(
    '#type' => 'item',
    '#title' => t('Transliteration'),
    '#value' => '',
  );
  $form['transliteration']['file_transliterate_uploads'] = array(
    '#type' => 'checkbox',
    '#title' => t('Transliterate file names during upload'),
    '#description' => t('Enable to convert file names to US-ASCII character set for cross-platform compatibility. If you enable this setting later, you may want to <a href="@transliteration">retroactively transliterate existing file names</a>.', array('@transliteration' => url('admin/config/media/file-system/transliteration'))),
    '#default_value' => config_get('system.core', 'file_transliterate_uploads'),
  );
  $form['transliteration']['file_transliterate_uploads_display_name'] = array(
    '#type' => 'checkbox',
    '#title' => t('Transliterate the displayed file name'),
    '#description' => t('Enable to also convert the file name that is displayed within the site (for example, in link text).'),
    '#default_value' => config_get('system.core', 'file_transliterate_uploads_display_name'),
    '#states' => array(
      'invisible' => array(
        'input[name="file_transliterate_uploads"]' => array('checked' => FALSE),
      ),
    ),
  );
  $form['transliteration']['file_transliterate_lowercase'] = array(
    '#type' => 'checkbox',
    '#title' => t('Lowercase transliterated file names'),
    '#default_value' => config_get('system.core', 'file_transliterate_lowercase'),
    '#description' => t('This is a recommended setting to prevent issues with case-insensitive file systems. It has no effect if transliteration has been disabled.'),
    '#states' => array(
      'invisible' => array(
        'input[name="file_transliterate_uploads"]' => array('checked' => FALSE),
      ),
    ),
  );

  return system_settings_form($form);
}

/**
 * Form builder; Configure site image toolkit usage.
 *
 * @ingroup forms
 */
function system_image_toolkit_settings() {
  $toolkits_available = image_get_available_toolkits();
  $current_toolkit = image_get_toolkit();

  if (count($toolkits_available) == 0) {
    config_set('system.core', 'image_toolkit', '');
    $form['image_toolkit_help'] = array(
      '#markup' => t("No image toolkits were detected. Backdrop includes support for <a href='!gd-link'>PHP's built-in image processing functions</a> but they were not detected on this system. You should consult your system administrator to have them enabled, or try using a third party toolkit.", array('gd-link' => url('http://php.net/gd'))),
    );
    return $form;
  }

  if (count($toolkits_available) > 1) {
    $form['image_toolkit'] = array(
      '#type' => 'radios',
      '#title' => t('Select an image processing toolkit'),
      '#default_value' => $current_toolkit,
      '#options' => $toolkits_available
    );
  }
  else {
    $form['image_toolkit'] = array(
      '#type' => 'value',
      '#value' => $current_toolkit,
    );
  }

  // Get the toolkit's settings form.
  $function = 'image_' . $current_toolkit . '_settings';
  if (function_exists($function)) {
    $form['image_toolkit_settings'] = $function();
  }

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Submit handler for system_image_toolkit_settings().
 */
function system_image_toolkit_settings_submit($form, &$form_state) {
  form_state_values_clean($form_state);
  $config = config('system.core');

  // Save the toolkit itself.
  $config->set('image_toolkit', $form_state['values']['image_toolkit']);

  // Save toolkit settings.
  $toolkit_keys = element_children($form['image_toolkit_settings']);
  foreach ($form_state['values'] as $key => $value) {
    if (in_array($key, $toolkit_keys)) {
      $config->set($key, $value);
    }
  }

  $config->save();
  backdrop_set_message(t('The configuration options have been saved.'));
}

/**
 * Form builder; Configure how the site handles RSS feeds.
 *
 * @ingroup forms
 */
function system_rss_feeds_settings() {
  $rss_config = config('system.core');
  $form['#config'] = 'system.core';
  $form['rss_description'] = array(
    '#type' => 'textarea',
    '#title' => t('Feed description'),
    '#default_value' => $rss_config->get('rss_description'),
    '#description' => t('Description of your site, included in each feed.')
  );
  $form['rss_limit'] = array(
    '#type' => 'select',
    '#title' => t('Number of items in each feed'),
    '#default_value' => $rss_config->get('rss_limit'),
    '#options' => backdrop_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30)),
    '#description' => t('Default number of items to include in each feed.')
  );
  $form['rss_viewmode'] = array(
    '#type' => 'select',
    '#title' => t('Feed content'),
    '#default_value' => $rss_config->get('rss_viewmode'),
    '#options' => array(
      'title' => t('Titles only'),
      'teaser' => t('Titles plus teaser'),
      'fulltext' => t('Full text'),
    ),
    '#description' => t('Global setting for the default display of content items in each feed.')
  );

  return system_settings_form($form);
}

/**
 * Form builder; Configure the site regional settings.
 *
 * @ingroup forms
 * @see system_regional_settings_submit()
 */
function system_regional_settings($form, &$form_state) {
  include_once BACKDROP_ROOT . '/core/includes/locale.inc';
  $countries = country_get_list();
  $system_date = config('system.date');

  // Date settings:
  $zones = system_time_zones();

  $form['locale'] = array(
    '#type' => 'fieldset',
    '#title' => t('Locale'),
  );

  $form['locale']['site_default_country'] = array(
    '#type' => 'select',
    '#title' => t('Default country'),
    '#empty_value' => '',
    '#default_value' => $system_date->get('default_country'),
    '#options' => $countries,
    '#attributes' => array('class' => array('country-detect')),
  );

  $form['locale']['date_first_day'] = array(
    '#type' => 'select',
    '#title' => t('First day of week'),
    '#default_value' => $system_date->get('first_day'),
    '#options' => array(0 => t('Sunday'), 1 => t('Monday'), 2 => t('Tuesday'), 3 => t('Wednesday'), 4 => t('Thursday'), 5 => t('Friday'), 6 => t('Saturday')),
  );

  $form['timezone'] = array(
    '#type' => 'fieldset',
    '#title' => t('Time zones'),
  );

  $date_default_timezone = $system_date->get('default_timezone');
  $form['timezone']['date_default_timezone'] = array(
    '#type' => 'select',
    '#title' => t('Default time zone'),
    '#default_value' => isset($date_default_timezone) ? $date_default_timezone : date_default_timezone_get(),
    '#options' => $zones,
  );

  $configurable_timezones = $system_date->get('user_configurable_timezones');
  $form['timezone']['configurable_timezones'] = array(
    '#type' => 'checkbox',
    '#title' => t('Users may set their own time zone.'),
    '#default_value' => $configurable_timezones,
  );

  $form['timezone']['configurable_timezones_wrapper'] =  array(
    '#type' => 'container',
    '#states' => array(
      // Hide the user configured timezone settings when users are forced to use
      // the default setting.
      'invisible' => array(
        'input[name="configurable_timezones"]' => array('checked' => FALSE),
      ),
    ),
  );
  $form['timezone']['configurable_timezones_wrapper']['empty_timezone_message'] = array(
    '#type' => 'checkbox',
    '#title' => t('Remind users at login if their time zone is not set.'),
    '#default_value' => $system_date->get('user_empty_timezone_message'),
    '#description' => t('Only applied if users may set their own time zone.')
  );

  $form['timezone']['configurable_timezones_wrapper']['user_default_timezone'] = array(
    '#type' => 'radios',
    '#title' => t('Time zone for new users'),
    '#default_value' => $system_date->get('user_default_timezone'),
    '#options' => array(
      BACKDROP_USER_TIMEZONE_DEFAULT => t('Default time zone.'),
      BACKDROP_USER_TIMEZONE_EMPTY   => t('Empty time zone.'),
      BACKDROP_USER_TIMEZONE_SELECT  => t('Users may set their own time zone at registration.'),
    ),
    '#description' => t('Only applied if users may set their own time zone.')
  );

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  return $form;
}

/**
 * Form submission handler for regional settings.
 *
 * @ingroup forms
 * @see system_regional_settings()
 */
function system_regional_settings_submit($form, &$form_state) {
  config('system.date')
    ->set('default_country', $form_state['values']['site_default_country'])
    ->set('first_day', $form_state['values']['date_first_day'])
    ->set('default_timezone', $form_state['values']['date_default_timezone'])
    ->set('user_configurable_timezones', $form_state['values']['configurable_timezones'])
    ->set('user_empty_timezone_message', $form_state['values']['empty_timezone_message'])
    ->set('user_default_timezone', $form_state['values']['user_default_timezone'])
    ->save();
  // Display status messages for this form.
  backdrop_set_message(t('The configuration options have been saved.'));
}

/**
 * Form builder; Configure the site's maintenance status.
 *
 * @ingroup forms
 * @see system_site_maintenance_mode_submit()
 */
function system_site_maintenance_mode($form, &$form_state) {
  $config = config('system.core');
  $form['maintenance_mode'] = array(
    '#type' => 'checkbox',
    '#title' => t('Put site into maintenance mode'),
    '#default_value' => state_get('maintenance_mode', FALSE),
    '#description' => t('Visitors will only see the maintenance mode message. Only users with the "Access site in maintenance mode" <a href="@permissions-url">permission</a> will be able to access the site. Authorized users can log in directly via the <a href="@user-login">user login</a> page.', array('@permissions-url' => url('admin/config/people/permissions'), '@user-login' => url('user'))),
  );
  $form['maintenance_mode_message'] = array(
    '#type' => 'textarea',
    '#title' => t('Message to display when in maintenance mode'),
    '#default_value' => t($config->get('maintenance_mode_message'), array('@site' => config_get('system.core', 'site_name'))),
  );

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  return $form;
}

/**
 * Submit handler for the system_site_maintenance_mode() form.
 */
function system_site_maintenance_mode_submit($form, &$form_state) {
  state_set('maintenance_mode', (bool) $form_state['values']['maintenance_mode']);
  config_set('system.core', 'maintenance_mode_message', $form_state['values']['maintenance_mode_message']);

  // Give specific messages on the primary action for this form.
  if ($form_state['values']['maintenance_mode']) {
    backdrop_set_message(t('The site is now in maintenance mode. Only users with the "Access site in maintenance mode" permission will be able to access the site.'), 'warning');
  }
  elseif ($form['maintenance_mode']['#default_value'] != $form_state['values']['maintenance_mode']) {
    backdrop_get_messages();
    backdrop_set_message(t('The site is no longer in maintenance mode.'));
  }
  else {
    backdrop_set_message(t('The configuration options have been saved.'));
  }
}

/**
 * Form builder; Configure clean URL settings.
 *
 * @ingroup forms
 */
function system_urls_settings($form, &$form_state) {
  $available = FALSE;
  $conflict = FALSE;

  // If the request URI is a clean URL, clean URLs must be available.
  // Otherwise, run a test.
  if (strpos(request_uri(), '?q=') === FALSE && strpos(request_uri(), '&q=') === FALSE) {
    $available = TRUE;
  }
  else {
    $request = backdrop_http_request($GLOBALS['base_url'] . '/admin/config/urls/urls/check');
    // If the request returns HTTP 200, clean URLs are available.
    if (isset($request->code) && $request->code == 200) {
      $available = TRUE;
      // If the user started the clean URL test, provide explicit feedback.
      if (isset($form_state['input']['clean_url_test_execute'])) {
        backdrop_set_message(t('The clean URL test passed.'));
      }
    }
    else {
      if ($request->error) {
        watchdog('system', 'HTTP request for Clean URLs failed with error: @error', array('@error' => $request->error));
      }

      // If the test failed while clean URLs are enabled, make sure clean URLs
      // can be disabled.
      if (config_get('system.core', 'clean_url')) {
        $conflict = TRUE;
        // Warn the user of a conflicting situation, unless after processing
        // a submitted form.
        if (!isset($form_state['input']['op'])) {
          backdrop_set_message(t('Clean URLs are enabled, but the clean URL test failed. Uncheck the box below to disable clean URLs.'), 'warning');
        }
      }
      // If the user started the clean URL test, provide explicit feedback.
      elseif (isset($form_state['input']['clean_url_test_execute'])) {
        backdrop_set_message(t('The clean URL test failed.'), 'warning');
      }
    }
  }

  $form['#config'] = 'system.core';
  // Show the enable/disable form if clean URLs are available or if the user
  // must be able to resolve a conflicting setting.
  if ($available || $conflict) {
    $form['clean_url'] = array(
      '#type' => 'checkbox',
      '#title' => t('Enable clean URLs'),
      '#default_value' => config_get('system.core', 'clean_url'),
      '#description' => t('Use URLs like <code>example.com/user</code> instead of <code>example.com/?q=user</code>.'),
    );
    if ($conflict) {
      // $form_state['redirect'] needs to be set to the non-clean URL,
      // otherwise the setting is not saved.
      $form_state['redirect'] = url('', array('query' => array('q' => '/admin/config/search/clean-urls')));
    }
  }
  // Show the clean URLs test form.
  else {
    backdrop_add_js(backdrop_get_path('module', 'system') . '/js/system.admin.js');

    $form_state['redirect'] = url('admin/config/search/clean-urls');
    $form['clean_url_description'] = array(
      '#type' => 'markup',
      '#markup' => '<p>' . t('Use URLs like <code>example.com/user</code> instead of <code>example.com/?q=user</code>.'),
    );
    // Explain why the user is seeing this page and what to expect after
    // clicking the 'Run the clean URL test' button.
    $form['clean_url_test_result'] = array(
      '#type' => 'markup',
      '#markup' => '<p>' . t('Clean URLs cannot be enabled. If you are directed to this page or to a <em>Page not found (404)</em> error after testing for clean URLs, see the <a href="@handbook">online handbook</a>.', array('@handbook' => 'http://drupal.org/node/15365')) . '</p>',
    );
    $form['actions'] = array('#type' => 'actions');
    $form['actions']['clean_url_test'] = array(
      '#type' => 'submit',
      '#value' => t('Run the clean URL test'),
      '#submit' => array(),
    );
    $form['clean_url_test_execute'] = array(
      '#type' => 'hidden',
      '#value' => 1,
    );
  }

  $form['canonical_secure'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use HTTPS for canonical URLs'),
    '#default_value' => config_get('system.core', 'canonical_secure'),
    '#description' => t('This option makes Backdrop use HTTPS protocol for generated canonical URLs. Please note: to get it working in mixed-mode (both secure and insecure) sessions, the variable "https" should be set to TRUE in your file <code>settings.php</code>' ),
  );

  return system_settings_form($form);
}

/**
 * Menu callback: displays the site status report. Can also be used as a pure check.
 *
 * @param $check
 *   If true, only returns a boolean whether there are system status errors.
 *   This parameter will be removed in Backdrop 2.0.
 *
 * @see system_get_requirements().
 */
function system_status($check = FALSE) {
  // Load .install files
  include_once BACKDROP_ROOT . '/core/includes/install.inc';
  $requirements = system_get_requirements();

  // @todo remove this check and return in Backdrop 2.0.
  if ($check) {
    return backdrop_requirements_severity($requirements) == REQUIREMENT_ERROR;
  }
  // MySQL import might have set the uid of the anonymous user to autoincrement
  // value. Let's try fixing it. See http://drupal.org/node/204411
  db_update('users')
    ->expression('uid', 'uid - uid')
    ->condition('name', '')
    ->condition('pass', '')
    ->condition('status', 0)
    ->execute();
  return theme('status_report', array('requirements' => $requirements));
}

/**
 * Menu callback: run cron manually.
 */
function system_run_cron() {
  // Run cron manually
  if (backdrop_cron_run()) {
    backdrop_set_message(t('Cron ran successfully.'));
  }
  else {
    backdrop_set_message(t('Cron run failed.'), 'error');
  }

  backdrop_goto('admin/reports/status');
}

/**
 * Menu callback: return information about PHP.
 */
function system_php() {
  phpinfo();
  backdrop_exit();
}

/**
 * Default page callback for batches.
 */
function system_batch_page() {
  require_once BACKDROP_ROOT . '/core/includes/batch.inc';
  $output = _batch_page();

  if ($output === FALSE) {
    backdrop_access_denied();
  }
  else {
    return $output;
  }
}

/**
 * Menu callback; present a form for deleting a date format.
 *
 * @param array $format
 *   The date format being deleted.
 */
function system_date_delete_format_form($form, &$form_state, $format) {
  $form_state['format'] = $format;

  // Do not allow deletion of module-provided formats.
  if (!empty($format['module'])) {
    backdrop_access_denied();
    backdrop_exit();
  }

  $output = confirm_form($form,
    t('Are you sure you want to remove the format %label: %format?', array('%label' => $format['label'], '%format' => format_date(REQUEST_TIME, 'custom', $format['pattern']))),
    'admin/config/regional/date-time/formats',
    t('This action cannot be undone.'),
    t('Remove'), t('Cancel'),
    'confirm'
  );

  return $output;
}

/**
 * Delete a configured date format.
 */
function system_date_delete_format_form_submit($form, &$form_state) {
  $format = $form_state['format'];
  system_date_format_delete($format['name']);
  token_cache_clear();
  backdrop_set_message(t('Removed date format %format.', array('%format' => $format['label'])));
  $form_state['redirect'] = 'admin/config/regional/date-time/formats';
}

/**
 * Displays the date format strings overview page.
 */
function system_date_time_formats() {
  $header = array(
    array('data' => t('Label')),
    array('data' => t('Machine name')),
    array('data' => t('Pattern')),
    array('data' => t('Operations'))
  );
  $rows = array();

  $formats = system_get_date_formats();
  if (!empty($formats)) {
    foreach ($formats as $date_format_name => $format_info) {
      // Do not display date formats that are hidden.
      if (empty($format_info['hidden'])) {
        $row = array();
        $row[] = array('data' => check_plain($format_info['label']));
        $row[] = array('data' => $date_format_name);
        $row[] = array('data' => format_date(REQUEST_TIME, 'custom', $format_info['pattern']));

        // Prepare Operational links.
        $links = array();
        $links['edit'] = array(
          'title' => t('Edit'),
          'href' => 'admin/config/regional/date-time/formats/' . $date_format_name . '/edit',
        );
        if (module_exists('locale')) {
          $links['localize'] = array(
            'title' => t('Localize'),
            'href' => 'admin/config/regional/date-time/formats/' . $date_format_name . '/localize',
          );
        }
        // Do not allow deletion of module-provided formats.
        if (empty($format_info['module'])) {
          $links['delete'] = array(
            'title' => t('Delete'),
            'href' => 'admin/config/regional/date-time/formats/' . $date_format_name . '/delete',
          );
        }
        $row['operations'] = array('data' => array(
          '#type' => 'operations',
          '#links' => $links,
        ));

        $rows[] = $row;
      }
    }
  }

  $build['date_formats_table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    '#empty' => t('No custom date formats available. <a href="@link">Add date format</a>.', array('@link' => url('admin/config/regional/date-time/formats/add'))),
  );

  return $build;
}

/**
 * Allow users to add additional date formats.
 *
 * @param string $format
 *   (optional) When present, provides the format being edited, otherwise a new
 *   format is being created.
 */
function system_configure_date_formats_form($form, &$form_state, $format = NULL) {
  if ($format) {
    backdrop_set_title(t('Edit %format', array('%format' => $format['label'])), PASS_THROUGH);
  }
  $form_state['format'] = $format;

  $form['label'] = array(
    '#type' => 'textfield',
    '#title' => 'Label',
    '#maxlength' => 100,
    '#default_value' => empty($format['label']) ? '' : $format['label'],
    '#description' => t('A name for the new format'),
    '#placeholder' => t('e.g. My date format'),
  );

  $form['name'] = array(
    '#type' => 'machine_name',
    '#title' => t('Machine-readable name'),
    '#description' => t('A unique machine-readable name. Can only contain lowercase letters, numbers, and underscores.'),
    '#disabled' => !empty($format),
    '#default_value' => $format['name'],
    '#machine_name' => array(
      'exists' => 'system_date_format_load',
      'source' => array('label'),
    ),
  );

  $pattern = isset($form_state['values']['pattern']) ? $form_state['values']['pattern'] : (isset($format['pattern']) ? $format['pattern'] : '');
  $preview = !empty($pattern) ? t('Displayed as %date', array('%date' => format_date(REQUEST_TIME, 'custom', $pattern))) : '';

  $form['pattern'] = array(
    '#type' => 'textfield',
    '#title' => t('Format string'),
    '#maxlength' => 100,
    '#description' => t('A date format using PHP date and time codes. See the <a href="@url">PHP manual</a> for available options.', array('@url' => 'http://php.net/manual/function.date.php')),
    '#placeholder' => t('e.g. F j Y'),
    '#default_value' => $pattern,
    '#field_suffix' => '<small class="pattern-preview">' . $preview . '</small>',
    '#ajax' => array(
      'callback' => 'system_date_time_lookup',
      'event' => 'keyup',
      'progress' => array('type' => 'none', 'message' => NULL),
      'disable' => FALSE,
    ),
    '#required' => TRUE,
    '#wrapper_attributes' => array(
      'id' => 'date-format-pattern',
    ),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => (!empty($format['name']) ? t('Save format') : t('Add format')),
  );

  return $form;
}

/**
 * Process date format string submission.
 */
function system_configure_date_formats_form_submit($form, &$form_state) {
  $format = (array) $form_state['format'];
  $format = array_merge($format, $form_state['values']);
  system_date_format_save($format);
  token_cache_clear();
  if (!empty($form_state['values']['name'])) {
    backdrop_set_message(t('Date format updated.'));
  }
  else {
    backdrop_set_message(t('Custom date format added.'));
  }

  $form_state['redirect'] = 'admin/config/regional/date-time/formats';
}

/**
 * Ajax callback; Returns the date for a given format string.
 */
function system_date_time_lookup($form, &$form_state) {
  // Replace the preview based on the textfield's wrapper ID.
  $element = $form_state['triggering_element'];
  $parent_id = $element['#wrapper_attributes']['id'];
  $commands[] = ajax_command_html("#$parent_id .field-suffix", '<span>' . $element['#field_suffix'] . '</span>');
  return array('#type' => 'ajax', '#commands' => $commands);
}

/**
 * Form to convert existing database tables to utf8mb4 if supported.
 */
function system_utf8mb4_convert_form($form, &$form_state) {
  // Reuse the installation requirements checking and messages.
  module_load_install('system');
  $requirements = _system_check_db_utf8mb4_requirements('runtime');

  $connection = Database::getConnection();
  $utf8mb4_active = $connection->utf8mb4IsActive();
  $utf8mb4_supported = $connection->utf8mb4IsSupported();
  $utf8mb4_tables_converted = state_get('database_utf8mb4_active', FALSE);

  $form['help'] = array(
    '#markup' => '<p>' . $requirements['description'] . '</p>',
  );

  // Not active and/or supported. Existing messages should be sufficient.
  if (!$utf8mb4_active || !$utf8mb4_supported) {
    return $form;
  }

  // Already active and supported. Indicate completion.
  if ($utf8mb4_active && $utf8mb4_supported && $utf8mb4_tables_converted) {
    $form['help']['#markup'] .= '<p>' . t('This feature is already enabled on your site, no further action is needed.') . '</p>';
    return $form;
  }

  $form['help']['#markup'] .= '<p>' . t('This operation is irreversible! Make sure that you have backed up your database before continuing. Your site will be put into maintenance mode during the upgrade. A site with hundreds of pieces of content should take a few minutes. Sites with thousands of pieces of content may take @minutes minutes or more.', array('@minutes' => 10)) . '</p>';

  $form['actions'] = array(
    '#type' => 'actions',
  );
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Upgrade database to 4 byte UTF-8'),
  );
  $form['actions']['cancel'] = array(
    '#type' => 'link',
    '#title' => t('Cancel'),
    '#href' => 'admin/reports/status',
  );

  return $form;
}

/**
 * Form submit function; convert existing database tables to utf8mb4.
 *
 * @see system_utf8mb4_convert_form()
 */
function system_utf8mb4_convert_form_submit($form, &$form_state) {
  global $databases;

  // Enter maintenance mode.
  state_set('maintenance_mode', TRUE);

  // Build the list of tables to convert.
  $database = $databases['default']['default'];
  $like = '';
  if (!empty($database['prefix'])) {
    $like = ' LIKE "' . $database['prefix'] . '%"';
  }
  $table_names = db_query('SHOW TABLES' . $like)->fetchCol();

  $batch = array(
    'operations' => array(
      array('_system_utf8mb4_convert_batch', array($table_names))
    ),
    'finished' => '_system_utf8mb4_convert_batch_finished',
    'title' => t('Converting database tables'),
    'progress_message' => '',
    'init_message' => t('Collecting list of tables...'),
    'error_message' => t('The update has encountered an error.'),
    'file' => backdrop_get_path('module', 'system') . '/system.admin.inc',
  );
  batch_set($batch);
}

/**
 * Executes a batch operation for system_utf8mb4_convert_form_submit().
 *
 * @param array $tables
 *   Associative array of table names to update.
 * @param array $context
 *   Batch array of contextual key/values.
 */
function _system_utf8mb4_convert_batch($tables, &$context) {
  global $databases;

  // Instantiate a character set converter object.
  $converter = new DatabaseCharsetConverter();

  // Initial run, prepare sandbox and results arrays.
  if (!isset($context['sandbox']['progress'])) {
    $context['sandbox']['progress'] = 0;
    $context['sandbox']['max'] = count($tables) + 1;
    $context['sandbox']['tables_to_process'] = $tables;
    $context['results']['converted'] = array();
    $context['results']['errors'] = array();

    // If converting the database itself fails, bail out entirely.
    try {
      $result = $converter->convertDatabase($databases['default']['default']['database']);
      if (!$result) {
        $context['results']['errors'][] = t('The database %name could not be converted.', array('%name' => $databases['default']['default']['database']));
        $context['finished'] = 1;
        return;
      }
    }
    catch (PDOException $e) {
      $context['results']['errors'] = $e->getMessage();
      $context['finished'] = 1;
      return;
    }
  }
  // Subsequent runs, convert each table.
  else {
    // When converting tables, record but continue after failures.
    $table_name = array_shift($context['sandbox']['tables_to_process']);
    try {
      $result = $converter->convertTable($table_name);
      if (!$result) {
        $context['results']['errors'][] = t('The table %name could not be converted.', array('%name' => $table_name));
      }
    }
    catch (PDOException $e) {
      $context['results']['errors'][] = $e->getMessage();
    }

    // Store result for post-processing in the finished callback.
    $context['results']['converted'][] = $table_name;
  }

  // Update our progress information.
  $context['sandbox']['progress']++;
  if (!empty($context['sandbox']['tables_to_process'])) {
    $context['message'] = t('Converting database table "@table_name"...', array('@table_name' => reset($context['sandbox']['tables_to_process'])));
    $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
  }
  else {
    $context['message'] = t('Completing...');
    $context['finished'] = 1;
  }
}

/**
 * Performs post-processing for node_access_rebuild().
 *
 * @param bool $success
 *   A boolean indicating whether the re-build process has completed.
 * @param array $results
 *   An array of results information.
 * @param array $operations
 *   An array of function calls (not used in this function).
 */
function _system_utf8mb4_convert_batch_finished($success, $results, $operations) {
  if ($success) {
    backdrop_set_message(t('Upgrade successful. @count database tables have been converted to use 4 byte UTF-8.', array('@count' => count($results['converted']))));
    state_set('maintenance_mode', FALSE);
    state_set('database_utf8mb4_active', TRUE);
  }
  else {
    backdrop_set_message(t('An error was encountered while converting tables! You should restore a database backup, correct any errors, and then try again. Errors reported:') . theme('item_list', $results['errors']), 'error');
  }
  backdrop_goto('admin/reports/status');
}

/**
 * Form builder function; generates retroactive transliteration confirm form.
 *
 * @see system_transliteration_retroactive_submit()
 * @ingroup forms
 */
function system_transliteration_retroactive() {
  $query = system_transliteration_file_query();
  $count = $query->countQuery()->execute()->fetchColumn();
  if (!$count) {
    if (empty($_POST)) {
      backdrop_set_message(t('Transliteration is not required.'));
    }
    $form['description']['#markup'] = t('There are currently no file names containing non-ASCII characters. Return to the !file_system page.', array('!file_system' => l('File system', 'admin/config/media/file-system')));
    return $form;
  }

  if (!config_get('system.core', 'file_transliterate_uploads')) {
    backdrop_set_message(t('File transliteration is not yet enabled.'), 'warning');
    $form['description']['#markup'] = t('You must enable the "@option" on the !file_system page to use this form.', array('@option' => t('Transliterate file names during upload'), '!file_system' => l('File system', 'admin/config/media/file-system')));
    return $form;
  }

  $form['#redirect'] = 'admin/config/media/file-system/settings';
  $question = t('Are you sure you want to transliterate existing file names?');

  // Generate a sample list.
  $rows = array();
  $header = array(
    t('Original file name'),
    t('Transliterated file name')
  );
  include_once BACKDROP_ROOT . '/core/includes/transliteration.inc';
  foreach ($query->range(0, 10)->execute() as $file) {
    $filename = backdrop_basename($file->uri);
    $rows[] = array(l($filename, file_create_url($file->uri)), transliteration_clean_filename($filename));
  }
  $description = '<p><strong>' . t('The database currently lists @x_filenames containing non-ASCII characters.', array('@x_filenames' => format_plural($count, '1 file name', '@count file names'))) . '</strong><br />';
  $description .= t('This count might be inaccurate, though, since some files may not need to be renamed. For example, off-site files will never be changed.') . '</p>';
  $description .= theme('table', array('header' => $header, 'sticky' => FALSE, 'rows' => $rows));
  if ($count > 10) {
    $description .= '<p>' . t('Note: table shows only the first 10 entries.') . '</p>';
  }
  $description .= '<p>' . t('<strong>WARNING:</strong> if you have manually entered image or file paths in text fields (for example, text areas or WYSIWYG editors), renaming the files will break these references. Since there is currently no automated way to also fix referenced files in textual contents, it is a very good idea to backup the database and %files directory beforehand. Modules accessing files using their internal system ids are not affected.', array('%files' => backdrop_realpath(file_default_scheme() . '://'))) . '</p>';
  $description .= '<p>' . t('This action cannot be undone.') . '</p>';

  return confirm_form($form, $question, 'admin/config/media/file-system/settings', $description, t('Transliterate'));
}

/**
 * Form submit function; retroactively transliterates existing file names.
 *
 * @see system_transliteration_retroactive()
 */
function system_transliteration_retroactive_submit($form, &$form_state) {
  include_once BACKDROP_ROOT . '/core/includes/transliteration.inc';
  $count = 0;
  $errors = array();
  $result = system_transliteration_file_query()->execute();

  while ($row = $result->fetchAssoc()) {
    $file = new File($row);
    $wrapper = file_stream_wrapper_get_instance_by_uri($file->uri);
    $scheme = file_uri_scheme($file->uri);

    // Missing implementation.
    if (!$wrapper) {
      $errors[] = file_uri_target($file->uri);
      continue;
    }

    // Skip non-writable stream wrappers.
    $writeable_stream_wrappers = file_get_stream_wrappers(STREAM_WRAPPERS_WRITE);
    if (!isset($writeable_stream_wrappers[$scheme])) {
      continue;
    }

    // Missing file.
    if (!file_exists($wrapper->realpath())) {
      $errors[] = file_uri_target($file->uri);
      continue;
    }

    // Sanitize file name.
    $filename = transliteration_clean_filename(backdrop_basename($file->uri));

    // Build destination URI.
    $destination = file_stream_wrapper_uri_normalize(backdrop_dirname($file->uri) . '/' . $filename);
    $destination = file_destination($destination, FILE_EXISTS_RENAME);

    // Rename and update the file record accordingly.
    if ($wrapper->rename($file->uri, $destination)) {
      $file->uri = $destination;
      // Don't use file_save() as it modifies the timestamp.
      backdrop_write_record('file_managed', $file, 'fid');
      // Inform modules that the file has been updated.
      module_invoke_all('file_update', $file);
      $count++;
    }
    else {
      $errors[] = file_uri_target($file->uri);
    }
  }

  if ($errors) {
    $message = t('Not all file names could be converted. The following files could not be accessed and have been ignored:');
    $message .= theme('item_list', array('items' => $errors));
    backdrop_set_message($message, 'error');
  }
  else {
    backdrop_set_message(format_plural($count, 'One file name has been successfully transliterated.', '@count file names have been successfully transliterated.'));
  }

  backdrop_flush_all_caches();
}

/**
 * Builds a query that returns all file names from the database containing non-ASCII characters.
 *
 * @return
 *   SelectQuery
 */
function system_transliteration_file_query() {
  $operator = 'NOT REGEXP';
  if (config_get('system.core', 'file_transliterate_lowercase')) {
    $operator .= ' BINARY';
  }
  $regex = '/[a-z0-9_.-]+$';

  return db_select('file_managed')
    ->fields('file_managed')
    ->condition('uri', $regex, $operator);
}

/**
 * Ajax callback; Returns the transliterated version for a given string.
 *
 * This callback takes an array of arguments from $_GET and passes them to
 * system_transliterate_machine_name().
 *
 * @param $string
 *   The string to be transliterated.
 */
function system_transliterate_ajax($string = '') {
  backdrop_add_http_header('Content-Type', 'text/plain');
  $string = system_transliterate_machine_name($string, $_GET);

  print $string;
  backdrop_exit();
}

/**
 * Access callback for system/transliterate/%. Validates transliteration token.
 */
function system_transliterate_ajax_access() {
  $replace = isset($_GET['replace']) ? $_GET['replace'] : '_';
  $replace_pattern = isset($_GET['replace_pattern']) ? $_GET['replace_pattern'] : '[^0-9A-Za-z' . $replace . ']+';
  $replace_token = isset($_GET['replace_token']) ? $_GET['replace_token'] : '';
  return backdrop_valid_token($replace_token, $replace_pattern);
}

/**
 * Wrapper around transliteration_get() that handles common clean up on strings.
 *
 * @param string $string
 *   The string to be transliterated.
 * @param $options
 *   An array of options for further cleanup. This array includes:
 *   - langcode: The language code of the source string.
 *   - replace: The character with which to replace unknown characters in the
 *     string. Defaults to '_'.
 *   - replace_pattern: A pattern for replacing unknown characters with the
 *     "replace" value.
 *   - maxlength: The maximum allowed length of the returned string.
 * @return string
 *   The transliterated and cleaned up string.
 */
function system_transliterate_machine_name($string, $options) {
  include_once BACKDROP_ROOT . '/core/includes/transliteration.inc';
  $defaults = array(
    'langcode' => $GLOBALS['language']->langcode,
    'replace' => '_',
    'replace_pattern' => NULL,
    'maxlength' => NULL,
  );
  $options = array_intersect_key($options, $defaults) + $defaults;

  // Build the default replacement pattern on the given "replace" property.
  if (!isset($options['replace_pattern'])) {
    $options['replace_pattern'] = '[^0-9A-Za-z' . $options['replace'] . ']+';
  }

  $replace = $options['replace'];
  $string = transliteration_get($string, $replace, $options['langcode']);

  // Remove remaining unsafe characters.
  if ($options['replace_pattern']) {
    $string = preg_replace('/' . $options['replace_pattern'] . '/', $options['replace'], $string);
  }
  // Replace whitespace.
  $string = str_replace(' ', $replace, $string);
  // Remove leading and trailing whitespace/unknown characters.
  $string = trim($string, $replace);
  // Collapse multiple consecutive replacement characters.
  $replace_regex = strlen($replace) ? "([$replace])[$replace]+|" : '';
  $string = preg_replace("/{$replace_regex}(_)_+|(\\.)\\.+|(-)-+/", '$1$2$3$4$5', $string);

  // Set maxlength.
  if ($options['maxlength']) {
    $string = substr($string, 0, $options['maxlength']);
  }

  return $string;
}
