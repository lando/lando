<?php

/**
 * @file
 * Code required only when rendering the available updates report.
 */

/**
 * Page callback: Generates a page about the update status of projects.
 *
 * @see update_menu()
 */
function update_status() {
  if ($available = update_get_available(TRUE)) {
    module_load_include('inc', 'update', 'update.compare');
    $data = update_calculate_project_data($available);
    return theme('update_report', array('data' => $data));
  }
  else {
    return theme('update_report', array('data' => _update_no_data()));
  }
}

