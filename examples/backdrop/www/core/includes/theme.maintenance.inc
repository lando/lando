<?php

/**
 * @file
 * Theming for maintenance pages.
 */

/**
 * Sets up the theming system for maintenance page.
 *
 * Used for site installs, updates and when the site is in maintenance mode.
 * It also applies when the database is unavailable or bootstrap was not
 * complete. Seven is always used for the initial install and update
 * operations. In other cases, Bartik is used, but this can be overridden by
 * setting a "maintenance_theme" key in the $conf variable in settings.php.
 */
function _backdrop_maintenance_theme() {
  global $theme, $theme_key;

  // If $theme is already set, assume the others are set too, and do nothing.
  if (isset($theme)) {
    return;
  }

  require_once BACKDROP_ROOT . '/' . settings_get('path_inc', 'core/includes/path.inc');
  require_once BACKDROP_ROOT . '/core/includes/theme.inc';
  require_once BACKDROP_ROOT . '/core/includes/common.inc';
  require_once BACKDROP_ROOT . '/core/includes/unicode.inc';
  require_once BACKDROP_ROOT . '/core/includes/file.inc';
  require_once BACKDROP_ROOT . '/core/includes/module.inc';
  unicode_check();

  // Install and update pages are treated differently to prevent theming overrides.
  if (defined('MAINTENANCE_MODE') && (MAINTENANCE_MODE == 'install' || MAINTENANCE_MODE == 'update')) {
    $custom_theme = settings_get('maintenance_theme', 'seven');
  }
  else {
    // The bootstrap was not complete. So we are operating in a crippled
    // environment, we need to bootstrap just enough to allow hook invocations
    // to work. See _backdrop_log_error().
    if (!class_exists('Database', FALSE)) {
      require_once BACKDROP_ROOT . '/core/includes/database/database.inc';
    }

    // We use the default theme as the maintenance theme. If a maintenance theme
    // isn't specified in the database or in settings.php, we use the default.
    try {
      $custom_theme = settings_get('maintenance_theme');
      if (empty($custom_theme)) {
        $custom_theme = config_get('system.core', 'maintenance_theme');
      }
      if (empty($custom_theme)) {
        $custom_theme = config_get('system.core', 'theme_default');
      }
    }
    catch (ConfigException $e) {}
  }

  if (empty($custom_theme)) {
    $custom_theme = 'seven';
  }

  // Ensure that system.module is loaded.
  if (!function_exists('_system_rebuild_theme_data')) {
    $module_list['system']['filename'] = 'core/modules/system/system.module';
    module_list(TRUE, FALSE, FALSE, $module_list);
    backdrop_load('module', 'system');
  }

  $themes = list_themes();

  // list_themes() triggers a backdrop_alter() in maintenance mode, but we can't
  // let themes alter the .info data until we know a theme's base themes. So
  // don't set global $theme until after list_themes() builds its cache.
  $theme = $custom_theme;

  // Store the identifier for retrieving theme settings with.
  $theme_key = $theme;

  // Find all our ancestor themes and put them in an array.
  $base_theme = array();
  $ancestor = $theme;
  while ($ancestor && isset($themes[$ancestor]->base_theme)) {
    $base_theme[] = $new_base_theme = $themes[$themes[$ancestor]->base_theme];
    $ancestor = $themes[$ancestor]->base_theme;
  }
  _backdrop_theme_initialize($themes[$theme], array_reverse($base_theme), '_theme_load_offline_registry');

  // These are usually added from system_init() -except maintenance.css.
  // When the database is inactive it's not called so we add it here.
  $path = backdrop_get_path('module', 'system');
  backdrop_add_css('core/misc/normalize.css', array('group' => CSS_SYSTEM, 'every_page' => TRUE));
  backdrop_add_css($path . '/css/system.css');
  backdrop_add_css($path . '/css/system.admin.css');
  backdrop_add_css($path . '/css/system.theme.css');
  backdrop_add_css($path . '/css/system.maintenance.css');
}

/**
 * Builds the registry when the site needs to bypass any database calls.
 */
function _theme_load_offline_registry($theme, $base_theme = NULL, $theme_engine = NULL) {
  return _theme_build_registry($theme, $base_theme, $theme_engine);
}

/**
 * Returns HTML for a list of maintenance tasks to perform.
 *
 * @param $variables
 *   An associative array containing:
 *   - items: An associative array of maintenance tasks.
 *   - active: The key for the currently active maintenance task.
 *
 * @ingroup themeable
 */
function theme_task_list($variables) {
  $items = $variables['items'];
  $active = $variables['active'];

  $done = isset($items[$active]) || $active == NULL;
  $total = count($items);
  $count = 0;
  $current = 0;
  $list = '';

  foreach ($items as $k => $item) {
    $count++;
    if ($active == $k) {
      $class = 'active';
      $status = '(' . t('active') . ')';
      $done = FALSE;
      $current = $count;
    }
    else {
      $class = $done ? 'done' : '';
      $status = $done ? '(' . t('done') . ')' : '';
    }
    $list .= '<li';
    $list .= ($class ? ' class="' . $class . '"' : '') . '>';
    $list .= $item;
    $list .= ($status ? '<span class="element-invisible">' . $status . '</span>' : '');
    $list .= '</li>';
  }

  $output = '<h2 class="element-invisible">Installation tasks</h2>';
  $output .= '<div class="step-indicator">' . t('Step !current of !total', array('!current' => $current, '!total' => $total)) . '</div>';
  $output .= '<ol class="task-list">' . $list . '</ol>';

  return $output;
}

/**
 * Returns HTML for the installation page.
 *
 * Note: this function is not themeable.
 *
 * @param $variables
 *   An associative array containing:
 *   - content: The page content to show.
 */
function theme_install_page($variables) {
  backdrop_add_http_header('Content-Type', 'text/html; charset=utf-8');
  return theme('maintenance_page', $variables);
}

/**
 * Returns HTML for the update page.
 *
 * Note: this function is not themeable.
 *
 * @param $variables
 *   An associative array containing:
 *   - content: The page content to show.
 *   - show_messages: Whether to output status and error messages.
 *     FALSE can be useful to postpone the messages to a subsequent page.
 */
function theme_update_page($variables) {
  backdrop_add_http_header('Content-Type', 'text/html; charset=utf-8');
  return theme('maintenance_page', $variables);
}

/**
 * Returns HTML for a results report of an operation run by authorize.php.
 *
 * @param $variables
 *   An associative array containing:
 *   - messages: An array of result messages.
 *
 * @ingroup themeable
 */
function theme_authorize_report($variables) {
  $messages = $variables['messages'];
  $output = '';
  if (!empty($messages)) {
    $output .= '<div id="authorize-results">';
    foreach ($messages as $heading => $logs) {
      $items = array();
      foreach ($logs as $number => $log_message) {
        if ($number === '#abort') {
          continue;
        }
        $items[] = theme('authorize_message', array('message' => $log_message['message'], 'success' => $log_message['success']));
      }
      $output .= theme('item_list',  array('items' => $items, 'title' => $heading));
    }
    $output .= '</div>';
  }
  return $output;
}

/**
 * Returns HTML for a single log message from the authorize.php batch operation.
 *
 * @param $variables
 *   An associative array containing:
 *   - message: The log message.
 *   - success: A boolean indicating failure or success.
 *
 * @ingroup themeable
 */
function theme_authorize_message($variables) {
  $message = $variables['message'];
  $success = $variables['success'];
  if ($success) {
    $item = array('data' => $message, 'class' => array('success'));
  }
  else {
    $item = array('data' => '<strong>' . $message . '</strong>', 'class' => array('failure'));
  }
  return $item;
}
