<?php
/**
 * @file
 * Theme functions for the Node module.
 */

/**
 * Returns HTML for the content ranking part of the search settings admin page.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @see node_search_admin()
 * @ingroup themeable
 */
function theme_node_search_admin($variables) {
  $form = $variables['form'];

  $output = backdrop_render($form['info']);

  $header = array(t('Factor'), t('Influence'));
  foreach (element_children($form['factors']) as $key) {
    $row = array();
    $row[] = $form['factors'][$key]['#title'];
    $form['factors'][$key]['#title_display'] = 'invisible';
    $row[] = backdrop_render($form['factors'][$key]);
    $rows[] = $row;
  }
  $output .= theme('table', array('header' => $header, 'rows' => $rows));

  $output .= backdrop_render_children($form);
  return $output;
}

/**
 * Returns HTML for a list of recent content.
 *
 * @param $variables
 *   An associative array containing:
 *   - nodes: An array of recent node entities.
 *
 * @ingroup themeable
 */
function theme_node_recent_block($variables) {
  $rows = array();
  $output = '';

  $l_options = array('query' => backdrop_get_destination());
  foreach ($variables['nodes'] as $node) {
    $row = array();
    $row[] = array(
      'data' => theme('node_recent_content', array('node' => $node)),
      'class' => 'title-author',
    );
    $row[] = array(
      'data' => node_access('update', $node) ? l(t('edit'), 'node/' . $node->nid . '/edit', $l_options) : '',
      'class' => 'edit',
    );
    $row[] = array(
      'data' => node_access('delete', $node) ? l(t('delete'), 'node/' . $node->nid . '/delete', $l_options) : '',
      'class' => 'delete',
    );
    $rows[] = $row;
  }

  if ($rows) {
    $output = theme('table', array('rows' => $rows));
    if (user_access('access content overview')) {
      $output .= theme('more_link', array('url' => 'admin/content', 'title' => t('Show more content')));
    }
  }

  return $output;
}

/**
 * Returns HTML for a recent node to be displayed in the recent content block.
 *
 * @param $variables
 *   An associative array containing:
 *   - node: A node entity.
 *
 * @ingroup themeable
 */
function theme_node_recent_content($variables) {
  $node = $variables['node'];

  $output = '<div class="node-title">';
  $output .= l($node->title, 'node/' . $node->nid);
  $output .= theme('mark', array('type' => node_mark($node->nid, $node->changed)));
  $output .= '</div><div class="node-author">';
  $output .= theme('username', array('account' => user_load($node->uid)));
  $output .= '</div>';

  return $output;
}

/**
 * Returns HTML for a list of available node types for node creation.
 *
 * @param $variables
 *   An associative array containing:
 *   - content: An array of content types.
 *
 * @see node_add_page()
 * @ingroup themeable
 */
function theme_node_add_list($variables) {
  $content = $variables['content'];
  $output = '';

  if ($content) {
    $output = '<dl class="node-type-list">';
    foreach ($content as $item) {
      $output .= '<dt>' . l($item['title'], $item['href'], $item['localized_options']) . '</dt>';
      $output .= '<dd>' . filter_xss_admin($item['description']) . '</dd>';
    }
    $output .= '</dl>';
  }
  else {
    $output = '<p>' . t('You have not created any content types yet. Go to the <a href="@create-content">content type creation page</a> to add a new content type.', array('@create-content' => url('admin/structure/types/add'))) . '</p>';
  }
  return $output;
}

/**
 * Returns HTML for a node type description for the content type admin page.
 *
 * @param $variables
 *   An associative array containing:
 *   - name: The human-readable name of the content type.
 *   - type: An object containing the 'type' (machine name) and 'description' of
 *     the content type.
 *
 * @ingroup themeable
 */
function theme_node_admin_overview($variables) {
  $name = $variables['name'];
  $type = $variables['type'];

  $output = check_plain($name);
  $output .= ' <small>' . t('(Machine name: @type)', array('@type' => $type->type)) . '</small>';
  $output .= '<div class="description">' . filter_xss_admin($type->description) . '</div>';
  return $output;
}

/**
 * Processes variables for node.tpl.php.
 *
 * Most themes utilize their own copy of node.tpl.php. The default is located
 * inside "modules/node/node.tpl.php". Look in there for the full list of
 * variables.
 *
 * @param $variables
 *   An array containing the following arguments:
 *   - $node
 *   - $view_mode
 *   - $page
 *
 * @see node.tpl.php
 */
function template_preprocess_node(&$variables) {
  $variables['view_mode'] = $variables['elements']['#view_mode'];
  // Provide a distinct $teaser boolean.
  $variables['teaser'] = $variables['view_mode'] == 'teaser';
  $variables['node'] = $variables['elements']['#node'];
  $node = $variables['node'];

  $variables['date']      = format_date($node->created);
  $variables['name']      = theme('username', array(
    'account' => $node,
    'link_attributes' => array('rel' => 'author'),
  ));

  $uri = entity_uri('node', $node);
  $variables['node_url']  = url($uri['path'], $uri['options']);
  $variables['title']     = check_plain($node->title);
  $variables['page']      = $variables['view_mode'] == 'full' && node_is_page($node);
  $variables['block']     = $variables['view_mode'] == 'block';

  // Flatten the node entity's member fields.
  $variables = array_merge((array) $node, $variables);

  // Helpful $content variable for templates.
  $variables += array('content' => array());
  foreach (element_children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }

  // Make the field variables available with the appropriate language.
  field_attach_preprocess('node', $node, $variables['content'], $variables);

  // Display post information only on certain node types.
  $node_type = node_type_get_type($node->type);
  if ($node_type->settings['node_submitted']) {
    if (!$variables['block'] || ($variables['block'] && !empty($variables['elements']['#display_submitted']))) {
      $variables['display_submitted'] = TRUE;
      $variables['submitted'] = t('Submitted by !username on !datetime', array('!username' => $variables['name'], '!datetime' => $variables['date']));
      $variables['user_picture'] = '';
      if ($node_type->settings['node_user_picture']) {
        $variables['user_picture'] = theme('user_picture', array('account' => $node));
      }
    }
  }
  else {
    $variables['display_submitted'] = FALSE;
    $variables['submitted'] = '';
    $variables['user_picture'] = '';
  }

  // Add article ARIA role.
  $variables['attributes']['role'] = 'article';

  // Gather node classes.
  $variables['classes'][] = backdrop_html_class('node-' . $node->type);
  if ($variables['promote']) {
    $variables['classes'][] = 'promoted';
  }
  if ($variables['sticky']) {
    $variables['classes'][] = 'sticky';
  }
  if (!$variables['status']) {
    $variables['classes'][] = 'unpublished';
  }
  if ($variables['view_mode']) {
    $variables['classes'][] = backdrop_html_class('view-mode-' . $variables['view_mode']);
  }

  // Add an extra theme hook suggetion for node id.
  $variables['theme_hook_suggestions'][] = 'node__' . $node->nid;
}

