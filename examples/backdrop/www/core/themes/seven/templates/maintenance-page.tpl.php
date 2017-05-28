<!DOCTYPE html>
<html<?php print backdrop_attributes($html_attributes); ?>>
  <head>
    <?php print backdrop_get_html_head(); ?>
    <title><?php print $head_title; ?></title>
    <?php print backdrop_get_css(); ?>
    <?php print backdrop_get_js(); ?>
  </head>
  <body class="<?php print implode(' ', $classes); ?>">
    <div id="page">

    <?php if ($sidebar): ?>
      <div id="sidebar" class="sidebar">
        <?php if ($logo): ?>
          <img id="logo" src="<?php print $logo ?>" alt="<?php print $site_name ?>" />
        <?php endif; ?>
        <?php print $sidebar ?>
      </div>
    <?php endif; ?>

    <main id="content" class="clearfix">
      <?php if ($title): ?><h1 class="page-title"><?php print $title; ?></h1><?php endif; ?>
      <?php if ($messages): ?>
        <div id="console"><?php print $messages; ?></div>
      <?php endif; ?>
      <?php print $content; ?>
    </main>
  </div>

  <?php if (!empty($footer)): ?>
    <footer role="contentinfo">
      <?php print $footer; ?>
    </footer>
  <?php endif; ?>

  </body>
</html>
