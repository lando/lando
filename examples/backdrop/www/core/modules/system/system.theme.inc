<?php
/**
 * @file
 * Theme functions for the System module.
 */

/**
 * Returns HTML for the Powered by Backdrop text.
 *
 * @ingroup themeable
 */
function theme_system_powered_by() {
  return '<span>' . t('Powered by <a href="@poweredby">Backdrop CMS</a>', array('@poweredby' => 'https://backdropcms.org')) . '</span>';
}

/**
 * Returns HTML for a confirmation form.
 *
 * By default this does not alter the appearance of a form at all,
 * but is provided as a convenience for themers.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_confirm_form($variables) {
  return backdrop_render_children($variables['form']);
}

/**
 * Returns HTML for a system settings form.
 *
 * By default this does not alter the appearance of a form at all,
 * but is provided as a convenience for themers.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_system_settings_form($variables) {
  return backdrop_render_children($variables['form']);
}

/**
 * Returns HTML for an exposed filter form.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: An associative array containing the structure of the form.
 *
 * @return
 *   A string containing an HTML-formatted form.
 *
 * @ingroup themeable
 */
function theme_exposed_filters($variables) {
  $form = $variables['form'];
  $output = '';

  if (isset($form['current'])) {
    $items = array();
    foreach (element_children($form['current']) as $key) {
      $items[] = backdrop_render($form['current'][$key]);
    }
    $output .= theme('item_list', array('items' => $items, 'attributes' => array('class' => array('clearfix', 'current-filters'))));
  }

  $output .= backdrop_render_children($form);

  return '<div class="exposed-filters">' . $output . '</div>';
}

/**
 * Returns HTML for the Appearance page.
 *
 * @param $variables
 *   An associative array containing:
 *   - theme_groups: An associative array containing groups of themes.
 *
 * @ingroup themeable
 */
function theme_system_themes_page($variables) {
  $theme_groups = $variables['theme_groups'];

  $output = '<div id="system-themes-page">';

  foreach ($variables['theme_group_titles'] as $state => $title) {
    if (!count($theme_groups[$state])) {
      // Skip this group of themes if no theme is there.
      continue;
    }
    // Start new theme group.
    $output .= '<div class="system-themes-list system-themes-list-'. $state .' clearfix"><h2>'. $title .'</h2>';

    foreach ($theme_groups[$state] as $theme) {

      // Theme the screenshot.
      $screenshot = $theme->screenshot ? theme('image', $theme->screenshot) : '<div class="no-screenshot">' . t('no screenshot') . '</div>';

      // Localize the theme description.
      $description = t($theme->info['description']);

      // Style theme info
      $notes = count($theme->notes) ? ' (' . join(', ', $theme->notes) . ')' : '';
      $theme->classes[] = 'theme-selector';
      $theme->classes[] = 'clearfix';
      $output .= '<div class="'. join(' ', $theme->classes) .'">' . $screenshot . '<div class="theme-info"><h3>' . $theme->info['name'] . ' ' . (isset($theme->info['version']) ? $theme->info['version'] : '') . $notes . '</h3><div class="theme-description">' . $description . '</div>';

      // Make sure to provide feedback on compatibility.
      if (!empty($theme->incompatible_core)) {
        $output .= '<div class="incompatible">' . t('This version is not compatible with Backdrop CMS !core_version and should be replaced.', array('!core_version' => BACKDROP_CORE_COMPATIBILITY)) . '</div>';
      }
      elseif (!empty($theme->incompatible_php)) {
        if (substr_count($theme->info['php'], '.') < 2) {
          $theme->info['php'] .= '.*';
        }
        $output .= '<div class="incompatible">' . t('This theme requires PHP version @php_required and is incompatible with PHP version !php_version.', array('@php_required' => $theme->info['php'], '!php_version' => phpversion())) . '</div>';
      }
      else {
        $output .= theme('links', array('links' => $theme->operations, 'attributes' => array('class' => array('operations', 'clearfix'))));
      }
      $output .= '</div></div>';
    }
    $output .= '</div>';
  }
  $output .= '</div>';

  return $output;
}

/**
 * Returns HTML for the modules form.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_system_modules_fieldset($variables) {
  $form = $variables['form'];

  // Individual table headers.
  $rows = array();
  // Iterate through all the modules, which are
  // children of this fieldset.
  foreach (element_children($form) as $key) {
    // Stick the key into $module for easier access.
    $module = $form[$key];
    // Create the row for the table.
    $row = array();
    unset($module['enable']['#title']);
    $module['#requires'] = array_filter($module['#requires']);
    $module['#required_by'] = array_filter($module['#required_by']);

    $requires = !empty($module['#requires']);
    $required_by = !empty($module['#required_by']);
    $requirements = '';
    $toggle = '';

    // Add the first column: the checkbox.
    $row[] = array('class' => array('checkbox'), 'data' => backdrop_render($module['enable']));

    // Add the second column: module label and expand/collapse functionalty.
    $row[] = array('class' => array('module'), 'data' => '<label id="module-' . $key . '" for="' . $module['enable']['#id'] . '" class="module-name table-filter-text-source">' . backdrop_render($module['name']) . '</label>');

    // Add the third column: module version number.
    $row[] = array('class' => array('version'), 'data' => backdrop_render($module['version']));

    if ($requires || $required_by) {
      $requirements .= ' <div class="requirements">';
      if ($requires) {
        $requirements .= '<div class="admin-requirements">' . t('Requires: !module-list', array('!module-list' => implode(', ', $module['#requires']))) . '</div>';
      }
      if ($required_by) {
        $requirements .= '<div class="admin-requirements">' . t('Required by: !module-list', array('!module-list' => implode(', ', $module['#required_by']))) . '</div>';
      }
      $requirements .= '</div>';

      // Build a requirements toggle.
      $toggle .= ' <a class="requirements-toggle" href="#">' . t('more') . '</a>';
    }

    // Add the description, along with any modules it requires.
    $details = '<div class="text table-filter-text-source"> ' . backdrop_render($module['description']) . $toggle . '</div>' . $requirements;

    // Add the fourth column: description, along with any modules it requires.
    $row[] = array('class' => array('description'), 'data' => $details);

    // Add the fifth column: links (such as configure or permissions) in their own columns.
    $row[] = array('data' => backdrop_render($module['links']), 'class' => array('operations'));

    // Hide modules that can't be disabled at all.
    if (!$module["#required_by_distribution"]) {
      $rows[] = $row;
    }
  }

  return theme('table', array('header' => $form['#header'], 'rows' => $rows));
}

/**
 * Returns HTML for a message about incompatible modules.
 *
 * @param $variables
 *   An associative array containing:
 *   - message: The form array representing the currently disabled modules.
 *
 * @ingroup themeable
 */
function theme_system_modules_incompatible($variables) {
  return '<div class="incompatible">' . $variables['message'] . '</div>';
}

/**
 * Returns HTML for a table of currently disabled modules.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_system_modules_uninstall($variables) {
  $form = $variables['form'];

  // No theming for the confirm form.
  if (isset($form['confirm'])) {
    return backdrop_render($form);
  }

  // Table headers.
  $header = array(t('Uninstall'),
    t('Name'),
    t('Description'),
  );

  // Display table.
  $rows = array();
  foreach (element_children($form['modules']) as $module) {
    if (!empty($form['modules'][$module]['#required_by'])) {
      $disabled_message = format_plural(count($form['modules'][$module]['#required_by']),
        'To uninstall @module, the following module must be uninstalled first: @required_modules',
        'To uninstall @module, the following modules must be uninstalled first: @required_modules',
        array('@module' => $form['modules'][$module]['#module_name'], '@required_modules' => implode(', ', $form['modules'][$module]['#required_by'])));
      $disabled_message = '<div class="admin-requirements">' . $disabled_message . '</div>';
    }
    else {
      $disabled_message = '';
    }
    $rows[] = array(
      array('data' => backdrop_render($form['uninstall'][$module]), 'align' => 'center'),
      '<strong><label for="' . $form['uninstall'][$module]['#id'] . '">' . backdrop_render($form['modules'][$module]['name']) . '</label></strong>',
      array('data' => backdrop_render($form['modules'][$module]['description']) . $disabled_message, 'class' => array('description')),
    );
  }

  $output  = theme('table', array('header' => $header, 'rows' => $rows, 'empty' => t('No modules are available to uninstall.')));
  $output .= backdrop_render_children($form);

  return $output;
}

/**
 * Returns HTML for the status report.
 *
 * @param $variables
 *   An associative array containing:
 *   - requirements: An array of requirements.
 *
 * @ingroup themeable
 */
function theme_status_report($variables) {
  $requirements = $variables['requirements'];
  $severities = array(
    REQUIREMENT_INFO => array(
      'title' => t('Info'),
      'class' => 'info',
    ),
    REQUIREMENT_OK => array(
      'title' => t('OK'),
      'class' => 'status',
    ),
    REQUIREMENT_WARNING => array(
      'title' => t('Warning'),
      'class' => 'warning',
    ),
    REQUIREMENT_ERROR => array(
      'title' => t('Error'),
      'class' => 'error',
    ),
  );
  $output = '<table class="system-status-report">';

  foreach ($requirements as $requirement) {
    if (empty($requirement['#type'])) {
      $severity = $severities[isset($requirement['severity']) ? (int) $requirement['severity'] : REQUIREMENT_OK];
      $severity['icon'] = '<div title="' . $severity['title'] . '"><span class="element-invisible">' . $severity['title'] . '</span></div>';

      // Output table row(s)
      if (!empty($requirement['description'])) {
        $output .= '<tr class="' . $severity['class'] . ' merge-down"><td class="status-icon">' . $severity['icon'] . '</td><td class="status-title">' . $requirement['title'] . '</td><td class="status-value">' . $requirement['value'] . '</td></tr>';
        $output .= '<tr class="' . $severity['class'] . ' merge-up"><td colspan="3" class="status-description">' . $requirement['description'] . '</td></tr>';
      }
      else {
        $output .= '<tr class="' . $severity['class'] . '"><td class="status-icon">' . $severity['icon'] . '</td><td class="status-title">' . $requirement['title'] . '</td><td class="status-value">' . $requirement['value'] . '</td></tr>';
      }
    }
  }

  $output .= '</table>';
  return $output;
}

/**
 * Returns HTML for an administrative page.
 *
 * @param $variables
 *   An associative array containing:
 *   - blocks: An array of blocks to display. Each array should include a
 *     'title', a 'description', a formatted 'content' and a 'position' which
 *     will control which container it will be in. This is usually 'left' or
 *     'right'.
 *
 * @ingroup themeable
 */
function theme_admin_page($variables) {
  $blocks = $variables['blocks'];

  $stripe = 0;
  $container = array();

  foreach ($blocks as $block) {
    if ($block_output = theme('admin_block', array('block' => $block))) {
      if (empty($block['position'])) {
        // perform automatic striping.
        $block['position'] = ++$stripe % 2 ? 'left' : 'right';
      }
      if (!isset($container[$block['position']])) {
        $container[$block['position']] = '';
      }
      $container[$block['position']] .= $block_output;
    }
  }

  $output = '<div class="admin clearfix">';

  foreach ($container as $id => $data) {
    $output .= '<div class="' . $id . ' clearfix">';
    $output .= $data;
    $output .= '</div>';
  }
  $output .= '</div>';
  return $output;
}

/**
 * Returns HTML for an administrative block for display.
 *
 * @param $variables
 *   An associative array containing:
 *   - block: An array containing information about the block:
 *     - show: A Boolean whether to output the block. Defaults to FALSE.
 *     - title: The block's title.
 *     - content: (optional) Formatted content for the block.
 *     - description: (optional) Description of the block. Only output if
 *       'content' is not set.
 *
 * @ingroup themeable
 */
function theme_admin_block($variables) {
  $block = $variables['block'];
  $output = '';

  // Don't display the block if it has no content to display.
  if (empty($block['show'])) {
    return $output;
  }

  $output .= '<div class="admin-panel">';
  if (!empty($block['title'])) {
    $output .= '<h3>' . $block['title'] . '</h3>';
  }
  if (!empty($block['content'])) {
    $output .= '<div class="body">' . $block['content'] . '</div>';
  }
  else {
    $output .= '<div class="description">' . $block['description'] . '</div>';
  }
  $output .= '</div>';

  return $output;
}

/**
 * Returns HTML for the content of an administrative block.
 *
 * @param $variables
 *   An associative array containing:
 *   - content: An array containing information about the block. Each element
 *     of the array represents an administrative menu item, and must at least
 *     contain the keys 'title', 'href', and 'localized_options', which are
 *     passed to l(). A 'description' key may also be provided.
 *
 * @ingroup themeable
 */
function theme_admin_block_content($variables) {
  $content = $variables['content'];
  $output = '';

  if (!empty($content)) {
    $class = 'admin-list';
    $output .= '<dl class="' . $class . '">';
    foreach ($content as $item) {
      $output .= '<dt>' . l($item['title'], $item['href'], $item['localized_options']) . '</dt>';
      if (isset($item['description'])) {
        $output .= '<dd>' . filter_xss_admin($item['description']) . '</dd>';
      }
    }
    $output .= '</dl>';
  }
  return $output;
}

/**
 * Returns HTML for the output of the dashboard page.
 *
 * @param $variables
 *   An associative array containing:
 *   - menu_items: An array of modules to be displayed.
 *
 * @ingroup themeable
 */
function theme_system_admin_index($variables) {
  $menu_items = $variables['menu_items'];

  $stripe = 0;
  $container = array('left' => '', 'right' => '');
  $flip = array('left' => 'right', 'right' => 'left');
  $position = 'left';

  // Iterate over all modules.
  foreach ($menu_items as $module => $block) {
    list($description, $items) = $block;

    // Output links.
    if (count($items)) {
      $block = array();
      $block['title'] = $module;
      $block['content'] = theme('admin_block_content', array('content' => $items));
      $block['description'] = t($description);
      $block['show'] = TRUE;

      if ($block_output = theme('admin_block', array('block' => $block))) {
        if (!isset($block['position'])) {
          // Perform automatic striping.
          $block['position'] = $position;
          $position = $flip[$position];
        }
        $container[$block['position']] .= $block_output;
      }
    }
  }

  $output = '<div class="admin clearfix">';
  foreach ($container as $id => $data) {
    $output .= '<div class="' . $id . ' clearfix">';
    $output .= $data;
    $output .= '</div>';
  }
  $output .= '</div>';

  return $output;
}

/**
 * Theme a link to a token tree either as a regular link or a dialog.
 */
function theme_token_tree_link($variables) {
  if (empty($variables['text'])) {
    $variables['text'] = t('Browse available tokens');
  }

  if (!empty($variables['dialog'])) {
    backdrop_add_library('system', 'token');
    $variables['options']['attributes']['class'][] = 'use-ajax token-browser-link';
  }

  $info = system_theme();
  $tree_variables = array_intersect_key($variables, $info['token_tree']['variables']);
  $tree_variables = backdrop_array_diff_assoc_recursive($tree_variables, $info['token_tree']['variables']);
  if (!isset($variables['options']['query']['options'])) {
    $variables['options']['query']['options'] = array();
  }
  $variables['options']['query']['options'] += $tree_variables;

  // We should never pass the dialog option to theme_token_tree(). It is only
  // used for this function.
  unset($variables['options']['query']['options']['dialog']);

  // Add a security token so that the tree page should only work when used
  // when the dialog link is output with theme('token_tree_link').
  $variables['options']['query']['token'] = backdrop_get_token('token-tree:' . serialize($variables['options']['query']['options']));

  // Because PHP converts query strings with arrays into a different syntax on
  // the next request, the options have to be encoded with JSON in the query
  // string so that we can reliably decode it for token comparison.
  $variables['options']['query']['options'] = backdrop_json_encode($variables['options']['query']['options']);

  // Set the token tree to open in a separate window.
  $variables['options']['attributes'] + array('target' => '_blank');

  return l($variables['text'], 'token/tree', $variables['options']);
}

/**
 * Theme a tree table.
 *
 * @ingroup themeable
 */
function theme_tree_table($variables) {
  foreach ($variables['rows'] as &$row) {
    $row += array('class' => array());
    if (!empty($row['id'])) {
      $row['data-tt-id'] = $row['id'];
      $row['no_striping'] = TRUE;
      unset($row['id']);
    }
    if (!empty($row['parent'])) {
      $row['data-tt-parent-id'] = $row['parent'];
      unset($row['parent']);
    }
  }

  if (!empty($variables['rows'])) {
    backdrop_add_library('system', 'jquery.treetable');
  }

  return theme('table', $variables);
}

/**
 * Provide a 'tree' display of nested tokens.
 *
 * @ingroup themeable
 */
function theme_token_tree($variables) {
  $token_types = $variables['token_types'];
  $info = token_get_info();

  if ($token_types == 'all') {
    $token_types = array_keys($info['types']);
  }
  elseif ($variables['global_types']) {
    $token_types = array_merge($token_types, token_get_global_token_types());
  }

  $options = array(
    'flat' => TRUE,
    'restricted' => $variables['show_restricted'],
    'depth' => $variables['recursion_limit'],
  );
  $multiple_token_types = (count($token_types) > 1);
  $rows = array();

  foreach ($info['types'] as $type => $type_info) {
    if (!in_array($type, $token_types)) {
      continue;
    }

    if ($multiple_token_types) {
      $row = _token_token_tree_format_row($type, $type_info, TRUE);
      unset($row['data']['value']);
      $rows[] = $row;
    }

    $tree = token_build_tree($type, $options);
    foreach ($tree as $token => $token_info) {
      if (!empty($token_info['restricted']) && empty($variables['show_restricted'])) {
        continue;
      }
      if (!empty($token_info['deprecated'])) {
        continue;
      }
      if ($multiple_token_types && !isset($token_info['parent'])) {
        $token_info['parent'] = $type;
      }
      $row = _token_token_tree_format_row($token, $token_info);
      unset($row['data']['value']);
      $rows[] = $row;
    }
  }

  $table_variables = array(
    'header' => array(
      t('Name'),
      t('Token'),
    ),
    'rows' => $rows,
    'attributes' => array('class' => array('token-tree')),
    'empty' => t('No tokens available'),
  );

  if ($variables['click_insert']) {
    $table_variables['caption'] = t('Select a token to insert it into the current field.');
    $table_variables['attributes']['class'][] = 'token-click-insert';
  }

  backdrop_add_library('system', 'token');
  $output = theme('tree_table', $table_variables);
  return $output;
}

/**
 * Build a row in the token tree.
 */
function _token_token_tree_format_row($token, array $token_info, $is_group = FALSE) {
  // Build a statically cached array of default values. This is around four
  // times as efficient as building the base array from scratch each time this
  // function is called.
  static $defaults = array(
    'id' => '',
    'class' => array(),
    'data' => array(
      'name' => '',
      'token' => '',
      'value' => '',
    ),
  );

  $row = $defaults;
  $row['id'] = backdrop_clean_css_identifier($token);
  $row['data']['name']['data'] = $token_info['name'];
  $row['data']['name']['class'][] = 'token-name';

  if ($is_group) {
    // This is a token type/group.
    $row['class'][] = 'token-group';
    $row['data']['token']['data'] = '<span class="token-group-description">' . $token_info['description'] . '</span>';
  }
  else {
    // This is a token.
    $row['data']['token']['class'][] = 'token-token';
    $row['data']['token']['data'] = '<span class="token-key">' . $token . '</span>';
    if (isset($token_info['value'])) {
      $row['data']['value'] = $token_info['value'];
    }
    if (!empty($token_info['parent'])) {
      $row['parent'] = backdrop_clean_css_identifier($token_info['parent']);
    }
    $row['data']['token']['data'] .= '<span class="token-description">' . $token_info['description'] . '</span>';
  }

  return $row;
}
