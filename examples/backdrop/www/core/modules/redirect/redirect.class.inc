<?php
/**
 * Provides a HTTP redirect from one Backdrop internal path to another.
 */
class Redirect {

  /**
   * The redirect ID.
   *
   * @var integer
   */
  public $rid;

  /**
   * The type of the redirect object. May be:
   *
   * - redirect: A redirect that is saved and loaded from the database.
   * - manual: A single-use redirect that was manually created on-the-fly.
   *
   * @var string
   */
  public $type = 'redirect';

  /**
   * The redirect language code.
   *
   * @var string
   */
  public $langcode = LANGUAGE_NONE;

  /**
   * The from which the redirect will start.
   *
   * @var string
   */
  public $source = '';

  /**
   * An array of options for the source of the redirect.
   *
   * @var array
   */
  public $source_options = array();

  /**
   * The path to which the source will be redirected.
   *
   * @var string
   */
  public $redirect;

  /**
   * An array of options for the redirect.
   *
   * @var array
   */
  public $redirect_options = array();

  /**
   * The function callback that will execute the redirect.
   *
   * @var string
   */
  public $callback = 'redirect_goto';

  /**
   * The redirect creator ID.
   *
   * @var int
   */
  public $uid = 0;

  /**
   * The redirect status code.
   *
   * @var int
   */
  public $status_code = 301;

  /**
   * The total number of times this redirect has been followed.
   *
   * @var int
   */
  public $count = 0;

  /**
   * A timestamp of the last time this redirect was accessed.
   */
  public $access = 0;

  /**
   * Hashes are an alternative ID by which a redirect may be loaded.
   *
   * @var string
   */
  public $hash = '';

  /**
   * If this redirect is newly created and not yet saved to the database.
   *
   * @var bool
   */
  public $is_new = FALSE;

  /**
   * Constructor for creating a new redirect.
   *
   * @param array $values
   *   An array of values to populate the redirect object.
   */
  public function __construct(array $values = array()) {
    // Set initial values.
    foreach ($values as $key => $value) {
      $this->$key = $value;
    }

    if (empty($this->rid)) {
      $this->is_new = TRUE;
    }

    // Unserialize the URL option fields.
    if (is_string($this->source_options)) {
      $this->source_options = unserialize($this->source_options);
    }
    if (is_string($this->redirect_options)) {
      $this->redirect_options = unserialize($this->redirect_options);
    }

    module_invoke_all('redirect_prepare', $this, $values);
  }

  /**
   * Save this redirect object.
   */
  public function save() {
    return redirect_save($this);
  }

  /**
   * Implements EntityInterface::delete().
   */
  public function delete() {
    return redirect_delete($this->rid);
  }

  /**
   * Returns if this redirect is newly created and not yet saved.
   */
  public function isNew() {
    return !empty($this->is_new) || !$this->rid;
  }
}
