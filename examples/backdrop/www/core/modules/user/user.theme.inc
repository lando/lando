<?php
/**
 * @file
 * Theme functions for the User module.
 */

/**
 * Returns HTML for a list of users.
 *
 * @param $variables
 *   An associative array containing:
 *   - users: An array with user objects. Should contain at least the name and
 *     uid.
 *   - title: (optional) Title to pass on to theme_item_list().
 *
 * @ingroup themeable
 */
function theme_user_list($variables) {
  $users = $variables['users'];
  $title = $variables['title'];
  $items = array();

  if (!empty($users)) {
    foreach ($users as $user) {
      $items[] = theme('username', array('account' => $user));
    }
  }
  return theme('item_list', array('items' => $items, 'title' => $title));
}

/**
 * Returns HTML for a user signature.
 *
 * @param $variables
 *   An associative array containing:
 *   - signature: The user's signature.
 *
 * @ingroup themeable
 */
function theme_user_signature($variables) {
  $signature = $variables['signature'];
  $output = '';

  if ($signature) {
    $output .= '<div class="clear">';
    $output .= '<div>—</div>';
    $output .= $signature;
    $output .= '</div>';
  }

  return $output;
}

/**
 * Returns HTML for a username, potentially linked to the user's page.
 *
 * @param $variables
 *   An associative array containing:
 *   - account: The user object to format.
 *   - name: The user's name, sanitized.
 *   - extra: Additional text to append to the user's name, sanitized.
 *   - link_path: The path or URL of the user's profile page, home page, or
 *     other desired page to link to for more information about the user.
 *   - link_options: An array of options to pass to the l() function's $options
 *     parameter if linking the user's name to the user's page.
 *   - attributes: An array of attributes to pass to the
 *     backdrop_attributes() function if not linking to the user's page.
 *
 * @see template_preprocess_username()
 */
function theme_username($variables) {
  if (isset($variables['link_path'])) {
    // Finalize the link_options array for passing to the l() function.
    // Additional classes may be added here as array elements like
    // $variables['attributes']['class'][] = 'myclass';

    // $variables['attributes'] contains attributes that should be applied
    // regardless of whether a link is being rendered.
    // $variables['link_attributes'] contains attributes that should only be
    // applied if a link is being rendered.
    // If a link is being rendered, these need to be merged. Some attributes are
    // themselves arrays, so the merging needs to be recursive.
    $variables['link_options']['attributes'] = array_merge_recursive($variables['link_attributes'], $variables['attributes']);
    // We have a link path, so we should generate a link using l().
    $output = l($variables['name'] . $variables['extra'], $variables['link_path'], $variables['link_options']);
  }
  else {
    $output = '<span' . backdrop_attributes($variables['attributes']) . '>' . $variables['name'] . $variables['extra'] . '</span>';
  }
  return $output;
}

/**
 * Returns HTML for the administer permissions page.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_user_admin_permissions($variables) {
  $form = $variables['form'];

  $roles = user_roles();
  foreach (element_children($form['permission']) as $key) {
    $row = array();
    // Module name
    if (is_numeric($key)) {
      $row[] = array('data' => backdrop_render($form['permission'][$key]), 'class' => array('module'), 'id' => 'module-' . $form['permission'][$key]['#id'], 'colspan' => count($form['roles']['#value']) + 1);
    }
    else {
      // Permission row.
      $row[] = array(
        'data' => backdrop_render($form['permission'][$key]),
        'class' => array('permission'),
      );
      foreach (element_children($form['checkboxes']) as $role_name) {
        $form['checkboxes'][$role_name][$key]['#title'] = $roles[$role_name] . ': ' . $form['permission'][$key]['#markup'];
        $form['checkboxes'][$role_name][$key]['#title_display'] = 'attribute';
        $row[] = array('data' => backdrop_render($form['checkboxes'][$role_name][$key]), 'class' => array('checkbox'));
      }
    }
    $rows[] = $row;
  }
  $header[] = (t('Permission'));
  foreach (element_children($form['role_names']) as $role_name) {
    $header[] = array('data' => backdrop_render($form['role_names'][$role_name]), 'class' => array('checkbox'));
  }
  $output = '';
  $output .= theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'permissions')));
  $output .= backdrop_render_children($form);
  return $output;
}

/**
 * Returns HTML for an individual permission description.
 *
 * @param $variables
 *   An associative array containing:
 *   - permission_item: An associative array representing the permission whose
 *     description is being themed. Useful keys include:
 *     - description: The text of the permission description.
 *     - warning: A security-related warning message about the permission (if
 *       there is one).
 *
 * @ingroup themeable
 */
function theme_user_permission_description($variables) {
  $description = array();
  $permission_item = $variables['permission_item'];
  if (!empty($permission_item['description'])) {
    $description[] = $permission_item['description'];
  }
  if (!empty($permission_item['warning'])) {
    $description[] = '<em class="permission-warning">' . $permission_item['warning'] . '</em>';
  }
  if (!empty($description)) {
    return implode(' ', $description);
  }
}

/**
 * Returns HTML for the role order and new role form.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_user_admin_roles($variables) {
  $form = $variables['form'];

  $header = array(t('Name'), t('Weight'), t('Operations'));
  foreach (element_children($form['roles']) as $role_name) {
    $label = $form['roles'][$role_name]['#role']->label;
    $row = array();
    if (in_array($role_name, array(BACKDROP_ANONYMOUS_ROLE, BACKDROP_AUTHENTICATED_ROLE))) {
      $row[] = t('@name <em>(required)</em>', array('@name' => $label));
    }
    else {
      $row[] = check_plain($label);
    }
    $row[] = backdrop_render($form['roles'][$role_name]['weight']);
    $row[] = backdrop_render($form['roles'][$role_name]['operations']);
    $rows[] = array('data' => $row, 'class' => array('draggable'));
  }
  $row = array();
  $row[] = array('data' => backdrop_render($form['label']) . backdrop_render($form['name']), 'class' => 'edit-name');
  $row[] = '';
  $row[] = backdrop_render($form['add']);
  $rows[] = $row;

  backdrop_add_tabledrag('user-roles', 'order', 'sibling', 'role-weight');

  $output = theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'user-roles')));
  $output .= backdrop_render_children($form);

  return $output;
}

/**
 * Process variables for user-picture.tpl.php.
 *
 * The $variables array contains the following arguments:
 * - $account: A user, node or comment object with 'name', 'uid' and 'picture'
 *   fields.
 *
 * @see user-picture.tpl.php
 */
function template_preprocess_user_picture(&$variables) {
  $variables['user_picture'] = '';
  if (config_get('system.core', 'user_pictures')) {
    $account = $variables['account'];
    if (!empty($account->picture)) {
      // @TODO: Ideally this function would only be passed file entities, but
      // since there's a lot of legacy code that JOINs the {users} table to
      // {node} or {comments} and passes the results into this function if we
      // a numeric value in the picture field we'll assume it's a file id
      // and load it for them. Once we've got user_load_multiple() and
      // comment_load_multiple() functions the user module will be able to load
      // the picture files in mass during the object's load process.
      if (is_numeric($account->picture)) {
        $account->picture = file_load($account->picture);
      }
      if (!empty($account->picture->uri)) {
        $filepath = $account->picture->uri;
      }
    }
    elseif (config_get('system.core', 'user_picture_default')) {
      $filepath = config_get('system.core', 'user_picture_default');
    }
    if (isset($filepath)) {
      $alt = t("@user's picture", array('@user' => user_format_name($account)));
      // If the image does not have a valid Backdrop scheme (for eg. HTTP),
      // don't load image styles.
      if (module_exists('image') && file_valid_uri($filepath) && $style = config_get('system.core', 'user_picture_style')) {
        $variables['user_picture'] = theme('image_style', array('style_name' => $style, 'uri' => $filepath, 'alt' => $alt, 'title' => $alt));
      }
      else {
        $variables['user_picture'] = theme('image', array('uri' => $filepath, 'alt' => $alt, 'title' => $alt));
      }
      if (!empty($account->uid) && user_access('access user profiles')) {
        $attributes = array('attributes' => array('title' => t('View user profile.')), 'html' => TRUE);
        $variables['user_picture'] = l($variables['user_picture'], "user/$account->uid", $attributes);
      }
    }
  }
}

/**
 * Preprocesses variables for theme_username().
 *
 * Modules that make any changes to variables like 'name' or 'extra' must insure
 * that the final string is safe to include directly in the output by using
 * check_plain() or filter_xss().
 */
function template_preprocess_username(&$variables) {
  $account = $variables['account'];

  $variables['extra'] = '';
  if (empty($account->uid)) {
    $variables['uid'] = 0;
    $variables['extra'] = ' (' . t('not verified') . ')';
  }
  else {
    $variables['uid'] = (int) $account->uid;
  }

  // Set the name to a formatted name that is safe for printing and
  // that won't break tables by being too long. Keep an unshortened,
  // unsanitized version, in case other preprocess functions want to implement
  // their own shortening logic or add markup. If they do so, they must ensure
  // that $variables['name'] is safe for printing.
  $name = $variables['name_raw'] = user_format_name($account);
  if (backdrop_strlen($name) > 20) {
    $name = backdrop_substr($name, 0, 15) . '...';
  }
  $variables['name'] = check_plain($name);
  $variables['profile_access'] = user_access('access user profiles');

  // Populate link path and attributes if appropriate.
  if ($variables['uid'] && $variables['profile_access']) {
    // We are linking to a local user.
    $variables['link_attributes']['title'] = t('View user profile.');
    $variables['link_path'] = 'user/' . $variables['uid'];
  }
  elseif (!empty($account->homepage)) {
    // Like the 'class' attribute, the 'rel' attribute can hold a
    // space-separated set of values, so initialize it as an array to make it
    // easier for other preprocess functions to append to it.
    $variables['link_attributes']['rel'] = 'nofollow';
    $variables['link_path'] = $account->homepage;
    $variables['homepage'] = $account->homepage;
  }
  // We do not want the l() function to check_plain() a second time.
  $variables['link_options']['html'] = TRUE;
  // Set a default class.
  $variables['attributes'] = array('class' => array('username'));
}

/**
 * Process variables for user-profile.tpl.php.
 *
 * The $variables array contains the following arguments:
 * - $account
 *
 * @see user-profile.tpl.php
 */
function template_preprocess_user_profile(&$variables) {
  $view_mode = $variables['elements']['#view_mode'];
  $bundle = $variables['elements']['#bundle'];
  $account = $variables['elements']['#account'];

  // Helpful $user_profile variable for templates.
  foreach (element_children($variables['elements']) as $key) {
    $variables['user_profile'][$key] = $variables['elements'][$key];
  }

  // Preprocess fields.
  field_attach_preprocess('user', $account, $variables['elements'], $variables);
}

