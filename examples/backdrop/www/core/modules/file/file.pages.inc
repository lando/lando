<?php
/**
 * @file
 * Supports file operations including View, Edit, and Delete.
 */

/**
 * Page callback: Form constructor for the file deletion confirmation form.
 *
 * Path: file/%file/delete
 *
 * @param object $file
 *   A file object from file_load().
 *
 * @see file_menu()
 */
function file_delete_form($form, &$form_state, $file) {
  $form_state['file'] = $file;

  $form['fid'] = array(
    '#type' => 'value',
    '#value' => $file->fid,
  );

  $description = '';
  $known_count = 0;
  $unknown_count = 0;
  $entity_list = _file_usage_list_links($file, $known_count, $unknown_count);

  if ($known_count || $unknown_count) {
    $description .= format_plural($known_count + $unknown_count, 'This file is referenced by one piece of content.', 'This file is referenced by @count pieces of content.');
  }

  if ($entity_list) {
    if ($unknown_count) {
      $entity_list[] = format_plural($unknown_count, 'And one additional unknown piece of content.', 'And @count additional unknown pieces of content.');
    }
    $description .= ' ' . t('Content referencing this file includes:');
    $description = '<p>' . $description . '</p>';
    $description .= theme('item_list', array('items' => $entity_list));
  }
  elseif ($unknown_count) {
    $description .= ' ' . t('However, this content is either missing or you do not have access to it.');
    $description = '<p>' . $description . '</p>';
  }
  else {
    $description .= t('This file has no known content referencing it, although it may still be in use.');
    $description = '<p>' . $description . '</p>';
  }
  $description .= '<p>' . t('Deleting this file may cause content to display improperly.') . '</p>';

  return confirm_form($form,
    t('Are you sure you want to delete the file %title?', array(
      '%title' => entity_label('file', $file),
    )),
    'admin/content/files',
    $description,
    t('Delete')
  );
}

/**
 * Form submission handler for file_delete_form().
 */
function file_delete_form_submit($form, &$form_state) {
  if ($form_state['values']['confirm'] && ($file = file_load($form_state['values']['fid']))) {
    file_delete($file->fid);
    watchdog('file', 'Administrator deleted file %title.', array('%title' => $file->label()));
    backdrop_set_message(t('%title has been deleted.', array('%title' => $file->label())));
  }

  $form_state['redirect'] = '<front>';

  // Clear the page and block caches.
  cache_clear_all();
}

/**
 * Multiple file deletion confirmation form.
 *
 * @see file_multiple_delete_confirm_submit()
 *
 * @ingroup forms
 */
function file_multiple_delete_confirm($form, &$form_state) {
  if (isset($form_state['fids'])) {
    $fids = $form_state['fids'];
  }
  elseif (isset($_SESSION['file_delete_action']['timestamp']) && (REQUEST_TIME - $_SESSION['file_delete_action']['timestamp'] < 6000)) {
    $fids = $_SESSION['file_delete_action']['fids'];
    $form_state['fids'] = $fids;
    $form_state['cache'] = TRUE;
    unset($_SESSION['file_delete_action']);
  }
  else {
    $fids = array();
  }

  $form['#tree'] = TRUE;

  if (empty($fids)) {
    $destination = isset($_GET['destination']) ? $_GET['destination'] : 'admin/content/files';
    $form['empty']['#markup'] = '<p>' . t('Return to the <a href="!url">manage files administration page</a>.', array('!url' => url($destination))) . '</p>';
    backdrop_set_message(t('No files have been selected for deletion.'), 'error');
    return $form;
  }

  $form['file_list'] = array(
    '#theme' => 'item_list',
    '#items' => array(),
  );

  $items = array();
  $files = file_load_multiple($fids);
  $usage_count_total = 0;
  foreach ($files as $fid => $file) {
    $usage_count = _file_usage_get_total($file);
    $usage_count_total += $usage_count;
    $form['files'][$fid] = array(
      '#type' => 'hidden',
      '#value' => $fid,
    );
    $uri = $file->uri();
    $url = file_create_url($uri['path']);
    $label = l($file->label(), $url);
    if ($usage_count) {
      $label .= ' (' . format_plural($usage_count, 'referenced 1 time', 'referenced @count times') . ')';
    }
    $items[] = $label;
  }

  $confirm_question = format_plural(count($files), 'Are you sure you want to delete this file?', 'Are you sure you want to delete these files?');

  if ($usage_count_total) {
    $description = '<p>' . format_plural($usage_count_total, 'One piece of content references the listed files.', '@count pieces of content reference the listed files.') . '</p>';
  }
  else {
    $description = '<p>' . format_plural(count($files), 'This file has no known content referencing it, although it may still be in use.', 'These files have no known content referencing them, although they may still be in use.') . '</p>';
  }

  $description .= theme('item_list', array('items' => $items));

  $description .= '<p>' . format_plural(count($files), 'Deleting this file may cause content to display improperly.', 'Deleting these files may cause content to display improperly.') . '</p>';

  return confirm_form($form, $confirm_question, 'admin/content/files', $description, t('Delete'), t('Cancel'));
}

/**
 * Form submission handler for file_multiple_delete_confirm().
 */
function file_multiple_delete_confirm_submit($form, &$form_state) {
  file_delete_multiple(array_keys($form_state['values']['files']));
  cache_clear_all();
  $count = count($form_state['values']['files']);
  watchdog('content', 'Administrator deleted @count files.', array('@count' => $count));

  backdrop_set_message(format_plural($count, 'Deleted 1 file.', 'Deleted @count files.'));
  $form_state['redirect'] = 'admin/content/files';
}

/**
 * Build a list of links to content that references a file.
 *
 * @param File $file
 *   The file entity for which a list of links should be generated.
 * @param int $known_count
 *   The number of usages that are found and to which the user has access.
 * @param int $unknown_count
 *   The number of usages which cannot be displayed in the list of links.
 *
 * @return array
 *   An array of strings suitable for passing into theme('item_list').
 */
function _file_usage_list_links(File $file, &$known_count, &$unknown_count) {

  // Make a list of links showing where this file is in use. Files in use by
  // known entities are linked. Orphaned usages or ones not associated with an
  // entities are considered an "Unknown" usage. If the user does not have
  // access to the associated entity, it is considered unknown and no link is
  // shown.
  $known_count = 0;
  $unknown_count = 0;
  $entity_list = array();
  if ($file_usage_list = file_usage_list($file)) {
    foreach ($file_usage_list as $module_name => $module_usages) {
      foreach ($module_usages as $entity_type => $entity_usages) {
        $entity_type_info = entity_get_info($entity_type);
        $entity_ids = array();
        foreach ($entity_usages as $entity_id => $usage_count) {
          if ($entity_type_info) {
            $entity_ids[] = $entity_id;
          }
          else {
            $unknown_count += $usage_count;
          }
        }
        if ($entity_ids) {
          $entities = entity_load_multiple($entity_type, $entity_ids);

          // Perform an access check on all given entities.
          $query = new EntityFieldQuery();
          $query->entityCondition('entity_type', $entity_type);
          $query->entityCondition('entity_id', $entity_ids);
          $query->addTag($entity_type . '_access');
          $result = $query->execute();

          foreach ($entities as $entity) {
            // If the entity is in the EFQ result, access is allowed.
            if (isset($result[$entity_type][$entity->id()])) {
              $uri = $entity->uri();
              $entity_list[] = l($entity->label(), $uri['path'], $uri['options']);
              $known_count++;
            }
            // If not, do not show a link and consider it an unknown location.
            else {
              $unknown_count++;
            }
          }
        }
      }
    }
  }
  return $entity_list;
}

/**
 * Get the complete total number of known usages for a file.
 *
 * @param File $file
 *   A file entity object.
 * @return int
 *   The complete number of usages.
 */
function _file_usage_get_total(File $file) {
  $total = 0;
  if ($file_usage_list = file_usage_list($file)) {
    foreach ($file_usage_list as $module_name => $module_usages) {
      foreach ($module_usages as $entity_type => $entity_usages) {
        foreach ($entity_usages as $entity_id => $usage_count) {
          $total += $usage_count;
        }
      }
    }
  }
  return $total;
}
