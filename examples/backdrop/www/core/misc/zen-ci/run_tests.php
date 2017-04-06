<?php
/**
 * @file
 * This script file is executed on the Zen.ci platform for running tests.
 *
 * This essentially just wraps around the run-tests.sh script and uses the
 * result to post the response back to Zen.ci.
 *
 * This script is called by the gitlc.yml file on backdropcms.org:
 * https://github.com/backdrop-ops/backdropcms.org/tree/master/www/modules/custom/borg_qa
 */

$home = getenv('HOME');


$sitepath = $home . '/www';

$data = array(
  'state' => 'pending',
  'message' => 'Processing Tests',
);

zenci_put_request($data);

chdir($sitepath);

$cmd = 'php core/scripts/run-tests.sh --url http://localhost --verbose --cache --force --all --concurrency 10 --color --verbose --summary /tmp/summary';
$proc = popen($cmd, 'r');

while (!feof($proc)) {
  echo fread($proc, 4096);
  @flush();
}

$status = pclose($proc);

$content = file_get_contents('/tmp/summary');

if ($status) {
  $content = explode("\n", $content);
  
  $message = $content[0];
  unset($content[0]);
  $summary = implode("\n", $content);
  // Test failed.
  $data = array(
    'state' => 'error',
    'message' => $message,
    'summary' => $summary,
  );
  zenci_put_request($data);
  exit(1);
}
else {
  // Success.
  $data = array(
    'state' => 'success',
    'message' => $content,
  );
  zenci_put_request($data);
  exit(0);
}

/**
 * Submit a POST request to Zen.ci updating its current status.
 *
 * @param array $data
 *   An array of data to push to Zen.ci. Should include the following:
 *   - state: One of "error", "success", or "pending".
 *   - message: A string summary of the state.
 *   - summary: Optional. A longer description of the state.
 */
function zenci_put_request($data) {
  $token = getenv('GITLC_API_TOKEN');
  $status_url = getenv('GITLC_STATUS_URL');
  
  $data = json_encode($data);
  
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_URL, $status_url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT"); // Note the PUT here.

  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_HEADER, true);
  
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
      'Content-Type: application/json',
      'Token: ' . $token,                                                                                
      'Content-Length: ' . strlen($data)                                                                       
  )); 
  curl_exec($ch);
  curl_close($ch);
}
