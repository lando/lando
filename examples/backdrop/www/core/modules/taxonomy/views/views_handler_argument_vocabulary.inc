<?php
/**
 * Argument handler to accept a vocabulary name.
 *
 * @ingroup views_argument_handlers
 */
class views_handler_argument_vocabulary extends views_handler_argument_numeric {
  /**
   * Override the behavior of title(). Get the name of the vocabulary.
   */
  function title() {
    $vocabulary = taxonomy_vocabulary_load($this->argument);

    if (empty($vocabulary)) {
      return t('No vocabulary');
    }

    return check_plain($vocabulary->name);
  }
}
