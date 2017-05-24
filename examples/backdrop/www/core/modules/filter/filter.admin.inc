<?php

/**
 * @file
 * Administrative page callbacks for the Filter module.
 */

/**
 * Page callback: Form constructor for a form to list and reorder text formats.
 *
 * @ingroup forms
 * @see filter_menu()
 * @see filter_admin_overview_submit()
 */
function filter_admin_overview($form) {
  // Overview of all formats.
  $formats = filter_formats();
  $fallback_format = filter_fallback_format();
  $editors = filter_get_editors();

  $form['#tree'] = TRUE;
  foreach ($formats as $id => $format) {
    $links = array();
    $links['configure'] = array(
      'title' => t('Configure'),
      'href' => "admin/config/content/formats/$id",
    );
    // Check whether this is the fallback text format. This format is available
    // to all roles and cannot be disabled via the admin interface.
    $form['formats'][$id]['#is_fallback'] = ($id == $fallback_format);
    if ($form['formats'][$id]['#is_fallback']) {
      $form['formats'][$id]['name'] = array('#markup' => $format->name);
      $roles_markup = t('Fallback format. Used if a role has access to no other formats.');
    }
    else {
      $form['formats'][$id]['name'] = array('#markup' => check_plain($format->name));
      $roles = array();
      foreach (filter_get_roles_by_format($format) as $role_name) {
        $role = user_role_load($role_name);
        $roles[] = check_plain($role->label);
      }
      $roles_markup = $roles ? implode(', ', $roles) : t('No roles may use this format');
      $links['disable'] = array(
        'title' => t('Disable'),
        'href' => "admin/config/content/formats/$id/disable",
      );
    }
    $form['formats'][$id]['editor'] = array(
      '#markup' => isset($editors[$format->editor]) ? check_plain($editors[$format->editor]['label']) : t('None'),
    );
    $form['formats'][$id]['roles'] = array(
      '#markup' => $roles_markup,
    );
    $form['formats'][$id]['operations'] = array(
      '#type' => 'operations',
      '#links' => $links,
    );
    $form['formats'][$id]['weight'] = array(
      '#type' => 'weight',
      '#title' => t('Weight for @title', array('@title' => $format->name)),
      '#title_display' => 'invisible',
      '#default_value' => $format->weight,
    );
  }
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array('#type' => 'submit', '#value' => t('Save changes'));
  return $form;
}

/**
 * Form submission handler for filter_admin_overview().
 */
function filter_admin_overview_submit($form, &$form_state) {
  $formats = filter_formats();
  foreach ($form_state['values']['formats'] as $id => $data) {
    if (is_array($data) && isset($data['weight']) && $data['weight'] != $formats[$id]->weight) {
      // Update the weight of this filter.
      $formats[$id]->weight = $data['weight'];
      filter_format_save($formats[$id]);
    }
  }
  filter_formats_reset();
  backdrop_set_message(t('The text format ordering has been saved.'));
}

/**
 * Page callback: Displays the text format add/edit form.
 *
 * @param object|null $format
 *   (optional) An object representing a format, with the following properties:
 *   - format: A machine-readable name representing the ID of the text format
 *     to save. If this corresponds to an existing text format, that format
 *     will be updated; otherwise, a new format will be created.
 *   - name: The title of the text format.
 *   - cache: (optional) An integer indicating whether the text format is
 *     cacheable (1) or not (0). Defaults to 1.
 *   - status: (optional) An integer indicating whether the text format is
 *     enabled (1) or not (0). Defaults to 1.
 *   - weight: (optional) The weight of the text format, which controls its
 *     placement in text format lists. If omitted, the weight is set to 0.
 *     Defaults to NULL.
 *
 * @return
 *   A form array.
 *
 * @see filter_menu()
 */
function filter_admin_format_page($format = NULL) {
  if (!isset($format->name)) {
    backdrop_set_title(t('Add text editor'));
    $format = (object) array(
      'format' => NULL,
      'name' => '',
      'editor' => '',
      'editor_settings' => array(),
      'cache' => 1,
      'status' => 1,
      'is_new' => TRUE,
      'filters' => array(),
    );
  }
  return backdrop_get_form('filter_admin_format_form', $format);
}

/**
 * Form constructor for the text format add/edit form.
 *
 * @param $format
 *   A format object having the properties:
 *   - format: A machine-readable name representing the ID of the text format to
 *     save. If this corresponds to an existing text format, that format will be
 *     updated; otherwise, a new format will be created.
 *   - name: The title of the text format.
 *   - cache: An integer indicating whether the text format is cacheable (1) or
 *     not (0). Defaults to 1.
 *   - status: (optional) An integer indicating whether the text format is
 *     enabled (1) or not (0). Defaults to 1.
 *   - weight: (optional) The weight of the text format, which controls its
 *     placement in text format lists. If omitted, the weight is set to 0.
 *
 * @see filter_admin_format_form_validate()
 * @see filter_admin_format_form_submit()
 * @ingroup forms
 */
function filter_admin_format_form($form, &$form_state, $format) {
  $is_fallback = ($format->format == filter_fallback_format());
  $editors = filter_get_editors();
  if (isset($form_state['editor_info'])) {
    $editor_info = $form_state['editor_info'];
  }
  else {
    $editor_info = ($format->editor && isset($editors[$format->editor])) ? $editors[$format->editor] : NULL;
  }

  $form_state['format'] = $format;
  $form_state['editor_info'] = $editor_info;
  $form['#validate'] = array();
  $form['#submit'] = array();
  $form['#tree'] = TRUE;
  $form['#attached']['library'][] = array('filter', 'filter.admin');

  $form['name'] = array(
    '#type' => 'textfield',
    '#title' => t('Name'),
    '#default_value' => $format->name,
    '#required' => TRUE,
    '#weight' => -20,
  );
  $form['format'] = array(
    '#type' => 'machine_name',
    '#required' => TRUE,
    '#default_value' => $format->format,
    '#maxlength' => 255,
    '#disabled' => !empty($format->format),
    '#machine_name' => array(
      'exists' => 'filter_format_exists',
    ),
    '#weight' => -19,
  );

  // Build the list of all available editors.
  $editor_options = array('' => t('None'));
  foreach ($editors as $editor_name => $editor) {
    $editor_options[$editor_name] = $editor['label'];
  }

  // Associate an editor with this format.
  $editor_info = $form_state['editor_info'];
  if ($editor_info) {
    // Load the associated editor callbacks file, if any.
    if (!empty($editor_info['file'])) {
      $filepath = $editor_info['file'];
      $extension = substr($filepath, strrpos($filepath, '.') + 1);
      $filepath = substr($filepath, 0, strrpos($filepath, '.'));
      form_load_include($form_state, $extension, $editor_info['module'], $filepath);
    }
  }

  $form['editor'] = array(
    '#weight' => -9,
  );
  $form['editor']['editor'] = array(
    '#type' => 'select',
    '#title' => t('Text editor'),
    '#options' => $editor_options,
    '#empty_option' => t('None'),
    '#default_value' => $format->editor ? $format->editor : '',
    '#ajax' => array(
      'trigger_as' => array('name' => 'editor_configure'),
      'callback' => 'filter_admin_format_editor_ajax',
      'wrapper' => 'editor-settings-wrapper',
    ),
    '#parents' => array('editor'),
  );
  $form['editor']['configure'] = array(
    '#type' => 'submit',
    '#name' => 'editor_configure',
    '#value' => t('Configure editor'),
    '#limit_validation_errors' => array(array('editor')),
    '#submit' => array('filter_admin_format_editor_submit'),
    '#ajax' => array(
      'callback' => 'filter_admin_format_editor_ajax',
      'wrapper' => 'editor-settings-wrapper',
    ),
    '#attributes' => array('class' => array('js-hide')),
    '#parents' => array('editor_configure'),
  );

  // If there aren't any options (other than "None"), disable the select list.
  if (empty($editor_options)) {
    $form['editor']['editor']['#disabled'] = TRUE;
    $form['editor']['editor']['#description'] = t('This option is disabled because no modules that provide a text editor are currently enabled.');
  }

  $form['editor_settings'] = array(
    '#tree' => TRUE,
    '#weight' => -8,
    '#type' => 'container',
    '#id' => 'editor-settings-wrapper',
  );

  // Populate editor defaults.
  if (!empty($editor_info['default settings'])) {
    $format->editor_settings += $editor_info['default settings'];
  }

  // Add editor-specific validation and submit handlers.
  if (!empty($editor_info['settings callback'])) {
    $function = $editor_info['settings callback'];
    $form['editor_settings'] = array_merge($function($form, $form_state, $format), $form['editor_settings']);
    $form['editor_settings']['#parents'] = array('editor_settings');
  }

  // Add user role access selection.
  $form['roles'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Roles'),
    '#options' => array_map('check_plain', user_roles()),
    '#disabled' => $is_fallback,
  );
  if ($is_fallback) {
    $form['roles']['#description'] = t('All roles for this text format must be enabled and cannot be changed.');
  }
  if (!empty($format->format)) {
    // If editing an existing text format, pre-select its current permissions.
    $form['roles']['#default_value'] = filter_get_roles_by_format($format);
  }
  elseif ($admin_role = config_get('system.core', 'user_admin_role')) {
    // If adding a new text format and the site has an administrative role,
    // pre-select that role so as to grant administrators access to the new
    // text format permission by default.
    $form['roles']['#default_value'] = array($admin_role);
  }

  // Retrieve available filters and load all configured filters for existing
  // text formats.
  $all_filter_info = filter_get_filters();
  $filters = $format->filters;

  // Prepare filters for form sections.
  foreach ($all_filter_info as $name => $filter_info) {
    // Create an empty filter object for new/unconfigured filters.
    if (!isset($filters[$name])) {
      $filters[$name] = (object) array(
        'format' => $format->format,
        'module' => $filter_info['module'],
        'name' => $name,
        'status' => 0,
        'weight' => $filter_info['weight'],
        'settings' => isset($filter_info['default settings']) ? $filter_info['default settings'] : array(),
      );
    }
  }
  $form['#filters'] = $filters;

  // Filter status.
  $form['filters']['status'] = array(
    '#type' => 'item',
    '#title' => t('Enabled filters'),
    '#prefix' => '<div id="filters-status-wrapper">',
    '#suffix' => '</div>',
  );
  foreach ($all_filter_info as $name => $filter_info) {
    $form['filters']['status'][$name] = array(
      '#type' => 'checkbox',
      '#title' => $filter_info['title'],
      '#default_value' => $filters[$name]->status,
      '#parents' => array('filters', $name, 'status'),
      '#description' => $filter_info['description'],
      '#weight' => $filter_info['weight'],
    );
  }

  // Filter order (tabledrag).
  $form['filters']['order'] = array(
    '#type' => 'item',
    '#title' => t('Filter processing order'),
    '#theme' => 'filter_admin_format_filter_order',
  );
  foreach ($all_filter_info as $name => $filter_info) {
    $form['filters']['order'][$name]['filter'] = array(
      '#markup' => $filter_info['title'],
    );
    $form['filters']['order'][$name]['weight'] = array(
      '#type' => 'weight',
      '#title' => t('Weight for @title', array('@title' => $filter_info['title'])),
      '#title_display' => 'invisible',
      '#delta' => 50,
      '#default_value' => $filters[$name]->weight,
      '#parents' => array('filters', $name, 'weight'),
    );
    $form['filters']['order'][$name]['#weight'] = $filters[$name]->weight;
  }

  // Filter settings.
  $form['filter_settings_title'] = array(
    '#type' => 'item',
    '#title' => t('Filter settings'),
  );
  $form['filter_settings'] = array(
    '#type' => 'vertical_tabs',
  );

  foreach ($all_filter_info as $name => $filter_info) {
    if (isset($filter_info['settings callback'])) {
      $function = $filter_info['settings callback'];
      $settings_form = $function($form, $form_state, $filters[$name], $format);
      if (!empty($settings_form)) {
        $form['filters']['settings'][$name] = array(
          '#type' => 'fieldset',
          '#title' => $filter_info['title'],
          '#parents' => array('filters', $name, 'settings'),
          '#weight' => $filter_info['weight'],
          '#group' => 'filter_settings',
        );
        $form['filters']['settings'][$name] += $settings_form;
      }
    }
  }

  $form['#validate'][] = 'filter_admin_format_form_validate';
  $form['#submit'][] = 'filter_admin_format_form_submit';

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Form validation handler for filter_admin_format_form().
 *
 * @see filter_admin_format_form_submit()
 */
function filter_admin_format_form_validate($form, &$form_state) {
  $format_format = trim($form_state['values']['format']);
  $format_name = trim($form_state['values']['name']);

  // Ensure that the values to be saved later are exactly the ones validated.
  form_set_value($form['format'], $format_format, $form_state);
  form_set_value($form['name'], $format_name, $form_state);

  $formats = filter_formats();
  foreach ($formats as $format) {
    if ($format->format !== $format_format && $format->name === $format_name) {
      form_set_error('name', t('Text format names must be unique. A format named %name already exists.', array('%name' => $format_name)));
    }
  }
}

/**
 * AJAX callback for filter_admin_format_form().
 */
function filter_admin_format_editor_ajax($form, $form_state) {
  $commands = array();
  $commands[] = ajax_command_replace('#editor-settings-wrapper', backdrop_render($form['editor_settings']));
  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * Form submission handler for filter_admin_format_form().
 *
 * Sets the editor_info property so that the form can be AJAX-updated.
 */
function filter_admin_format_editor_submit($form, &$form_state) {
  $editor_name = $form_state['values']['editor'];
  $editors = filter_get_editors();
  if ($editor_name && isset($editors[$editor_name])) {
    $form_state['editor_info'] = $editors[$editor_name];
  }
  else {
    $form_state['editor_info'] = array();
  }
  $form_state['rebuild'] = TRUE;
}

/**
 * Form submission handler for filter_admin_format_form().
 *
 * @see filter_admin_format_form_validate()
 */
function filter_admin_format_form_submit($form, &$form_state) {
  // Remove unnecessary values.
  form_state_values_clean($form_state);
  unset($form_state['values']['filter_settings']);
  unset($form_state['values']['actions']);

  // Add the submitted form values to the text format, and save it.
  $format = $form_state['format'];
  foreach ($form_state['values'] as $key => $value) {
    $format->$key = $value;
  }

  // If not saving an editor, do not save any settings.
  if (!$format->editor) {
    $format->editor_settings = array();
  }

  $status = filter_format_save($format);

  // Save user permissions.
  if ($permission = filter_permission_name($format)) {
    foreach ($format->roles as $rid => $enabled) {
      user_role_change_permissions($rid, array($permission => $enabled));
    }
  }

  switch ($status) {
    case SAVED_NEW:
      backdrop_set_message(t('Added text format %format.', array('%format' => $format->name)));
      break;

    case SAVED_UPDATED:
      backdrop_set_message(t('Updated text format %format.', array('%format' => $format->name)));
      break;
  }

  $form_state['redirect'] = 'admin/config/content/formats';
}

/**
 * Form constructor for the text format deletion confirmation form.
 *
 * @param $format
 *   An object representing a text format.
 *
 * @see filter_menu()
 * @see filter_admin_disable_submit()
 * @ingroup forms
 */
function filter_admin_disable($form, &$form_state, $format) {
  $form_state['format'] = $format;

  return confirm_form($form,
    t('Are you sure you want to disable the text format %format?', array('%format' => $format->name)),
    'admin/config/content/formats',
    t('Disabled text formats are completely removed from the administrative interface, and any content stored with that format will not be displayed. This action cannot be undone.'),
    t('Disable')
  );
}

/**
 * Form submission handler for filter_admin_disable().
 */
function filter_admin_disable_submit($form, &$form_state) {
  $format = $form_state['format'];

  filter_format_disable($format);
  backdrop_set_message(t('Disabled text format %format.', array('%format' => $format->name)));
  $form_state['redirect'] = 'admin/config/content/formats';
}

/**
 * Subform constructor to configure the text editor's image upload settings.
 *
 * Each text editor plugin that is configured to offer the ability to insert
 * images and uses EditorImageDialog for that, should use this form to update
 * the text editor's configuration so that EditorImageDialog knows whether it
 * should allow the user to upload images.
 *
 * @param $format
 *   The text format that is being edited.
 *
 * @return array
 *   The image upload settings form.
 *
 * @ingroup forms
 */
function filter_editor_image_upload_settings_form($format) {
  // Defaults.
  $settings = isset($format->editor_settings['image_upload']) ? $format->editor_settings['image_upload'] : array();
  $settings += array(
    'status' => FALSE,
    'scheme' => file_default_scheme(),
    'directory' => 'inline-images',
    'max_size' => '',
    'max_dimensions' => array('width' => '', 'height' => ''),
  );

  $form['status'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable image uploads'),
    '#default_value' => $settings['status'],
    '#attributes' => array(
      'data-editor-image-upload' => 'status',
    ),
  );
  $show_if_image_uploads_enabled = array(
    'visible' => array(
      ':input[data-editor-image-upload="status"]' => array('checked' => TRUE),
    ),
  );

  // Any visible, writable wrapper can potentially be used for uploads,
  // including a remote file system that integrates with a CDN.
  $stream_wrappers = file_get_stream_wrappers(STREAM_WRAPPERS_WRITE_VISIBLE);
  foreach ($stream_wrappers as $scheme => $info) {
    $options[$scheme] = $info['description'];
  }
  if (!empty($options)) {
    $form['scheme'] = array(
      '#type' => 'radios',
      '#title' => t('File storage'),
      '#default_value' => $settings['scheme'],
      '#options' => $options,
      '#states' => $show_if_image_uploads_enabled,
      '#access' => count($options) > 1,
    );
  }
  // Set data- attributes with human-readable names for all possible stream
  // wrappers, so that drupal.ckeditor.drupalimage.admin's summary rendering
  // can use that.
  foreach ($stream_wrappers as $scheme => $info) {
    $form['scheme'][$scheme]['#attributes']['data-label'] = t('Storage: @name', array('@name' => $info['name']));
  }

  $form['directory'] = array(
    '#type' => 'textfield',
    '#default_value' => $settings['directory'],
    '#title' => t('Upload directory'),
    '#description' => t("A directory relative to the files directory where uploaded images will be stored."),
    '#states' => $show_if_image_uploads_enabled,
  );

  $default_max_size = format_size(file_upload_max_size());
  $form['max_size'] = array(
    '#type' => 'textfield',
    '#default_value' => $settings['max_size'],
    '#title' => t('Maximum file size'),
    '#description' => t('If this is left empty, then the file size will be limited by the PHP maximum upload size of @size.', array('@size' => $default_max_size)),
    '#maxlength' => 20,
    '#size' => 10,
    '#placeholder' => $default_max_size,
    '#states' => $show_if_image_uploads_enabled,
  );

  $form['max_dimensions'] = array(
    '#type' => 'item',
    '#title' => t('Maximum dimensions'),
    '#field_prefix' => '<div class="container-inline clearfix">',
    '#field_suffix' => '</div>',
    '#description' => t('Images larger than these dimensions will be scaled down.'),
    '#states' => $show_if_image_uploads_enabled,
  );
  $form['max_dimensions']['width'] = array(
    '#title' => t('Width'),
    '#title_display' => 'invisible',
    '#type' => 'number',
    '#default_value' => $settings['max_dimensions']['width'],
    '#size' => 8,
    '#maxlength' => 8,
    '#min' => 1,
    '#max' => 99999,
    '#placeholder' => 'width',
    '#field_suffix' => ' x ',
    '#states' => $show_if_image_uploads_enabled,
  );
  $form['max_dimensions']['height'] = array(
    '#title' => t('Height'),
    '#title_display' => 'invisible',
    '#type' => 'number',
    '#default_value' => $settings['max_dimensions']['height'],
    '#size' => 8,
    '#maxlength' => 8,
    '#min' => 1,
    '#max' => 99999,
    '#placeholder' => 'height',
    '#field_suffix' => 'pixels',
    '#states' => $show_if_image_uploads_enabled,
  );

  return $form;
}
