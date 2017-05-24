<?php
/**
 * @file
 * Action callbacks for File module.
 */

/**
 * Queues a file for deletion.
 *
 * @param File $file
 *   The file entity that will be queued for deletion.
 * @param $context
 *   Contextual information about the triggered action.
 *
 * @ingroup actions
 */
function file_delete_action(File $file, &$context) {
  if (!user_access('delete files')) {
    return;
  }

  // Save the list of files to be deleted in the session. Append to the existing
  // list if within the last minute, otherwise start a new list of files.
  $last_action_time = 0;
  if (isset($_SESSION['file_delete_action'])) {
    $last_action_time = $_SESSION['file_delete_action']['timestamp'];
  }
  if (REQUEST_TIME - $last_action_time > 60) {
    $_SESSION['file_delete_action'] = array(
      'timestamp' => REQUEST_TIME,
      'fids' => array(),
    );
  }

  $_SESSION['file_delete_action']['fids'][] = $file->fid;
  $context['redirect'] = 'admin/content/files/delete';
}
