<?php
/**
 * @file
 * Class for storing information about menu item entries.
 *
 * Menu item entries may be shared between multiple layouts. Several
 * different layouts may exist at the same path with different selection
 * criteria, i.e. a menu local task (tab) at node/%/example.
 */
class LayoutMenuItem {

  /**
   * The machine name of the layout menu item.
   *
   * This name usually matches the layout name that created the menu item. If
   * multiple layouts are at the same path, this name will match the layout with
   * the highest weight, which is typically the "fallback" layout at that path.
   *
   * @var string
   */
  var $name = '';

  /**
   * The title of this menu item.
   *
   * @var string
   */
  var $title = '';

  /**
   * The menu path of this item.
   *
   * @var string
   */
  var $path = '';

  /**
   * The settings for this menu item's menu link (if any).
   *
   * This contains at least the following properties:
   *  - title: The title of this menu item link.
   *  - weight: The position in the menu.
   *  - type: The menu item type.
   *  - parent: The parent menu item information, including name and weight if
   *    this item is in a menu.
   *
   * @var array
   */
  var $menu = array(
    'title' => NULL,
    'weight' => 0,
    'type' => 'none',
    'name' => 'main-menu',
    'parent' => array(
      'title' => NULL,
      'weight' => 0,
      'type' => 'none',
      'name' => 'main-menu',
    ),
  );

  /**
   * An array of all conditional rules used by this menu item.
   *
   * @var LayoutAccess[]
   */
  var $conditions = array();

  /**
   * An array of context configurations.
   *
   * Each item in this array is an array keyed by path position with the
   * following values:
   *   - plugin: The name of the context plugin for this argument.
   *   - name: The automatically generated name for this context.
   *   - position: The position in the path for this context.
   */
  var $arguments = array();

  /**
   * Whether this menu item is locked (being currently edited).
   *
   * @var boolean
   */
  var $locked = FALSE;

  /**
   * Whether this menu item has just been created and not yet saved.
   *
   * @var bool
   */
  var $is_new = FALSE;

  /**
   * The module that originally provided this layout menu item (if any).
   *
   * @var string
   */
  var $module;

  /**
   * An array of LayoutContext instances used by this menu item.
   *
   * @var LayoutContext[]
   */
  private $contexts;

  /**
   * Constructor for LayoutMenuItems.
   */
  function __construct($data) {
    foreach ($data as $key => $value) {
      $this->$key = $value;
    }

    // Ensure defaults for menu settings.
    if (empty($this->menu)) {
      $this->menu = array();
    }
    $this->menu += array(
      'type' => 'none',
      'title' => '',
      'weight' => 0,
      'name' => 'main-menu',
    );
    if (!isset($this->menu['parent'])) {
      $this->menu['parent'] = array();
    }
    $this->menu['parent'] += array(
      'type' => 'none',
      'title' => '',
      'weight' => 0,
      'name' => 'main-menu',
    );

    // Load conditions.
    foreach ($this->conditions as $key => $condition) {
      $this->conditions[$key] = layout_create_handler('layout_access', $condition['plugin'], $condition['data']);
    }
  }

  /**
   * Save a menu item configuration.
   */
  function save() {
    // Convert all properties to an array.
    $data = array(
      'name' => $this->name,
      'title' => $this->title,
      'path' => $this->path,
      'menu' => $this->menu,
      'conditions' => array(),
      'arguments' => $this->arguments,
    );

    // Convert all conditions.
    foreach ($this->conditions as $condition) {
      unset($condition->is_new);
      $data['conditions'][] = array(
        'plugin' => $condition->plugin,
        'data' => $condition->toArray(),
      );
    }

    config('layout.menu_item.' . $this->name)
      ->setData($data)
      ->save();
    layout_reset_caches();
    menu_rebuild();
  }

  /**
   * Delete a menu item configuration.
   */
  function delete() {
    config('layout.menu_item.' . $this->name)
      ->delete();
    layout_reset_caches();
    menu_rebuild();
  }

  /**
   * Revert a menu item back to its module-provided default.
   */
  function revert() {
    if ($this->module) {
      config_install_default_config($this->module, 'layout.menu_item.' . $this->name);
      layout_reset_caches();
      menu_rebuild();
    }
  }

  /**
   * Rename this menu item to match the most appropriate layout at the same path.
   *
   * If this menu item's parent layouts have been edited, reordered, or deleted
   * the menu item may need to be reassigned to a different layout. This checks
   * all of the layouts that match this menu item's path, and renames this menu
   * item to match the highest weighted layout (which is usually the fallback
   * layout at a particular path). If no layouts are associated with this
   * particular path any more, this menu item will be deleted.
   */
  function reassign() {
    // Before reassigning, clear caches so that our layout list is up-to-date.
    layout_reset_caches();
    $layout_names = layout_get_path_layout_names($this->path);

    // If affiliated with layouts, take the last one and match its name.
    if (count($layout_names)) {
      $layout_name = array_pop($layout_names);
      if ($this->name != $layout_name) {
        $this->delete();
        $this->name = $layout_name;
        $this->save();
      }
    }
    // If no longer affiliated with any layouts, delete this menu item.
    else {
      $this->delete();
    }

    layout_reset_caches();
    menu_rebuild();
  }

  /**
   * Get all contexts required or configured for this menu path.
   *
   * return LayoutContext[]
   */
  function getContexts() {
    if (is_null($this->contexts)) {
      // Required contexts are generated on-demand.
      $contexts = layout_context_required_by_path($this->path);
      $path_parts = explode('/', $this->path);

      // Add in configured arguments.
      foreach ($this->arguments as $position => $argument_config) {
        if (isset($path_parts[$position]) && $path_parts[$position] === '%') {
          $context_config = $argument_config + array('required' => TRUE);
          $contexts[$position] = layout_create_context($argument_config['plugin'], $context_config);
        }
      }

      // Add on the current user context, which is always available.
      $contexts['current_user'] = layout_create_context('user', array(
        'name' => 'current_user',
        'label' => t('Current user'),
        'locked' => TRUE,
      ));
      $contexts['current_user']->setData($GLOBALS['user']);

      $this->contexts = $contexts;
    }
    return $this->contexts;
  }

  /**
   * Reset the internally stored contexts.
   *
   * This is used before storing a layout, or when fresh contexts are important,
   * such as when actively changing the layout's path.
   */
  function resetContexts() {
    $this->contexts = NULL;
  }

  /**
   * Check if the menu item has a context of a particular name.
   *
   * @param array $required_contexts
   *   An unindexed array of context plugin names.
   * @return boolean
   *   TRUE if this menu item has all the required contexts, FALSE otherwise.
   */
  function hasContexts(array $required_contexts) {
    $all_contexts = $this->getContexts();
    foreach ($required_contexts as $required_context_name) {
      $context_missing = TRUE;
      foreach ($all_contexts as $context) {
        if ($context->plugin === $required_context_name) {
          // Matching context available, continue to the next one.
          $context_missing = FALSE;
          break;
        }
      }
      if ($context_missing) {
        return FALSE;
      }
    }

    return TRUE;
  }

  /**
   * Check access to this menu item based on the current contexts.
   *
   * @see _layout_page_access()
   */
  function checkAccess() {
    $contexts = $this->getContexts();
    foreach ($this->conditions as $condition) {
      $condition->setContexts($contexts);
      if (!$condition->checkAccess()) {
        return FALSE;
      }
    }
    return TRUE;
  }
}
