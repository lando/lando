<?php

/**
 * @file
 * Hooks provided by the Redirect module.
 */

/**
 * @defgroup redirect_api_hooks Redirect API Hooks
 * @{
 * Redirects may be created by end-users to manually redirect from one URL on
 * the site to another one (or to an external URL). For example the path
 * "about" may be redirected to "pages/about-us" after a site redesign. The old
 * URLs should be redirect to the new ones to maintain search engine rankings,
 * existing links, and bookmarks to the old URL.
 *
 * Redirects are stored in the database in the "redirect" table. Loading and
 * saving of redirects should be done through the Redirect API to ensure modules
 * responding to the modification of redirects also have an opportunity to
 * make adjustments as needed. The Redirect object is used to wrap around all
 * the operations that can be done on redirects. It is recommended that
 * redirects be loaded using one of the existing functions for loading, or
 * if creating a new redirect, created by instantiating a new Redirect object.
 *
 * @see Redirect
 * @see redirect_load()
 * @see redirect_load_multiple()
 * @see redirect_load_by_source()
 *
 * @}
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Act on redirects being loaded from the database.
 *
 * This hook is invoked during redirect loading, which is handled by
 * redirect_load_multiple(). After the redirect information is read from
 * the database hook_redirect_load() is invoked on all implementing modules.
 *
 * This hook should only be used to add information that is not in the redirect
 * table, not to replace information that is in that table (which could
 * interfere with saving). For performance reasons, information for
 * all available redirects should be loaded in a single query where possible.
 *
 * The $types parameter allows for your module to have an early return (for
 * efficiency) if your module only supports certain redirect types.
 *
 * @param $redirects
 *   An array of the redirects being loaded, keyed by rid.
 * @param $types
 *   An array containing the types of the redirects.
 *
 * @ingroup redirect_api_hooks
 */
function hook_redirect_load(array &$redirects, $types) {

}

/**
 * Alter the list of redirects matching a certain source.
 *
 * @param $redirects
 *   An array of redirect objects.
 * @param $source
 *   The source request path.
 * @param $context
 *   An array with the following key/value pairs:
 *   - langcode: The language code of the source request.
 *   - query: An array of the source request query string.
 *
 * @see redirect_load_by_source()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_load_by_source_alter(array &$redirects, $source, array $context) {
  foreach ($redirects as $rid => $redirect) {
    if ($redirect->source !== $source) {
      // If the redirects to do not exactly match $source (e.g. case
      // insensitive matches), then remove them from the results.
      unset($redirects[$rid]);
    }
  }
}

/**
 * Control access to a redirect.
 *
 * Modules may implement this hook if they want to have a say in whether or not
 * a given user has access to perform a given operation on a redirect.
 *
 * The administrative account (user ID #1) always passes any access check,
 * so this hook is not called in that case. Users with the "administer redirects"
 * permission may always update and delete redirects through the administrative
 * interface.
 *
 * Note that not all modules will want to influence access on all
 * redirect types. If your module does not want to actively grant or
 * block access, return REDIRECT_ACCESS_IGNORE or simply return nothing.
 * Blindly returning FALSE will break other redirect access modules.
 *
 * @param Redirect|string $redirect
 *   The redirect object on which the operation is to be performed, or, if it
 *   does not yet exist, the type of redirect to be created.
 * @param $op
 *   The operation to be performed. Possible values:
 *   - "create"
 *   - "delete"
 *   - "update"
 * @param $account
 *   A user object representing the user for whom the operation is to be
 *   performed.
 *
 * @return string|NULL
 *   REDIRECT_ACCESS_ALLOW if the operation is to be allowed;
 *   REDIRECT_ACCESS_DENY if the operation is to be denied;
 *   REDIRECT_ACCESS_IGNORE to not affect this operation at all.
 *
 * @see redirect_access()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_access($op, $redirect, $account) {
  $type = is_string($redirect) ? $redirect : $redirect->type;

  if (in_array($type, array('normal', 'special'))) {
    if ($op == 'create' && user_access('create ' . $type . ' redirects', $account)) {
      return REDIRECT_ACCESS_ALLOW;
    }

    if ($op == 'update') {
      if (user_access('edit any ' . $type . ' content', $account) || (user_access('edit own ' . $type . ' content', $account) && ($account->uid == $redirect->uid))) {
        return REDIRECT_ACCESS_ALLOW;
      }
    }

    if ($op == 'delete') {
      if (user_access('delete any ' . $type . ' content', $account) || (user_access('delete own ' . $type . ' content', $account) && ($account->uid == $redirect->uid))) {
        return REDIRECT_ACCESS_ALLOW;
      }
    }
  }

  // Returning nothing from this function would have the same effect.
  return REDIRECT_ACCESS_IGNORE;
}

/**
 * Act on a redirect object about to be shown on the add/edit form.
 *
 * This hook is invoked from the Redirect object constructor in
 * Redirect::__construct().
 *
 * @param Redirect $redirect
 *   A newly initialized redirect object. Likely to be shown on the form for
 *   adding or editing a redirect.
 * @param array $values
 *   The default values for the Redirect from the database if editing an
 *   existing Redirect.
 *
 * @ingroup redirect_api_hooks
 */
function hook_redirect_prepare(Redirect $redirect, array $values) {
  // Change the default type to be a 302 temporary redirect instead of a 301
  // permanent redirect.
  if (empty($values['type'])) {
    $redirect->type = 302;
  }
}

/**
 * Perform redirect validation before a redirect is created or updated.
 *
 * This hook is invoked from redirect_validate(), after a user has has finished
 * editing the redirect and is submitting it. It is invoked at the end of all
 * the standard validation steps.
 *
 * To indicate a validation error, use form_set_error().
 *
 * Note: Changes made to the $redirect object within your hook implementation
 * will have no effect. The preferred method to change a redirect's content is
 * to use hook_redirect_presave() instead. If it is really necessary to change
 * the redirect at the validate stage, you can use form_set_value().
 *
 * @param $redirect
 *   The redirect being validated.
 * @param $form
 *   The form being used to edit the redirect.
 * @param $form_state
 *   The form state array.
 *
 * @see redirect_validate()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_validate($redirect, $form, $form_state) {

}

/**
 * Act on a redirect being inserted or updated.
 *
 * This hook is invoked from redirect_save() before the redirect is saved to
 * the database.
 *
 * @param $redirect
 *   The redirect that is being inserted or updated.
 *
 * @see redirect_save()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_presave($redirect) {

}

/**
 * Respond to creation of a new redirect.
 *
 * This hook is invoked from redirect_save() after the redirect is inserted
 * into the redirect table in the database.
 *
 * @param $redirect
 *   The redirect that is being created.
 *
 * @see redirect_save()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_insert($redirect) {

}

/**
 * Respond to updates to a redirect.
 *
 * This hook is invoked from redirect_save() after the redirect is updated in
 * the redirect table in the database.
 *
 * @param $redirect
 *   The redirect that is being updated.
 *
 * @see redirect_save()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_update($redirect) {

}

/**
 * Respond to redirect deletion.
 *
 * This hook is invoked from redirect_delete_multiple() after the redirect has
 * been removed from the redirect table in the database.
 *
 * @param $redirect
 *   The redirect that is being deleted.
 *
 * @see redirect_delete_multiple()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_delete($redirect) {

}

/**
 * Act on a redirect being redirected.
 *
 * This hook is invoked from redirect_redirect() before the redirect callback
 * is invoked.
 *
 * @param $redirect
 *   The redirect that is being used for the redirect.
 *
 * @see redirect_redirect()
 * @see backdrop_page_is_cacheable()
 * @ingroup redirect_api_hooks
 */
function hook_redirect_alter($redirect) {
  // Make any redirect going to the homepage considered temporary.
  if ($redirect->redirect = '<front>') {
    $redirect->type = 302;
  }
}

/**
 * Provide additional operations that may be done on redirects.
 *
 * @return array
 *   An array of callback information for executing the operation.
 */
function hook_redirect_operations() {
  // Example from redirect_redirect_operations():
  $operations['delete'] = array(
    'action' => t('Delete'),
    'action_past' => t('Deleted'),
    'callback' => 'redirect_delete_multiple',
    'confirm' => TRUE,
  );
  return $operations;
}

/**
 * @} End of "addtogroup hooks".
 */
