<?php
/**
 * @file
 * Menu callbacks for CKEditor module.
 */

/**
 * Menu callback; Saves images uploaded via copy/paste into the editor.
 */
function ckeditor_image_upload($format) {
  $upload_settings = $format->editor_settings['image_upload'];
  if (!$upload_settings['status']) {
    return array(
      'uploaded' => 0,
      'error' => array('message' => t('Image uploading is not enabled for this text format.')),
    );
  }

  // Uploading through CKEditor sends POST data with the file in an "upload"
  // identifier. The file_save_upload() function requires data be within a
  // "files" array, so we move the data so it is in the expected location.
  if (isset($_FILES['upload'])) {
    $_FILES['files'] = $_FILES;
  }

  $destination = $upload_settings['scheme'] . '://' .  $upload_settings['directory'];
  $validators = array(
    'file_validate_is_image' => array(),
  );
  if ($upload_settings['max_size']) {
    $validators['file_validate_size'] = array(parse_size($upload_settings['max_size']));
  }
  if ($upload_settings['max_dimensions']['width']) {
    $validators['file_validate_image_resolution'] = array($upload_settings['max_dimensions']['width'] . 'x' . $upload_settings['max_dimensions']['height']);
  }

  file_prepare_directory($destination, FILE_CREATE_DIRECTORY);
  $file = file_save_upload('upload', $validators, $destination);
  if ($file) {
    // Try to make a local path if possible for better portability.
    $url = file_create_url($file->uri);
    $url = str_replace($GLOBALS['base_url'], '', $url);
    $image_info = image_get_info($file->uri);
    $response = array(
      'uploaded' => 1,
      'fileName' => $file->filename,
      'url' => $url,
      'fileId' => $file->fid,
      'width' => $image_info['width'],
      'height' => $image_info['height'],
    );
  }
  else {
    $response = array(
      'uploaded' => 0,
    );
  }

  // file_save_upload() sets messages via backdrop_set_message(). Pull the
  // responses out and display via CKEditor's notification system.
  $messages = backdrop_get_messages();
  $message_string = '';
  foreach ($messages as $type) {
    $message_string .= $type[0] . ' ';
  }
  if ($message_string) {
    $response['error']['message'] = $message_string;
  }


  return $response;
}
