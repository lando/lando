<?php

/**
 * @file
 * Definition of views_handler_field_contextual_links.
 */

/**
 * Provides a handler that adds contextual links.
 *
 * @ingroup views_field_handlers
 */
class views_handler_field_contextual_links extends views_handler_field_links {
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Hide fields that do not apply to contextual links.
    $form['custom_label']['#access'] = FALSE;
    $form['label']['#access'] = FALSE;
    $form['element_label_colon']['#access'] = FALSE;
    $form['empty_field_behavior']['#access'] = FALSE;
  }

  function pre_render(&$values) {
    // Add a row plugin css class for the contextual link.
    $class = 'contextual-links-region';
    if (!empty($this->view->style_plugin->options['row_class'])) {
      $this->view->style_plugin->options['row_class'] .= " $class";
    }
    else {
      $this->view->style_plugin->options['row_class'] = $class;
    }
  }

  /**
   * Render the contextual fields.
   */
  function render($values) {
    $links = $this->get_links();
    if (!empty($links)) {
      $build = array(
        '#prefix' => '<div class="contextual-links-wrapper">',
        '#suffix' => '</div>',
        '#theme' => 'links__contextual',
        '#links' => $links,
        '#attributes' => array('class' => array('contextual-links')),
        '#attached' => array(
          'library' => array(array('contextual', 'contextual-links')),
        ),
        '#access' => user_access('access contextual links'),
      );
      return backdrop_render($build);
    }
    else {
      return '';
    }
  }
}
