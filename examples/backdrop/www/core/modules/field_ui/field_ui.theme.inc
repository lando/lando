<?php
/**
 * @file
 * Theme functions for the Field UI module.
 */

/**
 * Returns HTML for Field UI overview tables.
 *
 * @param $variables
 *   An associative array containing:
 *   - elements: An associative array containing a Form API structure to be
 *     rendered as a table.
 *
 * @ingroup themeable
 */
function theme_field_ui_table($variables) {
  $elements = $variables['elements'];
  $table = array();
  $js_settings = array();

  // Add table headers and attributes.
  foreach (array('header', 'attributes') as $key) {
    if (isset($elements["#$key"])) {
      $table[$key] = $elements["#$key"];
    }
  }

  // Determine the colspan to use for region rows, by checking the number of
  // columns in the headers.
  $columns_count = 0;
  foreach ($table['header'] as $header) {
    $columns_count += (is_array($header) && isset($header['colspan']) ? $header['colspan'] : 1);
  }

  // Render rows, region by region.
  foreach ($elements['#regions'] as $region_name => $region) {
    $region_name_class = backdrop_html_class($region_name);

    // Add region rows.
    if (isset($region['title'])) {
      $table['rows'][] = array(
        'class' => array('region-title', 'region-' . $region_name_class . '-title'),
        'no_striping' => TRUE,
        'data' => array(
          array('data' => $region['title'], 'colspan' => $columns_count),
        ),
      );
    }
    if (isset($region['message'])) {
      $class = (empty($region['rows_order']) ? 'region-empty' : 'region-populated');
      $table['rows'][] = array(
        'class' => array('region-message', 'region-' . $region_name_class . '-message', $class),
        'no_striping' => TRUE,
        'data' => array(
          array('data' => $region['message'], 'colspan' => $columns_count),
        ),
      );
    }

    // Add form rows, in the order determined at pre-render time.
    foreach ($region['rows_order'] as $name) {
      $element = $elements[$name];

      $row = array('data' => array());
      if (isset($element['#attributes'])) {
        $row += $element['#attributes'];
      }

      // Render children as table cells.
      foreach (element_children($element) as $cell_key) {
        $child = &$element[$cell_key];
        // Do not render a cell for children of #type 'value'.
        if (!(isset($child['#type']) && $child['#type'] == 'value')) {
          $cell = array('data' => backdrop_render($child));
          if (isset($child['#cell_attributes'])) {
            $cell += $child['#cell_attributes'];
          }
          $row['data'][] = $cell;
        }
      }
      $table['rows'][] = $row;
    }
  }

  return theme('table', $table);
}

/**
 * Returns HTML for the entity view mode table.
 *
 * @param $variables
 *   An associative array containing:
 *   - element: An associative array containing a Form API structure to be
 *     rendered as a table.
 *
 * @ingroup themeable
 */
function theme_field_ui_view_modes($variables) {
  $element = $variables['element'];
  $view_modes = $element['#view_modes'];
  $entity_type = $element['#entity_type'];
  $path = $element['#admin_path'] . '/display';

  $rows = array();

  $header = array(
    array('data' => t('View modes')),
    array('data' => t('Machine name'), 'class' => array('priority-low')),
    array('data' => t('Operations'), 'class' => array('operations')),
  );

  $label = t('Default');
  $label_desc = t('Used for all view modes which are not customized');

  // Add the row for the default view mode.
  $row = array();
  $row['label'] = $label . '<div class="description">' . $label_desc . '</div>';
  $row['machine'] = t('default');
  $row['operations'] = array(
    'data' => array(
      '#type' => 'dropbutton',
      '#links' => array(
        'manage' => array(
          'title' => t('Manage display'),
          'href' => "$path/default",
        ),
      ),
    ),
  );
  $rows[] = array(
    'data' => $row,
    'class' => array('default-view-mode'),
  );

  $customized_count = 0;
  $default_count = 0;
  foreach ($view_modes as $view_mode_name => $view_mode_info) {
    $row_classes = array('view-mode--' . str_replace('_', '-', $view_mode_name));
    $row = array();

    $row['label'] = check_plain(t($view_mode_info['label']));
    $row['machine'] = $view_mode_name;

    $operations = array();
    if ($view_modes[$view_mode_name]['custom settings']) {
      $customized_count++;
      $operations['manage'] = array(
        'title' => t('Manage display'),
        'href' => "$path/$view_mode_name",
        'query' => array('destination' => $path),
      );
      $operations['reset'] = array(
        'title' => t('Reset to default'),
        'href' => "$path/{$view_mode_name}/reset",
      );
    }
    else {
      $default_count++;
      $row_classes[] = 'uses-default';
      $row['label'] .= '&nbsp;<small>(<em>' . t('Uses the Default view mode') . '</em>)</small>';
      if (user_access('administer view modes')) {
        $operations['enable'] = array(
          'title' => t('Enable'),
          'href' => "$path/{$view_mode_name}/enable",
          'query' => array(
            'token' => backdrop_get_token('view_mode_enable'),
          ),
        );
      }
    }

    if ($view_mode_info['storage'] == 'Custom' && user_access('administer view modes')) {
      $operations['configure'] = array(
        'title' => t('Configure'),
        'href' => "$path/{$view_mode_name}/configure",
      );
      $operations['delete'] = array(
        'title' => t('Delete'),
        'href' => "$path/{$view_mode_name}/delete",
      );
    }

    $row['operations'] = array(
      'data' => array(
        '#type' => 'dropbutton',
        '#links' => $operations,
      ),
    );

    // Add descriptive headers.
    if ($default_count == 1) {
      $text = t('Not customized for !bundle', array('!bundle' => $element['#bundle']));
      $header_row = array($text, '', '');
      $rows[] = array('data' => $header_row, 'class' => array('header'));
      $default_count++; // Ensure header only prints once.
    }
    if ($customized_count == 1) {
      $text = t('Customized for !bundle', array('!bundle' => $element['#bundle']));
      $header_row = array($text, '', '');
      $rows[] = array('data' => $header_row, 'class' => array('header'));
      $customized_count++; // Ensure header only prints once.
    }

    $rows[] = array('data' => $row, 'class' => $row_classes);
  }

  $output = theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('class' => array('field-ui-view-modes'))));

  return $output;
}
