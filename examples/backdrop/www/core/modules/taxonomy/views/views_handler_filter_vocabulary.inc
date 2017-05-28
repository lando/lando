<?php

/**
 * @file
 * Definition of views_handler_filter_vocabulary_vid.
 */

/**
 * Filter by vocabulary name.
 *
 * @ingroup views_filter_handlers
 */
class views_handler_filter_vocabulary extends views_handler_filter_in_operator {
  function get_value_options() {
    if (isset($this->value_options)) {
      return;
    }

    $this->value_options = array();
    $vocabularies = taxonomy_vocabulary_load_multiple(FALSE);
    foreach ($vocabularies as $vocabulary) {
      $this->value_options[$vocabulary->machine_name] = $vocabulary->name;
    }
  }
}
