<?php

/**
 * @file
 * Provide views data and handlers for system.module.
 *
 * @ingroup views_module_handlers
 */

/**
 * Implements hook_views_data().
 */
function system_views_data() {
  $data = array();

  // ----------------------------------------------------------------------
  // system table
  $data['system']['table']['group']  = t('System');

  // Advertise this table as a possible base table
  $data['system']['table']['base'] = array(
    'field' => 'filename',
    'title' => t('Module/Theme/Theme engine'),
    'help' => t('Modules/Themes/Theme engines in your codebase.'),
  );

  // fields
  // - filename
  $data['system']['filename'] = array(
    'title' => t('Module/Theme/Theme engine filename'),
    'help' => t('The path of the primary file for this item, relative to the Backdrop root; e.g. modules/node/node.module.'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_string',
      'name field' => 'filename', // the field to display in the summary.
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_string',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
  );
  // - name
  $data['system']['name'] = array(
    'title' => t('Module/Theme/Theme engine name'),
    'help' => t('The name of the item; e.g. node.'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_string',
      'name field' => 'name', // the field to display in the summary.
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_string',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
  );
  // - type
  $data['system']['type'] = array(
    'title' => t('Type'),
    'help' => t('The type of the item, either module, theme, or theme_engine.'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_string',
      'name field' => 'type', // the field to display in the summary.
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_system_type',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
  );
  // - status
  $data['system']['status'] = array(
    'title' => t('Status'),
    'help' => t('Boolean indicating whether or not this item is enabled.'),
    'field' => array(
      'handler' => 'views_handler_field_boolean',
      'click sortable' => TRUE,
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_numeric',
      'name field' => 'status', // the field to display in the summary.
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_boolean_operator',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
  );
  // - schema version
  $data['system']['schema_version'] = array(
    'title' => t('Schema version'),
    'help' => t("The module's database schema version number. -1 if the module is not installed (its tables do not exist); 0 or the largest N of the module's hook_update_N() function that has either been run or existed when the module was first installed."),
    'field' => array(
      'handler' => 'views_handler_field_numeric',
      'click sortable' => TRUE,
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_numeric',
      'name field' => 'schema_version', // the field to display in the summary.
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_numeric',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
  );

  return $data;
}

function _views_file_status($choice = NULL) {
  $status = array(
    0 => t('Temporary'),
    FILE_STATUS_PERMANENT => t('Permanent'),
  );

  if (isset($choice)) {
    return isset($status[$choice]) ? $status[$choice] : t('Unknown');
  }

  return $status;
}
