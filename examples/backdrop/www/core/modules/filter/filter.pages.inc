<?php
/**
 * @file
 * User page callbacks for the Filter module.
 */

/**
 * Page callback: Displays a page with long filter tips.
 *
 * @return string
 *   An HTML-formatted string.
 *
 * @see filter_menu()
 * @see theme_filter_tips()
 */
function filter_tips_long($format = NULL) {
  if (!empty($format)) {
    $output = theme('filter_tips', array('tips' => _filter_tips($format->format, TRUE), 'long' => TRUE));
  }
  else {
    $output = theme('filter_tips', array('tips' => _filter_tips(-1, TRUE), 'long' => TRUE));
  }
  return $output;
}

/**
 * Form callback: Display a form for inserting/editing a link.
 */
function filter_format_editor_link_form($form, &$form_state, $format) {
  $form_state['format'] = $format;

  // Record the dialog selector that needs to be closed if present.
  if (isset($form_state['input']['dialogOptions']['target'])) {
    $form_state['storage']['dialog_selector'] = $form_state['input']['dialogOptions']['target'];
  }

  // Pull in any default values set by the editor.
  $values = array();
  if (isset($form_state['input']['editor_object'])) {
    $values = $form_state['input']['editor_object'];
  }

  // Set the dialog title.
  if (!empty($values['href'])) {
    backdrop_set_title(t('Edit link'));
  }
  else {
    backdrop_set_title(t('Insert link'));
  }

  // Use a "textfield" rather than "url" to allow relative paths.
  $form['href'] = array(
    '#title' => t('URL'),
    '#type' => 'textfield',
    '#element_validate' => array('_filter_format_editor_link_url_validate'),
    '#default_value' => isset($values['href']) ? $values['href'] : FALSE,
    '#parents' => array('attributes', 'href'),
    '#autocomplete_path' => 'filter-link/autocomplete',
    '#description' => t('Enter a known path, or start typing to get suggestions'),
  );
  $form['target'] = array(
    '#title' => t('Open in new window'),
    '#type' => 'checkbox',
    '#return_value' => '_blank',
    '#default_value' => isset($values['target']) ? $values['target'] : FALSE,
    '#parents' => array('attributes', 'target'),
  );
  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
    '#ajax' => array(
      'callback' => 'filter_format_editor_dialog_save',
      'event' => 'click',
    ),
  );

  return $form;
}

/**
 * Autocomplete callback for link textfield.
 */
function _filter_link_autocomplete($string) {
  $matches = array();
  $match_count = 0;
  if ($string) {
    // Get node matches.
    $results = db_select('node')
      ->fields('node', array('nid', 'title', 'status'))
      ->condition('title', db_like($string) . '%', 'LIKE')
      ->condition('status', 1)
      ->addTag('node_access')
      ->orderBy('nid', 'DESC')
      ->range(0, 10)
      ->execute();
    foreach ($results as $result) {
      $path = backdrop_get_path_alias('node/' . $result->nid);
      $matches['/' . $path] = check_plain($result->title) . ' (' . t('Content') . ')';
      $match_count++;
    }

    // Get user matches.
    if (user_access('access user profiles') && $match_count < 10) {
      $results = db_select('users')
        ->fields('users', array('uid', 'name'))
        ->condition('name', db_like($string) . '%', 'LIKE')
        ->range(0, 10 - $match_count)
        ->orderBy('uid', 'DESC')
        ->execute();
      // We need to load the User object to user user_format_name().
      $uids = array();
      foreach ($results as $result) {
        $uids[] = $result->uid;
      }
      if (!empty($uids)) {
        $users = user_load_multiple($uids);
        foreach ($users as $user) {
          $path = backdrop_get_path_alias('user/' . $user->uid);
          $matches['/' . $path] = user_format_name($user) . ' (' . t('User') . ')';
          $match_count++;
        }
      }
    }

    // Get taxonomy term matches.
    if ($match_count < 10) {
      $results = db_select('taxonomy_term_data')
        ->fields('taxonomy_term_data', array('tid', 'name'))
        ->condition('name', db_like($string) . '%', 'LIKE')
        ->addTag('taxonomy_term_access')
        ->range(0, 10 - $match_count)
        ->orderBy('tid', 'DESC')
        ->execute();
      foreach ($results as $result) {
        $path = backdrop_get_path_alias('taxonomy/term/' . $result->tid);
        $matches['/' . $path] = check_plain($result->name) . ' (' . t('Taxonomy term') . ')';
        $match_count++;
      }
    }

    // Get Views page matches.
    if ($match_count < 10) {
      $views = views_get_enabled_views();
      foreach ($views as $view) {
        foreach ($view->display as $display_id => $display) {
          if ($view->access($display_id) && $display->display_plugin == 'page' && !empty($display->display_options['path'])) {
            $path = backdrop_get_path_alias($display->display_options['path']);
            if (!path_is_admin($path)) {
              if (stripos($view->human_name, $string) !== false || (!empty($display->title) && stripos($display->title, $string) !== false)) {
                $view_display_title = (!empty($display->title)) ? $display->title : check_plain($view->human_name) . ' : ' . $display_id;
                $matches['/' . $path] = $view_display_title . ' (' . t('Views page') . ')';
                $match_count++;
              }
            }
          }
          if ($match_count == 10) {
            break 2;
          }
        }
      }
    }

    // Load layout paths
    if ($match_count < 10) {
      $menu_items = layout_get_all_configs('menu_item');
      foreach ($menu_items as $menu_item) {
        if (stripos($menu_item['name'], $string) !== false && $match_count < 10) {
          $matches['/' . $menu_item['path']] = check_plain($menu_item['name']) . ' (' . t('Layout path') . ')';
          $match_count++;
        }
      }
    }
  }
  // Allow modules to alter the matches.
  backdrop_alter('link_autocomplete', $matches, $string);

  backdrop_json_output($matches);
}

/**
 * Form callback: Display a form for inserting/editing an image.
 */
function filter_format_editor_image_form($form, &$form_state, $format) {
  $form_state['format'] = $format;

  // Record the dialog selector that needs to be closed if present.
  if (isset($form_state['input']['dialogOptions']['target'])) {
    $form_state['storage']['dialog_selector'] = $form_state['input']['dialogOptions']['target'];
  }

  // Record if image uploading is requested by the calling element.
  $element_supports_uploads = !isset($form_state['input']['dialogOptions']['uploads']) || (bool) $form_state['input']['dialogOptions']['uploads'];

  // Pull in any default values set by the editor.
  $values = array();
  if (isset($form_state['input']['editor_object'])) {
    $values = $form_state['input']['editor_object'];
  }

  // Set the dialog title and submit button label.
  if (!empty($values['src'])) {
    backdrop_set_title(t('Edit image'));
    $submit_button_label = t('Update');
  }
  else {
    backdrop_set_title(t('Insert image'));
    $submit_button_label = t('Insert');
  }

  // Construct strings to use in the upload validators.
  $upload_settings = isset($format->editor_settings['image_upload']) ? $format->editor_settings['image_upload'] : array();
  $upload_settings += array(
    'status' => 0,
    'dimensions' => array('max_width' => '', 'max_height' => ''),
    'max_size' => NULL,
    'scheme' => 'public',
    'directory' => 'inline-images',
  );

  if (!empty($upload_settings['max_dimensions']['width']) && !empty($upload_settings['max_dimensions']['height'])) {
    $max_dimensions = $upload_settings['max_dimensions']['width'] . 'x' . $upload_settings['max_dimensions']['height'];
  }
  else {
    $max_dimensions = 0;
  }
  $max_filesize = !empty($upload_settings['max_size']) ? min(parse_size($upload_settings['max_size']), file_upload_max_size()) : file_upload_max_size();
  $existing_file = !empty($values['data-file-id']) ? file_load($values['data-file-id']) : NULL;
  $fid = $existing_file ? $existing_file->fid : NULL;
  $form['image']['fid'] = array(
    '#title' => t('Image upload'),
    '#type' => 'managed_file',
    '#upload_location' => $upload_settings['scheme'] . '://' . $upload_settings['directory'],
    '#default_value' => $fid ? $fid : NULL,
    '#upload_validators' => array(
      'file_validate_extensions' => array('gif png jpg jpeg'),
      'file_validate_size' => array($max_filesize),
      'file_validate_image_resolution' => array($max_dimensions),
    ),
    '#wrapper_attributes' => array(
      'data-editor-image-toggle' => t('Image Upload'),
    ),
    '#parents' => array('fid'),
    '#weight' => -10,
    '#access' => $element_supports_uploads && $upload_settings['status'] && user_access('upload editor images'),
  );

  // Use a "textfield" rather than "url" to allow relative paths.
  $form['image']['src'] = array(
    '#title' => t('Image URL'),
    '#type' => 'textfield',
    '#element_validate' => array('_filter_format_editor_link_url_validate'),
    '#placeholder' => '/example/image.jpg',
    '#default_value' => isset($values['src']) ? $values['src'] : NULL,
    '#parents' => array('attributes', 'src'),
    '#wrapper_attributes' => array(
      'data-editor-image-toggle' => t('Image URL'),
    ),
    '#weight' => -2,
  );

  // If no current value or an existing file exists, default to showing
  // the uploading interface.
  if ($fid || empty($form['image']['src']['#default_value'])) {
    $form['image']['fid']['#weight'] = -10;
    $form['image']['src']['#default_value'] = '';
  }
  // Otherwise if editing an unmanaged file, show the raw URL field.
  else {
    $form['image']['src']['#weight'] = -10;
  }

  $form['alt'] = array(
    '#title' => t('Alternative text'),
    '#type' => 'textfield',
    '#default_value' => isset($values['alt']) ? $values['alt'] : NULL,
    '#parents' => array('attributes', 'alt'),
  );
  $form['size'] = array(
    '#title' => t('Image size'),
    '#wrapper_attributes' => array('class' => array('editor-image-size')),
    '#theme_wrappers' => array('form_element'),
  );
  $form['size']['width'] = array(
    '#title' => t('Width'),
    '#title_display' => 'attribute',
    '#type' => 'number',
    '#default_value' => isset($values['width']) ? $values['width'] : NULL,
    '#min' => 1,
    '#max' => 99999,
    '#attributes' => array('placeholder' => t('width')),
    '#parents' => array('attributes', 'width'),
    '#field_suffix' => ' &times; ',
  );
  $form['size']['height'] = array(
    '#title' => t('Height'),
    '#title_display' => 'attribute',
    '#type' => 'number',
    '#default_value' => isset($values['height']) ? $values['height'] : NULL,
    '#min' => 1,
    '#max' => 99999,
    '#attributes' => array('placeholder' => t('height')),
    '#parents' => array('attributes', 'height'),
    '#field_suffix' => ' ' . t('pixels')
  );
  $form['align'] = array(
    '#title' => t('Align'),
    '#type' => 'radios',
    '#default_value' => isset($values['data-align']) ? $values['data-align'] : 'none',
    '#options' => array(
      'none' => t('None'),
      'left' => t('Left'),
      'center' => t('Center'),
      'right' => t('Right'),
    ),
    '#wrapper_attributes' => array('class' => array('editor-image-align')),
    '#parents' => array('attributes', 'data-align'),
    '#access' => !empty($format->filters['filter_image_align']->status),
  );
  $form['caption'] = array(
    '#title' => t('Add a caption'),
    '#type' => 'checkbox',
    '#default_value' => (isset($values['data-has-caption']) && strcmp($values['data-has-caption'], 'false') !== 0) ? (bool) $values['data-has-caption'] : FALSE,
    '#parents' => array('attributes', 'data-has-caption'),
    '#access' => !empty($format->filters['filter_image_caption']->status),
  );

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => $submit_button_label,
    '#ajax' => array(
      'callback' => 'filter_format_editor_dialog_save',
      'event' => 'click',
    ),
  );

  return $form;
}

/**
 * Submit handler for filter_format_editor_image_form().
 */
function filter_format_editor_image_form_submit($form, &$form_state) {
  // Image source overrides file uploads, as the values are emptied out when
  // hidden by JavaScript.
  if (!empty($form_state['values']['attributes']['src'])) {
    $form_state['values']['fid'] = NULL;
    $form_state['values']['attributes']['data-file-id'] = NULL;
  }
  // Convert any uploaded files from the FID values to the src attribute.
  if (!empty($form_state['values']['fid'])) {
    $fid = $form_state['values']['fid'];
    $file = file_load($fid);

    // Try to make a local path if possible for better portability.
    $url = file_create_url($file->uri);
    $url = str_replace($GLOBALS['base_url'], '', $url);

    $form_state['values']['attributes']['src'] = $url;
    $form_state['values']['attributes']['data-file-id'] = $fid;
    unset($form_state['values']['fid']);
  }
}

/**
 * Form AJAX callback. Sends the save editor AJAX command and closes the dialog.
 *
 * @see filter_format_editor_link_form()
 * @see filter_format_editor_image_form()
 */
function filter_format_editor_dialog_save($form, &$form_state) {
  $dialog_selector = '#backdrop-dialog';
  if (isset($form_state['storage']['dialog_selector'])) {
    $dialog_selector = $form_state['storage']['dialog_selector'];
  }

  $commands = array();
  $errors = form_get_errors();
  if (!empty($errors)) {
    $error_messages = theme('status_messages');
    $rendered_form = backdrop_render($form);
    $commands[] = ajax_command_remove('.editor-dialog .messages');
    $commands[] = ajax_command_replace('.editor-dialog form', $rendered_form);
    $commands[] = ajax_command_prepend('.editor-dialog .ui-dialog-content', $error_messages);
  }
  else {
    $commands[] = array(
      'command' => 'editorDialogSave',
      'values' => $form_state['values'],
    );
    $commands[] = ajax_command_close_dialog($dialog_selector);
  }
  return array(
    '#type' => 'ajax',
    '#commands' => $commands,
  );
}

/**
 * Element validation function.
 */
function _filter_format_editor_link_url_validate(&$element, &$form_state) {
  $value = trim($element['#value']);
  form_set_value($element, $value, $form_state);

  // Unlike #type = 'url' validation, we allow both relative and absolute paths.
  if ($value !== '' && !valid_url($value, TRUE) && !valid_url($value, FALSE)) {
    form_error($element, t('The URL %url is not valid.', array('%url' => $value)));
  }
}
