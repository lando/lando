<?php
/**
 * @file
 * Administrative pages and callbacks for the Configuration management module.
 */

/**
 * Form callback; Build the form for syncing all staged configuration.
 */
function config_sync_form(array $form, array &$form_state) {
  $form_state['config_statuses'] = config_get_statuses();
  $changed_config_count = count(array_filter($form_state['config_statuses']));
  $modified_times = config_get_modified_times();
  $config_file_errors = array();

  // Add the AJAX library to the form for dialog support.
  $form['#attached']['library'][] = array('system', 'backdrop.ajax');
  $form['#attached']['css'][] = backdrop_get_path('module', 'config') . '/css/config.admin.css';

  $form['description'] = array(
    '#markup' => '<p>' . t('This form allows you to synchronize configuration between sites, such as in development, staging, and production servers. This page shows you the current differences between your current configuration and changes that have been staged for deployment.') . '</p>',
  );

  if ($changed_config_count === 0) {
    $form['no_changes'] = array(
      '#theme' => 'table',
      '#header' => array('Name', 'Operations'),
      '#rows' => array(),
      '#empty' => t('There are no configuration changes currently staged. You may <a href="!export">export this site\'s configuration</a> or <a href="!import">import to stage new changes</a>.', array('!export' => url('admin/config/development/configuration/full/export'), '!import' => url('admin/config/development/configuration/full/import'))),
    );
    $form['actions']['#access'] = FALSE;
    return $form;
  }

  foreach ($form_state['config_statuses'] as $config_file => $config_change_type) {
    if ($config_change_type === 'error') {
      $config_file_errors[] = $config_file;
    }
    elseif (!is_null($config_change_type)) {
      $links['view_diff'] = array(
        '#type' => 'link',
        '#title' => t('View differences'),
        '#href' => 'admin/config/development/configuration/sync/diff/' . $config_file,
        '#attributes' => array(
          'class' => array('use-ajax'),
          'data-dialog' => 'true',
          'data-dialog-options' => '{"dialogClass": "config-diff"}',
        ),
      );
      $row = array(
        'name' => $config_file,
      );
      if ($config_change_type !== 'delete') {
        $row['date'] = isset($modified_times[$config_file]) ? format_date($modified_times[$config_file], 'short') : '';
      }
      $row['operations'] = array(
        'data' => $links,
      );
      $form[$config_change_type]['list']['#rows'][] = $row;
    }
  }

  foreach (array('create', 'delete', 'update') as $config_change_type) {
    if (!isset($form[$config_change_type])) {
      continue;
    }

    switch ($config_change_type) {
      case 'create':
        $heading = format_plural(count($form[$config_change_type]['list']['#rows']), '@count new configuration', '@count new configuration');
        break;

      case 'update':
        $heading = format_plural(count($form[$config_change_type]['list']['#rows']), '@count configuration changed', '@count configurations changed');
        break;

      case 'delete':
        $heading = format_plural(count($form[$config_change_type]['list']['#rows']), '@count configuration removed', '@count configurations removed');
        break;
    }

    $form[$config_change_type]['heading'] = array(
      '#markup' => '<h3>' . $heading . '</h3>',
      '#weight' => -1,
    );
    $header = ($config_change_type === 'delete') ? array(t('Name'), t('Operations')) : array(t('Name'), t('Modified time'), t('Operations'));
    $form[$config_change_type]['list'] += array(
      '#theme' => 'table',
      '#header' => $header,
    );
  }

  if ($config_file_errors) {
    backdrop_set_message(t('The following configuration files could not be parsed, synchronization cannot proceed.') . theme('item_list', array('items' => $config_file_errors)), 'error');
  }

  $form['actions'] = array(
    '#type' => 'actions'
  );
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Import all'),
    '#access' => $changed_config_count > 0 && empty($config_file_errors),
  );

  return $form;
}

/**
 * Submit handler for config_sync_form().
 */
function config_sync_form_submit(array &$form, array &$form_state) {
  $last_sync_time = state_get('config_sync');
  if ($last_sync_time == NULL || $last_sync_time < REQUEST_TIME - 120) {
    module_load_include('inc', 'config', 'config.sync');
    $config_sync_batch = config_sync_batch($form_state['config_statuses']);
    batch_set($config_sync_batch);
  }
  else {
    backdrop_set_message(t('Another request may be synchronizing configuration already or a sync failed unexpectedly. Please wait a minute and try again.'), 'error');
  }

  return $form;
}

/**
 * Shows diff of specified configuration file.
 *
 * @param string $config_file
 *   The name of the configuration file.
 *
 * @return string
 *   Table showing a two-way diff between the active and staged configuration.
 */
function config_diff_page($config_file) {
  $diff = config_diff($config_file);

  $build = array();

  $build['#title'] = t('View changes of @config_file', array('@config_file' => $config_file));
  // Add the CSS for the inline diff.
  $build['#attached']['css'][] = backdrop_get_path('module', 'system') . '/css/system.diff.css';

  $build['diff'] = array(
    '#theme' => 'table',
    '#header' => array(
      array('data' => t('Old'), 'colspan' => '2', 'class' => array('config-old')),
      array('data' => t('New'), 'colspan' => '2', 'class' => array('config-new')),
    ),
    '#attributes' => array('class' => array('diff-table')),
    '#rows' => $diff,
    '#sticky' => FALSE,
  );

  $build['actions'] = array(
    '#type' => 'actions',
    '#attributes' => array('class' => array('form-actions')),
  );
  $build['actions']['back'] = array(
    '#type' => 'link',
    '#title' => t('Back to "Synchronize configuration" page.'),
    '#href' => 'admin/config/development/configuration',
    '#attributes' => array('class' => array('button', 'button-secondary', 'form-submit')),
  );

  if (backdrop_is_dialog()) {
    $build['actions']['back']['#attributes']['class'][] = 'dialog-cancel';
    $build['actions']['back']['#title'] = t('Close');
  }

  return $build;
}

/**
 * Form callback; Provide a form for exporting the current configuration.
 */
function config_export_full_form(array $form, array $form_state) {
  $form['description'] = array(
    '#markup' => '<p>' . t('This form may be used to generate a full export of your entire site\'s configuration. This configuration file should remain compressed when you upload it to the destination site.') . '</p>',
  );
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Export'),
  );
  return $form;
}

/**
 * Submit handler for config_export_full_form().
 */
function config_export_full_form_submit(array $form, array &$form_state) {
  $form_state['redirect'] = 'admin/config/development/configuration/full/export-download';
}

/**
 * Downloads a tarball of the site configuration.
 */
function config_download_full_export() {
  $file_path = file_create_filename('config.tar.gz', file_directory_temp());
  $config_storage = config_get_config_storage();
  $config_storage->exportArchive($file_path);
  $filename = str_replace(file_directory_temp() . '/', '', $file_path);
  $headers = array(
    'Content-Disposition' => 'attachment; filename=config.tar.gz',
    'Content-type' => 'application/x-gzip',
  );
  file_transfer('temporary://' . $filename, $headers);
  file_unmanaged_delete($file_path);
}

/**
 * Form callback; Provide a form for importing a full set of configuration.
 */
function config_import_full_form(array $form, array &$form_state) {
  $form['description'] = array(
    '#markup' => '<p>' . t('This form imports a site configuration archive from another site. Upload an export file below to stage the changes (you\'ll have a chance to review and confirm the changes first). To generate an export file, visit the <a href="!export">full export</a> page.', array('!export' => url('admin/config/development/configuration/full/export'))) . '</p>',
  );
  $form['import_tarball'] = array(
    '#type' => 'managed_file',
    '#title' => t('Select your configuration export archive'),
    '#description' => t('This file should be a compressed archive with the extension "tar.gz".'),
    '#upload_validators' => array(
      'file_validate_extensions' => array('tar gz'),
    ),
    '#progress_indicator' => 'bar',
    '#upload_location' => 'temporary://',
  );

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Stage import'),
  );
  return $form;
}

/**
 * Submit handler for config_import_full_form().
 */
function config_import_full_form_submit(array &$form, array &$form_state) {
  if ($fid = $form_state['values']['import_tarball']) {
    // Empty out the existing staging directory.
    $config_storage = config_get_config_storage('staging');
    $config_storage->deleteAll();

    // Convert the file URI to a file path that is readable by ArchiverTar.
    $file = file_load($fid);
    try {
      $config_storage->importArchive($file->uri);
    }
    catch (\ConfigStorageException $e) {
      form_set_error('import_tarball', t('Could not extract the contents of the tar file. The error message is "@message".', array('@message' => $e->getMessage())));
    }
    file_delete($file->fid);

    // Compare the files to see if any config actually differs.
    $config_statuses = array_filter(config_get_statuses());
    if (empty($config_statuses)) {
      $config_storage->deleteAll();
      backdrop_set_message(t('The uploaded configuration matches the current site configuration exactly. No changes were made.'), 'warning');
    }
    else {
      backdrop_set_message(t('Your configuration files were successfully uploaded. You may view the differences below. Import into your site by using the "Import all" button.'));
      $form_state['redirect'] = 'admin/config/development/configuration';
    }
  }
}

/**
 * Form callback; Builds the form for exporting a single configuration file.
 */
function config_export_single_form(array $form, array &$form_state, $config_group = NULL, $config_name = NULL) {
  $form_state['config_groups'] = config_get_prefix_groups();
  $form['#attached']['css'][] = backdrop_get_path('module', 'config') . '/css/config.admin.css';

  $form['description'] = array(
    '#markup' => '<p>' . t('This form may be used to export a single configuration so that it may be imported on a different site. Select a configuration group and name to generate configuration for copy/paste.') . '</p>',
  );

  $group_options = backdrop_map_assoc(array_keys($form_state['config_groups']));
  natsort($group_options);
  $form['config_group'] = array(
    '#title' => t('Configuration group'),
    '#type' => 'select',
    '#options' => $group_options,
    '#default_value' => $config_group,
    '#required' => TRUE,
    '#ajax' => array(
      // The content wrapper to replace is specified in this AJAX callback.
      'callback' => 'config_export_single_form_update_type',
    ),
  );

  $default_type = isset($form_state['values']['config_group']) ? $form_state['values']['config_group'] : $config_group;
  $config_names = array();
  if ($default_type) {
    $config_names = $form_state['config_groups'][$default_type];
    natsort($config_names);
  }
  $form['config_name'] = array(
    '#title' => t('Configuration name'),
    '#type' => 'select',
    '#options' => $config_names,
    '#default_value' => $config_name,
    '#required' => TRUE,
    '#prefix' => '<div id="edit-config-type-wrapper">',
    '#suffix' => '</div>',
    '#ajax' => array(
      'callback' => 'config_export_single_form_update_export',
      'wrapper' => 'edit-export-wrapper',
    ),
  );

  $form['export'] = array(
    '#title' => t('Exported configuration'),
    '#type' => 'textarea',
    '#rows' => 12,
    '#prefix' => '<div id="edit-export-wrapper">',
    '#suffix' => '</div>',
  );

  if ($config_group || $config_name) {
    if (empty($form_state['values'])) {
      $form_state['values'] = array();
    }
    $form_state['values'] += array(
      'config_group' => $config_group,
      'config_name' => $config_name,
    );
    $form['export'] = config_export_single_form_update_export($form, $form_state);
  }

  return $form;
}

/**
 * Handles switching the configuration type selector.
 */
function config_export_single_form_update_type($form, &$form_state) {
  // Empty out the configuration value field.
  $form['export']['#value'] = '';
  $form['export']['#rows'] = 12;

  // Because we need to replace both the configation name select and the
  // textarea, this requires using AJAX commands instead of a simple return.
  $commands = array();
  $commands[] = ajax_command_replace('#edit-config-type-wrapper', backdrop_render($form['config_name']));
  $commands[] = ajax_command_replace('#edit-export-wrapper', backdrop_render($form['export']));
  $commands[] = ajax_command_prepend(NULL, theme('status_messages'));
  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * AJAX submit handler for config_export_single_form().
 *
 * Handles switching the export textarea.
 */
function config_export_single_form_update_export($form, &$form_state) {
  if ($form_state['values']['config_name']) {
    $config_name = $form_state['values']['config_name'];
    $storage = config_get_config_storage('active');
    $config = new Config($config_name, $storage);

    // Re-add the config name property so it shows up in the export.
    $data = array_merge(array('_config_name' => $config_name), $config->get());
    $value = $storage->encode($data);
    $row_count = substr_count($value, "\n");
    $form['export']['#value'] = $value;
    $form['export']['#rows'] = $row_count > 12 ? $row_count : 12;
  }
  else {
    $form['export']['#value'] = '';
    $form['export']['#rows'] = 12;
  }
  return $form['export'];
}

/**
 * Form callback; Build the form to import a single configuration file.
 */
function config_import_single_form(array $form, array &$form_state) {
  form_load_include($form_state, 'inc', 'config', 'config.sync');
  $form['#attached']['css'][] = backdrop_get_path('module', 'config') . '/css/config.admin.css';

  $form['description'] = array(
    '#markup' => '<p>' . t('This form imports a single configuration file from another site. To generate an export, visit the <a href="!export">single export</a> page.', array('!export' => url('admin/config/development/configuration/single/export'))) . '</p>',
  );
  $form['import'] = array(
    '#title' => t('Paste your configuration here'),
    '#type' => 'textarea',
    '#rows' => 12,
    '#required' => TRUE,
  );
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Import'),
  );
  return $form;
}

/**
 * Validate handler for config_import_single_form().
 */
function config_import_single_form_validate(array &$form, array &$form_state) {
  // Decode the submitted import.
  $active_storage = config_get_config_storage('active');
  try {
    $data = $active_storage->decode($form_state['values']['import']);
  }
  catch (ConfigStorageException $e) {
    $data = FALSE;
  }

  // Determine the matching config prefix.
  $config_info = FALSE;
  if ($data === FALSE) {
    form_error($form['import'], t('The configuration provided could not be parsed.'));
  }
  elseif (empty($data['_config_name'])) {
    form_error($form['import'], t('The configuration could not be imported because the "_config_name" value is missing.'));
  }
  else {
    $config_name = $data['_config_name'];
    $config_info = config_get_info($config_name);
    if ($config_info === FALSE) {
      form_error($form['import'], t('The configuration could not be imported because no module could recognize the "@name" configuration name.', array('@name' => $config_name)));
    }
  }

  // Determine the type of change this is and then validate it. Deletes are
  // not currently supported through the single sync form.
  $config_change_type = NULL;
  if ($data && $config_info) {
    $active_config_exists = $active_storage->read($config_name) !== FALSE;
    if ($active_config_exists) {
      $config_change_type = 'update';
    }
    else {
      $config_change_type = 'create';
    }
    try {
      config_sync_validate_file($config_name, $config_change_type, NULL, $data);
    }
    catch (ConfigValidateException $e) {
      form_error($form['import'], $e->getMessage());
    }
  }

  // Store the decoded version of the submitted import.
  $form_state['config_data'] = $data;
  $form_state['config_change_type'] = $config_change_type;
}

/**
 * Submit handler for config_import_single_form().
 */
function config_import_single_form_submit(array &$form, array &$form_state) {
  $data = $form_state['config_data'];
  config_sync_file($data['_config_name'], $form_state['config_change_type'], $data);
  backdrop_flush_all_caches();
  backdrop_set_message(t('The %name configuration was imported successfully.', array('%name' => $data['_config_name'])));
}

/**
 * Utility function to get the current diffs between active and staging.
 */
function config_get_statuses() {
  $active_storage = config_get_config_storage('active');
  $staging_storage = config_get_config_storage('staging');

  // Create full list of all files from both active and staging.
  $active_files = $active_storage->listAll();
  $staging_files = $staging_storage->listAll();
  $all_files = array_unique(array_merge($active_files, $staging_files));
  $all_files = array_combine($all_files, array_fill(0, count($all_files), NULL));
  $config_statuses = $all_files;

  if ($staging_files) {
    if ($delete_diffs = array_diff($active_files, $staging_files)) {
      foreach ($delete_diffs as $filename) {
        $config_statuses[$filename] = 'delete';
      }
    }
    if ($create_diffs = array_diff($staging_files, $active_files)) {
      foreach ($create_diffs as $filename) {
        $config_statuses[$filename] = 'create';
      }
    }
    if ($remaining_diffs = array_diff($active_files, $delete_diffs)) {
      foreach ($remaining_diffs as $filename) {
        try {
          $active_config = $active_storage->read($filename);
          $staging_config = $staging_storage->read($filename);
          if ($active_config != $staging_config) {
            $config_statuses[$filename] = 'update';
          }
        }
        catch (ConfigStorageReadException $e) {
          $config_statuses[$filename] = 'error';
        }
      }
    }
  }
  ksort($config_statuses);

  return $config_statuses;
}

/**
 * Utility function to get the current diffs between active and staging.
 */
function config_get_modified_times() {
  $staging_storage = config_get_config_storage('staging');
  $staging_files = $staging_storage->listAll();
  $modified_times = array();
  foreach ($staging_files as $file) {
    $modified_times[$file] = $staging_storage->getModifiedTime($file);
  }
  return $modified_times;
}

/**
 * Return a formatted diff of a named config between staging and active.
 *
 * @param string $name
 *   The name of the configuration object to diff.
 *
 * @return array
 *   An array of formatted strings showing the diffs between the two storages.
 */
function config_diff($name) {
  $active_storage = config_get_config_storage('active');
  $staging_storage = config_get_config_storage('staging');

  $source_data = explode("\n", backdrop_json_encode($active_storage->read($name), TRUE));
  $target_data = explode("\n", backdrop_json_encode($staging_storage->read($name), TRUE));

  // Check for new or removed files.
  if ($source_data === array('false')) {
    // Added file.
    $source_data = array(t('File added'));
  }
  if ($target_data === array('false')) {
    // Deleted file.
    $target_data = array(t('File removed'));
  }

  $diff = new Diff($source_data, $target_data);
  $formatter = new BackdropDiffFormatter();
  return $formatter->format($diff);
}
