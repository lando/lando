<?php

/**
 * @file
 * Field CRUD API, handling field and field instance creation and deletion.
 */

/**
 * @defgroup field_crud Field CRUD API
 * @{
 * Create, update, and delete Field API fields, bundles, and instances.
 *
 * Modules use this API, often in hook_install(), to create custom
 * data structures. UI modules will use it to create a user interface.
 *
 * The Field CRUD API uses
 * @link field Field API data structures @endlink.
 *
 * See @link field Field API @endlink for information about the other parts of
 * the Field API.
 */

/**
 * Creates a field.
 *
 * This function does not bind the field to any bundle; use
 * field_create_instance() for that.
 *
 * @param $field
 *   A field definition array. The field_name and type properties are required.
 *   Other properties, if omitted, will be given the following default values:
 *   - cardinality: 1
 *   - locked: FALSE
 *   - indexes: the field-type indexes, specified by the field type's
 *     hook_field_schema(). The indexes specified in $field are added
 *     to those default indexes. It is possible to override the
 *     definition of a field-type index by providing an index with the
 *     same name, or to remove it by redefining it as an empty array
 *     of columns. Overriding field-type indexes should be done
 *     carefully, for it might seriously affect the site's performance.
 *   - settings: each omitted setting is given the default value defined in
 *     hook_field_info().
 *   - storage:
 *     - type: the storage backend specified in the 'field_storage_default'
 *       system variable.
 *     - settings: each omitted setting is given the default value specified in
 *       hook_field_storage_info().
 *
 * @return
 *   The $field array with the id property filled in.
 *
 * @throws FieldException
 *
 * See: @link field Field API data structures @endlink.
 */
function field_create_field($field) {
  // Populate defaults.
  $field += field_defaults_field();
  $field['settings'] += field_info_field_settings($field['type']);

  // Validate the fully populated field.
  field_validate_field($field);

  // Check that the field type is known.
  $field_type = field_info_field_types($field['type']);
  if (!$field_type) {
    throw new FieldException(t('Attempt to create a field of unknown type %type.', array('%type' => $field['type'])));
  }

  $field['module'] = $field_type['module'];
  $field['active'] = 1;

  // Provide default storage.
  $field['storage'] += array(
    'type' => 'field_sql_storage',
    'settings' => array(),
  );
  // Check that the storage type is known.
  $storage_type = field_info_storage_types($field['storage']['type']);
  if (!$storage_type) {
    throw new FieldException(t('Attempt to create a field with unknown storage type %type.', array('%type' => $field['storage']['type'])));
  }
  // Provide default storage settings.
  $field['storage']['settings'] += field_info_storage_settings($field['storage']['type']);
  $field['storage']['module'] = $storage_type['module'];
  $field['storage']['active'] = 1;

  // Fields have a large amount of data that is generated on load, so trim down
  // the entire structure to just that which is not replaced on load.
  $field_data = array_intersect_key($field, field_defaults_field());
  if (isset($field_data['storage']['details'])) {
    unset($field_data['storage']['details']);
  }

  // Store the field in config.
  $config = config('field.field.' . $field['field_name']);
  $config->setData($field_data);
  $config->save();

  // Collect storage information.
  module_load_install($field['module']);
  $schema = (array) module_invoke($field['module'], 'field_schema', $field);
  $schema += array(
    'columns' => array(),
    'indexes' => array(),
    'foreign keys' => array(),
  );
  $field['columns'] = $schema['columns'];
  $field['foreign keys'] = $schema['foreign keys'];
  $field['indexes'] = $schema['indexes'];

  try {
    // Invoke hook_field_storage_create_field after
    // backdrop_write_record() sets the field id.
    module_invoke($storage_type['module'], 'field_storage_create_field', $field);
  }
  catch (Exception $e) {
    // Delete the config if the field storage could not be created.
    $config->delete();
    throw $e;
  }

  // Clear caches
  field_cache_clear();

  // Invoke external hooks after the cache is cleared for API consistency.
  module_invoke_all('field_create_field', $field);

  return $field;
}

/**
 * Updates a field.
 *
 * Any module may forbid any update for any reason. For example, the
 * field's storage module might forbid an update if it would change
 * the storage schema while data for the field exists. A field type
 * module might forbid an update if it would change existing data's
 * semantics, or if there are external dependencies on field settings
 * that cannot be updated.
 *
 * @param $field
 *   A field structure. $field['field_name'] must provided; it
 *   identifies the field that will be updated to match this
 *   structure. Any other properties of the field that are not
 *   specified in $field will be left unchanged, so it is not
 *   necessary to pass in a fully populated $field structure.
 * @return
 *   Throws a FieldException if the update cannot be performed.
 * @see field_create_field()
 */
function field_update_field($field) {
  // Check that the specified field exists.
  $prior_field = field_read_field($field['field_name'], array('include_inactive' => TRUE, 'include_deleted' => TRUE));
  if (empty($prior_field)) {
    throw new FieldException('Attempt to update a non-existent field.');
  }

  // Use the prior field values for anything not specifically set by the new
  // field to be sure that all values are set.
  $field += $prior_field;
  $field += field_defaults_field();
  $field['settings'] += $prior_field['settings'];
  $field['settings'] += field_info_field_settings($field['type']);

  // Validate the fully populated field.
  field_validate_field($field, TRUE);

  // Some updates are always disallowed.
  if ($field['type'] != $prior_field['type']) {
    throw new FieldException("Cannot change an existing field's type.");
  }
  if ($field['entity_types'] != $prior_field['entity_types']) {
    throw new FieldException("Cannot change an existing field's entity_types property.");
  }
  if ($field['storage']['type'] != $prior_field['storage']['type']) {
    throw new FieldException("Cannot change an existing field's storage type.");
  }

  // Fields have a large amount of data that is generated on load, so trim down
  // the entire structure to just that which is not replaced on load.
  $field_data = array_intersect_key($field, field_defaults_field());
  if (isset($field_data['storage']['details'])) {
    unset($field_data['storage']['details']);
  }

  // Store the field in config.
  $config = config('field.field.' . $field['field_name']);
  $config->setData($field_data);
  $config->save();

  // Collect the new storage information, since what is in
  // $prior_field may no longer be right.
  module_load_install($field['module']);
  $schema = (array) module_invoke($field['module'], 'field_schema', $field);
  $schema += array(
    'columns' => array(),
    'indexes' => array(),
    'foreign keys' => array(),
  );
  $field['columns'] = $schema['columns'];
  $field['foreign keys'] = $schema['foreign keys'];
  $field['indexes'] = $schema['indexes'];

  $has_data = field_has_data($field);

  // See if any module forbids the update by throwing an exception.
  foreach (module_implements('field_update_forbid') as $module) {
    $function = $module . '_field_update_forbid';
    $function($field, $prior_field, $has_data);
  }

  // Tell the storage engine to update the field. Do this before
  // saving the new definition since it still might fail.
  $storage_type = field_info_storage_types($field['storage']['type']);
  module_invoke($storage_type['module'], 'field_storage_update_field', $field, $prior_field, $has_data);

  // Clear caches
  field_cache_clear(TRUE);

  // Invoke external hooks after the cache is cleared for API consistency.
  module_invoke_all('field_update_field', $field, $prior_field, $has_data);
}

/**
 * Validates a field configuration.
 */
function field_validate_field($field, $update = FALSE) {
  // Field name is required.
  if (empty($field['field_name'])) {
    throw new FieldException(format_string('Attempt to create field @field_name with no type.', array('@field_name' => $field['field_name'])));
  }
  // Field type is required.
  if (empty($field['type'])) {
    throw new FieldException(format_string('The field "@name" did not specify a field type.', array('@name' => $field['field_name'])));
  }
  // Field name cannot contain invalid characters.
  if (!preg_match('/^[_a-z]+[_a-z0-9]*$/', $field['field_name'])) {
    throw new FieldException(format_string('Attempt to create a field @field_name with invalid characters. Only lowercase alphanumeric characters and underscores are allowed, and only lowercase letters and underscore are allowed as the first character', array('@field_name' => $field['field_name'])));
  }

  // Validations that only apply to newly created fields.
  if (!$update) {
    // Field module must exist when creating a field (but not updating it).
    $field_info = field_info_field_types($field['type']);
    if (!module_exists($field_info['module'])) {
      throw new FieldException(t('The field "@name" could not be created because it requires the "@module" module.', array('@name' => $field['field_name'], '@module' => $field_info['module'])));
    }

    // Ensure the table namespaces are available.
    if (db_table_exists('field_data_' . $field['field_name'])) {
      throw new FieldException(t('The field "@name" could not be created because a database table with the name "@table" already exists.', array('@name' => $field['field_name'], '@table' => 'field_data_' . $field['field_name'])));
    }
    if (db_table_exists('field_revision_' . $field['field_name'])) {
      throw new FieldException(t('The field "@name" could not be created because a database table with the name "@table" already exists.', array('@name' => $field['field_name'], '@table' => 'field_revision_' . $field['field_name'])));
    }

    // Ensure the field name is unique.
    $prior_field = field_read_field($field['field_name'], array('include_inactive' => TRUE, 'include_deleted' => TRUE));
    if (!empty($prior_field)) {
      $message = $prior_field['active']?
        t('The field "@name" already exists.', array('@name' => $field['field_name'])):
        t('The field "@name" already exists, but it is inactive. To create a field with the same name, the configuration and data from the old field must be manually deleted.', array('@name' => $field['field_name']));
      throw new FieldException($message);
    }

    // Field name cannot be longer than 32 characters. We use backdrop_strlen()
    // because the DB layer assumes that column widths are given in characters,
    // not bytes.
    if (backdrop_strlen($field['field_name']) > 32) {
      throw new FieldException(t('The field "@name" could not be created because the field name may be no longer than 32 characters.', array('@name' => $field['field_name'])));
    }

    // Disallow reserved field names. This can't prevent all field name
    // collisions with existing entity properties, but some is better
    // than none.
    foreach (entity_get_info() as $type => $info) {
      if (in_array($field['field_name'], $info['entity keys'])) {
        throw new FieldException(t('Cannot create a field with the name "@name", which is reserved by entity type @type.', array('@name' => $field['field_name'], '@type' => $type)));
      }
    }
  }
}

/**
 * Reads a single field record directly from the database.
 *
 * Generally, you should use the field_info_field() instead.
 *
 * This function will not return deleted fields. Use
 * field_read_fields() instead for this purpose.
 *
 * @param $field_name
 *   The field name to read.
 * @param array $include_additional
 *   The default behavior of this function is to not return a field that
 *   is inactive. Setting
 *   $include_additional['include_inactive'] to TRUE will override this
 *   behavior.
 * @return
 *   A field definition array, or FALSE.
 */
function field_read_field($field_name, $include_additional = array()) {
  $fields = field_read_fields(array('field_name' => $field_name), $include_additional);
  return isset($fields[$field_name]) ? $fields[$field_name] : FALSE;
}

/**
 * Reads in fields that match an array of conditions.
 *
 * @param array $params
 *   An array of conditions to match against.
 * @param array $include_additional
 *   The default behavior of this function is to not return fields that
 *   are inactive or have been deleted. Setting
 *   $include_additional['include_inactive'] or
 *   $include_additional['include_deleted'] to TRUE will override this
 *   behavior.
 * @return
 *   An array of fields matching $params. If
 *   $include_additional['include_deleted'] is TRUE, the array is keyed
 *   by field id, otherwise it is keyed by field name.
 */
function field_read_fields($params = array(), $include_additional = array()) {
  $include_inactive = isset($include_additional['include_inactive']) && $include_additional['include_inactive'];
  $include_deleted = isset($include_additional['include_deleted']) && $include_additional['include_deleted'];

  $prefix = 'field.field.';
  if (isset($params['field_name'])) {
    $config_names = array($prefix . $params['field_name']);
  }
  else {
    $config_names = config_get_names_with_prefix($prefix);
  }

  $fields = array();
  foreach ($config_names as $config_name) {
    $config = config($config_name);
    $field = $config->get();

    // Continue if matching against a specific field that doesn't exist.
    if (isset($params['field_name']) && empty($field)) {
      continue;
    }
    else {
      unset($params['field_name']);
    }

    // Continue if the config does not match passed parameters.
    if ($params) {
      foreach ($params as $param_key => $param_value) {
        if ($field[$param_key] != $param_value) {
          continue 2;
        }
      }
    }

    // Continue if this is an inactive field.
    if ((!$field['active'] || !$field['storage']['active']) && !$include_inactive) {
      continue;
    }
    // Or a deleted field.
    if ($field['deleted'] && !$include_deleted) {
      continue;
    }

    module_invoke_all('field_read_field', $field);

    // Populate storage information.
    module_load_install($field['module']);
    $schema = (array) module_invoke($field['module'], 'field_schema', $field);
    $schema += array(
      'columns' => array(),
      'indexes' => array(),
      'foreign keys' => array(),
    );
    $field['columns'] = $schema['columns'];
    $field['indexes'] = $schema['indexes'];
    $field['foreign keys'] = $schema['foreign keys'];

    // Populate defaults.
    $field += field_defaults_field($field['type']);
    $field['settings'] += field_info_field_settings($field['type']);

    $field_name = $field['field_name'];
    $fields[$field_name] = $field;
  }

  return $fields;
}

/**
 * Provides a list of default settings for a field.
 */
function field_defaults_field() {
  return array(
    'field_name' => '',
    'type' => '',
    'module' => '',
    'active' => 1,
    'locked' => 0,
    'cardinality' => 1,
    'translatable' => 0,
    'deleted' => 0,
    'entity_types' => array(),
    'settings' => array(),
    'storage' => array(),
  );
}

/**
 * Marks a field and its instances and data for deletion.
 *
 * @param $field_name
 *   The field name to delete.
 */
function field_delete_field($field_name) {
  // Delete all non-deleted instances.
  $field = field_info_field($field_name);

  // Sanity check to prevent writing a new empty config file.
  field_validate_field($field, TRUE);

  if (isset($field['bundles'])) {
    $instances = field_info_instances();
    foreach ($field['bundles'] as $entity_type => $bundles) {
      foreach ($bundles as $bundle) {
        $instance = $instances[$entity_type][$bundle][$field_name];
        field_delete_instance($instance, FALSE);
      }
    }
  }

  // Mark field data for deletion.
  module_invoke($field['storage']['module'], 'field_storage_delete_field', $field);

  // Mark the field for deletion.
  $config = config('field.field.' . $field_name);
  $config->set('deleted', 1);
  $config->save();

  // Clear the cache.
  field_cache_clear();

  module_invoke_all('field_delete_field', $field);

  // Do a purge to delete any empty tables immediately.
  field_purge_batch(0);
}

/**
 * Creates an instance of a field, binding it to a bundle.
 *
 * @param $instance
 *   A field instance definition array. The field_name, entity_type and
 *   bundle properties are required. Other properties, if omitted,
 *   will be given the following default values:
 *   - label: the field name
 *   - description: empty string
 *   - required: FALSE
 *   - default_value: NULL
 *   - default_value_function: NULL
 *   - settings: each omitted setting is given the default value specified in
 *     hook_field_info().
 *   - widget:
 *     - type: the default widget specified in hook_field_info().
 *     - settings: each omitted setting is given the default value specified in
 *       hook_field_widget_info().
 *   - display:
 *     Settings for the 'default' view mode will be added if not present, and
 *     each view mode in the definition will be completed with the following
 *     default values:
 *     - label: 'above'
 *     - type: the default formatter specified in hook_field_info().
 *     - settings: each omitted setting is given the default value specified in
 *       hook_field_formatter_info().
 *     View modes not present in the definition are left empty, and the field
 *     will not be displayed in this mode.
 *
 * @return
 *   The $instance array with the id property filled in.
 *
 * @throws FieldException
 *
 * See: @link field Field API data structures @endlink.
 */
function field_create_instance($instance) {
  // Populate defaults.
  $instance += field_defaults_instance();

  // Ensure the field instance is unique within the bundle.
  // We only check for instances of active fields, since adding an instance of
  // a disabled field is not supported.
  $prior_instance = field_read_instance($instance['entity_type'], $instance['field_name'], $instance['bundle']);
  if (!empty($prior_instance)) {
    $message = t('Attempt to create an instance of field @field_name on bundle @bundle that already has an instance of that field.', array('@field_name' => $instance['field_name'], '@bundle' => $instance['bundle']));
    throw new FieldException($message);
  }

  // Give the instance a default label.
  if (strlen($instance['label']) === 0) {
    $instance['label'] = $instance['field_name'];
  }

  // Populate the instance default settings.
  $field = field_read_field($instance['field_name']);
  $instance['settings'] += field_info_instance_settings($field['type']);

  // Validate the fully populated instance.
  field_validate_instance($instance, FALSE, TRUE);

  _field_write_instance($instance);

  // Clear caches
  field_cache_clear();

  // Invoke external hooks after the cache is cleared for API consistency.
  module_invoke_all('field_create_instance', $instance);
  token_cache_clear();

  return $instance;
}

/**
 * Updates an instance of a field.
 *
 * @param $instance
 *   An associative array representing an instance structure. The following
 *   required array elements specify which field instance is being updated:
 *   - entity_type: The type of the entity the field is attached to.
 *   - bundle: The bundle this field belongs to.
 *   - field_name: The name of an existing field.
 *   The other array elements represent properties of the instance, and all
 *   properties must be specified or their default values will be used (except
 *   internal-use properties, which are assigned automatically). To avoid
 *   losing the previously stored properties of the instance when making a
 *   change, first load the instance with field_info_instance(), then override
 *   the values you want to override, and finally save using this function.
 *   Example:
 *   @code
 *   // Fetch an instance info array.
 *   $instance_info = field_info_instance($entity_type, $field_name, $bundle_name);
 *   // Change a single property in the instance definition.
 *   $instance_info['definition']['required'] = TRUE;
 *   // Write the changed definition back.
 *   field_update_instance($instance_info['definition']);
 *   @endcode
 *
 * @throws FieldException
 *
 * @see field_info_instance()
 * @see field_create_instance()
 */
function field_update_instance($instance) {
  // Check that the field instance exists (even if it is inactive, since we
  // want to be able to replace inactive widgets with new ones).
  $prior_instance = field_read_instance($instance['entity_type'], $instance['field_name'], $instance['bundle'], array('include_inactive' => TRUE));
  if (empty($prior_instance)) {
    throw new FieldException(t('The field instance "@label" of field "@field" cannot be saved because an instance of this field on the bundle "@bundle" does not exist.', array('@label' => $instance['label'], '@field' => $instance['field_name'], '@bundle' => $instance['bundle'])));
  }

  // Populate defaults.
  $field = field_read_field($instance['field_name']);
  $instance += $prior_instance;
  $instance += field_defaults_instance();
  $instance['settings'] += $prior_instance['settings'];
  $instance['settings'] += field_info_instance_settings($field['type']);

  // Validate the fully populated field.
  field_validate_instance($instance, TRUE);

  _field_write_instance($instance, TRUE);

  // Clear caches.
  field_cache_clear();

  module_invoke_all('field_update_instance', $instance, $prior_instance);
  token_cache_clear();
}

/**
 * Validates a field instance.
 */
function field_validate_instance($instance, $update = FALSE, $load_field = TRUE) {
  $label = isset($instance['label']) ? $instance['label'] : $instance['field_name'];

  // Check that the required properties exists.
  if (empty($instance['entity_type'])) {
    throw new FieldException(t('The field instance "@label" does not specify an entity type.', array('@label' => $label)));
  }
  if (empty($instance['bundle'])) {
    throw new FieldException(t('The field instance "@label" does not specify a bundle type.', array('@label' => $label)));
  }

  if ($load_field) {
    $field = field_read_field($instance['field_name']);
    if (empty($field)) {
      throw new FieldException(t('The field instance "@label" cannot be saved because the field "@name" does not exist.', array('@label' => $label, '@name' => $instance['field_name'])));
    }
    // Check that the field can be attached to this entity type.
    if (!empty($field['entity_types']) && !in_array($instance['entity_type'], $field['entity_types'])) {
      throw new FieldException(t('The field instance "@label" on the type "@entity_type" is not allowed.', array('@label' => $label, '@entity_type' => $instance['entity_type'])));
    }

    // @todo: Check that the widget type is known and can handle the field type.
    // @todo: Check that the formatters are known and can handle the field type.
    // @todo: Check that the display view modes are known for the entity type.
  }
}

/**
 * Stores an instance record in the field configuration database.
 *
 * @param $instance
 *   An instance structure.
 * @param $update
 *   Whether this is a new or existing instance.
 */
function _field_write_instance($instance, $update = FALSE) {
  $field = field_read_field($instance['field_name']);
  $field_type = field_info_field_types($field['type']);

  // Set default widget and settings.
  $instance['widget'] += array(
    // TODO: what if no 'default_widget' specified ?
    'type' => $field_type['default_widget'],
    'settings' => array(),
  );
  // If no weight specified, make sure the field sinks at the bottom.
  if (!isset($instance['widget']['weight'])) {
    $max_weight = field_info_max_weight($instance['entity_type'], $instance['bundle'], 'form');
    $instance['widget']['weight'] = isset($max_weight) ? $max_weight + 1 : 0;
  }
  // Check widget module.
  $widget_type = field_info_widget_types($instance['widget']['type']);
  $instance['widget']['module'] = $widget_type['module'];
  $instance['widget']['settings'] += field_info_widget_settings($instance['widget']['type']);

  // Make sure there are at least display settings for the 'default' view mode,
  // and fill in defaults for each view mode specified in the definition.
  $instance['display'] += array(
    'default' => array(),
  );
  foreach ($instance['display'] as $view_mode => $display) {
    $display += array(
      'label' => 'above',
      'type' => isset($field_type['default_formatter']) ? $field_type['default_formatter'] : 'hidden',
      'settings' => array(),
    );
    if ($display['type'] != 'hidden') {
      $formatter_type = field_info_formatter_types($display['type']);
      $display['module'] = $formatter_type['module'];
      $display['settings'] += field_info_formatter_settings($display['type']);
    }
    // If no weight specified, make sure the field sinks at the bottom.
    if (!isset($display['weight'])) {
      $max_weight = field_info_max_weight($instance['entity_type'], $instance['bundle'], $view_mode);
      $display['weight'] = isset($max_weight) ? $max_weight + 1 : 0;
    }
    $instance['display'][$view_mode] = $display;
  }

  // Include only defined data in the configuration file.
  $instance_data = array_intersect_key($instance, field_defaults_instance());

  $config = config('field.instance.' . $instance['entity_type'] . '.' . $instance['bundle'] . '.' . $instance['field_name']);
  $config->setData($instance_data);
  $config->save();
}

/**
 * Reads a single instance record from the database.
 *
 * Generally, you should use field_info_instance() instead, as it
 * provides caching and allows other modules the opportunity to
 * append additional formatters, widgets, and other information.
 *
 * @param $entity_type
 *   The type of entity to which the field is bound.
 * @param $field_name
 *   The field name to read.
 * @param $bundle
 *   The bundle to which the field is bound.
 * @param array $include_additional
 *   The default behavior of this function is to not return an instance that
 *   has been deleted, or whose field is inactive. Setting
 *   $include_additional['include_inactive'] or
 *   $include_additional['include_deleted'] to TRUE will override this
 *   behavior.
 * @return
 *   An instance structure, or FALSE.
 */
function field_read_instance($entity_type, $field_name, $bundle, $include_additional = array()) {
  $instances = field_read_instances(array('entity_type' => $entity_type, 'field_name' => $field_name, 'bundle' => $bundle), $include_additional);
  return $instances ? current($instances) : FALSE;
}

/**
 * Reads in field instances that match an array of conditions.
 *
 * @param $param
 *   An array of properties to use in selecting a field instance. Supported
 *   properties include:
 *   - entity_type: The entity type to which to limit instances.
 *   - bundle: The bundle type within the entity to which instances should be
 *     limited. If specified, an entity_type must be specified as well.
 * @param $include_additional
 *   The default behavior of this function is to not return field
 *   instances that have been marked deleted, or whose field is inactive.
 *   Setting $include_additional['include_inactive'] or
 *   $include_additional['include_deleted'] to TRUE will override this
 *   behavior.
 * @return
 *   An array of instances matching the arguments.
 */
function field_read_instances($params = array(), $include_additional = array()) {
  $include_inactive = isset($include_additional['include_inactive']) && $include_additional['include_inactive'];
  $include_deleted = isset($include_additional['include_deleted']) && $include_additional['include_deleted'];

  $prefix = 'field.instance.';
  $get_full_name = FALSE;
  if (isset($params['entity_type'])) {
    $prefix .= $params['entity_type'] . '.';
    unset($params['entity_type']);
    if (isset($params['bundle'])) {
      $prefix .= $params['bundle'] . '.';
      unset($params['bundle']);
      if (isset($params['field_name'])) {
        $prefix .= $params['field_name'];
        unset($params['field_name']);
        $get_full_name = TRUE;
      }
    }
  }

  if ($get_full_name) {
    $config_names = array($prefix);
  }
  else {
    $config_names = config_get_names_with_prefix($prefix);
  }

  // Fields used for reference.
  $fields = _field_read_fields_cache();

  $instances = array();
  foreach ($config_names as $config_name) {
    $config = config($config_name);
    $instance = $config->get();

    // Continue if matching against a specific field that doesn't exist.
    if ($get_full_name && empty($instance)) {
      continue;
    }

    if ($params) {
      foreach ($params as $param_key => $param_value) {
        if ($instance[$param_key] != $param_value) {
          continue 2;
        }
      }
    }

    // Continue if this is a deleted instance.
    if (!$include_deleted && $instance['deleted']) {
      continue;
    }

    // Load the field providing this instance.
    if (!isset($fields[$instance['field_name']])) {
      continue;
    }
    $field = $fields[$instance['field_name']];

    // Continue if the instance's field has been deleted or is inactive.
    if (!$include_deleted && $field['deleted']) {
      continue;
    }
    if (!$include_inactive && !$field['active']) {
      continue;
    }

    // Set default instance settings.
    $instance += field_defaults_instance();
    $instance['settings'] += field_info_instance_settings($field['type']);

    // Filter out instances on unknown entity types (for instance because the
    // module exposing them was disabled).
    $entity_info = entity_get_info($instance['entity_type']);
    if ($include_inactive || $entity_info) {
      module_invoke_all('field_read_instance', $instance);
      $instances[] = $instance;
    }

    // Reset the field read cache to avoid storing two copies of all fields.
    backdrop_static_reset('_field_read_fields_cache');
  }

  return $instances;
}

/**
 * Provides a list of defaults for instance arrays.
 */
function field_defaults_instance() {
  return array(
    'field_name' => NULL,
    'entity_type' => NULL,
    'bundle' => NULL,
    'label' => '',
    'description' => '',
    'required' => 0,
    'deleted' => 0,
    'default_value' => NULL,
    'default_value_function' => NULL,
    'widget' => array(),
    'settings' => array(),
    'display' => array(),
  );
}

/**
 * Marks a field instance and its data for deletion.
 *
 * @param $instance
 *   An instance structure.
 * @param $field_cleanup
 *   If TRUE, the field will be deleted as well if its last instance is being
 *   deleted. If FALSE, it is the caller's responsibility to handle the case of
 *   fields left without instances. Defaults to TRUE.
 */
function field_delete_instance($instance, $field_cleanup = TRUE) {
  // Sanity check to prevent writing a new empty config file.
  field_validate_instance($instance, TRUE, FALSE);

  // Mark the field instance for deletion.
  $config = config('field.instance.' . $instance['entity_type'] . '.' . $instance['bundle'] . '.' . $instance['field_name']);
  $config->set('deleted', 1);
  $config->save();

  // Clear the cache.
  field_cache_clear();

  // Mark instance data for deletion.
  $field = field_info_field($instance['field_name']);
  module_invoke($field['storage']['module'], 'field_storage_delete_instance', $instance);

  // Let modules react to the deletion of the instance.
  module_invoke_all('field_delete_instance', $instance);
  token_cache_clear();

  // Delete the field itself if we just deleted its last instance.
  if ($field_cleanup && count($field['bundles']) == 0) {
    field_delete_field($field['field_name']);
  }
}

/**
 * @} End of "defgroup field_crud".
 */

/**
 * @defgroup field_purge Field API bulk data deletion
 * @{
 * Clean up after Field API bulk deletion operations.
 *
 * Field API provides functions for deleting data attached to individual
 * entities as well as deleting entire fields or field instances in a single
 * operation.
 *
 * Deleting field data items for an entity with field_attach_delete() involves
 * three separate operations:
 * - Invoking the Field Type API hook_field_delete() for each field on the
 * entity. The hook for each field type receives the entity and the specific
 * field being deleted. A file field module might use this hook to delete
 * uploaded files from the filesystem.
 * - Invoking the Field Storage API hook_field_storage_delete() to remove
 * data from the primary field storage. The hook implementation receives the
 * entity being deleted and deletes data for all of the entity's bundle's
 * fields.
 * - Invoking the global Field Attach API hook_field_attach_delete() for all
 * modules that implement it. Each hook implementation receives the entity
 * being deleted and can operate on whichever subset of the entity's bundle's
 * fields it chooses to.
 *
 * These hooks are invoked immediately when field_attach_delete() is
 * called. Similar operations are performed for field_attach_delete_revision().
 *
 * When a field, bundle, or field instance is deleted, it is not practical to
 * invoke these hooks immediately on every affected entity in a single page
 * request; there could be thousands or millions of them. Instead, the
 * appropriate field data items, instances, and/or fields are marked as deleted
 * so that subsequent load or query operations will not return them. Later, a
 * separate process cleans up, or "purges", the marked-as-deleted data by going
 * through the three-step process described above and, finally, removing
 * deleted field and instance records.
 *
 * Purging field data is made somewhat tricky by the fact that, while
 * field_attach_delete() has a complete entity to pass to the various deletion
 * hooks, the Field API purge process only has the field data it has previously
 * stored. It cannot reconstruct complete original entities to pass to the
 * deletion hooks. It is even possible that the original entity to which some
 * Field API data was attached has been itself deleted before the field purge
 * operation takes place.
 *
 * Field API resolves this problem by using "pseudo-entities" during purge
 * operations. A pseudo-entity contains only the information from the original
 * entity that Field API knows about: entity type, id, revision id, and
 * bundle. It also contains the field data for whichever field instance is
 * currently being purged. For example, suppose that the node type 'story' used
 * to contain a field called 'subtitle' but the field was deleted. If node 37
 * was a story with a subtitle, the pseudo-entity passed to the purge hooks
 * would look something like this:
 *
 * @code
 *   $entity = stdClass Object(
 *     [nid] => 37,
 *     [vid] => 37,
 *     [type] => 'story',
 *     [subtitle] => array(
 *       [0] => array(
 *         'value' => 'subtitle text',
 *       ),
 *     ),
 *   );
 * @endcode
 *
 * See @link field Field API @endlink for information about the other parts of
 * the Field API.
 */

/**
 * Purges a batch of deleted Field API data, instances, or fields.
 *
 * This function will purge deleted field data in batches. The batch size
 * is defined as an argument to the function, and once each batch is finished,
 * it continues with the next batch until all have completed. If a deleted field
 * instance with no remaining data records is found, the instance itself will
 * be purged. If a deleted field with no remaining field instances is found, the
 * field itself will be purged.
 *
 * @param $batch_size
 *   The maximum number of field data records to purge before returning.
 */
function field_purge_batch($batch_size) {
  // Retrieve all deleted field instances. We cannot use field_info_instances()
  // because that function does not return deleted instances.
  $instances = field_read_instances(array('deleted' => 1), array('include_deleted' => 1));

  foreach ($instances as $instance) {
    // field_purge_data() will need the field array.
    $field = field_info_field($instance['field_name']);
    // Retrieve some entities.
    $query = new EntityFieldQuery();
    $results = $query
      ->fieldCondition($field)
      ->entityCondition('bundle', $instance['bundle'])
      ->deleted(TRUE)
      ->range(0, $batch_size)
      ->execute();

    if ($results) {
      foreach ($results as $entity_type => $stub_entities) {
        field_attach_load($entity_type, $stub_entities, FIELD_LOAD_CURRENT, array('field_name' => $field['field_name'], 'deleted' => 1));
        foreach ($stub_entities as $stub_entity) {
          // Purge the data for the entity.
          field_purge_data($entity_type, $stub_entity, $field, $instance);
        }
      }
    }

    // Check if any data remains.
    $query = new EntityFieldQuery();
    $count = $query
      ->fieldCondition($field)
      ->entityCondition('bundle', $instance['bundle'])
      ->deleted(TRUE)
      ->count()
      ->execute();

    if (empty($count)) {
      // No field data remains for the instance, so we can remove it.
      field_purge_instance($instance);
    }
  }

  // Retrieve all deleted fields. Any that have no instances can be purged.
  $fields = field_read_fields(array('deleted' => 1), array('include_deleted' => 1));
  foreach ($fields as $field) {
    $instances = field_read_instances(array('field_name' => $field['field_name']), array('include_deleted' => 1));
    if (empty($instances)) {
      field_purge_field($field);
    }
  }
}

/**
 * Purges the field data for a single field on a single pseudo-entity.
 *
 * This is basically the same as field_attach_delete() except it only applies
 * to a single field. The entity itself is not being deleted, and it is quite
 * possible that other field data will remain attached to it.
 *
 * @param $entity_type
 *   The type of $entity; e.g. 'node' or 'user'.
 * @param $entity
 *   The pseudo-entity whose field data is being purged.
 * @param $field
 *   The (possibly deleted) field whose data is being purged.
 * @param $instance
 *   The deleted field instance whose data is being purged.
 */
function field_purge_data($entity_type, $entity, $field, $instance) {
  // Each field type's hook_field_delete() only expects to operate on a single
  // field at a time, so we can use it as-is for purging.
  $options = array('field_name' => $instance['field_name'], 'deleted' => TRUE);
  _field_invoke('delete', $entity_type, $entity, $dummy, $dummy, $options);

  // Tell the field storage system to purge the data.
  module_invoke($field['storage']['module'], 'field_storage_purge', $entity_type, $entity, $field, $instance);

  // Let other modules act on purging the data.
  foreach (module_implements('field_attach_purge') as $module) {
    $function = $module . '_field_attach_purge';
    $function($entity_type, $entity, $field, $instance);
  }
}

/**
 * Purges a field instance record from the database.
 *
 * This function assumes all data for the instance has already been purged, and
 * should only be called by field_purge_batch().
 *
 * @param $instance
 *   The instance record to purge.
 */
function field_purge_instance($instance) {
  $config = config('field.instance.' . $instance['entity_type'] . '.' . $instance['bundle'] . '.' . $instance['field_name']);
  $config->delete();

  // Notify the storage engine.
  $field = field_info_field($instance['field_name']);
  module_invoke($field['storage']['module'], 'field_storage_purge_instance', $instance);

  // Clear the cache.
  field_info_cache_clear();

  // Invoke external hooks after the cache is cleared for API consistency.
  module_invoke_all('field_purge_instance', $instance);
}

/**
 * Purges a field configuration.
 *
 * This function assumes all instances for the field has already been purged,
 * and should only be called by field_purge_batch().
 *
 * @param $field
 *   The field record to purge.
 */
function field_purge_field($field) {
  $instances = field_read_instances(array('field_name' => $field['field_name']), array('include_deleted' => TRUE));
  if (count($instances) > 0) {
    throw new FieldException(t('Attempt to purge a field @field_name that still has instances.', array('@field_name' => $field['field_name'])));
  }

  $config = config('field.field.' . $field['field_name']);
  $config->delete();

  // Notify the storage engine.
  module_invoke($field['storage']['module'], 'field_storage_purge_field', $field);

  // Clear the cache.
  field_info_cache_clear();

  // Invoke external hooks after the cache is cleared for API consistency.
  module_invoke_all('field_purge_field', $field);
}

/**
 * @} End of "defgroup field_purge".
 */
