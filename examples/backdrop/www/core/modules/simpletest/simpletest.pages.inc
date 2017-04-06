<?php
/**
 * @file
 * Page callbacks for simpletest module.
 */

/**
 * List tests arranged in groups that can be selected and run.
 */
function simpletest_test_form($form) {
  $form['tests'] = array(
    '#type' => 'fieldset',
    '#title' => t('Tests'),
    '#description' => t('Select the test(s) or test group(s) you would like to run, and click <em>Run tests</em>.'),
  );

  $form['tests']['table'] = array(
    '#theme' => 'simpletest_test_table',
  );

  // Generate the list of tests arranged by group.
  $groups = simpletest_test_get_all();
  foreach ($groups as $group => $tests) {
    $form['tests']['table'][$group] = array(
      '#collapsed' => TRUE,
    );

    foreach ($tests as $class => $info) {
      $form['tests']['table'][$group][$class] = array(
        '#type' => 'checkbox',
        '#title' => $info['name'],
        '#description' => $info['description'],
        '#parents' => array('tests', $class),
      );
    }
  }

  // Operation buttons.
  $form['tests']['op'] = array(
    '#type' => 'submit',
    '#value' => t('Run tests'),
  );
  $form['clean'] = array(
    '#type' => 'fieldset',
    '#collapsible' => FALSE,
    '#collapsed' => FALSE,
    '#title' => t('Clean test environment'),
    '#description' => t('Remove tables with the prefix "simpletest" and temporary directories that are left over from tests that crashed. This is intended for developers when creating tests.'),
  );
  $form['clean']['op'] = array(
    '#type' => 'submit',
    '#value' => t('Clean environment'),
    '#submit' => array('simpletest_clean_environment'),
  );

  return $form;
}

/**
 * Run selected tests.
 */
function simpletest_test_form_submit($form, &$form_state) {
  $tests_list = array_keys(array_filter($form_state['values']['tests']));
  if (count($tests_list) > 0 ) {
    $test_id = simpletest_run_tests($tests_list, 'backdrop');
    $form_state['redirect'] = 'admin/config/development/testing/results/' . $test_id;
  }
  else {
    backdrop_set_message(t('No test(s) selected.'), 'error');
  }
}

/**
 * Test results form for $test_id.
 */
function simpletest_result_form($form, &$form_state, $test_id) {
  // Make sure there are test results to display and a re-run is not being performed.
  $results = array();
  if (is_numeric($test_id) && !$results = simpletest_result_get($test_id)) {
    backdrop_set_message(t('No test results to display.'), 'error');
    backdrop_goto('admin/config/development/testing');
    return $form;
  }

  // Load all classes and include CSS.
  backdrop_add_css(backdrop_get_path('module', 'simpletest') . '/css/simpletest.css');

  // Keep track of which test cases passed or failed.
  $filter = array(
    'pass' => array(),
    'fail' => array(),
  );

  // Summary result fieldset.
  $form['result'] = array(
    '#type' => 'fieldset',
    '#title' => t('Results'),
  );
  $form['result']['summary'] = $summary = array(
    '#theme' => 'simpletest_result_summary',
    '#pass' => 0,
    '#fail' => 0,
    '#exception' => 0,
    '#debug' => 0,
  );

  // Cycle through each test group.
  $header = array(t('Message'), t('Group'), t('Filename'), t('Line'), t('Function'), array('colspan' => 2, 'data' => t('Status')));
  $form['result']['results'] = array();
  foreach ($results as $group => $assertions) {
    // Create group fieldset with summary information.
    $info = simpletest_test_get_by_class($group);
    $form['result']['results'][$group] = array(
      '#type' => 'fieldset',
      '#title' => $info['name'],
      '#description' => $info['description'],
      '#collapsible' => TRUE,
    );
    $form['result']['results'][$group]['summary'] = $summary;
    $group_summary = &$form['result']['results'][$group]['summary'];

    // Create table of assertions for the group.
    $rows = array();
    foreach ($assertions as $assertion) {
      $row = array();
      $row[] = strtoupper(str_replace('simpletest-', '', $assertion->status)) . ': ' . $assertion->message;
      $row[] = $assertion->message_group;
      $row[] = backdrop_basename($assertion->file);
      $row[] = $assertion->line;
      $row[] = $assertion->function;
      $row[] = simpletest_result_status_image($assertion->status);

      $class = 'simpletest-' . $assertion->status;
      if ($assertion->message_group == 'Debug') {
        $class = 'simpletest-debug';
      }
      $rows[] = array('data' => $row, 'class' => array($class));

      $group_summary['#' . $assertion->status]++;
      $form['result']['summary']['#' . $assertion->status]++;
    }
    $form['result']['results'][$group]['table'] = array(
      '#theme' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    );

    // Set summary information.
    $group_summary['#ok'] = $group_summary['#fail'] + $group_summary['#exception'] == 0;
    $form['result']['results'][$group]['#collapsed'] = $group_summary['#ok'];

    // Store test group (class) as for use in filter.
    $filter[$group_summary['#ok'] ? 'pass' : 'fail'][] = $group;
  }

  // Overal summary status.
  $form['result']['summary']['#ok'] = $form['result']['summary']['#fail'] + $form['result']['summary']['#exception'] == 0;

  // Actions.
  $form['#action'] = url('admin/config/development/testing/results/re-run');
  $form['action'] = array(
    '#type' => 'fieldset',
    '#title' => t('Actions'),
    '#attributes' => array('class' => array('container-inline')),
    '#weight' => -11,
  );

  $form['action']['filter'] = array(
    '#type' => 'select',
    '#title' => 'Filter',
    '#options' => array(
      'all' => t('All (@count)', array('@count' => count($filter['pass']) + count($filter['fail']))),
      'pass' => t('Pass (@count)', array('@count' => count($filter['pass']))),
      'fail' => t('Fail (@count)', array('@count' => count($filter['fail']))),
    ),
  );
  $form['action']['filter']['#default_value'] = ($filter['fail'] ? 'fail' : 'all');

  // Categorized test classes for to be used with selected filter value.
  $form['action']['filter_pass'] = array(
    '#type' => 'hidden',
    '#default_value' => implode(',', $filter['pass']),
  );
  $form['action']['filter_fail'] = array(
    '#type' => 'hidden',
    '#default_value' => implode(',', $filter['fail']),
  );

  $form['action']['op'] = array(
    '#type' => 'submit',
    '#value' => t('Run tests'),
  );

  $form['action']['return'] = array(
    '#type' => 'link',
    '#title' => t('Return to list'),
    '#href' => 'admin/config/development/testing',
  );

  if (is_numeric($test_id)) {
    simpletest_clean_results_table($test_id);
  }

  return $form;
}

/**
 * Re-run the tests that match the filter.
 */
function simpletest_result_form_submit($form, &$form_state) {
  $pass = $form_state['values']['filter_pass'] ? explode(',', $form_state['values']['filter_pass']) : array();
  $fail = $form_state['values']['filter_fail'] ? explode(',', $form_state['values']['filter_fail']) : array();

  if ($form_state['values']['filter'] == 'all') {
    $classes = array_merge($pass, $fail);
  }
  elseif ($form_state['values']['filter'] == 'pass') {
    $classes = $pass;
  }
  else {
    $classes = $fail;
  }

  if (!$classes) {
    $form_state['redirect'] = 'admin/config/development/testing';
    return;
  }

  $form_state_execute = array('values' => array());
  foreach ($classes as $class) {
    $form_state_execute['values']['tests'][$class] = 1;
  }

  simpletest_test_form_submit(array(), $form_state_execute);
  $form_state['redirect'] = $form_state_execute['redirect'];
}

/**
 * Get test results for $test_id.
 *
 * @param $test_id The test_id to retrieve results of.
 * @return Array of results grouped by test_class.
 */
function simpletest_result_get($test_id) {
  $results = db_select('simpletest')
    ->fields('simpletest')
    ->condition('test_id', $test_id)
    ->orderBy('test_class')
    ->orderBy('message_id')
    ->execute();

  $test_results = array();
  foreach ($results as $result) {
    if (!isset($test_results[$result->test_class])) {
      $test_results[$result->test_class] = array();
    }
    $test_results[$result->test_class][] = $result;
  }
  return $test_results;
}

/**
 * Get the appropriate image for the status.
 *
 * @param $status Status string, either: pass, fail, exception.
 * @return HTML image or false.
 */
function simpletest_result_status_image($status) {
  // $map does not use backdrop_static() as its value never changes.
  static $map;

  if (!isset($map)) {
    $map = array(
      'pass' => theme('image', array('uri' => 'core/misc/watchdog-ok.png', 'width' => 18, 'height' => 18, 'alt' => t('Pass'))),
      'fail' => theme('image', array('uri' => 'core/misc/watchdog-error.png', 'width' => 18, 'height' => 18, 'alt' => t('Fail'))),
      'exception' => theme('image', array('uri' => 'core/misc/watchdog-warning.png', 'width' => 18, 'height' => 18, 'alt' => t('Exception'))),
      'debug' => theme('image', array('uri' => 'core/misc/watchdog-warning.png', 'width' => 18, 'height' => 18, 'alt' => t('Debug'))),
    );
  }
  if (isset($map[$status])) {
    return $map[$status];
  }
  return FALSE;
}

/**
 * Provides settings form for SimpleTest variables.
 *
 * @ingroup forms
 * @see simpletest_settings_form_validate()
 * @see simpletest_settings_form_submit()
 */
function simpletest_settings_form($form, &$form_state) {
  $config = config('simpletest.settings');
  $form['general'] = array(
    '#type' => 'fieldset',
    '#title' => t('General'),
  );
  $form['general']['simpletest_clear_results'] = array(
    '#type' => 'checkbox',
    '#title' => t('Clear results after each complete test suite run'),
    '#description' => t('By default SimpleTest will clear the results after they have been viewed on the results page, but in some cases it may be useful to leave the results in the database. The results can then be viewed at <em>admin/config/development/testing/[test_id]</em>. The test ID can be found in the database, simpletest table, or kept track of when viewing the results the first time. Additionally, some modules may provide more analysis or features that require this setting to be disabled.'),
    '#default_value' => $config->get('simpletest_clear_results'),
  );
  $form['general']['simpletest_verbose'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provide verbose information when running tests'),
    '#description' => t('The verbose data will be printed along with the standard assertions and is useful for debugging. The verbose data will be erased between each test suite run. The verbose data output is very detailed and should only be used when debugging.'),
    '#default_value' => $config->get('simpletest_verbose'),
  );

  $form['httpauth'] = array(
    '#type' => 'fieldset',
    '#title' => t('HTTP authentication'),
    '#description' => t('HTTP auth settings to be used by the SimpleTest browser during testing. Useful when the site requires basic HTTP authentication.'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );
  $form['httpauth']['simpletest_httpauth_method'] = array(
    '#type' => 'select',
    '#title' => t('Method'),
    '#options' => array(
      CURLAUTH_BASIC => t('Basic'),
      CURLAUTH_DIGEST => t('Digest'),
      CURLAUTH_GSSNEGOTIATE => t('GSS negotiate'),
      CURLAUTH_NTLM => t('NTLM'),
      CURLAUTH_ANY => t('Any'),
      CURLAUTH_ANYSAFE => t('Any safe'),
    ),
    '#default_value' => $config->get('simpletest_method'),
  );
  $username = $config->get('simpletest_username');
  $password = $config->get('simpletest_password');
  $form['httpauth']['simpletest_httpauth_username'] = array(
    '#type' => 'textfield',
    '#title' => t('Username'),
    '#default_value' => $username,
  );
  if (!empty($username) && !empty($password)) {
    $form['httpauth']['simpletest_httpauth_username']['#description'] = t('Leave this blank to delete both the existing username and password.');
  }
  $form['httpauth']['simpletest_httpauth_password'] = array(
    '#type' => 'password',
    '#title' => t('Password'),
  );
  if ($password) {
    $form['httpauth']['simpletest_httpauth_password']['#description'] = t('To change the password, enter the new password here.');
  }

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration')
  );
  return $form;
}

/**
 * Form submission handler for simpletest_settings_form().
 */
function simpletest_settings_form_submit($form, &$form_state) {
  config('simpletest.settings')
    ->set('simpletest_clear_results', $form_state['values']['simpletest_clear_results'])
    ->set('simpletest_verbose', $form_state['values']['simpletest_verbose'])
    ->set('simpletest_method', $form_state['values']['simpletest_httpauth_method'])
    ->set('simpletest_username', $form_state['values']['simpletest_httpauth_username'])
    ->set('simpletest_password', $form_state['values']['simpletest_httpauth_password'])
    ->save();
  backdrop_set_message(t('The configuration options have been saved.'));
}

/**
 * Validation handler for simpletest_settings_form().
 */
function simpletest_settings_form_validate($form, &$form_state) {
  // If a username was provided but a password wasn't, preserve the existing
  // password.
  if (!empty($form_state['values']['simpletest_httpauth_username']) && empty($form_state['values']['simpletest_httpauth_password'])) {
    $form_state['values']['simpletest_httpauth_password'] = config_get('simpletest.settings', 'simpletest_password');
  }

  // If a password was provided but a username wasn't, the credentials are
  // incorrect, so throw an error.
  if (empty($form_state['values']['simpletest_httpauth_username']) && !empty($form_state['values']['simpletest_httpauth_password'])) {
    form_set_error('simpletest_httpauth_username', t('HTTP authentication credentials must include a username in addition to a password.'));
  }
}

