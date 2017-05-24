<?php 
/**
 * @file
 * 
 * Default theming implementation for displaying list of queued projects.
 * 
 * Available variables:
 * - $queue_html: The html for the install_queue.
 * These are defined in installer_browser_preprocess_installer_browser_install_queue().
 * 
 * @see installer_browser_preprocess_installer_browser_install_queue().
 */
?>
<div class="installer-browser-install-queue clearfix">
  <?php print $queue_html; ?>
</div>
