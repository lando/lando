<?php
/**
 * @file
 * Plugin to provide access control based upon entity ID.
 */
class EntityIDLayoutAccess extends LayoutAccessNegatable {
  /**
   * Constructor for a Layout access rule.
   */
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);
    $this->settings += array(
      'entity_id' => NULL
    );

    // Set entity info.
    $info = layout_get_access_info($plugin_name);
    $this->entity_type = $info['entity_type'];
    $this->entity_info = entity_get_info($this->entity_type);
  }

  /**
   * {@inheritdoc}
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);

    $form['entity_id'] = array(
      '#title' => t('@entity @entity_id_key is', array('@entity' => $this->entity_info['label'], '@entity_id_key' => strtoupper($this->entity_info['entity keys']['id']))),
      '#type' => 'textfield',
      '#default_value' => is_null($this->settings['entity_id']) ? NULL : (int) $this->settings['entity_id'],
      '#weight' => 100,
    );
  }

  /**
   * {@inheritdoc}
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);
    $this->settings['entity_id'] = $form_state['values']['entity_id'];
  }

  /**
   * {@inheritdoc}
   */
  function summary() {
    if ($this->settings['negate']) {
      return t('@entity ID is NOT: @entity_id', array('@entity'  => $this->entity_info['label'], '@entity_id'  => $this->settings['entity_id']));
    }
    else {
      return t('@entity ID is: @entity_id', array('@entity'  => $this->entity_info['label'], '@entity_id'  => $this->settings['entity_id']));
    }
  }

  /**
   * {@inheritdoc}
   */
  function checkAccess() {
    $key = $this->entity_info['entity keys']['id'];
    $entity = $this->contexts[$this->entity_type]->data;

    if ($this->settings['negate']) {
      return ($entity->$key != $this->settings['entity_id']);
    }
    else {
      return ($entity->$key == $this->settings['entity_id']);
    }
  }
}
