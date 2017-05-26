<?php
/**
 * @file
 * Theme functions and preprocessing for Link module output.
 */

/**
 * Formats a link field widget.
 */
function theme_link_field($vars) {
  $element = $vars['element'];
  // Prefix single value link fields with the name of the field.
  if (empty($element['#field']['multiple'])) {
    if (isset($element['url']) && !isset($element['title'])) {
      $element['url']['#title_display'] = 'invisible';
    }
  }

  $output = '';
  $output .= '<div class="link-field-subrow">';
  if (isset($element['title'])) {
    $output .= '<div class="link-field-title link-field-column">' . backdrop_render($element['title']) . '</div>';
  }
  $output .= '<div class="link-field-url' . (isset($element['title']) ? ' link-field-column' : '') . '">' . backdrop_render($element['url']) . '</div>';
  $output .= '</div>';
  if (!empty($element['attributes']['target'])) {
    $output .= '<div class="link-attributes">' . backdrop_render($element['attributes']['target']) . '</div>';
  }
  if (!empty($element['attributes']['title'])) {
    $output .= '<div class="link-attributes">' . backdrop_render($element['attributes']['title']) . '</div>';
  }
  if (!empty($element['attributes']['class'])) {
    $output .= '<div class="link-attributes">' . backdrop_render($element['attributes']['class']) . '</div>';
  }
  $output .= backdrop_render_children($element);
  return $output;
}

/**
 * Formats a link.
 */
function theme_link_formatter_link_default($vars) {
  $output = '';
  $link_options = $vars['element'];
  unset($link_options['title']);
  unset($link_options['url']);

  if (isset($link_options['attributes']['class'])) {
    $link_options['attributes']['class'] = array($link_options['attributes']['class']);
  }
  // Display a normal link if both title and URL are available.
  if (!empty($vars['element']['title']) && !empty($vars['element']['url'])) {
    $output = l($vars['element']['title'], $vars['element']['url'], $link_options);
  }
  // If only a title, display the title.
  elseif (!empty($vars['element']['title'])) {
    $output = $link_options['html'] ? $vars['element']['title'] : check_plain($vars['element']['title']);
  }
  elseif (!empty($vars['element']['url'])) {
    $output = l($vars['element']['title'], $vars['element']['url'], $link_options);
  }
  return $output;
}

/**
 * Formats a link (or its title) as plain text.
 */
function theme_link_formatter_link_plain($vars) {
  $link_options = $vars['element'];
  if (isset($link_options['title'])) {
    unset($link_options['title']);
  }
  else {
    $vars['element']['title'] = '';
  }
  unset($link_options['url']);
  return empty($vars['element']['url']) ? check_plain($vars['element']['title']) : url($vars['element']['url'], $link_options);
}

/**
 * Formats a link as an absolute URL.
 */
function theme_link_formatter_link_absolute($vars) {
  $absolute = array('absolute' => TRUE);
  return empty($vars['element']['url']) ? '' : url($vars['element']['url'], $absolute + $vars['element']);
}

/**
 * Formats a link using the URL's domain for it's link text.
 */
function theme_link_formatter_link_domain($vars) {
  $link_options = $vars['element'];
  unset($link_options['title']);
  unset($link_options['url']);
  $domain = parse_url($vars['element']['display_url'], PHP_URL_HOST);
  if (!empty($vars['display']['settings']['strip_www'])) {
    $domain = str_replace('www.', '', $domain);
  }
  return $vars['element']['url'] ? l($domain, $vars['element']['url'], $link_options) : '';
}

/**
 * Formats a link's title as plain text.
 */
function theme_link_formatter_link_title_plain($vars) {
  return empty($vars['element']['title']) ? '' : check_plain($vars['element']['title']);
}

/**
 * Formats a link using an alternate display URL for its link text.
 */
function theme_link_formatter_link_url($vars) {
  $link_options = $vars['element'];
  unset($link_options['title']);
  unset($link_options['url']);
  return $vars['element']['url'] ? l($vars['element']['display_url'], $vars['element']['url'], $link_options) : '';
}

/**
 * Formats a link using "Link" as the link text.
 */
function theme_link_formatter_link_short($vars) {
  $link_options = $vars['element'];
  unset($link_options['title']);
  unset($link_options['url']);
  return $vars['element']['url'] ? l(t('Link'), $vars['element']['url'], $link_options) : '';
}

/**
 * Formats a link using the field's label as link text.
 */
function theme_link_formatter_link_label($vars) {
  $link_options = $vars['element'];
  unset($link_options['title']);
  unset($link_options['url']);
  return $vars['element']['url'] ? l($vars['field']['label'], $vars['element']['url'], $link_options) : '';
}

/**
 * Formats a link as separate title and URL elements.
 */
function theme_link_formatter_link_separate($vars) {
  $class = empty($vars['element']['attributes']['class']) ? '' : ' ' . $vars['element']['attributes']['class'];
  unset($vars['element']['attributes']['class']);
  $link_options = $vars['element'];
  unset($link_options['title']);
  unset($link_options['url']);
  $title = empty($vars['element']['title']) ? '' : check_plain($vars['element']['title']);

  $url_parts = _link_parse_url($vars['element']['url']);
  $output = '';
  $output .= '<div class="link-item ' . $class . '">';
  if (!empty($title)) {
    $output .= '<div class="link-title">' . $title . '</div>';
  }
  $output .= '<div class="link-url">' . l($url_parts['url'], $vars['element']['url'], $link_options) . '</div>';
  $output .= '</div>';
  return $output;
}
