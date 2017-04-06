<?php
/**
 * @file
 * Theme functions for the Views UI module.
 */

/**
 * Display basic administrative information about a view.
 */
function theme_views_ui_view_info($variables) {
  $view = $variables['view'];
  $title = $view->get_human_name();

  $displays = _views_ui_get_displays_list($view);
  $displays = empty($displays) ? t('None') : format_plural(count($displays), 'Display', 'Displays') . ': ' . '<em>' . implode(', ', $displays) . '</em>';

  switch ($view->type) {
    case t('Default'):
    default:
      $type = t('Default (module-provided)');
      break;

    case t('Normal'):
      $type = t('Custom');
      break;

    case t('Overridden'):
      $type = t('Overridden');
  }

  $output = '';
  $output .= '<div class="views-ui-view-title">' . check_plain($title) . "</div>\n";
  $output .= '<div class="views-ui-view-displays">' . $displays . "</div>\n";
  $output .= '<div class="views-ui-view-storage">' . $type . "</div>\n";
  $output .= '<div class="views-ui-view-base">' . t('Type') . ': ' . check_plain($view->base_table). "</div>\n";
  return $output;
}

/**
 * Turn the reorder form into a proper table
 */
function theme_views_ui_reorder_displays_form($variables) {
  $form = $variables['form'];
  $rows = array();
  foreach (element_children($form) as $key) {
    if (isset($form[$key]['#display'])) {
      $display = &$form[$key];

      $row = array();
      $row[] = backdrop_render($display['title']);
      $form[$key]['weight']['#attributes']['class'] = array('weight');
      $row[] = backdrop_render($form[$key]['weight']);
      if (isset($display['removed'])) {
        $row[] = backdrop_render($form[$key]['removed']) .
          l('<span>' . t('Remove') . '</span>',
            'javascript:void()',
            array(
              'attributes' => array(
                'id' => 'display-remove-link-' . $key,
                'class' => array('views-button-remove display-remove-link'),
                'alt' => t('Remove this display'),
                'title' => t('Remove this display')),
              'html' => TRUE));
      }
      else {
        $row[] = '';
      }
      $class = array();
      $styles = array();
      if (isset($form[$key]['weight']['#type'])) {
        $class[] = 'draggable';
      }
      if (isset($form[$key]['deleted']['#value']) && $form[$key]['deleted']['#value']) {
        $styles[] = 'display: none;';
      }
      $rows[] = array('data' => $row, 'class' => $class, 'id' => 'display-row-' . $key, 'style' => $styles);
    }
  }

  $header = array(t('Display'), t('Weight'), t('Remove'));
  $output = '';
  backdrop_add_tabledrag('reorder-displays', 'order', 'sibling', 'weight');

  $output = backdrop_render($form['override']);
  $output .= '<div class="scroll">';
  $output .= theme('table',
    array('header' => $header,
    'rows' => $rows,
    'attributes' => array('id' => 'reorder-displays'),
  ));
  $output .= '</div>';
  $output .= backdrop_render_children($form);

  return $output;
}

/**
 * Turn the rearrange form into a proper table
 */
function theme_views_ui_rearrange_form($variables) {
  $form = $variables['form'];

  $rows = array();
  foreach (element_children($form['fields']) as $id) {
    if (isset($form['fields'][$id]['name'])) {
      $row = array();
      $row[] = backdrop_render($form['fields'][$id]['name']);
      $form['fields'][$id]['weight']['#attributes']['class'] = array('weight');
      $row[] = backdrop_render($form['fields'][$id]['weight']);
      $row[] = backdrop_render($form['fields'][$id]['removed']) . l('<span>' . t('Remove') . '</span>', 'javascript:void()', array('attributes' => array('id' => 'views-remove-link-' . $id, 'class' => array('views-hidden', 'views-button-remove', 'views-remove-link'), 'alt' => t('Remove this item'), 'title' => t('Remove this item')), 'html' => TRUE));
      $rows[] = array('data' => $row, 'class' => array('draggable'), 'id' => 'views-row-' . $id);
    }
  }
  if (empty($rows)) {
    $rows[] = array(array('data' => t('No fields available.'), 'colspan' => '2'));
  }

  $header = array('', t('Weight'), t('Remove'));
  $output = backdrop_render($form['override']);
  $output .= '<div class="scroll" data-backdrop-views-scroll>';
  $output .= theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'arrange')));
  $output .= '</div>';
  $output .= backdrop_render_children($form);
  backdrop_add_tabledrag('arrange', 'order', 'sibling', 'weight');

  return $output;
}

/**
 * Theme the expose filter form.
 */
function theme_views_ui_expose_filter_form($variables) {
  $form = $variables['form'];
  $more = backdrop_render($form['more']);

  $output = backdrop_render($form['form_description']);
  $output .= backdrop_render($form['expose_button']);
  $output .= backdrop_render($form['group_button']);
  if (isset($form['required'])) {
    $output .= backdrop_render($form['required']);
  }
  $output .= backdrop_render($form['label']);
  $output .= backdrop_render($form['description']);

  $output .= backdrop_render($form['operator']);
  $output .= backdrop_render($form['value']);

  if (isset($form['use_operator'])) {
    $output .= '<div class="views-left-40">';
    $output .= backdrop_render($form['use_operator']);
    $output .= '</div>';
  }

  // Only output the right column markup if there's a left column to begin with
  if (!empty($form['operator']['#type'])) {
    $output .= '<div class="views-right-60">';
    $output .= backdrop_render_children($form);
    $output .= '</div>';
  }
  else {
    $output .= backdrop_render_children($form);
  }

  $output .= $more;

  return $output;
}

 /**
 * Theme the build group filter form.
 */
function theme_views_ui_build_group_filter_form($variables) {
  $form = $variables['form'];
  $more = backdrop_render($form['more']);

  $output = backdrop_render($form['form_description']);
  $output .= backdrop_render($form['expose_button']);
  $output .= backdrop_render($form['group_button']);
  if (isset($form['required'])) {
    $output .= backdrop_render($form['required']);
  }

  $output .= backdrop_render($form['operator']);
  $output .= backdrop_render($form['value']);

  $output .= '<div class="views-left-40">';
  $output .= backdrop_render($form['optional']);
  $output .= backdrop_render($form['remember']);
  $output .= '</div>';

  $output .= '<div class="views-right-60">';
  $output .= backdrop_render($form['widget']);
  $output .= backdrop_render($form['label']);
  $output .= backdrop_render($form['description']);
  $output .= '</div>';

  $header = array(
    t('Default'),
    t('Weight'),
    t('Label'),
    t('Operator'),
    t('Value'),
    t('Operations'),
  );

  $form['default_group'] = form_process_radios($form['default_group']);
  $form['default_group_multiple'] = form_process_checkboxes($form['default_group_multiple']);
  $form['default_group']['All']['#title'] = '';

  backdrop_render($form['default_group_multiple']['All']); // Don't render
  $rows[] = array(
    backdrop_render($form['default_group']['All']),
    '',
    array(
      'data' => config_get('views.settings', 'exposed_filter_any_label') == 'old_any' ? t('&lt;Any&gt;') : t('- Any -'),
      'colspan' => 4,
      'class' => array('class' => 'any-default-radios-row'),
    ),
  );

  foreach (element_children($form['group_items']) as $group_id) {
    $form['group_items'][$group_id]['value']['#title'] = '';
    $data = array(
      'default' => backdrop_render($form['default_group'][$group_id]) . backdrop_render($form['default_group_multiple'][$group_id]),
      'weight' => backdrop_render($form['group_items'][$group_id]['weight']),
      'title' => backdrop_render($form['group_items'][$group_id]['title']),
      'operator' => backdrop_render($form['group_items'][$group_id]['operator']),
      'value' => backdrop_render($form['group_items'][$group_id]['value']),
      'remove' => backdrop_render($form['group_items'][$group_id]['remove']) . l('<span>' . t('Remove') . '</span>', 'javascript:void()', array('attributes' => array('id' => 'views-remove-link-' . $group_id, 'class' => array('views-hidden', 'views-button-remove', 'views-groups-remove-link', 'views-remove-link'), 'alt' => t('Remove this item'), 'title' => t('Remove this item')), 'html' => true)),
    );
    $rows[] = array('data' => $data, 'id' => 'views-row-' . $group_id, 'class' => array('draggable'));
  }
  $table = theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('class' => array('views-filter-groups'), 'id' => 'views-filter-groups'))) . backdrop_render($form['add_group']);
  backdrop_add_tabledrag('views-filter-groups', 'order', 'sibling', 'weight');
  $render_form = backdrop_render_children($form);
  return $output . $render_form . $table . $more;
}

/**
 * Turn the rearrange form into a proper table
 */
function theme_views_ui_rearrange_filter_form(&$variables) {
  $form = $variables['form'];
  $rows = $ungroupable_rows = array();
  // Enable grouping only if > 1 group.
  $grouping = count(array_keys($form['#group_options'])) > 1;
  // Sort groups to ensure they're rendered in the right order, regardless of
  // how they're saved in configuration.
  ksort($form['#group_renders']);

  foreach ($form['#group_renders'] as $group_id => $contents) {
    // Header row for the group.
    if ($group_id !== 'ungroupable') {
      // Set up tabledrag so that it changes the group dropdown when rows are
      // dragged between groups.
      backdrop_add_tabledrag('views-rearrange-filters', 'match', 'sibling', 'views-group-select', 'views-group-select-' . $group_id);

      // Title row, spanning all columns.
      $row = array();
      // Add a cell to the first row, containing the group operator.
      $row[] = array('class' => array('group', 'group-operator', 'container-inline'), 'data' => backdrop_render($form['filter_groups']['groups'][$group_id]), 'rowspan' => max(array(2, count($contents) + 1)));
      // Title.
      $row[] = array('class' => array('group', 'group-title'), 'data' => '<span>' . $form['#group_options'][$group_id] . '</span>', 'colspan' => 4);
      $rows[] = array('class' => array('views-group-title'), 'data' => $row, 'id' => 'views-group-title-' . $group_id);

      // Row which will only appear if the group has nothing in it.
      $row = array();
      $class = 'group-' . (count($contents) ? 'populated' : 'empty');
      $instructions = '<span>' . t('No filters have been added.') . '</span> <span class="js-only">' . t('Drag to add filters.') . '</span>';
      // When JavaScript is enabled, the button for removing the group (if it's
      // present) should be hidden, since it will be replaced by a link on the
      // client side.
      if (!empty($form['remove_groups'][$group_id]['#type']) && $form['remove_groups'][$group_id]['#type'] == 'submit') {
        $form['remove_groups'][$group_id]['#attributes']['class'][] = 'js-hide';
      }
      $row[] = array('colspan' => 5, 'data' => $instructions . backdrop_render($form['remove_groups'][$group_id]));
      $rows[] = array('class' => array("group-message", "group-$group_id-message", $class), 'data' => $row, 'id' => 'views-group-' . $group_id);
    }

    foreach ($contents as $id) {
      if (isset($form['filters'][$id]['name'])) {
        $row = array();
        $row[] = backdrop_render($form['filters'][$id]['name']);
        $form['filters'][$id]['weight']['#attributes']['class'] = array('weight');
        $row[] = backdrop_render($form['filters'][$id]['weight']);
        $form['filters'][$id]['group']['#attributes']['class'] = array('views-group-select views-group-select-' . $group_id);
        $row[] = backdrop_render($form['filters'][$id]['group']);
        $form['filters'][$id]['removed']['#attributes']['class'][] = 'js-hide';
        $row[] = backdrop_render($form['filters'][$id]['removed']) . l('<span>' . t('Remove') . '</span>', 'javascript:void()', array('attributes' => array('id' => 'views-remove-link-' . $id, 'class' => array('views-hidden', 'views-button-remove', 'views-groups-remove-link', 'views-remove-link'), 'alt' => t('Remove this item'), 'title' => t('Remove this item')), 'html' => true));

        $row = array('data' => $row, 'class' => array('draggable'), 'id' => 'views-row-' . $id);
        if ($group_id !== 'ungroupable') {
          $rows[] = $row;
        }
        else {
          $ungroupable_rows[] = $row;
        }
      }
    }
  }
  if (empty($rows)) {
    $rows[] = array(array('data' => t('No fields available.'), 'colspan' => '2'));
  }

  $output = backdrop_render($form['override']);
  $output .= '<div class="scroll">';
  if ($grouping) {
    $output .= backdrop_render($form['filter_groups']['operator']);
  }
  else {
    $form['filter_groups']['groups'][0]['#title'] = t('Operator');
    $output .= backdrop_render($form['filter_groups']['groups'][0]);
  }

  if (!empty($ungroupable_rows)) {
    backdrop_add_tabledrag('views-rearrange-filters-ungroupable', 'order', 'sibling', 'weight');
    $header = array(t('Ungroupable filters'), t('Weight'), array('class' => array('views-hide-label'), 'data' => t('Group')), array('class' => array('views-hide-label'), 'data' => t('Remove')));
    $output .= theme('table', array('header' => $header, 'rows' => $ungroupable_rows, 'attributes' => array('id' => 'views-rearrange-filters-ungroupable', 'class' => array('arrange'))));
  }

  // Set up tabledrag so that the weights are changed when rows are dragged.
  backdrop_add_tabledrag('views-rearrange-filters', 'order', 'sibling', 'weight');
  $output .= theme('table', array('rows' => $rows, 'attributes' => array('id' => 'views-rearrange-filters', 'class' => array('arrange'))));
  $output .= '</div>';

  // When JavaScript is enabled, the button for adding a new group should be
  // hidden, since it will be replaced by a link on the client side.
  $form['actions']['add_group']['#attributes']['class'][] = 'js-hide';

  // Render the rest of the form and return.
  $output .= backdrop_render_children($form);
  return $output;
}

/**
 * Theme the form for the table style plugin
 */
function theme_views_ui_style_plugin_table($variables) {
  $form = $variables['form'];

  $output = backdrop_render($form['description_markup']);

  $header = array(
    t('Field'),
    t('Column'),
    t('Align'),
    t('Separator'),
    array(
      'data' => t('Sortable'),
      'align' => 'center',
    ),
    array(
      'data' => t('Default order'),
      'align' => 'center',
    ),
    array(
      'data' => t('Default sort'),
      'align' => 'center',
    ),
    array(
      'data' => t('Hide empty column'),
      'align' => 'center',
    ),
  );
  $rows = array();
  foreach (element_children($form['columns']) as $id) {
    $row = array();
    $row[] = check_plain(backdrop_render($form['info'][$id]['name']));
    $row[] = backdrop_render($form['columns'][$id]);
    $row[] = backdrop_render($form['info'][$id]['align']);
    $row[] = backdrop_render($form['info'][$id]['separator']);
    if (!empty($form['info'][$id]['sortable'])) {
      $row[] = array(
        'data' => backdrop_render($form['info'][$id]['sortable']),
        'align' => 'center',
      );
      $row[] = array(
        'data' => backdrop_render($form['info'][$id]['default_sort_order']),
        'align' => 'center',
      );
      $row[] = array(
        'data' => backdrop_render($form['default'][$id]),
        'align' => 'center',
      );
    }
    else {
      $row[] = '';
      $row[] = '';
      $row[] = '';
    }
    $row[] = array(
      'data' => backdrop_render($form['info'][$id]['empty_column']),
      'align' => 'center',
    );
    $rows[] = $row;
  }

  // Add the special 'None' row.
  $rows[] = array(t('None'), '', '', '', '', '', array('align' => 'center', 'data' => backdrop_render($form['default'][-1])), '');

  $output .= theme('table', array('header' => $header, 'rows' => $rows));
  $output .= backdrop_render_children($form);
  return $output;
}

/**
 * Returns the HTML for a section of a View being previewed within the Views UI.
 */
function theme_views_ui_view_preview_section($variables) {
  return '<h1 class="section-title">' . $variables['title'] . '</h1>'
  . $variables['links']
  . '<div class="preview-section">'. $variables['content'] . '</div>';
}

function template_preprocess_views_ui_display_tab_setting(&$variables) {
  static $zebra = 0;
  $variables['zebra'] = ($zebra % 2 === 0 ? 'odd' : 'even');
  $zebra++;

  // Put the main link to the left side
  array_unshift($variables['settings_links'], $variables['link']);
  $variables['settings_links'] = implode('<span class="label">&nbsp;|&nbsp;</span>', $variables['settings_links']);

  // Add classes associated with this display tab to the overall list.
  $variables['classes'] = array_merge($variables['classes'], $variables['class']);

  if (!empty($variables['defaulted'])) {
    $variables['classes'][] = 'defaulted';
  }
  if (!empty($variables['overridden'])) {
    $variables['classes'][] = 'overridden';
    $variables['attributes']['title'][] = t('Overridden');
  }

  // Append a colon to the description, if requested.
  if ($variables['description'] && $variables['description_separator']) {
    $variables['description'] .= t(':');
  }
}

function template_preprocess_views_ui_display_tab_bucket(&$variables) {
  $element = $variables['element'];

  $variables['item_help_icon'] = '';
  if (!empty($element['#item_help_icon'])) {
    $variables['item_help_icon'] = render($element['#item_help_icon']);
  }
  if (!empty($element['#name'])) {
    $variables['classes'][] = backdrop_clean_css_identifier(strtolower($element['#name']));
  }
  if (!empty($element['#overridden'])) {
    $variables['classes'][] = 'overridden';
    $variables['attributes']['title'][] = t('Overridden');
  }

  $variables['content'] = $element['#children'];
  $variables['title'] = $element['#title'];
  $variables['actions'] = !empty($element['actions']) ? backdrop_render($element['actions']) : '';
}

function template_preprocess_views_ui_display_tab_column(&$variables) {
  $element = $variables['element'];

  $variables['content'] = $element['#children'];
  $variables['column'] = $element['#column'];
}

/**
 * Theme preprocess for theme_views_ui_view_preview_section().
 */
function template_preprocess_views_ui_view_preview_section(&$variables) {
  switch ($variables['section']) {
    case 'title':
      $variables['title'] = t('Title');
      $links = views_ui_view_preview_section_display_category_links($variables['view'], 'title', $variables['title']);
      break;
    case 'header':
      $variables['title'] = t('Header');
      $links = views_ui_view_preview_section_handler_links($variables['view'], $variables['section']);
      break;
    case 'empty':
      $variables['title'] = t('No results behavior');
      $links = views_ui_view_preview_section_handler_links($variables['view'], $variables['section']);
      break;
    case 'exposed':
      // @todo Sorts can be exposed too, so we may need a better title.
      $variables['title'] = t('Exposed Filters');
      $links = views_ui_view_preview_section_display_category_links($variables['view'], 'exposed_form_options', $variables['title']);
      break;
    case 'rows':
      // @todo The title needs to depend on what is being viewed.
      $variables['title'] = t('Content');
      $links = views_ui_view_preview_section_rows_links($variables['view']);
      break;
    case 'pager':
      $variables['title'] = t('Pager');
      $links = views_ui_view_preview_section_display_category_links($variables['view'], 'pager_options', $variables['title']);
      break;
    case 'more':
      $variables['title'] = t('More');
      $links = views_ui_view_preview_section_display_category_links($variables['view'], 'use_more', $variables['title']);
      break;
    case 'footer':
      $variables['title'] = t('Footer');
      $links = views_ui_view_preview_section_handler_links($variables['view'], $variables['section']);
      break;
    case 'attachment_before':
      // @todo: Add links to the attachment configuration page.
      $variables['title'] = t('Attachment before');
      break;
    case 'attachment_after':
      // @todo: Add links to the attachment configuration page.
      $variables['title'] = t('Attachment after');
      break;
  }

  if (isset($links)) {
    $build = array(
      '#prefix' => '<div class="contextual-links-wrapper">',
      '#suffix' => '</div>',
      '#theme' => 'links__contextual',
      '#links' => $links,
      '#attributes' => array('class' => array('contextual-links')),
      '#attached' => array(
        'library' => array(array('contextual', 'contextual-links')),
      ),
    );
    $variables['links'] = backdrop_render($build);
  }
  $variables['theme_hook_suggestions'][] = 'views_ui_view_preview_section__' . $variables['section'];
}

