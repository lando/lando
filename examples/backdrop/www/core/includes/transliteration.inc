<?php
/**
 * @file
 * Transliteration processing functions.
 */

/**
 * Transliterates UTF-8 encoded text to US-ASCII.
 *
 * Based on Mediawiki's UtfNormal::quickIsNFCVerify().
 *
 * @param $string
 *   UTF-8 encoded text input.
 * @param $unknown
 *   Replacement string for characters that do not have a suitable ASCII
 *   equivalent.
 * @param $source_langcode
 *   Optional ISO 639 language code that denotes the language of the input and
 *   is used to apply language-specific variations. If the source language is
 *   not known at the time of transliteration, it is recommended to set this
 *   argument to the site default language to produce consistent results.
 *   Otherwise the current display language will be used.
 * @return
 *   Transliterated text.
 */
function _transliteration_process($string, $unknown = '?', $source_langcode = NULL) {
  // ASCII is always valid NFC! If we're only ever given plain ASCII, we can
  // avoid the overhead of initializing the decomposition tables by skipping
  // out early.
  if (!preg_match('/[\x80-\xff]/', $string)) {
    return $string;
  }

  static $tail_bytes;

  if (!isset($tail_bytes)) {
    // Each UTF-8 head byte is followed by a certain number of tail bytes.
    $tail_bytes = array();
    for ($n = 0; $n < 256; $n++) {
      if ($n < 0xc0) {
        $remaining = 0;
      }
      elseif ($n < 0xe0) {
        $remaining = 1;
      }
      elseif ($n < 0xf0) {
        $remaining = 2;
      }
      elseif ($n < 0xf8) {
        $remaining = 3;
      }
      elseif ($n < 0xfc) {
        $remaining = 4;
      }
      elseif ($n < 0xfe) {
        $remaining = 5;
      }
      else {
        $remaining = 0;
      }
      $tail_bytes[chr($n)] = $remaining;
    }
  }

  // Chop the text into pure-ASCII and non-ASCII areas; large ASCII parts can
  // be handled much more quickly. Don't chop up Unicode areas for punctuation,
  // though, that wastes energy.
  preg_match_all('/[\x00-\x7f]+|[\x80-\xff][\x00-\x40\x5b-\x5f\x7b-\xff]*/', $string, $matches);

  $result = '';
  foreach ($matches[0] as $str) {
    if ($str[0] < "\x80") {
      // ASCII chunk: guaranteed to be valid UTF-8 and in normal form C, so
      // skip over it.
      $result .= $str;
      continue;
    }

    // We'll have to examine the chunk byte by byte to ensure that it consists
    // of valid UTF-8 sequences, and to see if any of them might not be
    // normalized.
    //
    // Since PHP is not the fastest language on earth, some of this code is a
    // little ugly with inner loop optimizations.

    $head = '';
    $chunk = strlen($str);
    // Counting down is faster. I'm *so* sorry.
    $len = $chunk + 1;

    for ($i = -1; --$len; ) {
      $c = $str[++$i];
      if ($remaining = $tail_bytes[$c]) {
        // UTF-8 head byte!
        $sequence = $head = $c;
        do {
          // Look for the defined number of tail bytes...
          if (--$len && ($c = $str[++$i]) >= "\x80" && $c < "\xc0") {
            // Legal tail bytes are nice.
            $sequence .= $c;
          }
          else {
            if ($len == 0) {
              // Premature end of string! Drop a replacement character into
              // output to represent the invalid UTF-8 sequence.
              $result .= $unknown;
              break 2;
            }
            else {
              // Illegal tail byte; abandon the sequence.
              $result .= $unknown;
              // Back up and reprocess this byte; it may itself be a legal
              // ASCII or UTF-8 sequence head.
              --$i;
              ++$len;
              continue 2;
            }
          }
        } while (--$remaining);

        $n = ord($head);
        $ord = NULL;
        if ($n <= 0xdf) {
          $ord = ($n - 192) * 64 + (ord($sequence[1]) - 128);
        }
        elseif ($n <= 0xef) {
          $ord = ($n - 224) * 4096 + (ord($sequence[1]) - 128) * 64 + (ord($sequence[2]) - 128);
        }
        elseif ($n <= 0xf7) {
          $ord = ($n - 240) * 262144 + (ord($sequence[1]) - 128) * 4096 + (ord($sequence[2]) - 128) * 64 + (ord($sequence[3]) - 128);
        }
        elseif ($n <= 0xfb) {
          $ord = ($n - 248) * 16777216 + (ord($sequence[1]) - 128) * 262144 + (ord($sequence[2]) - 128) * 4096 + (ord($sequence[3]) - 128) * 64 + (ord($sequence[4]) - 128);
        }
        elseif ($n <= 0xfd) {
          $ord = ($n - 252) * 1073741824 + (ord($sequence[1]) - 128) * 16777216 + (ord($sequence[2]) - 128) * 262144 + (ord($sequence[3]) - 128) * 4096 + (ord($sequence[4]) - 128) * 64 + (ord($sequence[5]) - 128);
        }
        $result .= _transliteration_replace($ord, $unknown, $source_langcode);
        $head = '';
      }
      elseif ($c < "\x80") {
        // ASCII byte.
        $result .= $c;
        $head = '';
      }
      elseif ($c < "\xc0") {
        // Illegal tail bytes.
        if ($head == '') {
          $result .= $unknown;
        }
      }
      else {
        // Miscellaneous freaks.
        $result .= $unknown;
        $head = '';
      }
    }
  }
  return $result;
}

/**
 * Replaces a Unicode character using the transliteration database.
 *
 * @param $ord
 *   An ordinal Unicode character code.
 * @param $unknown
 *   Replacement string for characters that do not have a suitable ASCII
 *   equivalent.
 * @param $langcode
 *   Optional ISO 639 language code that denotes the language of the input and
 *   is used to apply language-specific variations.  Defaults to the current
 *   display language.
 * @return
 *   ASCII replacement character.
 */
function _transliteration_replace($ord, $unknown = '?', $langcode = NULL) {
  static $map = array();
  static $language_overrides = array();

  if (!isset($langcode)) {
    global $language;
    $langcode = $language->langcode;
  }

  // See if there is a language-specific override for this character.
  if (!isset($language_overrides[$langcode])) {
    $file = BACKDROP_ROOT . '/core/includes/transliteration/' . preg_replace('/[^a-zA-Z\-]/', '', $langcode) . '.php';
    if (file_exists($file)) {
      include $file;
      if (!isset($overrides[$langcode]) || !is_array($overrides[$langcode])) {
        $overrides[$langcode] = array();
      }
      $language_overrides[$langcode] = $overrides[$langcode];
    }
  }
  if (isset($language_overrides[$langcode][$ord])) {
    return $language_overrides[$langcode][$ord];
  }

  $bank = $ord >> 8;

  if (!isset($map[$bank][$langcode])) {
    $base = array(); // Populated from the include.
    $file = BACKDROP_ROOT . '/core/includes/transliteration/' . sprintf('x%02x', $bank) . '.php';
    if (file_exists($file)) {
      include $file;
      $map[$bank][$langcode] = $base;
    }
    else {
      $map[$bank][$langcode] = array();
    }
  }

  $ord = $ord & 255;

  return isset($map[$bank][$langcode][$ord]) ? $map[$bank][$langcode][$ord] : $unknown;
}

/**
 * Transliterates and sanitizes a file name.
 *
 * The resulting file name has white space replaced with underscores, consists
 * of only US-ASCII characters, and is converted to lowercase (if configured).
 * If multiple files have been submitted as an array, the names will be
 * processed recursively.
 *
 * @param $filename
 *   A file name, or an array of file names.
 * @param $source_langcode
 *   Optional ISO 639 language code that denotes the language of the input and
 *   is used to apply language-specific variations. If the source language is
 *   not known at the time of transliteration, it is recommended to set this
 *   argument to the site default language to produce consistent results.
 *   Otherwise the current display language will be used.
 * @return
 *   Sanitized file name, or array of sanitized file names.
 *
 * @see language_default()
 */
function transliteration_clean_filename($filename, $source_langcode = NULL) {
  if (is_array($filename)) {
    foreach ($filename as $key => $value) {
      $filename[$key] = transliteration_clean_filename($value, $source_langcode);
    }
    return $filename;
  }

  // Allow other modules to alter the filename prior to processing.
  backdrop_alter('transliteration_clean_filename_prepare', $filename, $source_langcode);
  $filename = transliteration_get($filename, '', $source_langcode);
  $filename = str_replace(' ', '_', $filename);
  $filename = preg_replace('/[^a-z0-9_.-]+/i', '', $filename);
  // Force lowercase to prevent issues on case-insensitive file systems.
  if (config_get('system.core', 'file_transliterate_lowercase')) {
    $filename = strtolower($filename);
  }
  return $filename;
}

/**
 * Transliterates text.
 *
 * Takes an input string in any language and character set, and tries to
 * represent it in US-ASCII characters by conveying, in Roman letters, the
 * pronunciation expressed by the text in some other writing system.
 *
 * @param string $text
 *   UTF-8 encoded text input.
 * @param string $unknown
 *   Replacement string for characters that do not have a suitable ASCII
 *   equivalent.
 * @param string $source_langcode
 *   Optional ISO 639 language code that denotes the language of the input and
 *   is used to apply language-specific variations. If the source language is
 *   not known at the time of transliteration, it is recommended to set this
 *   argument to the site default language to produce consistent results.
 *   Otherwise the current display language will be used.
 * @return
 *   Transliterated text.
 *
 * @see language_default()
 */
function transliteration_get($text, $unknown = '?', $source_langcode = NULL) {
  // Populate defaults.
  if (empty($source_langcode)) {
    $source_langcode = $GLOBALS['language']->langcode;
  }
  return _transliteration_process($text, $unknown, $source_langcode);
}

function transliteration_remove_diacritics($string) {
  $result = '';

  foreach (preg_split('//u', $string, 0, PREG_SPLIT_NO_EMPTY) as $character) {
    $code = _transliteration_ord_utf8($character);

    // These two Unicode ranges include the accented US-ASCII letters, with a
    // few characters that aren't accented letters mixed in. So define the
    // ranges and the excluded characters.
    $range1 = $code > 0x00bf && $code < 0x017f;
    $exclusions_range1 = array(0x00d0, 0x00d7, 0x00f0, 0x00f7, 0x0138, 0x014a, 0x014b);
    $range2 = $code > 0x01cc && $code < 0x0250;
    $exclusions_range2 = array(0x01DD, 0x01f7, 0x021c, 0x021d, 0x0220, 0x0221, 0x0241, 0x0242, 0x0245);

    $replacement = $character;
    if (($range1 && !in_array($code, $exclusions_range1)) || ($range2 && !in_array($code, $exclusions_range2))) {
      $to_add = transliteration_get($code, 'xyz');
      if(strlen($to_add) === 1) {
        $replacement = $to_add;
      }
    }

    $result .= $replacement;
  }

  return $result;
}

/**
 * Finds the character code for a UTF-8 character: like ord() but for UTF-8.
 *
 * @param string $character
 *   A single UTF-8 character.
 *
 * @return int
 *   The character code, or -1 if an illegal character is found.
 */
function _transliteration_ord_utf8($character) {
  $first_byte = ord($character[0]);

  if (($first_byte & 0x80) == 0) {
    // Single-byte form: 0xxxxxxxx.
    return $first_byte;
  }
  if (($first_byte & 0xe0) == 0xc0) {
    // Two-byte form: 110xxxxx 10xxxxxx.
    return (($first_byte & 0x1f) << 6) + (ord($character[1]) & 0x3f);
  }
  if (($first_byte & 0xf0) == 0xe0) {
    // Three-byte form: 1110xxxx 10xxxxxx 10xxxxxx.
    return (($first_byte & 0x0f) << 12) + ((ord($character[1]) & 0x3f) << 6) + (ord($character[2]) & 0x3f);
  }
  if (($first_byte & 0xf8) == 0xf0) {
    // Four-byte form: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx.
    return (($first_byte & 0x07) << 18) + ((ord($character[1]) & 0x3f) << 12) + ((ord($character[2]) & 0x3f) << 6) + (ord($character[3]) & 0x3f);
  }

  // Other forms are not legal.
  return -1;
}
