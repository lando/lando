<?php

/**
 * Displays a view listing as a block, with overriding options.
 */
class ViewsBlock extends Block {
  protected $viewOutput = array(
    'content' => '',
    'subject' => '',
    'path' => NULL,
  );

  /**
   * {@inheritdoc}
   */
  function __construct($plugin_name, array $data) {
    parent::__construct($plugin_name, $data);

    $this->settings += array(
      'allowed' => array(),
      'path_override' => FALSE,
    );
  }

  /**
   * Given the loaded View object, populate the default settings for this block.
   *
   * @param View $view
   *   The View being displayed within this block.
   */
  protected function setDefaultsFromView(View $view) {
    $pager = $view->display_handler->get_option('pager');

    $this->settings = array_merge(array(
      'link_to_view' => $view->display_handler->get_option('link_to_view'),
      'more_link' => $view->display_handler->get_option('use_more'),
      'use_pager' => $pager['type'] != 'none' && $pager['type'] != 'some',
      'pager_id' => isset($pager['options']['id']) ? $pager['options']['id'] : 0,
      'items_per_page' => !empty($pager['options']['items_per_page']) ? $pager['options']['items_per_page'] : 10,
      'offset' => !empty($pager['options']['offset']) ? $pager['options']['offset'] : 0,
      'path' => $view->get_path(),
      'fields_override' => $view->display_handler->get_option('fields_override'),
    ), $this->settings);
  }

  /**
   * {@inheritdoc}
   */
  function getAdminTitle() {
    list($view_name, $display_id) = explode('-', $this->delta);
    if ($view = views_get_view($view_name)) {
      $view->set_display($display_id);
      if ($block_description = $view->display_handler->get_option('block_description')) {
        $info = t($block_description);
      }
      elseif ($view->display[$display_id]->display_title == $view->display_handler->definition['title']) {
        $info = t('View: @view', array('@view' => $view->get_human_name()));
      }
      else {
        $info = t('View: @view (@display)', array('@view' => $view->get_human_name(), '@display' => $view->display[$display_id]->display_title));
      }

    }
    return $info;
  }

  /**
   * {@inheritdoc}
   */
  function prepare() {
    parent::prepare();

    list($view_name, $display_id) = explode('-', $this->delta);
    if ($view = views_get_view($view_name)) {
      if (!$view->access($display_id)) {
        $view->destroy();
        return;
      }
      $this->setDefaultsFromView($view);

      $view->set_display($display_id);
      $view->display_handler->set_override_options($this->settings);

      $args = array();
      $arguments = $view->display_handler->get_option('arguments');

      foreach ($view->display_handler->get_argument_input() as $id => $argument) {
        switch ($argument['type']) {
          case 'context':
            // @todo: Context handling non-existent at the moment.
            /*
            $context_keys = isset($this->settings['context']) ? $this->settings['context'] : array();
            $key = array_shift($context_keys);
            if (isset($contexts[$key])) {
              if (strpos($argument['context'], '.')) {
                list($context, $converter) = explode('.', $argument['context'], 2);
                $args[] = layout_context_convert_context($contexts[$key], $converter, array('sanitize' => FALSE));
              }
              else {
                $args[] = $contexts[$key]->argument;
              }
            }
            else {
              $args[] = isset($arguments[$id]['exception']['value']) ? $arguments[$id]['exception']['value'] : 'all';
            }
            */
            break;

          case 'fixed':
            $args[] = $argument['fixed'];
            break;

          case 'user':
            $args[] = (isset($this->settings['arguments'][$id]) && strlen($this->settings['arguments'][$id])) ? $this->settings['arguments'][$id] : NULL;
            break;

          case 'wildcard':
            // Put in the wildcard.
            $args[] = isset($arguments[$id]['wildcard']) ? $arguments[$id]['wildcard'] : '*';
            break;

          case 'none':
          default:
            // Let Views handle a NULL (or missing) argument.
            $args[] = NULL;
            break;
        }
      }

      // Remove any trailing NULL arguments as these are non-args:
      while (count($args) && end($args) === NULL) {
        array_pop($args);
      }

      $view->set_arguments($args);

      $allow = $view->display_handler->get_option('allow');

      if ($allow['path_override'] && !empty($this->settings['path'])) {
        $view->override_path = $this->settings['path'];
      }
      else if ($path = $view->display_handler->get_option('inherit_path')) {
        $view->override_path = $_GET['q'];
      }

      // More link.
      if ($allow['more_link']) {
        if (empty($this->settings['more_link'])) {
          $view->display_handler->set_option('use_more', FALSE);
        }
        else {
          $view->display_handler->set_option('use_more', TRUE);
          // Make sure the view runs the count query so we know whether or not
          // the more link applies.
          $view->get_total_rows = TRUE;
        }
      }

      if ($allow['items_per_page'] && isset($this->settings['items_per_page'])) {
        $view->set_items_per_page($this->settings['items_per_page']);
      }

      if ($allow['offset']) {
        $view->set_offset($this->settings['offset']);
      }

      if ($allow['use_pager']) {
        // Only set use_pager if they differ, this way we can avoid overwriting the
        // pager type that Views uses.
        $pager = $view->display_handler->get_option('pager');
        if ($this->settings['use_pager'] && ($pager['type'] == 'none' || $pager['type'] == 'some')) {
          $pager['type'] = 'full';
        }
        elseif (!$this->settings['use_pager'] && $pager['type'] != 'none' && $pager['type'] != 'some') {
          $pager['type'] = $view->get_items_per_page() || !empty($pager['options']['items_per_page']) ? 'some' : 'none';
        }

        if ($this->settings['use_pager']) {
          if (!isset($pager['options']['id']) || (isset($this->settings['pager_id']) && $pager['options']['id'] != $this->settings['pager_id'])) {
            $pager['options']['id'] = (int) $this->settings['pager_id'];
          }
        }

        $view->display_handler->set_option('pager', $pager);
      }

      if ($allow['fields_override']) {
        if ($this->settings['fields_override']) {
          $fields = $view->get_items('field');
          foreach ($fields as $field => $field_display) {
            $fields[$field]['exclude'] = empty($this->settings['fields_override'][$field]);
          }
          $view->display_handler->set_option('fields', $fields);

        }
      }

      if ($allow['exposed_form'] && !empty($this->settings['exposed'])) {
        foreach ($this->settings['exposed'] as $filter_name => $filter_value) {
          if (!is_array($filter_value)) {
            $this->settings['exposed'][$filter_name] = $filter_value;
          }
        }
        $view->set_exposed_input($this->settings['exposed']);
      }

      $output = $view->execute_display($display_id);
      if ($output) {
        if (is_string($output['content'])) {
          $output['content'] = array(
            '#markup' => $output['content'],
          );
        }

        if (($allow['link_to_view'] && !empty($this->settings['link_to_view'])) ||
          (!$allow['link_to_view'] && $view->display_handler->get_option('link_to_view'))) {
          $output['path'] = $view->get_url();
        }

        views_add_contextual_links($output['content'], 'block', $view, $display_id);

        $this->viewOutput = $output;
      }

      $view->destroy();
    }
  }

  /**
   * {@inheritdoc}
   */
  function getTitle() {
    // Set a custom title in the parent method.
    $title = parent::getTitle();

    // If no custom title, pull from the View output.
    if ($this->settings['title_display'] === LAYOUT_TITLE_DEFAULT) {
      $title = $this->viewOutput['subject'];
    }

    // Link to the view if a path is provided in ViewsBlock::prepare().
    if ($title && isset($this->viewOutput['path'])) {
      $title = l($title, $this->viewOutput['path'], array('html' => TRUE));
    }

    return $title;
  }

  /**
   * {@inheritdoc}
   */
  function getContent() {
    return $this->viewOutput['content'];
  }

  /**
   * {@inheritdoc}
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);

    list($name, $display_id) = explode('-', $this->delta);
    $view = views_get_view($name);

    if (empty($view)) {
      $form['markup'] = array('#markup' => t('Broken/missing/deleted view.'));
      return;
    }

    $view->set_display($display_id);

    // If it couldn't set the display and we got the default display instead,
    // fail.
    if ($view->current_display == 'default') {
      $form['markup'] = array('#markup' => t('Broken/missing/deleted view display.'));
      return;
    }

    // Get the list of settings that are allowed to be overridden.
    $allow = $view->display_handler->get_option('allow');

    // Provide defaults for everything in order to prevent warnings.
    $this->setDefaultsFromView($view);

    $form['arguments']['#tree'] = TRUE;

    foreach ($view->display_handler->get_argument_input() as $id => $argument) {
      if ($argument['type'] == 'user') {
        $form['arguments'][$id] = array(
          '#type' => 'textfield',
          '#default_value' => isset($this->settings['arguments'][$id]) ? $this->settings['arguments'][$id] : '',
          '#title' => check_plain($argument['label']),
        );
      }
    }
    if ($allow['link_to_view'] ) {
      $form['link_to_view'] = array(
        '#type' => 'checkbox',
        '#default_value' => isset($this->settings['link_to_view']) ? $this->settings['link_to_view'] : $view->display_handler->get_option('link_to_view'),
        '#title' => t('Link title to view page path'),
        '#states' => array(
          'visible' => array(
            'form.layout-block-configure-form :input[name="title_display"]' => array('!value' => LAYOUT_TITLE_NONE),
          ),
        ),
      );
    }
    if ($allow['more_link']) {
      $form['more_link'] = array(
        '#type' => 'checkbox',
        '#default_value' => isset($this->settings['more_link']) ? $this->settings['more_link'] : $view->display_handler->get_option('use_more'),
        '#description' => t('The text of this link will be "@more". The text can be modified within the view configuration.', array('@more' => $view->display_handler->use_more_text())),
        '#title' => t('Provide a "more" link.'),
      );
    }

    if ($allow['path_override']) {
      $form['path_override'] = array(
        '#type' => 'checkbox',
        '#default_value' => $this->settings['path_override'],
        '#title' => t('Override path'),
        '#description' => t('Use a different path for the more link, pager, and other links.')
      );
      $form['path'] = array(
        '#type' => 'textfield',
        '#default_value' => isset($this->settings['path']) ? $this->settings['path'] : $view->get_path(),
        '#title' => t('Override path'),
        '#size' => 30,        '#states' => array(
          'visible' => array(
            ':input[name="path_override"]' => array('checked' => TRUE),
          ),
        ),
      );
    }

    $view->init_style();
    if (empty($this->settings['exposed'])) {
      $this->settings['exposed'] = array();
    }

    if ($allow['exposed_form']) {
      // If the exposed form is part of block configuration, get the exposed
      // form re-tool it for our use.
      $exposed_form_state = array(
        'view' => &$view,
        'display' => &$view->display[$display_id],
      );

      $view->set_exposed_input($this->settings['exposed']);

      $exposed_form_state['exposed_form_plugin'] = $view->display_handler->get_plugin('exposed_form');
      $view->init_handlers();
      $exposed_form = array();
      $exposed_form = views_exposed_form($exposed_form, $exposed_form_state);

      foreach ($exposed_form['#info'] as $id => $info) {
        $form['exposed'][$id] = array(
          '#type' => 'item',
          '#id' => 'views-exposed-block',
        );

        if (!empty($info['label'])) {
          $form['exposed'][$id]['#title'] = $info['label'];
        }

        if (!empty($info['operator']) && !empty($exposed_form[$info['operator']])) {
          $form['exposed'][$id][$info['operator']] = $exposed_form[$info['operator']];
          $form['exposed'][$id][$info['operator']]['#parents'] = array('exposed', $info['operator']);
          $form['exposed'][$id][$info['operator']]['#default_value'] = isset($this->settings['exposed'][$info['operator']]) ? $this->settings['exposed'][$info['operator']] : '';
        }
        $form['exposed'][$id][$info['value']] = $exposed_form[$info['value']];
        $form['exposed'][$id][$info['value']]['#parents'] = array('exposed', $info['value']);
        $form['exposed'][$id][$info['value']]['#default_value'] = isset($this->settings['exposed'][$info['value']]) ? $this->settings['exposed'][$info['value']] : '';
      }
    }

    // The exposed sort stuff doesn't fall into $exposed_form['#info'] so we
    // have to handle it separately.
    if (isset($exposed_form['sort_by'])) {
      $form['exposed']['sort_by'] = $exposed_form['sort_by'];
    }

    if (isset($exposed_form['sort_order'])) {
      $form['exposed']['sort_order'] = $exposed_form['sort_order'];
    }

    if (!empty($form['exposed'])) {
      $form['exposed'] += array(
        '#title' => t('Filter options'),
        '#type' => 'fieldset',
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
        '#tree' => TRUE,
      );
    }

    if ($allow['fields_override'] && $view->style_plugin->uses_fields()) {
      $form['fields_override'] = array(
        '#type' => 'fieldset',
        '#title' => 'Fields to display',
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
        '#tree' => TRUE,
      );
      foreach ($view->display_handler->get_handlers('field') as $field => $handler) {
        $title = $handler->ui_name();
        if ($handler->options['label']) {
          $title .= ' (' . check_plain($handler->options['label']) . ')';
        }

        $form['fields_override'][$field] = array(
          '#type' => 'checkbox',
          '#title' => $title,
          '#default_value' => isset($this->settings['fields_override'][$field]) ? $this->settings['fields_override'][$field] : !$handler->options['exclude'],
        );
      }
    }

    if ($allow['use_pager']) {
      $form['pager']['use_pager'] = array(
        '#type' => 'checkbox',
        '#title' => t('Use pager'),
        '#default_value' => $this->settings['use_pager'],
      );
      $form['pager']['pager_id'] = array(
        '#type' => 'number',
        '#default_value' => $this->settings['pager_id'],
        '#title' => t('Pager ID'),
        '#step' => 1,
        '#min' => 0,
        '#max' => 999,
        '#states' => array(
          'visible' => array(
            'input[name="use_pager"]' => array('checked' => TRUE),
          ),
        ),
      );
    }
    if ($allow['items_per_page']) {
      $form['pager']['items_per_page'] = array(
        '#type' => 'number',
        '#default_value' => $this->settings['items_per_page'],
        '#title' => t('Number of items'),
        '#min' => 0,
        '#max' => 1000,
        '#description' => t('Select the number of items to display, or 0 to display all results.'),
      );
    }
    if ($allow['offset']) {
      $form['pager']['offset'] = array(
        '#type' => 'textfield',
        '#default_value' => $this->settings['offset'],
        '#title' => t('Offset'),
        '#size' => 4,
        '#description' => t('Enter the number of items to skip; enter 0 to skip no items.'),
      );
    }
    if (!empty($form['pager'])) {
      $form['pager'] += array(
        '#type' => 'fieldset',
        '#title' => t('Pager options'),
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
        '#tree' => FALSE,
      );
    }
  }

  /**
   * {@inheritdoc}
   */
  function formValidate($form, &$form_state) {
    parent::formValidate($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  function formSubmit($form, &$form_state) {
    parent::formSubmit($form, $form_state);

    // Copy everything from our defaults.
    $keys = array(
      'link_to_view',
      'more_link',
      'use_pager',
      'pager_id',
      'items_per_page',
      'offset',
      'path_override',
      'path',
      'arguments',
      'fields_override',
      'exposed',
    );

    foreach ($keys as $key) {
      if (isset($form_state['values'][$key])) {
        $this->settings[$key] = $form_state['values'][$key];
      }
    }
  }
}
