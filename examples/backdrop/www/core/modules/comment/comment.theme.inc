<?php
/**
 * @file
 * Theme functions for the Comment module.
 */

/**
 * Returns HTML for a list of recent comments.
 *
 * @ingroup themeable
 */
function theme_comment_block($variables) {
  $items = array();
  foreach ($variables['comments'] as $comment) {
    $items[] = l($comment->subject, 'comment/' . $comment->cid, array('fragment' => 'comment-' . $comment->cid)) . '&nbsp;<span>' . t('@time ago', array('@time' => format_interval(REQUEST_TIME - $comment->changed))) . '</span>';
  }

  if ($items) {
    return theme('item_list', array('items' => $items));
  }
  else {
    return t('No comments available.');
  }
}

/**
 * Returns HTML for a "you can't post comments" notice.
 *
 * @param $variables
 *   An associative array containing:
 *   - node: The comment node.
 *
 * @ingroup themeable
 */
function theme_comment_post_forbidden($variables) {
  $node = $variables['node'];
  $node_type = node_type_get_type($node->type);
  global $user;

  // Since this is expensive to compute, we cache it so that a page with many
  // comments only has to query the database once for all the links.
  $authenticated_post_comments = &backdrop_static(__FUNCTION__, NULL);

  if (!$user->uid) {
    if (!isset($authenticated_post_comments)) {
      // We only output a link if we are certain that users will get permission
      // to post comments by logging in.
      $comment_roles = user_roles(TRUE, 'post comments');
      $authenticated_post_comments = isset($comment_roles[BACKDROP_AUTHENTICATED_ROLE]);
    }

    if ($authenticated_post_comments) {
      // We cannot use backdrop_get_destination() because these links
      // sometimes appear on /node and taxonomy listing pages.
      if ($node_type->settings['comment_form_location'] == COMMENT_FORM_SEPARATE_PAGE) {
        $destination = array('destination' => "comment/reply/$node->nid#comment-form");
      }
      else {
        $destination = array('destination' => "node/$node->nid#comment-form");
      }

      if (config_get('system.core', 'user_register') != USER_REGISTER_ADMINISTRATORS_ONLY) {
        // Users can register themselves.
        return t('<a href="@login">Log in</a> or <a href="@register">register</a> to post comments', array('@login' => url('user/login', array('query' => $destination)), '@register' => url('user/register', array('query' => $destination))));
      }
      else {
        // Only admins can add new users, no public registration.
        return t('<a href="@login">Log in</a> to post comments', array('@login' => url('user/login', array('query' => $destination))));
      }
    }
  }
}

/**
 * Preprocesses variables for comment.tpl.php.
 *
 * @see comment.tpl.php
 */
function template_preprocess_comment(&$variables) {
  $view_mode = $variables['elements']['#view_mode'];
  $bundle = $variables['elements']['#bundle'];
  $comment = $variables['elements']['#comment'];
  $node = $variables['elements']['#node'];
  $node_type = node_type_get_type($node->type);

  $variables['comment'] = $comment;
  $variables['node'] = $node;
  $variables['author'] = theme('username', array('account' => $comment));
  $variables['user_picture'] = '';
  $variables['created'] = format_date($comment->created);
  // Avoid calling format_date() twice on the same timestamp.
  if ($comment->changed == $comment->created) {
    $variables['changed'] = $variables['created'];
  }
  else {
    $variables['changed'] = format_date($comment->changed);
  }

  $variables['new'] = !empty($comment->new) ? t('new') : '';
  if ($node_type->settings['comment_user_picture']) {
    $variables['user_picture'] = theme('user_picture', array('account' => $comment));
  }
  $variables['signature'] = $comment->signature;

  $uri = $comment->uri();
  $uri['options'] += array('attributes' => array('class' => array('permalink'), 'rel' => 'bookmark'));

  $variables['title'] = l($comment->subject, $uri['path'], $uri['options']);
  $variables['permalink'] = l(t('Permalink'), $uri['path'], $uri['options']);
  $variables['submitted'] = t('Submitted by !username on !datetime', array('!username' => $variables['author'], '!datetime' => $variables['created']));

  // Preprocess fields.
  field_attach_preprocess('comment', $comment, $variables['elements'], $variables);

  // Helpful $content variable for templates.
  foreach (element_children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }

  // Set status to a string representation of comment->status.
  if (isset($comment->in_preview)) {
    $variables['status'] = 'comment-preview';
  }
  else {
    $variables['status'] = ($comment->status == COMMENT_NOT_PUBLISHED) ? 'comment-unpublished' : 'comment-published';
  }

  // Gather comment classes.
  // 'comment-published' class is not needed, it is either 'comment-preview' or
  // 'comment-unpublished'.
  if ($variables['status'] != 'comment-published') {
    $variables['classes'][] = $variables['status'];
  }
  if ($variables['new']) {
    $variables['classes'][] = 'comment-new';
  }
  if (!$comment->uid) {
    $variables['classes'][] = 'comment-by-anonymous';
  }
  else {
    if ($comment->uid == $variables['node']->uid) {
      $variables['classes'][] = 'comment-by-node-author';
    }
    if ($comment->uid == $variables['user']->uid) {
      $variables['classes'][] = 'comment-by-viewer';
    }
  }
}

