<?php
/**
 * @file
 * Bartik's theme implementation to display a node.
 *
 * Available variables:
 * - $title: the (sanitized) title of the node.
 * - $content: An array of node items. Use render($content) to print them all,
 *   or print a subset such as render($content['field_example']). Use
 *   hide($content['field_example']) to temporarily suppress the printing of a
 *   given element.
 * - $comments: The comment-related elements for the node.
 *   - $comments['comments']: Rendered comments for this node.
 *   - $comments['comment_form']: Form for adding a new comment.
 * - $user_picture: The node author's picture from user-picture.tpl.php.
 * - $date: Formatted creation date. Preprocess functions can reformat it by
 *   calling format_date() with the desired parameters on the $created variable.
 * - $name: Themed username of node author output from theme_username().
 * - $node_url: Direct URL of the current node.
 * - $display_submitted: Whether submission information should be displayed.
 * - $submitted: Submission information created from $name and $date during
 *   template_preprocess_node().
 * - $classes: Array of classes that can be used to style contextually through
 *   CSS. The default values can be one or more of the following:
 *   - node: The current template type; for example, "theming hook".
 *   - node-[type]: The current node type. For example, if the node is a
 *     "Post" it would result in "node-post". Note that the machine
 *     name will often be in a short form of the human readable label.
 *   - view-mode-[view_mode]: The View Mode of the node e.g. teaser or full.
 *   The following are controlled through the node publishing options.
 *   - promoted: Nodes that are promoted.
 *   - sticky: Nodes ordered above other non-sticky nodes in teaser
 *     listings.
 *   - unpublished: Unpublished nodes visible only to administrators.
 * - $attributes: Array of additional HTML attributes that should be added to
 *   the wrapper element. Flatten with backdrop_attributes().
 * - $title_prefix (array): An array containing additional output populated by
 *   modules, intended to be displayed in front of the main title tag that
 *   appears in the template.
 * - $title_suffix (array): An array containing additional output populated by
 *   modules, intended to be displayed after the main title tag that appears in
 *   the template.
 *
 * Other variables:
 * - $node: Full node entity. Contains data that may not be safe.
 * - $type: Node type; for example, post, page, blog, etc.
 * - $comment_count: Number of comments attached to the node.
 * - $uid: User ID of the node author.
 * - $created: Time the node was published formatted in Unix timestamp.
 * - $zebra: Outputs either "even" or "odd". Useful for zebra striping in
 *   teaser listings.
 * - $id: Position of the node. Increments each time it's output.
 *
 * Node status variables:
 * - $view_mode: View mode; for example, "full", "teaser".
 * - $teaser: Flag for the teaser state (shortcut for $view_mode == 'teaser').
 * - $page: Flag for the full page state.
 * - $promote: Flag for promotion state.
 * - $sticky: Flags for sticky post setting.
 * - $status: Flag for published status.
 * - $comment: State of comment settings for the node.
 * - $readmore: Flags true if the teaser content of the node cannot hold the
 *   main body content.
 * - $is_front: Flags true when presented in the front page.
 * - $logged_in: Flags true when the current user is a logged-in member.
 * - $is_admin: Flags true when the current user is an administrator.
 *
 * Field variables: for each field instance attached to the node a corresponding
 * variable is defined; for example, $node->body becomes $body. When needing to
 * access a field's raw values, developers/themers are strongly encouraged to
 * use these variables. Otherwise they will have to explicitly specify the
 * desired field language; for example, $node->body['en'], thus overriding any
 * language negotiation rule that was previously applied.
 *
 * @see template_preprocess()
 * @see template_preprocess_node()
 */
?>
<article id="node-<?php print $node->nid; ?>" class="<?php print implode(' ', $classes); ?> clearfix"<?php print backdrop_attributes($attributes); ?>>

  <?php if (!$page || $display_submitted): ?>
  <header>
    <?php print render($title_prefix); ?>
    <?php if (!$page && !empty($title)): ?>
      <h2><a href="<?php print $node_url; ?>"><?php print $title; ?></a></h2>
    <?php endif; ?>
    <?php print render($title_suffix); ?>

    <?php if ($display_submitted): ?>
      <div class="meta submitted">
        <?php print $user_picture; ?>
        <?php print $submitted; ?>
      </div>
    <?php endif; ?>
  </header>
  <?php endif; ?>

  <div class="content clearfix"<?php print backdrop_attributes($content_attributes); ?>>
    <?php
      // We hide the comments and links now so that we can render them later.
      hide($content['links']);
      print render($content);
    ?>
  </div>

  <?php
    // Remove the "Add comment" link on the teaser page or if the comment
    // form is being displayed on the same page.
    if ($teaser || !empty($comments['comment_form'])) {
      unset($content['links']['comment']['#links']['comment-add']);
    }
    // Only display the footer if there are links.
    $links = render($content['links']);
    if ($links):
  ?>
    <footer class="link-wrapper">
      <?php print $links; ?>
    </footer>
  <?php endif; ?>

  <?php if ($page && isset($comments['comments'])): ?>
    <section class="comments">
      <?php if ($comments['comments']): ?>
        <h2 class="title"><?php print t('Comments'); ?></h2>
        <?php print render($comments['comments']); ?>
      <?php endif; ?>

      <?php if ($comments['comment_form']): ?>
        <h2 class="title comment-form"><?php print t('Add comment'); ?></h2>
        <?php print render($comments['comment_form']); ?>
      <?php endif; ?>
    </section>
  <?php endif; ?>

</article>
