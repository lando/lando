<?php

/**
 * @file
 * Definition of views_handler_field_dropbutton.
 */

/**
 * Provides a handler that adds links as a drop button.
 *
 * @ingroup views_field_handlers
 */
class views_handler_field_dropbutton extends views_handler_field_links {
  /**
   * Render the contextual fields.
   */
  function render($values) {
    $links = $this->get_links();
    if (!empty($links)) {
      $build = array(
        '#type' => 'dropbutton',
        '#links' => $links,
      );
      return backdrop_render($build);
    }
    else {
      return '';
    }
  }
}
