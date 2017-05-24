<?php
/**
 * @file
 * Base classes used by all Layout handlers.
 *
 * All layout handlers have some things in common, including the name of the
 * plugin itself, and any settings affiliated with that handler.
 */
abstract class LayoutHandler {
  /**
   * Indicator if this object has not yet been saved.
   *
   * @var Boolean
   */
  var $is_new = FALSE;

  /**
   * The name of this plugin.
   *
   * Plugin names are text strings that map to particular classes. This mapping
   * is provided by the appropriate hook_layout_*_info() hook, such as
   * hook_layout_access_info().
   */
  var $plugin;

  /**
   * An array of all settings pertaining to this handler.
   *
   * @var array
   */
  var $settings = array();

  function __construct($plugin_name, array $data = array()) {
    // Provide a settings array default for all plugins.
    $data += array(
      'settings' => array(),
    );

    $this->plugin = $plugin_name;
    $this->settings = $data['settings'];
  }

  /**
   * Assemble a human-readable label of this object.
   */
  function label() {
    $label = get_class($this);
    if ($this->settings['title']) {
      $label .= '(' . check_plain($this->settings['title']) . ')';
    }
    return $label;
  }

  /**
   * Convert this object's properties to an array.
   *
   * This is used to convert this handler's configuration to a storage-safe
   * array, such as to be stored by the config management system as JSON.
   */
  function toArray() {
    return array(
      'settings' => $this->settings,
    );
  }
}

/**
 * Handler to hold configuration of handlers that seemingly have been removed.
 */
class LayoutHandlerBroken extends LayoutHandler {}
