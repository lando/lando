<?php
/**
 * @file
 * Code required only for the update status settings form.
 */

/**
 * Form constructor for the update settings form.
 *
 * @see update_settings_validate()
 * @see update_settings_submit()
 * @ingroup forms
 */
function update_settings($form, &$form_state) {
  $config = config('update.settings');
  $form['update_check_frequency'] = array(
    '#type' => 'radios',
    '#title' => t('Check for updates'),
    '#default_value' => $config->get('update_interval_days'),
    '#options' => array(
      '1' => t('Daily'),
      '7' => t('Weekly'),
      '0' => t('Manually only'),
    ),
    '#description' => t('Select how frequently you want to automatically check for new releases of your currently installed modules, themes, and layouts.'),
  );

  $form['update_check_disabled'] = array(
    '#type' => 'checkbox',
    '#title' => t('Check for updates of disabled and uninstalled modules, themes, and layouts.'),
    '#default_value' => $config->get('update_disabled_extensions'),
  );

  $notify_emails = $config->get('update_emails');
  if (empty($notify_emails)) {
    $notify_emails = array();
  }
  $form['update_notify_emails'] = array(
    '#type' => 'textarea',
    '#title' => t('E-mail addresses to notify when updates are available'),
    '#rows' => 4,
    '#default_value' => implode("\n", $notify_emails),
    '#description' => t('Whenever your site checks for available updates and finds new releases, it can notify a list of users via e-mail. Put each address on a separate line. If blank, no e-mails will be sent.'),
  );

  $form['update_notification_threshold'] = array(
    '#type' => 'radios',
    '#title' => t('E-mail notification threshold'),
    '#default_value' => $config->get('update_threshold'),
    '#options' => array(
      'all' => t('All newer versions'),
      'security' => t('Only security updates'),
    ),
    '#description' => t('You can choose to send e-mail only if a security update is available, or to be notified about all newer versions. If there are updates available of Backdrop CMS or any of your installed modules, themes, and layouts, your site will always print a message on the <a href="@status_report">status report</a> page, and will also display an error message on administration pages if there is a security update.', array('@status_report' => url('admin/reports/status')))
  );

  // Custom validation callback for the email notification setting.
  $form['#validate'][] = 'update_settings_validate';

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration')
  );

  return $form;
}

/**
 * Form validation handler for update_settings().
 *
 * Validates the e-mail addresses and ensures the field is formatted correctly.
 *
 * @see update_settings_submit()
 */
function update_settings_validate($form, &$form_state) {
  $form_state['notify_emails'] = array();
  if (!empty($form_state['values']['update_notify_emails'])) {
    $valid = array();
    $invalid = array();
    foreach (explode("\n", trim($form_state['values']['update_notify_emails'])) as $email) {
      $email = trim($email);
      if (!empty($email)) {
        if (valid_email_address($email)) {
          $valid[] = $email;
        }
        else {
          $invalid[] = $email;
        }
      }
    }
    if (empty($invalid)) {
      $form_state['notify_emails'] = $valid;
    }
    elseif (count($invalid) == 1) {
      form_set_error('update_notify_emails', t('%email is not a valid e-mail address.', array('%email' => reset($invalid))));
    }
    else {
      form_set_error('update_notify_emails', t('%emails are not valid e-mail addresses.', array('%emails' => implode(', ', $invalid))));
    }
  }
}

/**
 * Form submission handler for update_settings().
 *
 * Also invalidates the cache of available updates if the "Check for updates of
 * disabled and uninstalled modules, themes, and layouts." setting is being
 * changed. The available updates report needs to refetch available update data
 * after this setting changes or it would show misleading things (e.g., listing
 * the disabled projects on the site with the "No available releases found"
 * warning).
 *
 * @see update_settings_validate()
 */
function update_settings_submit($form, $form_state) {
  $config = config('update.settings');

  // See if the update_check_disabled setting is being changed, and if so,
  // invalidate all cached update status data.
  if ($form_state['values']['update_check_disabled'] != $config->get('update_disabled_extensions')) {
    _update_cache_clear();
  }

  $config
    ->set('update_disabled_extensions', $form_state['values']['update_check_disabled'])
    ->set('update_interval_days', $form_state['values']['update_check_frequency'])
    ->set('update_emails', $form_state['notify_emails'])
    ->set('update_threshold', $form_state['values']['update_notification_threshold'])
    ->save();

  // Display status messages for this form.
  backdrop_set_message(t('The configuration options have been saved.'));
}
