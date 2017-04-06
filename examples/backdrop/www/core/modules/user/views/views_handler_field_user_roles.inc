<?php

/**
 * @file
 * Definition of views_handler_field_user_roles.
 */

/**
 * Field handler to provide a list of roles.
 *
 * @ingroup views_field_handlers
 */
class views_handler_field_user_roles extends views_handler_field_prerender_list {
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

    foreach ($values as $result) {
      $uids[] = $this->get_value($result, NULL, TRUE);
    }

    if ($uids) {
      $result = db_query("SELECT uid, role FROM {users_roles} WHERE uid IN (:uids)", array(':uids' => $uids));
      $role_names = user_roles();
      foreach ($result as $role) {
        $this->items[$role->uid][$role->role]['role_label'] = $role_names[$role->role];
        $this->items[$role->uid][$role->role]['role_name'] = $role->role;
      }
    }
  }

  function render_item($count, $item) {
    return check_plain($item['role_label']);
  }

  function document_self_tokens(&$tokens) {
    $tokens['[' . $this->options['id'] . '-role' . ']'] = t('The label of the role.');
    $tokens['[' . $this->options['id'] . '-name' . ']'] = t('The machine name of the role.');
  }

  function add_self_tokens(&$tokens, $item) {
    if (!empty($item['role_label'])) {
      $tokens['[' . $this->options['id'] . '-role' . ']'] = $item['role_label'];
      $tokens['[' . $this->options['id'] . '-name' . ']'] = $item['role_name'];
    }
  }
}
