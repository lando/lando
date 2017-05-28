<?php
/**
 * @file
 * Theme functions for the Admin Bar module.
 */

/**
 * Renders an icon to display in the administration bar.
 *
 * @ingroup themeable
 */
function theme_admin_bar_icon($variables) {
  return '<img class="admin-bar-icon" src="' . $variables['src'] . '" width="14" height="12" alt="' . $variables['alt'] . '" />';
}

/**
 * Render a themed list of links.
 *
 * @param $variables
 *   - elements: A renderable array of links using the following keys:
 *     - #attributes: Optional array of attributes for the list item, processed
 *       via backdrop_attributes().
 *     - #title: Title of the link, passed to l().
 *     - #href: Optional path of the link, passed to l(). When omitted, the
 *       element's '#title' is rendered without link.
 *     - #description: Optional alternative text for the link, passed to l().
 *     - #options: Optional alternative text for the link, passed to l().
 *     The array key of each child element itself is passed as path for l().
 */
function theme_admin_bar_links($variables) {
  $destination = &backdrop_static('admin_bar_destination');
  $elements = $variables['elements'];

  if (!isset($destination)) {
    $destination = backdrop_get_destination();
    $destination = $destination['destination'];
  }

  // The majority of items in the menu are sorted already, but since modules
  // may add or change arbitrary items anywhere, there is no way around sorting
  // everything again. element_sort() is not sufficient here, as it
  // intentionally retains the order of elements having the same #weight,
  // whereas menu links are supposed to be ordered by #weight and #title.
  backdrop_sort($elements, array('#weight' => SORT_NUMERIC, '#title' => SORT_STRING));
  $elements['#sorted'] = TRUE;

  $output = '';
  foreach (element_children($elements) as $path) {
    // Early-return nothing if user does not have access.
    if (isset($elements[$path]['#access']) && !$elements[$path]['#access']) {
      continue;
    }
    $elements[$path] += array(
      '#attributes' => array(),
      '#options' => array(),
    );
    // Render children to determine whether this link is expandable.
    if (isset($elements[$path]['#type']) || isset($elements[$path]['#theme']) || isset($elements[$path]['#pre_render'])) {
      $elements[$path]['#children'] = backdrop_render($elements[$path]);
    }
    else {
      $elements[$path]['#children'] = theme('admin_bar_links', array('elements' => $elements[$path]));
      if (!empty($elements[$path]['#children'])) {
        $elements[$path]['#attributes']['class'][] = 'expandable';
      }
      if (isset($elements[$path]['#attributes']['class'])) {
        $elements[$path]['#attributes']['class'] = $elements[$path]['#attributes']['class'];
      }
    }

    $link = '';
    // Handle menu links.
    if (isset($elements[$path]['#href'])) {
      // Strip destination query string from href attribute and apply a CSS class
      // for our JavaScript behavior instead.
      if (isset($elements[$path]['#options']['query']['destination']) && $elements[$path]['#options']['query']['destination'] == $destination) {
        unset($elements[$path]['#options']['query']['destination']);
        $elements[$path]['#options']['attributes']['class'][] = 'admin-bar-destination';
      }

      $link = l($elements[$path]['#title'], $elements[$path]['#href'], $elements[$path]['#options']);
    }
    // Handle plain text items, but do not interfere with menu additions.
    elseif (!isset($elements[$path]['#type']) && isset($elements[$path]['#title'])) {
      if (!empty($elements[$path]['#options']['html'])) {
        $title = $elements[$path]['#title'];
      }
      else {
        $title = check_plain($elements[$path]['#title']);
      }
      $attributes = '';
      if (isset($elements[$path]['#options']['attributes'])) {
        $attributes = backdrop_attributes($elements[$path]['#options']['attributes']);
      }
      $link = '<span' . $attributes . '>' . $title . '</span>';
    }

    $output .= '<li' . backdrop_attributes($elements[$path]['#attributes']) . '>';
    $output .= $link . $elements[$path]['#children'];
    $output .= '</li>';
  }
  if ($output) {
    $elements['#wrapper_attributes']['class'][] = 'dropdown';
    $attributes = backdrop_attributes($elements['#wrapper_attributes']);
    $output = '<ul' . $attributes . '>' . $output . '</ul>';
  }
  return $output;
}

/**
 * Preprocesses variables for theme_admin_bar_icon().
 */
function template_preprocess_admin_bar_icon(&$variables) {
  $variables['src'] = $GLOBALS['base_url'] . '/' . backdrop_get_path('module', 'admin_bar') . '/images/home.png';
  $variables['alt'] = t('Home');
}
