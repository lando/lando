<?php
/**
 * @file
 * Default theme implementation to display a block on the projects browse page.
 *
 * Available variables:
 * - $classes: AN array of classes for the wrapper.
 * - $title: The title of the block.
 * - $content: The content of the block.
 * These are defined in installer_browser_preprocess_installer_browser_block().
 * 
 * @see installer_browser_preprocess_installer_browser_block().
 */
?>
<div class="<?php print implode(' ', $classes); ?>">
  <?php print render($title_prefix); ?>
  <h2><?php print $title; ?></h2>
  <?php print render($title_suffix); ?>
  <div class="content">
    <?php print $content; ?>
  </div>
</div>
