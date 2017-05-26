<?php

/**
 * @file
 * Administrative screens and processing functions of the Installer module.
 *
 * This allows site administrators with the 'administer software updates'
 * permission to either upgrade existing projects, or download and install new
 * ones, so long as the killswitch $settings['allow_authorize_operations'] is
 * still TRUE.
 *
 * To install new code, the administrator is prompted for either the URL of an
 * archive file, or to directly upload the archive file. The archive is loaded
 * into a temporary location, extracted, and verified. If everything is
 * successful, the user is redirected to authorize.php to type in file transfer
 * credentials and authorize the installation to proceed with elevated
 * privileges, such that the extracted files can be copied out of the temporary
 * location and into the live web root.
 *
 * Updating existing code is a more elaborate process. The first step is a
 * selection form where the user is presented with a table of installed projects
 * that are missing newer releases. The user selects which projects they wish to
 * update, and presses the "Download updates" button to continue. This sets up a
 * batch to fetch all the selected releases, and redirects to
 * admin/update/download to display the batch progress bar as it runs. Each
 * batch operation is responsible for downloading a single file, extracting the
 * archive, and verifying the contents. If there are any errors, the user is
 * redirected back to the first page with the error messages. If all downloads
 * were extacted and verified, the user is instead redirected to
 * admin/update/ready, a landing page which reminds them to backup their
 * database and asks if they want to put the site offline during the update.
 * Once the user presses the "Install updates" button, they are redirected to
 * authorize.php to supply their web root file access credentials. The
 * authorized operation (which lives in update.authorize.inc) sets up a batch to
 * copy each extracted update from the temporary location into the live web
 * root.
 */

/**
 * @defgroup installer_manager_update Installer module: update
 * @{
 * Installer module functionality for updating existing code.
 *
 * Provides a user interface to update existing code.
 */

/**
 * Form constructor for the update form of the Installer module.
 *
 * This presents a table with all projects that have available updates with
 * checkboxes to select which ones to upgrade.
 *
 * @param $context
 *   String representing the context from which we're trying to update.
 *   Allowed values are 'module', 'theme', and 'report'.
 *
 * @see installer_manager_update_form_validate()
 * @see installer_manager_update_form_submit()
 * @see installer_menu()
 * @ingroup forms
 */
function installer_manager_update_form($form, $form_state = array(), $context) {
  switch ($context) {
    case 'module':
      backdrop_set_title('Update modules');
      break;
    case 'theme':
      backdrop_set_title('Update themes');
      break;
    case 'layout':
      backdrop_set_title('Update layouts');
      break;
    case 'report':
      backdrop_set_title('Update projects');
      break;
  }

  if (!_installer_manager_check_backends($form, 'update')) {
    return $form;
  }

  $form['#theme'] = 'installer_manager_update_form';

  $available = update_get_available(TRUE);
  if (empty($available)) {
    $form['message'] = array(
      '#markup' => t('There was a problem getting update information. Try again later.'),
    );
    return $form;
  }

  $form['#attached']['css'][] = backdrop_get_path('module', 'installer') . '/css/installer.css';

  // This will be a nested array. The first key is the kind of project, which
  // can be either 'enabled', 'disabled', 'manual' (projects which require
  // manual updates, such as core). Then, each subarray is an array of
  // projects of that type, indexed by project short name, and containing an
  // array of data for cells in that project's row in the appropriate table.
  $projects = array();

  // This stores the actual download link we're going to update from for each
  // project in the form, regardless of if it's enabled or disabled.
  $form['project_downloads'] = array('#tree' => TRUE);

  module_load_include('inc', 'update', 'update.compare');
  $project_data = update_calculate_project_data($available);
  foreach ($project_data as $name => $project) {
    // Filter out projects which are up to date already.
    if ($project['status'] == UPDATE_CURRENT) {
      continue;
    }
    // The project name to display can vary based on the info we have.
    if (!empty($project['title'])) {
      if (!empty($project['link'])) {
        $project_name = l($project['title'], $project['link']);
      }
      else {
        $project_name = check_plain($project['title']);
      }
    }
    elseif (!empty($project['info']['name'])) {
      $project_name = check_plain($project['info']['name']);
    }
    else {
      $project_name = check_plain($name);
    }
    if ($project['project_type'] == 'theme' || $project['project_type'] == 'theme-disabled') {
      $project_name .= ' ' . t('(Theme)');
    }

    if (empty($project['recommended'])) {
      // If we don't know what to recommend they upgrade to, we should skip
      // the project entirely.
      continue;
    }

    $recommended_release = $project['releases'][$project['recommended']];
    $recommended_version = $recommended_release['version'] . ' ' . l(t('(Release notes)'), $recommended_release['release_link'], array('attributes' => array('title' => t('Release notes for @project_title', array('@project_title' => $project['title'])))));
    if ($recommended_release['version_major'] != $project['existing_major']) {
      $recommended_version .= '<div title="Major upgrade warning" class="update-major-version-warning">' . t('This update is a major version update which means that it may not be backwards compatible with your currently running version.  It is recommended that you read the release notes and proceed at your own risk.') . '</div>';
    }

    // Create an entry for this project.
    $entry = array(
      'title' => $project_name,
      'installed_version' => $project['existing_version'],
      'recommended_version' => $recommended_version,
    );

    switch ($project['status']) {
      case UPDATE_NOT_SECURE:
      case UPDATE_REVOKED:
        $entry['title'] .= ' ' . t('(Security update)');
        $entry['#weight'] = -2;
        $type = 'security';
        break;

      case UPDATE_NOT_SUPPORTED:
        $type = 'unsupported';
        $entry['title'] .= ' ' . t('(Unsupported)');
        $entry['#weight'] = -1;
        break;

      case UPDATE_UNKNOWN:
      case UPDATE_NOT_FETCHED:
      case UPDATE_NOT_CHECKED:
      case UPDATE_NOT_CURRENT:
        $type = 'recommended';
        break;

      default:
        // Jump out of the switch and onto the next project in foreach.
        continue 2;
    }

    $entry['#attributes'] = array('class' => array('update-' . $type));

    // Backdrop CMS core needs to be upgraded manually.
    $needs_manual = $project['project_type'] == 'core';

    if ($needs_manual) {
      // There are no checkboxes in the 'Manual updates' table so it will be
      // rendered by theme('table'), not theme('tableselect'). Since the data
      // formats are incompatible, we convert now to the format expected by
      // theme('table').
      unset($entry['#weight']);
      $attributes = $entry['#attributes'];
      unset($entry['#attributes']);
      $entry = array(
        'data' => $entry,
      ) + $attributes;
    }
    else {
      $form['project_downloads'][$name] = array(
        '#type' => 'value',
        '#value' => $recommended_release['download_link'],
      );
    }

    // Based on what kind of project this is, save the entry into the
    // appropriate subarray.
    switch ($project['project_type']) {
      case 'core':
        // Core needs manual updates at this time.
        $projects['manual'][$name] = $entry;
        break;

      case 'module':
      case 'theme':
      case 'layout':
        $projects['enabled'][$name] = $entry;
        break;

      case 'module-disabled':
      case 'theme-disabled':
      case 'layout-disabled':
        $projects['disabled'][$name] = $entry;
        break;
    }
  }

  if (empty($projects)) {
    $form['message'] = array(
      '#markup' => '<p>' . t('No updates are available for any of your projects.') . '</p>',
    );
    return $form;
  }

  $headers = array(
    'title' => array(
      'data' => t('Name'),
      'class' => array('installer-project-name'),
    ),
    'installed_version' => t('Installed version'),
    'recommended_version' => t('Recommended version'),
  );

  if (!empty($projects['enabled'])) {
    $form['projects'] = array(
      '#type' => 'tableselect',
      '#header' => $headers,
      '#options' => $projects['enabled'],
    );
    if (!empty($projects['disabled'])) {
      $form['projects']['#prefix'] = '<h2>' . t('Enabled') . '</h2>';
    }
  }

  if (!empty($projects['disabled'])) {
    $form['disabled_projects'] = array(
      '#type' => 'tableselect',
      '#header' => $headers,
      '#options' => $projects['disabled'],
      '#weight' => 1,
      '#prefix' => '<h2>' . t('Disabled') . '</h2>',
    );
  }

  // If either table has been printed yet, we need a submit button and to
  // validate the checkboxes.
  if (!empty($projects['enabled']) || !empty($projects['disabled'])) {
    $form['actions'] = array('#type' => 'actions');
    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Download these updates'),
    );
    $form['#validate'][] = 'installer_manager_update_form_validate';
  }

  if (!empty($projects['manual'])) {
    $prefix = '<h2>' . t('Manual updates required') . '</h2>';
    $prefix .= '<p>' . t('Updates of Backdrop CMS core using the web interface are not possible yet.') . '</p>';
    $prefix .= '<p>' . t('You can update Backdrop CMS by replacing the old <code>/core</code> directory inside your docroot with the one included in the <a href="https://backdropcms.org/" title="Home page with download option">latest release</a>. For detailed instructions, see the <a href="https://backdropcms.org/upgrade" title="Handbook article">Upgrading Backdrop CMS</a> document online.') . '</p>';
    $form['manual_updates'] = array(
      '#type' => 'markup',
      '#markup' => theme('table', array('header' => $headers, 'rows' => $projects['manual'])),
      '#prefix' => $prefix,
      '#weight' => 120,
    );
  }

  return $form;
}

/**
 * Form validation handler for installer_manager_update_form().
 *
 * Ensures that at least one project is selected.
 *
 * @see installer_manager_update_form_submit()
 */
function installer_manager_update_form_validate($form, &$form_state) {
  if (!empty($form_state['values']['projects'])) {
    $enabled = array_filter($form_state['values']['projects']);
  }
  if (!empty($form_state['values']['disabled_projects'])) {
    $disabled = array_filter($form_state['values']['disabled_projects']);
  }
  if (empty($enabled) && empty($disabled)) {
    form_set_error('projects', t('You must select at least one project to update.'));
  }
}

/**
 * Form submission handler for installer_manager_update_form().
 *
 * Sets up a batch that downloads, extracts, and verifies the selected releases.
 *
 * @see installer_manager_update_form_validate()
 */
function installer_manager_update_form_submit($form, &$form_state) {
  $projects = array();
  foreach (array('projects', 'disabled_projects') as $type) {
    if (!empty($form_state['values'][$type])) {
      $projects = array_merge($projects, array_keys(array_filter($form_state['values'][$type])));
    }
  }
  $operations = array();
  foreach ($projects as $project) {
    $operations[] = array(
      'installer_manager_batch_project_get',
      array(
        $project,
        $form_state['values']['project_downloads'][$project],
      ),
    );
  }
  $batch = array(
    'title' => t('Downloading updates'),
    'init_message' => t('Preparing to download selected updates'),
    'operations' => $operations,
    'finished' => 'installer_manager_download_batch_finished',
    'file' => backdrop_get_path('module', 'installer') . '/installer.manager.inc',
  );
  batch_set($batch);
}

/**
 * Batch callback: Performs actions when the download batch is completed.
 *
 * @param $success
 *   TRUE if the batch operation was successful, FALSE if there were errors.
 * @param $results
 *   An associative array of results from the batch operation.
 */
function installer_manager_download_batch_finished($success, $results) {
  if (!empty($results['errors'])) {
    $error_list = array(
      'title' => t('Downloading updates failed:'),
      'items' => $results['errors'],
    );
    backdrop_set_message(theme('item_list', $error_list), 'error');
  }
  elseif ($success) {
    backdrop_set_message(t('Updates downloaded successfully.'));
    $_SESSION['installer_manager_update_projects'] = $results['projects'];
    backdrop_goto('admin/update/ready');
  }
  else {
    // Ideally we're catching all Exceptions, so they should never see this,
    // but just in case, we have to tell them something.
    backdrop_set_message(t('Fatal error trying to download.'), 'error');
  }
}

/**
 * Form constructor for the update ready form.
 *
 * Build the form when the site is ready to update (after downloading).
 *
 * This form is an intermediary step in the automated update workflow. It is
 * presented to the site administrator after all the required updates have been
 * downloaded and verified. The point of this page is to encourage the user to
 * backup their site, give them the opportunity to put the site offline, and
 * then ask them to confirm that the update should continue. After this step,
 * the user is redirected to authorize.php to enter their file transfer
 * credentials and attempt to complete the update.
 *
 * @see installer_manager_update_ready_form_submit()
 * @see update_menu()
 * @ingroup forms
 */
function installer_manager_update_ready_form($form, &$form_state) {
  if (!_installer_manager_check_backends($form, 'update')) {
    return $form;
  }

  $form['backup'] = array(
    '#prefix' => '<strong>',
    '#markup' => t('Back up your database and site before you continue. <a href="@backup_url">Learn how</a>.', array('@backup_url' => url('http://drupal.org/node/22281'))),
    '#suffix' => '</strong>',
  );

  $form['maintenance_mode'] = array(
    '#title' => t('Perform updates with site in maintenance mode (strongly recommended)'),
    '#type' => 'checkbox',
    '#default_value' => TRUE,
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Continue'),
  );

  return $form;
}

/**
 * Form submission handler for installer_manager_update_ready_form().
 *
 * If the site administrator requested that the site is put offline during the
 * update, do so now. Otherwise, pull information about all the required updates
 * out of the SESSION, figure out what Updater class is needed for each one,
 * generate an array of update operations to perform, and hand it all off to
 * system_authorized_init(), then redirect to authorize.php.
 *
 * @see installer_authorize_run_update()
 * @see system_authorized_init()
 * @see system_authorized_get_url()
 */
function installer_manager_update_ready_form_submit($form, &$form_state) {
  // Store maintenance_mode setting so we can restore it when done.
  $_SESSION['maintenance_mode'] = config_get('system.core', 'maintenance_mode');
  if ($form_state['values']['maintenance_mode'] == TRUE) {
    state_set('maintenance_mode', TRUE);
  }

  if (!empty($_SESSION['installer_manager_update_projects'])) {
    // Make sure the Updater registry is loaded.
    backdrop_get_updaters();

    $updates = array();
    $directory = _installer_manager_extract_directory();

    $projects = $_SESSION['installer_manager_update_projects'];
    unset($_SESSION['installer_manager_update_projects']);

    $project_realpath = NULL;
    foreach ($projects as $project => $url) {
      $project_location = $directory . '/' . $project;
      $updater = Updater::factory($project_location);
      $project_realpath = backdrop_realpath($project_location);
      $updates[] = array(
        'project' => $project,
        'updater_name' => get_class($updater),
        'local_url' => $project_realpath,
      );
    }

    // If the owner of the last directory we extracted is the same as the
    // owner of our configuration directory where we're trying to install the
    // code, there's no need to prompt for FTP/SSH credentials. Instead, we
    // instantiate a FileTransferLocal and invoke installer_authorize_run_update()
    // directly.
    if (fileowner($project_realpath) == fileowner(conf_path())) {
      module_load_include('inc', 'installer', 'installer.authorize');
      $filetransfer = new FileTransferLocal(BACKDROP_ROOT);
      installer_authorize_run_update($filetransfer, $updates);
    }
    // Otherwise, go through the regular workflow to prompt for FTP/SSH
    // credentials and invoke installer_authorize_run_update() indirectly with
    // whatever FileTransfer object authorize.php creates for us.
    else {
      system_authorized_init('installer_authorize_run_update', backdrop_get_path('module', 'installer') . '/installer.authorize.inc', array($updates), t('Update manager'));
      $form_state['redirect'] = system_authorized_get_url();
    }
  }
}

/**
 * @} End of "defgroup installer_manager_update".
 */

/**
 * @defgroup installer_manager_install Installer module: install
 * @{
 * Installer module functionality for installing new code.
 *
 * Provides a user interface to install new code.
 */

/**
 * Form constructor for the install form of the Installer module.
 *
 * This presents a place to enter a URL or upload an archive file to use to
 * install a new module, theme, or layout.
 *
 * @see installer_manager_install_form_validate()
 * @see installer_manager_install_form_submit()
 * @see update_menu()
 * @ingroup forms
 */
function installer_manager_install_form($form, &$form_state) {
  if (!_installer_manager_check_backends($form, 'install')) {
    return $form;
  }

  backdrop_set_title('Manual installation');

  $form['help_text'] = array(
    '#prefix' => '<p>',
    '#markup' => t('You can find modules, themes, and layouts on <a href="https://backdropcms.org">backdropcms.org</a>. The following file extensions are supported: %extensions.', array(
      '%extensions' => archiver_get_extensions(),
    )),
    '#suffix' => '</p>',
  );

  $form['bulk_wrapper'] = array(
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#title' => t('Install projects by name'),
  );
  $form['bulk_wrapper']['bulk'] = array(
    '#type' => 'textarea',
    '#title' => t('Names'),
    '#description' => t('Enter project names, one name per line. Names must only contain lowercase letters, numbers, and underscores.'),
  );

  $form['project_url_wrapper'] = array(
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#title' => t('Install from a URL'),
  );
  $form['project_url_wrapper']['project_url'] = array(
    '#type' => 'url',
    '#title' => t('Install from a URL'),
    '#description' => t('For example: %url', array('%url' => 'https://github.com/backdrop-contrib/module/archive/1.x-1.2.3.zip')),
  );

  $form['project_upload_wrapper'] = array(
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#title' => t('Upload a module, theme, or layout archive to install'),
  );
  $form['project_upload_wrapper']['project_upload'] = array(
    '#type' => 'file',
    '#title' => t('Upload a module, theme, or layout archive to install'),
    '#description' => t('For example: %filename from your local computer', array('%filename' => 'name.tar.gz')),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#ajax' => array(
      'callback' => 'installer_manager_install_modal_callback',
    ),
    '#submit' => array('installer_manager_install_form_submit'),
    '#type' => 'submit',
    '#value' => t('Install'),
  );

  return $form;
}

/**
 * AJAX callback to update the add/remove queue on bulk add.
 */
function installer_manager_install_modal_callback($form, $form_state) {
  $commands = array();
  $commands[] = ajax_command_close_modal_dialog();

  // If errors occurred in the dialog, show messages and re-display.
  if (form_get_errors()) {
    $html = '';
    $html .= theme('status_messages');
    $html .= backdrop_render($form);
    $title = isset($form['#title']) ? $form['#title'] : 'Manual installation';
    $commands[] = ajax_command_open_modal_dialog($title, $html, array('width' => 700, 'dialogClass' => 'layout-dialog'));
  }
  elseif (!empty($form_state['redirect'])) {
    if (is_array($form_state['redirect'])) {
      $url = call_user_func_array('url', $form_state['redirect']);
    }
    else {
      $url = url($form_state['redirect'], array('absolute' => TRUE));
    }
    $commands[] = ajax_command_redirect($url);
  }

  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * Checks for file transfer backends and prepares a form fragment about them.
 *
 * @param array $form
 *   Reference to the form array we're building.
 * @param string $operation
 *   The update manager operation we're in the middle of. Can be either 'update'
 *   or 'install'. Use to provide operation-specific interface text.
 *
 * @return
 *   TRUE if the update manager should continue to the next step in the
 *   workflow, or FALSE if we've hit a fatal configuration and must halt the
 *   workflow.
 */
function _installer_manager_check_backends(&$form, $operation) {
  // If file transfers will be performed locally, we do not need to display any
  // warnings or notices to the user and should automatically continue the
  // workflow, since we won't be using a FileTransfer backend that requires
  // user input or a specific server configuration.
  if (installer_manager_local_transfers_allowed()) {
    return TRUE;
  }

  // Otherwise, show the available backends.
  $form['available_backends'] = array(
    '#prefix' => '<p>',
    '#suffix' => '</p>',
  );

  $available_backends = backdrop_get_filetransfer_info();
  if (empty($available_backends)) {
    if ($operation == 'update') {
      $form['available_backends']['#markup'] = t('Your server does not support updating modules, themes, and layouts from this interface. Instead, update modules, themes, and layouts by uploading the new versions directly to the server, as described in the <a href="@handbook_url">handbook</a>.', array('@handbook_url' => 'https://backdropcms.org/guide/modules'));
    }
    else {
      $form['available_backends']['#markup'] = t('Your server does not support installing modules, themes, and layouts from this interface. Instead, install modules, themes, and layouts by uploading them directly to the server, as described in the <a href="@handbook_url">handbook</a>.', array('@handbook_url' => 'https://backdropcms.org/guide/modules'));
    }
    return FALSE;
  }

  $backend_names = array();
  foreach ($available_backends as $backend) {
    $backend_names[] = $backend['title'];
  }
  if ($operation == 'update') {
    $form['available_backends']['#markup'] = format_plural(
      count($available_backends),
      'Updating modules, themes, and layouts requires <strong>@backends access</strong> to your server. See the <a href="@handbook_url">handbook</a> for other update methods.',
      'Updating modules, themes, and layouts requires access to your server via one of the following methods: <strong>@backends</strong>. See the <a href="@handbook_url">handbook</a> for other update methods.',
      array(
        '@backends' => implode(', ', $backend_names),
        '@handbook_url' => 'https://backdropcms.org/guide/modules',
      ));
  }
  else {
    $form['available_backends']['#markup'] = format_plural(
      count($available_backends),
      'Installing modules, themes, and layouts requires <strong>@backends access</strong> to your server. See the <a href="@handbook_url">handbook</a> for other installation methods.',
      'Installing modules, themes, and layouts requires access to your server via one of the following methods: <strong>@backends</strong>. See the <a href="@handbook_url">handbook</a> for other installation methods.',
      array(
        '@backends' => implode(', ', $backend_names),
        '@handbook_url' => 'https://backdropcms.org/guide/modules',
      ));
  }
  return TRUE;
}

/**
 * Form validation handler for installer_manager_install_form().
 *
 * @see installer_manager_install_form_submit()
 */
function installer_manager_install_form_validate($form, &$form_state) {
  if (!empty($form_state['values']['bulk'])) {
    // Prepare entered names.
    $project_names = explode("\n", $form_state['values']['bulk']);
    $project_names = array_map('trim', $project_names);
    $project_names = array_filter($project_names, 'strlen');
    if (empty($project_names)) {
      form_set_error('bulk', t('Sorry, none of the submitted names are valid.'));
    }

    // This repetitious bit here exists because there is no way to query all 
    // projects at once from the server. So we compromise by searching each
    // project type using a large 'items_per_page' value to get all results.
    // Since we can only query the server by project, we ask for all modules
    // first, check if any of the submitted project names are not modules, then
    // check themes, then layouts. Anything left over after this is not a valid
    // project on the server.
    $not_found = array();
    module_load_include('inc', 'installer', 'installer.browser');

    $modules = installer_browser_fetch_results(array('items_per_page' => 999, 'type' => 'module'));
    $all_projects = $modules['projects'];
    if (!empty($modules)) {
      $listed_projects = array_keys($modules['projects']);
      $not_found = array_diff($project_names, $listed_projects);
      if ($not_found) {
        $themes = installer_browser_fetch_results(array('items_per_page' => 999, 'type' => 'theme'));
        if (!empty($themes)) {
          $all_projects = array_merge($all_projects, $themes['projects']);
          $listed_projects = array_keys($themes['projects']);
          $not_found = array_diff($not_found, $listed_projects);
          if ($not_found) {
            $layouts = installer_browser_fetch_results(array('items_per_page' => 999, 'type' => 'layout'));
            if (!empty($layouts)) {
              $all_projects = array_merge($all_projects, $layouts['projects']);
              $listed_projects = array_keys($layouts['projects']);
              $not_found = array_diff($not_found, $listed_projects);
            }
          }
        }
      }
    }
    else {
      // If there was no return from the server assume it is offline.
      form_set_error('bulk', t('Sorry, the project server is offline.'));
    }

    // If some of the submitted names were not valid projects first check to
    // see if any at all were valid. If some were valid, we proceed with a 
    // warning. If not were valid, we terminate with error.
    if ($not_found) {
      $project_names = array_diff($project_names, $not_found);
      backdrop_set_message(t('Sorry, the following projects were not recognized: %names', array('%names' => implode(', ', $not_found))));
    }
    // Check if any remaining names are already installed.
    foreach ($project_names as $project_name) {
      $project = $all_projects[$project_name];
      // Check not already downloaded.
      $already_enabled = array();
      if (backdrop_get_filename($project['type'], $project_name)) {
        $already_enabled[] = $project_name;
      }
      if (!empty($already_enabled)) {
        $project_names = array_diff($project_names, $already_enabled);
        backdrop_set_message(t('The following projects are already installed: %names', array('%names' => implode(', ', $already_enabled))));
      }
    }

    // If there are no valid projects left, stop here
    if (!$project_names) {
      form_set_error('bulk', t('Sorry, none of the submitted names are valid projects.'));
    }

    // If we got this far, we have at least one valid project, so save in
    // $form_state.
    $projects = array();
    foreach ($project_names as $project_name) {
      $projects[$project_name] = $all_projects[$project_name];
    }

    $form_state['projects'] = $projects;
  }
  elseif (!($form_state['values']['project_url'] XOR !empty($_FILES['files']['name']['project_upload']))) {
    form_set_error('project_url', t('You must either provide project names, a URL, or upload an archive file to install.'));
  }
}

/**
 * Form submission handler for installer_manager_install_form().
 */
function installer_manager_install_form_submit($form, &$form_state) {
  if (!empty($form_state['projects'])) {
    foreach ($form_state['projects'] as $project) {
      installer_browser_install_queue_add($project);
    }
    $form_state['redirect'] = 'admin/installer/install/select_versions';
  }
  else {
    $return = installer_manager_download_project($form_state['values']['project_url']);
    if (empty($return['success'])) {
      form_set_error('project_url', $return['message']);
    }
    if (!empty($return['redirect'])) {
      $form_state['redirect'] = $return['redirect'];
    }
  }
}

/**
 * Downloads a project given a project url.
 *
 * Either downloads the file specified in the URL to a temporary cache, or
 * uploads the file attached to the form, then attempts to extract the archive
 * into a temporary location and verify it. Instantiate the appropriate
 * Updater class for this project and make sure it is not already installed in
 * the live webroot. If everything is successful, setup an operation to run
 * via authorize.php which will copy the extracted files from the temporary
 * location into the live site.
 *
 * @param string $is_installer
 *   Whether the project is being installed via the Project Installer UI.
 *
 * @return array
 *   An associative array with keys:
 *   - 'success': whether the update was successful
 *   - 'message': an error or success message.
 *
 * @see installer_manager_install_form_validate()
 * @see installer_authorize_run_install()
 * @see system_authorized_init()
 * @see system_authorized_get_url()
 */
function installer_manager_download_project($url, $is_installer = FALSE) {
  if ($url) {
    $local_cache = installer_manager_file_get($url);
    if (!$local_cache) {
      return array(
        'success' => FALSE,
        'message' => t('Unable to retrieve Backdrop project from %url.', array('%url' => $url)),
      );
    }
  }
  elseif ($_FILES['files']['name']['project_upload']) {
    $validators = array('file_validate_extensions' => array(archiver_get_extensions()));
    $field = 'project_upload';
    if (!($file_info = file_save_upload($field, $validators, NULL, FILE_EXISTS_REPLACE))) {
      // Failed to upload the file. file_save_upload() calls form_set_error() on
      // failure.
      return array(
        'success' => FALSE,
        'message' => t('Unable to save downloaded project into the temporary directory.'),
      );
    }
    $local_cache = $file_info->uri;
  }
  else {
    $local_cache = NULL;
  }

  // Try to extract it.
  $directory = _installer_manager_extract_directory();
  try {
    $archive = installer_manager_archive_extract($local_cache, $directory);
  }
  catch (Exception $e) {
    return array(
      'success' => FALSE,
      'message' => $e->getMessage(),
    );
  }
  $files = $archive->listContents();
  if (!$files) {
    return array(
      'success' => FALSE,
      'message' => t('Provided archive contains no files.'),
    );
  }


  // Unfortunately, we can only use the directory name to determine the project
  // name. Some archivers list the first file as the directory (i.e., MODULE/)
  // and others list an actual file (i.e., MODULE/README.MD).
  $project = strtok($files[0], '/\\');

  $archive_errors = installer_manager_archive_verify($project, $local_cache, $directory);
  if (!empty($archive_errors)) {
    return array(
      'success' => FALSE,
      'message' => array_shift($archive_errors),
    );
  }

  // Make sure the Updater registry is loaded.
  backdrop_get_updaters();

  $project_location = $directory . '/' . $project;
  try {
    $updater = Updater::factory($project_location);
  }
  catch (Exception $e) {
    return array(
      'success' => FALSE,
      'message' => $e->getMessage(),
    );
  }

  try {
    $project_title = Updater::getProjectTitle($project_location);
  }
  catch (Exception $e) {
    return array(
      'success' => FALSE,
      'message' => $e->getMessage(),
    );
  }

  if (!$project_title) {
    return array(
      'success' => FALSE,
      'message' => t('Unable to determine %project name.', array('%project' => $project)),
    );
  }

  if ($updater->isInstalled()) {
    return array(
      'success' => FALSE,
      'message' => t('%project is already installed.', array('%project' => $project_title)),
    );
  }

  $project_realpath = backdrop_realpath($project_location);
  $updater_name = get_class($updater);

  // If the permissions of the downloaded file match those of the settings.php
  // directory, go ahead and install the module directly.
  if (fileowner($project_realpath) == fileowner(conf_path())) {
    module_load_include('inc', 'installer', 'installer.authorize');
    $filetransfer = new FileTransferLocal(BACKDROP_ROOT);

    if ($is_installer) {
      // Initialize some variables in the Batch API $context array.
      /* @var Updater $updater */
      $updater = new $updater_name($project_realpath);

      try {
        if ($updater->isInstalled()) {
          // This is an update.
          $updater->update($filetransfer);
        }
        else {
          $updater->install($filetransfer);
        }
      }
      catch (UpdaterException $e) {
        return array(
          'success' => FALSE,
          'message' => t('Error installing / updating. Error: @error', array('@error' => $e->getMessage())),
        );
      }
    }
    else {
      // Start the batch process to install the module but suppress redirecting
      // to authorize.php, return the redirect instead.
      $redirect_callback = backdrop_is_ajax() ? FALSE : 'backdrop_goto';
      installer_authorize_run_install($filetransfer, $project, $updater_name, $project_realpath, $redirect_callback);

      // Assemble the authorize.php path and go to it to complete the batch.
      $batch = &batch_get();
      return array(
        'success' => TRUE,
        'redirect' => array($batch['url'], array('query' => array('op' => 'start', 'id' => $batch['id']))),
      );
    }
  }
  // If permissions differ, redirect to authorize.php to copy the file as a
  // different system user.
  else {
    if ($is_installer) {
      return array(
        'success' => FALSE,
        'message' => t('Permissions are not set up properly.'),
      );
    }
    else {
      $path = backdrop_get_path('module', 'installer') . '/installer.authorize.inc';
      system_authorized_init('installer_authorize_run_install', $path, array($project, $updater_name, $project_realpath), t('Update manager'));
      return array(
        'success' => TRUE,
        'redirect' => system_authorized_get_url(),
      );
    }
  }

  return array(
    'success' => TRUE,
  );
}

/**
 * @} End of "defgroup installer_manager_install".
 */

/**
 * @defgroup installer_manager_file Installer module: file management
 * @{
 * Installer module file management functions.
 *
 * These functions are used by the update manager to copy, extract, and verify
 * archive files.
 */

/**
 * Unpacks a downloaded archive file.
 *
 * @param string $file
 *   The filename of the archive you wish to extract.
 * @param string $directory
 *   The directory you wish to extract the archive into.
 *
 * @return ArchiverInterface
 *   The Archiver object used to extract the archive.
 *
 * @throws Exception
 */
function installer_manager_archive_extract($file, $directory) {
  $archiver = archiver_get_archiver($file);
  if (!$archiver) {
    throw new Exception(t('Cannot extract %file, not a valid archive.', array ('%file' => $file)));
  }

  // Remove the directory if it exists, otherwise it might contain a mixture of
  // old files mixed with the new files (e.g. in cases where files were removed
  // from a later release).
  $files = $archiver->listContents();

  // Unfortunately, we can only use the directory name to determine the project
  // name. Some archivers list the first file as the directory (i.e., MODULE/)
  // and others list an actual file (i.e., MODULE/README.MD).
  $project = strtok($files[0], '/\\');

  $extract_location = $directory . '/' . $project;
  if (file_exists($extract_location)) {
    file_unmanaged_delete_recursive($extract_location);
  }

  $archiver->extract($directory);

  // Clear the file stat cache to ensure PHP picks up the new files.
  clearstatcache();

  return $archiver;
}

/**
 * Verifies an archive after it has been downloaded and extracted.
 *
 * This function is responsible for invoking hook_verify_update_archive().
 *
 * @param string $project
 *   The short name of the project to download.
 * @param string $archive_file
 *   The filename of the unextracted archive.
 * @param string $directory
 *   The directory that the archive was extracted into.
 *
 * @return array
 *   An array of error messages to display if the archive was invalid. If there
 *   are no errors, it will be an empty array.
 */
function installer_manager_archive_verify($project, $archive_file, $directory) {
  return module_invoke_all('verify_update_archive', $project, $archive_file, $directory);
}

/**
 * Copies a file from the specified URL to the temporary directory for updates.
 *
 * Returns the local path if the file has already been downloaded.
 *
 * @param $url
 *   The URL of the file on the server.
 *
 * @return string
 *   Path to local file.
 */
function installer_manager_file_get($url) {
  $parsed_url = parse_url($url);
  $remote_schemes = array('http', 'https', 'ftp', 'ftps', 'smb', 'nfs');
  if (!in_array($parsed_url['scheme'], $remote_schemes)) {
    // This is a local file, just return the path.
    return backdrop_realpath($url);
  }

  // Check the cache and download the file if needed.
  $cache_directory = _installer_manager_cache_directory();
  $local = $cache_directory . '/' . backdrop_basename($parsed_url['path']);
  installer_delete_file_if_stale($local);

  if (!file_exists($local)) {
    return system_retrieve_file($url, $local, FALSE, FILE_EXISTS_REPLACE);
  }
  else {
    return $local;
  }
}

/**
 * Batch callback: Downloads, unpacks, and verifies a project.
 *
 * This function assumes that the provided URL points to a file archive of some
 * sort. The URL can have any scheme that we have a file stream wrapper to
 * support. The file is downloaded to a local cache.
 *
 * @param string $project
 *   The short name of the project to download.
 * @param string $url
 *   The URL to download a specific project release archive file.
 * @param array $context
 *   Reference to an array used for Batch API storage.
 *
 * @see installer_manager_download_page()
 */
function installer_manager_batch_project_get($project, $url, &$context) {
  // This is here to show the user that we are in the process of downloading.
  if (!isset($context['sandbox']['started'])) {
    $context['sandbox']['started'] = TRUE;
    $context['message'] = t('Downloading %project', array('%project' => $project));
    $context['finished'] = 0;
    return;
  }

  // Actually try to download the file.
  if (!($local_cache = installer_manager_file_get($url))) {
    $context['results']['errors'][$project] = t('Failed to download %project from %url', array('%project' => $project, '%url' => $url));
    return;
  }

  // Extract it.
  $extract_directory = _installer_manager_extract_directory();
  try {
    installer_manager_archive_extract($local_cache, $extract_directory);
  }
  catch (Exception $e) {
    $context['results']['errors'][$project] = $e->getMessage();
    return;
  }

  // Verify it.
  $archive_errors = installer_manager_archive_verify($project, $local_cache, $extract_directory);
  if (!empty($archive_errors)) {
    // We just need to make sure our array keys don't collide, so use the
    // numeric keys from the $archive_errors array.
    foreach ($archive_errors as $key => $error) {
      $context['results']['errors']["$project-$key"] = $error;
    }
    return;
  }

  // Yay, success.
  $context['results']['projects'][$project] = $url;
  $context['finished'] = 1;
}

/**
 * Determines if file transfers will be performed locally.
 *
 * If the server is configured such that webserver-created files have the same
 * owner as the configuration directory where new code will eventually be
 * installed, the update manager can transfer files entirely locally, without
 * changing their ownership (in other words, without prompting the user for FTP,
 * SSH or other credentials).
 *
 * This server configuration is an inherent security weakness because it allows
 * a malicious webserver process to append arbitrary PHP code and then execute
 * it. However, it is supported here because it is a common configuration on
 * shared hosting, and there is nothing Backdrop can do to prevent it.
 *
 * @return
 *   TRUE if local file transfers are allowed on this server, or FALSE if not.
 *
 * @see installer_manager_update_ready_form_submit()
 * @see installer_manager_install_form_submit()
 * @see install_check_requirements()
 */
function installer_manager_local_transfers_allowed() {
  // Compare the owner of a webserver-created temporary file to the owner of
  // the configuration directory to determine if local transfers will be
  // allowed.
  $temporary_file = backdrop_tempnam('temporary://', 'update_');
  $local_transfers_allowed = fileowner($temporary_file) === fileowner(conf_path());

  // Clean up. If this fails, we can ignore it (since this is just a temporary
  // file anyway).
  @backdrop_unlink($temporary_file);

  return $local_transfers_allowed;
}

/**
 * @} End of "defgroup installer_manager_file".
 */
