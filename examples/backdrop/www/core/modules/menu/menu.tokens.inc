<?php
/**
 * @file
 * Builds placeholder replacement tokens for menu-related data.
 */

/**
 * Implements hook_token_info().
 */
function menu_token_info() {
  // Menu tokens.
  $info['types']['menu'] = array(
    'name' => t('Menus'),
    'description' => t('Tokens related to menus.'),
    'needs-data' => 'menu',
  );
  $info['types']['menu-link'] = array(
    'name' => t('Menu links'),
    'description' => t('Tokens related to menu links.'),
    'needs-data' => 'menu-link',
  );

  $info['tokens']['menu']['name'] = array(
    'name' => t('Name'),
    'description' => t("The name of the menu."),
  );
  $info['tokens']['menu']['machine-name'] = array(
    'name' => t('Machine-readable name'),
    'description' => t("The unique machine-readable name of the menu."),
  );
  $info['tokens']['menu']['description'] = array(
    'name' => t('Description'),
    'description' => t('The optional description of the menu.'),
  );
  $info['tokens']['menu']['menu-link-count'] = array(
    'name' => t('Menu link count'),
    'description' => t('The number of menu links belonging to the menu.'),
  );
  $info['tokens']['menu']['edit-url'] = array(
    'name' => t('Edit URL'),
    'description' => t("The URL of the menu's edit page."),
  );

  $info['tokens']['menu-link']['menu'] = array(
    'name' => t('Menu'),
    'description' => t('The menu of the menu link.'),
    'type' => 'menu',
  );
  $info['tokens']['menu-link']['edit-url'] = array(
    'name' => t('Edit URL'),
    'description' => t("The URL of the menu link's edit page."),
  );
  $info['tokens']['node']['menu-link'] = array(
    'name' => t('Menu link'),
    'description' => t("The menu link for this node."),
    'type' => 'menu-link',
  );

  return $info;
}

/**
 * Implements hook_tokens() on behalf of menu.module.
 */
function menu_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $replacements = array();

  $url_options = array('absolute' => TRUE);
  $sanitize = !empty($options['sanitize']);

  // Node tokens.
  if ($type == 'node' && !empty($data['node'])) {
    $node = $data['node'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'menu-link':
          if ($link = _menu_token_node_link_load($node)) {
            $replacements[$original] = $sanitize ? check_plain($link['title']) : $link['title'];
          }
          break;
      }

      // Chained token relationships.
      if ($menu_tokens = token_find_with_prefix($tokens, 'menu-link')) {
        if ($link = _menu_token_node_link_load($node)) {
          $replacements += token_generate('menu-link', $menu_tokens, array('menu-link' => $link), $options);
        }
      }
    }
  }

  // Menu link tokens.
  elseif ($type == 'menu-link' && !empty($data['menu-link'])) {
    $link = (array) $data['menu-link'];

    // Set options for menu link tokens.
    $url_options = array('absolute' => TRUE);
    $sanitize = !empty($options['sanitize']);

    if (!isset($link['title'])) {
      // Re-load the link if it was not loaded via _menu_token_link_load().
      $link = _menu_token_link_load($link['mlid']);
    }

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'mlid':
          $replacements[$original] = $link['mlid'];
          break;
        case 'title':
          $replacements[$original] = $sanitize ? check_plain($link['title']) : $link['title'];
          break;
        case 'url':
          $replacements[$original] = url($link['href'], $url_options);
          break;
        case 'parent':
          if (!empty($link['plid']) && $parent = _menu_token_link_load($link['plid'])) {
            $replacements[$original] = $sanitize ? check_plain($parent['title']) : $parent['title'];
          }
          break;
        case 'parents':
          if ($parents = _menu_token_link_load_all_parents($link['mlid'])) {
            $replacements[$original] = token_render_array($parents, $options);
          }
          break;
        case 'root';
          if (!empty($link['p1']) && $link['p1'] != $link['mlid'] && $root = _menu_token_link_load($link['p1'])) {
            $replacements[$original] = $sanitize ? check_plain($root['title']) : $root['title'];
          }
          break;
        case 'menu':
          if ($menu = menu_load($link['menu_name'])) {
            $replacements[$original] = $sanitize ? check_plain($menu['title']) : $menu['title'];
          }
          break;
        case 'edit-url':
          $replacements[$original] = url("admin/structure/menu/item/{$link['mlid']}/edit", $url_options);
          break;
      }
    }

    // Chained token relationships.
    if (!empty($link['plid']) && ($source_tokens = token_find_with_prefix($tokens, 'parent')) && $parent = _menu_token_link_load($link['plid'])) {
      $replacements += token_generate('menu-link', $source_tokens, array('menu-link' => $parent), $options);
    }
    // [menu-link:parents:*] chained tokens.
    if ($parents_tokens = token_find_with_prefix($tokens, 'parents')) {
      if ($parents = _menu_token_link_load_all_parents($link['mlid'])) {
        $replacements += token_generate('array', $parents_tokens, array('array' => $parents), $options);
      }
    }
    if (!empty($link['p1']) && $link['p1'] != $link['mlid'] && ($root_tokens = token_find_with_prefix($tokens, 'root')) && $root = _menu_token_link_load($link['p1'])) {
      $replacements += token_generate('menu-link', $root_tokens, array('menu-link' => $root), $options);
    }
    if ($url_tokens = token_find_with_prefix($tokens, 'url')) {
      $replacements += token_generate('url', $url_tokens, array('path' => $link['href']), $options);
    }

    // Chained token relationships.
    if (($menu_tokens = token_find_with_prefix($tokens, 'menu')) && $menu = menu_load($link['menu_name'])) {
      $replacements += token_generate('menu', $menu_tokens, array('menu' => $menu), $options);
    }
  }

  // Menu tokens.
  elseif ($type == 'menu' && !empty($data['menu'])) {
    $menu = (array) $data['menu'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'name':
          $replacements[$original] = $sanitize ? check_plain($menu['title']) : $menu['title'];
          break;
        case 'machine-name':
          // This is a machine name so does not ever need to be sanitized.
          $replacements[$original] = $menu['menu_name'];
          break;
        case 'description':
          $replacements[$original] = $sanitize ? filter_xss($menu['description']) : $menu['description'];
          break;
        case 'menu-link-count':
          $query = db_select('menu_links');
          $query->condition('menu_name', $menu['menu_name']);
          $query->addTag('menu_menu_link_count');
          $count = $query->countQuery()->execute()->fetchField();
          $replacements[$original] = (int) $count;
          break;
        case 'edit-url':
          $replacements[$original] = url("admin/structure/menu/manage/" . $menu['menu_name'], $url_options);
          break;
      }
    }
  }

  return $replacements;
}

/**
 * Token-specific loader for menu links that maintains its own static cache.
 *
 * Access checks are always skipped when loading a menu item for a token.
 *
 * @param int $mlid
 *   The menu link ID of the menu item.
 *
 * @return array
 *   A menu link translated for rendering.
 *
 * @see menu_link_load()
 */
function _menu_token_link_load($mlid) {
  $cache = &backdrop_static(__FUNCTION__, array());

  if (!is_numeric($mlid)) {
    return FALSE;
  }

  if (!isset($cache[$mlid])) {
    $cache[$mlid] = menu_link_load($mlid, TRUE);;
  }

  return $cache[$mlid];
}

/**
 * Load all menu parents given a Menu Link ID.
 *
 * @param int $mlid
 *   Menu Link ID.
 *
 * @return array
 *   Array of link titles keyed by menu link ID.
 */
function _menu_token_link_load_all_parents($mlid) {
  $cache = &backdrop_static(__FUNCTION__, array());

  if (!is_numeric($mlid)) {
    return array();
  }

  if (!isset($cache[$mlid])) {
    $cache[$mlid] = array();
    $plid = db_query("SELECT plid FROM {menu_links} WHERE mlid = :mlid", array(':mlid' => $mlid))->fetchField();
    while ($plid && $parent = _menu_token_link_load($plid)) {
      $cache[$mlid] = array($plid => $parent['title']) + $cache[$mlid];
      $plid = $parent['plid'];
    }
  }

  return $cache[$mlid];
}

/**
 * Load the preferred menu link associated with a node.
 *
 * @param Node $node
 *   A node object for which a menu link should be loaded.
 *
 * @return array|FALSE
 *   A menu link array from _menu_token_link_load() or FALSE if a menu link was
 *   not found.
 *
 * @see menu_node_prepare()
 * @see _menu_token_link_load()
 */
function _menu_token_node_link_load(Node $node) {
  $cache = &backdrop_static(__FUNCTION__, array());

  if (!isset($cache[$node->nid])) {
    // Nodes do not have their menu links loaded via menu_node_load().
    if (!isset($node->menu)) {
      // We need to clone the node as menu_node_prepare() may cause data loss.
      // @see http://drupal.org/node/1317926
      $menu_node = clone $node;
      menu_node_prepare($menu_node);
      $mlid = !empty($menu_node->menu['mlid']) ? $menu_node->menu['mlid'] : FALSE;
    }
    else {
      $mlid = !empty($node->menu['mlid']) ? $node->menu['mlid'] : FALSE;
    }

    $cache[$node->nid] = $mlid;
  }

  return $cache[$node->nid] ? _menu_token_link_load($cache[$node->nid]) : FALSE;
}
