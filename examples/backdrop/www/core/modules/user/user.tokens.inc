<?php
/**
 * @file
 * Builds placeholder replacement tokens for user-related data.
 */

/**
 * Implements hook_token_info().
 */
function user_token_info() {
  $types['user'] = array(
    'name' => t('Users'),
    'description' => t('Tokens related to individual user accounts.'),
    'needs-data' => 'user',
  );
  $types['current-user'] = array(
    'name' => t('Current user'),
    'description' => t('Tokens related to the currently logged in user.'),
    'type' => 'user',
  );

  $user['uid'] = array(
    'name' => t('User ID'),
    'description' => t('The unique ID of the user account.'),
  );
  $user['name'] = array(
    'name' => t('Name'),
    'description' => t('The login name of the user account.'),
  );
  $user['mail'] = array(
    'name' => t('Email'),
    'description' => t('The email address of the user account.'),
  );
  $user['ip-address'] = array(
    'name' => t('IP address'),
    'description' => 'The IP address of the user.',
  );
  $user['roles'] = array(
    'name' => t('Roles'),
    'description' => t('The user roles associated with the user account.'),
    'type' => 'array',
  );

  if (config_get('system.core', 'user_pictures')) {
    $user['picture'] = array(
      'name' => t('Picture'),
      'description' => t('The picture of the user.'),
      'type' => 'file',
    );
  }

  $user['last-login'] = array(
    'name' => t('Last login'),
    'description' => t('The date the user last logged in to the site.'),
    'type' => 'date',
  );
  $user['created'] = array(
    'name' => t('Created'),
    'description' => t('The date the user account was created.'),
    'type' => 'date',
  );
  $user['url'] = array(
    'name' => t('URL'),
    'description' => t('The URL of the account profile page.'),
    'type' => 'url',
  );
  $user['edit-url'] = array(
    'name' => t('Edit URL'),
    'description' => t('The URL of the account edit page.'),
    'type' => 'url',
  );
  $user['cancel-url'] = array(
    'name' => t('Account cancellation URL'),
    'description' => t('The URL of the confirm delete page for the user account.'),
    'restricted' => TRUE,
    'type' => 'url',
  );
  $user['one-time-login-url'] = array(
    'name' => t('One-time login URL'),
    'description' => t('The URL of the one-time login page for the user account.'),
    'restricted' => TRUE,
    'type' => 'url',
  );

  return array(
    'types' => $types,
    'tokens' => array('user' => $user),
  );
}

/**
 * Implements hook_tokens().
 */
function user_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $url_options = array('absolute' => TRUE);
  if (isset($options['language'])) {
    $url_options['language'] = $options['language'];
    $language_code = $options['language']->langcode;
  }
  else {
    $language_code = NULL;
  }
  $sanitize = !empty($options['sanitize']);

  $replacements = array();

  if ($type == 'user' && !empty($data['user'])) {
    $account = $data['user'];
    foreach ($tokens as $name => $original) {
      switch ($name) {

        case 'uid':
          // In the case of hook user_presave uid is not set yet.
          $replacements[$original] = !empty($account->uid) ? $account->uid : t('not yet assigned');
          break;

        case 'name':
          $name = user_format_name($account);
          $replacements[$original] = $sanitize ? check_plain($name) : $name;
          break;

        case 'mail':
          $replacements[$original] = $sanitize ? check_plain($account->mail) : $account->mail;
          break;

        case 'created':
          // In the case of user_presave the created date may not yet be set.
          $replacements[$original] = !empty($account->created) ? format_date($account->created, 'medium', '', NULL, $language_code) : t('not yet created');
          break;

        // These tokens are default variations on the chained tokens handled below.
        case 'last-login':
          $replacements[$original] = !empty($account->login) ? format_date($account->login, 'medium', '', NULL, $language_code) : t('never');
          break;

        case 'picture':
          if (config_get('system.core', 'user_pictures')) {
            $replacements[$original] = theme('user_picture', array('account' => $account));
          }
          break;

        case 'roles':
          // The roles array may be set from checkbox values so ensure it always
          // has 'proper' data with the role names.
          $roles = array_intersect_key(user_roles(), backdrop_map_assoc($account->roles));
          $replacements[$original] = token_render_array($roles, $options);
          break;

        case 'url':
          $replacements[$original] = !empty($account->uid) ? url("user/$account->uid", $url_options) : t('not yet assigned');
          break;

        case 'edit-url':
          $replacements[$original] = !empty($account->uid) ? url("user/$account->uid/edit", $url_options) : t('not yet assigned');
          break;

      }
    }

    // Chained token relationships.
    if ($login_tokens = token_find_with_prefix($tokens, 'last-login')) {
      $replacements += token_generate('date', $login_tokens, array('date' => $account->login), $options);
    }

    if ($registered_tokens = token_find_with_prefix($tokens, 'created')) {
      $replacements += token_generate('date', $registered_tokens, array('date' => $account->created), $options);
    }

    if (!empty($account->picture) && config_get('system.core', 'user_pictures') && ($picture_tokens = token_find_with_prefix($tokens, 'picture'))) {
      $replacements += token_generate('file', $picture_tokens, array('file' => $account->picture), $options);
    }

    if ($url_tokens = token_find_with_prefix($tokens, 'url')) {
      $replacements += token_generate('url', $url_tokens, $account->uri(), $options);
    }

    if ($role_tokens = token_find_with_prefix($tokens, 'roles')) {
      // The roles array may be set from checkbox values so ensure it always
      // has 'proper' data with the role names.
      $roles = array_intersect_key(user_roles(), backdrop_map_assoc($account->roles));
      $replacements += token_generate('array', $role_tokens, array('array' => $roles), $options);
    }
  }

  if ($type == 'current-user') {
    $account = user_load($GLOBALS['user']->uid);
    $replacements += token_generate('user', $tokens, array('user' => $account), $options);

    // Current user tokens.
    if ($type == 'current-user') {
      foreach ($tokens as $name => $original) {
        switch ($name) {
          case 'ip-address':
            $ip = ip_address();
            $replacements[$original] = $sanitize ? check_plain($ip) : $ip;
            break;
        }
      }
    }
  }

  return $replacements;
}
