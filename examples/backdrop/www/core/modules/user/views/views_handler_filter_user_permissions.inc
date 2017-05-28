<?php

/**
 * @file
 * Definition of views_handler_filter_user_permissions.
 */

/**
 * Filter handler for user roles.
 *
 * @ingroup views_filter_handlers
 */
class views_handler_filter_user_permissions extends views_handler_filter_many_to_one {

  function query() {
    // Convert the permission name to a list of roles that include the permission.
    $all_roles = user_roles(TRUE, NULL, TRUE);

    // If the authenticated user has this permission, no additional filtering.
    $needed_permissions = array_values(array_filter($this->value));
    $needed_count = count($needed_permissions);

    $roles_with_permissions = array();
    foreach ($all_roles as $role) {
      $matching_count = count(array_intersect($needed_permissions, $role->permissions));
      if (($this->operator !== 'and' && $matching_count) || ($this->operator === 'and' && $matching_count === $needed_count)) {
        $roles_with_permissions[] = $role->name;
      }
    }

    // The authenticated role is not in the users_roles table, so if it has the
    // permissions, special actions need to be taken.
    if (in_array(BACKDROP_AUTHENTICATED_ROLE, $roles_with_permissions)) {
      if ($this->operator === 'not') {
        // Block the display of any users at all.
        // @todo: Use a more graceful way to eliminate the query.
        $this->operator = 'and';
        $this->value = array('*NO_ROLES*');
      }
      else {
        // No action at all necessary to list all users.
        return;
      }
    }
    // Otherwise, join and search on roles as normal.
    else {
      $this->value = $roles_with_permissions;
    }

    parent::query();
  }

  function get_value_options() {
    $module_info = system_get_info('module');

    // Get a list of all the modules implementing a hook_permission() and sort by
    // display name.
    $modules = array();
    foreach (module_implements('permission') as $module) {
      $modules[$module] = $module_info[$module]['name'];
    }
    asort($modules);

    $this->value_options = array();
    foreach ($modules as $module => $display_name) {
      if ($permissions = module_invoke($module, 'permission')) {
        foreach ($permissions as $perm => $perm_item) {
          $this->value_options[t('@module module', array('@module' => $module))][$perm] = check_plain(strip_tags($perm_item['title']));
        }
      }
    }
  }
}
