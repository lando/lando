<?php
/**
 * Test forms that save data using the configuration system.
 */
class SystemConfigFormCase extends BackdropWebTestCase {
  /**
   * Form ID to use for testing.
   *
   * @var string
   */
  protected $form_id;

  /**
   * Values to use for testing.
   *
   * Conatins details for form key, configuration object name, and config key.
   * Example:
   * @code
   *   array(
   *     'user_mail_cancel_confirm_body' => array(
   *       '#value' => $this->randomString(),
   *       '#config_name' => 'user.mail',
   *       '#config_key' => 'cancel_confirm_body',
   *     ),
   *   );
   * @endcode
   *
   * @var array
   */
  protected $values;

  /**
   * Submit the system_config_form and then test the configuration has the
   * expected values.
   */
  function testConfigForm() {
    // Programmatically submit the given values.
    foreach ($this->values as $form_key => $data) {
      $values[$form_key] = $data['#value'];
    }
    $form_state = array('values' => $values);
    backdrop_form_submit($this->form_id, $form_state);

    // Check that the form returns an error when expected, and vice versa.
    $errors = form_get_errors();
    $valid_form = empty($errors);
    $args = array(
      '%values' => print_r($values, TRUE),
      '%errors' => $valid_form ? t('None') : implode(' ', $errors),
    );
    $this->assertTrue($valid_form, t('Input values: %values<br/>Validation handler errors: %errors', $args));

    foreach ($this->values as $form_key => $data) {
      $this->assertEqual($data['#value'], config($data['#config_name'])->get($data['#config_key']));
    }
  }
}
