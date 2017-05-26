<?php
/**
 * @file
 * Class providing forms and settings for the default Layout block style.
 */
class LayoutStyleDynamic extends LayoutStyle {
  /**
   * Constructor for a Layout style dynamic class.
   */
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);
    $this->settings += array(
      'wrapper_tag' => 'div',
      'title_tag' => 'h2',
      'title_classes' => 'block-title',
      'content_tag' => 'div',
      'content_classes' => '',
    );
  }

  /**
   * Specifies the settings form for configuring the style.
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);

    if (!$this->is_region) {
      $tag_list = array(
        'div' => 'DIV',
        'aside' => 'ASIDE',
        'section' => 'SECTION',
        'nav' => 'NAV',
        'p' => 'P',
        '' => t('No wrapper'),
      );
      $form['wrapper_tag'] = array(
        '#title' => t('Wrapper tag'),
        '#type' => 'select',
        '#options' => $tag_list,
        '#weight' => -1,
        '#default_value' => $this->settings['wrapper_tag'],
      );
      $form['classes']['#title'] = t('Wrapper classes');
      $form['classes']['#states'] = array(
        'invisible' => array('[name="style_settings[wrapper_tag]"]' => array('value' => '')),
      );
      $form['title_tag'] = array(
        '#title' => t('Heading level'),
        '#type' => 'select',
        '#options' => array(
          'h1' => 'H1',
          'h2' => 'H2',
          'h3' => 'H3',
          'h4' => 'H4',
          'h5' => 'H5',
          'h6' => 'H6',
          'div' => 'DIV',
          'p' => 'P',
        ),
        '#default_value' => $this->settings['title_tag'],
        '#weight' => 2,
      );
      $form['title_classes'] = array(
        '#title' => t('Heading classes'),
        '#type' => 'textfield',
        '#default_value' => $this->settings['title_classes'],
        '#description' => t('Additional classes to be added to the block title.'),
        '#weight' => 3,
      );
      $form['content_tag'] = array(
        '#title' => t('Content tag'),
        '#type' => 'select',
        '#options' => $tag_list,
        '#default_value' => $this->settings['content_tag'],
        '#weight' => 8,
      );
      $form['content_classes'] = array(
        '#title' => t('Content classes'),
        '#type' => 'textfield',
        '#default_value' => $this->settings['content_classes'],
        '#description' => t('Additional classes to be added to the content within this block.'),
        '#states' => array(
          'invisible' => array('[name="style_settings[content_tag]"]' => array('value' => '')),
        ),
        '#weight' => 9,
      );
    }
  }
}
