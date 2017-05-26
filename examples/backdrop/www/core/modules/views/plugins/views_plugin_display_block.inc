<?php
/**
 * @file
 * Contains the block display plugin.
 */

/**
 * The plugin that handles a block.
 *
 * @ingroup views_display_plugins
 */
class views_plugin_display_block extends views_plugin_display {

  /**
   * @var bool
   * Whether this display has custom settings that override the view options.
   */
  protected $has_override_options = FALSE;

  function option_definition() {
    $options = parent::option_definition();

    $options['block_description'] = array('default' => '', 'translatable' => TRUE);
    $options['block_caching'] = array('default' => BACKDROP_NO_CACHE);

    $options['allow'] = array(
      'contains' => array(
        'use_pager'       => array('default' => FALSE),
        'items_per_page'  => array('default' => FALSE),
        'offset'          => array('default' => FALSE),
        'link_to_view'    => array('default' => FALSE),
        'more_link'       => array('default' => FALSE),
        'path_override'   => array('default' => FALSE),
        'exposed_form'    => array('default' => FALSE),
        'fields_override' => array('default' => FALSE),
      ),
    );

    $options['argument_input'] = array('default' => array());
    $options['link_to_view'] = array('default' => 0);
    $options['inherit_path'] = array('default' => 0);

    return $options;
  }

  /**
   * Set the options that should be overridden within this display.
   *
   * This function is intended to be called from the block class.
   *
   * @param array $options
   *   An array of options the override that of this view.
   */
  function set_override_options(array $options) {
    $this->set_option('override_options', $options);
    $this->has_override_options = TRUE;
  }

  /**
   * Accessor to check if any override options have been set.
   *
   * @return bool
   */
  function has_override_options() {
    return $this->has_override_options;
  }

  /**
   * Return a list of blocks provided by this display plugin.
   */
  function execute_hook_block_list($delta = 0, $edit = array()) {
    $delta = $this->view->name . '-' . $this->display->id;
    $info = $this->get_option('block_description');

    if (empty($info)) {
      if ($this->display->display_title == $this->definition['title']) {
        $info = t('View: @view', array('@view' => t($this->view->get_human_name())));
      }
      else {
        $info = t('View: @view: @display', array('@view' => t($this->view->get_human_name()), '@display' => t($this->display->display_title)));
      }
    }
    return array(
      $delta => array(
        'info' => $info,
        'description' => $this->view->description ? check_plain(t($this->view->description)) : t('Block display from the "@view" view.', array('@view' => t($this->view->get_human_name()))),
        'cache' => $this->get_cache_type(),
        'class' => 'ViewsBlock',
      ),
    );
  }

  /**
   * The display block handler returns the structure necessary for a block.
   */
  function execute() {
    $output = NULL;
    // Prior to this being called, the $view should already be set to this
    // display, and arguments should be set on the view.
    $rendered_view = $this->view->render();
    if (!empty($this->view->result) || $this->get_option('empty') || !empty($this->view->style_plugin->definition['even empty'])) {
      $output = array(
        'content' => $rendered_view,
        'subject' => filter_xss_admin($this->view->get_title()),
      );
    }
    return $output;
  }

  /**
   * Provide the summary for page options in the views UI.
   *
   * This output is returned as an array.
   */
  function options_summary(&$categories, &$options) {
    // It is very important to call the parent function here:
    parent::options_summary($categories, $options);

    $categories['block'] = array(
      'title' => t('Block settings'),
      'column' => 'second',
      'build' => array(
        '#weight' => -10,
      ),
    );

    $block_description = strip_tags($this->get_option('block_description'));
    if (empty($block_description)) {
      $block_description = t('None');
    }

    $options['block_description'] = array(
      'category' => 'block',
      'title' => t('Block admin label'),
      'value' => views_ui_truncate($block_description, 24),
    );

    $options['link_to_view'] = array(
      'category' => 'block',
      'title' => t('Link title to page display'),
      'value' => $this->get_option('link_to_view') ? t('Yes') : t('No'),
    );

    $options['inherit_path'] = array(
      'category' => 'block',
      'title' => t('Inherits path'),
      'value' => $this->get_option('inherit_path') ? t('Yes') : t('No'),
    );

    $options['argument_input'] = array(
      'category' => 'block',
      'title' => t('Contextual filter input'),
      'value' => t('Edit'),
    );

    $allow = $this->get_option('allow');
    $filtered_allow = array_filter($allow);

    $options['allow'] = array(
      'category' => 'block',
      'title' => t('Allow settings override'),
      'value' => empty($filtered_allow) ? t('None') : ($allow === $filtered_allow ? t('All') : t('Some')),
    );

    $types = $this->block_caching_modes();
    $options['block_caching'] = array(
      'category' => 'other',
      'title' => t('Block caching'),
      'value' => $types[$this->get_cache_type()],
    );
  }

  /**
   * Provide a list of core's block caching modes.
   */
  function block_caching_modes() {
    return array(
      BACKDROP_NO_CACHE => t('Do not cache'),
      BACKDROP_CACHE_GLOBAL => t('Cache once for everything (global)'),
      BACKDROP_CACHE_PER_PAGE => t('Per page'),
      BACKDROP_CACHE_PER_ROLE => t('Per role'),
      BACKDROP_CACHE_PER_ROLE | BACKDROP_CACHE_PER_PAGE => t('Per role per page'),
      BACKDROP_CACHE_PER_USER => t('Per user'),
      BACKDROP_CACHE_PER_USER | BACKDROP_CACHE_PER_PAGE => t('Per user per page'),
    );
  }

  /**
   * Provide a single method to figure caching type, keeping a sensible default
   * for when it's unset.
   */
  function get_cache_type() {
    $cache_type = $this->get_option('block_caching');
    if (empty($cache_type)) {
      $cache_type = BACKDROP_NO_CACHE;
    }
    return $cache_type;
  }

  /**
   * Provide the default form for setting options.
   */
  function options_form(&$form, &$form_state) {
    // It is very important to call the parent function here:
    parent::options_form($form, $form_state);

    switch ($form_state['section']) {
      case 'block_description':
        $form['#title'] .= t('Block admin label');
        $form['block_description'] = array(
          '#type' => 'textfield',
          '#description' => t('Used in administrative interfaces and not shown to end-users.'),
          '#default_value' => $this->get_option('block_description'),
        );
        break;

      case 'allow':
        $form['#title'] .= t('Allow settings');
        $form['help'] = array(
          '#type' => 'help',
          '#markup' => t('Checked settings will be available in the Block configuration dialog for modification by the administrator configuring the layout. Unchecked settings will not be available and will only use the settings in this display.'),
        );

        $options = array(
          'use_pager' => t('Use pager'),
          'items_per_page' => t('Items per page'),
          'offset' => t('Pager offset'),
          'link_to_view' => t('Link block title to view page'),
          'more_link' => t('More link'),
          'path_override' => t('Path override'),
          'exposed_form' => t('Use exposed widgets form as block configuration'),
          'fields_override' => t('Fields override'),
        );

        $allow = array_filter($this->get_option('allow'));
        $form['allow'] = array(
          '#type' => 'checkboxes',
          '#default_value' => $allow,
          '#options' => $options,
        );
        break;

      case 'link_to_view':
        $form['#title'] .= t('Link block title to view page');

        $form['link_to_view'] = array(
          '#type' => 'radios',
          '#options' => array(1 => t('Yes'), 0 => t('No')),
          '#default_value' => $this->get_option('link_to_view'),
          '#description' => t('Linking the block title to the view will make an anchor tag to the view page display (if one is exists).'),
        );
        break;

      case 'inherit_path':
        $form['#title'] .= t('Inherit path from the page.');

        $form['inherit_path'] = array(
          '#type' => 'radios',
          '#options' => array(1 => t('Yes'), 0 => t('No')),
          '#default_value' => $this->get_option('inherit_path'),
          '#description' => t('If yes, all links generated by Views, such as more links, summary links, and exposed input links will go to the current page path, not the view, if the display has a path.'),
        );
        break;

      case 'argument_input':
        $form['#title'] .= t('Choose the data source for view arguments');
        $argument_input = $this->get_argument_input();

        $form['argument_input']['#tree'] = TRUE;

        foreach ($argument_input as $id => $argument) {
          $form['argument_input'][$id] = array(
            '#tree' => TRUE,
          );

          $safe = str_replace(array('][', '_', ' '), '-', $id);

          $form['argument_input'][$id]['type'] = array(
            '#type' => 'select',
            '#options' => array(
              'none' => t('No argument'),
              'wildcard' => t('Argument wildcard'),
              //'context' => t('From context'),
              'fixed' => t('Fixed'),
              'user' => t('Input in block settings'),
            ),
            '#attributes' => array('class' => array('argument-type-' . $safe)),
            '#title' => t('@arg source', array('@arg' => $argument['name'])),
            '#default_value' => $argument['type'],
          );
          /*
          $form['argument_input'][$id]['context'] = array(
            '#type' => 'select',
            '#title' => t('Required context'),
            '#description' => t('If "From context" is selected, which type of context to use.'),
            '#default_value' => $argument['context'],
            '#options' => array(), // @todo: Context options.
            '#states' => array(
              'visible' => array(
                'select.argument-type-' . $safe => array('value' => 'context'),
              ),
            ),
          );
          */

          $form['argument_input'][$id]['context_optional'] = array(
            '#type' => 'checkbox',
            '#title' => t('Context is optional'),
            '#description' => t('This context need not be present for the block to function. If you plan to use this, ensure that the argument handler can handle empty values gracefully.'),
            '#default_value' => $argument['context_optional'],
            '#states' => array(
              'visible' => array(
                'select.argument-type-' . $safe => array('value' => 'context'),
              ),
            ),
          );

          $form['argument_input'][$id]['fixed'] = array(
            '#type' => 'textfield',
            '#title' => t('Fixed argument'),
            '#description' => t('If "Fixed" is selected, what to use as an argument.'),
            '#default_value' => $argument['fixed'],
            '#states' => array(
              'visible' => array(
                'select.argument-type-' . $safe => array('value' => 'fixed'),
              ),
            ),
          );

          $form['argument_input'][$id]['label'] = array(
            '#type' => 'textfield',
            '#title' => t('Label'),
            '#description' => t('If this argument is presented to the administrator configuring a layout, what label to apply to it.'),
            '#default_value' => empty($argument['label']) ? $argument['name'] : $argument['label'],
            '#states' => array(
              'visible' => array(
                'select.argument-type-' . $safe => array('value' => 'user'),
              ),
            ),
          );
        }

        if (empty($argument_input)) {
          $form['markup']['#markup'] = '<p>' . t('There are no contextual filters on this display.') . '</p>';
        }

        break;

      case 'exposed_form_options':
        $this->view->init_handlers();
        if (!$this->uses_exposed() && parent::uses_exposed()) {
          $form['exposed_form_options']['warning'] = array(
            '#weight' => -10,
            '#markup' => '<div class="messages warning">' . t('Exposed filters in block displays require "Use AJAX" to be set to work correctly.') . '</div>',
          );
        }
        break;

      case 'block_caching':
        $form['#title'] .= t('Block caching type');

        $form['block_caching'] = array(
          '#type' => 'radios',
          '#description' => t("This sets the default status for Backdrop's built-in block caching method; this requires that caching be turned on in block administration, and be careful because you have little control over when this cache is flushed."),
          '#options' => $this->block_caching_modes(),
          '#default_value' => $this->get_cache_type(),
        );
        break;
    }
  }

  /**
   * Perform any necessary changes to the form values prior to storage.
   * There is no need for this function to actually store the data.
   */
  function options_submit(&$form, &$form_state) {
    // It is very important to call the parent function here:
    parent::options_submit($form, $form_state);
    switch ($form_state['section']) {
      case 'block_description':
      case 'allow':
      case 'argument_input':
      case 'link_to_view':
      case 'inherit_path':
      case 'block_caching':
        $this->set_option($form_state['section'], $form_state['values'][$form_state['section']]);
        break;
    }
  }


  /**
   * Adjust the array of argument input to match the current list of
   * arguments available for this display. This ensures that changing
   * the arguments doesn't cause the argument input field to just
   * break.
   */
  function get_argument_input() {
    $arguments = $this->get_option('argument_input');
    $handlers = $this->get_handlers('argument');

    // We use a separate output so as to seamlessly discard info for
    // arguments that no longer exist.
    $output = array();

    foreach ($handlers as $id => $handler) {
      if (empty($arguments[$id])) {
        $output[$id] = array(
          'type' => 'none',
          'context' => 'any',
          'context_optional' => FALSE,
          'fixed' => '',
          'name' => $handler->ui_name(),
        );
      }
      else {
        $output[$id] = $arguments[$id];
        $output[$id]['name'] = $handler->ui_name();
      }
    }

    return $output;
  }

  function use_more() {
    $allow = $this->get_option('allow');
    if (!$allow['more_link'] || !$this->has_override_options()) {
      return parent::use_more();
    }
    $override_options = $this->get_option('override_options');
    return (bool) $override_options['more_link'];
  }

  function get_path() {
    if (empty($this->view->override_path)) {
      return parent::get_path();
    }
    return $this->view->override_path;
  }

  function get_url() {
    if ($this->get_option('inherit_path')) {
      return $this->get_path();
    }
    return parent::get_url();
  }

  /**
   * Determine if this display should display the exposed filters widgets, so
   * the view will know whether or not to render them.
   *
   * Regardless of what this function returns, exposed filters will not be used
   * nor displayed unless uses_exposed() returns TRUE.
   */
  function displays_exposed() {
    $allow = $this->get_option('allow');
    // If this is set, the exposed form is part of pane configuration, not
    // rendered normally.
    return empty($allow['exposed_form']);
  }

  function uses_exposed_form_in_block() {
    return (bool) $this->get_option('inherit_path');
  }
}
