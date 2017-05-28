<?php
/**
 * @file
 * 
 * Default theming implementation for displaying list of projects.
 * 
 * Available variables:
 * - $main_content: The main content area, namely the projects list, including the pager.
 * - $install_list: The install queue block.
 * - $advanced: The links for advanced project installation.
 * These are defined in installer_browser_preprocess_installer_browser_list().
 * 
 * @see installer_browser_preprocess_installer_browser_list().
 */
?>
<div class="installer-browser clearfix">
  <div class="installer-browser-main installer-browser-region">
    <?php print $main_content; ?>
  </div>

  <div class="installer-browser-list-sidebar installer-browser-region">
    <?php print $install_list; ?>
    <?php print $advanced; ?>
  </div>
  
</div>
