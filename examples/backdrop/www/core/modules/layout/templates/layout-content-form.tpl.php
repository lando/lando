<?php
/**
 * @file
 * Output the main layout content editor form.
 */
$actions = backdrop_render($form['actions']);
$content = backdrop_render($form['content']);
?>
<div id="layout-edit">
  <div class="layout-settings">
    <?php print backdrop_render_children($form); ?>
  </div>
  <div class="layout-wrapper clearfix">
    <?php print $content; ?>
  </div>
  <?php print $actions; ?>
</div>
