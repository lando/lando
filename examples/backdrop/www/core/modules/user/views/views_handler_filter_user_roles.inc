<?php

/**
 * @file
 * Definition of views_handler_filter_user_roles.
 */

/**
 * Filter handler for user roles.
 *
 * @ingroup views_filter_handlers
 */
class views_handler_filter_user_roles extends views_handler_filter_many_to_one {
  function get_value_options() {
    $this->value_options = user_roles(TRUE);
    unset($this->value_options[BACKDROP_AUTHENTICATED_ROLE]);
  }

  /**
   * Override empty and not empty operator labels to be clearer for user roles.
   */
  function operators() {
    $operators = parent::operators();
    $operators['empty']['title'] = t("Only has the 'Authenticated' role");
    $operators['not empty']['title'] = t("Has roles in addition to 'Authenticated'");
    return $operators;
  }
}
