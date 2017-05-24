<?php

/**
 * @file
 * Definition of views_handler_field_user_permissions.
 */

/**
 * Field handler to provide a list of permissions.
 *
 * @ingroup views_field_handlers
 */
class views_handler_field_user_permissions extends views_handler_field_prerender_list {
  function construct() {
    parent::construct();
    $this->additional_fields['uid'] = array('table' => 'users', 'field' => 'uid');
  }

  function query() {
    $this->add_additional_fields();
    $this->field_alias = $this->aliases['uid'];
  }

  function pre_render(&$values) {
    $uids = array();
    $this->items = array();

    // Assemble authenticated permissions which are available for all accounts.
    $permissions = module_invoke_all('permission');
    $all_roles = user_roles(FALSE, NULL, TRUE);
    $authenticated_permissions = array();
    foreach ($all_roles[BACKDROP_AUTHENTICATED_ROLE]->permissions as $permission) {
      $authenticated_permissions[$permission]['permissions'] = $permissions[$permission]['title'];
    }

    foreach ($values as $result) {
      $uid = $this->get_value($result, NULL, TRUE);
      $this->items[$uid] = $authenticated_permissions;
      $uids[] = $uid;
    }

    if ($uids) {
      $result = db_query("SELECT u.uid, u.role FROM {users_roles} u WHERE u.uid IN (:uids)", array(':uids' => $uids));
      foreach ($result as $user) {
        foreach ($all_roles as $user_role) {
          foreach ($user_role->permissions as $permission) {
            if (isset($permissions[$permission])) {
              $this->items[$user->uid][$permission]['permissions'] = $permissions[$permission]['title'];
            }
          }
        }
      }
    }
  }

  function render_item($count, $item) {
    return $item['permissions'];
  }
}
