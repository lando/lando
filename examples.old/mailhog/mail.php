<?php

$to      = 'leiaorgana@rebellion.mil';
$subject = 'Where do you truly belong?';
$message = 'With us here among the clouds!';
$headers = 'From: Lando <lando@cloudcity.com>' . "\r\n" .
    'Reply-To: lando@cloudcity.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

if (mail($to, $subject, $message, $headers)) {
  print "Message sent!";
}
else {
  print "Error sending mail. Must be jamming us!";
}

?>

<a href="index.php">GO BACK</a>
