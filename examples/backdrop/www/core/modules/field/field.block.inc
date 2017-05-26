<?php

/**
 *  FieldBlock extends Block
 *  
 *  Provides entity field values in configurable blocks.
 */
class FieldBlock extends Block {
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);

    $this->settings += array(
      'label' => 'hidden',
      'formatter' => '',
      'formatter_settings' => array(),
      'delta_offset' => 0,
      'delta_limit' => '',
      'delta_reversed' => 0,
    );
  }

  /**
   *  Sets title text on draggable block panel in Layout builder.
   */
  function getAdminTitle() {
    list($entity_type, $field_name) = explode('-', $this->childDelta, 2);
    return t('Field %field', array('%field' => $field_name));
  }

  /**
   *  Sets description text on draggable block in Layout builder.
   */
  function getAdminPreview() {
    list($entity_type, $field_name) = explode('-', $this->childDelta, 2);
    $field = field_info_field($field_name);
    $formatter = field_info_formatter_types($this->settings['formatter']);
    $pseudo_instance = $this->createPseudoInstance($this->settings['formatter'], $this->settings['formatter_settings']);
    $summary = module_invoke($formatter['module'], 'field_formatter_settings_summary', $field, $pseudo_instance, '_custom');

    $preview = '<p>' . t('Displays values of "%field" field.', array('%field' => $field_name)) . '</p>';
    $preview .= '<div class="field-formatter-summary">' . $summary . '</div>';
    $preview .= $this->getAdminConditionsPreview();
    return $preview;
  }

  /**
   *  Sets block subject on block view.
   */
  function getTitle() {
    $title = parent::getTitle();

    if (empty($title) && $this->settings['title_display'] === LAYOUT_TITLE_DEFAULT) {
      list($entity_type, $field_name) = explode('-', $this->childDelta);
      $entity = $this->contexts[$entity_type]->data;
      $instance = field_info_instance($entity->entityType(), $field_name, $entity->bundle());
      $title = t($instance['label']);
    }

    return $title;
  }

  /**
   *  Sets block content on block view.
   */
  function getContent() {
    $settings = $this->settings;

    // Get a shortcut to the entity.
    list($entity_type, $field_name) = explode('-', $this->childDelta);
    $entity = $this->contexts[$entity_type]->data;

    // Load the entity type's information for this field.
    $field = field_info_instance($entity_type, $field_name, $entity->bundle());

    // Do not render if the entity type does not have this field.
    if (empty($field)) {
      return NULL;
    }
    $language = field_language($entity_type, $entity, $field_name);

    $field_settings = array(
      'type' => $settings['formatter'],
      'settings' => $settings['formatter_settings'],
      'label' => $settings['label'],
    );

    $all_values = field_get_items($entity_type, $entity, $field_name, $language);
    if (!is_array($all_values)) {
      // Do not render if the field is empty.
      return NULL;
    }
    // Reverse values.
    if ($settings['delta_reversed']) {
      $all_values = array_reverse($all_values, TRUE);
    }

    if (isset($settings['delta_limit'])) {
      $offset = intval($settings['delta_offset']);
      $limit = !empty($settings['delta_limit']) ? $settings['delta_limit'] : NULL;
      $all_values = array_slice($all_values, $offset, $limit, TRUE);
    }

    $clone = clone $entity;
    $clone->{$field_name}[$language] = $all_values;
    $field_output = field_view_field($entity_type, $clone, $field_name, $field_settings, $language);

    return $field_output;
  }

  /**
   *  Builds the block's configuration form.
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);

    // Clarify what the default title type is.
    $form['title_display']['title_display']['#options'][LAYOUT_TITLE_DEFAULT] = t('Use field label as title');
    $form['title_display']['title_display']['#description'] = t('The block title is displayed outside of the block content area.');

    $settings = $this->settings;
    $fields = field_get_block_list();

    list($entity_type, $field_name) = explode('-', $this->childDelta);
    $field = field_info_field($field_name);

    // Get formatter info.
    $formatters = field_info_formatter_types();
    $formatter_options = array();
    foreach ($formatters as $formatter_name => $formatter) {
      if (in_array($field['type'], $formatter['field types'])) {
        $formatter_options[$formatter_name] = $formatter['label'];
      }
    }

    $form['label'] = array(
      '#type' => 'select',
      '#title' => t('Field label display'),
      '#default_value' => $settings['label'],
      '#options' => array(
        'hidden' => 'None',
        'above' => 'Above',
        'inline' => 'Inline',
      ),
      '#description' => t('The field label is displayed within the block content area.'),
    );

    // Get the currently selected formatter.
    $formatter_name = isset($form_state['values']['formatter']) ? $form_state['values']['formatter'] : $settings['formatter'];
    if (empty($formatter_name)) {
      $formatter_name = key($formatter_options);
    }
    $formatter = $formatters[$formatter_name];
    $formatter_settings = (array) $settings['formatter_settings'] + field_info_formatter_settings($formatter_name);

    $form['formatter'] = array(
      '#type' => 'select',
      '#title' => t('Field display format'),
      '#default_value' => $formatter_name,
      '#options' => $formatter_options,
      '#ajax' => array(
        'callback' => 'FieldBlock::formatterFormAjax',
      ),
      '#access' => count($formatter_options) > 1,
    );

    // Provide an instance array for hook_field_formatter_settings_form().
    $pseudo_instance = $this->createPseudoInstance($formatter_name, $formatter_settings);

    // Store the settings in a '_custom' view mode.
    $pseudo_instance['display']['_custom'] = array(
      'type' => $formatter_name,
      'settings' => $formatter_settings,
    );

    // Get the settings form.
    $formatter_settings_form = array(
      '#type' => 'value',
      '#value' => array(),
    );
    $function = $formatter['module'] . '_field_formatter_settings_form';
    if (function_exists($function)) {
      $formatter_settings_form = $function($field, $pseudo_instance, '_custom', $form, $form_state);
    }
    $formatter_settings_form['#prefix'] = '<div id="formatter-settings">';
    $formatter_settings_form['#suffix'] = '</div>';
    $form['formatter_settings'] = $formatter_settings_form;

    // Settings that are only shown for multiple field
    if (isset($field['cardinality']) && $field['cardinality'] != 1) {
      list($prefix, $suffix) = explode('@count', t('Skip the first @count item(s)'));
      $form['trim_output'] = array(
        '#type' => 'fieldset',
        '#title' => t('Trim the output values'),
      );
      $form['trim_output']['delta_offset'] = array(
        '#type' => 'textfield',
        '#size' => 5,
        '#field_prefix' => $prefix,
        '#field_suffix' => $suffix,
        '#default_value' => $settings['delta_offset'],
      );

      list($prefix, $suffix) = explode('@count', t('Then display at most @count item(s)'));
      $form['trim_output']['delta_limit'] = array(
        '#type' => 'textfield',
        '#size' => 5,
        '#field_prefix' => $prefix,
        '#field_suffix' => $suffix,
        '#description' => t('Enter 0 to display all items.'),
        '#default_value' => $settings['delta_limit'],
      );

      $form['delta_reversed'] = array(
        '#type' => 'fieldset',
        '#title' => t('Reverse the output values'),
      );
      $form['delta_reversed']['delta_reversed'] = array(
        '#title' => t('Display in reverse order'),
        '#type' => 'checkbox',
        '#default_value' => !empty($settings['delta_reversed']),
        '#description' => t('(start from last values)'),
      );
    }
  }
  
  /**
   * Submit handler to save the form settings.
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);

    $values = $form_state['values'];

    $this->settings['label'] = $values['label'];
    $this->settings['formatter'] = $values['formatter'];
    $this->settings['formatter_settings'] = isset($values['formatter_settings']) ? $values['formatter_settings'] : array();
    $this->settings['delta_offset'] = isset($values['trim_output']['delta_offset']) ? $values['trim_output']['delta_offset'] : 0;
    $this->settings['delta_limit'] = !empty($values['trim_output']['delta_limit']) ? $values['trim_output']['delta_limit'] : '';
    $this->settings['delta_reversed'] = isset($values['delta_reversed']['delta_reversed']) ? $values['delta_reversed']['delta_reversed'] : 0;
  }

  /**
   * Form #ajax callback used by FieldBlock::form().
   */
  static function formatterFormAjax($form, &$form_state) {
    $commands[] = ajax_command_replace('#formatter-settings', backdrop_render($form['formatter_settings']));
    return array(
      '#type' => 'ajax',
      '#commands' => $commands,
    );
  }

  /**
   * Creates an array of "child blocks" for display in the "Add Block" dialog.
   *
   * This allows a single entry in hook_block_info() to provide multiple
   * block instances displaying different fields.
   *
   * @see field_get_block_list()
   */
  function getChildren() {
    return field_get_block_list();
  }

  /**
   * Create a field instance and display that uses custom formatter settings.
   *
   * This helper function provides a fake field instance with a display called
   * "_custom". Formatter callbacks require a full instance, but in the case
   * of the field blocks, there isn't full instance because the bundle isn't
   * yet known.
   *
   * @param $formatter_name
   *   The formatter to be used with this instance.
   * @param $formatter_settings
   *   The settings for the given formatter.
   *
   * @return array
   *   An array matching a field instance as provided by field_info_instance().
   */
  protected function createPseudoInstance($formatter_name, $formatter_settings) {
    list($entity_type, $field_name) = explode('-', $this->childDelta);
    $field = field_info_field($field_name);
    $field_type = field_info_field_types($field['type']);

    $instance = array(
      // Build a fake entity type and bundle.
      'field_name' => $field_name,
      'entity_type' => 'block',
      'bundle' => 'block',

      // Use the default field settings for settings and widget.
      'settings' => field_info_instance_settings($field['type']),
      'widget' => array(
        'type' => $field_type['default_widget'],
        'settings' => array(),
      ),

      // Build a dummy display mode.
      'display' => array(
        '_custom' => array(
          'type' => $formatter_name,
          'settings' => $formatter_settings,
        ),
      ),

      // Set the other fields to their default values.
      // @see _field_write_instance().
      'required' => FALSE,
      'label' => $field['field_name'],
      'description' => '',
      'deleted' => 0,
    );

    return $instance;
  }
}
