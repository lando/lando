<?php

/**
 * Return an array for setting up a Batch API job to sync all configuration.
 */
function config_sync_batch($config_statuses = NULL) {
  if (empty($config_statuses)) {
    $config_statuses = config_get_statuses();
  }
  $operations[] = array('_config_sync_start', array($config_statuses));
  $operations[] = array('_config_sync_validate', array());
  $operations[] = array('_config_sync_import', array());
  $batch = array(
    'operations' => $operations,
    'title' => t('Importing configuration'),
    'init_message' => t('Starting import'),
    'error_message' => t('An error occurred while importing the configuration.'),
    'file' => backdrop_get_path('module', 'config') . '/config.sync.inc',
    'finished' => '_config_sync_finished',
  );
  return $batch;
}

/**
 * Batch API callback. Start the config import.
 */
function _config_sync_start($config_statuses, &$context) {
  state_set('config_sync', REQUEST_TIME);

  // The complete list of changes are stored in the results array. This makes
  // these values available in all subsequent batch callbacks.
  $context['results']['all_configs'] = $config_statuses;
  $context['results']['pending_changes'] = array_filter($config_statuses);
  $context['results']['completed_changes'] = array();
}

/**
 * Batch API callback. Validate the changes before attempting to sync.
 */
function _config_sync_validate(&$context) {
  if (!isset($context['sandbox']['batch_size'])) {
    $context['sandbox']['batch_size'] = config_get('system.core', 'config_sync_batch_size');
    $context['sandbox']['total_size'] = count($context['results']['pending_changes']);
    $context['sandbox']['current_index'] = 0;
  }

  $config_files = array_slice($context['results']['pending_changes'], $context['sandbox']['current_index'], $context['sandbox']['batch_size']);
  try {
    foreach ($config_files as $config_file => $config_change_type) {
      config_sync_validate_file($config_file, $config_change_type, $context['results']['all_configs']);
      $context['sandbox']['current_index']++;
    }
  }
  catch (ConfigValidateException $e) {
    $context['results']['errors'][] = $e->getMessage();
    $context['finished'] = 1;
    return;
  }

  $context['finished'] = $context['sandbox']['total_size'] ? $context['sandbox']['current_index'] / $context['sandbox']['total_size'] : 1;
}

/**
 * Batch API callback. Import the individual config files.
 */
function _config_sync_import(&$context) {
  // Bail if any errors have been set during validation.
  if (isset($context['results']['errors'])) {
    $context['finished'] = 1;
    return;
  }

  if (!isset($context['sandbox']['batch_size'])) {
    $context['sandbox']['batch_size'] = config_get('system.core', 'config_sync_batch_size');
    $context['sandbox']['total_size'] = count($context['results']['pending_changes']);
    $context['sandbox']['current_index'] = 0;
  }

  $config_files = array_slice($context['results']['pending_changes'], 0, $context['sandbox']['batch_size']);
  foreach ($config_files as $config_file => $config_change_type) {
    config_sync_file($config_file, $config_change_type);
    unset($context['results']['pending_changes'][$config_file]);
    $context['results']['completed_changes'][$config_file] = $config_change_type;
    $context['sandbox']['current_index']++;
  }

  $context['finished'] = $context['sandbox']['total_size'] ? $context['sandbox']['current_index'] / $context['sandbox']['total_size'] : 1;
}

/**
 * Batch API callback. Finish the config import.
 */
function _config_sync_finished($status, $results, $operations) {
  if ($status === FALSE) {
    backdrop_set_message(t('Configuration sync failed. Check that the configuration files are properly formatted.'), 'error');
  }
  if (!empty($results['errors'])) {
    backdrop_set_message(t('Configuration sync failed. The following errors were reported:') . ' ' . theme('item_list', array('items' => $results['errors'])), 'error');
  }
  if (!empty($results['completed_changes'])) {
    backdrop_set_message(t('Configuration sync completed. @files configuration files synced.', array('@files' => count($results['completed_changes']))));

    // Clean up the staging directory.
    $config_dir = config_get_config_directory('staging');
    $config_storage = new ConfigFileStorage($config_dir);
    $config_storage->deleteAll();
  }

  backdrop_flush_all_caches();
  state_del('config_sync');
}

/**
 * Validate an individual configuration to ensure it's safe to import.
 *
 * Calls all the necessary hooks to allow modules to validate a set of
 * configuration changes. If any module encounters a validation problem, it
 * should throw a ConfigValidateException exception.
 *
 * @param string $config_name
 *   The name of the config file being synced.
 * @param string $config_change_type
 *   The type of change occurring to this config file. Must be one of the
 *   following values: "create", "update", or "delete".
 * @param array|NULL $all_changes
 *   If this file is being changed with a group of other configuration files,
 *   pass in the complete set of files that are anticipated to be changed during
 *   the sync. If doing a typical sync between staging and live directories,
 *   this value can be retrieved from config_get_statuses(). If syncing a single
 *   configuration file, this value should be NULL.
 * @param array $data
 *   The configuration data to be validated if the data is coming from a source
 *   other than the staging configuration storage.
 *
 * @throws ConfigValidateException
 *
 * @see hook_config_create_validate().
 * @see hook_config_update_validate().
 * @see hook_config_delete_validate().
 */
function config_sync_validate_file($config_name, $config_change_type, $all_changes = NULL, $config_data = NULL) {
  // Read the config data from staging if contents are not provided.
  if (is_null($config_data)) {
    $staging_config = config($config_name, 'staging')->load();
  }
  // If contents are provided, create a staging config object. This object is
  // not actually written to disk, so it should not affect any existing staged
  // configuration files when performing a single import.
  else {
    $staging_config = config($config_name, 'staging')->setData($config_data);
  }

  // First check that a module claims this config file. Unclaimed configs cannot
  // be managed at all, because hooks may need to be fired when performing any
  // kind of change (e.g. a deleted config might need to remove database
  // tables).
  $config_info = config_get_info($config_name);
  if (empty($config_info)) {
    if ($config_change_type === 'delete') {
      $message = t('The configuration "@name" is not owned by any enabled module, so it cannot be deleted. If you have disabled this module, either <a href="!enable">enable the module</a> and try the import again, or <a href="!uninstall">uninstall the module entirely</a> to clean up left-over configuration.', array('@name' => $config_name, '!enable' => url('admin/modules'), '!uninstall' => url('admin/modules/uninstall')));
    }
    else {
      $message = t('The configuration "@name" is not owned by any module. Try enabling the module that provides this configuration, then importing again.', array('@name' => $config_name));
    }
    throw new ConfigValidateException($message);
  }

  switch ($config_change_type) {
    case 'create':
      $staging_config->validateData();
      module_invoke_all('config_create_validate', $staging_config, $all_changes);
      break;
    case 'update':
      $staging_config->validateData();
      $active_config = config($config_name, 'active')->load();
      module_invoke_all('config_update_validate', $staging_config, $active_config, $all_changes);
      break;
    case 'delete':
      $active_config = config($config_name, 'active')->load();
      module_invoke_all('config_delete_validate', $active_config, $all_changes);
      break;
  }
}

/**
 * Save an individual configuration.
 *
 * Calls all the necessary hooks to allow modules to modify any configuration
 * changes before they are saved.
 *
 * @param string $config_file
 *   The name of the config file being synced.
 * @param string $config_change_type
 *   The type of change occurring to this config file. Must be one of the
 *   following values: "create", "update", or "delete".
 * @param string $config_contents
 *   The configuration file's contents.
 *
 * @see hook_config_create().
 * @see hook_config_update().
 * @see hook_config_delete().
 */
function config_sync_file($config_file, $config_change_type, $config_contents = NULL) {
  $active_config = config($config_file, 'active');

  // Read the config data from staging if contents are not provided.
  if (is_null($config_contents)) {
    $staging_config = config($config_file, 'staging')->load();
  }
  // If contents are provided, create a staging config object. This object is
  // not actually written to disk, so it should not affect any existing staged
  // configuration files when performing a single import.
  else {
    $staging_config = config($config_file, 'staging')->setData($config_contents);
  }

  switch ($config_change_type) {
    case 'create':
      $active_config->setData($staging_config->get());
      module_invoke_all('config_create', $active_config);
      $active_config->save();
      break;
    case 'update':
      $active_config->load();
      module_invoke_all('config_update', $staging_config, $active_config);
      $active_config->setData($staging_config->get())->save();
      break;
    case 'delete':
      $active_config->load();
      module_invoke_all('config_delete', $active_config);
      $active_config->delete();
      break;
  }
}
