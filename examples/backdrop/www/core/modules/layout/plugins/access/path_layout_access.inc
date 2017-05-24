<?php
/**
 * @file
 * Plugin to provide access control/visibility based on path.
 */
class PathLayoutAccess extends LayoutAccess {
  /**
   * Constructor for a Layout access rule.
   */
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);
    $this->settings += array(
      'visibility_setting' => 1,
      'paths' => '',
    );
  }

  /**
   * {@inheritdoc}
   */
  function summary() {
    $paths = explode("\n", $this->settings['paths']);
    if ($this->settings['visibility_setting']) {
      return format_plural(count($paths), 'Current path is "@paths"', 'Current path is one of "@paths"', array('@paths' => implode(', ', $paths)));
    }
    else {
      return format_plural(count($paths), 'Current path is not "@paths"', 'Current path is not one of "@paths"', array('@paths' => implode(', ', $paths)));
    }
  }

  /**
   * {@inheritdoc}
   */
  function checkAccess() {
    $base_path = $_GET['q'];

    $path = backdrop_get_path_alias($base_path);
    $page_match = backdrop_match_path($path, $this->settings['paths']);

    // If there's a path alias, we may still be at the un-aliased path
    // so check that as well.
    if ($path !== $base_path) {
      $page_match = $page_match || backdrop_match_path($base_path, $this->settings['paths']);
    }

    // When $this->settings['visibility_setting'] has a value of 0, the block is
    // displayed on all pages except those listed. When set to 1, it
    // is displayed only on those pages listed.
    if (!$this->settings['visibility_setting']) {
      $page_match = !$page_match;
    }

    return $page_match;
  }

  /**
   * {@inheritdoc}
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);

    $form['visibility_setting'] = array(
      '#type' => 'radios',
      '#options' => array(
        1 => t('Allow access on the following pages'),
        0 => t('Allow access on all pages except the following pages'),
      ),
      '#default_value' => $this->settings['visibility_setting'],
    );
    $form['paths'] = array(
      '#type' => 'textarea',
      '#title' => t('Paths'),
      '#default_value' => $this->settings['paths'],
      '#description' => t('Enter one path per line. The "*" character is a wildcard. Example paths are "node/1" for an individual piece of content or "node/*" for every piece of content. "@front" is the front page.', array('@front' => '<front>')),
      '#required' => TRUE,
    );
  }
}
