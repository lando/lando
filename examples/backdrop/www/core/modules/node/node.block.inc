<?php
/**
 * @file
 * A class that displays a particular node in a block.
 */
class NodeBlock extends Block {
  /**
   *  Sets title text on draggable block panel in Layout builder.
   */
  function getAdminTitle() {
    return t('Existing content');
  }

  /**
   * Returns a preview for this block.
   */
  function getAdminPreview() {
    return t('Displays content of node ID: @nid', array('@nid' => $this->settings['nid']));
  }

  /**
   *  Sets block subject on block view.
   */
  function getTitle() {
    $title = NULL;
    $node = node_load($this->settings['nid']);
    if ($this->settings['title_display'] === LAYOUT_TITLE_CUSTOM && $this->settings['title']) {
      $title = check_plain($this->settings['title']);
    }
    elseif ($this->settings['title_display'] === LAYOUT_TITLE_DEFAULT) {
      $title = $node->title;
    }

    if ($title && $this->settings['link_node_title']) {
      $title = l($title, 'node/' . $node->nid);
    }
    else {
      $title = check_plain($title);
    }

    return $title;
  }

  /**
   *  Sets block content on block view.
   */
  function getContent() {
    $node = node_load($this->settings['nid']);

    // Prevent display of no access to the node.
    if (!node_access('view', $node)) {
      return;
    }

    // Use a clone of the node so we can hide the title safely.
    $clone = clone($node);

    // Hide node title if not required.
    if (empty($this->settings['leave_node_title'])) {
      $clone->title = '';
    }

    $content = node_view($clone, $this->settings['view_mode']);

    // Hide links if they've been suppressed.
    if (empty($this->settings['links'])) {
      $content['links']['#access'] = FALSE;
    }

    // Add 'submitted by' settings.
    if (!empty($this->settings['display_submitted'])) {
      $content['#display_submitted'] = TRUE;
    }

    // Add theme hook suggestion.
    $content['#theme'] = 'node__block-' . $this->settings['nid'];

    return $content;
  }

  /**
   *  Builds the block's settings configuration form.
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);
    $form['title_display']['title_display']['#options'][LAYOUT_TITLE_DEFAULT] = t('Use content title');
    $form['title_display']['title_display']['#weight'] = -50;
    $settings = $this->settings;

    $form['link_node_title'] = array(
      '#type' => 'checkbox',
      '#default_value' => !empty($settings['link_node_title']),
      '#title' => t('Link block title to full-page display of embedded content.'),
      '#states' => array(
        'invisible' => array(
          ':input[name="title_display"]' => array('value' => LAYOUT_TITLE_NONE),
        ),
      ),
    );

    $form['leave_node_title'] = array(
      '#type' => 'checkbox',
      '#default_value' => !empty($settings['leave_node_title']),
      '#title' => t('Show the content title inside of the block.'),
      '#states' => array(
        'invisible' => array(
          ':input[name="title_display"]' => array('value' => LAYOUT_TITLE_DEFAULT),
        ),
      ),
    );

    $nid_default = '';
    if (!empty($settings['nid'])) {
      $title = db_query("SELECT title FROM {node} WHERE nid = :nid", array(':nid' => $settings['nid']))->fetchField();
      $nid_default = $title . ' [' . $settings['nid'] . ']';
    }

    $form['nid'] = array(
      '#title' => t('Content title or ID'),
      '#type' => 'textfield',
      '#maxlength' => 512,
      '#default_value' => $nid_default,
      '#autocomplete_path' => 'node/autocomplete',
    );

    $entity = entity_get_info('node');
    $view_mode_options = array();
    foreach ($entity['view modes'] as $mode => $option) {
      $view_mode_options[$mode] = $option['label'];
    }
    // Remove view-modes that do not make sense for block display.
    unset($view_mode_options['rss']);
    unset($view_mode_options['search_index']);
    unset($view_mode_options['search_result']);

    $form['view_mode'] = array(
      '#title' => t('View mode'),
      '#type' => 'select',
      '#options' => $view_mode_options,
      '#default_value' => isset($settings['view_mode']) ? $settings['view_mode'] : 'full',
    );

    $form['display_submitted'] = array(
      '#type' => 'checkbox',
      '#default_value' => !empty($settings['display_submitted']),
      '#title' => t('Show author and date information'),
    );

    $form['links'] = array(
      '#type' => 'checkbox',
      '#default_value' => !empty($settings['links']),
      '#title' => t('Include the links "add comment", "read more" etc.'),
    );
  }

  /**
   * Validates the form settings.
   */
  function formValidate($form, &$form_state) {
    parent::formValidate($form, $form_state);

    module_load_include('inc', 'node', 'node.pages');
    if ($nid = node_autocomplete_validate($form_state['values']['nid'])) {
      $form_state['values']['nid'] = $nid;
    }
    else {
      form_error($form['nid'], t('Sorry, no content matching <em>%title</em> was found.', array('%title' => $form_state['values']['nid'])));
    }
  }

  /**
   * Submit handler to save the form settings.
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);

    // Clean up after form states.
    if ($form_state['values']['title_display'] == LAYOUT_TITLE_DEFAULT) {
      $form_state['values']['leave_node_title'] = FALSE;
    }
    elseif ($form_state['values']['title_display'] == LAYOUT_TITLE_NONE) {
      $form_state['values']['link_node_title'] = FALSE;
    }

    $this->settings['nid'] = (int) $form_state['values']['nid'];
    $this->settings['links'] = (bool) $form_state['values']['links'];
    $this->settings['leave_node_title'] = (bool) $form_state['values']['leave_node_title'];
    $this->settings['link_node_title'] = (bool) $form_state['values']['link_node_title'];
    $this->settings['display_submitted'] = (bool) $form_state['values']['display_submitted'];
    $this->settings['view_mode'] = (string) $form_state['values']['view_mode'];
  }
}
