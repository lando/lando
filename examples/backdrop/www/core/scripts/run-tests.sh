#!/usr/bin/env php
<?php
/**
 * @file
 * This script runs Backdrop tests from command line.
 *
 *
 *  Run Backdrop tests from the shell.
 *
 *  Usage:        ./run-tests.sh [OPTIONS] <testClassNames>
 *  Example:      ./run-tests.sh --url="http://backdrop" BootstrapPageCacheTestCase
 *
 *  All arguments are long options.
 *
 * @code
 *  --help      Print this page.
 *
 *  --list      Display all available test groups.
 *
 *  --clean     Cleans up database tables or directories from previous, failed,
 *              tests and then exits (no tests are run).
 *
 *  --url       Immediately precedes a URL to set the host and path. You will
 *              need this parameter if Backdrop is in a subdirectory on your
 *              localhost and you have not set \$base_url in settings.php. Tests
 *              can be run under SSL by including https:// in the URL.
 *
 *  --php       The absolute path to the PHP executable. Usually not needed.
 *
 *  --concurrency [num]
 *
 *              Run tests in parallel, up to [num] tests at a time.
 *
 * --split [fraction]
 *
 *              Run a portion of the specified tests. e.g. "1/4" would run the
 *              first quarter of the tests. "2/4" would run the second quarter.
 *              Intended to be used when running tests across multiple hosts.
 *
 *  --force     Enable the Simpletest module if it's not enabled already.
 *
 *  --all       Run all available tests.
 *
 *  --group     Run tests identified by specific group names, instead of class names.
 *
 *  --file      Run tests identified by specific file names, instead of class names.
 *              Specify the path and the extension
 *              (i.e. 'core/modules/user/user.test').
 *
 *
 *  --directory <path>
 *
 *              Run all tests found within the specified file directory.
 *
 *  --xml       <path>
 *
 *              If provided, test results will be written as xml files to this path.
 *
 *  --color     Output text format results with color highlighting.
 *
 *  --verbose   Output detailed assertion messages in addition to summary.
 *
 *  --summary [file]
 *
 *              Output errors and exception messages to summary file.
 *
 *  <test1>[ <test2>[ <test3> ...]]
 *
 *              One or more tests classes (or groups names) to be run. Names may
 *              be separated by spaces or commas.
 * @endcode
 *
 *  To run this script you will normally invoke it from the root directory of your
 *  Backdrop installation as the webserver user (differs per configuration), or root:
 *    --url http://example.com/ BlockTestCase
 *
 *  @code
 *    sudo -u [wwwrun|www-data|etc] ./core/scripts/run-tests.sh --url http://example.com/ --all
 *    sudo -u [wwwrun|www-data|etc] ./core/scripts/run-tests.sh --url http://example.com/ BlockTestCase
 *  @endcode
 */

define('SIMPLETEST_SCRIPT_COLOR_PASS', 32);
define('SIMPLETEST_SCRIPT_COLOR_FAIL', 31);
define('SIMPLETEST_SCRIPT_COLOR_EXCEPTION', 33);

// Set defaults and get overrides.
list($args, $count) = simpletest_script_parse_args();

if ($args['help'] || $count == 0) {
  simpletest_script_help();
  exit(0);
}

if ($args['execute-test']) {
  // Masquerade as Apache for running tests.
  simpletest_script_init("Apache");
  simpletest_script_run_one_test($args['test-id'], $args['execute-test']);
}
else {
  // Run administrative functions as CLI.
  simpletest_script_init(NULL);
}

// Check if Backdrop is installed.
backdrop_bootstrap(BACKDROP_BOOTSTRAP_CONFIGURATION);
if (!backdrop_bootstrap_is_installed()) {
  echo "Backdrop must be installed before running tests.\n";
  exit(1);
}

// Bootstrap to perform initial validation or other operations.
backdrop_bootstrap(BACKDROP_BOOTSTRAP_FULL);
if ($args['force']) {
  if (module_exists('simpletest')) {
    echo "Simpletest already installed.\n";
  }
  else {
    module_enable(array('simpletest'));
    echo "Simpletest module enabled.\n";
  }
}
elseif (!module_exists('simpletest')) {
  simpletest_script_print_error("The simpletest module must be enabled before this script can run.");
  exit(1);
}

if ($args['clean']) {
  // Clean up left-over times and directories.
  simpletest_clean_environment();
  echo "\nEnvironment cleaned.\n";

  // Get the status messages and print them.
  $messages = array_pop(backdrop_get_messages('status'));
  foreach ($messages as $text) {
    echo " - " . $text . "\n";
  }

  // Clean up profiles cache tables.
  simpletest_script_clean_profile_cache_tables();
  echo "\nProfile cache tables cleaned.\n";

  // Get the status messages and print them.
  $messages = array_pop(backdrop_get_messages('status'));
  foreach ($messages as $text) {
    echo " - " . $text . "\n";
  }

  // Clean up profiles cache folders.
  simpletest_script_clean_profile_cache_folders();
  echo "\nProfile cache folders cleaned.\n";

  // Get the status messages and print them.
  $messages = array_pop(backdrop_get_messages('status'));
  foreach ($messages as $text) {
    echo " - " . $text . "\n";
  }

  exit(0);
}

// Load SimpleTest files.
$groups = simpletest_test_get_all();
$all_tests = array();
foreach ($groups as $group => $tests) {
  $all_tests = array_merge($all_tests, array_keys($tests));
}
$test_list = array();

if ($args['list']) {
  // Display all available tests.
  echo "\nAvailable test groups & classes\n";
  echo   "-------------------------------\n\n";
  foreach ($groups as $group => $tests) {
    echo $group . "\n";
    foreach ($tests as $class => $info) {
      echo " - " . $info['name'] . ' (' . $class . ')' . "\n";
    }
  }
  exit(0);
}

// Generate cache tables for profiles.
if ($args['cache']) {
  $profiles = array(
    'minimal',
    'standard',
    'testing',
  );

  simpletest_script_init(NULL);

  echo "\nPreparing database and configuration cache for profiles\n";
  foreach($profiles as $profile){
    simpletest_script_prepare_profile_cache($profile);
    echo " - " . $profile . " - " . "ready\n";

  }
}

$test_list = simpletest_script_get_test_list();

// Try to allocate unlimited time to run the tests.
backdrop_set_time_limit(0);

simpletest_script_reporter_init();

// Setup database for test results.
$test_id = db_query("SELECT MAX(test_id) FROM {simpletest_prefix}")->fetchField() + 1;

// Execute tests.
simpletest_script_execute_batch($test_id, simpletest_script_get_test_list());

// Retrieve the last database prefix used for testing and the last test class
// that was run from. Use the information to read the log file in case any
// fatal errors caused the test to crash.
list($last_prefix, $last_test_class) = simpletest_last_test_get($test_id);
simpletest_log_read($test_id, $last_prefix, $last_test_class);

// Stop the timer.
simpletest_script_reporter_timer_stop();

$status_code = simpletest_script_result_status_code();

// Display results before database is cleared.
simpletest_script_reporter_display_results();

if ($args['xml']) {
  simpletest_script_reporter_write_xml_results();
}

if($args['summary']) {
  simpletest_script_write_summary($args['summary']);
}

// Cleanup our test results.
simpletest_clean_results_table($test_id);

// Test complete, exit.
exit($status_code);

/**
 * Print help text.
 */
function simpletest_script_help() {
  global $args;

  echo <<<EOF

Run Backdrop tests from the shell.

Usage:        {$args['script']} [OPTIONS] <testClassNames>
Example:      {$args['script']} --url="http://backdrop" BootstrapPageCacheTestCase

All arguments are long options.

  --help      Print this page.

  --list      Display all available test groups.

  --clean     Cleans up database tables or directories from previous, failed,
              tests and then exits (no tests are run).

  --url       Immediately precedes a URL to set the host and path. You will
              need this parameter if Backdrop is in a subdirectory on your
              localhost and you have not set \$base_url in settings.php. Tests
              can be run under SSL by including https:// in the URL.

  --php       The absolute path to the PHP executable. Usually not needed.

  --concurrency [num]

              Run tests in parallel, up to [num] tests at a time.

  --force     Enable the Simpletest module if it's not enabled already.

  --all       Run all available tests.

  --group     Run tests identified by specific group names, instead of class names.

  --file      Run tests identified by specific file names, instead of class names.
              Specify the path and the extension
              (i.e. 'core/modules/user/user.test').
              
  --directory <path>

              Run all tests found within the specified file directory.

  --xml       <path>

              If provided, test results will be written as xml files to this path.

  --color     Output text format results with color highlighting.

  --verbose   Output detailed assertion messages in addition to summary.

  --cache     Generate cache for instalation profiles to boost tests speed.

  --summary [file]

              Output errors and exception messages to summary file.


  <test1>[ <test2>[ <test3> ...]]

              One or more tests classes (or groups names) to be run. Names may
              be separated by spaces or commas.

To run this script you will normally invoke it from the root directory of your
Backdrop installation as the webserver user (differs per configuration), or root:

sudo -u [wwwrun|www-data|etc ./core/scripts/{$args['script']}
  --url http://example.com/ --all
sudo -u [wwwrun|www-data|etc] ./core/scripts/{$args['script']}
  --url http://example.com/ BlockTestCase
\n
EOF;
}

/**
 * Parse execution argument and ensure that all are valid.
 *
 * @return The list of arguments.
 */
function simpletest_script_parse_args() {
  // Set default values.
  $args = array(
    'script' => '',
    'help' => FALSE,
    'list' => FALSE,
    'clean' => FALSE,
    'url' => '',
    'php' => '',
    'concurrency' => 1,
    'cache' => FALSE,
    'split' => '',
    'force' => FALSE,
    'all' => FALSE,
    'class' => FALSE,
    'group' => FALSE,
    'file' => FALSE,
    'color' => FALSE,
    'verbose' => FALSE,
    'test_names' => array(),
    // Used internally.
    'test-id' => 0,
    'execute-test' => '',
    'xml' => '',
    'summary' => '',
    'directory' => NULL,
  );

  // Override with set values.
  $args['script'] = basename(array_shift($_SERVER['argv']));

  $count = 0;
  while ($arg = array_shift($_SERVER['argv'])) {
    // Separate option values using "=".
    $arg_value = NULL;
    if (strpos($arg, '=') !== FALSE) {
      list($arg, $arg_value) = explode('=', $arg);
    }
    // Convert each option into a ordered set of arguments.
    if (preg_match('/--(\S+)/', $arg, $matches)) {
      $arg_name = $matches[1];
      // Argument found.
      if (array_key_exists($arg_name, $args)) {
        // Argument found in list.
        // Convert incoming boolean flags based on the default values.
        if (is_bool($args[$arg_name])) {
          $args[$arg_name] = TRUE;
        }
        // If using = assignment, use the value.
        elseif (!is_null($arg_value)) {
          $args[$arg_name] = $arg_value;
        }
        // Otherwise, a space was used for assignment, pull the next argument.
        else {
          $args[$arg_name] = array_shift($_SERVER['argv']);
        }
        $count++;
      }
      else {
        // Argument not found in list.
        simpletest_script_print_error("Unknown argument '$arg'.");
        exit(1);
      }
    }
    else {
      // Values found without an argument should be test names.
      $args['test_names'] += array_merge($args['test_names'], explode(',', $arg));
      $count++;
    }
  }

  // Validate the concurrency argument.
  if (!is_numeric($args['concurrency']) || $args['concurrency'] <= 0) {
    simpletest_script_print_error("--concurrency must be a strictly positive integer.");
    exit(1);
  }

  // Validate the split argument.
  if ($args['split']) {
    @list($part, $total) = explode('/', $args['split']);
    if (!is_numeric($part) || !is_numeric($total)) {
      simpletest_script_print_error("--split must be specified as a fraction, e.g. 1/4, 2/4, etc.");
      exit(1);
    }
  }

  return array($args, $count);
}

/**
 * Initialize script variables and perform general setup requirements.
 */
function simpletest_script_init($server_software) {
  global $args, $php;

  $host = 'localhost';
  $path = '';
  // Determine location of php command automatically, unless a command line argument is supplied.
  if (!empty($args['php'])) {
    $php = $args['php'];
  }
  elseif ($php_env = getenv('_')) {
    // '_' is an environment variable set by the shell. It contains the command that was executed.
    $php = $php_env;
  }
  elseif ($sudo = getenv('SUDO_COMMAND')) {
    // 'SUDO_COMMAND' is an environment variable set by the sudo program.
    // Extract only the PHP interpreter, not the rest of the command.
    list($php, ) = explode(' ', $sudo, 2);
  }
  elseif ($php_exec = exec('which php')) {
    $php = $php_exec;
  }
  else {
    simpletest_script_print_error('Unable to automatically determine the path to the PHP interpreter. Supply the --php command line argument.');
    simpletest_script_help();
    exit(0);
  }

  // Get URL from arguments.
  if (!empty($args['url'])) {
    $parsed_url = parse_url($args['url']);
    $host = $parsed_url['host'] . (isset($parsed_url['port']) ? ':' . $parsed_url['port'] : '');
    $path = isset($parsed_url['path']) ? $parsed_url['path'] : '';

    // If the passed URL schema is 'https' then setup the $_SERVER variables
    // properly so that testing will run under HTTPS.
    if ($parsed_url['scheme'] == 'https') {
      $_SERVER['HTTPS'] = 'on';
    }
  }

  $_SERVER['HTTP_HOST'] = $host;
  $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
  $_SERVER['SERVER_ADDR'] = '127.0.0.1';
  $_SERVER['SERVER_SOFTWARE'] = $server_software;
  $_SERVER['SERVER_NAME'] = 'localhost';
  $_SERVER['REQUEST_URI'] = $path .'/';
  $_SERVER['REQUEST_METHOD'] = 'GET';
  $_SERVER['SCRIPT_NAME'] = $path .'/index.php';
  $_SERVER['PHP_SELF'] = $path .'/index.php';
  $_SERVER['HTTP_USER_AGENT'] = 'Backdrop command line';

  if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
    // Ensure that any and all environment variables are changed to https://.
    foreach ($_SERVER as $key => $value) {
      $_SERVER[$key] = str_replace('http://', 'https://', $_SERVER[$key]);
    }
  }

  /**
   * Defines the root directory of the Backdrop installation.
   *
   * The dirname() function is used to get path to Backdrop root folder, which
   * avoids resolving of symlinks. This allows the code repository to be a symlink
   * and hosted outside of the web root. See issue #1297.
   *
   * The realpath is important here to avoid FAILURE with filetransfer.tests. 
   * When realpath used, BACKDROP_ROOT contain full path to backdrop root folder.
   */
  define('BACKDROP_ROOT', realpath(dirname(dirname(dirname($_SERVER['SCRIPT_FILENAME'])))));

  // Change the directory to the Backdrop root.
  chdir(BACKDROP_ROOT);

  require_once BACKDROP_ROOT . '/core/includes/bootstrap.inc';
}

/**
 * Execute a batch of tests.
 */
function simpletest_script_execute_batch($test_id, $test_classes) {
  global $args;

  // Multi-process execution.
  $children = array();
  while (!empty($test_classes) || !empty($children)) {
    while (count($children) < $args['concurrency']) {
      if (empty($test_classes)) {
        break;
      }

      // Fork a child process.
      $test_class = array_shift($test_classes);
      $command = simpletest_script_command($test_id, $test_class);
      $process = proc_open($command, array(), $pipes, NULL, NULL, array('bypass_shell' => TRUE));

      if (!is_resource($process)) {
        simpletest_script_print_error('Unable to fork test process. Aborting.');
        exit(1);
      }

      // Register our new child.
      $children[] = array(
        'process' => $process,
        'class' => $test_class,
        'pipes' => $pipes,
      );
    }

    // Wait for children every 200ms.
    usleep(200000);

    // Check if some children finished.
    foreach ($children as $cid => $child) {
      $status = proc_get_status($child['process']);
      if (empty($status['running'])) {
        // The child exited, unregister it.
        proc_close($child['process']);
        if ($status['exitcode']) {
          simpletest_script_print_error('FATAL ' . $test_class . ': test runner returned a non-zero error code (' . $status['exitcode'] . ').');
        }
        unset($children[$cid]);
      }
    }
  }
}

/**
 * Bootstrap Backdrop and run a single test.
 */
function simpletest_script_run_one_test($test_id, $test_class) {
  try {
    // Bootstrap Backdrop. Disable the fast return of the page cache.
    backdrop_page_is_cacheable(FALSE);
    backdrop_bootstrap(BACKDROP_BOOTSTRAP_FULL);
    backdrop_page_is_cacheable(TRUE);

    $info = simpletest_test_get_by_class($test_class);
    include_once BACKDROP_ROOT . '/' . $info['file path'] . '/' . $info['file'];
    $test = new $test_class($test_id);
    $test->run();

    $had_fails = (isset($test->results['#fail']) && $test->results['#fail'] > 0);
    $had_exceptions = (isset($test->results['#exception']) && $test->results['#exception'] > 0);
    $status = ($had_fails || $had_exceptions ? 'fail' : 'pass');
    simpletest_script_print($info['group'] . ': ' . $info['name'] . ' (' . $test_class . ') ' . _simpletest_format_summary_line($test->results) . "\n", $status);

    // Finished, kill this runner.
    exit(0);
  }
  catch (Exception $e) {
    simpletest_script_print_error((string) $e);
    exit(1);
  }
}

/**
 * Return a command used to run a test in a separate process.
 *
 * @param $test_id
 *  The current test ID.
 * @param $test_class
 *  The name of the test class to run.
 */
function simpletest_script_command($test_id, $test_class) {
  global $args, $php;

  $command = escapeshellarg($php) . ' ' . escapeshellarg('./core/scripts/' . $args['script']) . ' --url ' . escapeshellarg($args['url']);
  if ($args['color']) {
    $command .= ' --color';
  }
  $command .= " --php " . escapeshellarg($php) . " --test-id $test_id --execute-test $test_class";
  return $command;
}

/**
 * Get list of tests based on arguments. If --all specified then
 * returns all available tests, otherwise reads list of tests.
 *
 * Will print error and exit if no valid tests were found.
 *
 * @return List of tests.
 */
function simpletest_script_get_test_list() {
  global $args, $all_tests, $groups;

  $test_list = array();
  if ($args['all']) {
    $test_list = $all_tests;
  }
  else {
    if ($args['file']) {
      $files = array();
      foreach ($args['test_names'] as $file) {
        $files[backdrop_realpath($file)] = 1;
      }

      // Check for valid class names.
      foreach ($all_tests as $class_name) {
        $refclass = new ReflectionClass($class_name);
        $file = $refclass->getFileName();
        if (isset($files[$file])) {
          $test_list[] = $class_name;
        }
      }
    }
    elseif ($args['directory']) {
      // Extract test case class names from specified directory.
      $files = array();
      if ($args['directory'][0] === '/') {
        $directory = $args['directory'];
      }
      else {
        $directory = BACKDROP_ROOT . "/" . $args['directory'];
      }
      
      $all_classes = array();
      foreach ($groups as $group) {
        $all_classes = array_merge($all_classes, array_keys($group));
      }

      foreach (file_scan_directory($directory, '/\.test$/') as $file) {
        $content = file_get_contents($file->uri);
        preg_match_all('@^class ([^ ]+)@m', $content, $matches);
        foreach ($matches[1] as $test_class) {
          if(in_array($test_class, $all_classes)) {
            $test_list[] = $test_class;
          }
        }
      }
    }
    elseif ($args['group']) {
      // Check for valid group names and get all valid classes in group.
      foreach ($args['test_names'] as $group_name) {
        if (isset($groups[$group_name])) {
          $test_list = array_merge($test_list, array_keys($groups[$group_name]));
        }
        else {
          simpletest_script_print_error('Test group not found: ' . $group_name);
          simpletest_script_print_alternatives($group_name, array_keys($groups));
          exit(1);
        }
      }
    }
    else {
      // Check for valid class names.
      $test_list = array();
      $groups = simpletest_test_get_all();
      $all_classes = array();
      foreach ($groups as $group) {
        $all_classes = array_merge($all_classes, array_keys($group));
      }
      foreach ($args['test_names'] as $test_class) {
        if (in_array($test_class, $all_classes)) {
          $test_list[] = $test_class;
        }
        else {
          simpletest_script_print_error('Test class not found: ' . $test_class);
          simpletest_script_print_alternatives($test_class, $all_classes, 6);
          exit(1);
        }
      }
    }
  }

  // Split into the fraction portion. e.g 1/4 would run the first quarter, or
  // 2/4 would run the second quarter.
  if ($args['split']) {
    list($current_part, $part_total) = explode('/', $args['split']);
    $part_length = ceil(count($test_list) * (1/$part_total));
    $part_start = ($current_part - 1) * $part_length;
    $part_end = $current_part * $part_length;
    // Ensure part end isn't more than the total test count.
    $part_end = ($part_end > count($test_list)) ? count($test_list) : $part_end;
    $current = $part_start;
    $partial_test_list = array();
    while ($current < $part_end) {
      $partial_test_list[$current] = $test_list[$current];
      $current++;
    }
    $test_list = $partial_test_list;
  }

  if (empty($test_list)) {
    simpletest_script_print_error('No valid tests were specified.');
    exit(0);
  }
  return $test_list;
}

/**
 * Initialize the reporter.
 */
function simpletest_script_reporter_init() {
  global $args, $all_tests, $test_list, $results_map;

  $results_map = array(
    'pass' => 'Pass',
    'fail' => 'Fail',
    'exception' => 'Exception'
  );

  echo "\n";
  echo "Backdrop test run\n";
  echo "---------------\n";
  echo "\n";

  // Tell the user about what tests are to be run.
  if ($args['all']) {
    $part_message = '';
    if ($args['split']) {
      list($part, $total) = explode('/', $args['split']);
      $part_message = " (part $part of $total)";
    }
    echo "All tests will run$part_message.\n\n";
  }
  else {
    echo "Tests to be run:\n";
    foreach ($test_list as $class_name) {
      $info = simpletest_test_get_by_class($class_name);
      echo " - " . $info['name'] . ' (' . $class_name . ')' . "\n";
    }
    echo "\n";
  }

  echo "Test run started:\n";
  echo " " . format_date($_SERVER['REQUEST_TIME'], 'long') . "\n";
  timer_start('run-tests');
  echo "\n";

  echo "Test summary\n";
  echo "------------\n";
  echo "\n";
}

/**
 * Write a summary of any test failures to a separate file.
 *
 * @param string $summary_file
 *   The path to a file to which the summary will be written.
 */
function simpletest_script_write_summary($summary_file) {
  global $test_list, $args, $test_id, $results_map;

  $summary = '';
  $results = db_query("SELECT * FROM {simpletest} WHERE test_id = :test_id AND (status = 'exception' OR status = 'fail') ORDER BY test_class, message_id", array(':test_id' => $test_id));
  $test_class = '';
  $count = 0;
  foreach ($results as $result) {
    if (isset($results_map[$result->status])) {
      if ($result->test_class != $test_class) {
        // Display test class every time results are for new test class.
        $test_class = $result->test_class;
        $info = simpletest_test_get_by_class($test_class);
        $test_group = $info['group'];
        $test_name = $info['name'];
        $summary .= "\n$test_group: $test_name ($test_class)\n";
        $test_class = $result->test_class;
      }
      
      if($count < 10 ){
        $summary .= " - `" . $result->status . "` " . trim(strip_tags($result->message)) . ' **' . basename($result->file) . '**:' . $result->line . "\n";
      }
      $count++;
    }
  }
  
  if($count > 10 ){
    $summary .= "\nResult limited to first 10 items. More details are available from the full log.\n";
  }
  
  $total_count = db_query("SELECT COUNT(*) FROM {simpletest} WHERE test_id = :test_id AND status IN ('fail', 'pass')", array(':test_id' => $test_id))->fetchField();
  if(!empty($summary)){
    $summary = format_plural($count, '1 of !total_count tests failed', '@count of !total_count tests failed.', array('!total_count' => $total_count)) . "\n" . $summary;
  } 
  else{
    $summary = format_plural($total_count, '1 test passed', '@count tests passed.');
  }
  file_put_contents($summary_file, $summary);
}

/**
 * Display jUnit XML test results.
 */
function simpletest_script_reporter_write_xml_results() {
  global $args, $test_id, $results_map;

  $results = db_query("SELECT * FROM {simpletest} WHERE test_id = :test_id ORDER BY test_class, message_id", array(':test_id' => $test_id));

  $test_class = '';
  $xml_files = array();

  foreach ($results as $result) {
    if (isset($results_map[$result->status])) {
      if ($result->test_class != $test_class) {
        // We've moved onto a new class, so write the last classes results to a file:
        if (isset($xml_files[$test_class])) {
          file_put_contents($args['xml'] . '/' . $test_class . '.xml', $xml_files[$test_class]['doc']->saveXML());
          unset($xml_files[$test_class]);
        }
        $test_class = $result->test_class;
        if (!isset($xml_files[$test_class])) {
          $doc = new DomDocument('1.0');
          $root = $doc->createElement('testsuite');
          $root = $doc->appendChild($root);
          $xml_files[$test_class] = array('doc' => $doc, 'suite' => $root);
        }
      }

      // For convenience:
      $dom_document = &$xml_files[$test_class]['doc'];

      // Create the XML element for this test case:
      $case = $dom_document->createElement('testcase');
      $case->setAttribute('classname', $test_class);
      list($class, $name) = explode('->', $result->function, 2);
      $case->setAttribute('name', $name);

      // Passes get no further attention, but failures and exceptions get to add more detail:
      if ($result->status == 'fail') {
        $fail = $dom_document->createElement('failure');
        $fail->setAttribute('type', 'failure');
        $fail->setAttribute('message', $result->message_group);
        $text = $dom_document->createTextNode($result->message);
        $fail->appendChild($text);
        $case->appendChild($fail);
      }
      elseif ($result->status == 'exception') {
        // In the case of an exception the $result->function may not be a class
        // method so we record the full function name:
        $case->setAttribute('name', $result->function);

        $fail = $dom_document->createElement('error');
        $fail->setAttribute('type', 'exception');
        $fail->setAttribute('message', $result->message_group);
        $full_message = $result->message . "\n\nline: " . $result->line . "\nfile: " . $result->file;
        $text = $dom_document->createTextNode($full_message);
        $fail->appendChild($text);
        $case->appendChild($fail);
      }
      // Append the test case XML to the test suite:
      $xml_files[$test_class]['suite']->appendChild($case);
    }
  }
  // The last test case hasn't been saved to a file yet, so do that now:
  if (isset($xml_files[$test_class])) {
    file_put_contents($args['xml'] . '/' . $test_class . '.xml', $xml_files[$test_class]['doc']->saveXML());
    unset($xml_files[$test_class]);
  }
}

/**
 * Stop the test timer.
 */
function simpletest_script_reporter_timer_stop() {
  echo "\n";
  $end = timer_stop('run-tests');
  echo "Test run duration: " . format_interval($end['time'] / 1000);
  echo "\n\n";
}

/**
 * Check if this test run had any failures.
 */
function simpletest_script_result_status_code() {
  global $test_id;
  $errorCount = db_query("SELECT COUNT(*) FROM {simpletest} WHERE test_id = :test_id AND (status = 'exception' OR status = 'fail')", array(':test_id' => $test_id))->fetchField();
  return $errorCount > 0 ? 1 : 0;
}

/**
 * Display test results.
 */
function simpletest_script_reporter_display_results() {
  global $args, $test_id, $results_map;

  if ($args['verbose']) {
    // Report results.
    echo "Detailed test results\n";
    echo "---------------------\n";

    $results = db_query("SELECT * FROM {simpletest} WHERE test_id = :test_id AND (status = 'exception' OR status = 'fail') ORDER BY test_class, message_id", array(':test_id' => $test_id));
    $test_class = '';
    foreach ($results as $result) {
      if (isset($results_map[$result->status])) {
        if ($result->test_class != $test_class) {
          // Display test class every time results are for new test class.
          $test_class = $result->test_class;
          $info = simpletest_test_get_by_class($test_class);
          $test_group = $info['group'];
          $test_name = $info['name'];
          echo "\n\n---- $test_group: $test_name ($test_class) ----\n\n\n";
          $test_class = $result->test_class;

          // Print table header.
          echo "Status    Group      Filename          Line Function                            \n";
          echo "--------------------------------------------------------------------------------\n";
        }

        simpletest_script_format_result($result);
      }
    }
  }
}

/**
 * Format the result so that it fits within the default 80 character
 * terminal size.
 *
 * @param $result The result object to format.
 */
function simpletest_script_format_result($result) {
  global $results_map, $color;

  $summary = sprintf("%-9.9s %-10.10s %-17.17s %4.4s %-35.35s\n",
    $results_map[$result->status], $result->message_group, basename($result->file), $result->line, $result->function);

  simpletest_script_print($summary, $result->status);

  $lines = explode("\n", wordwrap(trim(strip_tags(decode_entities($result->message))), 76));
  foreach ($lines as $line) {
    echo "    $line\n";
  }
}

/**
 * Print error message prefixed with "ERROR: " and displayed in fail color
 * if color output is enabled.
 *
 * @param $message The message to print.
 */
function simpletest_script_print_error($message) {
  simpletest_script_print("ERROR: $message\n", 'fail');
}

/**
 * Print a message to the console, if color is enabled then the specified
 * color code will be used.
 *
 * @param $message The message to print.
 * @param $status One of the following:
 *   - pass
 *   - debug
 *   - exception
 *   - fail
 */
function simpletest_script_print($message, $status) {
  global $args;
  if ($args['color']) {
    $color_code = simpletest_script_color_code($status);
    $message = "\033[" . $color_code . "m" . $message . "\033[0m";
  }
  // For fails and exceptions, print to the error log.
  if ($status === 'fail' || $status === 'exception') {
    fwrite(STDERR, $message);
  }
  else {
    echo $message;
  }
}

/**
 * Get the color code associated with the specified status.
 *
 * @param $status The status string to get code for.
 * @return Color code.
 */
function simpletest_script_color_code($status) {
  switch ($status) {
    case 'pass':
      return SIMPLETEST_SCRIPT_COLOR_PASS;
    case 'fail':
      return SIMPLETEST_SCRIPT_COLOR_FAIL;
    case 'exception':
      return SIMPLETEST_SCRIPT_COLOR_EXCEPTION;
  }
  return 0; // Default formatting.
}

/**
 * Prints alternative test names.
 *
 * Searches the provided array of string values for close matches based on the
 * Levenshtein algorithm.
 *
 * @see http://php.net/manual/en/function.levenshtein.php
 *
 * @param string $string
 *   A string to test.
 * @param array $array
 *   A list of strings to search.
 * @param int $degree
 *   The matching strictness. Higher values return fewer matches. A value of
 *   4 means that the function will return strings from $array if the candidate
 *   string in $array would be identical to $string by changing 1/4 or fewer of
 *   its characters.
 */
function simpletest_script_print_alternatives($string, $array, $degree = 4) {
  $alternatives = array();
  foreach ($array as $item) {
    $lev = levenshtein($string, $item);
    if ($lev <= strlen($item) / $degree || FALSE !== strpos($string, $item)) {
      $alternatives[] = $item;
    }
  }
  if (!empty($alternatives)) {
    simpletest_script_print("  Did you mean?\n", SIMPLETEST_SCRIPT_COLOR_FAIL);
    foreach ($alternatives as $alternative) {
      simpletest_script_print("  - $alternative\n", SIMPLETEST_SCRIPT_COLOR_FAIL);
    }
  }
}

/**
 * Removes cached profile tables from the database.
 */
function simpletest_script_clean_profile_cache_tables(){
  $tables = db_find_tables(Database::getConnection()->prefixTables('{simpletest_cache_}') . '%');
  $count = 0;
  foreach ($tables as $table) {
    db_drop_table($table);
    $count++;
  }

  if ($count > 0) {
    backdrop_set_message(format_plural($count, 'Removed 1 profile cache table.', 'Removed @count profile cache tables.'));
  }
  else {
    backdrop_set_message(t('No profile cache tables to remove.'));
  }
}

/**
 * Removes cached profile folders from the database.
 */
function simpletest_script_clean_profile_cache_folders(){
  $profiles = array(
    'minimal',
    'standard',
    'testing',
  );

  $file_public_path = config_get('system.core', 'file_public_path', 'files');

  foreach($profiles as $profile) {
    // Delete temporary files directory.
    file_unmanaged_delete_recursive($file_public_path . '/simpletest/simpletest_cache_' . $profile);
    backdrop_set_message(t('Cleared cache folder for profile !profile.', array('!profile' => $profile)));
  }
}

/**
 * Removed profile cached tables from the database.
 */
function simpletest_script_prepare_profile_cache($profile){
  try {
    backdrop_page_is_cacheable(FALSE);
    backdrop_bootstrap(BACKDROP_BOOTSTRAP_FULL);
    backdrop_page_is_cacheable(TRUE);

    require_once BACKDROP_ROOT . '/core/modules/simpletest/backdrop_web_test_case_cache.php';

    $test = new BackdropWebTestCaseCache();
    $test->setProfile($profile);
    if (!$test->isCached()) {
      $test->prepareCache();
    }
  }
  catch (Exception $e) {
    simpletest_script_print_error($e->getMessage());
    exit(1);
  }
}
