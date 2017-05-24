<?php
/**
 * @file
 * Template for each row inside the "boxes" on the configuration screen.
 */
?>
<div class="views-display-setting <?php print implode(' ', $classes); ?> <?php print $zebra; ?> clearfix"<?php print backdrop_attributes($attributes); ?>>
  <?php if ($description): ?>
    <span class="label"><?php print $description; ?></span>
  <?php endif; ?>
  <?php if ($settings_links): ?>
    <?php print $settings_links; ?>
  <?php endif; ?>
</div>
