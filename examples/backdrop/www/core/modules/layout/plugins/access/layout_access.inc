<?php
/**
 * @file
 * Class for loading, modifying, and saving a layout access rule (condition).
 */
class LayoutAccess extends LayoutHandler {

  /**
   * An array of contexts used by this access rule.
   *
   * Each context is keyed by names specified in hook_layout_access_info(). For
   * example if hook_layout_access_info() specified an array of required
   * contexts for a plugin such as:
   * @code
   * 'required contexts' = array(
   *   'node1' => 'node',
   *   'node2' => 'node',
   * );
   * @endcode
   *
   * Then this context variable would contain two fully loaded context objects,
   * with the keys "node1" and "node2".
   *
   * @var array
   */
  var $contexts = array();

  /**
   * Constructor for a Layout access rule.
   */
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);
    $this->settings += array(
      'contexts' => array(),
    );
  }

  /**
   * Provides a human-readable summary of this access check's behavior.
   *
   * @param $contexts
   *   An array containing available contexts.
   * @return string
   *   The summary string for this access check.
   */
  function summary() {
    return '';
  }

  /**
   * Checks for access based on the available context.
   *
   * @return boolean
   *   The result of the access check.
   */
  function checkAccess() {

  }

  /**
   * Settings form for configuring this access item.
   */
  function form(&$form, &$form_state) {
    /* @var Layout|LayoutMenuItem $item */
    if ($form_state['menu_item']) {
      $item = $form_state['menu_item'];
    }
    else {
      $item = $form_state['layout'];
    }
    $access_info = layout_get_access_info($this->plugin);
    $contexts = $item->getContexts();
    $current_context_settings = isset($this->settings['contexts']) ? $this->settings['contexts'] : array();
    $form['contexts'] = layout_contexts_form_element($contexts, $current_context_settings, $access_info);
  }


  /**
   * Validate handler for the settings form for this access item.
   */
  function formValidate($form, &$form_state) {

  }

  /**
   * Submit handler for the settings form for this access item.
   */
  function formSubmit($form, &$form_state) {
    $excluded = backdrop_map_assoc(array('cancel', 'submit', 'form_build_id', 'form_token', 'form_id', 'op', 'add', 'condition'));
    $settings = array_diff_key($form_state['values'], $excluded);
    $this->settings = array_merge($this->settings, $settings);
  }

  /**
   * Sets the contexts for this item from the full list of layout contexts.
   *
   * This method converts all available contexts provided by a layout to
   * consistent keys expected by the access rule. For example a layout might
   * have contexts keyed as "node" and "node2", but an access rule may only use
   * a single context keyed as "node". It's possible for either layout context
   * to be stored as the single context needed for the access rule.
   *
   * @param array $all_contexts
   *   An array of context instances used by the entire layout that contains
   *   this access rule.
   * @return boolean
   *   TRUE if all required contexts have been provided, FALSE if the layout's
   *   contexts did not provide every required context needed by this access
   *   rule.
   */
  function setContexts(array $all_contexts) {
    $required_contexts = $this->getRequiredContexts();
    if (empty($required_contexts)) {
      return TRUE;
    }
    return layout_set_handler_contexts($this->contexts, $all_contexts, $required_contexts, $this->settings['contexts']);
  }

  /**
   * Get a list of all context plugin names required for this access check.
   */
  function getRequiredContexts() {
    $access_info = layout_get_access_info($this->plugin);
    return isset($access_info['required contexts']) ? $access_info['required contexts'] : array();
  }

  /**
   * {@inheritdoc}
   */
  function toArray() {
    $array = parent::toArray();
    // Don't save empty context settings.
    if (empty($array['settings']['contexts'])) {
      unset($array['settings']['contexts']);
    }
    return $array;
  }
}

/**
 * A common base class used for access handlers that may be negated.
 */
class LayoutAccessNegatable extends LayoutAccess {
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);
    // Ensure a setting always exists for negation.
    $this->settings += array(
      'negate' => FALSE,
    );
  }

  /**
   * {@inheritdoc}
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);
    $form['negate'] = array(
      '#type' => 'checkbox',
      '#title' => t('Reverse (NOT)'),
      '#weight' => 100,
      '#default_value' => $this->settings['negate'],
    );
  }

  /**
   * {@inheritdoc}
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);
    $this->settings['negate'] = !empty($form_state['values']['negate']);
  }
}

/**
 * A class to be used for contexts whose handler cannot be found.
 */
class LayoutAccessBroken extends LayoutAccess {
  function summary() {
    return t('Broken or missing access plugin');
  }
  function checkAccess() {
    return TRUE;
  }
  function form(&$form, &$form_state) {
    $info = layout_get_access_info($this->plugin);
    $class = isset($info['class']) ? $info['class'] : t('Unknown');
    $form['error'] = array(
      '#markup' => t('The class "@class" for the "@plugin" plugin could not be found.', array('@class' => $class, '@plugin' => $this->plugin)),
    );
  }
}
