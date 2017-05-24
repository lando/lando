<?php
/**
 * @file
 * Hooks provided by the Node module.
 */

/**
 * @defgroup node_api_hooks Node API Hooks
 * @{
 * Functions to define and modify content types.
 *
 * Each content type is maintained by a primary module, which is either
 * node.module (for content types created in the user interface) or the module
 * that provides a node type in its default config directory. Modules that
 * provide a content type should explicitly set the "module" key in their
 * config file.
 *
 * During node operations (create, update, view, delete, etc.), there are
 * several sets of hooks that get invoked to allow modules to modify the base
 * node operation:
 * - Node-type-specific hooks: When defining a node type, hook_node_info()
 *   returns a 'base' component. Node-type-specific hooks are named
 *   base_hookname() instead of mymodule_hookname() (in a module called
 *   'mymodule' for example). Only the node type's corresponding implementation
 *   is invoked. For example, book_node_info() in book.module defines the base
 *   for the 'book' node type as 'book'. So when a book node is created,
 *   hook_insert() is invoked on book_insert() only. Hooks that are
 *   node-type-specific are noted below.
 * - All-module hooks: This set of hooks is invoked on all implementing modules,
 *   to allow other modules to modify what the primary node module is doing. For
 *   example, hook_node_insert() is invoked on all modules when creating a book
 *   node.
 * - Field hooks: Hooks related to the fields attached to the node. These are
 *   invoked from the field operations functions described below, and can be
 *   either field-type-specific or all-module hooks.
 * - Entity hooks: Generic hooks for "entity" operations. These are always
 *   invoked on all modules.
 *
 * Here is a list of the node and entity hooks that are invoked, field
 * operations, and other steps that take place during node operations:
 * - Creating a new node (calling node_save() on a new node):
 *   - field_attach_presave()
 *   - hook_node_presave() (all)
 *   - hook_entity_presave() (all)
 *   - Node and revision records are written to the database
 *   - hook_insert() (node-type-specific)
 *   - field_attach_insert()
 *   - hook_node_insert() (all)
 *   - hook_entity_insert() (all)
 *   - hook_node_access_records() (all)
 *   - hook_node_access_records_alter() (all)
 * - Updating an existing node (calling node_save() on an existing node):
 *   - field_attach_presave()
 *   - hook_node_presave() (all)
 *   - hook_entity_presave() (all)
 *   - Node and revision records are written to the database
 *   - hook_update() (node-type-specific)
 *   - field_attach_update()
 *   - hook_node_update() (all)
 *   - hook_entity_update() (all)
 *   - hook_node_access_records() (all)
 *   - hook_node_access_records_alter() (all)
 * - Loading a node (calling node_load(), node_load_multiple() or entity_load()
 *   with $entity_type of 'node'):
 *   - Node and revision information is read from database.
 *   - hook_load() (node-type-specific)
 *   - field_attach_load_revision() and field_attach_load()
 *   - hook_entity_load() (all)
 *   - hook_node_load() (all)
 * - Viewing a single node (calling node_view() - note that the input to
 *   node_view() is a loaded node, so the Loading steps above are already done):
 *   - hook_view() (node-type-specific)
 *   - field_attach_prepare_view()
 *   - hook_entity_prepare_view() (all)
 *   - field_attach_view()
 *   - hook_node_view() (all)
 *   - hook_entity_view() (all)
 *   - hook_node_view_alter() (all)
 *   - hook_entity_view_alter() (all)
 * - Viewing multiple nodes (calling node_view_multiple() - note that the input
 *   to node_view_multiple() is a set of loaded nodes, so the Loading steps
 *   above are already done):
 *   - field_attach_prepare_view()
 *   - hook_entity_prepare_view() (all)
 *   - hook_view() (node-type-specific)
 *   - field_attach_view()
 *   - hook_node_view() (all)
 *   - hook_entity_view() (all)
 *   - hook_node_view_alter() (all)
 *   - hook_entity_view_alter() (all)
 * - Deleting a node (calling node_delete() or node_delete_multiple()):
 *   - Node is loaded (see Loading section above)
 *   - hook_delete() (node-type-specific)
 *   - hook_node_predelete() (all)
 *   - hook_entity_predelete() (all)
 *   - field_attach_delete()
 *   - Node and revision information are deleted from database
 *   - hook_node_delete() (all)
 *   - hook_entity_delete() (all)
 * - Deleting a node revision (calling node_revision_delete()):
 *   - Node is loaded (see Loading section above)
 *   - Revision information is deleted from database
 *   - hook_node_revision_delete() (all)
 *   - field_attach_delete_revision()
 * - Preparing a node for editing (calling node_form() - note that if it is an
 *   existing node, it will already be loaded; see the Loading section above):
 *   - hook_prepare() (node-type-specific)
 *   - hook_node_prepare() (all)
 *   - hook_form() (node-type-specific)
 *   - field_attach_form()
 * - Validating a node during editing form submit (calling
 *   node_form_validate()):
 *   - hook_validate() (node-type-specific)
 *   - hook_node_validate() (all)
 *   - field_attach_form_validate()
 * - Searching (calling node_search_execute()):
 *   - hook_ranking() (all)
 *   - Query is executed to find matching nodes
 *   - Resulting node is loaded (see Loading section above)
 *   - Resulting node is prepared for viewing (see Viewing a single node above)
 *   - comment_node_update_index() is called.
 *   - hook_node_search_result() (all)
 * - Search indexing (calling node_update_index()):
 *   - Node is loaded (see Loading section above)
 *   - Node is prepared for viewing (see Viewing a single node above)
 *   - hook_node_update_index() (all)
 * @}
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Inform the node access system what permissions the user has.
 *
 * This hook is for implementation by node access modules. In this hook,
 * the module grants a user different "grant IDs" within one or more
 * "realms". In hook_node_access_records(), the realms and grant IDs are
 * associated with permission to view, edit, and delete individual nodes.
 *
 * The realms and grant IDs can be arbitrarily defined by your node access
 * module; it is common to use role IDs as grant IDs, but that is not required.
 * Your module could instead maintain its own list of users, where each list has
 * an ID. In that case, the return value of this hook would be an array of the
 * list IDs that this user is a member of.
 *
 * A node access module may implement as many realms as necessary to properly
 * define the access privileges for the nodes. Note that the system makes no
 * distinction between published and unpublished nodes. It is the module's
 * responsibility to provide appropriate realms to limit access to unpublished
 * content.
 *
 * Node access records are stored in the {node_access} table and define which
 * grants are required to access a node. There is a special case for the view
 * operation -- a record with node ID 0 corresponds to a "view all" grant for
 * the realm and grant ID of that record. If there are no node access modules
 * enabled, the core node module adds a node ID 0 record for realm 'all'. Node
 * access modules can also grant "view all" permission on their custom realms;
 * for example, a module could create a record in {node_access} with:
 * @code
 * $record = array(
 *   'nid' => 0,
 *   'gid' => 888,
 *   'realm' => 'example_realm',
 *   'grant_view' => 1,
 *   'grant_update' => 0,
 *   'grant_delete' => 0,
 * );
 * backdrop_write_record('node_access', $record);
 * @endcode
 * And then in its hook_node_grants() implementation, it would need to return:
 * @code
 * if ($op == 'view') {
 *   $grants['example_realm'] = array(888);
 * }
 * @endcode
 * If you decide to do this, be aware that the node_access_rebuild() function
 * will erase any node ID 0 entry when it is called, so you will need to make
 * sure to restore your {node_access} record after node_access_rebuild() is
 * called.
 *
 * @param $account
 *   The user object whose grants are requested.
 * @param $op
 *   The node operation to be performed, such as 'view', 'update', or 'delete'.
 *
 * @return
 *   An array whose keys are "realms" of grants, and whose values are arrays of
 *   the grant IDs within this realm that this user is being granted.
 *
 * For a detailed example, see node_access_example.module.
 *
 * @see node_access_view_all_nodes()
 * @see node_access_rebuild()
 * @ingroup node_access
 */
function hook_node_grants($account, $op) {
  if (user_access('access private content', $account)) {
    $grants['example'] = array(1);
  }
  $grants['example_author'] = array($account->uid);
  return $grants;
}

/**
 * Set permissions for a node to be written to the database.
 *
 * When a node is saved, a module implementing hook_node_access_records() will
 * be asked if it is interested in the access permissions for a node. If it is
 * interested, it must respond with an array of permissions arrays for that
 * node.
 *
 * Node access grants apply regardless of the published or unpublished status
 * of the node. Implementations must make sure not to grant access to
 * unpublished nodes if they don't want to change the standard access control
 * behavior. Your module may need to create a separate access realm to handle
 * access to unpublished nodes.
 *
 * Note that the grant values in the return value from your hook must be
 * integers and not boolean TRUE and FALSE.
 *
 * Each permissions item in the array is an array with the following elements:
 * - 'realm': The name of a realm that the module has defined in
 *   hook_node_grants().
 * - 'gid': A 'grant ID' from hook_node_grants().
 * - 'grant_view': If set to 1 a user that has been identified as a member
 *   of this gid within this realm can view this node. This should usually be
 *   set to $node->status. Failure to do so may expose unpublished content
 *   to some users.
 * - 'grant_update': If set to 1 a user that has been identified as a member
 *   of this gid within this realm can edit this node.
 * - 'grant_delete': If set to 1 a user that has been identified as a member
 *   of this gid within this realm can delete this node.
 *
 *
 * When an implementation is interested in a node but want to deny access to
 * everyone, it may return a "deny all" grant:
 *
 * @code
 * $grants[] = array(
 *   'realm' => 'all',
 *   'gid' => 0,
 *   'grant_view' => 0,
 *   'grant_update' => 0,
 *   'grant_delete' => 0,
 *   'priority' => 1,
 * );
 * @endcode
 *
 * Setting the priority should cancel out other grants. In the case of a
 * conflict between modules, it is safer to use hook_node_access_records_alter()
 * to return only the deny grant.
 *
 * Note: a deny all grant is not written to the database; denies are implicit.
 *
 * @param Node $node
 *   The node that has just been saved.
 *
 * @return
 *   An array of grants as defined above.
 *
 * @see _node_access_write_grants()
 * @ingroup node_access
 */
function hook_node_access_records(Node $node) {
  // We only care about the node if it has been marked private. If not, it is
  // treated just like any other node and we completely ignore it.
  if ($node->private) {
    $grants = array();
    // Only published nodes should be viewable to all users. If we allow access
    // blindly here, then all users could view an unpublished node.
    if ($node->status) {
      $grants[] = array(
        'realm' => 'example',
        'gid' => 1,
        'grant_view' => 1,
        'grant_update' => 0,
        'grant_delete' => 0,
      );
    }
    // For the example_author array, the GID is equivalent to a UID, which
    // means there are many groups of just 1 user.
    // Note that an author can always view his or her nodes, even if they
    // have status unpublished.
    $grants[] = array(
      'realm' => 'example_author',
      'gid' => $node->uid,
      'grant_view' => 1,
      'grant_update' => 1,
      'grant_delete' => 1,
    );

    return $grants;
  }
}

/**
 * Alter permissions for a node before it is written to the database.
 *
 * Node access modules establish rules for user access to content. Node access
 * records are stored in the {node_access} table and define which permissions
 * are required to access a node. This hook is invoked after node access modules
 * returned their requirements via hook_node_access_records(); doing so allows
 * modules to modify the $grants array by reference before it is stored, so
 * custom or advanced business logic can be applied.
 *
 * Upon viewing, editing or deleting a node, hook_node_grants() builds a
 * permissions array that is compared against the stored access records. The
 * user must have one or more matching permissions in order to complete the
 * requested operation.
 *
 * A module may deny all access to a node by setting $grants to an empty array.
 *
 * @param $grants
 *   The $grants array returned by hook_node_access_records().
 * @param Node $node
 *   The node for which the grants were acquired.
 *
 * The preferred use of this hook is in a module that bridges multiple node
 * access modules with a configurable behavior, as shown in the example with the
 * 'sticky' field.
 *
 * @see hook_node_access_records()
 * @see hook_node_grants()
 * @see hook_node_grants_alter()
 * @ingroup node_access
 */
function hook_node_access_records_alter(&$grants, Node $node) {
  // Our module allows editors to mark specific posts with the 'sticky'
  // field. If the node being saved has a TRUE value for that field, then only
  // our grants are retained, and other grants are removed. Doing so ensures
  // that our rules are enforced no matter what priority other grants are given.
  if ($node->sticky) {
    // Our module grants are set in $grants['example'].
    $temp = $grants['example'];
    // Now remove all module grants but our own.
    $grants = array('example' => $temp);
  }
}

/**
 * Alter user access rules when trying to view, edit or delete a node.
 *
 * Node access modules establish rules for user access to content.
 * hook_node_grants() defines permissions for a user to view, edit or delete
 * nodes by building a $grants array that indicates the permissions assigned to
 * the user by each node access module. This hook is called to allow modules to
 * modify the $grants array by reference, so the interaction of multiple node
 * access modules can be altered or advanced business logic can be applied.
 *
 * The resulting grants are then checked against the records stored in the
 * {node_access} table to determine if the operation may be completed.
 *
 * A module may deny all access to a user by setting $grants to an empty array.
 *
 * Developers may use this hook to either add additional grants to a user or to
 * remove existing grants. These rules are typically based on either the
 * permissions assigned to a user role, or specific attributes of a user
 * account.
 *
 * @param $grants
 *   The $grants array returned by hook_node_grants().
 * @param $account
 *   The user account requesting access to content.
 * @param $op
 *   The operation being performed, 'view', 'update' or 'delete'.
 *
 * @see hook_node_grants()
 * @see hook_node_access_records()
 * @see hook_node_access_records_alter()
 * @ingroup node_access
 */
function hook_node_grants_alter(&$grants, $account, $op) {
  // Our sample module never allows certain roles to edit or delete
  // content. Since some other node access modules might allow this
  // permission, we expressly remove it by returning an empty $grants
  // array for roles specified in our variable setting.

  // Get our list of banned roles.
  $restricted = config_get('my_module.settings', 'example_restricted_roles', array());

  if ($op != 'view' && !empty($restricted)) {
    // Now check the roles for this account against the restrictions.
    foreach ($restricted as $role_id) {
      if (isset($account->roles[$role_id])) {
        $grants = array();
      }
    }
  }
}

/**
 * Act before node deletion.
 *
 * This hook is invoked from node_delete_multiple() after the type-specific
 * hook_delete() has been invoked, but before hook_entity_predelete() and
 * field_attach_delete() are called, and before the node is removed from the
 * node table in the database.
 *
 * @param Node $node
 *   The node that is about to be deleted.
 *
 * @see hook_node_predelete()
 * @see node_delete_multiple()
 * @ingroup node_api_hooks
 */
function hook_node_predelete(Node $node) {
  db_delete('mytable')
    ->condition('nid', $node->nid)
    ->execute();
}

/**
 * Respond to node deletion.
 *
 * This hook is invoked from node_delete_multiple() after field_attach_delete()
 * has been called and after the node has been removed from the database.
 *
 * @param Node $node
 *   The node that has been deleted.
 *
 * @see hook_node_predelete()
 * @see node_delete_multiple()
 * @ingroup node_api_hooks
 */
function hook_node_delete(Node $node) {
  backdrop_set_message(t('Node: @title has been deleted', array('@title' => $node->title)));
}

/**
 * Respond to deletion of a node revision.
 *
 * This hook is invoked from node_revision_delete() after the revision has been
 * removed from the node_revision table, and before
 * field_attach_delete_revision() is called.
 *
 * @param Node $node
 *   The node revision (node object) that is being deleted.
 *
 * @ingroup node_api_hooks
 */
function hook_node_revision_delete(Node $node) {
  db_delete('mytable')
    ->condition('vid', $node->vid)
    ->execute();
}

/**
 * Respond to creation of a new node.
 *
 * This hook is invoked from node_save() after the database query that will
 * insert the node into the node table is scheduled for execution, after the
 * type-specific hook_insert() is invoked, and after field_attach_insert() is
 * called.
 *
 * Note that when this hook is invoked, the changes have not yet been written to
 * the database, because a database transaction is still in progress. The
 * transaction is not finalized until the save operation is entirely completed
 * and node_save() goes out of scope. You should not rely on data in the
 * database at this time as it is not updated yet. You should also note that any
 * write/update database queries executed from this hook are also not committed
 * immediately. Check node_save() and db_transaction() for more info.
 *
 * @param Node $node
 *   The node that is being created.
 *
 * @ingroup node_api_hooks
 */
function hook_node_insert(Node $node) {
  db_insert('mytable')
    ->fields(array(
      'nid' => $node->nid,
      'extra' => $node->extra,
    ))
    ->execute();
}

/**
 * Act on arbitrary nodes being loaded from the database.
 *
 * This hook should be used to add information that is not in the node or node
 * revisions table, not to replace information that is in these tables (which
 * could interfere with the entity cache). For performance reasons, information
 * for all available nodes should be loaded in a single query where possible.
 *
 * This hook is invoked during node loading, which is handled by entity_load(),
 * via classes NodeController and DefaultEntityController. After the node
 * information is read from the database or the entity cache, hook_load() is
 * invoked on the node's content type module, then field_attach_load_revision()
 * or field_attach_load() is called, then hook_entity_load() is invoked on all
 * implementing modules, and finally hook_node_load() is invoked on all
 * implementing modules.
 *
 * @param $nodes
 *   An array of the nodes being loaded, keyed by nid.
 * @param $types
 *   An array containing the node types present in $nodes. Allows for an early
 *   return for modules that only support certain node types. However, if your
 *   module defines a content type, you can use hook_load() to respond to
 *   loading of just that content type.
 *
 * For a detailed usage example, see nodeapi_example.module.
 *
 * @ingroup node_api_hooks
 */
function hook_node_load($nodes, $types) {
  // Decide whether any of $types are relevant to our purposes.
  if (count(array_intersect($types_we_want_to_process, $types))) {
    // Gather our extra data for each of these nodes.
    $result = db_query('SELECT nid, foo FROM {mytable} WHERE nid IN(:nids)', array(':nids' => array_keys($nodes)));
    // Add our extra data to the node objects.
    foreach ($result as $record) {
      $nodes[$record->nid]->foo = $record->foo;
    }
  }
}

/**
 * Controls access to a node.
 *
 * Modules may implement this hook if they want to have a say in whether or not
 * a given user has access to perform a given operation on a node.
 *
 * The administrative account (user ID #1) always passes any access check, so
 * this hook is not called in that case. Users with the "bypass node access"
 * permission may always view and edit content through the administrative
 * interface.
 *
 * Note that not all modules will want to influence access on all node types. If
 * your module does not want to actively grant or block access, return
 * NODE_ACCESS_IGNORE or simply return nothing. Blindly returning FALSE will
 * break other node access modules.
 *
 * Also note that this function isn't called for node listings (e.g., RSS feeds,
 * the default home page at path 'node', a recent content block, etc.) See
 * @link node_access Node access rights @endlink for a full explanation.
 *
 * @param Node|string $node
 *   Either a node entity or the machine name of the content type on which to
 *   perform the access check.
 * @param string $op
 *   The operation to be performed. Possible values:
 *   - "create"
 *   - "delete"
 *   - "update"
 *   - "view"
 * @param object $account
 *   The user object to perform the access check operation on.
 *
 * @return integer
 *   - NODE_ACCESS_ALLOW: if the operation is to be allowed.
 *   - NODE_ACCESS_DENY: if the operation is to be denied.
 *   - NODE_ACCESS_IGNORE: to not affect this operation at all.
 *
 * @see hook_node_access_records_alter()
 * @ingroup node_access
 */
function hook_node_access($node, $op, $account) {
  $type = is_string($node) ? $node : $node->type;

  if (in_array($type, node_permissions_get_configured_types())) {
    if ($op == 'create' && user_access('create ' . $type . ' content', $account)) {
      return NODE_ACCESS_ALLOW;
    }

    if ($op == 'update') {
      if (user_access('edit any ' . $type . ' content', $account) || (user_access('edit own ' . $type . ' content', $account) && ($account->uid == $node->uid))) {
        return NODE_ACCESS_ALLOW;
      }
    }

    if ($op == 'delete') {
      if (user_access('delete any ' . $type . ' content', $account) || (user_access('delete own ' . $type . ' content', $account) && ($account->uid == $node->uid))) {
        return NODE_ACCESS_ALLOW;
      }
    }
  }

  // Returning nothing from this function would have the same effect.
  return NODE_ACCESS_IGNORE;
}


/**
 * Act on a node object about to be shown on the add/edit form.
 *
 * This hook is invoked from node_object_prepare() after the type-specific
 * hook_prepare() is invoked.
 *
 * @param Node $node
 *   The node that is about to be shown on the add/edit form.
 *
 * @ingroup node_api_hooks
 */
function hook_node_prepare(Node $node) {
  if (!isset($node->comment)) {
    $node->my_setting = config_get('my_module.settings', 'my_setting');
  }
}

/**
 * Act on a node being displayed as a search result.
 *
 * This hook is invoked from node_search_execute(), after node_load() and
 * node_view() have been called.
 *
 * @param Node $node
 *   The node being displayed in a search result.
 *
 * @return array
 *   Extra information to be displayed with search result. This information
 *   should be presented as an associative array. It will be concatenated with
 *   the post information (last updated, author) in the default search result
 *   theming.
 *
 * @ingroup node_api_hooks
 */
function hook_node_search_result(Node $node) {
  $comments = db_query('SELECT comment_count FROM {node_comment_statistics} WHERE nid = :nid', array('nid' => $node->nid))->fetchField();
  return array('comment' => format_plural($comments, '1 comment', '@count comments'));
}

/**
 * Act on a node being inserted or updated.
 *
 * This hook is invoked from node_save() before the node is saved to the
 * database.
 *
 * @param Node $node
 *   The node that is being inserted or updated.
 *
 * @ingroup node_api_hooks
 */
function hook_node_presave(Node $node) {
  if ($node->nid && $node->moderate) {
    // Reset votes when node is updated:
    $node->score = 0;
    $node->users = '';
    $node->votes = 0;
  }
}

/**
 * Respond to updates to a node.
 *
 * This hook is invoked from node_save() after the database query that will
 * update node in the node table is scheduled for execution, after the
 * type-specific hook_update() is invoked, and after field_attach_update() is
 * called.
 *
 * Note that when this hook is invoked, the changes have not yet been written to
 * the database, because a database transaction is still in progress. The
 * transaction is not finalized until the save operation is entirely completed
 * and node_save() goes out of scope. You should not rely on data in the
 * database at this time as it is not updated yet. You should also note that any
 * write/update database queries executed from this hook are also not committed
 * immediately. Check node_save() and db_transaction() for more info.
 *
 * @param Node $node
 *   The node that is being updated.
 *
 * @ingroup node_api_hooks
 */
function hook_node_update(Node $node) {
  db_update('mytable')
    ->fields(array('extra' => $node->extra))
    ->condition('nid', $node->nid)
    ->execute();
}

/**
 * Act on a node being indexed for searching.
 *
 * This hook is invoked during search indexing, after node_load(), and after the
 * result of node_view() is added as $node->rendered to the node object.
 *
 * @param Node $node
 *   The node being indexed.
 *
 * @return string
 *   Additional node information to be indexed.
 *
 * @ingroup node_api_hooks
 */
function hook_node_update_index(Node $node) {
  $text = '';
  $comments = db_query('SELECT subject, comment, format FROM {comment} WHERE nid = :nid AND status = :status', array(':nid' => $node->nid, ':status' => COMMENT_PUBLISHED));
  foreach ($comments as $comment) {
    $text .= '<h2>' . check_plain($comment->subject) . '</h2>' . check_markup($comment->comment, $comment->format, '', TRUE);
  }
  return $text;
}

/**
 * Perform node validation before a node is created or updated.
 *
 * This hook is invoked from node_validate(), after a user has has finished
 * editing the node and is submitting it. It is invoked at the end of all the
 * standard validation steps, and after the type-specific hook_validate() is
 * invoked.
 *
 * To indicate a validation error, use form_set_error().
 *
 * Note: Changes made to the $node object within your hook implementation will
 * have no effect.  The preferred method to change a node's content is to use
 * hook_node_presave() instead. If it is really necessary to change the node at
 * the validate stage, you can use form_set_value().
 *
 * @param Node $node
 *   The node being validated.
 * @param $form
 *   The form being used to edit the node.
 * @param $form_state
 *   The form state array.
 *
 * @ingroup node_api_hooks
 */
function hook_node_validate(Node $node, $form, &$form_state) {
  if (isset($node->end) && isset($node->start)) {
    if ($node->start > $node->end) {
      form_set_error('time', t('An event may not end before it starts.'));
    }
  }
}

/**
 * Act on a node after validated form values have been copied to it.
 *
 * This hook is invoked when a node form is submitted with the "Save" button,
 * after form values have been copied to the form state's node object, but
 * before the node is saved. It is a chance for modules to adjust the node's
 * properties from what they are simply after a copy from $form_state['values'].
 * This hook is intended for adjusting non-field-related properties. See
 * hook_field_attach_submit() for customizing field-related properties.
 *
 * @param Node $node
 *   The node entity being updated in response to a form submission.
 * @param $form
 *   The form being used to edit the node.
 * @param $form_state
 *   The form state array.
 *
 * @ingroup node_api_hooks
 */
function hook_node_submit(Node $node, $form, &$form_state) {
  // Decompose the selected menu parent option into 'menu_name' and 'plid', if
  // the form used the default parent selection widget.
  if (!empty($form_state['values']['menu']['parent'])) {
    list($node->menu['menu_name'], $node->menu['plid']) = explode(':', $form_state['values']['menu']['parent']);
  }
}

/**
 * Act on a node that is being assembled before rendering.
 *
 * The module may add elements to $node->content prior to rendering. This hook
 * will be called after hook_view(). The structure of $node->content is a
 * renderable array as expected by backdrop_render().
 *
 * When $view_mode is 'rss', modules can also add extra RSS elements and
 * namespaces to $node->rss_elements and $node->rss_namespaces respectively for
 * the RSS item generated for this node.
 * For details on how this is used, see node_feed().
 *
 * @param Node $node
 *   The node that is being assembled for rendering.
 * @param $view_mode
 *   The $view_mode parameter from node_view().
 * @param $langcode
 *   The language code used for rendering.
 *
 * @see comment_node_view()
 * @see hook_entity_view()
 *
 * @ingroup node_api_hooks
 */
function hook_node_view(Node $node, $view_mode, $langcode) {
  $node->content['my_additional_field'] = array(
    '#markup' => $additional_field,
    '#weight' => 10,
    '#theme' => 'mymodule_my_additional_field',
  );
}

/**
 * Alter the results of node_view().
 *
 * This hook is called after the content has been assembled in a structured
 * array and may be used for doing processing which requires that the complete
 * node content structure has been built.
 *
 * If the module wishes to act on the rendered HTML of the node rather than the
 * structured content array, it may use this hook to add a #post_render
 * callback.  Alternatively, it could also implement hook_preprocess_node(). See
 * backdrop_render() and theme() documentation respectively for details.
 *
 * @param $build
 *   A renderable array representing the node content.
 *
 * @see node_view()
 * @see hook_entity_view_alter()
 *
 * @ingroup node_api_hooks
 */
function hook_node_view_alter(&$build) {
  if ($build['#view_mode'] == 'full' && isset($build['an_additional_field'])) {
    // Change its weight.
    $build['an_additional_field']['#weight'] = -10;
  }

  // Add a #post_render callback to act on the rendered HTML of the node.
  $build['#post_render'][] = 'my_module_node_post_render';
}

/**
 * Provide additional methods of scoring for core search results for nodes.
 *
 * A node's search score is used to rank it among other nodes matched by the
 * search, with the highest-ranked nodes appearing first in the search listing.
 *
 * For example, a module allowing users to vote on content could expose an
 * option to allow search results' rankings to be influenced by the average
 * voting score of a node.
 *
 * All scoring mechanisms are provided as options to site administrators, and
 * may be tweaked based on individual sites or disabled altogether if they do
 * not make sense. Individual scoring mechanisms, if enabled, are assigned a
 * weight from 1 to 10. The weight represents the factor of magnification of
 * the ranking mechanism, with higher-weighted ranking mechanisms having more
 * influence. In order for the weight system to work, each scoring mechanism
 * must return a value between 0 and 1 for every node. That value is then
 * multiplied by the administrator-assigned weight for the ranking mechanism,
 * and then the weighted scores from all ranking mechanisms are added, which
 * brings about the same result as a weighted average.
 *
 * @return
 *   An associative array of ranking data. The keys should be strings,
 *   corresponding to the internal name of the ranking mechanism, such as
 *   'recent', or 'comments'. The values should be arrays themselves, with the
 *   following keys available:
 *   - title: (required) The human readable name of the ranking mechanism.
 *   - join: (optional) An array with information to join any additional
 *     necessary table. This is not necessary if the table required is already
 *     joined to by the base query, such as for the {node} table. Other tables
 *     should use the full table name as an alias to avoid naming collisions.
 *   - score: (required) The part of a query string to calculate the score for
 *     the ranking mechanism based on values in the database. This does not need
 *     to be wrapped in parentheses, as it will be done automatically; it also
 *     does not need to take the weighted system into account, as it will be
 *     done automatically. It does, however, need to calculate a decimal between
 *     0 and 1; be careful not to cast the entire score to an integer by
 *     inadvertently introducing a variable argument.
 *   - arguments: (optional) If any arguments are required for the score, they
 *     can be specified in an array here.
 *
 * @ingroup node_api_hooks
 */
function hook_ranking() {
  // If voting is disabled, we can avoid returning the array, no hard feelings.
  $config = config_get('my_module.settings');
  if ($config->get('vote_node_enabled')) {
    return array(
      'vote_average' => array(
        'title' => t('Average vote'),
        // Note that we use i.sid, the search index's search item id, rather than
        // n.nid.
        'join' => array(
          'type' => 'LEFT',
          'table' => 'vote_node_data',
          'alias' => 'vote_node_data',
          'on' => 'vote_node_data.nid = i.sid',
        ),
        // The highest possible score should be 1, and the lowest possible score,
        // always 0, should be 0.
        'score' => 'vote_node_data.average / CAST(%f AS DECIMAL)',
        // Pass in the highest possible voting score as a decimal argument.
        'arguments' => array($config->get('vote_score_max')),
      ),
    );
  }
}

/**
 * Respond to the loading of node types.
 *
 * This hook is called after loading node types from configuration files. It can
 * be used to populate default values within a node type's settings. Note that
 * after loading, if the node type is later saved, these defaults are saved into
 * configuration.
 *
 * @param $types
 *   An array of type information, passed by reference. Each item is keyed by
 *   the node type name, and is an array of values as loaded from the node
 *   type config file. The most common use is to populate the "settings" array
 *   with defaults. For a complete list of keys for a node type, see
 *   _node_types_build().
 *
 * @see _node_types_build()
 */
function hook_node_type_load(&$types) {
  foreach ($types as $type_name => $type) {
    $types[$type_name]->settings += array(
      'status_default' => TRUE,
      'promote_default' => FALSE,
      'sticky_default' => FALSE,
      'revision_default' => FALSE,
      'show_submitted_info' => TRUE,
    );
  }
}

/**
 * Respond to node type creation.
 *
 * This hook is invoked from node_type_save() after the node type is added to
 * the database.
 *
 * @param $info
 *   The node type object that is being created.
 */
function hook_node_type_insert($info) {
  backdrop_set_message(t('You have just created a content type with a machine name %type.', array('%type' => $info->type)));
}

/**
 * Respond to node type updates.
 *
 * This hook is invoked from node_type_save() after the node type is updated in
 * the database.
 *
 * @param $info
 *   The node type object that is being updated.
 */
function hook_node_type_update($info) {
  // Update a setting that pointed at the old type name to the new type name.
  if (!empty($info->old_type) && $info->old_type != $info->type) {
    $config = config('my_module.settings');
    $default_type = $config->get('defaut_node_type');
    if ($default_type === $info->old_type) {
      $config->set('default_node_type', $info->type);
    }
  }
}

/**
 * Respond to node type deletion.
 *
 * This hook is invoked from node_type_delete() after the node type is removed
 * from the database.
 *
 * @param $info
 *   The node type object that is being deleted.
 */
function hook_node_type_delete($info) {
  // Remove the deleted node type from a module's config.
  $config = config('my_module.settings');
  $enabled_types = $config->get('enabled_types');
  $key = array_search($info->type, $enabled_types);
  if ($key !== FALSE) {
    unset($enabled_types[$key]);
    $config->set('enabled_types', $enabled_types);
  }
}

/**
 * Respond to node deletion.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_node_delete() to respond to node deletion of all node types.
 *
 * This hook is invoked from node_delete_multiple() before hook_node_delete()
 * is invoked and before field_attach_delete() is called.
 *
 * Note that when this hook is invoked, the changes have not yet been written
 * to the database, because a database transaction is still in progress. The
 * transaction is not finalized until the delete operation is entirely
 * completed and node_delete_multiple() goes out of scope. You should not rely
 * on data in the database at this time as it is not updated yet. You should
 * also note that any write/update database queries executed from this hook are
 * also not committed immediately. Check node_delete_multiple() and
 * db_transaction() for more info.
 *
 * @param Node $node
 *   The node that is being deleted.
 *
 * @ingroup node_api_hooks
 */
function hook_delete(Node $node) {
  db_delete('mytable')
    ->condition('nid', $node->nid)
    ->execute();
}

/**
 * Act on a node object about to be shown on the add/edit form.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_node_prepare() to respond to node preparation of all node types.
 *
 * This hook is invoked from node_object_prepare() before the general
 * hook_node_prepare() is invoked.
 *
 * @param Node $node
 *   The node that is about to be shown on the add/edit form.
 *
 * @ingroup node_api_hooks
 */
function hook_prepare(Node $node) {
  if (!isset($node->mymodule_value)) {
    $node->mymodule_value = 'foo';
  }
}

/**
 * Display a node editing form.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_form_BASE_FORM_ID_alter(), with base form ID 'node_form', to alter
 * node forms for all node types.
 *
 * This hook, implemented by node modules, is called to retrieve the form
 * that is displayed to create or edit a node. This form is displayed at path
 * node/add/[node type] or node/[node ID]/edit.
 *
 * The submit button, administrative and display controls, and sections added by
 * other modules (such as path settings, menu settings, comment settings, and
 * fields managed by the Field UI module) are displayed automatically by the
 * node module. This hook just needs to return the node title and form editing
 * fields specific to the node type.
 *
 * @param Node $node
 *   The node being added or edited.
 * @param $form_state
 *   The form state array.
 *
 * @return
 *   An array containing the title and any custom form elements to be displayed
 *   in the node editing form.
 *
 * @ingroup node_api_hooks
 */
function hook_form(Node $node, &$form_state) {
  $type = node_type_get_type($node);

  $form['title'] = array(
    '#type' => 'textfield',
    '#title' => check_plain($type->title_label),
    '#default_value' => !empty($node->title) ? $node->title : '',
    '#required' => TRUE, '#weight' => -5
  );

  $form['field1'] = array(
    '#type' => 'textfield',
    '#title' => t('Custom field'),
    '#default_value' => $node->field1,
    '#maxlength' => 127,
  );
  $form['selectbox'] = array(
    '#type' => 'select',
    '#title' => t('Select box'),
    '#default_value' => $node->selectbox,
    '#options' => array(
      1 => 'Option A',
      2 => 'Option B',
      3 => 'Option C',
    ),
    '#description' => t('Choose an option.'),
  );

  return $form;
}

/**
 * Respond to creation of a new node.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_node_insert() to respond to node insertion of all node types.
 *
 * This hook is invoked from node_save() after the node is inserted into the
 * node table in the database, before field_attach_insert() is called, and
 * before hook_node_insert() is invoked.
 *
 * @param Node $node
 *   The node that is being created.
 *
 * @ingroup node_api_hooks
 */
function hook_insert(Node $node) {
  db_insert('mytable')
    ->fields(array(
      'nid' => $node->nid,
      'extra' => $node->extra,
    ))
    ->execute();
}

/**
 * Act on nodes being loaded from the database.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_node_load() to respond to node load of all node types.
 *
 * This hook is invoked during node loading, which is handled by entity_load(),
 * via classes NodeController and DefaultEntityController. After the node
 * information is read from the database or the entity cache, hook_load() is
 * invoked on the node's content type module, then field_attach_node_revision()
 * or field_attach_load() is called, then hook_entity_load() is invoked on all
 * implementing modules, and finally hook_node_load() is invoked on all
 * implementing modules.
 *
 * This hook should only be used to add information that is not in the node or
 * node revisions table, not to replace information that is in these tables
 * (which could interfere with the entity cache). For performance reasons,
 * information for all available nodes should be loaded in a single query where
 * possible.
 *
 * @param $nodes
 *   An array of the nodes being loaded, keyed by nid.
 *
 * For a detailed usage example, see node_example.module.
 *
 * @ingroup node_api_hooks
 */
function hook_load($nodes) {
  $result = db_query('SELECT nid, foo FROM {mytable} WHERE nid IN (:nids)', array(':nids' => array_keys($nodes)));
  foreach ($result as $record) {
    $nodes[$record->nid]->foo = $record->foo;
  }
}

/**
 * Respond to updates to a node.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_node_update() to respond to node update of all node types.
 *
 * This hook is invoked from node_save() after the node is updated in the
 * node table in the database, before field_attach_update() is called, and
 * before hook_node_update() is invoked.
 *
 * @param Node $node
 *   The node that is being updated.
 *
 * @ingroup node_api_hooks
 */
function hook_update(Node $node) {
  db_update('mytable')
    ->fields(array('extra' => $node->extra))
    ->condition('nid', $node->nid)
    ->execute();
}

/**
 * Perform node validation before a node is created or updated.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_node_validate() to respond to node validation of all node types.
 *
 * This hook is invoked from node_validate(), after a user has finished
 * editing the node and is submitting it. It is invoked at the end of all the
 * standard validation steps, and before hook_node_validate() is invoked.
 *
 * To indicate a validation error, use form_set_error().
 *
 * Note: Changes made to the $node object within your hook implementation will
 * have no effect.  The preferred method to change a node's content is to use
 * hook_node_presave() instead.
 *
 * @param Node $node
 *   The node being validated.
 * @param $form
 *   The form being used to edit the node.
 * @param $form_state
 *   The form state array.
 *
 * @ingroup node_api_hooks
 */
function hook_validate(Node $node, $form, &$form_state) {
  if (isset($node->end) && isset($node->start)) {
    if ($node->start > $node->end) {
      form_set_error('time', t('An event may not end before it starts.'));
    }
  }
}

/**
 * Display a node.
 *
 * This is a node-type-specific hook, which is invoked only for the node type
 * being affected. See
 * @link node_api_hooks Node API hooks @endlink for more information.
 *
 * Use hook_node_view() to respond to node view of all node types.
 *
 * This hook is invoked during node viewing after the node is fully loaded, so
 * that the node type module can define a custom method for display, or add to
 * the default display.
 *
 * @param Node $node
 *   The node to be displayed, as returned by node_load().
 * @param $view_mode
 *   View mode, e.g. 'full', 'teaser', ...
 *
 * @return
 *   The passed $node parameter should be modified as necessary and returned so
 *   it can be properly presented. Nodes are prepared for display by assembling
 *   a structured array, formatted as in the Form API, in $node->content. As
 *   with Form API arrays, the #weight property can be used to control the
 *   relative positions of added elements. After this hook is invoked,
 *   node_view() calls field_attach_view() to add field views to $node->content,
 *   and then invokes hook_node_view() and hook_node_view_alter(), so if you
 *   want to affect the final view of the node, you might consider implementing
 *   one of these hooks instead.
 *
 * @ingroup node_api_hooks
 */
function hook_view(Node $node, $view_mode) {
  if ($view_mode == 'full' && node_is_page($node)) {
    $breadcrumb = array();
    $breadcrumb[] = l(t('Home'), NULL);
    $breadcrumb[] = l(t('Example'), 'example');
    $breadcrumb[] = l($node->field1, 'example/' . $node->field1);
    backdrop_set_breadcrumb($breadcrumb);
  }

  $node->content['myfield'] = array(
    '#markup' => theme('mymodule_myfield', $node->myfield),
    '#weight' => 1,
  );

  return $node;
}

/**
 * @} End of "addtogroup hooks".
 */
