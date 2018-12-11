<?php

  $info = json_decode(getenv('LANDO_INFO'), TRUE);

?>

<pre>
  <?php print_r($info); ?>
</pre>
