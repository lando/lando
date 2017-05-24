<?php
/**
 * @file
 * Template for each "box" on the display query configuration screen.
 */
?>
<div class="<?php print implode(' ', $classes); ?>"<?php print backdrop_attributes($attributes); ?>>
  <?php print $item_help_icon; ?>
  <?php if(!empty($actions)) : ?>
    <?php print $actions; ?>
  <?php endif; ?>
  <?php if (!empty($title)) : ?>
    <h3><?php print $title; ?></h3>
  <?php endif; ?>
  <?php print $content; ?>
</div>
