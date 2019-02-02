<?php

  // JSON decode LANDO INFO
  $info = json_decode(getenv('LANDO_INFO'), TRUE);

  // Ensure all the keys are non-numerical
  foreach ($info as $key => $value) {
    if (is_numeric($key)) {
      throw new Exception('Numeric key detected! TROUBLE TROUBLE TROUBLE!');
    }
  }

