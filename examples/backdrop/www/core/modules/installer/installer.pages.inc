<?php
/**
 * @file
 * Page callbacks used by the Installer browse pages.
 */

/**
 * Page to display the projects.
 *
 * @param $type
 *   Type of project to view. Must be one of 'module', 'theme' or 'layout'.
 *
 * @return
 *   Themed list of the projects.
 */
function installer_browser_page($type) {
  backdrop_add_js(backdrop_get_path('module', 'installer') . '/js/installer.project_list.js');
  module_load_include('inc', 'installer', 'installer.browser');
  // Show a warning if no zip extension available, but allow to browse and
  // select to view available releases. Install blocked on select versions page.
  installer_browser_check_zip_loaded();

  // Show link to enable page if recently installed modules were not yet 
  // enabled.
  $recent_projects = installer_browser_get_installed_projects();
  foreach ($recent_projects as $project) {
    if ($project['type'] === 'module') {
      backdrop_set_message(t('You have recently installed modules. <a href="@url">Continue to the enable page.</a>', array('@url' => url('admin/installer/install/enable'))), 'status', FALSE);
    }
  }

  switch($type) {
    case 'layout':
      backdrop_set_title(t('Install layouts'));
      break;
    case 'module':
      backdrop_set_title(t('Install modules'));
      break;
    case 'theme':
      backdrop_set_title(t('Install themes'));
      break;
    default:
      break;
  }

  // Save needed filters to session.
  if (isset($_GET['repository'])) {
    $_SESSION['installer_browser_sever_filter'] = $_GET['repository'];
  }
  if (isset($_GET['order'])) {
    $_SESSION['installer_browser_order_filter_' . $type] = $_GET['order'];
  }
  if (isset($_GET['sort'])) {
    $_SESSION['installer_browser_sort_filter_' . $type] = $_GET['sort'];
  }

  // Build the filters.
  $backdrop_version = explode('.', BACKDROP_CORE_COMPATIBILITY);
  $filters = array(
    'version' => $backdrop_version[0],
    'type' => $type,
  );

  // Add filters.
  if (isset($_SESSION['installer_browser_text_filter_' . $type])) {
    $filters['text'] = $_SESSION['installer_browser_text_filter_' . $type];
  }
  if (isset($_SESSION['installer_browser_order_filter_' . $type])) {
    $filters['order'] = $_SESSION['installer_browser_order_filter_' . $type];
  }
  if (isset($_SESSION['installer_browser_sort_filter_' . $type])) {
    $filters['sort'] = $_SESSION['installer_browser_sort_filter_' . $type];
  }

  $filters['items_per_page'] = 20;
  $filters['page'] = isset($_GET['page']) ? $_GET['page'] : 0;

  // Get the projects to display here based on the filters.
  $results = installer_browser_fetch_results($filters);

  // Add defaults to prevent PHP errors if server is down.
  $results += array (
    'total' => 0,
    'projects' => array(),
  );

  // Save the listed projects in the session so it can be used.
  $_SESSION['installer_browser_listed_projects'] = $results['projects'];

  $list = array();
  foreach ($results['projects'] as $project) {
    $list[] = $project;
  }

  // Add the pager.
  $total = $results['total'];
  $items_per_page = 20;
  $page = pager_default_initialize($total, $items_per_page);
  $offset = $items_per_page * $page;
  $start = ($total) ? $offset + 1 : 0;
  $finish = $offset + $items_per_page;
  if ($finish > $total) {
    $finish = $total;
  }

  $filter_form = backdrop_get_form('installer_browser_filters_form', $type);
  $sort_options = installer_browser_get_sort_options();
  $current_order = isset($_SESSION['installer_browser_order_filter_' . $type]) ? $_SESSION['installer_browser_order_filter_' . $type] : 'score';
  $current_sort = isset($_SESSION['installer_browser_sort_filter_' . $type]) ? $_SESSION['installer_browser_sort_filter_' . $type] : 'desc';;

  $build = array();
  $build['content'] = array(
    'installer_browser_filter' => array(
      '#markup' => backdrop_render($filter_form),
      '#weight' => 0,
    ),
    'installer_browser_sort_header' => array(
      '#type' => 'item',
      '#weight' => 2,
      '#wrapper_attributes' => array('class' => array('installer-browser-sort')),
      '#markup' => installer_browser_get_sort_widget($sort_options, $current_order, $current_sort),
    ),
    'installer_browser_header' => array(
      '#type' => 'item',
      '#weight' => 5,
      '#wrapper_attributes' => array('class' => array('installer-browser-page-number')),
      '#markup' => t('Showing @start to @finish of @total.', array(
        '@start' => $start, '@finish' => $finish, '@total' => $total)),
    ),
    'installer_browser_list' => array(
      '#markup' => theme('installer_browser_list', array('projects_list' => $list, 'type' => $type)),
      '#weight' => 10,
    ),
    'pager' => array(
      '#theme' => 'pager',
      '#weight' => 99,
    ),
  );

  return $build;
}

/**
 * Page to display individual projects in a modal.
 *
 * @param $project
 *   The short name of the project to be displayed in the modal.
 *
 * @return
 *   Render array of a themed project.
 */
function installer_browser_project_display($project) {
  $projects = $_SESSION['installer_browser_listed_projects'];
  $form['project_dialog'] = array(
    '#markup' => theme('installer_browser_project_dialog', array('project' => $projects[$project])),
  );
  return $form;
}

/**
 * Menu callback; page to install projects.
 *
 * @param $op
 *   Operation to preform.
 *
 * @return string
 *   The rendered installation page.
 */
function installer_browser_installation_page($op) {
  backdrop_add_css(backdrop_get_path('module', 'installer') . '/css/installer.css', array('preprocess' => FALSE));

  switch ($op) {
    case 'select_versions':
      backdrop_set_title(t("Select versions"));
      $content = installer_browser_installation_select_versions_page();
      break;
    case 'install_dependencies':
      backdrop_set_title(t("Install Dependencies"));
      $content = installer_browser_installation_install_dependencies_page();
      break;
    case 'theme':
      backdrop_set_title(t("Set themes"));
      $content = installer_browser_installation_enable_page('theme');
      break;
    case 'enable':
      backdrop_set_title(t("Enable modules"));
      $content = installer_browser_installation_enable_page();
      break;
    default:
      return MENU_NOT_FOUND;
  }
  return theme('installer_browser_install', array('current_task' => $op, 'main_content' => backdrop_render($content)));
}

/**
 * Menu callback; Task page for the select versions installation task.
 *
 * Shows a form where the user can select which versions to install for each
 * project.
 */
function installer_browser_installation_select_versions_page() {
  module_load_include('inc', 'installer', 'installer.browser');
  // Show a form that lets the user select which version of the projects to install
  $queued_projects = installer_browser_get_queued_projects();

  return backdrop_get_form('installer_browser_installation_select_versions_form', $queued_projects);
}

/**
 * Form builder for the select versions form.
 *
 * @param $projects
 *   An array of projects selected for install, keyed by project name.
 */
function installer_browser_installation_select_versions_form($form, &$form_state, $projects) {
  module_load_include('inc', 'installer', 'installer.browser');
  backdrop_add_js(backdrop_get_path('module', 'installer') . '/js/installer.select_releases.js');

  $zip_loaded = installer_browser_check_zip_loaded();

  $form = array();

  // First unset any old data.
  unset($_SESSION['installer_browser_install_releases_list']);

  $form['#tree'] = TRUE;

  $form['releases-header'] = array(
    '#type' => 'item',
    '#markup' => t("You're about to install:"),
  );

  $form['releases'] = array();

  $project_type = 'module';
  foreach ($projects as $project) {
    // Get the available releases for this project.
    $release_data = installer_browser_get_project_release_data($project);
    if (!$release_data) {
      backdrop_set_message(t('Could not fetch releases for project %project.', array('%project' => $project['title'])), 'warning');
      watchdog('installer', 'Could not fetch releases for project %project.', array('%project' => $project['title']), WATCHDOG_ERROR);
      installer_browser_install_queue_remove($project['name']);
      continue;
    }

    // We use the update module to calculate the recommended version.
    $project_data = array(
      'existing_major' => 0,
      'existing_version' => 0,
      'install_type' => '',
    );
    module_load_include('inc', 'update', 'update.compare');
    update_calculate_project_update_status($project_data, $release_data);

    $releases_list = array();

    foreach ($release_data['releases'] as $version => $release) {
      $release_title = format_string("@project @version - @date", array(
        '@project' => $project['title'],
        '@version' => $release['version'],
        '@date' => format_date($release['date'], 'custom', 'M j, Y'),
        ));
      if (isset($release['terms']['Release type']) && !empty($release['terms']['Release type'])) {
        $release_title .= check_plain(" (" . implode(', ', $release['terms']['Release type']) . ")");
      }
      if (isset($release['release_link'])) {
        $releases_list[$version] = l($release_title, $release['release_link'], array('html' => TRUE, 'attributes' => array('target' => '_blank')));
      }
      else {
        $releases_list[$version] = $release_title;
      }
    }

    $form['releases'][$project['name']]['project'] = array(
      '#type' => 'value',
      '#value' => $project,
    );

    $form['releases'][$project['name']]['release_name'] = array(
      '#type' => 'radios',
      '#title' => t('Select release for @project', array('@project' => $project['title'])),
      '#options' => $releases_list,
      '#default_value' => key($releases_list),
      '#prefix' => '<div class="installer-browser-releases-wrapper installer-browser-release-' . $project['name'] . '">',
      '#suffix' => '</div>',
      '#attributes' => array(
        'class' => array('installer-browser-releases-radios'),
      ),
      '#required' => TRUE,
    );
    $form['releases'][$project['name']]['selected_text'] = array(
      '#type' => 'item',
      '#prefix' => '<div class="installer-browser-selected-release installer-browser-selected-release-' . $project['name'] . '">',
      '#suffix' => '</div>',
      '#markup' => reset($releases_list),
    );
    if (isset($project_data['recommended'])) {
      // If there is a recommended release set, then only show it and show the
      // jQuery link.
      $recommended_releases = array();
      $recommended_releases[$project_data['recommended']] = $releases_list[$project_data['recommended']];
      $form['releases'][$project['name']]['release_name']['#default_value'] = $project_data['recommended'];
      $form['releases'][$project['name']]['selected_text']['#markup'] = $releases_list[$project_data['recommended']];
    }
    if (count($releases_list) > 1) {
      $form['releases'][$project['name']]['selected_text']['#markup'] .=
        ' (<a class="installer-browser-show-releases-link js-only" href="#" rel="' . $project['name'] . '">' . t('change release') . '</a>)';
    }

    // Update the project type based on the type of projects being selected.
    if (isset($project['type'])) {
      $project_type = $project['type'];
    }
  }

  // If there is nothing to install, go to the enable page.
  if (empty($form['releases'])) {
    backdrop_set_message(t('No releases data found for any of the selected projects.'), 'warning');
    backdrop_goto('admin/installer/install/enable');
  }

  backdrop_set_message(t('It is recommended that you back up your database and site before you continue. !link.', array('!link' => l(t('Learn how'), 'http://drupal.org/node/22281'))), 'warning');

  $form['maintenance_mode'] = array(
    '#type' => 'checkbox',
    '#title' => t('Perform updates with site in maintenance mode (strongly recommended)'),
    '#default_value' => TRUE,
  );

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Install'),
    '#disabled' => !$zip_loaded,
  );
  $form['actions']['cancel'] = array(
    '#type' => 'link',
    '#name' => 'cancel',
    '#title' => t('Cancel'),
    '#href' => installer_browser_path($project_type),
    '#options' => array(),
  );
  return $form;
}

/**
 * Menu callback; Provides the ability to clear the current queue of projects.
 *
 * @param string $project_type
 *   The project type from which the reset was fired. Either "module", "theme",
 *   or "layout".
 * @param string $reset_type
 *   Either "clear" (the default) to clear the current list of projects selected
 *   to be installed, or "all" to clear both the selected projects and all
 *   projects that have been recently installed.
 */
function installer_browser_installation_reset($project_type = 'module', $reset_type = 'clear') {
  module_load_include('inc', 'installer', 'installer.browser');
  $include_installed = $reset_type === 'all' ? TRUE : FALSE;
  installer_browser_install_queue_clear($include_installed);
  backdrop_goto(installer_browser_path($project_type));
}

/**
 * Given a project type, return the path to the installer page.
 *
 * @param string $project_type
 *   Must be one of "module", "theme", or "layout". If not specified, the
 *   project type will be determined based on the current URL.
 *
 * @return string
 *   The internal Backdrop path for the installer for the given type of project.
 */
function installer_browser_path($project_type = NULL) {
  // Determine project type from the current URL if needed.
  if (!isset($project_type)) {
    $project_type = installer_browser_type_from_path();
  }

  switch ($project_type) {
    case 'theme':
      $return_path = 'admin/appearance/install';
      break;
    case 'layout':
      $return_path = 'admin/structure/layouts/install';
      break;
    case 'module':
    default:
      $return_path = 'admin/modules/install';
      break;
  }
  return $return_path;
}

/**
 * Determine the project type from a given internal path.
 *
 * @param string $incoming_path
 *   The path from which the project type should be determined, or NULL to base
 *   the type from the current path.
 */
function installer_browser_type_from_path($incoming_path = NULL) {
  if (!isset($incoming_path)) {
    if (isset($_GET['destination'])) {
      $incoming_path = $_GET['destination'];
    }
    else {
      $incoming_path = $_GET['q'];
    }
  }
  if (strpos($incoming_path, 'appearance')) {
    $project_type = 'theme';
  }
  elseif (strpos($incoming_path, 'layouts')) {
    $project_type = 'layout';
  }
  else {
    $project_type = 'module';
  }

  return $project_type;
}

/**
 * Submit handler for the select versions form.
 */
function installer_browser_installation_select_versions_form_submit($form, &$form_state) {
  module_load_include('inc', 'installer', 'installer.browser');
  // Store maintenance_mode setting so we can restore it when done.
  $_SESSION['maintenance_mode'] = state_get('maintenance_mode', FALSE);
  if ($form_state['values']['maintenance_mode'] == TRUE) {
    state_set('maintenance_mode', TRUE);
  }

  foreach ($form_state['values']['releases'] as $item) {
    // Load the selected release.
    if ($release = installer_browser_get_release($item['release_name'], $item['project'])) {
      // Add the release to a session variable.
      $_SESSION['installer_browser_install_releases_list'][$item['release_name']] = $item['project'];
    }
  }

  // Install the projects with batch.
  module_load_include('inc', 'installer', 'installer.manager');

  $queued_releases = installer_browser_get_queued_releases();
  $operations = array();
  foreach ($queued_releases as $release_name => $project) {
    $operations[] = array('_installer_browser_batch_install_release', array($release_name, $project));
  }
  $batch = array(
    'operations' => $operations,
    'finished' => '_installer_browser_batch_install_releases_finished',
    'title' => t('Installing projects'),
    'init_message' => t('Installing projects...'),
    'progress_message' => t('Installed @current out of @total.'),
    'error_message' => t('Installation has encountered an error.'),
    'file' => backdrop_get_path('module', 'installer') . '/installer.browser.inc',
  );
  batch_set($batch);
}

/**
 * Task page for the Install Dependencies installation task.
 *
 * Show a form which lets the user select which version of dependencies to
 * install.
 */
function installer_browser_installation_install_dependencies_page() {
  module_load_include('inc', 'installer', 'installer.browser');
  $projects = installer_browser_get_installed_projects();
  $missing = installer_browser_get_missing_dependencies($projects);

  if (count($missing) > 0) {
    $missing_projects = array();
    // Add the project data in the array as best we can.
    foreach ($missing as $project_shortname => $dependencies) {
      foreach ($dependencies as $dependency_shortname) {
        $missing_projects[$dependency_shortname] = array(
          'name' => $dependency_shortname,
          'type' => 'module',
          'title' => $dependency_shortname,
          'includes' => array(),
        );
        // Make an assumption that the dependencies will have the same update
        // status URL as the project. This may not be true in the future if
        // we have decide to have more than one update server, but for now this
        // is necessary to test dependencies installation.
        if (isset($projects[$project_shortname]['project status url'])) {
          // Replace the dependent project short name with the parent short
          // name, as is needed with Backdrop's default update server.
          $status_url = preg_replace('/\/' . preg_quote($project_shortname, '/') . '([.\/]?)/', '/' . $dependency_shortname . '$1', $projects[$project_shortname]['project status url']);
          $missing_projects[$dependency_shortname]['project status url'] = $status_url;
        }
      }
    }

    return backdrop_get_form('installer_browser_installation_select_versions_form', $missing_projects);
  }
  else {
    backdrop_goto('admin/installer/install/enable');
    return NULL;
  }
}

/**
 * Task page for the Enable projects installation task.
 *
 * Show a form which lets the user enable the newly installed projects.
 */
function installer_browser_installation_enable_page($type = 'enable') {
  module_load_include('inc', 'installer', 'installer.browser');
  $installed_projects = installer_browser_get_installed_projects();

  if (count($installed_projects) > 0) {
    return backdrop_get_form('installer_browser_installation_' . $type . '_form', $installed_projects);
  }
  else {
    backdrop_goto('admin/modules/install');
    return NULL;
  }
}

/**
 * Form builder for theme install.
 *
 * @param $projects
 *   An array of projects selected for install, keyed by project name.
 */
function installer_browser_installation_theme_form($form, &$form_state, $projects) {
  backdrop_add_css(backdrop_get_path('module', 'installer') . '/css/installer.css', array('preprocess' => FALSE));
  module_load_include('inc', 'installer', 'installer.browser');

  $form['instructions'] = array(
    '#type' => 'item',
    '#markup' => t('The themes you selected have been successfully installed. You may enable installed themes here or on the main !themes page. ', array('!themes' => l(t('Themes'), 'admin/appearance')))
  );

  $theme_default = config_get('system.core', 'theme_default');
  $themes = system_rebuild_theme_data();

  foreach ($projects as $project) {
    if ($project['type'] == 'theme' && isset($themes[$project['name']])) {
      $theme = $project['name'];
      $form[$theme] = array(
        '#type' => 'fieldset',
        '#collapsed' => FALSE,
        '#collapsible' => FALSE,
        '#title' => $themes[$theme]->info['name'],
        '#attributes' => array(
          'class' => array('installer-installed-theme'),
        ),
      );
      if (file_exists($themes[$theme]->info['screenshot'])) {
        $form[$theme]['image'] = array(
          '#type' => 'item',
          '#markup' => theme('image', array('uri' => $themes[$theme]->info['screenshot'])),
          '#attributes' => array(
            'class' => array('installer-installed-theme-image'),
          ),
        );
      }
      if ($theme == $theme_default) {
        $form[$theme]['is_default'] = array(
          '#type' => 'markup',
          '#markup' => t('Default theme'),
        );
      }
      else {
        $form[$theme]['set'] = array(
          '#type' => 'submit',
          '#value' => 'Set as default theme',
          '#name' => $theme . '-submit',
          '#submit' => array('installer_browser_installation_theme_set'),
        );
      }
    }
  }

  if (in_array('module', installer_browser_get_installed_types())) {
    $form['actions'] = array('#type' => 'actions');
    $form['actions']['next_link'] = array(
      '#type' => 'submit',
      '#value' => 'Next: enable new modules',
      '#submit' => array('installer_browser_installation_theme_next'),
    );
  }
  else {
    $form['next_link'] = array(
      '#type' => 'submit',
      '#value' => t('Finish'),
      '#submit' => array('installer_browser_installation_theme_finish'),
    );
  }
  
  return $form;
}

/**
 * Submit callback for installer_browser_installation_theme_form().
 *
 * Continues the installation wizard, taking the user to the module enabling
 * page.
 */
function installer_browser_installation_theme_next($form, &$form_state) {
  backdrop_goto('admin/installer/install/enable');
}

/**
 * Submit callback for installer_browser_installation_theme_form().
 *
 * Ends the installation wizard.
 */
function installer_browser_installation_theme_finish($form, &$form_state) {
  module_load_include('inc', 'installer', 'installer.browser');
  installer_browser_installation_reset('theme');
}

/**
 * Sets a selected theme as the default site theme.
 */
function installer_browser_installation_theme_set($form, &$form_state) {
  $theme = $form_state['triggering_element']['#array_parents'][0];
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
    menu_rebuild();
  }
}

/**
 * Form builder for the select versions form.
 *
 * @param $projects
 *   An array of projects selected for install, keyed by project name.
 */
function installer_browser_installation_enable_form($form, &$form_state, $projects) {
  $modules = system_rebuild_module_data();

  $options = array();
  $missing = array();

  foreach ($projects as $project) {
    if ($project['type'] == 'module') {
      $dependency_check = TRUE;
      $dependencies = array();
      if (isset($modules[$project['name']])) {
        foreach ($modules[$project['name']]->info['dependencies'] as $dependency) {
          if (isset($modules[$dependency])) {
            $dependencies[] = $modules[$dependency]->info['name'] . ' (' . t('Installed') . ')';
          }
          else {
            $dependency_check = FALSE;
            $dependencies[] = $dependency . ' (' . t('Missing') . ')';
          }
        }
        if ($dependency_check) {
          $options[$project['name']] = array(
            array('data' => $modules[$project['name']]->info['name']),
            array('data' => $modules[$project['name']]->info['version']),
            array('data' => implode(', ', $dependencies)),
          );
        }
        else {
          $missing[$project['name']] = array(
            array('data' => $modules[$project['name']]->info['name']),
            array('data' => $modules[$project['name']]->info['version']),
            array('data' => implode(', ', $dependencies)),
          );
        }
      }
      else {
        backdrop_set_message(t('There was an error getting information for @module',
          array('@module' => $project['name'])), 'error');
      }
    }
  }

  $headers = array(
    array('data' => t('Title')),
    array('data' => t('Version'), 'class' => array('priority-medium')),
    array('data' => t('Dependencies'), 'class' => array('priority-low')),
  );

  if(!empty($options) || !empty($missing)) {
    $form['module_instructions'] = array(
    '#type' => 'item',
    '#markup' => t('You may enable modules using the form below or on the main !link page.', array('!link' => l(t('Modules'), 'admin/modules'))),
    );
    if (!empty($options)) {
      $form['modules'] = array(
        '#type' => 'tableselect',
        '#title' => t('Enable modules'),
        '#description' => t('Select which modules you would like to enable.'),
        '#header' => $headers,
        '#options' => $options,
        '#empty' => t('No new modules installed.'),
        '#multiple' => TRUE,
        '#js_select' => TRUE,
        '#weight' => 1,
      );

      $form['actions'] = array('#type' => 'actions');
      $form['actions']['submit'] = array(
        '#type' => 'submit',
        '#submit' => array('installer_browser_installation_enable_form_submit'),
        '#value' => t('Enable modules'),
      );
      $form['actions']['cancel'] = array(
        '#type' => 'link',
        '#name' => 'cancel',
        '#title' => t('Finish without enabling'),
        '#href' => 'admin/installer/reset/module/all',
        '#options' => array(),
      );
    }

    if (!empty($missing)) {
      $form['actions'] = array('#type' => 'actions');
      $form['actions']['cancel'] = array(
        '#type' => 'link',
        '#name' => 'cancel',
        '#title' => t('Cancel'),
        '#href' => 'admin/installer/reset/module/all',
        '#options' => array(),
      );
      $form['missing'] = array(
        '#type' => 'item',
        '#title' => t('Missing Dependencies'),
        '#description' => t('These modules are missing one or more dependencies and cannot be enabled.'),
        '#markup' => theme('table', array('header' => $headers, 'rows' => $missing)),
        '#weight' => 2,
      );
    }
  }

  return $form;
}

/**
 * Form submit handler for the enable modules form.
 */
function installer_browser_installation_enable_form_submit($form, &$form_state) {
  $enable_queue = array_filter($form_state['values']['modules']);
  // Enable these all at once so that dependencies are handled properly.
  module_enable($enable_queue);
  unset($_SESSION['installer_browser_installed_projects']);
  backdrop_flush_all_caches();
  backdrop_set_message(t('Installation is complete.'));
  backdrop_goto('admin/modules/install');
}

/**
 * Get a task list to the sidebar area when installing projects.
 *
 * This will need to be called from every page of the install process.
 *
 * @param $active
 *   (Optional) Set the active task by key.
 *
 * @return string
 *   The rendered HTML for the installation task list.
 */
function installer_browser_installation_task_list($active = NULL) {
  // Default list of tasks.
  $tasks = array(
    'select_versions' => t('Select versions'),
    'install_dependencies' => t('Install dependencies'),
    'theme' => t('Enable themes'),
    'enable' => t('Enable modules'),
  );

  require_once BACKDROP_ROOT . '/core/includes/theme.maintenance.inc';

  return theme('task_list', array('items' => $tasks, 'active' => $active));
}

/**
 * Returns the themed install list form.
 */
function installer_browser_get_install_list() {
  module_load_include('inc', 'installer', 'installer.browser');
  $build = array(
    '#theme' => 'installer_browser_install_queue',
    '#projects' => installer_browser_get_queued_projects(),
  );
  return backdrop_render($build);
}

/**
 * Shows an install button for the Install Queue block.
 */
function installer_browser_install_button_form($form, &$form_state) {
  $project_type = installer_browser_type_from_path();
  $form['#attributes']['class'] = 'installer-browser-install-button-form';
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => 'Install',
  );
  $form['#action'] = url('admin/installer/install/select_versions');
  $form['cancel'] = array(
    '#type' => 'link',
    '#name' => 'cancel',
    '#title' => t('Clear queue'),
    '#href' => 'admin/installer/reset/' . $project_type . '/clear',
    '#options' => array(),
  );

  return $form;
}

/**
 * Builds the filters form.
 */
function installer_browser_filters_form($form, &$form_state, $type) {
  $form['search_text'] = array(
    '#title' => t('Search'),
    '#type' => 'textfield',
    '#size' => '25',
    '#default_value' => isset($_SESSION['installer_browser_text_filter_' . $type]) ? $_SESSION['installer_browser_text_filter_' . $type] : '',
  );

  $form['project_type'] = array(
    '#type' => 'value',
    '#value' => $type,
  );

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Search'),
  );

  if (!empty($_SESSION['installer_browser_text_filter_' . $type])) {
    $form['clear'] = array(
      '#type' => 'submit',
      '#value' => t('Clear'),
    );
  }

  return $form;
}

/**
 * Returns a themed sort widget for the filters.
 */
function installer_browser_get_sort_widget($sort_options, $current_order, $current_sort) {
  $sort_list = array();
  $sort_list[] = array('data' => t('Sort by:'), 'class' => array('sort-header'));
  $current_path = backdrop_get_path_alias($_GET['q']);

  foreach ($sort_options as $sort_option) {
    $classes = array();
    $query = array(
      'order' => $sort_option['method'],
      'sort' => $sort_option['default_sort'],
    );

    // If the sort option is currently active, handle it differently.
    if ($current_order == $sort_option['method']) {
      $classes[] = 'sort-active';
      $classes[] = 'sort-' . $current_sort;

      // Set the direction of the sort link to the opposite of what it currently
      // is.
      if ($current_sort == $query['sort']) {
        if ($query['sort'] == 'desc') {
          $query['sort'] = 'asc';
        }
        else {
          $query['sort'] = 'desc';
        }
      }
    }
    else {
      $classes[] = 'sort-inactive';
    }

    $sort_list[] = array(
      'data' => l($sort_option['label'], $current_path, array('query' => $query)),
      'class' => $classes,
    );
  }

  return theme('item_list', array(
    'items' => $sort_list,
    'type' => 'ul',
    'attributes' => array('class' => array('installer-browser-sort-list', 'clearfix'))
  ));
}

/**
 * Returns a list of sort options.
 *
 * @param $full
 *   Set this to TRUE if you want to get all of the supported sort methods.
 *
 * return array
 *   An array of all sort methods, keyed by method name, with each value an
 *   array with the following keys:
 *   - method: Same as the method name key.
 *   - label: Translated label for the method.
 *   - default_sort: The default sort for this method, either "desc" or "asc".
 */
function installer_browser_get_sort_options($full = FALSE) {
  $sort_options = array(
    'score' => array('method' => 'score', 'label' => t('Relevancy'), 'default_sort' => 'desc'),
    'usage' => array('method' => 'usage', 'label' => t('Most installed'), 'default_sort' => 'desc'),
    'title' => array('method' => 'title', 'label' => t('Title'), 'default_sort' => 'asc'),
    'latest_release' => array('method' => 'latest_release', 'label' => t('Latest release'), 'default_sort' => 'desc'),
  );

  if ($full) {
    $sort_options['type'] = array('method' => 'type', 'label' => t('Type'), 'default_sort' => 'asc');
    $sort_options['created'] = array('method' => 'created', 'label' => t('Date created'), 'default_sort' => 'asc');
    $sort_options['latest_activity'] = array('method' => 'latest_activity', 'label' => t('Latest build'), 'default_sort' => 'desc');
  }

  return $sort_options;
}

/**
 * Handles the filters form submit.
 */
function installer_browser_filters_form_submit($form, &$form_state) {
  $type = $form_state['values']['project_type'];
  if ($form_state['clicked_button']['#parents'][0] == 'clear') {
    unset($_SESSION['installer_browser_text_filter_' . $type]);
  }
  else {
    $_SESSION['installer_browser_text_filter_' . $type] = $form_state['values']['search_text'];
  }
  if (isset($_GET['page'])) {
    unset($_GET['page']);
  }
}

/**
 * Shows the link to open the manual install dialog.
 */
function installer_browser_manual_install_link($form, &$form_state) {
  $manual['link'] = array(
    '#type' => 'link',
    '#title' => 'Manual installation',
    '#href' => 'admin/installer/manual',
    '#attributes' => array(
      'class' => array('use-ajax'),
      'data-dialog' => 'true',
      'data-dialog-options' => json_encode(array('width' => 700, 'dialogClass' => 'project-dialog')),
    ),
  );

  return $manual;
}

/**
 * Menu callback; Allows for adding to and removing from the install queue.
 */
function installer_browser_install_queue_callback($method, $op, $project_name) {
  module_load_include('inc', 'installer', 'installer.browser');
  switch ($op) {
    case 'add':
      $projects = installer_browser_get_listed_projects();

      if (isset($projects[$project_name])) {
        $project = $projects[$project_name];
        installer_browser_install_queue_add($project);
      }
      else {
        backdrop_set_message(t('Error: The project was not found.'), 'error');
      }
      break;

    case 'remove':
      installer_browser_install_queue_remove($project_name);
      break;

    default:
      return MENU_NOT_FOUND;    
  }

  if ($method === 'ajax') {
    $commands = array();
    // Refresh the install queue.
    $commands[] = ajax_command_replace('.installer-browser-install-queue', installer_browser_get_install_list());
    // Refresh the add to queue link.
    $commands[] = ajax_command_replace('#add-to-queue-link-' . $project_name, installer_browser_add_remove_queue_link($project_name));
    return array('#type' => 'ajax', '#commands' => $commands);
  }

  // Redirect to the page it came from.
  $redirect = (isset($_GET['destination'])) ? $_GET['destination'] : installer_browser_path();
  if ($method === 'form') {
    return $redirect;
  }

  // For $method === 'link' or 'nojs'.
  backdrop_goto($redirect);
  return NULL;
}
