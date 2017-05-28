<?php

/**
 * @file
 * Administration pages for image settings.
 */

/**
 * Menu callback; Listing of all current image styles.
 */
function image_style_list() {
  $page = array();

  $styles = image_styles();
  $page['image_style_list'] = array(
    '#markup' => theme('image_style_list', array('styles' => $styles)),
    '#attached' => array(
      'css' => array(backdrop_get_path('module', 'image') . '/css/image.admin.css' => array()),
    ),
  );

  return $page;

}

/**
 * Form builder; Edit an image style name and effects order.
 *
 * @param $form_state
 *   An associative array containing the current state of the form.
 * @param $style
 *   An image style array.
 * @ingroup forms
 * @see image_style_form_submit()
 */
function image_style_form($form, &$form_state, $style) {
  $title = t('Edit %name style', array('%name' => $style['label']));
  backdrop_set_title($title, PASS_THROUGH);

  $form_state['image_style'] = $style;
  $form['#tree'] = TRUE;
  $form['#attached']['css'][backdrop_get_path('module', 'image') . '/css/image.admin.css'] = array();

  // Show the thumbnail preview.
  $form['preview'] = array(
    '#type' => 'item',
    '#title' => t('Preview'),
    '#markup' => theme('image_style_preview', array('style' => $style)),
  );

  // Show the Image Style label.
  $form['label'] = array(
    '#type' => 'textfield',
    '#title' => t('Image style name'),
    '#default_value' => $style['label'],
    '#required' => TRUE,
  );

  // Allow the name of the style to be changed, unless this style is
  // provided by a module's hook_default_image_styles().
  $form['name'] = array(
    '#type' => 'machine_name',
    '#size' => '64',
    '#default_value' => $style['name'],
    '#disabled' => $style['storage'] !== IMAGE_STORAGE_NORMAL,
    '#description' => t('The name is used in URLs for generated images. Use only lowercase alphanumeric characters, underscores (_), and hyphens (-).'),
    '#required' => TRUE,
    '#machine_name' => array(
      'exists' => 'image_style_load',
      'source' => array('label'),
      'replace_pattern' => '[^0-9a-z_\-]',
      'error' => t('Please only use lowercase alphanumeric characters, underscores (_), and hyphens (-) for style names.'),
    ),
  );

  // Build the list of existing image effects for this image style.
  $form['effects'] = array(
    '#theme' => 'image_style_effects',
  );
  foreach ($style['effects'] as $key => $effect) {
    $form['effects'][$key]['#weight'] = isset($form_state['input']['effects']) ? $form_state['input']['effects'][$key]['weight'] : NULL;
    $form['effects'][$key]['label'] = array(
      '#markup' => $effect['label'],
    );
    $form['effects'][$key]['summary'] = array(
      '#markup' => isset($effect['summary theme']) ? theme($effect['summary theme'], array('data' => $effect['data'])) : '',
    );
    $form['effects'][$key]['weight'] = array(
      '#type' => 'weight',
      '#title' => t('Weight for @title', array('@title' => $effect['label'])),
      '#title_display' => 'invisible',
      '#default_value' => $effect['weight'],
    );
    $links = array();
    if (isset($effect['form callback'])) {
      $links['edit'] = array(
        'title' => t('Edit'),
        'href' => 'admin/config/media/image-styles/edit/' . $style['name'] . '/effects/' . $key,
      );
    }
    $links['delete'] = array(
      'title' => t('Delete'),
      'href' => 'admin/config/media/image-styles/edit/' . $style['name'] . '/effects/' . $key . '/delete',
    );
    $form['effects'][$key]['operations'] = array(
      '#type' => 'operations',
      '#links' => $links,
    );
  }

  // Build the new image effect addition form and add it to the effect list.
  $new_effect_options = array();
  foreach (image_effect_definitions() as $effect => $definition) {
    $new_effect_options[$effect] = check_plain($definition['label']);
  }
  $form['effects']['new'] = array(
    '#tree' => FALSE,
    '#weight' => isset($form_state['input']['weight']) ? $form_state['input']['weight'] : NULL,
  );
  $form['effects']['new']['new'] = array(
    '#type' => 'select',
    '#title' => t('Effect'),
    '#title_display' => 'invisible',
    '#options' => $new_effect_options,
    '#empty_option' => t('Select a new effect'),
  );
  $form['effects']['new']['weight'] = array(
    '#type' => 'weight',
    '#title' => t('Weight for new effect'),
    '#title_display' => 'invisible',
    '#default_value' => count($form['effects']) - 1,
  );
  $form['effects']['new']['add'] = array(
    '#type' => 'submit',
    '#value' => t('Add'),
    '#validate' => array('image_style_form_add_validate'),
    '#submit' => array('image_style_form_submit', 'image_style_form_add_submit'),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Update style'),
  );

  return $form;
}

/**
 * Validate handler for adding a new image effect to an image style.
 */
function image_style_form_add_validate($form, &$form_state) {
  if (!$form_state['values']['new']) {
    form_error($form['effects']['new']['new'], t('Select an effect to add.'));
  }
}

/**
 * Submit handler for adding a new image effect to an image style.
 */
function image_style_form_add_submit($form, &$form_state) {
  $style = $form_state['image_style'];
  // Check if this field has any configuration options.
  $effect = image_effect_definition_load($form_state['values']['new']);

  // Load the configuration form for this option.
  if (isset($effect['form callback'])) {
    $path = 'admin/config/media/image-styles/edit/' . $form_state['image_style']['name'] . '/add/' . $form_state['values']['new'];
    $form_state['redirect'] = array($path, array('query' => array('weight' => $form_state['values']['weight'])));
  }
  // If there's no form, immediately add the image effect.
  else {
    $effect = array(
      'name' => $effect['name'],
      'data' => array(),
      'weight' => $form_state['values']['weight'],
    );
    image_effect_save($style['name'], $effect);
    backdrop_set_message(t('The image effect was successfully applied.'));
  }
}

/**
 * Submit handler for saving an image style.
 */
function image_style_form_submit($form, &$form_state) {
  $style = $form_state['image_style'];

  // Update the image style.
  $style['label'] = $form_state['values']['label'];
  if (isset($form_state['values']['name']) && $style['name'] != $form_state['values']['name']) {
    $style['old_name'] = $style['name'];
    $style['name'] = $form_state['values']['name'];
  }

  // Update image effect weights.
  if (!empty($form_state['values']['effects'])) {
    foreach ($form_state['values']['effects'] as $ieid => $effect_data) {
      if (isset($style['effects'][$ieid])) {
        $effect = array(
          'name' => $style['effects'][$ieid]['name'],
          'data' => $style['effects'][$ieid]['data'],
          'weight' => $effect_data['weight'],
        );
        $style['effects'][$ieid] = $effect;
      }
    }
  }

  image_style_save($style);
  if ($form_state['values']['op'] == t('Update style')) {
    backdrop_set_message(t('Changes to the style have been saved.'));
  }
  $form_state['redirect'] = 'admin/config/media/image-styles/edit/' . $style['name'];
}

/**
 * Form builder; Form for adding a new image style.
 *
 * @ingroup forms
 * @see image_style_add_form_submit()
 */
function image_style_add_form($form, &$form_state) {
  $form['label'] = array(
    '#type' => 'textfield',
    '#title' => t('Style name'),
    '#default_value' => '',
    '#required' => TRUE,
  );
  $form['name'] = array(
    '#type' => 'machine_name',
    '#description' => t('The name is used in URLs for generated images. Use only lowercase alphanumeric characters, underscores (_), and hyphens (-).'),
    '#size' => '64',
    '#required' => TRUE,
    '#machine_name' => array(
      'exists' => 'image_style_load',
      'source' => array('label'),
      'replace_pattern' => '[^0-9a-z_\-]',
      'error' => t('Please only use lowercase alphanumeric characters, underscores (_), and hyphens (-) for style names.'),
    ),
  );

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Create new style'),
  );

  return $form;
}

/**
 * Submit handler for adding a new image style.
 */
function image_style_add_form_submit($form, &$form_state) {
  $style = array(
    'name' => $form_state['values']['name'],
    'label' => $form_state['values']['label'],
  );
  $style = image_style_save($style);
  backdrop_set_message(t('Style %name was created.', array('%name' => $style['label'])));
  $form_state['redirect'] = 'admin/config/media/image-styles/edit/' . $style['name'];
}

/**
 * Form builder; Form for deleting an image style.
 *
 * @param $style
 *   An image style array.
 *
 * @ingroup forms
 * @see image_style_delete_form_submit()
 */
function image_style_delete_form($form, &$form_state, $style) {
  $form_state['image_style'] = $style;

  $replacement_styles = array_diff_key(image_style_options(TRUE, PASS_THROUGH), array($style['name'] => ''));
  $form['replacement'] = array(
    '#title' => t('Replacement style'),
    '#type' => 'select',
    '#options' => $replacement_styles,
    '#empty_option' => t('No replacement, just delete'),
  );

  return confirm_form(
    $form,
    t('Optionally select a style before deleting %style', array('%style' => $style['label'])),
    'admin/config/media/image-styles',
    t('If this style is in use on the site, you may select another style to replace it. All images that have been generated for this style will be permanently deleted.'),
    t('Delete'),  t('Cancel')
  );
}

/**
 * Submit handler to delete an image style.
 */
function image_style_delete_form_submit($form, &$form_state) {
  $style = $form_state['image_style'];

  image_style_delete($style, $form_state['values']['replacement']);
  backdrop_set_message(t('Style %name was deleted.', array('%name' => $style['label'])));
  $form_state['redirect'] = 'admin/config/media/image-styles';
}

/**
 * Confirmation form to revert a database style to its default.
 */
function image_style_revert_form($form, &$form_state, $style) {
  $form_state['image_style'] = $style;

  return confirm_form(
    $form,
    t('Revert the %style style?', array('%style' => $style['label'])),
    'admin/config/media/image-styles',
    t('Reverting this style will delete the customized settings and restore the defaults provided by the @module module.', array('@module' => $style['module'])),
    t('Revert'),  t('Cancel')
  );
}

/**
 * Submit handler to convert an overridden style to its default.
 */
function image_style_revert_form_submit($form, &$form_state) {
  backdrop_set_message(t('The %style style has been reverted to its defaults.', array('%style' => $form_state['image_style']['label'])));
  image_default_style_revert($form_state['image_style']);
  $form_state['redirect'] = 'admin/config/media/image-styles';
}

/**
 * Form builder; Form for adding and editing image effects.
 *
 * This form is used universally for editing all image effects. Each effect adds
 * its own custom section to the form by calling the form function specified in
 * hook_image_effects().
 *
 * @param $form_state
 *   An associative array containing the current state of the form.
 * @param $style
 *   An image style array.
 * @param $effect
 *   An image effect array.
 *
 * @ingroup forms
 * @see hook_image_effects()
 * @see image_resize_form()
 * @see image_scale_form()
 * @see image_rotate_form()
 * @see image_crop_form()
 * @see image_effect_form_submit()
 */
function image_effect_form($form, &$form_state, $style, $effect) {
  if (!empty($effect['data'])) {
    $title = t('Edit %label effect', array('%label' => $effect['label']));
  }
  else{
    $title = t('Add %label effect', array('%label' => $effect['label']));
  }
  backdrop_set_title($title, PASS_THROUGH);

  $form_state['image_style'] = $style;
  $form_state['image_effect'] = $effect;

  // If no configuration for this image effect, return to the image style page.
  if (!isset($effect['form callback'])) {
    backdrop_goto('admin/config/media/image-styles/edit/' . $style['name']);
  }

  $form['#tree'] = TRUE;
  $form['#attached']['css'][backdrop_get_path('module', 'image') . '/css/image.admin.css'] = array();

  $form['data'] = call_user_func($effect['form callback'], $effect['data']);

  // Check the URL for a weight, then the image effect, otherwise use default.
  $form['weight'] = array(
    '#type' => 'hidden',
    '#value' => isset($_GET['weight']) ? intval($_GET['weight']) : (isset($effect['weight']) ? $effect['weight'] : count($style['effects'])),
  );

  $form['actions'] = array('#tree' => FALSE, '#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => isset($effect['ieid']) ? t('Update effect') : t('Add effect'),
  );
  $form['actions']['cancel'] = array(
    '#type' => 'link',
    '#title' => t('Cancel'),
    '#href' => 'admin/config/media/image-styles/edit/' . $style['name'],
  );

  return $form;
}

/**
 * Submit handler for updating an image effect.
 */
function image_effect_form_submit($form, &$form_state) {
  $effect = array_merge($form_state['image_effect'], $form_state['values']);
  image_effect_save($form_state['image_style']['name'], $effect);
  backdrop_set_message(t('The image effect was successfully applied.'));
  $form_state['redirect'] = 'admin/config/media/image-styles/edit/' . $form_state['image_style']['name'];
}

/**
 * Form builder; Form for deleting an image effect.
 *
 * @param $style
 *   Name of the image style from which the image effect will be removed.
 * @param $effect
 *   Name of the image effect to remove.
 * @ingroup forms
 * @see image_effect_delete_form_submit()
 */
function image_effect_delete_form($form, &$form_state, $style, $effect) {
  $form_state['image_style'] = $style;
  $form_state['image_effect'] = $effect;

  $question = t('Are you sure you want to delete the @effect effect from the %style style?', array('%style' => $style['label'], '@effect' => $effect['label']));
  return confirm_form($form, $question, 'admin/config/media/image-styles/edit/' . $style['name'], '', t('Delete'));
}

/**
 * Submit handler to delete an image effect.
 */
function image_effect_delete_form_submit($form, &$form_state) {
  $style = $form_state['image_style'];
  $effect = $form_state['image_effect'];

  image_effect_delete($style['name'], $effect);
  backdrop_set_message(t('The image effect %name has been deleted.', array('%name' => $effect['label'])));
  $form_state['redirect'] = 'admin/config/media/image-styles/edit/' . $style['name'];
}

/**
 * Element validate handler to ensure a hexadecimal color value.
 */
function image_effect_color_validate($element, &$form_state) {
  if ($element['#value'] != '') {
    $hex_value = preg_replace('/^#/', '', $element['#value']);
    if (!preg_match('/^#[0-9A-F]{3}([0-9A-F]{3})?$/', $element['#value'])) {
      form_error($element, t('!name must be a hexadecimal color value.', array('!name' => $element['#title'])));
    }
  }
}

/**
 * Element validate handler to ensure that either a height or a width is
 * specified.
 */
function image_effect_scale_validate($element, &$form_state) {
  if (empty($element['width']['#value']) && empty($element['height']['#value'])) {
    form_error($element, t('Width and height can not both be blank.'));
  }
}

/**
 * Form structure for the image resize form.
 *
 * Note that this is not a complete form, it only contains the portion of the
 * form for configuring the resize options. Therefore it does not not need to
 * include metadata about the effect, nor a submit button.
 *
 * @param $data
 *   The current configuration for this resize effect.
 */
function image_resize_form($data) {
  $form['width'] = array(
    '#type' => 'number',
    '#title' => t('Width'),
    '#default_value' => isset($data['width']) ? $data['width'] : '',
    '#field_suffix' => ' ' . t('pixels'),
    '#required' => TRUE,
    '#min' => 1,
    '#max' => 1000000000,
  );
  $form['height'] = array(
    '#type' => 'number',
    '#title' => t('Height'),
    '#default_value' => isset($data['height']) ? $data['height'] : '',
    '#field_suffix' => ' ' . t('pixels'),
    '#required' => TRUE,
    '#min' => 1,
    '#max' => 1000000000,
  );
  return $form;
}

/**
 * Form structure for the image scale form.
 *
 * Note that this is not a complete form, it only contains the portion of the
 * form for configuring the scale options. Therefore it does not not need to
 * include metadata about the effect, nor a submit button.
 *
 * @param $data
 *   The current configuration for this scale effect.
 */
function image_scale_form($data) {
  $form = image_resize_form($data);
  $form['#element_validate'] = array('image_effect_scale_validate');
  $form['width']['#required'] = FALSE;
  $form['height']['#required'] = FALSE;
  $form['upscale'] = array(
    '#type' => 'checkbox',
    '#default_value' => (isset($data['upscale'])) ? $data['upscale'] : 0,
    '#title' => t('Allow Upscaling'),
    '#description' => t('Let scale make images larger than their original size'),
  );
  return $form;
}

/**
 * Form structure for the image crop form.
 *
 * Note that this is not a complete form, it only contains the portion of the
 * form for configuring the crop options. Therefore it does not not need to
 * include metadata about the effect, nor a submit button.
 *
 * @param $data
 *   The current configuration for this crop effect.
 */
function image_crop_form($data) {
  $data += array(
    'width' => '',
    'height' => '',
    'anchor' => 'center-center',
  );

  $form = image_resize_form($data);
  $form['anchor'] = array(
    '#type' => 'radios',
    '#title' => t('Anchor'),
    '#options' => array(
      'left-top'      => t('Top left'),
      'center-top'    => t('Top center'),
      'right-top'     => t('Top right'),
      'left-center'   => t('Center left'),
      'center-center' => t('Center'),
      'right-center'  => t('Center right'),
      'left-bottom'   => t('Bottom left'),
      'center-bottom' => t('Bottom center'),
      'right-bottom'  => t('Bottom right'),
    ),
    '#theme' => 'image_anchor',
    '#default_value' => $data['anchor'],
    '#description' => t('The part of the image that will be retained during the crop.'),
  );

  return $form;
}

/**
 * Form structure for the image rotate form.
 *
 * Note that this is not a complete form, it only contains the portion of the
 * form for configuring the rotate options. Therefore it does not not need to
 * include metadata about the effect, nor a submit button.
 *
 * @param $data
 *   The current configuration for this rotate effect.
 */
function image_rotate_form($data) {
  $form['degrees'] = array(
    '#type' => 'number',
    '#default_value' => (isset($data['degrees'])) ? $data['degrees'] : 0,
    '#title' => t('Rotation angle'),
    '#description' => t('The number of degrees the image should be rotated. Positive numbers are clockwise, negative are counter-clockwise.'),
    '#field_suffix' => '&deg;',
    '#required' => TRUE,
    '#min' => -360,
    '#max' => 360,
  );
  $form['bgcolor'] = array(
    '#type' => 'textfield',
    '#default_value' => (isset($data['bgcolor'])) ? $data['bgcolor'] : '#FFFFFF',
    '#title' => t('Background color'),
    '#description' => t('The background color to use for exposed areas of the image. Use web-style hex colors (#FFFFFF for white, #000000 for black). Leave blank for transparency on image types that support it.'),
    '#size' => 7,
    '#maxlength' => 7,
    '#element_validate' => array('image_effect_color_validate'),
  );
  $form['random'] = array(
    '#type' => 'checkbox',
    '#default_value' => (isset($data['random'])) ? $data['random'] : 0,
    '#title' => t('Randomize'),
    '#description' => t('Randomize the rotation angle for each image. The angle specified above is used as a maximum.'),
  );

  return $form;
}
