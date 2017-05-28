<?php

// Put the logo path into JavaScript for the live preview.
backdrop_add_js(array('color' => array('logo' => theme_get_setting('logo', 'bartik'))), 'setting');

$info = array(
  // Available colors and color labels used in theme.
  'fields' => array(
    'top' => t('Header background top'),
    'bottom' => t('Header background bottom'),
    'bg' => t('Main background'),
    'sidebar' => t('Sidebar background'),
    'sidebarborders' => t('Sidebar borders'),
    'footer' => t('Footer background'),
    'titleslogan' => t('Title and slogan'),
    'text' => t('Text color'),
    'link' => t('Link color'),
    'menu' => 'Menu link',
    'activemenu' => t('Active menu link color'),
  ),
  // Pre-defined color schemes.
  'schemes' => array(
    'default' => array(
      'title' => t('Blackdrop (default)'),
      'colors' => array(
        'top' => '#000000',
        'bottom' => '#000001',
        'bg' => '#ffffff',
        'sidebar' => '#e8e6e5',
        'sidebarborders' => '#fffffe',
        'footer' => '#000002',
        'titleslogan' => '#fffeff',
        'text' => '#3b3b3b',
        'link' => '#27ace2',
        'menu' => '#e3e3e3',
        'activemenu' => '#fefeff',
      ),
    ),
    'blue_lagoon' => array(
      'title' => t('Blue Lagoon'),
      'colors' => array(
        'top' => '#0779bf',
        'bottom' => '#48a9e4',
        'bg' => '#ffffff',
        'sidebar' => '#f6f6f2',
        'sidebarborders' => '#f9f9f9',
        'footer' => '#292929',
        'titleslogan' => '#fffeff',
        'text' => '#3b3b3b',
        'link' => '#0071B3',
        'menu' => '#f3f7fa',
        'activemenu' => '#fefeff',
      ),
    ),
    'ice' => array(
      'title' => t('Ice'),
      'colors' => array(
        'top' => '#d0d0d0',
        'bottom' => '#d0d0d0',
        'bg' => '#ffffff',
        'sidebar' => '#ffffff',
        'sidebarborders' => '#cccccc',
        'footer' => '#24272c',
        'titleslogan' => '#000000',
        'text' => '#4a4a4a',
        'link' => '#019dbf',
        'menu' => '#fefeff',
        'activemenu' => '#ffffff',
      ),
    ),
    'plum' => array(
      'title' => t('Plum'),
      'colors' => array(
        'top' => '#4c1c58',
        'bottom' => '#4c1c58',
        'bg' => '#fffdf7',
        'sidebar' => '#edede7',
        'sidebarborders' => '#e7e7e7',
        'footer' => '#2c2c28',
        'titleslogan' => '#ffffff',
        'text' => '#301313',
        'link' => '#9d408d',
        'menu' => '#f3f7fa',
        'activemenu' => '#fefeff',
      ),
    ),
    'goldfish' => array(
      'title' => t('Goldfish'),
      'colors' => array(
        'top' => '#e0e4cc',
        'bottom' => '#e0e4cc',
        'bg' => '#ffffff',
        'sidebar' => '#f3f4e9',
        'sidebarborders' => '#ffffff',
        'footer' => '#798053',
        'titleslogan' => '#798053',
        'text' => '#3b3b3b',
        'link' => '#fa6900',
        'menu' => '#798053',
        'activemenu' => '#4c5037',
      ),
    ),
    'mocha' => array(
      'title' => t('Mocha'),
      'colors' => array(
        'top' => '#c63d0f',
        'bottom' => '#c63d0f',
        'bg' => '#faf8f8',
        'sidebar' => '#ffffff',
        'sidebarborders' => '#dec0b4',
        'footer' => '#7e8f7c',
        'titleslogan' => '#ffffff',
        'text' => '#3b3738',
        'link' => '#c63d0f',
        'menu' => '#fefeff',
        'activemenu' => '#ffffff',
      ),
    ),
  ),

  // CSS files (excluding @import) to rewrite with new color scheme.
  'css' => array(
    'css/colors.css',
  ),

  // Files to copy.
  'copy' => array(),

  // Gradient definitions.
  'gradients' => array(
    array(
      // (x, y, width, height).
      'dimension' => array(0, 0, 0, 0),
      // Direction of gradient ('vertical' or 'horizontal').
      'direction' => 'vertical',
      // Keys of colors to use for the gradient.
      'colors' => array('top', 'bottom'),
    ),
  ),

  // Color areas to fill (x, y, width, height).
  'fill' => array(),

  // Coordinates of all the theme slices (x, y, width, height)
  // with their filename as used in the stylesheet.
  'slices' => array(),

  // Reference color used for blending. Matches the base.png's colors.
  'blend_target' => '#ffffff',

  // Preview files.
  'preview_css' => 'color/preview.css',
  'preview_js' => 'color/preview.js',
  'preview_html' => 'color/preview.html',

  // Base file for image generation.
  'base_image' => 'color/base.png',
);
