<?php
/**
 * @file
 * API documentation for Administration bar.
 */

/**
 * Provide expansion arguments for dynamic menu items.
 *
 * The map items must be keyed by the dynamic path to expand, i.e. a menu path
 * containing one or more '%' placeholders. Each map item may have the following
 * properties:
 * - parent: The parent menu path to link the expanded items to.
 * - arguments: An array of argument sets that will be used in the expansion.
 *   Each set consists of an array of one or more placeholders, which again is
 *   an array of possible expansion values. Upon expansion, each argument is
 *   combined with every other argument from the set (technically, the cartesian
 *   product of all arguments). The expansion values may be empty; that is, you
 *   do not need to insert logic to skip map items for which no values exist,
 *   since Administration bar will take care of that.
 *
 * @see admin_bar.map.inc
 */
function hook_admin_bar_map() {
  // Expand content types below Structure > Content types.
  // The key denotes the dynamic path to expand to multiple menu items.
  $map['admin/structure/types/manage/%node_type'] = array(
    // Link generated items directly to the "Content types" item.
    'parent' => 'admin/structure/types',
    // Create expansion arguments for the '%node_type' placeholder.
    'arguments' => array(
      array(
        '%node_type' => array_keys(node_type_get_types()),
      ),
    ),
  );
  return $map;
}

/**
 * Add to the administration bar content before it is rendered.
 *
 * Only use this hook to add new data to the menu structure. Use
 * hook_admin_bar_output_alter() to *alter* existing data.
 *
 * @param array $content
 *   A structured array suitable for backdrop_render(), potentially containing:
 *   - menu: The administrative bar of links below the path 'admin/*'.
 *   - icon: The icon menu.
 *   - account: The user account name and log out link.
 *   - users: The user counter.
 *   Additionally, these special properties:
 *   - #components: The actual components contained in $content are configurable
 *     and depend on the 'admin_bar.settings.components' configuration value.
 *     #components holds a copy of that for convenience.
 *   - #complete: A Boolean indicating whether the complete menu should be built,
 *     ignoring the current configuration in #components.
 *   Passed by reference.
 *
 * @see hook_admin_bar_output_alter()
 * @see admin_bar_links_menu()
 * @see admin_bar_links_icon()
 * @see admin_bar_links_user()
 * @see theme_admin_bar_links()
 */
function hook_admin_bar_output_build(&$content) {
  // In case your implementation provides a configurable component, check
  // whether the component should be displayed:
  if (in_array('shortcut.links', $content['#components']) && !$content['#complete']) {
    return;
  }

  // Add new top-level item to the menu.
  if (isset($content['menu'])) {
    $content['menu']['myitem'] = array(
      '#title' => t('My item'),
      // #attributes are used for list items (LI).
      '#attributes' => array('class' => array('mymodule-myitem')),
      '#href' => 'mymodule/path',
      // #options are passed to l().
      '#options' => array(
        'query' => backdrop_get_destination(),
        // Apply a class on the link (anchor).
        'attributes' => array('class' => array('myitem-link-anchor')),
      ),
      // #weight controls the order of links in the resulting item list.
      '#weight' => 50,
    );
  }
  // Add link to the icon menu to manually run cron.
  if (isset($content['icon'])) {
    $content['icon']['myitem']['cron'] = array(
      '#title' => t('Run cron'),
      '#access' => user_access('administer site configuration'),
      '#href' => 'admin/reports/status/run-cron',
    );
  }
}

/**
 * Change the administration bar content before it is rendered.
 *
 * Only use this hook to alter existing data in the menu structure. Use
 * hook_admin_bar_output_build() to *add* new data.
 *
 * @param array $content
 *   A structured array suitable for backdrop_render(). Passed by reference.
 *
 * @see hook_admin_bar_output_build()
 */
function hook_admin_bar_output_alter(&$content) {
}

/**
 * Return content to be replace via JS in the cached menu output.
 *
 * @param bool $complete
 *   A Boolean indicating whether all available components of the menu will be
 *   output and the cache will be skipped.
 *
 * @return array
 *   An associative array whose keys are jQuery selectors and whose values are
 *   strings containing the replacement content.
 */
function hook_admin_bar_replacements($complete) {
  $items = array();
  // If the complete menu is output, then it is uncached and will contain the
  // current counts already.
  if (!$complete) {
    // Check whether the users count component is enabled.
    $components = config_get('admin_bar.settings', 'components');
    if (!empty($components['admin_bar.users']) && ($user_count = admin_bar_get_user_count())) {
      // Replace the counters in the cached menu output with current counts.
      $items['.admin-bar-users a'] = $user_count;
    }
  }
  return $items;
}

/**
 * Inform about additional module-specific caches that can be cleared.
 *
 * Administration bar uses this hook to gather information about available
 * caches that can be flushed individually. Each returned item forms a separate
 * menu link below the "Flush all caches" link in the icon menu.
 *
 * @return array
 *   An associative array whose keys denote internal identifiers for a
 *   particular caches (which can be freely defined, but should be in a module's
 *   namespace) and whose values are associative arrays containing:
 *   - title: The name of the cache, without "cache" suffix. This label is
 *     output as link text, but also for the "!title cache cleared."
 *     confirmation message after flushing the cache; make sure it works and
 *     makes sense to users in both locations.
 *   - callback: The name of a function to invoke to flush the individual cache.
 */
function hook_admin_bar_cache_info() {
  $caches['update'] = array(
    'title' => t('Update data'),
    'callback' => '_update_cache_clear',
  );
  return $caches;
}
