<?php
/**
 * @file
 * Theme functions for the Layout module.
 */

/**
 * Turn the rearrange form into a table with table sorting displayed.
 */
function theme_layout_reorder_layouts($variables) {
  $element = $variables['element'];
  $rows = array();

  // Assemble the data for a table from everything in $form['handlers']
  foreach (element_children($element) as $layout_name) {
    if (isset($element[$layout_name]['title'])) {
      $row = array();
      $row[] = array(
        'data' => render($element[$layout_name]['title']),
        'class' => array('layout-name'),
      );
      $element[$layout_name]['weight']['#attributes']['class'][] = 'weight';
      $row[] = render($element[$layout_name]['weight']);
      $rows[] = array('data' => $row, 'class' => array('draggable'));
    }
  }

  $header = array(
    array('data' => t('Layout'), 'class' => array('layout-name')),
    t('Weight'),
  );

  backdrop_add_tabledrag('layout-reorder', 'order', 'sibling', 'weight');

  $output = theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'layout-reorder')));
  $output .= backdrop_render_children($element);
  return $output;
}

/**
 * Outputs information about a layout. Used in the layout listing page.
 *
 * @param $variables
 *   An array with a single value: "layout", which contains the layout object.
 *
 * @return string
 */
function theme_layout_info($variables) {
  $layout = $variables['layout'];
  $info = layout_get_layout_template_info($layout->layout_template);

  // Build template thumbnail preview
  $preview_path = $info['path'] . '/' . $info['preview'];
  $preview_img = theme('image', array('uri' => $preview_path));
  $preview = l($preview_img, 'admin/structure/layouts/manage/' . $layout->name, array('html' => TRUE));

  // Create a link to the settings page
  $template = l($info['title'], 'admin/structure/layouts/manage/' . $layout->name . '/configure');

  $output = '';
  $output .= '<div class="layout-info">';
  $output .= $preview;
  $output .= '<div class="layout-detail">';
  $output .= '  <div class="layout-title">' . check_plain($layout->title) . '</div>';
  $output .= '  <div class="layout-template description">' . t('<span class="priority-low">Template: </span>!title', array('!title' => $template)) . '</div>';
  $output .= '</div></div>';

  return $output;
}

/**
 * Outputs a list of conditions for a layout. Used in the layout listing page.
 *
 * @param $variables
 *   An array with a single value: "layout", which contains the layout object.
 *
 * @return string
 */
function theme_layout_condition_info($variables) {
  /* @var Layout $layout */
  $layout = $variables['layout'];
  // Build a list of visibility conditions on this layout
  $conditions = array();
  foreach ($layout->conditions as $access_key => $layout_access) {
    $conditions[] = $layout_access->summary();
  }
  $output  = '<div class="layout-conditions-list">';
  if (empty($conditions)) {
    $output .= t('No conditions set.');
  }
  else {
    $output .= theme('item_list', array('items' => $conditions));
  }
  $output .= '</div>';

  return $output;
}

/**
 * Outputs an individual option label for selecting a layout.
 */
function theme_layout_template_option($variables) {
  $template_info = $variables['template_info'];
  $icon_path = $template_info['path'] . '/' . $template_info['preview'];

  $output = '';
  $output .= '<div class="layout-icon">';
  $output .= theme('image', array(
    'uri' => $icon_path,
    'attributes' => array('title' => $template_info['title']),
  ));
  $output .= '<div class="layout-caption">' . check_plain($template_info['title']) . '</div>';
  $output .= '</div>';
  return $output;
}

/**
 * Output the arguments table for layout_menu_item_arguments_form().
 */
function theme_layout_menu_item_arguments_table($variables) {
  $element = $variables['element'];
  $path = $element['#layout_path'];
  $parts = explode('/', $path);
  $header = array(
    t('Argument position'),
    t('Context'),
    t('Operations'),
  );
  $rows = array();
  foreach (element_children($element) as $key) {
    $argument_parts = $parts;
    $argument_parts[$key] = '<strong>' . $argument_parts[$key] . '</strong>';
    $row = array();
    $row[] = t('Position @index:', array('@index' => $key + 1)) . ' ' . implode('/', $argument_parts);
    $row[] = backdrop_render($element[$key]['context']);
    $row[] = backdrop_render($element[$key]['operations']);
    $rows[] = $row;
  }
  return theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'layout-arguments')));
}

/**
 * Output the table for layout_settings_form() contexts.
 */
function theme_layout_settings_context_table($variables) {
  $element = $variables['element'];
  $path = $element['#layout_path'];
  $parts = explode('/', $path);
  $header = array(
    t('Context'),
    t('Type'),
  );
  $rows = array();
  foreach (element_children($element) as $key) {
    $argument_parts = $parts;
    $argument_parts[$key] = '<strong>' . $argument_parts[$key] . '</strong>';
    $row = array();
    $row[] = t('Position @index:', array('@index' => $key + 1)) . ' ' . implode('/', $argument_parts);
    $row[] = backdrop_render($element[$key]);
    $rows[] = $row;
  }
  return theme('table', array(
    'header' => $header,
    'rows' => $rows,
    'attributes' => array('id' => 'layout-context-table'),
    'empty' => t('No contexts'),
  ));
}

/**
 * Output the list of visibility conditions for layouts.
 */
function theme_layout_conditions($variables) {
  $element = $variables['element'];

  $output = '<ul>';
  foreach (element_children($element) as $key) {
    $output .= '<li>' . backdrop_render($element[$key]) . '</li>';
  }
  $output .= '</ul>';
  return $output;
}

/**
 * Output region content wrapped by tag specified in layout UI.
 */
function theme_layout_region_inner($variables) {
  $tag = $variables['tag'];
  $attributes['class'] = $variables['classes'];

  if ($tag != '') {
    return '<' . $tag . backdrop_attributes($attributes) . '>' . implode('', $variables['blocks']) . '</' . $tag . '>';
  }
  return implode('', $variables['blocks']);
}

/**
 * Prepares variables for layout templates.
 *
 * This uses [module_name]_preprocess_layout() instead of
 * template_preprocess_layout() so that it can run last. Layout module is given
 * a weight of 60 in hook_install(), so it should run last compared to other
 * modules.
 */
function layout_preprocess_layout(&$variables) {
  $settings = $variables['layout']->settings;
  $variables += array(
    'action_links' => NULL,
    'tabs' => NULL,
    'messages' => NULL,
    'title' => NULL,
  );

  if (!$variables['admin']) {
    if (!isset($variables['title'])) {
      if ($settings['title_display'] === LAYOUT_TITLE_NONE) {
        $variables['title'] = NULL;
      }
      elseif ($settings['title_display'] === LAYOUT_TITLE_CUSTOM || ($settings['title_display'] === LAYOUT_TITLE_BLOCK && !empty($settings['title']))) {
        $variables['title'] = check_plain(t($settings['title']));
        backdrop_set_title(t($settings['title']));
      }
      else {
        $variables['title'] = backdrop_get_title();
      }
    }

    // Generate messages last in order to capture as many as possible for the
    // current page.
    if (!isset($variables['messages'])) {
      $variables['messages'] = theme('status_messages');
    }
  }
  else {
    $variables['title'] = $variables['content']['title'];
  }

  if (!$variables['admin']) {
    $variables['action_links'] = menu_local_actions();
    $variables['tabs'] =  menu_local_tabs();
  }
}

/**
 * Prepares variables for block templates.
 */
function template_preprocess_block(&$variables) {
  $content = $variables['content'];
  $block = $variables['block'];
  $style = $block->style;

  $variables['classes'] = array();
  $variables['attributes'] = array();
  $variables['title_prefix'] = '';
  $variables['title_suffix'] = '';

  // Add the hero background image inline. This could also be added in a
  // specific template_preprocess_block__layout__hero() function, but we add
  // it here just to cut down on unnecessary separation.
  if (get_class($block) == 'BlockHero') {
    $variables['classes'][] = 'block-hero';
    if (isset($block->settings['image_path'])) {
      $variables['attributes']['style'] = 'background-image:url(' . $block->settings['image_path'] . ');';
      $variables['classes'][] = 'block-hero-image';
    }
    else {
      $variables['classes'][] = 'block-hero-no-image';
    }
  }

  if (module_exists('contextual') && user_access('access contextual links')) {
    $links = array();
    // These are specified by the content.
    if (!empty($content->admin_links)) {
      $links += $content->admin_links;
    }

    // Take and contextual links that may have been returned in the block render
    // array and move them up into the block wrapper's contextual links.
    if (is_array($content->content) && isset($content->content['#contextual_links'])) {
      $element = array(
        '#type' => 'contextual_links',
        '#contextual_links' => $content->content['#contextual_links'],
        '#element' => $content->content,
      );
      unset($content->content['#contextual_links']);

      $element = contextual_pre_render_links($element);
      $links += $element['#links'];
    }

    if ($links) {
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
      $variables['classes'][] = 'contextual-links-region';
      $variables['title_prefix'] = backdrop_render($build);
    }
  }

  // Basic classes.
  $variables['classes'][] = 'block';
  $variables['classes'][] = backdrop_html_class('block-' . $block->module . '-' . (isset($block->childDelta) ? $block->childDelta : $block->delta));

  // Add custom classes if sent in.
  if (!empty($style->settings['classes'])) {
    $variables['classes'] = array_merge($variables['classes'], array_filter(explode(' ', $style->settings['classes'])));
  }

  // Set up some placeholders for constructing template file names.
  $base = 'block';
  $delimiter = '__';

  // Add template file suggestion for content type and sub-type.
  $variables['theme_hook_suggestions'][] = $base . $delimiter . strtr($block->plugin, '-', '_');

  $variables['title'] = !empty($content->title) ? $content->title : '';
  $variables['content'] = !empty($content->content) ? $content->content : '';
}

/**
 * Prepares variables for block-dynamic templates.
 */
function template_preprocess_block_dynamic(&$variables) {
  // Re-use all the preprocessing provided by the default block template.
  template_preprocess_block($variables);

  $block = $variables['block'];
  $style = $block->style;

  // Classes for the wrapper set in template_preprocess_block().
  $variables['wrapper_tag'] = $style->settings['wrapper_tag'];

  // Title tag and classes.
  $variables['title_tag'] = $style->settings['title_tag'];
  $variables['title_attributes'] = array(
    'class' => array_filter(explode(' ', $style->settings['title_classes'])),
  );

  // Content tag and classes.
  $variables['content_tag'] = $style->settings['content_tag'];
  $variables['content_attributes'] = array(
    'class' => array_filter(explode(' ', $style->settings['content_classes']))
  );
}
