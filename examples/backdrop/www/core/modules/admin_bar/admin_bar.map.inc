<?php

/**
 * @file
 * Implements hook_admin_bar_map() on behalf of core modules.
 *
 * @todo Replace all/most of those API functions with direct DB queries;
 *   we only need the menu arguments (keys), not fully loaded objects.
 */

/**
 * Implements hook_admin_bar_map() on behalf of Layout module.
 */
function layout_admin_bar_map() {
  if (!user_access('administer layouts')) {
    return;
  }
  $layouts = layout_get_all_configs('layout');
  foreach ($layouts as $layout_name => $layout) {
    if (isset($layout['disabled']) && $layout['disabled']) {
      unset($layouts[$layout_name]);
    }
  }
  $map['admin/structure/layouts/manage/%layout_tempstore'] = array(
    'parent' => 'admin/structure/layouts',
    'arguments' => array(
      array('%layout_tempstore' => array_keys($layouts)),
    ),
  );
  return $map;
}

/**
 * Implements hook_admin_bar_map() on behalf of Filter module.
 */
function filter_admin_bar_map() {
  if (!user_access('administer filters')) {
    return;
  }
  $map['admin/config/content/formats/%filter_format'] = array(
    'parent' => 'admin/config/content/formats',
    'arguments' => array(
      array('%filter_format' => array_keys(filter_formats())),
    ),
  );
  return $map;
}

/**
 * Implements hook_admin_bar_map() on behalf of Menu module.
 */
function menu_admin_bar_map() {
  if (!user_access('administer menu')) {
    return;
  }
  $map['admin/structure/menu/manage/%menu'] = array(
    'parent' => 'admin/structure/menu',
    'arguments' => array(
      array('%menu' => array_keys(menu_get_menus())),
    ),
  );
  return $map;
}

/**
 * Implements hook_admin_bar_map() on behalf of Node module.
 */
function node_admin_bar_map() {
  if (!user_access('administer content types')) {
    return;
  }
  $types = node_type_get_types();
  foreach ($types as $type_name => $type) {
    if ($type->disabled) {
      unset($types[$type_name]);
    }
  }
  $map['admin/structure/types/manage/%node_type'] = array(
    'parent' => 'admin/structure/types',
    'arguments' => array(
      array('%node_type' => array_keys($types)),
    ),
  );
  return $map;
}

/**
 * Implements hook_admin_bar_map() on behalf of Field UI module.
 *
 * @todo Figure out how to fix the comment entity bundle mappings.
 */
function field_ui_admin_bar_map() {
  $map = array();

  foreach (entity_get_info() as $entity_type => $entity_info) {
    if (!$entity_info['fieldable']) {
      continue;
    }

    foreach ($entity_info['bundles'] as $bundle => $bundle_info) {
      // @see field_ui_menu()
      if (!isset($bundle_info['admin'])) {
        continue;
      }

      // Check access to this bundle.
      $bundle_info['admin'] += array(
        'access callback' => 'user_access',
        'access arguments' => array('administer site configuration'),
      );
      if (!call_user_func_array($bundle_info['admin']['access callback'], $bundle_info['admin']['access arguments'])) {
        continue;
      }

      if ($fields = field_info_instances($entity_type, $bundle)) {
        $path = $bundle_info['admin']['path'];
        $argument = array();
        if (isset($bundle_info['admin']['bundle argument'])) {
          $bundle_arg = arg($bundle_info['admin']['bundle argument'], $path);
          $argument[$bundle_arg] = array($bundle);
        }
        $argument['%field_ui_menu'] = array_keys($fields);

        if (!isset($map["$path/fields/%field_ui_menu"])) {
          $map["$path/fields/%field_ui_menu"] = array(
            'parent' => "$path/fields",
            'arguments' => array(),
          );
        }
        $map["$path/fields/%field_ui_menu"]['arguments'][] = $argument;
      }
    }
  }

  return $map;
}

/**
 * Implements hook_admin_bar_map() on behalf of Taxonomy module.
 */
function taxonomy_admin_bar_map() {
  if (!user_access('administer taxonomy')) {
    return;
  }
  $map['admin/structure/taxonomy/%taxonomy_vocabulary'] = array(
    'parent' => 'admin/structure/taxonomy',
    'arguments' => array(
      array('%taxonomy_vocabulary' => array_keys(taxonomy_vocabulary_load_multiple(FALSE))),
    ),
  );
  return $map;
}

/**
 * Implements hook_admin_bar_map() on behalf of Views UI module.
 */
function views_ui_admin_bar_map() {
  if (!user_access('administer views')) {
    return;
  }
  $views = array();
  foreach (views_get_enabled_views() as $name => $view) {
    $views[$name] = $view->human_name;
  }
  if (empty($views)) {
    return;
  }
  natcasesort($views);
  $views = array_keys($views);
  $map['admin/structure/views/view/%views_ui_cache'] = array(
    'parent' => 'admin/structure/views',
    'arguments' => array(
      array('%views_ui_cache' => $views),
    ),
  );
  return $map;
}
