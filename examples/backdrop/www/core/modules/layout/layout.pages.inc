<?php
/**
 * @file
 * Page callbacks for non-administrative pages of Layout module.
 */

/**
 * Menu callback; Generic page callback for all Layout-provided pages.
 */
function layout_page_callback() {
  $args = func_get_args();
  $menu_item_name = array_shift($args);
  $menu_item = layout_menu_item_load($menu_item_name);

  // Determine the correct layout to use at this path.
  $layouts = layout_load_multiple_by_path($menu_item->path);
  $match_found = FALSE;
  $layout = NULL;
  foreach ($layouts as $layout) {
    if ($layout->disabled) {
      continue;
    }

    // Populate the contexts from the menu system.
    $contexts = $layout->getContexts();
    foreach ($contexts as $context) {
      if (isset($context->position) && isset($args[$context->position])) {
        $context->setData($args[$context->position]);
      }
    }

    // Check access to this layout.
    if ($layout->checkAccess()) {
      $match_found = TRUE;
      break;
    }
  }

  // No layouts match based on conditions.
  if (!$match_found) {
    return MENU_NOT_FOUND;
  }

  // Use the selected layout and render it.
  $renderer = layout_create_renderer('standard', $layout);
  return $renderer->render();
}

/**
 * Access callback; Check access for Layout-provided pages.
 *
 * This private function is called from layout_page_access() in layout.module.
 */
function _layout_page_access() {
  $args = func_get_args();
  $menu_item_name = array_shift($args);
  $menu_item = layout_menu_item_load($menu_item_name);

  if ($menu_item) {
    // Populate the contexts from the menu system.
    $contexts = $menu_item->getContexts();
    foreach ($contexts as $context) {
      if (isset($context->position) && isset($args[$context->position])) {
        $context->setData($args[$context->position]);
      }
    }
    return $menu_item->checkAccess();
  }

  return FALSE;
}
