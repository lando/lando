<?php

/**
 *  BlockHero extends BlockText
 *
 *  This class allows us to create hero blocks with image backgrounds.
 */
class BlockHero extends BlockText {
  /**
   * {@inheritdoc}
   */
  function __construct($plugin_name, array $data) {
    parent::__construct($plugin_name, $data);

    $this->settings += array(
      'image' => '',
      'image_path' => '',
    );
  }

  /**
   *  Sets title text on draggable block panel in Layout builder.
   */
  function getAdminTitle() {
    return !empty($this->settings['title']) ? check_plain($this->settings['title']) : t('Hero block');
  }

  /**
   * Returns the rendered content of this block.
   *
   * If there is no content, a non-breaking space is returned to ensure the
   * block is still displayed, with only the background image applied.
   *
   * @return string
   */
  function getContent() {
    if (!empty($this->settings['content'])) {
      return check_markup(token_replace($this->settings['content']), $this->settings['format'], '', TRUE);
    }
    elseif (!empty($this->settings['title']) || !empty($this->settings['image'])) {
      return '&nbsp;';
    }
  }

  /**
   *  Builds the block's configuration form.
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);

    $upload_validators = array(
      'file_validate_extensions' => array('jpg jpeg png gif'),
      'file_validate_image_resolution' => array('3200x1600', '1200x300'),
    );
    $upload_description = theme('file_upload_help', array(
      'upload_validators' => $upload_validators,
    ));

    // Add an image field at the top of the settings form.
    $form['image'] = array(
      '#type' => 'managed_file',
      '#title' => t('Background image'),
      '#description' => $upload_description,
      '#default_value' => $this->settings['image'],
      '#upload_location' => 'public://hero/',
      '#upload_validators' => $upload_validators,
      '#weight' => -10,
    );
    // Store the image path separately.
    $form['image_path'] = array(
      '#type' => 'value',
      '#value' => $this->settings['image_path'],
    );

    // Disable reusable until a later date.
    $form['convert']['#access'] = FALSE;
  }

  /**
   * Validates the form settings.
   */
  function formValidate($form, &$form_state) {
    parent::formValidate($form, $form_state);

    // Check that one of title, text, or image, is provided.
    if (empty($form_state['values']['image']) && empty($form_state['values']['title']) && empty($form_state['values']['content']['value'])) {
      form_error($form['image'], t('Background image, a Display title, or Block content must be provided.'));
    }
  }

  /**
   * Submit handler to save the form settings.
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);

    // Save the things not handled by BlockText.
    if (isset($form_state['values']['image']) && $form_state['values']['image'] != 0) {
      // Record that the layout module is using this file. Also marks permanent.
      $file = file_load($form_state['values']['image']);
      file_usage_add($file, 'layout', 'block', $file->fid);

      // Store the filepath separately for use as inline background image.
      $fileurl = file_create_url($file->uri);
      $filepath = str_replace($GLOBALS['base_url'], '', $fileurl);
      $form_state['values']['image_path'] = $filepath;

      $this->settings['image'] = $form_state['values']['image'];
      $this->settings['image_path'] = $form_state['values']['image_path'];
    }
    else {
      $this->settings['image'] = NULL;
      $this->settings['image_path'] = NULL;
    }
  }
}
