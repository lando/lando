<?php

/**
 * @file
 * Bartik's theme implementation for comments.
 *
 * Available variables:
 * - $author: Comment author. Can be link or plain text.
 * - $content: An array of comment items. Use render($content) to print them all, or
 *   print a subset such as render($content['field_example']). Use
 *   hide($content['field_example']) to temporarily suppress the printing of a
 *   given element.
 * - $created: Formatted date and time for when the comment was created.
 *   Preprocess functions can reformat it by calling format_date() with the
 *   desired parameters on the $comment->created variable.
 * - $changed: Formatted date and time for when the comment was last changed.
 *   Preprocess functions can reformat it by calling format_date() with the
 *   desired parameters on the $comment->changed variable.
 * - $new: New comment marker.
 * - $permalink: Comment permalink.
 * - $submitted: Submission information created from $author and $created during
 *   template_preprocess_comment().
 * - $picture: Authors picture.
 * - $signature: Authors signature.
 * - $status: Comment status. Possible values are:
 *   comment-unpublished, comment-published or comment-preview.
 * - $title: Linked title.
 * - $classes: Array of classes that can be used to style contextually through
 *   CSS. The default values can be one or more of the following:
 *   - comment: The current template type, i.e., "theming hook".
 *   - comment-by-anonymous: Comment by an unregistered user.
 *   - comment-by-node-author: Comment by the author of the parent node.
 *   - comment-preview: When previewing a new or edited comment.
 *   The following applies only to viewers who are registered users:
 *   - comment-unpublished: An unpublished comment visible only to administrators.
 *   - comment-by-viewer: Comment by the user currently viewing the page.
 *   - comment-new: New comment since last the visit.
 * - $attributes: Array of additional HTML attributes that should be added to
 *   the wrapper element. Flatten with backdrop_attributes().
 * - $title_prefix (array): An array containing additional output populated by
 *   modules, intended to be displayed in front of the main title tag that
 *   appears in the template.
 * - $title_suffix (array): An array containing additional output populated by
 *   modules, intended to be displayed after the main title tag that appears in
 *   the template.
 *
 * These two variables are provided for context:
 * - $comment: Full comment object.
 * - $node: Node entity the comments are attached to.
 *
 * @see template_preprocess()
 * @see template_preprocess_comment()
 * @see theme_comment()
 */
?>
<article class="<?php print implode(' ', $classes); ?> clearfix"<?php print backdrop_attributes($attributes); ?> role="article">
  <header class="comment-header">
    <div class="attribution">
      <?php print $user_picture; ?>

      <div class="submitted">
        <p class="commenter-name"><?php print $author; ?></p>
        <p class="comment-time"><?php print $created; ?></p>
        <p class="comment-permalink"><?php print $permalink; ?></p>
      </div>
    </div> <!-- /.attribution -->
  </header> <!-- /.comment-header -->

  <div class="comment-text">
    <div class="comment-arrow"></div>
    <?php if ($new): ?>
      <span class="new"><?php print $new; ?></span>
    <?php endif; ?>

    <?php print render($title_prefix); ?>
    <h3><?php print $title; ?></h3>
    <?php print render($title_suffix); ?>

    <div class="content"<?php print backdrop_attributes($content_attributes); ?>>
      <?php
        // We hide the comments and links now so that we can render them later.
        hide($content['links']);
        print render($content);
      ?>
    </div> <!-- /.content -->

    <footer class="comment-footer">
      <?php if ($signature): ?>
      <div class="user-signature clearfix">
        <?php print $signature; ?>
      </div>
      <?php endif; ?>

      <nav><?php print render($content['links']); ?></nav>
    </footer> <!-- /.comment-footer -->

  </div> <!-- /.comment-text -->
</article>
