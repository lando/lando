<?php
/**
 * @file
 * Class providing forms and settings for the default Layout block style.
 */
class LayoutStyle extends LayoutHandler {
  /**
   * Indicator as to whether this is a style on the region or on a block.
   *
   * @var boolean
   */
  var $is_region = FALSE;

  /**
   * Constructor for a Layout style class.
   *
   * @param array $plugin_name
   *   The name of the plugin actually being used, which may be pointing at
   *   a parent class of this one.
   * @param array $data
   *   An array of configuration data.
   */
  function __construct($plugin_name, array $data = array(), $is_region = FALSE) {
    parent::__construct($plugin_name, $data);
    $this->settings += array(
      'classes' => '',
    );
    $this->is_region = $is_region;
  }

  /**
   * Specifies the settings form for configuring the style.
   */
  function form(&$form, &$form_state) {
    if (!$this->is_region) {
      $form['classes'] = array(
        '#title' => t('Block classes'),
        '#type' => 'textfield',
        '#default_value' => $this->settings['classes'],
        '#description' => t('Additional classes to be added to this block.'),
      );
    }
  }

  /**
   * Validate handler to validate the form settings.
   */
  function formValidate($form, $form_state) {
    // No additional validation needed yet.
  }

  /**
   * Submit handler for saving the form settings.
   */
  function formSubmit($form, $form_state) {
    $this->settings = $form_state['values']['style_settings'];
  }
}