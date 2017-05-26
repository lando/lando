<?php

/**
 * @file
 * Definition of views_handler_field_links.
 */

/**
 * Provides a handler that adds a field of links.
 *
 * This class is intended to be used as a base class and is not directly
 * exposed as a field to end-users.
 *
 * @see views_handler_field_contextual_links
 * @see views_handler_field_dropbutton
 *
 * @ingroup views_field_handlers
 */
class views_handler_field_links extends views_handler_field {
  function option_definition() {
    $options = parent::option_definition();

    $options['fields'] = array('default' => array());
    $options['destination'] = array('default' => TRUE, 'bool' => TRUE);

    return $options;
  }

  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Most style settings don't apply to an array of links.
    $form['style_settings']['#access'] = FALSE;
    $form['alter']['#access'] = FALSE;

    $all_fields = $this->view->display_handler->get_field_labels();
    // Offer to include only those fields that follow this one.
    $field_options = array_slice($all_fields, 0, array_search($this->options['id'], array_keys($all_fields)));
    $form['fields'] = array(
      '#type' => 'checkboxes',
      '#title' => t('Fields'),
      '#description' => t('Fields to be included as links.'),
      '#options' => $field_options,
      '#default_value' => $this->options['fields'],
    );
    $form['destination'] = array(
      '#type' => 'checkbox',
      '#title' => t('Include destination'),
      '#description' => t('Include a "destination" parameter in the link to return the user to the original view upon completing the action.'),
      '#default_value' => $this->options['destination'],
    );
  }

  /**
   * Internal function to get a list of links for this field.
   */
  function get_links() {
    $links = array();
    foreach ($this->options['fields'] as $field) {
      if (empty($this->view->style_plugin->rendered_fields[$this->view->row_index][$field])) {
        continue;
      }
      $title = $this->view->field[$field]->last_render_text;
      $path = '';
      if (!empty($this->view->field[$field]->options['alter']['path'])) {
        $path = $this->view->field[$field]->options['alter']['path'];
      }
      if (!empty($title) && !empty($path)) {
        // Make sure that tokens are replaced for this paths as well.
        $tokens = $this->get_render_tokens(array());
        $path = strip_tags(decode_entities(strtr($path, $tokens)));

        $links[$field] = array(
          'href' => $path,
          'title' => $title,
        );
        if (!empty($this->options['destination'])) {
          $links[$field]['query'] = backdrop_get_destination();
        }
      }
    }
    return $links;
  }

  /**
   * Render the links field.
   */
  function render($values) {
    $links = $this->get_links();
    if (!empty($links)) {
      $build = array(
        '#theme' => 'links',
        '#links' => $links,
      );
      return backdrop_render($build);
    }
    else {
      return '';
    }
  }

  function query() { }
}
