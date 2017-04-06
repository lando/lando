<?php
/**
 * @file
 * API functions for installing Backdrop.
 */

/**
 * Do not run the task during the current installation request.
 *
 * This can be used to skip running an installation task when certain
 * conditions are met, even though the task may still show on the list of
 * installation tasks presented to the user. For example, the Backdrop installer
 * uses this flag to skip over the database configuration form when valid
 * database connection information is already available from settings.php. It
 * also uses this flag to skip language import tasks when the installation is
 * being performed in English.
 */
define('INSTALL_TASK_SKIP', 1);

/**
 * Run the task on each installation request until the database is set up.
 *
 * This is primarily used by the Backdrop installer for bootstrap-related tasks.
 */
define('INSTALL_TASK_RUN_IF_REACHED', 2);

/**
 * Global flag to indicate that a task should be run on each installation
 * request that reaches it, until the database is set up and we are able to
 * record the fact that it already ran.
 *
 * This is the default method for running tasks and should be used for most
 * tasks that occur after the database is set up; these tasks will then run
 * once and be marked complete once they are successfully finished. For
 * example, the Backdrop installer uses this flag for the batch installation of
 * modules on the new site, and also for the configuration form that collects
 * basic site information and sets up the site maintenance account.
 */
define('INSTALL_TASK_RUN_IF_NOT_COMPLETED', 3);

/**
 * Installs Backdrop either interactively or via an array of passed-in settings.
 *
 * The Backdrop installation happens in a series of steps, which may be spread
 * out over multiple page requests. Each request begins by trying to determine
 * the last completed installation step (also known as a "task"), if one is
 * available from a previous request. Control is then passed to the task
 * handler, which processes the remaining tasks that need to be run until (a)
 * an error is thrown, (b) a new page needs to be displayed, or (c) the
 * installation finishes (whichever happens first).
 *
 * @param $settings
 *   An optional array of installation settings. Leave this empty for a normal,
 *   interactive, browser-based installation intended to occur over multiple
 *   page requests. Alternatively, if an array of settings is passed in, the
 *   installer will attempt to use it to perform the installation in a single
 *   page request (optimized for the command line) and not send any output
 *   intended for the web browser. See install_state_defaults() for a list of
 *   elements that are allowed to appear in this array.
 *
 * @see install_state_defaults()
 *
 * @throws Exception
 */
function install_backdrop($settings = array()) {
  global $install_state;
  // Initialize the installation state with the settings that were passed in,
  // as well as a boolean indicating whether or not this is an interactive
  // installation.
  $interactive = empty($settings);
  $install_state = $settings + array('interactive' => $interactive) + install_state_defaults();
  try {
    // Begin the page request. This adds information about the current state of
    // the Backdrop installation to the passed-in array.
    install_begin_request($install_state);
    // Based on the installation state, run the remaining tasks for this page
    // request, and collect any output.
    $output = install_run_tasks($install_state);
  }
  catch (Exception $e) {
    // When an installation error occurs, either send the error to the web
    // browser or pass on the exception so the calling script can use it.
    if ($install_state['interactive']) {
      install_display_output($e->getMessage(), $install_state);
    }
    else {
      throw $e;
    }
  }
  // All available tasks for this page request are now complete. Interactive
  // installations can send output to the browser or redirect the user to the
  // next page.
  if ($install_state['interactive']) {
    if ($install_state['parameters_changed']) {
      // Redirect to the correct page if the URL parameters have changed.
      install_goto(install_redirect_url($install_state));
    }
    elseif (isset($output)) {
      // Display a page only if some output is available. Otherwise it is
      // possible that we are printing a JSON page and theme output should
      // not be shown.
      install_display_output($output, $install_state);
    }
  }
}

/**
 * Returns an array of default settings for the global installation state.
 *
 * The installation state is initialized with these settings at the beginning
 * of each page request. They may evolve during the page request, but they are
 * initialized again once the next request begins.
 *
 * Non-interactive Backdrop installations can override some of these default
 * settings by passing in an array to the installation script, most notably
 * 'parameters' (which contains one-time parameters such as 'profile' and
 * 'langcode' that are normally passed in via the URL) and 'forms' (which can
 * be used to programmatically submit forms during the installation; the keys
 * of each element indicate the name of the installation task that the form
 * submission is for, and the values are used as the $form_state['values']
 * array that is passed on to the form submission via backdrop_form_submit()).
 *
 * @see backdrop_form_submit()
 */
function install_state_defaults() {
  $defaults = array(
    // The current task being processed.
    'active_task' => NULL,
    // The last task that was completed during the previous installation
    // request.
    'completed_task' => NULL,
    // This becomes TRUE only when Backdrop's system module is installed.
    'database_tables_exist' => FALSE,
    // An array of forms to be programmatically submitted during the
    // installation. The keys of each element indicate the name of the
    // installation task that the form submission is for, and the values are
    // used as the $form_state['values'] array that is passed on to the form
    // submission via backdrop_form_submit().
    'forms' => array(),
    // This becomes TRUE only at the end of the installation process, after
    // all available tasks have been completed and Backdrop is fully installed.
    // It is used by the installer to store correct information in the database
    // about the completed installation, as well as to inform theme functions
    // that all tasks are finished (so that the task list can be displayed
    // correctly).
    'installation_finished' => FALSE,
    // Whether or not this installation is interactive. By default this will
    // be set to FALSE if settings are passed in to install_backdrop().
    'interactive' => TRUE,
    // An array of available translation files for the installation.
    'translations' => array(),
    // An array of parameters for the installation, pre-populated by the URL
    // or by the settings passed in to install_backdrop(). This is primarily
    // used to store 'profile' (the name of the chosen installation profile)
    // and 'langcode' (the code of the chosen installation language), since
    // these settings need to persist from page request to page request before
    // the database is available for storage.
    'parameters' => array(),
    // Whether or not the parameters have changed during the current page
    // request. For interactive installations, this will trigger a page
    // redirect.
    'parameters_changed' => FALSE,
    // An array of information about the chosen installation profile. This will
    // be filled in based on the profile's .info file.
    'profile_info' => array(),
    // An array of available installation profiles.
    'profiles' => array(),
    // An array of server variables that will be substituted into the global
    // $_SERVER array via backdrop_override_server_variables(). Used by
    // non-interactive installations only.
    'server' => array(),
    // This becomes TRUE only when a valid database connection can be
    // established.
    'settings_verified' => FALSE,
    // Installation tasks can set this to TRUE to force the page request to
    // end (even if there is no themable output), in the case of an interactive
    // installation. This is needed only rarely; for example, it would be used
    // by an installation task that prints JSON output rather than returning a
    // themed page. The most common example of this is during batch processing,
    // but the Backdrop installer automatically takes care of setting this
    // parameter properly in that case, so that individual installation tasks
    // which implement the batch API do not need to set it themselves.
    'stop_page_request' => FALSE,
    // Installation tasks can set this to TRUE to indicate that the task should
    // be run again, even if it normally wouldn't be. This can be used, for
    // example, if a single task needs to be spread out over multiple page
    // requests, or if it needs to perform some validation before allowing
    // itself to be marked complete. The most common examples of this are batch
    // processing and form submissions, but the Backdrop installer automatically
    // takes care of setting this parameter properly in those cases, so that
    // individual installation tasks which implement the batch API or form API
    // do not need to set it themselves.
    'task_not_complete' => FALSE,
    // A list of installation tasks which have already been performed during
    // the current page request.
    'tasks_performed' => array(),
  );
  return $defaults;
}

/**
 * Begins an installation request, modifying the installation state as needed.
 *
 * This function performs commands that must run at the beginning of every page
 * request. It throws an exception if the installation should not proceed.
 *
 * @param $install_state
 *   An array of information about the current installation state. This is
 *   modified with information gleaned from the beginning of the page request.
 *
 * @throws Exception
 */
function install_begin_request(&$install_state) {
  // Add any installation parameters passed in via the URL.
  $install_state['parameters'] += $_GET;

  // Validate certain core settings that are used throughout the installation.
  if (!empty($install_state['parameters']['profile'])) {
    $install_state['parameters']['profile'] = preg_replace('/[^a-zA-Z_0-9]/', '', $install_state['parameters']['profile']);
  }
  if (!empty($install_state['parameters']['langcode'])) {
    $install_state['parameters']['langcode'] = preg_replace('/[^a-zA-Z_0-9\-]/', '', $install_state['parameters']['langcode']);
  }

  // Allow command line scripts to override server variables used by Backdrop.
  require_once BACKDROP_ROOT . '/core/includes/bootstrap.inc';
  if (!$install_state['interactive']) {
    backdrop_override_server_variables($install_state['server']);
  }

  // The user agent header is used to pass a database prefix in the request when
  // running tests. However, for security reasons, it is imperative that no
  // installation be permitted using such a prefix.
  if (isset($_SERVER['HTTP_USER_AGENT']) && strpos($_SERVER['HTTP_USER_AGENT'], "simpletest") !== FALSE) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden');
    exit;
  }

  backdrop_bootstrap(BACKDROP_BOOTSTRAP_CONFIGURATION);

  require_once BACKDROP_ROOT . '/core/modules/system/system.install';
  require_once BACKDROP_ROOT . '/core/includes/common.inc';
  require_once BACKDROP_ROOT . '/core/includes/file.inc';
  require_once BACKDROP_ROOT . '/core/includes/install.inc';
  require_once BACKDROP_ROOT . '/' . settings_get('path_inc', 'core/includes/path.inc');

  // Load module basics (needed for hook invokes).
  include_once BACKDROP_ROOT . '/core/includes/module.inc';
  include_once BACKDROP_ROOT . '/core/includes/session.inc';
  require_once BACKDROP_ROOT . '/core/includes/theme.inc';

  require_once BACKDROP_ROOT . '/core/includes/ajax.inc';
  $module_list['system']['filename'] = 'core/modules/system/system.module';
  $module_list['entity']['filename'] = 'core/modules/entity/entity.module';
  $module_list['user']['filename']   = 'core/modules/user/user.module';
  module_list(TRUE, FALSE, FALSE, $module_list);
  backdrop_load('module', 'system');
  backdrop_load('module', 'entity');
  backdrop_load('module', 'user');

  // Load the cache infrastructure using a "fake" cache implementation that
  // does not attempt to write to the database. We need this during the initial
  // part of the installer because the database is not available yet. We
  // continue to use it even when the database does become available, in order
  // to preserve consistency between interactive and command-line installations
  // (the latter complete in one page request and therefore are forced to
  // continue using the cache implementation they started with) and also
  // because any data put in the cache during the installer is inherently
  // suspect, due to the fact that Backdrop is not fully set up yet.
  require_once BACKDROP_ROOT . '/core/includes/cache.inc';
  require_once BACKDROP_ROOT . '/core/includes/cache-install.inc';
  $GLOBALS['settings']['cache_default_class'] = 'BackdropFakeCache';

  // Set up $language, so t() caller functions will still work.
  backdrop_language_initialize();

  // Prepare for themed output. We need to run this at the beginning of the
  // page request to avoid a different theme accidentally getting set. (We also
  // need to run it even in the case of command-line installations, to prevent
  // any code in the installer that happens to initialize the theme system from
  // accessing the database before it is set up yet.)
  backdrop_maintenance_theme();

  // Check existing settings.php.
  $install_state['settings_verified'] = install_verify_settings();

  if ($install_state['settings_verified']) {
    // Initialize the database system. Note that the connection
    // won't be initialized until it is actually requested.
    require_once BACKDROP_ROOT . '/core/includes/database/database.inc';

    // Verify the last completed task in the database, if there is one.
    $task = install_verify_completed_task();
  }
  else {
    $task = NULL;

    // Do not install over a configured settings.php.
    if (!empty($GLOBALS['databases'])) {
      throw new Exception(install_already_done_error());
    }
  }

  // Modify the installation state as appropriate.
  $install_state['completed_task'] = $task;
  $install_state['database_tables_exist'] = !empty($task);

  // Add the list of available profiles to the installation state.
  $install_state['profiles'] += install_find_profiles();
}

/**
 * Runs all tasks for the current installation request.
 *
 * In the case of an interactive installation, all tasks will be attempted
 * until one is reached that has output which needs to be displayed to the
 * user, or until a page redirect is required. Otherwise, tasks will be
 * attempted until the installation is finished.
 *
 * @param $install_state
 *   An array of information about the current installation state. This is
 *   passed along to each task, so it can be modified if necessary.
 *
 * @return
 *   HTML output from the last completed task.
 */
function install_run_tasks(&$install_state) {
  do {
    // Obtain a list of tasks to perform. The list of tasks itself can be
    // dynamic (e.g., some might be defined by the installation profile,
    // which is not necessarily known until the earlier tasks have run),
    // so we regenerate the remaining tasks based on the installation state,
    // each time through the loop.
    $tasks_to_perform = install_tasks_to_perform($install_state);
    // Run the first task on the list.
    reset($tasks_to_perform);
    $task_name = key($tasks_to_perform);
    $task = array_shift($tasks_to_perform);
    $install_state['active_task'] = $task_name;
    $original_parameters = $install_state['parameters'];
    $output = install_run_task($task, $install_state);
    $install_state['parameters_changed'] = ($install_state['parameters'] != $original_parameters);
    // Store this task as having been performed during the current request,
    // and save it to the database as completed, if we need to and if the
    // database is in a state that allows us to do so. Also mark the
    // installation as 'done' when we have run out of tasks.
    if (!$install_state['task_not_complete']) {
      $install_state['tasks_performed'][] = $task_name;
      $install_state['installation_finished'] = empty($tasks_to_perform);
      if ($install_state['database_tables_exist'] && ($task['run'] == INSTALL_TASK_RUN_IF_NOT_COMPLETED || $install_state['installation_finished'])) {
        state_set('install_task', $install_state['installation_finished'] ? 'done' : $task_name);
      }
    }
    // Stop when there are no tasks left. In the case of an interactive
    // installation, also stop if we have some output to send to the browser,
    // the URL parameters have changed, or an end to the page request was
    // specifically called for.
    $finished = empty($tasks_to_perform) || ($install_state['interactive'] && (isset($output) || $install_state['parameters_changed'] || $install_state['stop_page_request']));
  } while (!$finished);
  return $output;
}

/**
 * Runs an individual installation task.
 *
 * @param $task
 *   An array of information about the task to be run as returned by
 *   hook_install_tasks().
 * @param $install_state
 *   An array of information about the current installation state. This is
 *   passed in by reference so that it can be modified by the task.
 *
 * @return string|NULL
 *   The output of the task function, if there is any.
 *
 * @throws Exception
 */
function install_run_task($task, &$install_state) {
  $function = $task['function'];

  if ($task['type'] == 'form') {
    require_once BACKDROP_ROOT . '/core/includes/form.inc';
    if ($install_state['interactive']) {
      // For interactive forms, build the form and ensure that it will not
      // redirect, since the installer handles its own redirection only after
      // marking the form submission task complete.
      $form_state = array(
        // We need to pass $install_state by reference in order for forms to
        // modify it, since the form API will use it in call_user_func_array(),
        // which requires that referenced variables be passed explicitly.
        'build_info' => array('args' => array(&$install_state)),
        'no_redirect' => TRUE,
        // Form build IDs are used to load prebuilt forms from tempstore.
        // However, during install these tables don't exist yet. Prevent
        // setting/checking the database with no_cache property.
        'no_cache' => TRUE,
      );
      $form = backdrop_build_form($function, $form_state);
      // If a successful form submission did not occur, the form needs to be
      // rendered, which means the task is not complete yet.
      if (empty($form_state['executed'])) {
        $install_state['task_not_complete'] = TRUE;
        return backdrop_render($form);
      }
      // Otherwise, return nothing so the next task will run in the same
      // request.
      return NULL;
    }
    else {
      // For non-interactive forms, submit the form programmatically with the
      // values taken from the installation state. Throw an exception if any
      // errors were encountered.
      $form_state = array(
        'values' => !empty($install_state['forms'][$function]) ? $install_state['forms'][$function] : array(),
        // We need to pass $install_state by reference in order for forms to
        // modify it, since the form API will use it in call_user_func_array(),
        // which requires that referenced variables be passed explicitly.
        'build_info' => array('args' => array(&$install_state)),
      );
      backdrop_form_submit($function, $form_state);
      $errors = form_get_errors();
      if (!empty($errors)) {
        throw new Exception(implode("\n", $errors));
      }
    }
  }

  elseif ($task['type'] == 'batch') {
    // Start a new batch based on the task function, if one is not running
    // already.
    $current_batch = state_get('install_current_batch');
    if (!$install_state['interactive'] || !$current_batch) {
      $batch = $function($install_state);
      if (empty($batch)) {
        // If the task did some processing and decided no batch was necessary,
        // there is nothing more to do here.
        return NULL;
      }
      batch_set($batch);
      // For interactive batches, we need to store the fact that this batch
      // task is currently running. Otherwise, we need to make sure the batch
      // will complete in one page request.
      if ($install_state['interactive']) {
        state_set('install_current_batch', $function);
      }
      else {
        $batch =& batch_get();
        $batch['progressive'] = FALSE;
      }
      // Process the batch. For progressive batches, this will redirect.
      // Otherwise, the batch will complete.
      batch_process(install_redirect_url($install_state), install_full_redirect_url($install_state));
    }
    // If we are in the middle of processing this batch, keep sending back
    // any output from the batch process, until the task is complete.
    elseif ($current_batch == $function) {
      include_once BACKDROP_ROOT . '/core/includes/batch.inc';
      $output = _batch_page();
      // The task is complete when we try to access the batch page and receive
      // FALSE in return, since this means we are at a URL where we are no
      // longer requesting a batch ID.
      if ($output === FALSE) {
        // Return nothing so the next task will run in the same request.
        state_del('install_current_batch');
        return NULL;
      }
      else {
        // We need to force the page request to end if the task is not
        // complete, since the batch API sometimes prints JSON output
        // rather than returning a themed page.
        $install_state['task_not_complete'] = $install_state['stop_page_request'] = TRUE;
        return $output;
      }
    }
  }

  else {
    // For normal tasks, just return the function result, whatever it is.
    return $function($install_state);
  }
}

/**
 * Returns a list of tasks to perform during the current installation request.
 *
 * Note that the list of tasks can change based on the installation state as
 * the page request evolves (for example, if an installation profile hasn't
 * been selected yet, we don't yet know which profile tasks need to be run).
 *
 * You can override this using hook_install_tasks() or
 * hook_install_tasks_alter().
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   A list of tasks to be performed, with associated metadata as returned by
 *   hook_install_tasks().
 */
function install_tasks_to_perform($install_state) {
  // Start with a list of all currently available tasks.
  $tasks = install_tasks($install_state);
  foreach ($tasks as $name => $task) {
    // Remove any tasks that were already performed or that never should run.
    // Also, if we started this page request with an indication of the last
    // task that was completed, skip that task and all those that come before
    // it, unless they are marked as always needing to run.
    if ($task['run'] == INSTALL_TASK_SKIP || in_array($name, $install_state['tasks_performed']) || (!empty($install_state['completed_task']) && empty($completed_task_found) && $task['run'] != INSTALL_TASK_RUN_IF_REACHED)) {
      unset($tasks[$name]);
    }
    if (!empty($install_state['completed_task']) && $name == $install_state['completed_task']) {
      $completed_task_found = TRUE;
    }
  }
  return $tasks;
}

/**
 * Returns a list of all tasks the installer currently knows about.
 *
 * This function will return tasks regardless of whether or not they are
 * intended to run on the current page request. However, the list can change
 * based on the installation state (for example, if an installation profile
 * hasn't been selected yet, we don't yet know which profile tasks will be
 * available).
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   A list of tasks, with associated metadata.
 */
function install_tasks($install_state) {
  // Determine whether translation import tasks will need to be performed.
  $needs_translations = count($install_state['translations']) > 1 && !empty($install_state['parameters']['langcode']) && $install_state['parameters']['langcode'] != 'en';

  // Display profile task only when there is more than one non-hidden profile.
  $hidden_profile_count = 0;
  foreach ($install_state['profiles'] as $profile) {
    $profile_info = install_profile_info($profile->name);
    $hidden_profile_count += empty($profile_info['hidden']);
  }
  $display_select_profile = $hidden_profile_count > 1 && count($install_state['profiles']) != 1;

  // Start with the core installation tasks that run before handing control
  // to the installation profile.
  $tasks = array(
    'install_select_language' => array(
      'display_name' => st('Choose language'),
      'run' => INSTALL_TASK_RUN_IF_REACHED,
    ),
    'install_select_profile' => array(
      'display_name' => st('Choose profile'),
      'display' => $display_select_profile,
      'run' => INSTALL_TASK_RUN_IF_REACHED,
    ),
    'install_load_profile' => array(
      'run' => INSTALL_TASK_RUN_IF_REACHED,
    ),
    'install_verify_requirements' => array(
      'display_name' => st('Verify site requirements'),
    ),
    'install_hash_salt' => array(
      'run' => INSTALL_TASK_RUN_IF_REACHED,
    ),
    'install_settings_form' => array(
      'display_name' => st('Set up your database'),
      'type' => 'form',
      'run' => $install_state['settings_verified'] ? INSTALL_TASK_SKIP : INSTALL_TASK_RUN_IF_NOT_COMPLETED,
    ),
    'install_config_directories' => array(
    ),
    'install_system_module' => array(
    ),
    'install_bootstrap_full' => array(
      'run' => INSTALL_TASK_RUN_IF_REACHED,
    ),
    'install_profile_modules' => array(
      'display_name' => count($install_state['profiles']) == 1 ? st('Install site') : st('Install profile'),
      'type' => 'batch',
    ),
    'install_import_translations' => array(
      'display_name' => st('Set up translations'),
      'display' => $needs_translations,
      'type' => 'batch',
      'run' => $needs_translations ? INSTALL_TASK_RUN_IF_NOT_COMPLETED : INSTALL_TASK_SKIP,
    ),
    'install_configure_form' => array(
      'display_name' => st('Configure your site'),
      'type' => 'form',
    ),
  );

  // Now add any tasks defined by the installation profile.
  if (!empty($install_state['parameters']['profile'])) {
    // Load the profile install file, because it is not always loaded when
    // hook_install_tasks() is invoked (e.g. batch processing).
    $profile_install_file = BACKDROP_ROOT . '/profiles/' . $install_state['parameters']['profile'] . '/' . $install_state['parameters']['profile'] . '.install';
    if (file_exists($profile_install_file)) {
      include_once $profile_install_file;
    }
    $function = $install_state['parameters']['profile'] . '_install_tasks';
    if (function_exists($function)) {
      $result = $function($install_state);
      if (is_array($result)) {
        $tasks += $result;
      }
    }
  }

  // Finish by adding the remaining core tasks.
  $tasks += array(
    'install_import_translations_remaining' => array(
      'display_name' => st('Finish translations'),
      'display' => $needs_translations,
      'type' => 'batch',
      'run' => $needs_translations ? INSTALL_TASK_RUN_IF_NOT_COMPLETED : INSTALL_TASK_SKIP,
    ),
    'install_finished' => array(
    ),
  );

  // Allow the installation profile to modify the full list of tasks.
  if (!empty($install_state['parameters']['profile'])) {
    $profile_file = BACKDROP_ROOT . '/profiles/' . $install_state['parameters']['profile'] . '/' . $install_state['parameters']['profile'] . '.profile';
    if (file_exists($profile_file)) {
      include_once $profile_file;
      $function = $install_state['parameters']['profile'] . '_install_tasks_alter';
      if (function_exists($function)) {
        $function($tasks, $install_state);
      }
    }
  }

  // Fill in default parameters for each task before returning the list.
  foreach ($tasks as $task_name => &$task) {
    $task += array(
      'display_name' => NULL,
      'display' => !empty($task['display_name']),
      'type' => 'normal',
      'run' => INSTALL_TASK_RUN_IF_NOT_COMPLETED,
      'function' => $task_name,
    );
  }
  return $tasks;
}

/**
 * Returns a list of tasks that should be displayed to the end user.
 *
 * The output of this function is a list suitable for sending to
 * theme_task_list().
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   A list of tasks, with keys equal to the machine-readable task name and
 *   values equal to the name that should be displayed.
 *
 * @see theme_task_list()
 */
function install_tasks_to_display($install_state) {
  $displayed_tasks = array();
  foreach (install_tasks($install_state) as $name => $task) {
    if ($task['display']) {
      $displayed_tasks[$name] = $task['display_name'];
    }
  }
  return $displayed_tasks;
}

/**
 * Returns the URL that should be redirected to during an installation request.
 *
 * The output of this function is suitable for sending to install_goto().
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   The URL to redirect to.
 *
 * @see install_full_redirect_url()
 */
function install_redirect_url($install_state) {
  return 'core/install.php?' . backdrop_http_build_query($install_state['parameters']);
}

/**
 * Returns the complete URL redirected to during an installation request.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   The complete URL to redirect to.
 *
 * @see install_redirect_url()
 */
function install_full_redirect_url($install_state) {
  global $base_url;
  return $base_url . '/' . install_redirect_url($install_state);
}

/**
 * Displays themed installer output and ends the page request.
 *
 * Installation tasks should use backdrop_set_title() to set the desired page
 * title, but otherwise this function takes care of theming the overall page
 * output during every step of the installation.
 *
 * @param $output
 *   The content to display on the main part of the page.
 * @param $install_state
 *   An array of information about the current installation state.
 */
function install_display_output($output, $install_state) {
  backdrop_page_header();

  // Prevent install.php from being indexed when installed in a sub folder.
  // robots.txt rules are not read if the site is within domain.com/subfolder
  // resulting in /subfolder/install.php being found through search engines.
  // When settings.php is writeable this can be used via an external database
  // leading a malicious user to gain php access to the server.
  $noindex_meta_tag = array(
    '#tag' => 'meta',
    '#attributes' => array(
      'name' => 'robots',
      'content' => 'noindex, nofollow',
    ),
  );
  backdrop_add_html_head($noindex_meta_tag, 'install_meta_robots');

  // Only show the task list if there is an active task; otherwise, the page
  // request has ended before tasks have even been started, so there is nothing
  // meaningful to show.
  if (isset($install_state['active_task'])) {
    // Let the theming function know when every step of the installation has
    // been completed.
    $active_task = $install_state['installation_finished'] ? NULL : $install_state['active_task'];
    $task_list = theme('task_list', array('items' => install_tasks_to_display($install_state), 'active' => $active_task));
  }
  else {
    $task_list = NULL;
  }
  print theme('install_page', array('content' => $output, 'sidebar' => $task_list));
  exit;
}

/**
 * Verifies the requirements for installing Backdrop.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return string|NULL
 *   A themed status report, or an exception if there are requirement errors.
 *   If there are only requirement warnings, a themed status report is shown
 *   initially, but the user is allowed to bypass it by providing 'continue=1'
 *   in the URL. Otherwise, no output is returned, so that the next task can be
 *   run in the same page request.
 *
 * @throws Exception
 */
function install_verify_requirements(&$install_state) {
  // Check the installation requirements for Backdrop and this profile.
  $requirements = install_check_requirements($install_state);

  // Verify existence of all required modules.
  $requirements += backdrop_verify_profile($install_state);

  // Check the severity of the requirements reported.
  $severity = backdrop_requirements_severity($requirements);

  // If there are errors, always display them. If there are only warnings, skip
  // them if the user has provided a URL parameter acknowledging the warnings
  // and indicating a desire to continue anyway. See backdrop_requirements_url().
  if ($severity == REQUIREMENT_ERROR || ($severity == REQUIREMENT_WARNING && empty($install_state['parameters']['continue']))) {
    if ($install_state['interactive']) {
      backdrop_set_title(st('Requirements problem'));
      $status_report = theme('status_report', array('requirements' => $requirements));
      $status_report .= st('Check the messages and <a href="!url">try again</a>.', array('!url' => check_url(backdrop_requirements_url($severity))));
      return $status_report;
    }
    else {
      // Throw an exception showing any unmet requirements.
      $failures = array();
      foreach ($requirements as $requirement) {
        // Skip warnings altogether for non-interactive installations; these
        // proceed in a single request so there is no good opportunity (and no
        // good method) to warn the user anyway.
        if (isset($requirement['severity']) && $requirement['severity'] == REQUIREMENT_ERROR) {
          $failures[] = $requirement['title'] . ': ' . $requirement['value'] . "\n\n" . $requirement['description'];
        }
      }
      if (!empty($failures)) {
        throw new Exception(implode("\n\n", $failures));
      }
    }
  }

  // Non-interactive requirements check.
  return NULL;
}

/**
 * Installation task; install the Backdrop system module.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 */
function install_system_module(&$install_state) {
  // Install system.module.
  backdrop_install_system();

  // Call file_ensure_htaccess() to ensure that all of Backdrop's standard
  // directories (e.g., the public and private files directories) have
  // appropriate .htaccess files. These directories will have already been
  // created by this point in the installer, since Backdrop creates them during
  // the install_verify_requirements() task. Note that we cannot call
  // file_ensure_htaccess() any earlier than this, since it relies on
  // system.module in order to work.
  file_ensure_htaccess();

  // Enable the entity and user modules so that sessions can be recorded during
  // the upcoming bootstrap step.
  module_enable(array('entity', 'user'), FALSE);

  // Save the list of other modules to install for the upcoming tasks.
  // state_set() can be used now that system.module is installed.
  $modules = $install_state['profile_info']['dependencies'];

  // The installation profile is also a module, which needs to be installed
  // after all the dependencies have been installed.
  $modules[] = $install_state['parameters']['profile'];

  state_set('install_profile_modules', array_diff($modules, array('system')));
  $install_state['database_tables_exist'] = TRUE;

  // Prevent the hook_requirements() check from telling us to convert the
  // database to utf8mb4.
  $connection = Database::getConnection();
  if ($connection->utf8mb4IsActive()) {
    state_set('backdrop_utf8mb4_tables', TRUE);
  }
}

/**
 * Verifies and returns the last installation task that was completed.
 *
 * @return string|NULL
 *   The last completed task, if there is one. An exception is thrown if Backdrop
 *   is already installed.
 *
 * @throws Exception
 */
function install_verify_completed_task() {
  try {
    if ($result = db_query("SELECT value FROM {state} WHERE name = :name", array('name' => 'install_task'))) {
      $task = unserialize($result->fetchField());
    }
  }
  // Do not trigger an error if the database query fails, since the database
  // might not be set up yet.
  catch (Exception $e) {
  }
  if (isset($task)) {
    if ($task == 'done') {
      throw new Exception(install_already_done_error());
    }
    return $task;
  }

  // No install task found.
  return NULL;
}

/**
 * Verifies if UTF8 MB4 support is available in the database.
 *
 * @return bool
 */
function install_verify_database_utf8mb4() {
  try {
    return Database::getConnection()->utf8mb4IsSupported();
  }
  catch (Exception $e) {
    return FALSE;
  }
}

/**
 * Verifies the existing settings in settings.php.
 */
function install_verify_settings() {
  global $databases;

  // Verify existing settings (if any).
  if (!empty($databases) && install_verify_pdo()) {
    $database = $databases['default']['default'];
    backdrop_static_reset('conf_path');
    $settings_file = conf_path(FALSE) . '/settings.php';
    $errors = install_database_errors($database, $settings_file);
    if (empty($errors)) {
      return TRUE;
    }
  }
  return FALSE;
}

/**
 * Verifies the PDO library.
 */
function install_verify_pdo() {
  // PDO was moved to PHP core in 5.2.0, but the old extension (targeting 5.0
  // and 5.1) is still available from PECL, and can still be built without
  // errors. To verify that the correct version is in use, we check the
  // PDO::ATTR_DEFAULT_FETCH_MODE constant, which is not available in the
  // PECL extension.
  return extension_loaded('pdo') && defined('PDO::ATTR_DEFAULT_FETCH_MODE');
}

/**
 * Installation task; Rewrite settings.php to include hash salt.
 */
function install_hash_salt() {
  global $settings;

  if (empty($settings['hash_salt'])) {
    $update_settings["settings['hash_salt']"] = array(
      'value' => backdrop_random_key(),
      'required' => TRUE,
    );

    // Hash salt is optional, so allow installation even if it can't be written.
    try {
      backdrop_rewrite_settings($update_settings);
    }
    catch (Exception $e) {}
  }
}

/**
 * Installation task; Rewrite settings.php to include config directories.
 */
function install_config_directories(&$install_state) {
  backdrop_install_config_directories();
}

/**
 * Form constructor for a form to configure and rewrite settings.php.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @see install_settings_form_validate()
 * @see install_settings_form_submit()
 * @ingroup forms
 */
function install_settings_form($form, &$form_state, &$install_state) {
  global $databases;

  // Do not let Backdrop attempt to save this form to tempstore, since the
  // table itself won't exist yet.
  $form_state['no_cache'] = TRUE;

  backdrop_static_reset('conf_path');
  $settings_file = conf_path(FALSE) . '/settings.php';
  $database = isset($databases['default']['default']) ? $databases['default']['default'] : array();

  backdrop_set_title(st('Database configuration'));

  $form['driver'] = array(
    '#type' => 'hidden',
    '#required' => TRUE,
    '#value' => !empty($database['driver']) ? $database['driver'] : 'mysql',
  );

  $driver = backdrop_load_database_driver();

  // Add driver specific configuration options.
  $form['driver']['#options']['mysql'] = $driver->name();

  $form['settings']['mysql'] = $driver->getFormOptions($database);
  $form['settings']['mysql']['#prefix'] = '<h2 class="js-hide">' . st('@driver_name settings', array('@driver_name' => $driver->name())) . '</h2>';
  $form['settings']['mysql']['#type'] = 'container';
  $form['settings']['mysql']['#tree'] = TRUE;
  $form['settings']['mysql']['advanced_options']['#parents'] = array('mysql');
  $form['settings']['mysql']['#states'] = array(
    'visible' => array(
      ':input[name=driver]' => array('value' => 'mysql'),
    )
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['save'] = array(
    '#type' => 'submit',
    '#value' => st('Save and continue'),
    '#limit_validation_errors' => array(
      array('driver'),
      array(isset($form_state['input']['driver']) ? $form_state['input']['driver'] : 'mysql'),
    ),
    '#submit' => array('install_settings_form_submit'),
  );

  $form['errors'] = array();
  $form['settings_file'] = array('#type' => 'value', '#value' => $settings_file);

  return $form;
}

/**
 * Form validation handler for install_settings_form().
 *
 * @see install_settings_form_submit()
 */
function install_settings_form_validate($form, &$form_state) {
  $driver = $form_state['values']['driver'];
  $database = $form_state['values'][$driver];
  $database['driver'] = $driver;

  $form_state['storage']['database'] = $database;
  $errors = install_database_errors($database, $form_state['values']['settings_file']);
  foreach ($errors as $name => $message) {
    form_set_error($name, $message);
  }
}

/**
 * Checks a database connection and returns any errors.
 */
function install_database_errors($database, $settings_file) {
  global $databases;
  $errors = array();

  // Check database type.
  $driver = $database['driver'];
  if (!$mysql_driver = backdrop_load_database_driver()) {
    $errors['driver'] = st("In your %settings_file file you have configured @profile to use a %driver server, however your PHP installation currently does not support this database type.", array('%settings_file' => $settings_file, '@profile' => backdrop_install_profile_distribution_name(), '%driver' => $driver));
  }
  else {
    // Run driver specific validation
    $errors += $mysql_driver->validateDatabaseSettings($database);

    // Run tasks associated with the database type. Any errors are caught in the
    // calling function.
    $databases['default']['default'] = $database;
    // Just changing the global doesn't get the new information processed.
    // We tell tell the Database class to re-parse $databases.
    Database::parseConnectionInfo();

    try {
      db_run_tasks($driver);
    }
    catch (DatabaseTaskException $e) {
      // These are generic errors, so we do not have any specific key of the
      // database connection array to attach them to; therefore, we just put
      // them in the error array with standard numeric keys.
      $errors[$driver . '][0'] = $e->getMessage();
    }
  }
  return $errors;
}

/**
 * Form submission handler for install_settings_form().
 *
 * @see install_settings_form_validate()
 */
function install_settings_form_submit($form, &$form_state) {
  global $install_state;

  // Update global settings array and save.
  $db_settings = $form_state['storage']['database'];
  $settings['database'] = array(
    'value' => $db_settings['driver'] . '://' . $db_settings['username'] . ':' . $db_settings['password'] . '@' . $db_settings['host'] . ($db_settings['port'] ? (':' . $db_settings['port']) : '') . '/' . $db_settings['database'],
    'required' => TRUE,
  );
  $settings['database_prefix'] = array(
    'value' => $db_settings['db_prefix'],
  );
  backdrop_rewrite_settings($settings);

  // Check if UTF-8 MB4 support exists in the database and add to settings.php.
  if (install_verify_database_utf8mb4()) {
    $settings['database_charset'] = array(
      'value' => 'utf8mb4',
      'required' => TRUE,
    );
    backdrop_rewrite_settings($settings);
  }

  // Indicate that the settings file has been verified, and check the database
  // for the last completed task, now that we have a valid connection. This
  // last step is important since we want to trigger an error if the new
  // database already has Backdrop installed.
  $install_state['settings_verified'] = TRUE;
  $install_state['completed_task'] = install_verify_completed_task();
}

/**
 * Finds all .profile files.
 */
function install_find_profiles() {
  return file_scan_directory('./profiles', '/\.profile$/', array('key' => 'name'));
}

/**
 * Selects which profile to install.
 *
 * @param $install_state
 *   An array of information about the current installation state. The chosen
 *   profile will be added here, if it was not already selected previously, as
 *   will a list of all available profiles.
 *
 * @return string
 *   For interactive installations, a form allowing the profile to be selected,
 *   if the user has a choice that needs to be made. Otherwise, an exception is
 *   thrown if a profile cannot be chosen automatically.
 *
 * @throws Exception
 */
function install_select_profile(&$install_state) {
  if (empty($install_state['parameters']['profile'])) {
    // Try to find a profile.
    $profile = _install_select_profile($install_state['profiles']);
    if (empty($profile)) {
      // We still don't have a profile, so display a form for selecting one.
      // Only do this in the case of interactive installations, since this is
      // not a real form with submit handlers (the database isn't even set up
      // yet), rather just a convenience method for setting parameters in the
      // URL.
      if ($install_state['interactive']) {
        include_once BACKDROP_ROOT . '/core/includes/form.inc';
        backdrop_set_title(st('Select an installation profile'));
        $form = backdrop_get_form('install_select_profile_form', $install_state['profiles']);
        return backdrop_render($form);
      }
      else {
        throw new Exception(install_no_profile_error());
      }
    }
    else {
      $install_state['parameters']['profile'] = $profile;
    }
  }
}

/**
 * Selects an installation profile from a list or from a $_POST submission.
 *
 * @return string|NULL
 *   The selected profile from $_POST, or the automatically selected profile if
 *   possible to determine one without prompting the user. If no profile can
 *   be selected, NULL is returned.
 *
 * @throws Exception
 */
function _install_select_profile($profiles) {
  if (sizeof($profiles) == 0) {
    throw new Exception(install_no_profile_error());
  }
  // Don't need to choose profile if only one available.
  if (sizeof($profiles) == 1) {
    $profile = array_pop($profiles);
    return $profile->name;
  }
  else {
    $available_profiles = array();
    $exclusive_profiles = array();
    foreach ($profiles as $profile) {
      if (!empty($_POST['profile']) && ($_POST['profile'] == $profile->name)) {
        return $profile->name;
      }

      $profile_info = install_profile_info($profile->name);
      // Check for profiles marked as "hidden".
      if (empty($profile_info['hidden'])) {
        $available_profiles[] = $profile->name;
      }
      // Check for a profile marked as "exclusive".
      elseif (!empty($profile_info['exclusive'])) {
        $exclusive_profiles[] = $profile->name;
      }
    }

    // If there is only one available profile, return it.
    if (count($available_profiles) == 1) {
      return reset($available_profiles);
    }
    // If there is only one exclusive profile, return it.
    elseif (count($exclusive_profiles) == 1) {
      return reset($exclusive_profiles);
    }
  }

  // No profile yet selected or possible to select automatically.
  return NULL;
}

/**
 * Form constructor for the profile selection form.
 *
 * @param $form_state
 *   Array of metadata about state of form processing.
 * @param $profile_files
 *   Array of .profile files, as returned from file_scan_directory().
 *
 * @ingroup forms
 */
function install_select_profile_form($form, &$form_state, $profile_files) {
  $profiles = array();
  $names = array();

  foreach ($profile_files as $profile) {
    // TODO: is this right?
    include_once BACKDROP_ROOT . '/' . $profile->uri;

    $details = install_profile_info($profile->name);
    // Don't show hidden profiles. This is used by to hide the testing profile,
    // which only exists to speed up test runs.
    if ($details['hidden'] === TRUE) {
      continue;
    }
    $profiles[$profile->name] = $details;

    // Determine the name of the profile; default to file name if defined name
    // is unspecified.
    $name = isset($details['name']) ? $details['name'] : $profile->name;
    $names[$profile->name] = $name;
  }

  // Display radio buttons alphabetically by human-readable name, but always
  // put the core profiles first (if they are present in the filesystem).
  natcasesort($names);
  if (isset($names['minimal'])) {
    // If the expert ("Minimal") core profile is present, put it in front of
    // any non-core profiles rather than including it with them alphabetically,
    // since the other profiles might be intended to group together in a
    // particular way.
    $names = array('minimal' => $names['minimal']) + $names;
  }
  if (isset($names['standard'])) {
    // If the default ("Standard") core profile is present, put it at the very
    // top of the list. This profile will have its radio button pre-selected,
    // so we want it to always appear at the top.
    $names = array('standard' => $names['standard']) + $names;
  }

  foreach ($names as $profile => $name) {
    // The profile name and description are extracted for translation from the
    // .info file, so we can use st() on them even though they are dynamic data
    // at this point.
    $form['profile'][$name] = array(
      '#type' => 'radio',
      '#value' => 'standard',
      '#return_value' => $profile,
      '#title' => st($name),
      '#description' => isset($profiles[$profile]['description']) ? st($profiles[$profile]['description']) : '',
      '#parents' => array('profile'),
    );
  }
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] =  array(
    '#type' => 'submit',
    '#value' => st('Save and continue'),
  );
  return $form;
}

/**
 * Find all .po files useful for the installer.
 */
function install_find_translations() {
  $files = install_find_translation_files();
  // English does not need a translation file.
  array_unshift($files, (object) array('name' => 'en'));
  foreach ($files as $key => $file) {
    // Strip off the file name component before the language code.
    $files[$key]->langcode = preg_replace('!^(.+\.)?([^\.]+)$!', '\2', $file->name);
  }
  return $files;
}

/**
 * Find installer translations either for a specific langcode or all languages.
 *
 * @param $langcode
 *   (optional) The language code corresponding to the language for which we
 *   want to find translation files. If omitted, information on all available
 *   files will be returned.
 *
 * @return
 *   An associative array of file information objects keyed by file URIs as
 *   returned by file_scan_directory().
 *
 * @see file_scan_directory()
 */
function install_find_translation_files($langcode = NULL) {
  $directory = settings_get('locale_translate_file_directory', 'files/translations');
  // @todo: Remove the "drupal" check in 2.x (assuming we have a localization
  //   server by then).
  $files = file_scan_directory($directory, '!(install|drupal-\d+\.\d+)\.' . (!empty($langcode) ? preg_quote($langcode, '!') : '[^\.]+') . '\.po$!', array('recurse' => FALSE));
  return $files;
}

/**
 * Installation task; select which language to use.
 *
 * @param $install_state
 *   An array of information about the current installation state. The chosen
 *   langcode will be added here, if it was not already selected previously, as
 *   will a list of all available languages.
 *
 * @return string|NULL
 *   For interactive installations, a form or other page output allowing the
 *   language to be selected or providing information about language selection,
 *   if a language has not been chosen. For non-interactive installs, nothing
 *   is returned. An exception is thrown if a language cannot be chosen
 *   automatically.
 *
 * @throws Exception
 */
function install_select_language(&$install_state) {
  // Find all available translations.
  $files = install_find_translations();
  $install_state['translations'] += $files;

  if (!empty($_POST['langcode'])) {
    foreach ($files as $file) {
      if ($_POST['langcode'] == $file->langcode) {
        $install_state['parameters']['langcode'] = $file->langcode;
        return NULL;
      }
    }
  }

  if (empty($install_state['parameters']['langcode'])) {
    // If only the built-in (English) language is available, and we are
    // performing an interactive installation, inform the user that the
    // installer can be translated. Otherwise we assume the user knows what he
    // is doing.
    if (count($files) == 1) {
      if ($install_state['interactive']) {
        $directory = settings_get('locale_translate_file_directory', 'files/translations');

        backdrop_set_title(st('Choose language'));
        if (!empty($install_state['parameters']['translate'])) {
          $output = '<p>Follow these steps to translate Backdrop into your language:</p>';
          $output .= '<ol>';
          $output .= '<li>Download a translation from the <a href="http://localize.drupal.org/download" target="_blank">translation server</a>.</li>';
          $output .= '<li>Place it into the following directory:<pre>' . $directory . '</pre></li>';
          $output .= '</ol>';
          $output .= '<p>For more information on installing Backdrop in different languages, visit the <a href="http://drupal.org/localize" target="_blank">drupal.org handbook page</a>.</p>';
          $output .= '<p>How should the installation continue?</p>';
          $output .= '<ul>';
          $output .= '<li><a href="' . check_url(backdrop_current_script_url(array('translate' => NULL))) . '">Reload the language selection page after adding translations</a></li>';
          $output .= '<li><a href="' . check_url(backdrop_current_script_url(array(
              'langcode' => 'en',
              'translate' => NULL
            ))) . '">Continue installation in English</a></li>';
          $output .= '</ul>';
        }
        else {
          include_once BACKDROP_ROOT . '/core/includes/form.inc';
          $elements = backdrop_get_form('install_select_language_form', $files);
          $output = backdrop_render($elements);
        }
        return $output;
      }
      // One language, but not an interactive installation. Assume the user
      // knows what he is doing.
      $file = current($files);
      $install_state['parameters']['langcode'] = $file->langcode;
      return NULL;
    }
    else {
      // We still don't have a langcode, so display a form for selecting one.
      // Only do this in the case of interactive installations, since this is
      // not a real form with submit handlers (the database isn't even set up
      // yet), rather just a convenience method for setting parameters in the
      // URL.
      if ($install_state['interactive']) {
        backdrop_set_title(st('Choose language'));
        include_once BACKDROP_ROOT . '/core/includes/form.inc';
        $elements = backdrop_get_form('install_select_language_form', $files);
        return backdrop_render($elements);
      }
      else {
        throw new Exception(st('Sorry, you must select a language to continue the installation.'));
      }
    }
  }
  // Non-interactive installs where no language was specified. No action to do.
  else {
    return NULL;
  }
}

/**
 * Form constructor for the language selection form.
 *
 * @ingroup forms
 */
function install_select_language_form($form, &$form_state, $files) {
  include_once BACKDROP_ROOT . '/core/includes/standard.inc';
  include_once BACKDROP_ROOT . '/core/includes/locale.inc';

  $standard_languages = standard_language_list();
  $select_options = array();
  $languages = array();

  foreach ($files as $file) {
    if (isset($standard_languages[$file->langcode])) {
      // Build a list of select list options based on files we found.
      $select_options[$file->langcode] = $standard_languages[$file->langcode][1];
    }
    else {
      // If the language was not found in standard.inc, display its langcode.
      $select_options[$file->langcode] = $file->langcode;
    }
    // Build a list of languages simulated for browser detection.
    $languages[$file->langcode] = (object) array(
      'langcode' => $file->langcode,
    );
  }

  $browser_langcode = locale_language_from_browser($languages);
  $form['langcode'] = array(
    '#type' => 'select',
    '#options' => $select_options,
    // Use the browser detected language as default or English if nothing found.
    '#default_value' => !empty($browser_langcode) ? $browser_langcode : 'en',
    '#size' => min(count($select_options), 10),
  );

  if (count($files) == 1) {
    $form['help'] = array(
      '#markup' => '<p><a href="' . check_url(backdrop_current_script_url(array('translate' => 'true'))) . '">' . st('Learn how to install Backdrop in other languages') . '</a></p>',
    );
  }
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] =  array(
    '#type' => 'submit',
    '#value' => st('Save and continue'),
  );
  return $form;
}

/**
 * Indicates that there are no profiles available.
 */
function install_no_profile_error() {
  backdrop_set_title(st('No profiles available'));
  return st('We were unable to find any installation profiles. Installation profiles tell us what modules to enable and what schema to install in the database. A profile is necessary to continue with the installation process.');
}

/**
 * Indicates that Backdrop has already been installed.
 */
function install_already_done_error() {
  global $base_url;

  backdrop_set_title(st('Backdrop already installed'));
  return st('<ul><li>To start over, you must empty your existing database.</li><li>To install to a different database, edit the appropriate <em>settings.php</em> file in the <em>sites</em> folder.</li><li>To upgrade an existing installation, proceed to the <a href="@base-url/core/update.php">update script</a>.</li><li>View your <a href="@base-url">existing site</a>.</li></ul>', array('@base-url' => $base_url));
}

/**
 * Loads information about the chosen profile during installation.
 *
 * @param array $install_state
 *   An array of information about the current installation state. The loaded
 *   profile information will be added here, or an exception will be thrown if
 *   the profile cannot be loaded.
 *
 * @throws Exception
 */
function install_load_profile(&$install_state) {
  $profile_file = BACKDROP_ROOT . '/profiles/' . $install_state['parameters']['profile'] . '/' . $install_state['parameters']['profile'] . '.profile';
  if (file_exists($profile_file)) {
    include_once $profile_file;
    $install_state['profile_info'] = install_profile_info($install_state['parameters']['profile'], $install_state['parameters']['langcode']);
  }
  else {
    throw new Exception(st('Sorry, the profile you have chosen cannot be loaded.'));
  }
}

/**
 * Performs a full bootstrap of Backdrop during installation.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 */
function install_bootstrap_full(&$install_state) {
  backdrop_bootstrap(BACKDROP_BOOTSTRAP_FULL);
}

/**
 * Installs required modules via a batch process.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   The batch definition.
 */
function install_profile_modules(&$install_state) {
  $modules = state_get('install_profile_modules', array());
  $files = system_rebuild_module_data();
  state_del('install_profile_modules');

  // Always install required modules first. Respect the dependencies between
  // the modules.
  $required = array();
  $non_required = array();
  // Although the profile module is marked as required, it needs to go after
  // every dependency, including non-required ones. So clear its required
  // flag for now to allow it to install late.
  $files[$install_state['parameters']['profile']]->info['required'] = FALSE;
  // Add modules that other modules depend on.
  foreach ($modules as $module) {
    if ($files[$module]->requires) {
      $modules = array_merge($modules, array_keys($files[$module]->requires));
    }
  }
  $modules = array_unique($modules);
  foreach ($modules as $module) {
    if (!empty($files[$module]->info['required'])) {
      $required[$module] = $files[$module]->sort;
    }
    else {
      $non_required[$module] = $files[$module]->sort;
    }
  }
  arsort($required);
  arsort($non_required);

  $operations = array();
  foreach ($required + $non_required as $module => $weight) {
    $operations[] = array('_install_module_batch', array($module, $files[$module]->info['name']));
  }
  $batch = array(
    'operations' => $operations,
    'title' => st('Installing @profile', array('@profile' => backdrop_install_profile_distribution_name())),
    'error_message' => st('The installation has encountered an error.'),
    'finished' => '_install_profile_modules_finished',
  );
  return $batch;
}

/**
 * Imports languages via a batch process during installation.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return array|NULL
 *   The batch definition, if there are language files to import.
 */
function install_import_translations(&$install_state) {
  include_once BACKDROP_ROOT . '/core/includes/locale.inc';
  include_once backdrop_get_path('module', 'locale') . '/locale.bulk.inc';
  $langcode = $install_state['parameters']['langcode'];

  include_once BACKDROP_ROOT . '/core/includes/standard.inc';
  module_enable(array('language', 'locale'));
  $standard_languages = standard_language_list();
  if (!isset($standard_languages[$langcode])) {
    // Backdrop does not know about this language, so we prefill its values with
    // our best guess. The user will be able to edit afterwards.
    $language = (object) array(
      'langcode' => $langcode,
      'name' => $langcode,
      'default' => TRUE,
    );
    language_save($language);
  }
  else {
    // A known predefined language, details will be filled in properly.
    $language = (object) array(
      'langcode' => $langcode,
      'default' => TRUE,
    );
    language_save($language);
  }

  // Collect files to import for this language.
  $batch = locale_translate_batch_import_files($langcode);
  if (!empty($batch)) {
    return $batch;
  }

  // No active batch.
  return NULL;
}

/**
 * Form constructor for a form to configure the new site.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @see install_configure_form_validate()
 * @see install_configure_form_submit()
 * @ingroup forms
 */
function install_configure_form($form, &$form_state, &$install_state) {
  backdrop_set_title(st('Configure site'));

  backdrop_add_js(backdrop_get_path('module', 'system') . '/js/system.admin.js');
  // Add JavaScript time zone detection.
  backdrop_add_js('core/misc/timezone.js');
  // We add these strings as settings because JavaScript translation does not
  // work during installation.
  backdrop_add_js(array('copyFieldValue' => array('edit-site-mail' => array('edit-account-mail'))), 'setting');
  backdrop_add_js('jQuery(function () { Backdrop.cleanURLsInstallCheck(); });', 'inline');
  // Build menu to allow clean URL check.
  menu_rebuild();

  // Cache a fully-built schema. This is necessary for any invocation of
  // index.php because: (1) setting cache table entries requires schema
  // information, (2) that occurs during bootstrap before any module are
  // loaded, so (3) if there is no cached schema, backdrop_get_schema() will
  // try to generate one but with no loaded modules will return nothing.
  //
  // This logically could be done during the 'install_finished' task, but the
  // clean URL check requires it now.
  backdrop_get_schema(NULL, TRUE);

  // Return the form.
  return _install_configure_form($form, $form_state, $install_state);
}

/**
 * Installation task; finish importing files at end of installation.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   The batch definition, if there are language files to import.
 *
 * @todo
 *   This currently does the same as the first import step. Need to revisit
 *   once we have l10n_update functionality integrated. See
 *   http://drupal.org/node/1191488.
 */
function install_import_translations_remaining(&$install_state) {
  include_once backdrop_get_path('module', 'locale') . '/locale.bulk.inc';
  return locale_translate_batch_import_files($install_state['parameters']['langcode']);
}

/**
 * Finishes importing files at end of installation.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @return
 *   A message informing the user that the installation is complete.
 */
function install_finished(&$install_state) {
  // Flush all caches to ensure that any full bootstraps during the installer
  // do not leave stale cached data, and that any content types or other items
  // registered by the installation profile are registered correctly.
  backdrop_flush_all_caches();

  // Remember the profile which was used.
  config_set('system.core', 'install_profile', $install_state['parameters']['profile']);

  // Installation profiles are always loaded last
  db_update('system')
    ->fields(array('weight' => 1000))
    ->condition('type', 'module')
    ->condition('name', $install_state['parameters']['profile'])
    ->execute();

  // Cache a fully-built schema.
  backdrop_get_schema(NULL, TRUE);

  // Set a state indicating that Backdrop is fully installed. Prevents further
  // visiting of install.php.
  state_set('install_task', 'done');

  // Run cron to populate update status tables (if available) so that users
  // will be warned if they've installed an out of date Backdrop version.
  // Will also trigger indexing of profile-supplied content or feeds.
  backdrop_cron_run();

  $message = st('Congratulations, you installed @profile!', array('@profile' => backdrop_install_profile_distribution_name()));

  if (!backdrop_is_cli()) {
    backdrop_set_message($message);
    backdrop_goto('<front>');
  }
}

/**
 * Batch callback for batch installation of modules.
 */
function _install_module_batch($module, $module_name, &$context) {
  // Install and enable the module right away, so that the module will be
  // loaded by backdrop_bootstrap in subsequent batch requests, and other
  // modules possibly depending on it can safely perform their installation
  // steps.
  module_enable(array($module), FALSE);
  $context['results'][] = $module;
  $context['message'] = st('Installed %module module.', array('%module' => $module_name));
}

/**
 * 'Finished' callback for module installation batch.
 */
function _install_profile_modules_finished($success, $results, $operations) {
  // Flush all caches to complete the module installation process. Subsequent
  // installation tasks will now have full access to the profile's modules.
  backdrop_flush_all_caches();
}

/**
 * Checks installation requirements and reports any errors.
 */
function install_check_requirements($install_state) {
  $profile = $install_state['parameters']['profile'];

  $requirements = array();

  // If Backdrop is not set up already, we need to update the settings file.
  if (!$install_state['settings_verified']) {
    $writable = FALSE;
    $conf_path = conf_path(FALSE, TRUE);
    $settings_file = $conf_path . '/settings.php';
    $exists = FALSE;
    // Verify that the directory exists.
    if (backdrop_verify_install_file($conf_path, FILE_EXIST, 'dir')) {
      // Check if a settings.php file already exists.
      if (backdrop_verify_install_file($settings_file, FILE_EXIST)) {
        // If it does, make sure it is writable.
        $writable = backdrop_verify_install_file($settings_file, FILE_READABLE|FILE_WRITABLE);
        $exists = TRUE;
      }
    }

    // If settings.php does not exist, throw an error.
    if (!$exists) {
      $requirements['settings file exists'] = array(
        'title'       => st('Settings file'),
        'value'       => st('The settings file does not exist.'),
        'severity'    => REQUIREMENT_ERROR,
        'description' => st('The @profile installer could not find a settings.php file. Please place copy of this file into @file.', array('@profile' => backdrop_install_profile_distribution_name(), '@file' => $settings_file)),
      );
      return $requirements;
    }
    else {
      $requirements['settings file exists'] = array(
        'title'       => st('Settings file'),
        'value'       => st('The %file file exists.', array('%file' => $settings_file)),
      );
    }
    // If settings.php is not writable, throw an error.
    if (!$writable) {
      $requirements['settings file writable'] = array(
        'title'       => st('Settings file'),
        'value'       => st('The settings file is not writable.'),
        'severity'    => REQUIREMENT_ERROR,
        'description' => st('The @profile installer requires write permissions to %file during the installation process. If you are unsure how to grant file permissions, consult the <a href="@handbook_url">Installation Instructions</a> page.', array('@profile' => backdrop_install_profile_distribution_name(), '%file' => $settings_file, '@handbook_url' => 'https://backdropcms.org/installation')),
      );
    }
    else {
      $requirements['settings file'] = array(
        'title'       => st('Settings file'),
        'value'       => st('The settings file is writable.'),
      );
    }
  }

  // Check the profile requirements.
  $requirements += backdrop_check_profile($profile);

  return $requirements;
}

/**
 * Form constructor for a site configuration form.
 *
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @see install_configure_form()
 * @see install_configure_form_validate()
 * @see install_configure_form_submit()
 * @ingroup forms
 */
function _install_configure_form($form, &$form_state, &$install_state) {
  include_once BACKDROP_ROOT . '/core/includes/locale.inc';

  $form['site_information'] = array(
    '#type' => 'fieldset',
    '#title' => st('Site information'),
    '#collapsible' => FALSE,
  );
  $form['site_information']['site_name'] = array(
    '#type' => 'textfield',
    '#title' => st('Site name'),
    '#required' => TRUE,
    '#weight' => -20,
  );

  $form['admin_account'] = array(
    '#type' => 'fieldset',
    '#title' => st('Primary user account'),
    '#collapsible' => FALSE,
  );

  $form['admin_account']['account']['#tree'] = TRUE;
  $form['admin_account']['account']['name'] = array('#type' => 'textfield',
    '#title' => st('Username'),
    '#maxlength' => USERNAME_MAX_LENGTH,
    '#description' => st('Spaces are allowed. Punctuation is not allowed except for periods, pluses, hyphens, and underscores.'),
    '#required' => TRUE,
    '#weight' => -10,
    '#attributes' => array('class' => array('username')),
  );

  $form['admin_account']['account']['mail'] = array(
    '#type' => 'email',
    '#title' => st('E-mail address'),
    '#required' => TRUE,
    '#weight' => -5,
  );
  $form['admin_account']['account']['pass'] = array(
    '#type' => 'password_confirm',
    '#required' => TRUE,
    '#weight' => 0,
  );

  $form['server_settings'] = array(
    '#type' => 'fieldset',
    '#title' => st('Server settings'),
    '#collapsible' => FALSE,
  );

  $form['server_settings']['date_default_timezone'] = array(
    '#type' => 'select',
    '#title' => st('Default time zone'),
    '#default_value' => date_default_timezone_get(),
    '#options' => system_time_zones(),
    '#description' => st('By default, dates in this site will be displayed in the chosen time zone.'),
    '#weight' => 5,
    '#attributes' => array('class' => array('timezone-detect')),
  );

  $form['server_settings']['clean_url'] = array(
    '#type' => 'hidden',
    '#default_value' => 0,
    '#attributes' => array('id' => 'edit-clean-url', 'class' => array('install')),
  );

  $form['update_notifications'] = array(
    '#type' => 'fieldset',
    '#title' => st('Update notifications'),
    '#collapsible' => FALSE,
  );
  $form['update_notifications']['update_status_module'] = array(
    '#type' => 'checkboxes',
    '#options' => array(
      1 => st('Check for updates automatically'),
      2 => st('Receive e-mail notifications'),
    ),
    '#default_value' => array(1, 2),
    '#description' => st('The system will notify you when updates and important security releases are available for installed components. Anonymous information about your site is sent to <a href="https://backdropcms.org">BackdropCMS.org</a>.'),
    '#weight' => 15,
  );
  $form['update_notifications']['update_status_module'][2] = array(
    '#states' => array(
      'visible' => array(
        'input[name="update_status_module[1]"]' => array('checked' => TRUE),
      ),
    ),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => st('Save and continue'),
    '#weight' => 15,
  );

  return $form;
}

/**
 * Form validation handler for install_configure_form().
 *
 * @see install_configure_form_submit()
 */
function install_configure_form_validate($form, &$form_state) {
  if ($error = user_validate_name($form_state['values']['account']['name'])) {
    form_error($form['admin_account']['account']['name'], $error);
  }
}

/**
 * Form submission handler for install_configure_form().
 *
 * @see install_configure_form_validate()
 */
function install_configure_form_submit($form, &$form_state) {
  global $user;

  config('system.core')
    ->set('site_name', $form_state['values']['site_name'])
    ->save();
  config('system.date')
    ->set('default_timezone', $form_state['values']['date_default_timezone'])
    ->set('default_country', _install_get_timezone_country($form_state['values']['date_default_timezone']))
    ->save();

  // Enable checking for updates on cron.
  if (module_exists('update')) {
    // Set the update interval to 0 if automatic checking is disabled.
    config_set('update.settings', 'update_interval_days', (int) $form_state['values']['update_status_module'][1]);

    // Add the site maintenance account's email address to the list of
    // addresses to be notified when updates are available, if selected.
    if ($form_state['values']['update_status_module'][2]) {
      config_set('update.settings', 'update_emails', array($form_state['values']['account']['mail']));
    }
  }

  // We precreated user 1 with placeholder values. Let's save the real values.
  $account = user_load(1);
  $account->init = $account->mail = $form_state['values']['account']['mail'];
  $account->roles = !empty($account->roles) ? $account->roles : array();
  $account->status = 1;
  $account->timezone = $form_state['values']['date_default_timezone'];
  $account->pass = $form_state['values']['account']['pass'];
  $account->name = $form_state['values']['account']['name'];
  $account->save();
  // Load global $user and perform final login tasks.
  $user = user_load(1);
  user_login_finalize();

  if (isset($form_state['values']['clean_url'])) {
    config_set('system.core', 'clean_url', $form_state['values']['clean_url']);
    backdrop_static_reset('url');
  }

  // Record when this install ran.
  state_set('install_time', $_SERVER['REQUEST_TIME']);
}

/**
 * Get a country code for the provided timezone.
 */
function _install_get_timezone_country($timezone) {
  // Get timezone countries list
  include_once BACKDROP_ROOT . '/core/includes/locale.inc';
  $timezone_countries = timezone_country_get_list();

  // Replace spaces in provided timezone with underscores
  $timezone = str_replace(' ', '_', $timezone);

  // Return timezone's country code or empty string
  if (isset($timezone_countries[$timezone])) {
    return $timezone_countries[$timezone];
  }
  else {
    return '';
  }
}
