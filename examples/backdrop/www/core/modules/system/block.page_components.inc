<?php

/**
 * PageComponents extends Block
 *
 * This class allows us to display the page title, local task tabs, 
 * local actions links, and messages in a block.
 */
class PageComponents extends Block {
  protected $page_title = '';

  /**
   * {@inheritdoc}
   */
  function __construct($plugin_name, array $data) {
    parent::__construct($plugin_name, $data);

    $this->settings += array(
      'title_tag' => 'h1',
      'title_classes' => 'page-title',
      'tab_type' => 'both'
    );
  }

  /**
   * Special function for PageComponents. Sets the page title to be used.
   */
  function setPageTitle($page_title) {
    $this->page_title = $page_title;
  }

  /**
   * {@inheritdoc}
   */
  function getAdminTitle() {
    $children = $this->getChildren();
    $title = $children[$this->childDelta]['info'];
    return strlen($this->settings['title']) ? check_plain($this->settings['title']) : $title;
  }

  /**
   * {@inheritdoc}
   */
  function getContent() {
    if ($this->childDelta == 'title_combo' || $this->childDelta == 'title' && isset($this->page_title)) {
      $this->settings['title'] = $this->page_title;
    }

    $output = theme('page_components', array('child_delta' => $this->childDelta, 'settings' => $this->settings));

    // Check for any non-space contents. A hidden page title may show nothing
    // at all and the whole block should be hidden in such a case.
    if (strlen(trim($output)) === 0) {
      return NULL;
    }
    return $output;;
  }

  /**
   * {@inheritdoc}
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);
    $form['title_display']['#access'] = FALSE;

    if ($this->childDelta == 'title_combo' || $this->childDelta == 'title') {
      $form['title_wrapper'] = array(
        '#type' => 'fieldset',
        '#title' => t('Page title'),
      );
      $form['title_wrapper']['title_tag'] = array(
        '#title' => t('Title tag'),
        '#type' => 'select',
        '#options' => array(
          'h1' => 'H1',
          'h2' => 'H2',
          'h3' => 'H3',
          'h4' => 'H4',
          'h5' => 'H5',
          'h6' => 'H6',
          'div' => 'DIV',
        ),
        '#default_value' => $this->settings['title_tag'],
      );
      $form['title_wrapper']['title_classes'] = array(
        '#title' => t('Heading classes'),
        '#type' => 'textfield',
        '#default_value' => $this->settings['title_classes'],
        '#description' => t('Additional classes to be added to the page title.'),
      );
    }

    if ($this->childDelta == 'title_combo' || $this->childDelta == 'tabs') {
      $form['tabs'] = array(
        '#type' => 'fieldset',
        '#title' => t('Local task tabs'),
      );
      $form['tabs']['tab_type'] = array(
        '#title' => t('Tabs type'),
        '#type' => 'select',
        '#options' => array(
          'both' => t('Primary and secondary'),
          'primary' => t('Primary'),
          'secondary' => t('Secondary'),
          'hidden' => t('Hidden'),
        ),
        '#default_value' => $this->settings['tab_type'],
        '#description' => t('Tabs are commonly used to show links for editing content, viewing revisions, and accessing sub-pages of configuration.
'),
      );
    }
  }

  /**
   * {@inheritdoc}
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);

    // This block never displays a block title, as it would result in things
    // like a title on the title component.
    $this->settings['title_display'] = LAYOUT_TITLE_NONE;
    $this->settings['title'] = '';

    if (isset($form_state['values']['title_wrapper']['title_tag'])) {
      $this->settings['title_tag'] = $form_state['values']['title_wrapper']['title_tag'];
    }
    if (isset($form_state['values']['title_wrapper']['title_classes'])) {
      $this->settings['title_classes'] = $form_state['values']['title_wrapper']['title_classes'];
    }
    if (isset($form_state['values']['tabs']['tab_type'])) {
      $this->settings['tab_type'] = $form_state['values']['tabs']['tab_type'];
    }
  }

  /**
   * {@inheritdoc}
   */
  function getChildren() {
    return array(
      'title_combo' => array(
        'info' => t('Page title combo'),
        'description' => t('Displays the page title, tabs (local tasks), local actions links, and messages. Replaces all the normal equivalents on the page with a single block.'),
      ),
      'tabs' => array(
        'info' => t('Page tabs (Local tasks)'),
        'description' => t('Displays the links for menu local tasks, such as "View" or "Edit". Replaces the normal tabs on the page with a block.'),
      ),
      'title' => array(
        'info' => t('Page title'),
        'description' => t('Displays the page title. Replaces the normal page title with a block.'),
      ),
      'action_links' => array(
        'info' => t('Page local actions'),
        'description' => t('Displays the local actions links, such as "Add content". Replaces the normal local actions on the page with a block.'),
      ),
      'messages' => array(
        'info' => t('Page messages'),
        'description' => t('Displays messages to the user after an action is performed, such as form validation errors or success messages. Replaces the normal messages on the page with a block.'),
      ),
    );
  }
}
