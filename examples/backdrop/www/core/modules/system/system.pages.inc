<?php
/**
 * @file
 * System module non-administrative page callbacks.
 */

/**
 * Page callback to output a token tree as an empty page.
 */
function system_token_output() {
  $options = isset($_GET['options']) ? backdrop_json_decode($_GET['options']) : array();

  // Check the token against the serialized options to prevent random access to
  // the token browser page.
  if (!isset($_GET['token']) || !backdrop_valid_token($_GET['token'], 'token-tree:' . serialize($options))) {
    return MENU_ACCESS_DENIED;
  }

  $tree = '<div>' . theme('token_tree', $options) . '</div>';

  if (backdrop_is_ajax()) {
    // Return as a renderable so the Backdrop dialog system can use the title.
    $dialog_options = array(
      'dialogClass' => 'token-dialog',
      'modal' => FALSE,
      'draggable' => TRUE,
      'resizeable' => TRUE,
      'autoResize' => FALSE,
      'width' => '600',
      'height' => '500',
    );
    $commands = array(ajax_command_open_dialog('#token-dialog', t('Available tokens'), $tree, $dialog_options));
    $return = array(
      '#type' => 'ajax',
      '#commands' => $commands,
    );
    return $return;
  }
  else {
    return $tree;
  }
}
