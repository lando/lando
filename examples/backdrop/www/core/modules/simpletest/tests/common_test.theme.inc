<?php
/**
 * @file
 * Theme functions for the Common Test module.
 */

/**
 * Theme function for testing backdrop_render() theming.
 */
function theme_common_test_foo($variables) {
  return $variables['foo'] . $variables['bar'];
}

