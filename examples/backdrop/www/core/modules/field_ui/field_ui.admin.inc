<?php
/**
 * @file
 * Administrative interface for custom field type creation.
 */

/**
 * Title callback: Gets the view mode name.
 *
 * @see field_ui_menu()
 */
function field_ui_manage_display_title($entity_type, $machine_name) {
  $view_mode = entity_view_mode_load($entity_type, $machine_name);
  return $view_mode['label'];
}

/**
 * Page callback: Lists all defined fields for quick reference.
 *
 * @see field_ui_menu()
 */
function field_ui_fields_list() {
  $instances = field_info_instances();
  $field_types = field_info_field_types();
  $bundles = field_info_bundles();

  $modules = system_rebuild_module_data();

  $header = array(
    t('Field name'),
    array('data' => t('Field type'), 'class' => array(RESPONSIVE_PRIORITY_MEDIUM)),
    t('Used in'),
  );
  $rows = array();
  foreach ($instances as $entity_type => $type_bundles) {
    foreach ($type_bundles as $bundle => $bundle_instances) {
      foreach ($bundle_instances as $field_name => $instance) {
        $field = field_info_field($field_name);

        // Initialize the row if we encounter the field for the first time.
        if (!isset($rows[$field_name])) {
          $rows[$field_name]['class'] = $field['locked'] ? array('menu-disabled') : array('');
          $rows[$field_name]['data'][0] = $field['locked'] ? t('@field_name (Locked)', array('@field_name' => $field_name)) : $field_name;
          $module_name = $field_types[$field['type']]['module'];
          $rows[$field_name]['data'][1] = $field_types[$field['type']]['label'] . ' ' . t('(module: !module)', array('!module' => $modules[$module_name]->info['name']));
        }

        // Add the current instance.
        $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);
        $rows[$field_name]['data'][2][] = $admin_path ? l($bundles[$entity_type][$bundle]['label'], $admin_path . '/fields') : $bundles[$entity_type][$bundle]['label'];
      }
    }
  }
  foreach ($rows as $field_name => $cell) {
    $rows[$field_name]['data'][2] = implode(', ', $cell['data'][2]);
  }
  if (empty($rows)) {
    $output = t('No fields have been defined yet.');
  }
  else {
    // Sort rows by field name.
    ksort($rows);
    $output = theme('table', array('header' => $header, 'rows' => $rows));
  }
  return $output;
}

/**
 * Displays a message listing the inactive fields of a given bundle.
 */
function field_ui_inactive_message($entity_type, $bundle) {
  $inactive_instances = field_ui_inactive_instances($entity_type, $bundle);
  if (!empty($inactive_instances)) {
    $field_types = field_info_field_types();
    $widget_types = field_info_widget_types();

    foreach ($inactive_instances as $field_name => $instance) {
      $list[] = t('%field (@field_name) field requires the %widget_type widget provided by %widget_module module', array(
      '%field' => $instance['label'],
      '@field_name' => $instance['field_name'],
      '%widget_type' => isset($widget_types[$instance['widget']['type']]) ? $widget_types[$instance['widget']['type']]['label'] : $instance['widget']['type'],
      '%widget_module' => $instance['widget']['module'],
      ));
    }
    backdrop_set_message(t('Inactive fields are not shown unless their providing modules are enabled. The following fields are not enabled: !list', array('!list' => theme('item_list', array('items' => $list)))), 'error');
  }
}

/**
 * Determines the rendering order of an array representing a tree.
 *
 * Callback for array_reduce() within field_ui_table_pre_render().
 */
function _field_ui_reduce_order($array, $a) {
  $array = !isset($array) ? array() : $array;
  if ($a['name']) {
    $array[] = $a['name'];
  }
  if (!empty($a['children'])) {
    backdrop_sort($a['children']);
    $array = array_merge($array, array_reduce($a['children'], '_field_ui_reduce_order'));
  }
  return $array;
}

/**
 * Returns the region to which a row in the 'Manage fields' screen belongs.
 *
 * This function is used as a #region_callback in
 * field_ui_field_overview_form(). It is called during
 * field_ui_table_pre_render().
 */
function field_ui_field_overview_row_region($row) {
  switch ($row['#row_type']) {
    case 'field':
    case 'extra_field':
      return 'main';
    case 'add_new_field':
      // If no input in 'label', assume the row has not been dragged out of the
      // 'add new' section.
      return (!empty($row['label']['#value']) ? 'main' : 'add_new');
  }
}

/**
 * Returns the region to which a row in the 'Manage display' screen belongs.
 *
 * This function is used as a #region_callback in
 * field_ui_field_overview_form(), and is called during
 * field_ui_table_pre_render().
 */
function field_ui_display_overview_row_region($row) {
  switch ($row['#row_type']) {
    case 'field':
    case 'extra_field':
      return ($row['format']['type']['#value'] == 'hidden' ? 'hidden' : 'visible');
  }
}

/**
 * Render API callback: Performs pre-render tasks on field_ui_table elements.
 *
 * This function is assigned as a #pre_render callback in
 * field_ui_element_info().
 *
 * @see backdrop_render().
 */
function field_ui_table_pre_render($elements) {
  $js_settings = array();

  // For each region, build the tree structure from the weight and parenting
  // data contained in the flat form structure, to determine row order and
  // indentation.
  $regions = $elements['#regions'];
  $tree = array('' => array('name' => '', 'children' => array()));
  $trees = array_fill_keys(array_keys($regions), $tree);

  $parents = array();
  $list = backdrop_map_assoc(element_children($elements));

  // Iterate on rows until we can build a known tree path for all of them.
  while ($list) {
    foreach ($list as $name) {
      $row = &$elements[$name];
      $parent = $row['parent_wrapper']['parent']['#value'];
      // Proceed if parent is known.
      if (empty($parent) || isset($parents[$parent])) {
        // Grab parent, and remove the row from the next iteration.
        $parents[$name] = $parent ? array_merge($parents[$parent], array($parent)) : array();
        unset($list[$name]);

        // Determine the region for the row.
        $function = $row['#region_callback'];
        $region_name = $function($row);

        // Add the element in the tree.
        $target = &$trees[$region_name][''];
        foreach ($parents[$name] as $key) {
          $target = &$target['children'][$key];
        }
        $target['children'][$name] = array('name' => $name, 'weight' => $row['weight']['#value']);

        // Add tabledrag indentation to the first row cell.
        if ($depth = count($parents[$name])) {
          $children = element_children($row);
          $cell = current($children);
          $row[$cell]['#prefix'] = theme('indentation', array('size' => $depth)) . (isset($row[$cell]['#prefix']) ? $row[$cell]['#prefix'] : '');
        }

        // Add row id and associate JS settings.
        $id = backdrop_html_class($name);
        $row['#attributes']['id'] = $id;
        if (isset($row['#js_settings'])) {
          $row['#js_settings'] += array(
            'rowHandler' => $row['#row_type'],
            'name' => $name,
            'region' => $region_name,
          );
          $js_settings[$id] = $row['#js_settings'];
        }
      }
    }
  }
  // Determine rendering order from the tree structure.
  foreach ($regions as $region_name => $region) {
    $elements['#regions'][$region_name]['rows_order'] = array_reduce($trees[$region_name], '_field_ui_reduce_order');
  }

  $elements['#attached']['js'][] = array(
    'type' => 'setting',
    'data' => array('fieldUIRowsData' => $js_settings),
  );

  return $elements;
}

/**
 * Form constructor for the 'Manage fields' form of a bundle.
 *
 * The resulting form allows fields and pseudo-fields to be re-ordered.
 *
 * @see field_ui_menu()
 * @see field_ui_field_overview_form_validate()
 * @see field_ui_field_overview_form_submit()
 * @ingroup forms
 */
function field_ui_field_overview_form($form, &$form_state, $entity_type, $bundle) {
  $bundle = field_extract_bundle($entity_type, $bundle);

  field_ui_inactive_message($entity_type, $bundle);
  $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);

  // When displaying the form, make sure the list of fields is up-to-date.
  if (empty($form_state['post'])) {
    field_info_cache_clear();
  }

  // Gather bundle information.
  $instances = field_info_instances($entity_type, $bundle);
  $field_types = field_info_field_types();
  $widget_types = field_info_widget_types();

  $extra_fields = field_info_extra_fields($entity_type, $bundle, 'form');

  $form += array(
    '#entity_type' => $entity_type,
    '#bundle' => $bundle,
    '#fields' => array_keys($instances),
    '#extra' => array_keys($extra_fields),
  );

  $table = array(
    '#type' => 'field_ui_table',
    '#tree' => TRUE,
    '#header' => array(
      t('Label'),
      t('Weight'),
      t('Parent'),
      t('Machine name'),
      t('Field type'),
      t('Widget'),
      t('Operations'),
    ),
    '#parent_options' => array(),
    '#regions' => array(
      'main' => array('message' => t('No fields are present yet.')),
      'add_new' => array('title' => '&nbsp;'),
    ),
    '#attributes' => array(
      'class' => array('field-ui-overview'),
      'id' => 'field-overview',
    ),
  );

  // Fields.
  foreach ($instances as $name => $instance) {
    $field = field_info_field($instance['field_name']);
    $admin_field_path = $admin_path . '/fields/' . $instance['field_name'];
    $table[$name] = array(
      '#attributes' => array('class' => array('draggable', 'tabledrag-leaf')),
      '#row_type' => 'field',
      '#region_callback' => 'field_ui_field_overview_row_region',
      'label' => array(
        '#markup' => check_plain($instance['label']),
      ),
      'weight' => array(
        '#type' => 'textfield',
        '#title' => t('Weight for @title', array('@title' => $instance['label'])),
        '#title_display' => 'invisible',
        '#default_value' => $instance['widget']['weight'],
        '#size' => 3,
        '#attributes' => array('class' => array('field-weight')),
       ),
      'parent_wrapper' => array(
        'parent' => array(
          '#type' => 'select',
          '#title' => t('Parent for @title', array('@title' => $instance['label'])),
          '#title_display' => 'invisible',
          '#options' => $table['#parent_options'],
          '#empty_value' => '',
          '#attributes' => array('class' => array('field-parent')),
          '#parents' => array('fields', $name, 'parent'),
        ),
        'hidden_name' => array(
          '#type' => 'hidden',
          '#default_value' => $name,
          '#attributes' => array('class' => array('field-name')),
        ),
      ),
      'field_name' => array(
        '#markup' => $instance['field_name'],
      ),
      'type' => array(
        '#type' => 'link',
        '#title' => t($field_types[$field['type']]['label']),
        '#href' => $admin_field_path . '/field-settings',
        '#options' => array('attributes' => array('title' => t('Edit field settings.'))),
      ),
      'widget_type' => array(
        '#type' => 'link',
        '#title' => t($widget_types[$instance['widget']['type']]['label']),
        '#href' => $admin_field_path . '/widget-type',
        '#options' => array('attributes' => array('title' => t('Change widget type.'))),
      ),
    );
    $links = array();
    $links['edit'] = array(
      'title' => t('Edit'),
      'href' => $admin_field_path,
      'attributes' => array('title' => t('Edit instance settings.')),
    );
    $links['delete'] = array(
      'title' => t('Delete'),
      'href' => "$admin_field_path/delete",
      'attributes' => array('title' => t('Delete instance.')),
    );
    $table[$name]['operations']['data'] = array(
      '#type' => 'operations',
      '#links' => $links,
    );

    if (!empty($instance['locked'])) {
      $table[$name]['operations'] = array('#value' => t('Locked'));
      $table[$name]['#attributes']['class'][] = 'menu-disabled';
    }
  }

  // Non-field elements.
  foreach ($extra_fields as $name => $extra_field) {
    $table[$name] = array(
      '#attributes' => array('class' => array('draggable', 'tabledrag-leaf')),
      '#row_type' => 'extra_field',
      '#region_callback' => 'field_ui_field_overview_row_region',
      'label' => array(
        '#markup' => check_plain($extra_field['label']),
      ),
      'weight' => array(
        '#type' => 'textfield',
        '#default_value' => $extra_field['weight'],
        '#size' => 3,
        '#attributes' => array('class' => array('field-weight')),
        '#title_display' => 'invisible',
        '#title' => t('Weight for @title', array('@title' => $extra_field['label'])),
      ),
      'parent_wrapper' => array(
        'parent' => array(
          '#type' => 'select',
          '#title' => t('Parent for @title', array('@title' => $extra_field['label'])),
          '#title_display' => 'invisible',
          '#options' => $table['#parent_options'],
          '#empty_value' => '',
          '#attributes' => array('class' => array('field-parent')),
          '#parents' => array('fields', $name, 'parent'),
        ),
        'hidden_name' => array(
          '#type' => 'hidden',
          '#default_value' => $name,
          '#attributes' => array('class' => array('field-name')),
        ),
      ),
      'field_name' => array(
        '#markup' => $name,
      ),
      'type' => array(
        '#markup' => isset($extra_field['description']) ? $extra_field['description'] : '',
        '#cell_attributes' => array('colspan' => 2),
      ),
      'operations' => array(
        '#markup' => '',
      ),
    );
  }

  // Additional row: add new field.
  $max_weight = field_info_max_weight($entity_type, $bundle, 'form');
  $field_type_options = field_ui_field_type_options();
  $widget_type_options = field_ui_widget_type_options(NULL, TRUE);
  if ($field_type_options && $widget_type_options) {
    $name = '_add_new_field';
    $table[$name] = array(
      '#attributes' => array('class' => array('draggable', 'tabledrag-leaf', 'add-new')),
      '#row_type' => 'add_new_field',
      '#region_callback' => 'field_ui_field_overview_row_region',
      'label' => array(
        '#type' => 'textfield',
        '#title' => t('New field label'),
        '#title_display' => 'invisible',
        '#size' => 15,
        '#description' => t('Label'),
        '#prefix' => '<div class="label-input"><div class="add-new-placeholder">' . t('Add new field') .'</div>',
        '#suffix' => '</div>',
      ),
      'weight' => array(
        '#type' => 'textfield',
        '#default_value' => $max_weight + 1,
        '#size' => 3,
        '#title_display' => 'invisible',
        '#title' => t('Weight for new field'),
        '#attributes' => array('class' => array('field-weight')),
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
      ),
      'parent_wrapper' => array(
        'parent' => array(
          '#type' => 'select',
          '#title' => t('Parent for new field'),
          '#title_display' => 'invisible',
          '#options' => $table['#parent_options'],
          '#empty_value' => '',
          '#attributes' => array('class' => array('field-parent')),
          '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
          '#parents' => array('fields', $name, 'parent'),
        ),
        'hidden_name' => array(
          '#type' => 'hidden',
          '#default_value' => $name,
          '#attributes' => array('class' => array('field-name')),
        ),
      ),
      'field_name' => array(
        '#type' => 'machine_name',
        '#title' => t('New field name'),
        '#title_display' => 'invisible',
        // This field should stay LTR even for RTL languages.
        '#field_prefix' => '<span dir="ltr">field_',
        '#field_suffix' => '</span>&lrm;',
        '#size' => 15,
        '#description' => t('A unique machine-readable name containing letters, numbers, and underscores.'),
        // 32 characters minus the 'field_' prefix.
        '#maxlength' => 26,
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
        '#machine_name' => array(
          'source' => array('fields', $name, 'label'),
          'exists' => '_field_ui_field_name_exists',
          'standalone' => TRUE,
          'label' => '',
        ),
        '#required' => FALSE,
      ),
      'type' => array(
        '#type' => 'select',
        '#title' => t('Type of new field'),
        '#title_display' => 'invisible',
        '#options' => $field_type_options,
        '#empty_option' => t('- Select a field type -'),
        '#description' => t('Type of data to store.'),
        '#attributes' => array('class' => array('field-type-select')),
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
      ),
      'widget_type' => array(
        '#type' => 'select',
        '#title' => t('Widget for new field'),
        '#title_display' => 'invisible',
        '#options' => $widget_type_options,
        '#empty_option' => t('- Select a widget -'),
        '#description' => t('Form element to edit the data.'),
        '#attributes' => array('class' => array('widget-type-select')),
        '#cell_attributes' => array('colspan' => 3),
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
      ),
      // Place the 'translatable' property as an explicit value so that contrib
      // modules can form_alter() the value for newly created fields.
      'translatable' => array(
        '#type' => 'value',
        '#value' => FALSE,
      ),
    );
  }

  // Additional row: add existing field.
  $existing_fields = field_ui_existing_field_options($entity_type, $bundle);
  if ($existing_fields && $widget_type_options) {
    // Build list of options.
    $existing_field_options = array();
    foreach ($existing_fields as $field_name => $info) {
      $text = t('@type: @field (@label)', array(
        '@type' => $info['type_label'],
        '@label' => $info['label'],
        '@field' => $info['field'],
      ));
      $existing_field_options[$field_name] = truncate_utf8($text, 80, FALSE, TRUE);
    }
    asort($existing_field_options);
    $name = '_add_existing_field';
    $table[$name] = array(
      '#attributes' => array('class' => array('draggable', 'tabledrag-leaf', 'add-new')),
      '#row_type' => 'add_new_field',
      '#region_callback' => 'field_ui_field_overview_row_region',
      'label' => array(
        '#type' => 'textfield',
        '#title' => t('Existing field label'),
        '#title_display' => 'invisible',
        '#size' => 15,
        '#description' => t('Label'),
        '#attributes' => array('class' => array('label-textfield')),
        '#prefix' => '<div class="label-input"><div class="add-new-placeholder">' . t('Add existing field') .'</div>',
        '#suffix' => '</div>',
      ),
      'weight' => array(
        '#type' => 'textfield',
        '#default_value' => $max_weight + 2,
        '#size' => 3,
        '#title_display' => 'invisible',
        '#title' => t('Weight for added field'),
        '#attributes' => array('class' => array('field-weight')),
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
      ),
      'parent_wrapper' => array(
        'parent' => array(
          '#type' => 'select',
          '#title' => t('Parent for existing field'),
          '#title_display' => 'invisible',
          '#options' => $table['#parent_options'],
          '#empty_value' => '',
          '#attributes' => array('class' => array('field-parent')),
          '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
          '#parents' => array('fields', $name, 'parent'),
        ),
        'hidden_name' => array(
          '#type' => 'hidden',
          '#default_value' => $name,
          '#attributes' => array('class' => array('field-name')),
        ),
      ),
      'field_name' => array(
        '#type' => 'select',
        '#title' => t('Existing field to share'),
        '#title_display' => 'invisible',
        '#options' => $existing_field_options,
        '#empty_option' => t('- Select an existing field -'),
        '#description' => t('Field to share'),
        '#attributes' => array('class' => array('field-select')),
        '#cell_attributes' => array('colspan' => 2),
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
      ),
      'widget_type' => array(
        '#type' => 'select',
        '#title' => t('Widget for existing field'),
        '#title_display' => 'invisible',
        '#options' => $widget_type_options,
        '#empty_option' => t('- Select a widget -'),
        '#description' => t('Form element to edit the data.'),
        '#attributes' => array('class' => array('widget-type-select')),
        '#cell_attributes' => array('colspan' => 3),
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
      ),
    );
  }
  $form['fields'] = $table;

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array('#type' => 'submit', '#value' => t('Save'));

  $form['#attached']['css'][] = backdrop_get_path('module', 'field_ui') . '/css/field_ui.css';
  $form['#attached']['js'][] = backdrop_get_path('module', 'field_ui') . '/js/field_ui.js';

  // Add settings for the update selects behavior.
  $js_fields = array();
  foreach ($existing_fields as $field_name => $info) {
    $js_fields[$field_name] = array('label' => $info['label'], 'type' => $info['type'], 'widget' => $info['widget_type']);
  }

  $field_info = array();
  foreach ($field_types as $machine => $type) {
    $field_info[$machine]['label'] = $type['label'];
    $field_info[$machine]['defaultWidget'] = $type['default_widget'];
    $field_info[$machine]['defaultFormatter'] = $type['default_formatter'];
    $field_info[$machine]['module'] = $type['module'];
  }

  $form['#attached']['js'][] = array(
    'type' => 'setting',
    'data' => array(
      'fields' => $js_fields,
      'fieldWidgetTypes' => field_ui_widget_type_options(),
      'fieldInfo' => $field_info,
    ),
  );

  // Add tabledrag behavior.
  $form['#attached']['backdrop_add_tabledrag'][] = array('field-overview', 'order', 'sibling', 'field-weight');
  $form['#attached']['backdrop_add_tabledrag'][] = array('field-overview', 'match', 'parent', 'field-parent', 'field-parent', 'field-name');

  return $form;
}

/**
 * Form validation handler for field_ui_field_overview_form().
 *
 * @see field_ui_field_overview_form_submit()
 */
function field_ui_field_overview_form_validate($form, &$form_state) {
  _field_ui_field_overview_form_validate_add_new($form, $form_state);
  _field_ui_field_overview_form_validate_add_existing($form, $form_state);
}

/**
 * Validates the 'add new field' row of field_ui_field_overview_form().
 *
 * @see field_ui_field_overview_form_validate()
 */
function _field_ui_field_overview_form_validate_add_new($form, &$form_state) {
  $field = $form_state['values']['fields']['_add_new_field'];

  // Validate if any information was provided in the 'add new field' row.
  if (array_filter(array($field['label'], $field['field_name'], $field['type'], $field['widget_type']))) {
    // Missing label.
    if (!$field['label']) {
      form_set_error('fields][_add_new_field][label', t('Add new field: you need to provide a label.'));
    }

    // Missing field name.
    if (!$field['field_name']) {
      form_set_error('fields][_add_new_field][field_name', t('Add new field: you need to provide a field name.'));
    }
    // Field name validation.
    else {
      $field_name = $field['field_name'];

      // Add the 'field_' prefix.
      $field_name = 'field_' . $field_name;
      form_set_value($form['fields']['_add_new_field']['field_name'], $field_name, $form_state);
    }

    // Missing field type.
    if (!$field['type']) {
      form_set_error('fields][_add_new_field][type', t('Add new field: you need to select a field type.'));
    }

    // Missing widget type.
    if (!$field['widget_type']) {
      form_set_error('fields][_add_new_field][widget_type', t('Add new field: you need to select a widget.'));
    }
    // Wrong widget type.
    elseif ($field['type']) {
      $widget_types = field_ui_widget_type_options($field['type']);
      if (!isset($widget_types[$field['widget_type']])) {
        form_set_error('fields][_add_new_field][widget_type', t('Add new field: invalid widget.'));
      }
    }
  }
}

/**
 * Render API callback: Checks if a field machine name is taken.
 *
 * @param $value
 *   The machine name, not prefixed with 'field_'.
 *
 * @return
 *   Whether or not the field machine name is taken.
 */
function _field_ui_field_name_exists($value) {
  if (!empty($value)) {
    // field_info_fields() does not include inactive fields.
    return (bool) field_read_fields(array('field_name' => 'field_' . $value), array('include_inactive' => TRUE, 'include_deleted' => TRUE));
  }
}

/**
 * Validates the 'add existing field' row of field_ui_field_overview_form().
 *
 * @see field_ui_field_overview_form_validate()
 */
function _field_ui_field_overview_form_validate_add_existing($form, &$form_state) {
  // The form element might be absent if no existing fields can be added to
  // this bundle.
  if (isset($form_state['values']['fields']['_add_existing_field'])) {
    $field = $form_state['values']['fields']['_add_existing_field'];

    // Validate if any information was provided in the 'add existing field' row.
    if (array_filter(array($field['label'], $field['field_name'], $field['widget_type']))) {
      // Missing label.
      if (!$field['label']) {
        form_set_error('fields][_add_existing_field][label', t('Add existing field: you need to provide a label.'));
      }

      // Missing existing field name.
      if (!$field['field_name']) {
        form_set_error('fields][_add_existing_field][field_name', t('Add existing field: you need to select a field.'));
      }

      // Missing widget type.
      if (!$field['widget_type']) {
        form_set_error('fields][_add_existing_field][widget_type', t('Add existing field: you need to select a widget.'));
      }
      // Wrong widget type.
      elseif ($field['field_name'] && ($existing_field = field_info_field($field['field_name']))) {
        $widget_types = field_ui_widget_type_options($existing_field['type']);
        if (!isset($widget_types[$field['widget_type']])) {
          form_set_error('fields][_add_existing_field][widget_type', t('Add existing field: invalid widget.'));
        }
      }
    }
  }
}

/**
 * Form submission handler for field_ui_field_overview_form().
 *
 * @see field_ui_field_overview_form_validate()
 */
function field_ui_field_overview_form_submit($form, &$form_state) {
  $form_values = $form_state['values']['fields'];
  $entity_type = $form['#entity_type'];
  $bundle = $form['#bundle'];
  $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);

  $bundle_settings = field_bundle_settings($entity_type, $bundle);

  // Update field weights.
  foreach ($form_values as $key => $values) {
    if (in_array($key, $form['#fields'])) {
      $instance = field_read_instance($entity_type, $key, $bundle);
      $instance['widget']['weight'] = $values['weight'];
      field_update_instance($instance);
    }
    elseif (in_array($key, $form['#extra'])) {
      $bundle_settings['extra_fields']['form'][$key]['weight'] = $values['weight'];
    }
  }

  field_bundle_settings($entity_type, $bundle, $bundle_settings);

  $destinations = array();

  // Create new field.
  $field = array();
  if (!empty($form_values['_add_new_field']['field_name'])) {
    $values = $form_values['_add_new_field'];

    $field = array(
      'field_name' => $values['field_name'],
      'type' => $values['type'],
      'translatable' => $values['translatable'],
    );
    $instance = array(
      'field_name' => $field['field_name'],
      'entity_type' => $entity_type,
      'bundle' => $bundle,
      'label' => $values['label'],
      'widget' => array(
        'type' => $values['widget_type'],
        'weight' => $values['weight'],
      ),
    );

    // Create the field and instance.
    try {
      field_create_field($field);
      field_create_instance($instance);

      $destinations[] = $admin_path . '/fields/' . $field['field_name'] . '/field-settings';
      $destinations[] = $admin_path . '/fields/' . $field['field_name'];

      // Store new field information for any additional submit handlers.
      $form_state['fields_added']['_add_new_field'] = $field['field_name'];
    }
    catch (Exception $e) {
      backdrop_set_message(t('There was a problem creating field %label: !message', array('%label' => $instance['label'], '!message' => $e->getMessage())), 'error');
    }
  }

  // Add existing field.
  if (!empty($form_values['_add_existing_field']['field_name'])) {
    $values = $form_values['_add_existing_field'];
    $field = field_info_field($values['field_name']);
    if (!empty($field['locked'])) {
      backdrop_set_message(t('The field %label cannot be added because it is locked.', array('%label' => $values['label'])), 'error');
    }
    else {
      $instance = array(
        'field_name' => $field['field_name'],
        'entity_type' => $entity_type,
        'bundle' => $bundle,
        'label' => $values['label'],
        'widget' => array(
          'type' => $values['widget_type'],
          'weight' => $values['weight'],
        ),
      );

      try {
        field_create_instance($instance);
        $destinations[] = $admin_path . '/fields/' . $instance['field_name'] . '/edit';
        // Store new field information for any additional submit handlers.
        $form_state['fields_added']['_add_existing_field'] = $instance['field_name'];
      }
      catch (Exception $e) {
        backdrop_set_message(t('There was a problem creating field instance %label: @message.', array('%label' => $instance['label'], '@message' => $e->getMessage())), 'error');
      }
    }
  }

  if ($destinations) {
    $destination = backdrop_get_destination();
    $destinations[] = $destination['destination'];
    unset($_GET['destination']);
    $form_state['redirect'] = field_ui_get_destinations($destinations);
  }
  else {
    backdrop_set_message(t('Your settings have been saved.'));
  }
}

/**
 * Form constructor for the field display settings for a given view mode.
 *
 * @see field_ui_menu()
 * @ingroup forms
 */
function field_ui_display_overview($entity_type, $bundle) {
  if (is_object($bundle)) {
    $bundle_label = $bundle->name;
  }
  $bundle = field_extract_bundle($entity_type, $bundle);
  $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);

  $entity_info = entity_get_info($entity_type);
  if (!isset($bundle_label)) {
    $bundle_label = $entity_info['label'];
  }
  $view_mode_settings = field_view_mode_settings($entity_type, $bundle);
  $custom_view_modes = config_get('entity.view_modes', 'view_modes');
  $view_modes = $entity_info['view modes'];
  if (is_array($view_modes)) {
    backdrop_sort($view_modes, array('label' => SORT_STRING));
  }

  $custom = array();
  $default = array();
  // Sort view modes into active/default, and merge in view mode settings.
  foreach ($view_modes as $view_mode_name => $mode) {
    $custom_settings = isset($view_mode_settings[$view_mode_name]['custom_settings']) ? (bool) $view_mode_settings[$view_mode_name]['custom_settings'] : (bool) $mode['custom settings'];

    $custom[$view_mode_name] = array(
      'label' => $mode['label'],
      'custom settings' => $custom_settings,
      'storage' => !empty($custom_view_modes[$entity_type][$view_mode_name]) ? 'Custom' : 'Default (module-provided)',
      'status' => $custom_settings ? 'Customized' : 'Using the <em>Default display</em>',
    );

    if (!($custom_settings)) {
      $default[$view_mode_name] = $custom[$view_mode_name];
      unset($custom[$view_mode_name]);
    }
  }

  $build = array(
    '#entity_type' => $entity_type,
    '#bundle' => $bundle,
    '#attached' => array(
      'css' => array(backdrop_get_path('module', 'field_ui') . '/css/field_ui.css'),
    ),
  );
  $build['help'] = array(
    '#type' => 'markup',
    '#markup' => '<p>' . t('<strong>View modes</strong> are variations of how an item can be displayed. Each @label view mode can be configured differently. For example: individual fields can be displayed using a different format, or hidden entirely.', array('@label' => $bundle_label)) . '</p>',

  );
  $build['view_modes'] = array(
    '#theme' => 'field_ui_view_modes',
    '#tree' => TRUE,
    '#view_modes' => $custom + $default,
    '#entity_type' => $entity_type,
    '#bundle' => $bundle_label,
    '#admin_path' => $admin_path,
  );

  return $build;
}

/**
 * Form constructor for the field display settings for a given view mode.
 *
 * @see field_ui_menu()
 * @see field_ui_display_overview_multistep_submit()
 * @ingroup forms
 */
function field_ui_display_form($form, &$form_state, $entity_type, $bundle, $view_mode) {
  $bundle = field_extract_bundle($entity_type, $bundle);

  field_ui_inactive_message($entity_type, $bundle);
  $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);

  // Gather type information.
  $instances = field_info_instances($entity_type, $bundle);
  $field_types = field_info_field_types();
  $extra_fields = field_info_extra_fields($entity_type, $bundle, 'display');

  $form_state += array(
    'formatter_settings_edit' => NULL,
  );

  $form += array(
    '#entity_type' => $entity_type,
    '#bundle' => $bundle,
    '#view_mode' => $view_mode,
    '#fields' => array_keys($instances),
    '#extra' => array_keys($extra_fields),
  );

  if (empty($instances) && empty($extra_fields)) {
    backdrop_set_message(t('There are no fields added yet. You can add new fields on the <a href="@link">Manage fields</a> page.', array('@link' => url($admin_path . '/fields'))), 'warning');
    return $form;
  }

  $table = array(
    '#type' => 'field_ui_table',
    '#tree' => TRUE,
    '#header' => array(
      t('Field'),
      t('Weight'),
      t('Parent'),
      t('Label'),
      array('data' => t('Format'), 'colspan' => 3),
    ),
    '#regions' => array(
      'visible' => array('message' => t('No field is displayed.')),
      'hidden' => array('title' => t('Hidden'), 'message' => t('No field is hidden.')),
    ),
    '#parent_options' => array(),
    '#attributes' => array(
      'class' => array('field-ui-overview'),
      'id' => 'field-display-overview',
    ),
    // Add Ajax wrapper.
    '#prefix' => '<div id="field-display-overview-wrapper">',
    '#suffix' => '</div>',
  );

  $field_label_options = array(
    'above' => t('Above'),
    'inline' => t('Inline'),
    'hidden' => '<' . t('Hidden') . '>',
  );
  $extra_visibility_options = array(
    'visible' => t('Visible'),
    'hidden' => t('Hidden'),
  );

  // Field rows.
  foreach ($instances as $name => $instance) {
    $field = field_info_field($instance['field_name']);
    $display = $instance['display'][$view_mode];
    $table[$name] = array(
      '#attributes' => array('class' => array('draggable', 'tabledrag-leaf')),
      '#row_type' => 'field',
      '#region_callback' => 'field_ui_display_overview_row_region',
      '#js_settings' => array(
        'rowHandler' => 'field',
        'defaultFormatter' => $field_types[$field['type']]['default_formatter'],
      ),
      'human_name' => array(
        '#markup' => check_plain($instance['label']),
      ),
      'weight' => array(
        '#type' => 'textfield',
        '#title' => t('Weight for @title', array('@title' => $instance['label'])),
        '#title_display' => 'invisible',
        '#default_value' => $display['weight'],
        '#size' => 3,
        '#attributes' => array('class' => array('field-weight')),
      ),
      'parent_wrapper' => array(
        'parent' => array(
          '#type' => 'select',
          '#title' => t('Label display for @title', array('@title' => $instance['label'])),
          '#title_display' => 'invisible',
          '#options' => $table['#parent_options'],
          '#empty_value' => '',
          '#attributes' => array('class' => array('field-parent')),
          '#parents' => array('fields', $name, 'parent'),
        ),
        'hidden_name' => array(
          '#type' => 'hidden',
          '#default_value' => $name,
          '#attributes' => array('class' => array('field-name')),
        ),
      ),
      'label' => array(
        '#type' => 'select',
        '#title' => t('Label display for @title', array('@title' => $instance['label'])),
        '#title_display' => 'invisible',
        '#options' => $field_label_options,
        '#default_value' => $display['label'],
      ),
    );

    $formatter_options = field_ui_formatter_options($field['type']);
    $formatter_options['hidden'] = '<' . t('Hidden') . '>';
    $table[$name]['format'] = array(
      'type' => array(
        '#type' => 'select',
        '#title' => t('Formatter for @title', array('@title' => $instance['label'])),
        '#title_display' => 'invisible',
        '#options' => $formatter_options,
        '#default_value' => $display['type'],
        '#parents' => array('fields', $name, 'type'),
        '#attributes' => array('class' => array('field-formatter-type')),
      ),
      'settings_edit_form' => array(),
    );

    // Formatter settings.

    // Check the currently selected formatter, and merge persisted values for
    // formatter settings.
    if (isset($form_state['values']['fields'][$name]['type'])) {
      $formatter_type = $form_state['values']['fields'][$name]['type'];
    }
    else {
      $formatter_type = $display['type'];
    }
    if (isset($form_state['formatter_settings'][$name])) {
      $settings = $form_state['formatter_settings'][$name];
    }
    else {
      $settings = $display['settings'];
    }
    $settings += field_info_formatter_settings($formatter_type);

    $instance['display'][$view_mode]['type'] = $formatter_type;
    $formatter = field_info_formatter_types($formatter_type);
    $instance['display'][$view_mode]['module'] = $formatter['module'];
    $instance['display'][$view_mode]['settings'] = $settings;

    // Base button element for the various formatter settings actions.
    $base_button = array(
      '#submit' => array('field_ui_display_overview_multistep_submit'),
      '#ajax' => array(
        'callback' => 'field_ui_display_overview_multistep_js',
        'wrapper' => 'field-display-overview-wrapper',
        'effect' => 'fade',
      ),
      '#field_name' => $name,
    );

    if ($form_state['formatter_settings_edit'] == $name) {
      // We are currently editing this field's formatter settings. Display the
      // settings form and submit buttons.
      $table[$name]['format']['settings_edit_form'] = array();

      $settings_form = array();
      $function = $formatter['module'] . '_field_formatter_settings_form';
      if (function_exists($function)) {
        $settings_form = $function($field, $instance, $view_mode, $form, $form_state);
      }

      if ($settings_form) {
        $table[$name]['format']['#cell_attributes'] = array('colspan' => 3);
        $table[$name]['format']['settings_edit_form'] = array(
          '#type' => 'container',
          '#attributes' => array('class' => array('field-formatter-settings-edit-form')),
          '#parents' => array('fields', $name, 'settings_edit_form'),
          'label' => array(
            '#markup' => t('Format settings:') . ' <span class="formatter-name">' . $formatter['label'] . '</span>',
          ),
          'settings' => $settings_form,
          'actions' => array(
            '#type' => 'actions',
            'save_settings' => $base_button + array(
              '#type' => 'submit',
              '#name' => $name . '_formatter_settings_update',
              '#value' => t('Update'),
              '#op' => 'update',
            ),
            'cancel_settings' => $base_button + array(
              '#type' => 'submit',
              '#name' => $name . '_formatter_settings_cancel',
              '#value' => t('Cancel'),
              '#op' => 'cancel',
              // Do not check errors for the 'Cancel' button, but make sure we
              // get the value of the 'formatter type' select.
              '#limit_validation_errors' => array(array('fields', $name, 'type')),
            ),
          ),
        );
        $table[$name]['#attributes']['class'][] = 'field-formatter-settings-editing';
      }
    }
    else {
      // Display a summary of the current formatter settings.
      $summary = module_invoke($formatter['module'], 'field_formatter_settings_summary', $field, $instance, $view_mode);
      $table[$name]['settings_summary'] = array();
      $table[$name]['settings_edit'] = array();
      if ($summary) {
        $table[$name]['settings_summary'] = array(
          '#markup' => '<div class="field-formatter-summary">' . $summary . '</div>',
          '#cell_attributes' => array('class' => array('field-formatter-summary-cell')),
        );
        $table[$name]['settings_edit'] = $base_button + array(
          '#type' => 'submit',
          '#name' => $name . '_formatter_settings_edit',
          '#value' => t('Configure'),
          '#attributes' => array(
            'class' => array(
              'field-formatter-settings-edit',
              'button-secondary',
            ),
          ),
          '#op' => 'edit',
          // Do not check errors for the 'Edit' button, but make sure we get
          // the value of the 'formatter type' select.
          '#limit_validation_errors' => array(array('fields', $name, 'type')),
          '#prefix' => '<div class="field-formatter-settings-edit-wrapper">',
          '#suffix' => '</div>',
        );
      }
    }
  }

  // Non-field elements.
  foreach ($extra_fields as $name => $extra_field) {
    $display = $extra_field['display'][$view_mode];
    $table[$name] = array(
      '#attributes' => array('class' => array('draggable', 'tabledrag-leaf')),
      '#row_type' => 'extra_field',
      '#region_callback' => 'field_ui_display_overview_row_region',
      '#js_settings' => array('rowHandler' => 'field'),
      'human_name' => array(
        '#markup' => check_plain($extra_field['label']),
      ),
      'weight' => array(
        '#type' => 'textfield',
        '#title' => t('Weight for @title', array('@title' => $extra_field['label'])),
        '#title_display' => 'invisible',
        '#default_value' => $display['weight'],
        '#size' => 3,
        '#attributes' => array('class' => array('field-weight')),
      ),
      'parent_wrapper' => array(
        'parent' => array(
          '#type' => 'select',
          '#title' => t('Parents for @title', array('@title' => $extra_field['label'])),
          '#title_display' => 'invisible',
          '#options' => $table['#parent_options'],
          '#empty_value' => '',
          '#attributes' => array('class' => array('field-parent')),
          '#parents' => array('fields', $name, 'parent'),
        ),
        'hidden_name' => array(
          '#type' => 'hidden',
          '#default_value' => $name,
          '#attributes' => array('class' => array('field-name')),
        ),
      ),
      'empty_cell' => array(
        '#markup' => '&nbsp;',
      ),
      'format' => array(
        'type' => array(
          '#type' => 'select',
          '#title' => t('Visibility for @title', array('@title' => $extra_field['label'])),
          '#title_display' => 'invisible',
          '#options' => $extra_visibility_options,
          '#default_value' => $display['visible'] ? 'visible' : 'hidden',
          '#parents' => array('fields', $name, 'type'),
          '#attributes' => array('class' => array('field-formatter-type')),
        ),
      ),
      'settings_summary' => array(),
      'settings_edit' => array(),
    );
  }

  $form['fields'] = $table;

  // In overviews involving nested rows from contributed modules (i.e
  // field_group), the 'format type' selects can trigger a series of changes in
  // child rows. The #ajax behavior is therefore not attached directly to the
  // selects, but triggered by the client-side script through a hidden #ajax
  // 'Refresh' button. A hidden 'refresh_rows' input tracks the name of
  // affected rows.
  $form['refresh_rows'] = array('#type' => 'hidden');
  $form['refresh'] = array(
    '#type' => 'submit',
    '#value' => t('Refresh'),
    '#op' => 'refresh_table',
    '#submit' => array('field_ui_display_overview_multistep_submit'),
    '#ajax' => array(
      'callback' => 'field_ui_display_overview_multistep_js',
      'wrapper' => 'field-display-overview-wrapper',
      'effect' => 'fade',
      // The button stays hidden, so we hide the Ajax spinner too. Ad-hoc
      // spinners will be added manually by the client-side script.
      'progress' => 'none',
    ),
    '#attributes' => array('class' => array('element-invisible'))
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array('#type' => 'submit', '#value' => t('Save'));

  $form['#attached']['js'][] = backdrop_get_path('module', 'field_ui') . '/js/field_ui.js';
  $form['#attached']['css'][] = backdrop_get_path('module', 'field_ui') . '/css/field_ui.css';

  // Add tabledrag behavior.
  $form['#attached']['backdrop_add_tabledrag'][] = array('field-display-overview', 'order', 'sibling', 'field-weight');
  $form['#attached']['backdrop_add_tabledrag'][] = array('field-display-overview', 'match', 'parent', 'field-parent', 'field-parent', 'field-name');

  return $form;
}

/**
 * Form submission handler for field_ui_display_form().
 */
function field_ui_display_form_submit($form, &$form_state) {
  $form_values = $form_state['values'];
  $entity_type = $form['#entity_type'];
  $bundle = $form['#bundle'];
  $view_mode = $form['#view_mode'];

  // Save data for 'regular' fields.
  foreach ($form['#fields'] as $field_name) {
    // Retrieve the stored instance settings to merge with the incoming values.
    $instance = field_read_instance($entity_type, $field_name, $bundle);
    $values = $form_values['fields'][$field_name];
    // Get formatter settings. They lie either directly in submitted form
    // values (if the whole form was submitted while some formatter
    // settings were being edited), or have been persisted in
    // $form_state.
    $settings = array();
    if (isset($values['settings_edit_form']['settings'])) {
      $settings = $values['settings_edit_form']['settings'];
    }
    elseif (isset($form_state['formatter_settings'][$field_name])) {
      $settings = $form_state['formatter_settings'][$field_name];
    }
    elseif (isset($instance['display'][$view_mode]['settings'])) {
      $settings = $instance['display'][$view_mode]['settings'];
    }

    // Only save settings actually used by the selected formatter.
    $default_settings = field_info_formatter_settings($values['type']);
    $settings = array_intersect_key($settings, $default_settings);

    $instance['display'][$view_mode] = array(
      'label' => $values['label'],
      'type' => $values['type'],
      'weight' => $values['weight'],
      'settings' => $settings,
    );
    field_update_instance($instance);
  }

  // Get current bundle settings.
  $bundle_settings = field_bundle_settings($entity_type, $bundle);

  // Save data for 'extra' fields.
  foreach ($form['#extra'] as $name) {
    $bundle_settings['extra_fields']['display'][$name][$view_mode] = array(
      'weight' => $form_values['fields'][$name]['weight'],
      'visible' => $form_values['fields'][$name]['type'] == 'visible',
    );
  }

  // Save updated bundle settings.
  field_bundle_settings($entity_type, $bundle, $bundle_settings);

  backdrop_set_message(t('Your settings have been saved.'));
}

/**
 * Form submission handler for buttons in field_ui_display_overview_form().
 */
function field_ui_display_overview_multistep_submit($form, &$form_state) {
  $trigger = $form_state['triggering_element'];
  $op = $trigger['#op'];

  switch ($op) {
    case 'edit':
      // Store the field whose settings are currently being edited.
      $field_name = $trigger['#field_name'];
      $form_state['formatter_settings_edit'] = $field_name;
      break;

    case 'update':
      // Store the saved settings, and set the field back to 'non edit' mode.
      $field_name = $trigger['#field_name'];
      $values = $form_state['values']['fields'][$field_name]['settings_edit_form']['settings'];
      $form_state['formatter_settings'][$field_name] = $values;
      unset($form_state['formatter_settings_edit']);
      break;

    case 'cancel':
      // Set the field back to 'non edit' mode.
      unset($form_state['formatter_settings_edit']);
      break;

    case 'refresh_table':
      // If the currently edited field is one of the rows to be refreshed, set
      // it back to 'non edit' mode.
      $updated_rows = explode(' ', $form_state['values']['refresh_rows']);
      if (isset($form_state['formatter_settings_edit']) && in_array($form_state['formatter_settings_edit'], $updated_rows)) {
        unset($form_state['formatter_settings_edit']);
      }
      break;
  }

  $form_state['rebuild'] = TRUE;
}

/**
 * Ajax handler: Handles multistep buttons in field_ui_display_overview_form().
 */
function field_ui_display_overview_multistep_js($form, &$form_state) {
  $trigger = $form_state['triggering_element'];
  $op = $trigger['#op'];

  // Pick the elements that need to receive the ajax-new-content effect.
  switch ($op) {
    case 'edit':
      $updated_rows = array($trigger['#field_name']);
      $updated_columns = array('format');
      break;

    case 'update':
    case 'cancel':
      $updated_rows = array($trigger['#field_name']);
      $updated_columns = array('format', 'settings_summary', 'settings_edit');
      break;

    case 'refresh_table':
      $updated_rows = array_values(explode(' ', $form_state['values']['refresh_rows']));
      $updated_columns = array('settings_summary', 'settings_edit');
      break;
  }

  foreach ($updated_rows as $name) {
    foreach ($updated_columns as $key) {
      $element = &$form['fields'][$name][$key];
      $element['#prefix'] = '<div class="ajax-new-content">' . (isset($element['#prefix']) ? $element['#prefix'] : '');
      $element['#suffix'] = (isset($element['#suffix']) ? $element['#suffix'] : '') . '</div>';
    }
  }

  // Return the whole table.
  return $form['fields'];
}

/**
 * Populates display settings for a new view mode from the default view mode.
 *
 * When an administrator decides to use custom display settings for a view mode,
 * that view mode needs to be initialized with the display settings for the
 * 'default' view mode, which it was previously using. This helper function
 * adds the new custom display settings to this bundle's instances, and saves
 * them. It also modifies the passed-in $settings array, which the caller can
 * then save using field_bundle_settings().
 *
 * @param $entity_type
 *   The bundle's entity type.
 * @param $bundle
 *   The bundle whose view mode is being customized.
 * @param $view_mode
 *   The view mode that the administrator has set to use custom settings.
 * @param $settings
 *   An associative array of bundle settings, as expected by
 *   field_bundle_settings().
 *
 * @see field_ui_display_overview_form_submit().
 * @see field_bundle_settings()
 */
function _field_ui_add_default_view_mode_settings($entity_type, $bundle, $view_mode, &$settings) {
  // Update display settings for field instances.
  $instances = field_read_instances(array('entity_type' => $entity_type, 'bundle' => $bundle));
  foreach ($instances as $instance) {
    // If this field instance has display settings defined for this view mode,
    // respect those settings.
    if (!isset($instance['display'][$view_mode])) {
      // The instance doesn't specify anything for this view mode, so use the
      // default display settings.
      $instance['display'][$view_mode] = $instance['display']['default'];
      field_update_instance($instance);
    }
  }

  // Update display settings for 'extra fields'.
  foreach (array_keys($settings['extra_fields']['display']) as $name) {
    if (!isset($settings['extra_fields']['display'][$name][$view_mode])) {
      $settings['extra_fields']['display'][$name][$view_mode] = $settings['extra_fields']['display'][$name]['default'];
    }
  }
}

/**
 * Returns an array of field_type options.
 */
function field_ui_field_type_options() {
  $options = &backdrop_static(__FUNCTION__);

  if (!isset($options)) {
    $options = array();
    $field_types = field_info_field_types();
    $field_type_options = array();
    foreach ($field_types as $name => $field_type) {
      // Skip field types which have no widget types, or should not be add via
      // uesr interface.
      if (field_ui_widget_type_options($name) && empty($field_type['no_ui'])) {
        $options[$name] = $field_type['label'];
      }
    }
    asort($options);
  }
  return $options;
}

/**
 * Returns an array of widget type options for a field type.
 *
 * If no field type is provided, returns a nested array of all widget types,
 * keyed by field type human name.
 */
function field_ui_widget_type_options($field_type = NULL, $by_label = FALSE) {
  $options = &backdrop_static(__FUNCTION__);

  if (!isset($options)) {
    $options = array();
    $field_types = field_info_field_types();
    foreach (field_info_widget_types() as $name => $widget_type) {
      foreach ($widget_type['field types'] as $widget_field_type) {
        // Check that the field type exists.
        if (isset($field_types[$widget_field_type])) {
          $options[$widget_field_type][$name] = $widget_type['label'];
        }
      }
      asort($options[$widget_field_type]);
    }
  }

  if (isset($field_type)) {
    return !empty($options[$field_type]) ? $options[$field_type] : array();
  }
  if ($by_label) {
    $field_types = field_info_field_types();
    $options_by_label = array();
    foreach ($options as $field_type => $widgets) {
      $options_by_label[$field_types[$field_type]['label']] = $widgets;
    }
    return $options_by_label;
  }
  return $options;
}

/**
 * Returns an array of formatter options for a field type.
 *
 * If no field type is provided, returns a nested array of all formatters, keyed
 * by field type.
 */
function field_ui_formatter_options($field_type = NULL) {
  $options = &backdrop_static(__FUNCTION__);

  if (!isset($options)) {
    $field_types = field_info_field_types();
    $options = array();
    foreach (field_info_formatter_types() as $name => $formatter) {
      foreach ($formatter['field types'] as $formatter_field_type) {
        // Check that the field type exists.
        if (isset($field_types[$formatter_field_type])) {
          $options[$formatter_field_type][$name] = $formatter['label'];
        }
      }
    }
  }

  if ($field_type) {
    return !empty($options[$field_type]) ? $options[$field_type] : array();
  }
  return $options;
}

/**
 * Returns an array of existing fields to be added to a bundle.
 */
function field_ui_existing_field_options($entity_type, $bundle) {
  $info = array();
  $field_types = field_info_field_types();

  foreach (field_info_instances() as $existing_entity_type => $bundles) {
    foreach ($bundles as $existing_bundle => $instances) {
      // No need to look in the current bundle.
      if (!($existing_bundle == $bundle && $existing_entity_type == $entity_type)) {
        foreach ($instances as $instance) {
          $field = field_info_field($instance['field_name']);
          // Don't show
          // - locked fields,
          // - fields already in the current bundle,
          // - fields that cannot be added to the entity type,
          // - fields that should not be added via user interface.

          if (empty($field['locked'])
            && !field_info_instance($entity_type, $field['field_name'], $bundle)
            && (empty($field['entity_types']) || in_array($entity_type, $field['entity_types']))
            && empty($field_types[$field['type']]['no_ui'])) {
            $info[$instance['field_name']] = array(
              'type' => $field['type'],
              'type_label' => $field_types[$field['type']]['label'],
              'field' => $field['field_name'],
              'label' => $instance['label'],
              'widget_type' => $instance['widget']['type'],
            );
          }
        }
      }
    }
  }
  return $info;
}

/**
 * Form constructor for the field settings edit page.
 *
 * @see field_ui_menu()
 * @see field_ui_field_settings_form_submit()
 * @ingroup forms
 */
function field_ui_field_settings_form($form, &$form_state, $instance) {
  $bundle = $instance['bundle'];
  $entity_type = $instance['entity_type'];
  $field = field_info_field($instance['field_name']);

  backdrop_set_title($instance['label']);

  $description = '<p>' . t('These settings apply to the %field field everywhere it is used. These settings impact the way that data is stored in the database and cannot be changed once data has been created.', array('%field' => $instance['label'])) . '</p>';

  // Create a form structure for the field values.
  $form['field'] = array(
    '#type' => 'fieldset',
    '#title' => t('Field settings'),
    '#description' => $description,
    '#tree' => TRUE,
  );

  // See if data already exists for this field.
  // If so, prevent changes to the field settings.
  $has_data = field_has_data($field);

  // Build the non-configurable field values.
  $form['field']['field_name'] = array('#type' => 'value', '#value' => $field['field_name']);
  $form['field']['type'] = array('#type' => 'value', '#value' => $field['type']);
  $form['field']['module'] = array('#type' => 'value', '#value' => $field['module']);
  $form['field']['active'] = array('#type' => 'value', '#value' => $field['active']);

  // Add settings provided by the field module. The field module is
  // responsible for not returning settings that cannot be changed if
  // the field already has data.
  $form['field']['settings'] = array();
  $additions = module_invoke($field['module'], 'field_settings_form', $field, $instance, $has_data);
  if (is_array($additions)) {
    if ($has_data) {
      $form['field']['#description'] = '<div class="messages warning">' . t('There is data for this field in the database. Some field settings may no longer be changed.') . '</div>' . $form['field']['#description'];
    }
    $form['field']['settings'] = $additions;
  }
  if (empty($additions)) {
    // If there are no settings and we are in the middle of adding a field for
    // the first time, skip this page entirely and proceed to the widget
    // settings.
    $redirect = field_ui_next_destination($entity_type, $bundle);
    if (is_array($redirect)) {
      call_user_func_array('backdrop_goto', $redirect);
    }
    $form['field']['settings'] = array(
      '#markup' => t('%field has no field settings.', array('%field' => $instance['label'])),
    );
  }
  $form['#entity_type'] = $entity_type;
  $form['#bundle'] = $bundle;

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array('#type' => 'submit', '#value' => t('Save field settings'));

  return $form;
}

/**
 * Form submission handler for field_ui_field_settings_form().
 */
function field_ui_field_settings_form_submit($form, &$form_state) {
  $form_values = $form_state['values'];
  $field_values = $form_values['field'];

  // Merge incoming form values into the existing field.
  $field = field_info_field($field_values['field_name']);

  $entity_type = $form['#entity_type'];
  $bundle = $form['#bundle'];
  $instance = field_info_instance($entity_type, $field['field_name'], $bundle);

  // Update the field.
  $field = array_merge($field, $field_values);

  try {
    field_update_field($field);
    backdrop_set_message(t('Updated field %label field settings.', array('%label' => $instance['label'])));
    $form_state['redirect'] = field_ui_next_destination($entity_type, $bundle);
  }
  catch (Exception $e) {
    backdrop_set_message(t('Attempt to update field %label failed: %message.', array('%label' => $instance['label'], '%message' => $e->getMessage())), 'error');
  }
}

/**
 * Form constructor for the widget selection form.
 *
 * @see field_ui_menu()
 * @see field_ui_widget_type_form_submit()
 * @ingroup forms
 */
function field_ui_widget_type_form($form, &$form_state, $instance) {
  backdrop_set_title($instance['label']);

  $bundle = $instance['bundle'];
  $entity_type = $instance['entity_type'];
  $field_name = $instance['field_name'];

  $field = field_info_field($field_name);
  $field_type = field_info_field_types($field['type']);
  $widget_type = field_info_widget_types($instance['widget']['type']);
  $bundles = field_info_bundles();
  $bundle_label = $bundles[$entity_type][$bundle]['label'];

  $form = array(
    '#bundle' => $bundle,
    '#entity_type' => $entity_type,
    '#field_name' => $field_name,
  );

  $form['basic'] = array(
    '#type' => 'fieldset',
    '#title' => t('Change widget'),
  );
  $form['basic']['widget_type'] = array(
    '#type' => 'select',
    '#title' => t('Widget type'),
    '#required' => TRUE,
    '#options' => field_ui_widget_type_options($field['type']),
    '#default_value' => $instance['widget']['type'],
    '#description' => t('The type of form element you would like to present to the user when creating this field in the %type type.', array('%type' => $bundle_label)),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array('#type' => 'submit', '#value' => t('Continue'));

  $form['#validate'] = array();
  $form['#submit'] = array('field_ui_widget_type_form_submit');

  return $form;
}

/**
 * Form submission handler for field_ui_widget_type_form().
 */
function field_ui_widget_type_form_submit($form, &$form_state) {
  $form_values = $form_state['values'];
  $bundle = $form['#bundle'];
  $entity_type = $form['#entity_type'];
  $field_name = $form['#field_name'];

  // Retrieve the stored instance settings to merge with the incoming values.
  $instance = field_read_instance($entity_type, $field_name, $bundle);

  // Set the right module information.
  $widget_type = field_info_widget_types($form_values['widget_type']);
  $widget_module = $widget_type['module'];

  $instance['widget']['type'] = $form_values['widget_type'];
  $instance['widget']['module'] = $widget_module;

  try {
    field_update_instance($instance);
    backdrop_set_message(t('Changed the widget for field %label.', array('%label' => $instance['label'])));
  }
  catch (Exception $e) {
    backdrop_set_message(t('There was a problem changing the widget for field %label.', array('%label' => $instance['label'])), 'error');
  }

  $form_state['redirect'] = field_ui_next_destination($entity_type, $bundle);
}

/**
 * Form constructor for removing a field instance from a bundle.
 *
 * @see field_ui_menu()
 * @see field_ui_field_delete_form_submit()
 * @ingroup forms
 */
function field_ui_field_delete_form($form, &$form_state, $instance) {
  $bundle = $instance['bundle'];
  $entity_type = $instance['entity_type'];
  $field = field_info_field($instance['field_name']);

  $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);

  $form['entity_type'] = array('#type' => 'value', '#value' => $entity_type);
  $form['bundle'] = array('#type' => 'value', '#value' => $bundle);
  $form['field_name'] = array('#type' => 'value', '#value' => $instance['field_name']);

  $output = confirm_form($form,
    t('Are you sure you want to delete the field %field?', array('%field' => $instance['label'])),
    $admin_path . '/fields',
    t('If you have any content left in this field, it will be lost. This action cannot be undone.'),
    t('Delete'), t('Cancel'),
    'confirm'
  );

  if (!empty($field['locked'])) {
    unset($output['actions']['submit']);
    $output['description']['#markup'] = t('This field is <strong>locked</strong> and cannot be deleted.');
  }

  return $output;
}

/**
 * Form submission handler for field_ui_field_delete_form().
 *
 * Removes a field instance from a bundle. If the field has no more instances,
 * it will be marked as deleted too.
 */
function field_ui_field_delete_form_submit($form, &$form_state) {
  $form_values = $form_state['values'];
  $field_name = $form_values['field_name'];
  $bundle = $form_values['bundle'];
  $entity_type = $form_values['entity_type'];

  $field = field_info_field($field_name);
  $instance = field_info_instance($entity_type, $field_name, $bundle);
  $bundles = field_info_bundles();
  $bundle_label = $bundles[$entity_type][$bundle]['label'];

  if (!empty($bundle) && $field && !$field['locked'] && $form_values['confirm']) {
    field_delete_instance($instance);
    backdrop_set_message(t('The field %field has been deleted from the %type content type.', array('%field' => $instance['label'], '%type' => $bundle_label)));
  }
  else {
    backdrop_set_message(t('There was a problem removing the field %field from the %type content type.', array('%field' => $instance['label'], '%type' => $bundle_label)), 'error');
  }

  $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);
  $form_state['redirect'] = field_ui_get_destinations(array($admin_path . '/fields'));

  // Fields are purged on cron. However field module prevents disabling modules
  // when field types they provided are used in a field until it is fully
  // purged. In the case that a field has minimal or no content, a single call
  // to field_purge_batch() will remove it from the system.
  $limit = config_get('system.core', 'field_purge_batch_size');
  field_purge_batch($limit);

  // Call purge again to actually delete the instance if no data remains.
  field_purge_batch(0);
}

/**
 * Form constructor for the field instance settings form.
 *
 * @see field_ui_menu()
 * @see field_ui_field_edit_form_validate()
 * @see field_ui_field_edit_form_submit()
 * @see field_ui_field_edit_form_delete_submit()
 * @ingroup forms
 */
function field_ui_field_edit_form($form, &$form_state, $instance) {
  $bundle = $instance['bundle'];
  $entity_type = $instance['entity_type'];
  $field = field_info_field($instance['field_name']);
  $token_link = ' ' . theme('token_tree_link');

  backdrop_set_title($instance['label']);

  $form['#field'] = $field;
  $form['#instance'] = $instance;

  if (!empty($field['locked'])) {
    $form['locked'] = array(
      '#markup' => t('The field %field is locked and cannot be edited.', array('%field' => $instance['label'])),
    );
    return $form;
  }

  $widget_type = field_info_widget_types($instance['widget']['type']);
  $bundles = field_info_bundles();

  // Create a form structure for the instance values.
  $form['instance'] = array(
    '#tree' => TRUE,
    '#type' => 'fieldset',
    '#title' => t('%type settings', array('%type' => $bundles[$entity_type][$bundle]['label'])),
    '#description' => t('These settings apply only to the %field field when used in the %type type.', array(
      '%field' => $instance['label'],
      '%type' => $bundles[$entity_type][$bundle]['label'],
    )),
    // Ensure field_ui_field_edit_instance_pre_render() gets called in addition
    // to, not instead of, the #pre_render function(s) needed by all fieldsets.
    '#pre_render' => array_merge(array('field_ui_field_edit_instance_pre_render'), element_info_property('fieldset', '#pre_render', array())),
  );

  // Build the non-configurable instance values.
  $form['instance']['field_name'] = array(
    '#type' => 'value',
    '#value' => $instance['field_name'],
  );
  $form['instance']['entity_type'] = array(
    '#type' => 'value',
    '#value' => $entity_type,
  );
  $form['instance']['bundle'] = array(
    '#type' => 'value',
    '#value' => $bundle,
  );
  $form['instance']['widget']['weight'] = array(
    '#type' => 'value',
    '#value' => !empty($instance['widget']['weight']) ? $instance['widget']['weight'] : 0,
  );

  // Build the configurable instance values.
  $form['instance']['label'] = array(
    '#type' => 'textfield',
    '#title' => t('Label'),
    '#default_value' => !empty($instance['label']) ? $instance['label'] : $field['field_name'],
    '#required' => TRUE,
    '#weight' => -20,
  );

  $form['instance']['description'] = array(
    '#type' => 'textarea',
    '#title' => t('Help text'),
    '#default_value' => !empty($instance['description']) ? $instance['description'] : '',
    '#rows' => 5,
    '#description' => t('Instructions to present to the user below this field on the editing form.<br />Allowed HTML tags: @tags <br />This field supports tokens.', array('@tags' => _field_filter_xss_display_allowed_tags())) . $token_link,
    '#weight' => -10,
    '#element_validate' => array('token_element_validate'),
    '#token_types' => array(),
  );

  $form['instance']['required'] = array(
    '#type' => 'checkbox',
    '#title' => t('Required field'),
    '#default_value' => !empty($instance['required']),
    '#weight' => -5,
  );

  // Build the widget component of the instance.
  $form['instance']['widget']['type'] = array(
    '#type' => 'value',
    '#value' => $instance['widget']['type'],
  );
  $form['instance']['widget']['module'] = array(
    '#type' => 'value',
    '#value' => $widget_type['module'],
  );
  $form['instance']['widget']['active'] = array(
    '#type' => 'value',
    '#value' => !empty($field['instance']['widget']['active']) ? 1 : 0,
  );

  // Add additional field instance settings from the field module.
  $additions = module_invoke($field['module'], 'field_instance_settings_form', $field, $instance);
  if (is_array($additions)) {
    $form['instance']['settings'] = $additions;
  }

  // Add additional widget settings from the widget module.
  $additions = module_invoke($widget_type['module'], 'field_widget_settings_form', $field, $instance);
  if (is_array($additions)) {
    $form['instance']['widget']['settings'] = $additions;
    $form['instance']['widget']['active']['#value'] = 1;
  }

  // Add handling for default value if not provided by any other module.
  if (field_behaviors_widget('default value', $instance) == FIELD_BEHAVIOR_DEFAULT && empty($instance['default_value_function'])) {
    $form['instance']['default_value_widget'] = field_ui_default_value_widget($field, $instance, $form, $form_state);
  }

  $has_data = field_has_data($field);
  if ($has_data) {
    $description = '<p>' . t('These settings apply to the %field field everywhere it is used. Because the field already has data, some settings can no longer be changed.', array('%field' => $instance['label'])) . '</p>';
  }
  else {
    $description = '<p>' . t('These settings apply to the %field field everywhere it is used.', array('%field' => $instance['label'])) . '</p>';
  }

  // Create a form structure for the field values.
  $form['field'] = array(
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#title' => t('Global settings'),
    '#description' => $description,
    '#tree' => TRUE,
  );

  // Build the configurable field values.
  $cardinality = $field['cardinality'];
  $form['field']['cardinality_container'] = array(
    '#type' => 'item',
    // Reset #parents to 'field', so the additional container does not appear.
    '#parents' => array('field'),
    '#field_prefix' => '<div class="container-inline">',
    '#field_suffix' => '</div>',
    '#title' => t('Number of values'),
  );

  $form['field']['cardinality_container']['cardinality'] = array(
    '#type' => 'select',
    '#options' => array(
      'number' => t('Limited'),
      FIELD_CARDINALITY_UNLIMITED => t('Unlimited'),
    ),
    '#default_value' => ($cardinality == FIELD_CARDINALITY_UNLIMITED) ? FIELD_CARDINALITY_UNLIMITED : 'number',
  );
  $form['field']['cardinality_container']['cardinality_number'] = array(
    '#type' => 'number',
    '#default_value' => $cardinality != FIELD_CARDINALITY_UNLIMITED ? $cardinality : 1,
    '#min' => 1,
    '#step' => 1,
    '#title' => t('Number'),
    '#title_display' => 'invisible',
    '#states' => array(
      'visible' => array(
        ':input[name="field[cardinality]"]' => array('value' => 'number'),
      ),
    ),
  );
  $description = t('Maximum number of values users can enter for this field.');
  if (field_behaviors_widget('multiple values', $instance) == FIELD_BEHAVIOR_DEFAULT) {
    $description .= '<br/>' . t("'Unlimited' will provide an 'Add more' button so the users can add as many values as they like.");
  }
  $form['field']['cardinality_container']['#description'] = $description;

  // Add additional field type settings. The field type module is
  // responsible for not returning settings that cannot be changed if
  // the field already has data.
  $additions = module_invoke($field['module'], 'field_settings_form', $field, $instance, $has_data);
  if (is_array($additions)) {
    $form['field']['settings'] = $additions;
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save settings')
  );
  $form['actions']['delete'] = array(
    '#type' => 'submit',
    '#value' => t('Delete field'),
    '#submit' => array('field_ui_field_edit_form_delete_submit'),
  );
  return $form;
}

/**
 * Form submission handler for 'Delete' button in field_ui_field_edit_form().
 */
function field_ui_field_edit_form_delete_submit($form, &$form_state) {
  $destination = array();
  if (isset($_GET['destination'])) {
    $destination = backdrop_get_destination();
    unset($_GET['destination']);
  }
  $instance = $form['#instance'];
  $form_state['redirect'] = array('admin/structure/types/manage/' . $instance['bundle'] . '/fields/' . $instance['field_name'] . '/delete', array('query' => $destination));
}

/**
 * Render API callback: Merges instance, widget and other settings.
 *
 * Combines the instance, widget, and other settings into a single fieldset so
 * that elements within each group can be shown at different weights as if they
 * all had the same parent.
 *
 * This function is assigned as a #pre_render callback in
 * field_ui_field_edit_form().
 */
function field_ui_field_edit_instance_pre_render($element) {
  // Merge the widget settings into the main form.
  if (isset($element['widget']['settings'])) {
    foreach (element_children($element['widget']['settings']) as $key) {
      $element['widget_' . $key] = $element['widget']['settings'][$key];
    }
    unset($element['widget']['settings']);
  }

  // Merge the instance settings into the main form.
  if (isset($element['settings'])) {
    foreach (element_children($element['settings']) as $key) {
      $element['instance_' . $key] = $element['settings'][$key];
    }
    unset($element['settings']);
  }

  return $element;
}

/**
 * Builds the default value fieldset for a given field instance.
 */
function field_ui_default_value_widget($field, $instance, &$form, &$form_state) {
  $field_name = $field['field_name'];

  $element = array(
    '#type' => 'fieldset',
    '#title' => t('Default value'),
    '#collapsible' => FALSE,
    '#tree' => TRUE,
    '#description' => t('The default value for this field, used when creating new content.'),
    // Stick to an empty 'parents' on this form in order not to breaks widgets
    // that do not use field_widget_[field|instance]() and still access
    // $form_state['field'] directly.
    '#parents' => array(),
  );

  // Insert the widget.
  $items = $instance['default_value'];
  $instance['required'] = FALSE;
  $instance['description'] = '';

  // @todo Allow multiple values (requires more work on 'add more' JS handler).
  $element += field_default_form($instance['entity_type'], NULL, $field, $instance, LANGUAGE_NONE, $items, $element, $form_state, 0);

  return $element;
}

/**
 * Form validation handler for field_ui_field_edit_form().
 *
 * @see field_ui_field_edit_form_submit().
 */
function field_ui_field_edit_form_validate($form, &$form_state) {
  // Take the incoming values as the $instance definition, so that the 'default
  // value' gets validated using the instance settings being submitted.
  $instance = $form_state['values']['instance'];
  $field_name = $instance['field_name'];


  // Validate field cardinality.
  $cardinality = $form_state['values']['field']['cardinality'];
  $cardinality_number = $form_state['values']['field']['cardinality_number'];
  if ($cardinality === 'number' && empty($cardinality_number)) {
    form_error($form['field']['cardinality_container']['cardinality_number'], t('Number of values is required.'));
  }

  if (isset($form['instance']['default_value_widget'])) {
    $element = $form['instance']['default_value_widget'];

    $field_state = field_form_get_state($element['#parents'], $field_name, LANGUAGE_NONE, $form_state);
    $field = $field_state['field'];

    // Extract the 'default value'.
    $items = array();
    field_default_extract_form_values(NULL, NULL, $field, $instance, LANGUAGE_NONE, $items, $element, $form_state);

    // Validate the value and report errors.
    $errors = array();
    $function = $field['module'] . '_field_validate';
    if (function_exists($function)) {
      $function(NULL, NULL, $field, $instance, LANGUAGE_NONE, $items, $errors);
    }
    if (isset($errors[$field_name][LANGUAGE_NONE])) {
      // Store reported errors in $form_state.
      $field_state['errors'] = $errors[$field_name][LANGUAGE_NONE];
      field_form_set_state($element['#parents'], $field_name, LANGUAGE_NONE, $form_state, $field_state);
      // Assign reported errors to the correct form element.
      field_default_form_errors(NULL, NULL, $field, $instance, LANGUAGE_NONE, $items, $element, $form_state);
    }
  }
}

/**
 * Form submission handler for field_ui_field_edit_form().
 *
 * @see field_ui_field_edit_form_validate().
 */
function field_ui_field_edit_form_submit($form, &$form_state) {
  $instance = $form_state['values']['instance'];
  $field = $form_state['values']['field'];

  // Save field cardinality.
  $cardinality = $field['cardinality'];
  $cardinality_number = $field['cardinality_number'];
  if ($cardinality == 'number') {
    $cardinality = $cardinality_number;
  }
  $field['cardinality'] = $cardinality;

  // Update any field settings that have changed.
  $field_source = field_info_field($instance['field_name']);
  $field = array_merge($field_source, $field);
  try {
    field_update_field($field);
  }
  catch (Exception $e) {
    backdrop_set_message(t('Attempt to update field %label failed: %message.', array('%label' => $instance['label'], '%message' => $e->getMessage())), 'error');
    return;
  }

  // Handle the default value.
  if (isset($form['instance']['default_value_widget'])) {
    $element = $form['instance']['default_value_widget'];

    // Extract field values.
    $items = array();
    field_default_extract_form_values(NULL, NULL, $field, $instance, LANGUAGE_NONE, $items, $element, $form_state);
    field_default_submit(NULL, NULL, $field, $instance, LANGUAGE_NONE, $items, $element, $form_state);

    $instance['default_value'] = $items ? $items : NULL;
  }

  // Retrieve the stored instance settings to merge with the incoming values.
  $instance_source = field_read_instance($instance['entity_type'], $instance['field_name'], $instance['bundle']);
  $instance = array_merge($instance_source, $instance);
  field_update_instance($instance);

  backdrop_set_message(t('Saved %label configuration.', array('%label' => $instance['label'])));

  $form_state['redirect'] = field_ui_next_destination($instance['entity_type'], $instance['bundle']);
}

/**
 * Extracts next redirect path from an array of multiple destinations.
 *
 * @see field_ui_next_destination()
 */
function field_ui_get_destinations($destinations) {
  $path = array_shift($destinations);
  $options = backdrop_parse_url($path);
  if ($destinations) {
    $options['query']['destinations'] = $destinations;
  }
  return array($options['path'], $options);
}

/**
 * Returns the next redirect path in a multipage sequence.
 */
function field_ui_next_destination($entity_type, $bundle) {
  $destinations = !empty($_REQUEST['destinations']) ? $_REQUEST['destinations'] : array();
  if (!empty($destinations)) {
    unset($_REQUEST['destinations']);
  }
  // Remove any external URLs.
  $destinations = array_diff($destinations, array_filter($destinations, 'url_is_external'));
  if ($destinations) {
    return field_ui_get_destinations($destinations);
  }
  $admin_path = _field_ui_bundle_admin_path($entity_type, $bundle);
  return $admin_path . '/fields';
}

/**
 * Form builder: Add or edit a view mode name.
 */
function field_ui_view_mode_form($form, &$form_state, $entity_type = NULL, $bundle = NULL, $machine_name = NULL) {
  $entity_info = entity_get_info($entity_type);
  $bundle = field_extract_bundle($entity_type, $bundle);
  $path = _field_ui_bundle_admin_path($entity_type, $bundle) . '/display';

  $form['#entity_info'] = $entity_info;
  $form['#entity_type'] = $entity_type;
  $form['#bundle'] = $bundle;
  $form['#path'] = $path;
  $form['#new'] = TRUE;

  if ($machine_name != NULL) {
    $view_mode = entity_view_mode_load($entity_type, $machine_name);
    $form['#new'] = FALSE;
  }

  $form['label'] = array(
    '#type' => 'textfield',
    '#title' => t('View mode label'),
    '#default_value' => isset($view_mode['label']) ? $view_mode['label'] : '',
    '#size' => 20,
    '#states' => array(
      'visible' => array(
        ':input[name="existing"]' => array('value' => 'new'),
      ),
    ),
  );

  $form['machine_name'] = array(
    '#type' => 'machine_name',
    '#title' => t('Machine name'),
    '#default_value' => $machine_name,
    '#entity_type' => $entity_type,
    '#maxlength' => 26,
    '#required' => FALSE,
    '#description' => t('A unique machine-readable name containing letters, numbers, and underscores.'),
    '#size' => 15,
    '#machine_name' => array(
      'source' => array('label'),
      'exists' => 'entity_view_mode_exists',
    ),
  );
  if (!$form['#new']) {
    // Cannot change existing machine names.
    $form['machine_name']['#disabled'] = TRUE;
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['save'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
  );
  $form['actions']['cancel'] = array(
    '#type' => 'markup',
    '#markup' => l(t('Cancel'), $path),
  );

  return $form;
}

/**
 * Submit handler for field_ui_view_mode_form().
 */
function field_ui_view_mode_form_submit($form, &$form_state) {
  $entity_type = $form['#entity_type'];
  $bundle = $form['#bundle'];
  $path = $form['#path'];
  $view_mode_name = $form_state['values']['machine_name'];

  $view_mode = array(
    'label' => $form_state['values']['label'],
    'machine_name' => $view_mode_name,
    'is_new' => $form['#new'],
  );

  // Save the new view mode.
  entity_view_mode_save($entity_type, $view_mode);

  if ($form['#new']) {
    field_ui_view_mode_enable($entity_type, $bundle, $view_mode_name, FALSE);
  }
  else {
    backdrop_set_message(t('Saved the %view-mode view mode.', array(
      '%view-mode' => $view_mode['label']
    )));
  }

  $form_state['redirect'] = $path;
}

/**
 * Form builder: Delete a view mode.
 */
function field_ui_view_mode_delete_form($form, &$form_state, $entity_type = NULL, $bundle = NULL, $view_mode_name = NULL) {
  $bundle = field_extract_bundle($entity_type, $bundle);
  $view_mode = entity_view_mode_load($entity_type, $view_mode_name);
  $path = _field_ui_bundle_admin_path($entity_type, $bundle) . '/display';

  $form['#entity_type'] = $entity_type;
  $form['#bundle'] = $bundle;
  $form['#machine_name'] = $view_mode_name;
  $form['#view_mode'] = $view_mode;
  $form['#path'] = $path;

  // Check to see if this view mode is in use on any other bundles.
  $active = array();
  $entity_info = entity_get_info($entity_type);
  foreach ($entity_info['bundles'] as $machine => $bundle) {
    $settings = field_view_mode_settings($entity_type, $machine);
    if (isset($settings[$view_mode_name]) && $settings[$view_mode_name]) {
      $active[] = t($bundle['label']);
    }
  }

  $message = '';
  if (!empty($active)) {
    $message .= '<p>' . t('The <em>%view-mode</em> view mode has been customized in the following places:', array('%view-mode' => $view_mode['label'])) . '</p>';
    $message .= theme('item_list', array('items' => $active));
  }
  $message .= '<p>' . t('Deleting a view mode will cause any content still using it to display using the <em>Default</em> settings.') . '</p>';

  return confirm_form(
    $form,
    t('Are you sure you want to delete the %view-mode view mode?', array('%view-mode' => $view_mode['label'])),
    $path,
    $message,
    t('Delete'),
    t('Cancel')
  );
}

/**
 * Submit handler for field_ui_view_mode_delete_form().
 */
function field_ui_view_mode_delete_form_submit($form, &$form_state) {
  entity_view_mode_delete($form['#entity_type'], $form['#machine_name']);

  backdrop_set_message(t('Deleted the %view-mode view mode.', array(
    '%view-mode' => $form['#view_mode']['label'],
  )));

  $form_state['redirect'] = $form['#path'];
}

/**
 * Access callback: Checks the users access and token to enable a view mode.
 */
function field_ui_view_mode_enable_access() {
  return user_access('administer view modes') && backdrop_valid_token($_GET['token'], 'view_mode_enable');
}

/**
 * Menu callback: Enables the manage display UI for a view mode.
 */
function field_ui_view_mode_enable($entity_type, $bundle, $view_mode_name, $redirect = TRUE) {
  // Be sure we get the bundle.
  $bundle = field_extract_bundle($entity_type, $bundle);

  // Get current bundle settings.
  $bundle_settings = field_bundle_settings($entity_type, $bundle);

  // Get view mode settings.
  $view_mode_settings = field_view_mode_settings($entity_type, $bundle);

  // Initialize the newly customized view mode with the display settings
  // from the default view mode.
  _field_ui_add_default_view_mode_settings($entity_type, $bundle, $view_mode_name, $bundle_settings);
  $bundle_settings['view_modes'][$view_mode_name]['custom_settings'] = TRUE;

  // Save updated bundle settings.
  field_bundle_settings($entity_type, $bundle, $bundle_settings);

  // Set a friendly message.
  $entity_info = entity_get_info($entity_type);
  $label = $entity_info['view modes'][$view_mode_name]['label'];
  $path = _field_ui_bundle_admin_path($entity_type, $bundle) . '/display';
  $url = url($path . '/' . $view_mode_name);
  $message = t('The view mode %name can now be <a href="@url">customized</a>.', array('%name' => $label, '@url' => $url));
  backdrop_set_message($message);

  // Clear the menu cache to add view mode to administration menu.
  menu_cache_clear();

  if ($redirect) {
    // Reload the current page.
    backdrop_goto($path);
  }
}

/**
 * Confirm form: Resets a view mode to using the default display.
 */
function field_ui_view_mode_reset_form($form, &$form_state, $entity_type = NULL, $bundle = NULL, $view_mode_name = NULL) {
  $bundle = field_extract_bundle($entity_type, $bundle);

  $form['#entity_type'] = $entity_type;
  $form['#machine_name'] = $view_mode_name;
  $form['#bundle'] = $bundle;
  $view_mode = entity_view_mode_load($entity_type, $view_mode_name);
  $path = _field_ui_bundle_admin_path($entity_type, $bundle) . '/display';

  $message = '';

  // Check to see if this view mode is in use on any other bundles.
  $active = array();
  $entity_info = entity_get_info($entity_type);
  foreach ($entity_info['bundles'] as $machine => $bundle) {
    $settings = field_view_mode_settings($entity_type, $machine);
    if (isset($settings[$view_mode_name]) && $settings[$view_mode_name]) {
      $active[] = t($bundle['label']);
    }
  }

  if (!empty($active)) {
    $message .= '<p>' . t('The %view-mode view mode has been customized in the following places:', array('%view-mode' => $view_mode['label'])) . '</p>';
    $message .= theme('item_list', array('items' => $active));
  }

  $message .= '<p>' . t('A reset will cause all customizations to be lost. The <em>Default</em> view mode will be used instead.') . '</p>';

  return confirm_form(
    $form,
    t('Are you sure you want to reset the %view-mode view mode?', array('%view-mode' => $view_mode['label'])),
    $path,
    $message,
    t('Reset'),
    t('Cancel')
  );
}

/**
 * Submit handler for field_ui_view_mode_reset_form().
 */
function field_ui_view_mode_reset_form_submit($form, &$form_state) {
  $entity_type = $form['#entity_type'];
  $bundle = $form['#bundle'];
  $view_mode_name = $form['#machine_name'];

  // Save updated bundle settings.
  $bundle_settings = field_bundle_settings($entity_type, $bundle);
  $bundle_settings['view_modes'][$view_mode_name]['custom_settings'] = FALSE;
  field_bundle_settings($entity_type, $bundle, $bundle_settings);

  $path = _field_ui_bundle_admin_path($entity_type, $bundle) . '/display';

  // Set a friendly message.
  $entity_info = entity_get_info($entity_type);
  $label = $entity_info['view modes'][$view_mode_name]['label'];
  $message = t('The view mode %name will now use the <em>Default</em> settings.', array('%name' => $label));
  backdrop_set_message($message);

  // Reload the current page.
  $form_state['redirect'] = $path;
}
