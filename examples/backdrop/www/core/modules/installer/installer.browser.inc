<?php
/**
 * @file
 * Various functions that are required by the Installer browse pages.
 */

/**
 * Checks if a project is enabled.
 *
 * @param string $type
 *   The type of project. Could be 'theme' or 'module' or 'layout'.
 * @param string $name
 *   The short name of the project.
 *
 * @return
 *   TRUE if the project is enabled, FALSE otherwise.
 */
function _installer_browser_is_project_enabled($type, $name) {
  switch ($type) {
    case 'module':
      return module_exists($name);
      break;
    case 'theme':
      $themes = list_themes();
      return isset($themes[$name]) && $themes[$name]->status;
      break;
    case 'layout':
      $excluded_templates = config_get('layout.settings', 'excluded_templates');
      return layout_get_layout_template_info($name) && !in_array($name, $excluded_templates);
      break;
  }
  return FALSE;
}

/**
 * Gets the currently listed projects from the session.
 */
function installer_browser_get_listed_projects() {
  if (isset($_SESSION['installer_browser_listed_projects'])) {
    return $_SESSION['installer_browser_listed_projects'];
  }

  return array();
}

/**
 * Gets the currently queued projects from the session.
 */
function installer_browser_get_queued_projects($type = NULL) {
  $projects = array();

  if (isset($_SESSION['installer_browser_install_list'])) {
    foreach ($_SESSION['installer_browser_install_list'] as $project) {
      if (is_array($project) && !empty($project)) {
        if (isset($type) && $type != $project['type']) {
          continue;
        }
        else {
          $projects[$project['name']] = $project;
        }
      }
    }
  }

  return $projects;
}

/**
 * Gets a release from a project and a release_name.
 */
function installer_browser_get_release($release_name, $project) {
  $release_data = installer_browser_get_project_release_data($project);

  return isset($release_data['releases'][$release_name]) ? $release_data['releases'][$release_name] : FALSE;
}

/**
 * Gets the newly installed projects from the session.
 */
function installer_browser_get_installed_projects() {
  $projects = array();

  if (isset($_SESSION['installer_browser_installed_projects'])) {
    foreach ($_SESSION['installer_browser_installed_projects'] as $project) {
      if (is_array($project) && !empty($project)) {
        $projects[$project['name']] = $project;
      }
    }
  }

  return $projects;
}

/**
 * Adds a project to the install queue.
 */
function installer_browser_install_queue_add($project) {
  $_SESSION['installer_browser_install_list'][$project['name']] = $project;
}

/**
 * Removes a project from the install queue.
 */
function installer_browser_install_queue_remove($project_name) {
  if (isset($_SESSION['installer_browser_install_list'][$project_name])) {
    unset($_SESSION['installer_browser_install_list'][$project_name]);
  }
}

/**
 * Clears the install queue.
 *
 * Removes all projects from the $_SESSION variables.
 *
 * @param bool $include_installed
 *   If TRUE, also clear the list of recently installed projects.
 */
function installer_browser_install_queue_clear($include_installed = FALSE) {
  $_SESSION['installer_browser_install_list'] = array();
  if ($include_installed) {
    $_SESSION['installer_browser_installed_projects'] = array();
  }
}

/**
 * Gets the currently queued releases from the session.
 */
function installer_browser_get_queued_releases() {
  $releases = array();

  if (isset($_SESSION['installer_browser_install_releases_list'])) {
    foreach ($_SESSION['installer_browser_install_releases_list'] as $release_name => $project) {
      if (is_array($project) && !empty($project)) {
        $releases[$release_name] = $project;
      }
    }
  }

  return $releases;
}

/**
 * Fetches results from the server based on the parameters passed in.
 *
 * $filters should be an associative array with the following keys:
 *  - version: The Major Version of Backdrop that is running on the Client.
 *  - text: The text that was entered as the search query, or '' if none.
 *  - type: The type of project being searched.
 *  - page: The zero-based page number.
 *  - items_per_page: How many results are requested per page.
 *
 * For example:
 * @code
 * array(
 *   'version' => '1',
 *   'text' => 'views',
 *   'type' => 'module',
 *   'page' => 3,
 *   'items_per_page' => 12,
 * )
 * @endcode
 *
 * The installer_browser_fetch_results($filters) call returns an array with the
 * following keys:
 *  - total: The total number of results found for the filters.
 *  - projects: An array of projects returned for this page request keyed by
 *    machine name. Each project array may contain the following key-value
 *    pairs:
 *     - type: The type of project this is. Can be 'module' or 'theme'.
 *     - title: The title of the project.
 *     - name: The machine name of the project.
 *     - author: The author's name.
 *     - description: The project description.
 *     - image: Absolute url to the image, if any.
 *     - usage: Number of reported active installs.
 *     - project url: Absolute url to the project page, if any.
 *     - project status url: The absolute url of the update checker.
 *     - last updated: UNIX Timestamp of when the project was last updated.
 *     - maintenance status: The project maintenance status.
 *     - development status: The project development status.
 *     - rating: A rating on a scale of 1 to 10 of the project, if available.
 *     - dependencies: An array of the dependencies of this module.
 *
 *    The following is an example of a valid return array:
 *    @code
 *    array(
 *      'total' = 5,
 *      'projects' => array(
 *        'views' => array(
 *          'type' => 'module',
 *          'title' => 'Views',
 *          'name' => 'views',
 *          'author' => 'merlinofchaos',
 *          'description' => 'Long project description',
 *          'image' => 'http://www.example.com/image.jpg',
 *          'usage' => '542312',
 *          'project url' => 'https://www.example.org/projects/views',
 *          'project status url' => 'https://updates.example.org/release-history/views/1.x',
 *          'last updated' => '12342523',
 *          'maintenance status' => 'Actively maintained',
 *          'development status' => 'Under active development',
 *          'rating' => '9.6',
 *          'dependencies' => array(
 *            'entity',
 *          ),
 *        ),
 *        'another_project => array(
 *          'type' => 'module',
 *          ...
 *        ),
 *      ),
 *    );
 *    @endcode
 *
 * @param array $filters
 *   An associative array of queries to use to filter results.
 *
 * @return
 *   Returns an array of results.
 */
function installer_browser_fetch_results($filters) {
  $server = installer_browser_get_server();
  // Attempt to retrieve the cached version of this page.
  $cid = 'installer:results:' . md5(serialize(array_merge($filters, $server)));
  if ($cache = cache_get($cid)) {
    return $cache->data;
  }

  $local_filters = $filters;
  $local_filters['method'] = 'query';

  $query_url = $server['url'] . '/query/' . $local_filters['type'] . '/1?' . http_build_query($local_filters, FALSE, '&');
  $response = backdrop_http_request($query_url);

  if ($response->code == '200') {
    $results = backdrop_json_decode($response->data);
  }
  else {
    backdrop_set_message(t("Encountered an error when trying to fetch results from @name. Error @code : @message",
      array('@name' => $server['name'], '@code' => $response->code, '@message' => $response->error)));
    return array();
  }

  // Set the cached version of the results.
  cache_set($cid, $results, 'cache', strtotime("+24 hours"));

  return $results;
}

/**
 * Gets the server to use for fetching results.
 *
 * The installer_browser_fetch_results($filters) call returns an array with the
 * following keys:
 * @return
 *   Returns an array representing the active server with the following keys:
 *     - url: The absolute url to the server without query parameters.
 *     - name: A human-readable name for this server.
 *   For example:
 *   @code
 *    array(
 *      "url" => "https://projects.backdropcms.org",
 *      "name" => "Backdrop",
 *    )
 *   @endcode
 */
function installer_browser_get_server() {
  $server = config_get('installer.settings', 'installer_server');
  backdrop_alter('installer_server', $server);

  return $server;
}

/**
 * Uses the project status url to get the available releases for a project.
 *
 * @param array $project
 *   Associative array of information about the project to fetch release data
 *   for, as returned by the remote server.
 *
 * @return array|FALSE
 *   An array of releases for this project or FALSE if the project is not found.
 */
function installer_browser_get_project_release_data(array $project) {
  $project['project_type'] = $project['type'];
  // Build the releases cache for this project
  module_load_include('inc', 'update', 'update.fetch');
  if (_update_process_fetch_task($project)) {
    $data = _update_cache_get('available_releases::' . $project['name']);
    if (isset($data->data) && isset($data->data['releases']) && is_array($data->data['releases'])) {
      return $data->data;
    }
  }

  return FALSE;
}

/**
 * Batch API callback: Installs a single release of a project during batch.
 *
 * @param $release_name
 *   The short name of the selected release of the project being installed.
 * @param $project
 *   Associative array of information about the project to be installed.
 */
function _installer_browser_batch_install_release($release_name, $project, &$context) {
  $release = installer_browser_get_release($release_name, $project);

  module_load_include('inc', 'installer', 'installer.manager');
  $url = file_create_url($release['download_link']);
  $result = installer_manager_download_project($url, TRUE);

  if ($result['success']) {
    $context['results']['successes'][] = t('Successfully installed %project.', array('%project' => $project['title']));
    $context['message'] = t('Installed %project...', array('%project' => $project['title']));

    // Add this to the session variable and remove it from the install_queue
    // variable.
    $_SESSION['installer_browser_installed_projects'][$project['name']] = $project;
    unset($_SESSION['installer_browser_install_list'][$project['name']]);
  }
  else {
    watchdog('installer', 'There was an error while installing %project.
      !message',
      array('%project' => $project['title'], '!message' => $result['message']), WATCHDOG_ERROR);
    $context['results']['failures'][] = t('Error installing %project. !message',
      array('%project' => $project['title'], '!message' => $result['message']));
    $context['message'] = t('Error installing %project. Errors have been logged.',
      array('%project' => $project['title']));
  }
}

/**
 * Batch API callback: shows a message and finishes up the batch.
 */
function _installer_browser_batch_install_releases_finished($success, $results, $operations) {
  // Although we turn off maintenance mode immediately, the message that the
  // site is offline displays until a page reload. We wipe the messages cache
  // here to avoid this.
  backdrop_get_messages();

  // Restore the maintenance mode to what it was at the start.
  if (isset($_SESSION['maintenance_mode'])) {
    state_set('maintenance_mode', $_SESSION['maintenance_mode']);
    unset($_SESSION['maintenance_mode']);
  }

  unset($_SESSION['installer_browser_install_releases_list']);
  if ($success) {
    if (!empty($results)) {
      if (!empty($results['failures'])) {
        backdrop_set_message(format_plural(count($results['failures']), 'Failed to install one project.', 'Failed to install @count projects.'), 'error');
        foreach($results['failures'] as $message){
          backdrop_set_message($message, 'error');
        }
      }
    }
  }
  else {
    backdrop_set_message(t('Error installing projects.'), 'error');
    backdrop_goto('admin/installer/install/select_versions');
  }

  $projects = installer_browser_get_installed_projects();
  $missing = installer_browser_get_missing_dependencies($projects);
  // If there are missing dependencies, go to install dependencies.
  if (count($missing) > 0) {
    backdrop_goto('admin/installer/install/install_dependencies');
  }
  else {
    installer_browser_get_destination_after_install();
  }
}

/**
 * Determines the types of installed projects.
 */
function installer_browser_get_installed_types() {
  $types = array();
  $projects = installer_browser_get_installed_projects();
  foreach ($projects as $project) {
    $types[$project['type']] = $project['type'];
  }

  return $types;
}



/**
 * Determines the form destination after installed projects.
 */
function installer_browser_get_destination_after_install() {
  $types = installer_browser_get_installed_types();

  $layout = in_array('layout', $types);
  $theme = in_array('theme', $types);
  $module = in_array('module', $types);

  $layout_message = t('Installation finished successfully. All newly-added layout templates have been enabled and are available for use in your layouts. You can manage layout templates on the layouts !link page.', array('!link' => l(t('Settings'), 'admin/structure/layouts/settings')));

  if ($layout) {
    // Installed a layout and other project(s), continue the wizard. There's no
    // step for layouts in the wizard, since there's nothing we could do there.
    if ($theme || $module) {
      if (!$theme) {
        backdrop_set_message($layout_message);
        backdrop_goto('admin/installer/install/enable');
      }
      else {
        backdrop_set_message($layout_message);
        backdrop_goto('admin/installer/install/theme');
      }
    }
    // Installed only a layout, go straight to layout list.
    else {
      backdrop_set_message($layout_message);
      backdrop_goto('admin/structure/layouts');
    }
  }
  // Theme and module, go to theme stage of wizard.
  elseif ($theme && $module) {
    backdrop_goto('admin/installer/install/theme');
  }
  // Only a theme, go to theme list.
  elseif ($theme && !$module) {
    backdrop_set_message(t('One or more themes were installed. You may enable them now.'));
    backdrop_goto('admin/appearance');
  }
  // Only a module, jump to the module enable stage of the wizard.
  else {
    backdrop_goto('admin/installer/install/enable');
  }
}

/**
 * Gets the dependencies for installed projects.
 */
function installer_browser_get_missing_dependencies($projects) {
  $modules = system_rebuild_module_data();

  $missing = array();

  foreach ($projects as $project) {
    if ($project['type'] == 'module') {
      $dependencies = array();
      if (isset($modules[$project['name']])) {
        foreach ($modules[$project['name']]->requires as $requires) {
          $dependency = $requires['name'];
          if (!isset($modules[$dependency])) {
            $dependencies[] = $dependency;
          }
        }
        if (count($dependencies) > 0) {
          $missing[$project['name']] = $dependencies;
        }
      }
      else {
        backdrop_set_message(t('There was an error getting information for @module',
          array('@module' => $project['name'])), 'error');
      }
    }
  }

  return $missing;
}

/**
 * Builds the add/remove project to install queue link.
 */
function installer_browser_add_remove_queue_link($project_name, $title = NULL, $id_prefix = 'add-to-queue-link') {
  $queued_projects = installer_browser_get_queued_projects();
  if (!$title) {
    $title = isset($queued_projects[$project_name]) ? t('Remove from Installation queue') : t('Add to Installation queue');
  }
  $op = isset($queued_projects[$project_name]) ? 'remove' : 'add';

  if (backdrop_is_dialog()) {
    $form = backdrop_get_form('installer_browser_add_remove_queue_dialog_link', $project_name, $op, $title);
    return backdrop_render($form);
  }
  else {
    $build['ajax_link'] = array(
      '#type' => 'link',
      '#title' => $title,
      '#href' => 'admin/installer/queue/nojs/' . $op . '/'. $project_name,
      '#options' => array(
        'query' => backdrop_get_destination(),
      ),
      '#id' => $id_prefix . '-' . $project_name,
      '#ajax' => array(
        'effect' => 'fade',
        'speed' => 1000,
        'progress' => array(
          'type' => 'throbber',
        ),
      ),
    );
    
  }

  return backdrop_render($build);
}

/**
 * Builds an "add-to-queue-link" button for project detail dialog.
 */
function installer_browser_add_remove_queue_dialog_link($form, &$form_state, $project_name, $op, $title) {
  form_load_include($form_state, 'inc', 'installer', 'installer.browser');
  $form['#attached']['js'][] = backdrop_get_path('module', 'layout') . '/js/layout.admin.js';
  $form['#attached']['css'][] = backdrop_get_path('module', 'layout') . '/css/layout.admin.css';

  if (empty($form_state['project_name'])) {
    $form_state['project_name'] = $project_name;
    $form_state['op'] = $op;
    $form_state['title'] = $title;
  }

  $form['ajax_link'] = array(
    '#type' => 'submit',
    '#value' => $form_state['title'],
    '#attributes' => array('class' => array('layout-link-button')),
    '#ajax' => array(
      'callback' => 'installer_browser_add_remove_queue_dialog_link_ajax',
    ),
    '#submit' => array(
      'installer_browser_add_remove_queue_dialog_link_submit',
    ),
  );

  return $form;
}

/**
 * AJAX submit handler for installer_browser_add_remove_queue_dialog_link().
 */
function installer_browser_add_remove_queue_dialog_link_ajax($form, &$form_state) {
  $commands = array();
  // Refresh the install queue.
  $commands[] = ajax_command_replace('.installer-browser-install-queue', installer_browser_get_install_list());
  // Refresh the add to queue link.
  $commands[] = ajax_command_replace('#add-to-queue-link-' . $form_state['project_name'], installer_browser_add_remove_queue_link($form_state['project_name']));
  // Refresh the add/remove link in the dialog.
  $form_html = backdrop_render($form);
  $commands[] = ajax_command_replace('.installer-browser-add-remove-queue-dialog-link', $form_html);
  return array('#type' => 'ajax', '#commands' => $commands);
}

/**
 * Submit handler for installer_browser_add_remove_queue_dialog_link().
 */
function installer_browser_add_remove_queue_dialog_link_submit($form, &$form_state) {
  // Save the current add/remove value.
  $form_state['redirect'] = installer_browser_install_queue_callback('form', $form_state['op'], $form_state['project_name']);

  // Rebuild the form with the new opposite action selected.
  if ($form_state['op'] == 'add') {
    $form_state['op'] = 'remove';
    $form_state['title'] = t('Remove from Installation queue');
  }
  else {
    $form_state['op'] = 'add';
    $form_state['title'] = t('Add to Installation queue');
  }
  $form_state['rebuild'] = TRUE;
}

/**
 *
 * Checks if PHP zip extension loaded on webserver.
 */
function installer_browser_check_zip_loaded() {
  $zip_loaded = array_key_exists('zip', archiver_get_info());
  if (!$zip_loaded) {
    backdrop_set_message(t('Sorry, it seems that the PHP .zip extension is not loaded on your server. You will not be able to download any projects using Project Installer until this is fixed. Please contact your website administrator.'), 'warning', FALSE);
  }
  return $zip_loaded;
}
