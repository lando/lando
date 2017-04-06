<?php
/**
 * Allow role names as an argument.
 *
 * @ingroup views_argument_handlers
 */
class views_handler_argument_users_roles extends views_handler_argument_many_to_one {
  function title_query() {
    $role_names = backdrop_map_assoc((array) $this->value);
    $roles = user_roles();
    $roles = array_diff_key($roles, $role_names);
    return $roles;
  }
}
