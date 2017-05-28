<?php
/**
 * Field handler to show the human-readable label of a vocabulary.
 *
 * @ingroup views_field_handlers
 */
class views_handler_field_vocabulary extends views_handler_field {

  function render($values) {
    // Check there is an actual value, as on a relationship there may not be.
    if ($vocabulary_name = $this->get_value($values)) {
      $vocabulary = taxonomy_vocabulary_load($vocabulary_name);
      if ($vocabulary) {
        return check_plain($vocabulary->name);
      }
    }
  }
}
