<?php

/**
 * @file
 * Hooks provided by the User module.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Act on user objects when loaded from the database.
 *
 * Due to the static cache in user_load_multiple() you should not use this
 * hook to modify the user properties returned by the {users} table itself
 * since this may result in unreliable results when loading from cache.
 *
 * @param $users
 *   An array of user objects, indexed by uid.
 *
 * @see user_load_multiple()
 * @see profile_user_load()
 */
function hook_user_load($users) {
  $result = db_query('SELECT uid, foo FROM {my_table} WHERE uid IN (:uids)', array(':uids' => array_keys($users)));
  foreach ($result as $record) {
    $users[$record->uid]->foo = $record->foo;
  }
}

/**
 * Act before user deletion.
 *
 * This hook is invoked from user_delete_multiple() before
 * field_attach_delete() is called and before the user is actually removed from
 * the database.
 *
 * Modules should additionally implement hook_user_cancel() to process stored
 * user data for other account cancellation methods.
 *
 * @param $account
 *   The account that is about to be deleted.
 *
 * @see hook_user_delete()
 * @see user_delete_multiple()
 */
function hook_user_predelete($account) {
  db_delete('mytable')
    ->condition('uid', $account->uid)
    ->execute();
}

/**
 * Respond to user deletion.
 *
 * This hook is invoked from user_delete_multiple() after field_attach_delete()
 * has been called and after the user has been removed from the database.
 *
 * Modules should additionally implement hook_user_cancel() to process stored
 * user data for other account cancellation methods.
 *
 * @param $account
 *   The account that has been deleted.
 *
 * @see hook_user_predelete()
 * @see user_delete_multiple()
 */
function hook_user_delete($account) {
  backdrop_set_message(t('User: @name has been deleted.', array('@name' => $account->name)));
}

/**
 * Act on user account cancellations.
 *
 * This hook is invoked from user_cancel() before a user account is canceled.
 * Depending on the account cancellation method, the module should either do
 * nothing, unpublish content, or anonymize content. See user_cancel_methods()
 * for the list of default account cancellation methods provided by User module.
 * Modules may add further methods via hook_user_cancel_methods_alter().
 *
 * This hook is NOT invoked for the 'user_cancel_delete' account cancellation
 * method. To react to that method, implement hook_user_predelete() or
 * hook_user_delete() instead.
 *
 * Expensive operations should be added to the global account cancellation batch
 * by using batch_set().
 *
 * @param $edit
 *   The array of form values submitted by the user. Assign values to this
 *   array to save changes in the database.
 * @param $account
 *   The user object on which the operation is performed. Values assigned in
 *   this object will not be saved in the database.
 * @param $method
 *   The account cancellation method.
 *
 * @see user_cancel_methods()
 * @see hook_user_cancel_methods_alter()
 */
function hook_user_cancel($edit, $account, $method) {
  switch ($method) {
    case 'user_cancel_block_unpublish':
      // Unpublish nodes (current revisions).
      module_load_include('inc', 'node', 'node.admin');
      $nodes = db_select('node', 'n')
        ->fields('n', array('nid'))
        ->condition('uid', $account->uid)
        ->execute()
        ->fetchCol();
      node_mass_update($nodes, array('status' => 0));
      break;

    case 'user_cancel_reassign':
      // Anonymize nodes (current revisions).
      module_load_include('inc', 'node', 'node.admin');
      $nodes = db_select('node', 'n')
        ->fields('n', array('nid'))
        ->condition('uid', $account->uid)
        ->execute()
        ->fetchCol();
      node_mass_update($nodes, array('uid' => 0));
      // Anonymize old revisions.
      db_update('node_revision')
        ->fields(array('uid' => 0))
        ->condition('uid', $account->uid)
        ->execute();
      // Clean history.
      db_delete('history')
        ->condition('uid', $account->uid)
        ->execute();
      break;
  }
}

/**
 * Modify account cancellation methods.
 *
 * By implementing this hook, modules are able to add, customize, or remove
 * account cancellation methods. All defined methods are turned into radio
 * button form elements by user_cancel_methods() after this hook is invoked.
 * The following properties can be defined for each method:
 * - title: The radio button's title.
 * - description: (optional) A description to display on the confirmation form
 *   if the user is not allowed to select the account cancellation method. The
 *   description is NOT used for the radio button, but instead should provide
 *   additional explanation to the user seeking to cancel their account.
 * - access: (optional) A boolean value indicating whether the user can access
 *   a method. If access is defined, the method cannot be configured as the
 *   default method.
 *
 * @param $methods
 *   An array containing user account cancellation methods, keyed by method id.
 *
 * @see user_cancel_methods()
 * @see user_cancel_confirm_form()
 */
function hook_user_cancel_methods_alter(&$methods) {
  // Limit access to disable account and unpublish content method.
  $methods['user_cancel_block_unpublish']['access'] = user_access('administer site configuration');

  // Remove the content re-assigning method.
  unset($methods['user_cancel_reassign']);

  // Add a custom zero-out method.
  $methods['mymodule_zero_out'] = array(
    'title' => t('Delete the account and remove all content.'),
    'description' => t('All your content will be replaced by empty strings.'),
    // access should be used for administrative methods only.
    'access' => user_access('access zero-out account cancellation method'),
  );
}

/**
 * Alter the username that is displayed for a user.
 *
 * Called by user_format_name() to allow modules to alter the username that's
 * displayed. Can be used to ensure user privacy in situations where
 * $account->name is too revealing.
 *
 * @param $name
 *   The string that user_format_name() will return.
 *
 * @param $account
 *   The account object passed to user_format_name().
 *
 * @see user_format_name()
 */
function hook_user_format_name_alter(&$name, $account) {
  // Display the user's uid instead of name.
  if (isset($account->uid)) {
    $name = t('User !uid', array('!uid' => $account->uid));
  }
}

/**
 * Act on a user account being inserted or updated.
 *
 * This hook is invoked before the user account is saved to the database.
 *
 * Modules that want to store properties in the serialized {users}.data column,
 * which is automatically loaded whenever a user account object is loaded, may
 * add their properties to $account->data in order to have their data serialized
 * on save.
 *
 * @param $account
 *   The user account object.
 *
 * @see hook_user_insert()
 * @see hook_user_update()
 */
function hook_user_presave($account) {
  // Make sure that our form value 'mymodule_foo' is stored as
  // 'mymodule_bar' in the 'data' (serialized) column.
  if (isset($account->mymodule_foo)) {
    $account->data['mymodule_bar'] = $account->mymodule_foo;
  }
}

/**
 * Respond to creation of a new user account.
 *
 * @param $account
 *   The user account object.
 *
 * @see hook_user_presave()
 * @see hook_user_update()
 */
function hook_user_insert($account) {
  db_insert('mytable')
    ->fields(array(
      'uid' => $account->uid,
      'created' => REQUEST_TIME,
    ))
    ->execute();
}

/**
 * Respond to updates to a user account.
 *
 * @param $account
 *   The user account object.
 *
 * @see hook_user_presave()
 * @see hook_user_insert()
 */
function hook_user_update($account) {
  db_insert('user_changes')
    ->fields(array(
      'uid' => $account->uid,
      'changed' => REQUEST_TIME,
    ))
    ->execute();
}

/**
 * The user just logged in.
 *
 * @param $edit
 *   The array of form values submitted by the user.
 * @param $account
 *   The user object on which the operation was just performed.
 */
function hook_user_login(&$edit, $account) {
  $config = config('system.date');
  // If the user has a NULL time zone, notify them to set a time zone.
  if (!$account->timezone && $config->get('user_configurable_timezones') && $config->get('user_empty_timezone_message')) {
    backdrop_set_message(t('Configure your <a href="@user-edit">account time zone setting</a>.', array('@user-edit' => url("user/$account->uid/edit", array('query' => backdrop_get_destination(), 'fragment' => 'edit-timezone')))));
  }
}

/**
 * The user just logged out.
 * @param $account
 *   The user object on which the operation was just performed.
 */
function hook_user_logout($account) {
  db_insert('logouts')
    ->fields(array(
      'uid' => $account->uid,
      'time' => time(),
    ))
    ->execute();
}

/**
 * The user's account information is being displayed.
 *
 * The module should format its custom additions for display and add them to the
 * $account->content array.
 *
 * Note that when this hook is invoked, the changes have not yet been written to
 * the database, because a database transaction is still in progress. The
 * transaction is not finalized until the save operation is entirely completed
 * and user_save() goes out of scope. You should not rely on data in the
 * database at this time as it is not updated yet. You should also note that any
 * write/update database queries executed from this hook are also not committed
 * immediately. Check user_save() and db_transaction() for more info.
 *
 * @param $account
 *   The user object on which the operation is being performed.
 * @param $view_mode
 *   View mode, e.g. 'full'.
 * @param $langcode
 *   The language code used for rendering.
 *
 * @see hook_user_view_alter()
 * @see hook_entity_view()
 */
function hook_user_view($account, $view_mode, $langcode) {
  $account->content['user_picture'] = array(
    '#markup' => theme('user_picture', array('account' => $account)),
    '#weight' => -10,
  );
  $account->content['member_for'] = array(
    '#type' => 'item',
    '#title' => t('Member for'),
    '#markup' => format_interval(REQUEST_TIME - $account->created),
  );
}

/**
 * The user was built; the module may modify the structured content.
 *
 * This hook is called after the content has been assembled in a structured array
 * and may be used for doing processing which requires that the complete user
 * content structure has been built.
 *
 * If the module wishes to act on the rendered HTML of the user rather than the
 * structured content array, it may use this hook to add a #post_render callback.
 * Alternatively, it could also implement hook_preprocess_user_profile(). See
 * backdrop_render() and theme() documentation respectively for details.
 *
 * @param $build
 *   A renderable array representing the user.
 *
 * @see user_view()
 * @see hook_entity_view_alter()
 */
function hook_user_view_alter(&$build) {
  // Check for the existence of a field added by another module.
  if (isset($build['an_additional_field'])) {
    // Change its weight.
    $build['an_additional_field']['#weight'] = -10;
  }

  // Add a #post_render callback to act on the rendered HTML of the user.
  $build['#post_render'][] = 'my_module_user_post_render';
}

/**
 * Act on a user role being inserted or updated.
 *
 * Modules implementing this hook can act on the user role object before
 * it has been saved to the database.
 *
 * @param $role
 *   A user role object.
 *
 * @see hook_user_role_insert()
 * @see hook_user_role_update()
 */
function hook_user_role_presave($role) {
  // Set a UUID for the user role if it doesn't already exist
  if (empty($role->uuid)) {
    $role->uuid = uuid_uuid();
  }
}

/**
 * Respond to creation of a new user role.
 *
 * Modules implementing this hook can act on the user role object when saved to
 * the database. It's recommended that you implement this hook if your module
 * adds additional data to user roles object. The module should save its custom
 * additions to the database.
 *
 * @param $role
 *   A user role object.
 */
function hook_user_role_insert($role) {
  // Save extra fields provided by the module to user roles.
  db_insert('my_module_table')
    ->fields(array(
      'role' => $role->name,
      'role_description' => $role->description,
    ))
    ->execute();
}

/**
 * Respond to updates to a user role.
 *
 * Modules implementing this hook can act on the user role object when updated.
 * It's recommended that you implement this hook if your module adds additional
 * data to user roles object. The module should save its custom additions to
 * the database.
 *
 * @param $role
 *   A user role object.
 */
function hook_user_role_update($role) {
  // Save extra fields provided by the module to user roles.
  db_merge('my_module_table')
    ->key(array('role' => $role->name))
    ->fields(array(
      'role_description' => $role->description
    ))
    ->execute();
}

/**
 * Respond to user role deletion.
 *
 * This hook allows you act when a user role has been deleted.
 * If your module stores references to roles, it's recommended that you
 * implement this hook and delete existing instances of the deleted role
 * in your module database tables.
 *
 * @param $role
 *   The $role object being deleted.
 */
function hook_user_role_delete($role) {
  // Delete existing instances of the deleted role.
  db_delete('my_module_table')
    ->condition('role', $role->name)
    ->execute();
}

/**
 * @} End of "addtogroup hooks".
 */
