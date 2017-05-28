<?php
/**
 * @file
 * Contains class and interface wrappers for Drupal 7.x compatibility.
 */

/**
 * @addtogroup drupal_compatibility Drupal compatibility layer.
 * @{
 */

// bootstrap.inc
abstract class DrupalCacheArray extends BackdropCacheArray {}
class DrupalUpdateException extends BackdropUpdateException {}

// cache-install.inc
class DrupalFakeCache extends BackdropFakeCache {}

// cache.inc
class DrupalDatabaseCache extends BackdropDatabaseCache {}
class DrupalNullCache extends BackdropNullCache {}

// stream_wrappers.inc
abstract class DrupalLocalStreamWrapper extends BackdropLocalStreamWrapper {}
class DrupalPublicStreamWrapper extends BackdropPublicStreamWrapper {}
class DrupalPrivateStreamWrapper extends BackdropPrivateStreamWrapper {}
class DrupalTemporaryStreamWrapper extends BackdropTemporaryStreamWrapper {}
interface DrupalStreamWrapperInterface extends BackdropStreamWrapperInterface {}

// updater.inc
interface DrupalUpdaterInterface extends BackdropUpdaterInterface {}

// system.queue.inc
class DrupalQueue extends BackdropQueue {}
interface DrupalQueueInterface extends BackdropQueueInterface {}
interface DrupalReliableQueueInterface extends BackdropReliableQueueInterface {}

// backdrop_web_test_case.php
abstract class DrupalTestCase extends BackdropTestCase {}
class DrupalUnitTestCase extends BackdropUnitTestCase {}
class DrupalWebTestCase extends BackdropWebTestCase {
  function drupalGetNodeByTitle($title, $reset) {
    return $this->backdropGetNodeByTitle($title, $reset);
  }
  protected function drupalCreateNode($settings = array()) {
    return $this->backdropCreateNode($settings);
  }
  protected function drupalCreateContentType($settings = array()) {
    return $this->backdropCreateContentType($settings);
  }
  protected function drupalGetTestFiles($type, $size = NULL) {
    return $this->backdropGetTestFiles($type, $size);
  }
  protected function drupalCompareFiles($file1, $file2) {
    return $this->backdropCompareFiles($file1, $file2);
  }
  protected function drupalCreateUser(array $permissions = array()) {
    return $this->backdropCreateUser($permissions);
  }
  protected function drupalCreateRole(array $permissions, $name = NULL) {
    return $this->backdropCreateRole($permissions, $name);
  }
  protected function drupalLogin($user) {
    $this->backdropLogin($user);
  }
  protected function drupalGetToken($value = '') {
    return $this->backdropGetToken($value);
  }
  protected function drupalLogout() {
    $this->backdropLogout();
  }
  protected function drupalGet($path, array $options = array(), array $headers = array()) {
    return $this->backdropGet($path, $options, $headers);
  }
  protected function drupalGetAJAX($path, array $options = array(), array $headers = array()) {
    return $this->backdropGetAJAX($path, $options, $headers);
  }
  protected function drupalPost($path, $edit, $submit, array $options = array(), array $headers = array(), $form_html_id = NULL, $extra_post = NULL) {
    return $this->backdropPost($path, $edit, $submit, $options, $headers, $form_html_id, $extra_post);
  }
  protected function drupalPostAJAX($path, $edit, $triggering_element, $ajax_path = NULL, array $options = array(), array $headers = array(), $form_html_id = NULL, $ajax_settings = NULL) {
    return $this->backdropPostAJAX($path, $edit, $triggering_element, $ajax_path, $options, $headers, $form_html_id, $ajax_settings);
  }
  protected function drupalGetHeaders($all_requests = FALSE) {
    return $this->backdropGetHeaders($all_requests);
  }
  protected function drupalGetHeader($name, $all_requests = FALSE) {
    return $this->backdropGetHeader($name, $all_requests);
  }
  protected function drupalGetContent() {
    return $this->backdropGetContent();
  }
  protected function drupalGetSettings() {
    return $this->backdropGetSettings();
  }
  protected function drupalGetMails($filter = array()) {
    return $this->backdropGetMails($filter);
  }
  protected function drupalSetContent($content, $url = 'internal:') {
    $this->backdropSetContent($content, $url);
  }
  protected function drupalSetSettings($settings) {
    $this->backdropSetSettings($settings);
  }
  protected function drupalHead($path, array $options = array(), array $headers = array()) {
    return $this->backdropHead($path, $options, $headers);
  }
}

// entity.controller.inc
class DrupalDefaultEntityController extends DefaultEntityController {}
interface DrupalEntityControllerInterface extends EntityControllerInterface {}

/**
 * @}
 */
