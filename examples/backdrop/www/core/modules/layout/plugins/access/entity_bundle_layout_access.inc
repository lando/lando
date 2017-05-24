<?php
/**
 * @file
 * Plugin to provide access control based upon entity bundle.
 */
class EntityBundleLayoutAccess extends LayoutAccess {
  /**
   * Constructor for a Layout access rule.
   */
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);
    $this->settings += array(
      'bundles' => array()
    );

    // Set entity type.
    $info = layout_get_access_info($plugin_name);
    $this->entity_type = $info['entity_type'];
  }

  /**
   * {@inheritdoc}
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);

    $options = array();
    $entity_info = entity_get_info($this->entity_type);
    foreach ($entity_info['bundles'] as $type => $info) {
      $options[$type] = check_plain($info['label']);
    }

    $form['bundles'] = array(
      '#title' => t('@entity @bundle', array('@entity' => $entity_info['label'], '@bundle' => $entity_info['bundle label'])),
      '#type' => 'checkboxes',
      '#options' => $options,
      '#default_value' => $this->settings['bundles'],
    );
  }

  /**
   * {@inheritdoc}
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);
    $this->settings['bundles'] = array_keys(array_filter($form_state['values']['bundles']));
  }

  /**
   * {@inheritdoc}
   */
  function summary() {
    $entity_info = entity_get_info($this->entity_type);

    $names = array();
    foreach (array_filter($this->settings['bundles']) as $bundle) {
      $names[] = check_plain($entity_info['bundles'][$bundle]['label']);
    }

    if (empty($names)) {
      return t('Entity is a specific type.');
    }

    return format_plural(count($names), '@entity is "@bundles"', '@entity is one of "@bundles"', array('@entity' => $entity_info['label'], '@bundles' => implode(', ', $names)));
  }

  /**
   * {@inheritdoc}
   */
  function checkAccess() {
    if (!$this->settings['bundles']) {
      return FALSE;
    };

    /* @var Entity $entity */
    $entity = $this->contexts[$this->entity_type]->data;
    $bundle = $entity->bundle();
    if (!in_array($bundle, $this->settings['bundles'])) {
      return FALSE;
    }

    return TRUE;
  }
}
