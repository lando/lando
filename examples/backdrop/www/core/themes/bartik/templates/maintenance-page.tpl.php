<?php
/**
 * @file
 * Implementation to display a single Backdrop page while offline.
 *
 * All the available variables are mirrored in page.tpl.php.
 *
 * @see template_preprocess()
 * @see template_preprocess_maintenance_page()
 * @see bartik_process_maintenance_page()
 */
?>
<!DOCTYPE html>
<html<?php print backdrop_attributes($html_attributes); ?>>
<head>
  <?php print backdrop_get_html_head(); ?>
  <title><?php print $head_title; ?></title>
  <?php print backdrop_get_css(); ?>
  <?php print backdrop_get_js(); ?>
</head>
<body class="<?php print implode(' ', $classes); ?>"<?php print backdrop_attributes($attributes); ?>>

  <div id="skip-link">
    <a href="#main-content" class="element-invisible element-focusable"><?php print t('Skip to main content'); ?></a>
  </div>

  <div id="page-wrapper"><div id="page">

    <header id="header" role="banner">
      <?php if ($site_name || $site_slogan): ?>
        <div id="name-and-slogan">
          <?php if ($site_name): ?>
            <div class="site-name">
              <?php print $site_name; ?>
            </div>
          <?php endif; ?>
          <?php if ($site_slogan): ?>
            <div class="site-slogan">
              <?php print $site_slogan; ?>
            </div>
          <?php endif; ?>
        </div> <!-- /#name-and-slogan -->
      <?php endif; ?>
    </header>

    <main id="content" class="column" role="main">
      <a id="main-content"></a>
      <?php if ($title): ?><h1 class="page-title"><?php print $title; ?></h1><?php endif; ?>
      <?php print $content; ?>
      <?php if ($messages): ?>
        <div id="messages">
          <?php print $messages; ?>
        </div>
      <?php endif; ?>
    </main>

  </div></div> <!-- /#page, /#page-wrapper -->

</body>
</html>
