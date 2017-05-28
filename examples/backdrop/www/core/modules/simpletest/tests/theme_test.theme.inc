<?php
/**
 * @file
 * Theme functions for the Theme Test module.
 */

/**
 * Returns HTML for the 'theme_test' theme hook used by tests.
 */
function theme_theme_test($variables) {
  return 'Theme hook implementor=theme_theme_test(). Foo=' . $variables['foo'];
}

/**
 * Theme function for testing theme('theme_test_foo').
 */
function theme_theme_test_foo($variables) {
  return $variables['foo'];
}

/**
 * Preprocesses variables for theme_theme_test().
 */
function template_preprocess_theme_test(&$variables) {
  $variables['foo'] = 'template_preprocess_theme_test';
}

