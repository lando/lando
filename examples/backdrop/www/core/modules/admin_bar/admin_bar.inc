<?php
/**
 * @file
 * Menu builder functions for Administration bar.
 */

/**
 * Build the administration bar output.
 *
 * @param bool $complete
 *   (optional) Whether to build to the complete menu including all components
 *   and ignore the cache. Defaults to FALSE. Internally used for the settings
 *   page.
 */
function admin_bar_output($complete = FALSE) {
  global $user, $language;
  $config = config('admin_bar.settings');

  $cache_server_enabled = !$complete;
  $cid = 'admin_bar:' . $user->uid . ':' . session_id() . ':' . $language->langcode;

  // Try to load and output administration bar from server-side cache. The
  // cache is only valid if a hash key exists, otherwise it needs to be
  // regenerated.
  $old_hash = admin_bar_cache_get($cid);
  if ($cache_server_enabled && $old_hash) {
    $cache = cache('menu')->get($cid);
    if ($cache && isset($cache->data)) {
      $content = $cache->data;
    }
  }

  // Rebuild the output.
  if (!isset($content)) {
    // Retrieve enabled components to display and make them available for others.
    $components = $config->get('components');
    $content['#components'] = $components;
    $content['#complete'] = $complete;

    // Add site name as CSS class for development/staging theming purposes. We
    // leverage the cookie domain instead of HTTP_HOST to account for many (but
    // not all) multi-domain setups (e.g. language-based sub-domains).
    $classes = 'admin-bar-site' . backdrop_strtolower(preg_replace('/[^a-zA-Z0-9-]/', '-', $GLOBALS['cookie_domain']));

    // @todo Always output container to harden JS-less support.
    $content['#prefix'] = '<div id="admin-bar" class="' . $classes . '"><div id="admin-bar-wrapper">';
    $content['#suffix'] = '</div></div>';

    // Load menu builder functions.
    module_load_include('inc', 'admin_bar');

    // Add administration bar.
    if (in_array('admin_bar.menu', $components) || $complete) {
      $content['menu'] = array(
        '#theme' => 'admin_bar_links',
        '#wrapper_attributes' => array(
          'id' => 'admin-bar-menu',
        ),
        '#weight' => 0,
      );

      $content['menu']['menu'] = admin_bar_links_menu(admin_bar_tree('management'));
      $content['menu']['menu']['#title'] = t('Admin bar');
    }

    // Check for status report errors.
    if (user_access('administer site configuration')) {
      $content['alert'] = admin_bar_links_alert();
    }

    // Add menu additions.
    $content['extra']['extra'] = array();
    if (in_array('admin_bar.icon', $components) || $complete) {
      $content['icon'] = admin_bar_links_icon();
    }
    if (in_array('admin_bar.search', $components) || $complete) {
      $content['extra']['extra'] += admin_bar_links_search();
    }
    if (in_array('admin_bar.account', $components) || $complete) {
      $content['extra']['extra'] += admin_bar_links_account();
    }
    if (in_array('admin_bar.users', $components) || $complete) {
      $content['extra']['extra'] += admin_bar_links_users();
    }

    // Allow modules to enhance the menu.
    // Uses '_output' suffix for consistency with the alter hook (see below).
    foreach (module_implements('admin_bar_output_build') as $module) {
      $function = $module . '_admin_bar_output_build';
      $function($content);
    }

    if ($content['extra']['extra']) {
      $content['extra']['#theme'] = 'admin_bar_links';
      $content['extra']['extra']['#title'] = t('More admin tasks');
      $content['extra']['#wrapper_attributes'] = array(
        'id' => 'admin-bar-extra',
      );
      $content['extra']['#weight'] = 100;
    }

    // Allow modules to alter the output.
    // The '_output' suffix is required to prevent hook implementation function
    // name clashes with the contributed Admin module.
    backdrop_alter('admin_bar_output', $content);

    $content = backdrop_render($content);

    // Cache the menu for this user.
    if ($cache_server_enabled) {
      cache('menu')->set($cid, $content);
    }
  }

  // Store the new hash for this user.
  if (!$complete) {
    admin_bar_cache_set($cid, md5($content));
  }

  return $content;
}

/**
 * Build the full administration bar tree from static and expanded dynamic items.
 *
 * @param $menu_name
 *   The menu name to use as base for the tree.
 */
function admin_bar_tree($menu_name) {
  // Get placeholder expansion arguments from hook_admin_bar_map()
  // implementations.
  module_load_include('inc', 'admin_bar', 'admin_bar.map');
  $expand_map = module_invoke_all('admin_bar_map');
  // Allow modules to alter the expansion map.
  backdrop_alter('admin_bar_map', $expand_map);

  $new_map = array();
  foreach ($expand_map as $path => $data) {
    // Convert named placeholders to anonymous placeholders, since the menu
    // system stores paths using anonymous placeholders.
    $replacements = array_fill_keys(array_keys($data['arguments'][0]), '%');
    $data['parent'] = strtr($data['parent'], $replacements);
    $new_map[strtr($path, $replacements)] = $data;
  }
  $expand_map = $new_map;
  unset($new_map);

  // Retrieve dynamic menu link tree for the expansion mappings.
  // @todo Skip entire processing if initial $expand_map is empty and directly
  //   return $tree?
  if (!empty($expand_map)) {
    $tree_dynamic = admin_bar_tree_dynamic($expand_map);
  }
  else {
    $tree_dynamic = array();
  }

  // Merge local tasks with static menu tree.
  $tree = menu_tree_all_data($menu_name);
  admin_bar_merge_tree($tree, $tree_dynamic, array());

  return $tree;
}

/**
 * Load menu link trees for router paths containing dynamic arguments.
 *
 * @param $expand_map
 *   An array containing menu router path placeholder expansion argument
 *   mappings.
 *
 * @return
 *   An associative array whose keys are the parent paths of the menu router
 *   paths given in $expand_map as well as the parent paths of any child link
 *   deeper down the tree. The parent paths are used in admin_bar_merge_tree()
 *   to check whether anything needs to be merged.
 *
 * @see hook_admin_bar_map()
 */
function admin_bar_tree_dynamic(array $expand_map) {
  $p_columns = array();
  for ($i = 1; $i <= MENU_MAX_DEPTH; $i++) {
    $p_columns[] = 'p' . $i;
  }

  // Fetch p* columns for all router paths to expand.
  $router_paths = array_keys($expand_map);
  $plids = db_select('menu_links', 'ml')
    ->fields('ml', $p_columns)
    ->condition('router_path', $router_paths)
    ->execute()
    ->fetchAll(PDO::FETCH_ASSOC);

  // Unlikely, but possible.
  if (empty($plids)) {
    return array();
  }

  // Use queried plid columns to query sub-trees for the router paths.
  $query = db_select('menu_links', 'ml');
  $query->join('menu_router', 'm', 'ml.router_path = m.path');
  $query
    ->fields('ml')
    ->fields('m', array_diff(backdrop_schema_fields_sql('menu_router'), backdrop_schema_fields_sql('menu_links')));

  // The retrieved menu link trees have to be ordered by depth, so parents
  // always come before their children for the storage logic below.
  foreach ($p_columns as $column) {
    $query->orderBy($column, 'ASC');
  }

  $db_or = db_or();
  foreach ($plids as $path_plids) {
    $db_and = db_and();
    // plids with value 0 may be ignored.
    foreach (array_filter($path_plids) as $column => $plid) {
      $db_and->condition($column, $plid);
    }
    $db_or->condition($db_and);
  }
  $query->condition($db_or);
  $result = $query
    ->execute()
    ->fetchAllAssoc('mlid', PDO::FETCH_ASSOC);

  // Store dynamic links grouped by parent path for later merging and assign
  // placeholder expansion arguments.
  $tree_dynamic = array();
  foreach ($result as $mlid => $link) {
    // If contained in $expand_map, then this is a (first) parent, and we need
    // to store by the defined 'parent' path for later merging, as well as
    // provide the expansion map arguments to apply to the dynamic tree.
    if (isset($expand_map[$link['path']])) {
      $parent_path = $expand_map[$link['path']]['parent'];
      $link['expand_map'] = $expand_map[$link['path']]['arguments'];
    }
    // Otherwise, just store this link keyed by its parent path; the expand_map
    // is automatically derived from parent paths.
    else {
      $parent_path = $result[$link['plid']]['path'];
    }

    $tree_dynamic[$parent_path][] = $link;
  }

  return $tree_dynamic;
}

/**
 * Walk through the entire menu tree and merge in expanded dynamic menu links.
 *
 * @param &$tree
 *   A menu tree structure as returned by menu_tree_all_data().
 * @param $tree_dynamic
 *   A dynamic menu tree structure as returned by admin_bar_tree_dynamic().
 * @param $expand_map
 *   An array containing menu router path placeholder expansion argument
 *   mappings.
 *
 * @see hook_admin_bar_map()
 * @see admin_bar_tree_dynamic()
 * @see menu_tree_all_data()
 */
function admin_bar_merge_tree(array &$tree, array $tree_dynamic, array $expand_map) {
  foreach ($tree as $key => $data) {
    $path = $data['link']['router_path'];

    // Recurse into regular menu tree.
    if ($tree[$key]['below']) {
      admin_bar_merge_tree($tree[$key]['below'], $tree_dynamic, $expand_map);
    }
    // Nothing to merge, if this parent path is not in our dynamic tree.
    if (!isset($tree_dynamic[$path])) {
      continue;
    }

    // Add expanded dynamic items.
    foreach ($tree_dynamic[$path] as $link) {
      // If the dynamic item has custom placeholder expansion parameters set,
      // use them, otherwise keep current.
      if (isset($link['expand_map'])) {
        // If there are currently no expansion parameters, we may use the new
        // set immediately.
        if (empty($expand_map)) {
          $current_expand_map = $link['expand_map'];
        }
        else {
          // Otherwise we need to filter out elements that differ from the
          // current set, i.e. that are not in the same path.
          $current_expand_map = array();
          foreach ($expand_map as $arguments) {
            foreach ($arguments as $placeholder => $value) {
              foreach ($link['expand_map'] as $new_arguments) {
                // Skip the new argument if it doesn't contain the current
                // replacement placeholders or if their values differ.
                if (!isset($new_arguments[$placeholder]) || $new_arguments[$placeholder] != $value) {
                  continue;
                }
                $current_expand_map[] = $new_arguments;
              }
            }
          }
        }
      }
      else {
        $current_expand_map = $expand_map;
      }

      // Skip dynamic items without expansion parameters.
      if (empty($current_expand_map)) {
        continue;
      }

      // Expand anonymous to named placeholders.
      // @see _menu_load_objects()
      $path_args = explode('/', $link['path']);
      $load_functions = unserialize($link['load_functions']);
      if (is_array($load_functions)) {
        foreach ($load_functions as $index => $function) {
          if ($function) {
            if (is_array($function)) {
              list($function,) = each($function);
            }
            // Add the loader function name minus "_load".
            $placeholder = '%' . substr($function, 0, -5);
            $path_args[$index] = $placeholder;
          }
        }
      }
      $path_dynamic = implode('/', $path_args);

      // Create new menu items using expansion arguments.
      foreach ($current_expand_map as $arguments) {
        // Create the cartesian product for all arguments and create new
        // menu items for each generated combination thereof.
        foreach (admin_bar_expand_args($arguments) as $replacements) {
          $newpath = strtr($path_dynamic, $replacements);
          // Skip this item, if any placeholder could not be replaced.
          // Faster than trying to invoke _menu_translate().
          if (strpos($newpath, '%') !== FALSE) {
            continue;
          }
          $map = explode('/', $newpath);
          $item = admin_bar_translate($link, $map);
          // Skip this item, if the current user does not have access.
          if (empty($item)) {
            continue;
          }
          // Build subtree using current replacement arguments.
          $new_expand_map = array();
          foreach ($replacements as $placeholder => $value) {
            $new_expand_map[$placeholder] = array($value);
          }
          admin_bar_merge_tree($item, $tree_dynamic, array($new_expand_map));
          $tree[$key]['below'] += $item;
        }
      }
    }
    // Sort new subtree items.
    ksort($tree[$key]['below']);
  }
}

/**
 * Translate an expanded router item into a menu link suitable for rendering.
 *
 * @param $router_item
 *   A menu router item.
 * @param $map
 *   A path map with placeholders replaced.
 */
function admin_bar_translate($router_item, $map) {
  _menu_translate($router_item, $map, TRUE);

  // Run through hook_translated_menu_link_alter() to add devel information,
  // if configured.
  $router_item['menu_name'] = 'management';
  // @todo Invoke as usual like _menu_link_translate().
  admin_bar_translated_menu_link_alter($router_item, NULL);

  if ($router_item['access']) {
    // Override mlid to make this item unique; since these items are expanded
    // from dynamic items, the mlid is always the same, so each item would
    // replace any other.
    // @todo Doing this instead leads to plenty of duplicate links below
    //   admin/structure/menu; likely a hidden recursion problem.
    // $router_item['mlid'] = $router_item['href'] . $router_item['mlid'];
    $router_item['mlid'] = $router_item['href'];
    // Turn menu callbacks into regular menu items to make them visible.
    if ($router_item['type'] == MENU_CALLBACK) {
      $router_item['type'] = MENU_NORMAL_ITEM;
    }

    // @see _menu_tree_check_access()
    $key = (50000 + $router_item['weight']) . ' ' . $router_item['title'] . ' ' . $router_item['mlid'];
    return array($key => array(
      'link' => $router_item,
      'below' => array(),
    ));
  }

  return array();
}

/**
 * Create the cartesian product of multiple varying sized argument arrays.
 *
 * @param $arguments
 *   A two dimensional array of arguments.
 *
 * @see hook_admin_bar_map()
 */
function admin_bar_expand_args($arguments) {
  $replacements = array();

  // Initialize line cursors, move out array keys (placeholders) and assign
  // numeric keys instead.
  $i = 0;
  $placeholders = array();
  $new_arguments = array();
  foreach ($arguments as $placeholder => $values) {
    // Skip empty arguments.
    if (empty($values)) {
      continue;
    }
    $cursor[$i] = 0;
    $placeholders[$i] = $placeholder;
    $new_arguments[$i] = $values;
    $i++;
  }
  $arguments = $new_arguments;
  unset($new_arguments);

  if ($rows = count($arguments)) {
    do {
      // Collect current argument from each row.
      $row = array();
      for ($i = 0; $i < $rows; ++$i) {
        $row[$placeholders[$i]] = $arguments[$i][$cursor[$i]];
      }
      $replacements[] = $row;

      // Increment cursor position.
      $j = $rows - 1;
      $cursor[$j]++;
      while (!array_key_exists($cursor[$j], $arguments[$j])) {
        // No more arguments left: reset cursor, go to next line and increment
        // that cursor instead. Repeat until argument found or out of rows.
        $cursor[$j] = 0;
        if (--$j < 0) {
          // We're done.
          break 2;
        }
        $cursor[$j]++;
      }
    } while (1);
  }

  return $replacements;
}

/**
 * Build the administration bar as renderable menu links.
 *
 * @param $tree
 *   A data structure representing the administration bar tree as returned from
 *   menu_tree_all_data().
 *
 * @return
 *   The complete administration bar, suitable for theme_admin_bar_links().
 *
 * @see theme_admin_bar_links()
 * @see admin_bar_menu_alter()
 */
function admin_bar_links_menu($tree) {
  $links = array();
  foreach ($tree as $data) {
    // Skip items that are inaccessible, invisible, or only appear in the
    // breadcrumb
    if (!$data['link']['access'] || $data['link']['hidden'] == 1 || $data['link']['type'] == MENU_VISIBLE_IN_BREADCRUMB) {
      continue;
    }
    // Hide 'Administer' and make child links appear on this level.
    // @todo Make this configurable.
    if ($data['link']['router_path'] == 'admin') {
      if ($data['below']) {
        $links = array_merge($links, admin_bar_links_menu($data['below']));
      }
      continue;
    }
    // Omit alias lookups.
    $data['link']['localized_options']['alias'] = TRUE;
    // Remove description to prevent mouseover tooltip clashes.
    unset($data['link']['localized_options']['attributes']['title']);

    // Make action links (typically "Add ...") appear first in dropdowns.
    // They might appear first already, but only as long as there is no link
    // that comes alphabetically first (e.g., a node type with label "Ad").
    if ($data['link']['type'] & MENU_IS_LOCAL_ACTION) {
      $data['link']['weight'] -= 1000;
    }

    $links[$data['link']['href']] = array(
      '#title' => $data['link']['title'],
      '#href' => $data['link']['href'],
      '#options' => $data['link']['localized_options'],
      '#weight' => $data['link']['weight'],
    );

    // Recurse to add any child links.
    $children = array();
    if ($data['below']) {
      $children = admin_bar_links_menu($data['below']);
      $links[$data['link']['href']] += $children;
    }

    // Handle links pointing to category/overview pages.
    if ($data['link']['page_callback'] == 'system_admin_menu_block_page' || $data['link']['page_callback'] == 'system_admin_config_page') {
      // Apply a marker for others to consume.
      $links[$data['link']['href']]['#is_category'] = TRUE;
      // Automatically hide empty categories.
      // Check for empty children first for performance. Only when non-empty
      // (typically 'admin/config'), check whether children are accessible.
      if (empty($children) || !element_get_visible_children($children)) {
        $links[$data['link']['href']]['#access'] = FALSE;
      }
    }
  }
  return $links;
}

/**
 * Build icon menu links; mostly containing maintenance helpers.
 *
 * @see theme_admin_bar_links()
 */
function admin_bar_links_icon() {
  $destination = backdrop_get_destination();

  $links = array(
    '#theme' => 'admin_bar_links',
    '#wrapper_attributes' => array(
      'id' => 'admin-bar-icon',
    ),
    '#weight' => -100,
  );
  $links['icon'] = array(
    '#title' => theme('admin_bar_icon'),
    '#attributes' => array('class' => array('admin-bar-icon')),
    '#href' => '<front>',
    '#options' => array(
      'html' => TRUE,
    ),
  );
  // Add link to manually run cron.
  $links['icon']['cron'] = array(
    '#title' => t('Run cron'),
    '#weight' => 50,
    '#access' => user_access('administer site configuration'),
    '#href' => 'admin/reports/status/run-cron',
  );
  // Add link to run update.php.
  $links['icon']['update'] = array(
    '#title' => t('Run updates'),
    '#weight' => 50,
    // @see update_access_allowed()
    '#access' => $GLOBALS['user']->uid == 1 || settings_get('update_free_access') || user_access('administer software updates'),
    '#href' => base_path() . 'core/update.php',
    '#options' => array(
      'external' => TRUE,
    ),
  );
  // Add items to flush caches.
  $links['icon']['flush-cache'] = array(
    '#title' => t('Flush all caches'),
    '#weight' => 20,
    '#access' => user_access('flush caches'),
    '#href' => 'admin_bar/flush-cache',
    '#options' => array(
      'query' => $destination + array('token' => backdrop_get_token('admin_bar/flush-cache')),
    ),
  );
  $caches = module_invoke_all('admin_bar_cache_info');
  foreach ($caches as $name => $cache) {
    $links['icon']['flush-cache'][$name] = array(
      '#title' => $cache['title'],
      '#href' => 'admin_bar/flush-cache/' . $name,
      '#options' => array(
        'query' => $destination + array('token' => backdrop_get_token('admin_bar/flush-cache/' . $name)),
      ),
    );
  }

  return $links;
}

/**
 * Builds the account links.
 *
 * @see theme_admin_bar_links()
 */
function admin_bar_links_account() {
  $links['account'] = array(
    '#title' => user_format_name($GLOBALS['user']),
    '#weight' => 50,
    '#attributes' => array('class' => array('admin-bar-account')),
    '#href' => 'user/' . $GLOBALS['user']->uid,
  );
  $links['logout'] = array(
    '#title' => t('Log out'),
    '#weight' => 51,
    '#attributes' => array('class' => array('admin-bar-logout')),
    '#href' => 'user/logout',
  );
  return $links;
}

/**
 * Builds user counter.
 *
 * @see theme_admin_bar_links()
 */
function admin_bar_links_users() {
  // Add link to show current authenticated/anonymous users.
  $links['user-counter'] = array(
    '#title' => admin_bar_get_user_count(),
    '#description' => t('Current anonymous / authenticated users'),
    '#weight' => 20,
    '#attributes' => array('class' => array('admin-bar-action', 'admin-bar-users')),
    '#href' => (user_access('administer users') ? 'admin/people/list' : 'user'),
  );
  return $links;
}

/**
 * Build search widget.
 *
 * @see theme_admin_bar_links()
 */
function admin_bar_links_search() {
  $search['search'] = array(
    '#pre_render' => array(),
    '#attributes' => array(
      'class' => array('admin-bar-search'),
    ),
  );
  $search['search']['search'] = array(
    '#type' => 'search',
    '#title' => t('Admin search'),
    '#title_display' => 'attribute',
    '#attributes' => array(
      'placeholder' => t('Menu search'),
      'autocomplete' => 'off',
      'autocorrect' => 'off',
      'autocapitalize' => 'off',
    ),
  );
  return $search;
}

/**
 * Build alert indicator.
 */
function admin_bar_links_alert() {
  $alert = array();
  // Check requirements.
  include_once BACKDROP_ROOT . '/core/includes/install.inc';
  $requirements = system_get_requirements();
  if (backdrop_requirements_severity($requirements) == REQUIREMENT_ERROR) {
    // Count the errors.
    $count = 0;
    foreach ($requirements as $requirement) {
      if (isset($requirement['severity']) && $requirement['severity'] == REQUIREMENT_ERROR) {
        $count++;
      }
    }
    $alert = array(
      '#theme' => 'admin_bar_links',
      '#wrapper_attributes' => array(
        'id' => 'admin-bar-alert',
      ),
      '#weight' => 20,
    );

    // Add a link to the status report.
    $alert['alert'] = array(
      '#title' => '<span class="error-label">' . t('Site status') . '</span><span class="error-count">' . $count . '</span>',
      '#attributes' => array(
        'title' => format_plural($count, 'One problem was detected with your Backdrop installation.', 'Several problems were detected with your Backdrop installation.'),
        'class' => array('admin-bar-alert', 'admin-bar-alert-error'),
      ),
      '#href' => 'admin/reports/status',
      '#access' => user_access('administer site configuration'),
      '#options' => array('html' => TRUE),
    );
  }

  return $alert;
}

/**
 * Form builder function for module settings.
 */
function admin_bar_theme_settings() {
  $config = config('admin_bar.settings');
  $form['#config'] = 'admin_bar.settings';
  $form['margin_top'] = array(
    '#type' => 'checkbox',
    '#title' => t('Adjust top margin'),
    '#default_value' => $config->get('margin_top'),
    '#description' => t('Shifts the entire site content down to make room for the administration bar. If disabled, absolute- or fixed-positioned page elements may be covered by the administration bar.'),
  );
  $form['position_fixed'] = array(
    '#type' => 'checkbox',
    '#title' => t('Keep bar at top of page'),
    '#default_value' => $config->get('position_fixed'),
    '#description' => t('Displays the administration bar always at the top of the browser viewport, even when scrolling the page.'),
  );

  $form['components'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Enabled components'),
    '#options' => array(
      'admin_bar.icon' => t('Icon menu'),
      'admin_bar.menu' => t('Management menu'),
      'admin_bar.search' => t('Search bar'),
      'admin_bar.users' => t('User counts'),
      'admin_bar.account' => t('Account links'),
    ),
    '#default_value' => $config->get('components'),
    '#description' => t('These features will be enabled/visible in the administration bar. Untick the boxes to disable/hide them.'),
  );

  $form['actions'] = array(
    '#type' => 'actions',
  );
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  $form['#submit'] = array('admin_bar_theme_settings_submit');
  return system_settings_form($form);
}

/**
 * Submit handler for admin_bar_theme_settings().
 */
function admin_bar_theme_settings_submit($form, &$form_state) {
  // Save the list of components as a simple array, rather than key/value pair.
  $form_state['values']['components'] = array_keys(array_filter($form_state['values']['components']));
}

/**
 * Flush all caches or a specific one.
 *
 * @param $name
 *   (optional) Name of cache to flush.
 */
function admin_bar_flush_cache($name = NULL) {
  if (!isset($_GET['token']) || !backdrop_valid_token($_GET['token'], current_path())) {
    return MENU_ACCESS_DENIED;
  }
  if (isset($name)) {
    $caches = module_invoke_all('admin_bar_cache_info');
    if (!isset($caches[$name])) {
      return MENU_NOT_FOUND;
    }
  }
  else {
    $caches[$name] = array(
      'title' => t('Every'),
      'callback' => 'backdrop_flush_all_caches',
    );
  }
  // Pass the cache to flush forward to the callback.
  $function = $caches[$name]['callback'];
  $function($name);

  backdrop_set_message(t('!title cache cleared.', array('!title' => $caches[$name]['title'])));

  // The JavaScript injects a destination request parameter pointing to the
  // originating page, so the user is redirected back to that page. Without
  // destination parameter, the redirect ends on the front page.
  backdrop_goto();
}

/**
 * Implements hook_admin_bar_cache_info().
 */
function admin_bar_admin_bar_cache_info() {
  $caches['admin_bar'] = array(
    'title' => t('Administration bar'),
    'callback' => '_admin_bar_flush_cache',
  );
  return $caches;
}

/**
 * Implements hook_admin_bar_cache_info().
 */
function system_admin_bar_cache_info() {
  $caches = array(
    'assets' => t('CSS and JavaScript'),
    'cache' => t('Page and else'),
    'layout' => t('Layout'),
    'menu' => t('Menu'),
    'theme' => t('Theme registry'),
    'token' => t('Token registry'),
  );
  foreach ($caches as $name => $cache) {
    $caches[$name] = array(
      'title' => $cache,
      'callback' => '_admin_bar_flush_cache',
    );
  }
  return $caches;
}

/**
 * Implements hook_admin_bar_cache_info() on behalf of Update module.
 */
function update_admin_bar_cache_info() {
  $caches['update'] = array(
    'title' => t('Update data'),
    'callback' => '_update_cache_clear',
  );
  return $caches;
}

/**
 * Flush all caches or a specific one.
 *
 * @param $name
 *   (optional) Name of cache to flush.
 *
 * @see system_admin_bar_cache_info()
 */
function _admin_bar_flush_cache($name = NULL) {
  switch ($name) {
    case 'admin_bar':
      cache('admin_bar')->flush();
      break;

    case 'menu':
      menu_rebuild();
      break;

    case 'cache':
      // Don't clear cache_form - in-progress form submissions may break.
      // Ordered so clearing the page cache will always be the last action.
      // @see backdrop_flush_all_caches()
      $core = array('cache', 'path', 'filter', 'bootstrap', 'token', 'page');
      $cache_bins = array_merge(module_invoke_all('flush_caches'), $core);
      foreach ($cache_bins as $bin) {
        cache($bin)->flush();
      }
      break;

    case 'assets':
      // Change query-strings on css/js files to enforce reload for all users.
      _backdrop_flush_css_js();

      backdrop_clear_css_cache();
      backdrop_clear_js_cache();

      // Clear the page cache, since cached HTML pages might link to old CSS and
      // JS aggregates.
      cache_clear_all('*', 'cache_page', TRUE);
      break;

    case 'theme':
      system_rebuild_theme_data();
      backdrop_theme_rebuild();
      break;

    case 'token':
      token_cache_clear();
      break;

    case 'layout':
      layout_reset_caches();
      break;
  }
}
