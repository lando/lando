<?php
/**
 * @file
 * Language Negotiation API.
 *
 * @see http://drupal.org/node/1497272
 */

/**
 * No language negotiation. The default language is used.
 */
define('LANGUAGE_NEGOTIATION_DEFAULT', 'language-default');

/**
 * @defgroup language_negotiation Language Negotiation API functionality
 * @{
 * Functions to customize the language types and the negotiation process.
 *
 * The language negotiation API is based on two major concepts:
 * - Language types: types of translatable data (the types of data that a user
 *   can view or request).
 * - Language negotiation providers: functions for determining which language to
 *   use to present a particular piece of data to the user.
 * Both language types and language negotiation providers are customizable.
 *
 * Backdrop defines three built-in language types:
 * - Interface language: The page's main language, used to present translated
 *   user interface elements such as titles, labels, help text, and messages.
 * - Content language: The language used to present content that is available
 *   in more than one language (see
 *   @link field_language Field Language API @endlink for details).
 * - URL language: The language associated with URLs. When generating a URL,
 *   this value will be used by url() as a default if no explicit preference is
 *   provided.
 * Modules can define additional language types through
 * hook_language_types_info(), and alter existing language type definitions
 * through hook_language_types_info_alter().
 *
 * Language types may be configurable or fixed. The language negotiation
 * providers associated with a configurable language type can be explicitly
 * set through the user interface. A fixed language type has predetermined
 * (module-defined) language negotiation settings and, thus, does not appear in
 * the configuration page. Here is a code snippet that makes the content
 * language (which by default inherits the interface language's values)
 * configurable:
 * @code
 * function mymodule_language_types_info_alter(&$language_types) {
 *   unset($language_types[LANGUAGE_TYPE_CONTENT]['fixed']);
 * }
 * @endcode
 *
 * Every language type can have a different set of language negotiation
 * providers assigned to it. Different language types often share the same
 * language negotiation settings, but they can have independent settings if
 * needed. If two language types are configured the same way, their language
 * switcher configuration will be functionally identical and the same settings
 * will act on both language types.
 *
 * Backdrop defines the following built-in language negotiation providers:
 * - URL: Determine the language from the URL (path prefix or domain).
 * - Session: Determine the language from a request/session parameter.
 * - User: Follow the user's language preference.
 * - Browser: Determine the language from the browser's language settings.
 * - Default language: Use the default site language.
 * Language negotiation providers are simple callback functions that implement a
 * particular logic to return a language code. For instance, the URL provider
 * searches for a valid path prefix or domain name in the current request URL.
 * If a language negotiation provider does not return a valid language code, the
 * next provider associated to the language type (based on provider weight) is
 * invoked.
 *
 * Modules can define additional language negotiation providers through
 * hook_language_negotiation_info(), and alter existing providers through
 * hook_language_negotiation_info_alter(). Here is an example snippet that lets
 * path prefixes be ignored for administrative paths:
 * @code
 * function mymodule_language_negotiation_info_alter(&$negotiation_info) {
 *   // Replace the core function with our own function.
 *   $negotiation_info[LANGUAGE_NEGOTIATION_URL]['callbacks']['language'] = 'mymodule_from_url';
 *   $negotiation_info[LANGUAGE_NEGOTIATION_URL]['file'] = backdrop_get_path('module', 'mymodule') . '/mymodule.module';
 * }
 *
 * function mymodule_from_url($languages) {
 *   // Use the core URL language negotiation provider to get a valid language
 *   // code.
 *   $langcode = locale_language_from_url($languages);
 *
 *   // If we are on an administrative path, override with the default language.
 *   if (isset($_GET['q']) && strtok($_GET['q'], '/') == 'admin') {
 *     return language_default()->langcode;
 *   }
 *   return $langcode;
 * }
 * @endcode
 *
 * For more information, see
 * @link http://drupal.org/node/1497272 Language Negotiation API @endlink
 */

/**
 * Chooses a language based on language negotiation provider settings.
 *
 * @param $type
 *   The type of language to retrieve as provided by hook_language_types_info().
 *   In Backdrop core, the available language types will be one of the
 *   following:
 *   - language
 *   - language_content
 *   - language_url
 *
 * @return
 *   The negotiated language object.
 */
function language_types_initialize($type) {
  // Execute the language negotiation providers in the order they were set up
  // and return the first valid language found.
  $negotiation_order = language_negotiation_order($type);

  if (empty($negotiation_order)) {
    $language_types = language_types_info();
    if (isset($language_types[$type]['fixed'])) {
      $negotiation_order = $language_types[$type]['fixed'];
    }
  }

  foreach ($negotiation_order as $provider_id) {
    $language = language_provider_invoke($provider_id);
    if ($language) {
      // Remember the provider key used to detect the language.
      $language->provider = $provider_id;
      return $language;
    }
  }

  // If no other language was found use the default one.
  $language = language_default();
  $language->provider = LANGUAGE_NEGOTIATION_DEFAULT;
  return $language;
}

/**
 * Returns all the defined language types.
 *
 * @return
 *   An associative array of language type information arrays keyed by type
 *   names. Based on information from hook_language_types_info().
 *
 * @see hook_language_types_info().
 */
function language_types_info() {
  $language_types = &backdrop_static(__FUNCTION__);

  if (!isset($language_types)) {
    $language_types = module_invoke_all('language_types_info');
    // Let other modules alter the list of language types.
    backdrop_alter('language_types_info', $language_types);
  }

  return $language_types;
}

/**
 * Returns only the configurable language types.
 *
 * A language type may be configurable or fixed. A fixed language type is a type
 * whose language negotiation providers are module-defined and not altered
 * through the user interface.
 *
 * @return
 *   An array of language type names.
 */
function language_types_get_configurable() {
  $configurable = &backdrop_static(__FUNCTION__);

  if (!isset($configurable)) {
    $configurable = array();
    foreach (language_types_info() as $type => $info) {
      if (!isset($info['fixed'])) {
        $configurable[] = $type;
      }
    }
  }

  return $configurable;
}

/**
 * Checks whether a language negotiation provider is enabled for a language type.
 *
 * This has two possible behaviors:
 *  - If $provider_id is given return its ID if enabled, FALSE otherwise.
 *  - If no ID is passed the first enabled language negotiation provider is
 *    returned.
 *
 * @param $type
 *   The language negotiation provider type.
 * @param $provider_id
 *   The language negotiation provider ID.
 *
 * @return
 *   The provider ID if it is enabled, FALSE otherwise.
 */
function language_negotiation_get($type, $provider_id = NULL) {
  $negotiation = language_negotiation_order($type);

  if (empty($negotiation)) {
    return empty($provider_id) ? LANGUAGE_NEGOTIATION_DEFAULT : FALSE;
  }

  if (empty($provider_id)) {
    return reset($negotiation);
  }

  if (in_array($provider_id, $negotiation)) {
    return $provider_id;
  }

  return FALSE;
}

/**
 * Checks if the language negotiation provider is enabled for any language type.
 *
 * @param $provider_id
 *   The language negotiation provider ID.
 *
 * @return
 *   TRUE if there is at least one language type for which the given language
 *   provider is enabled, FALSE otherwise.
 */
function language_negotiation_get_any($provider_id) {
  foreach (language_types_get_configurable() as $type) {
    if (language_negotiation_get($type, $provider_id)) {
      return TRUE;
    }
  }

  return FALSE;
}

/**
 * Returns the language switch links for the given language.
 *
 * @param $type
 *   The language negotiation type.
 * @param $path
 *   The internal path the switch links will be relative to.
 *
 * @return
 *   A keyed array of links ready to be themed.
 */
function language_negotiation_get_switch_links($type, $path) {
  $links = FALSE;
  $negotiation_order = language_negotiation_order($type);
  $negotiation_info = language_negotiation_info();
  foreach ($negotiation_order as $id) {
    $provider = $negotiation_info[$id];
    if (isset($provider['callbacks']['switcher'])) {
      if (isset($provider['file'])) {
        require_once BACKDROP_ROOT . '/' . $provider['file'];
      }

      $callback = $provider['callbacks']['switcher'];
      $result = $callback($type, $path);

      // Add support for WCAG 2.0's Language of Parts to add language identifiers.
      // http://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html
      foreach ($result as $langcode => $link) {
        $result[$langcode]['attributes']['lang'] = $langcode;
        $result[$langcode]['attributes']['xml:lang'] = $langcode;
      }

      if (!empty($result)) {
        // Allow modules to provide translations for specific links.
        backdrop_alter('language_switch_links', $result, $type, $path);
        $links = (object) array('links' => $result, 'provider' => $id);
        break;
      }
    }
  }

  return $links;
}

/**
 * Removes any unused language negotiation providers from the configuration.
 */
function language_negotiation_purge() {
  // Ensure that we are getting the defined language negotiation information. An
  // invocation of module_enable() or module_disable() could outdate the cached
  // information.
  backdrop_static_reset('language_negotiation_info');
  backdrop_static_reset('language_types_info');
  backdrop_static_reset('language_types_get_configurable');

  // Do not attempt to read/write to the language settings file if it does not
  // exist, which may happen if this function is called when language.module
  // is not enabled.
  $config = config('language.settings');
  if ($config->isNew()) {
    return;
  }

  $defined_providers = language_negotiation_info();
  $language_types = language_types_info();
  $configured_types = $config->get('language_negotiation');
  foreach ($configured_types as $configured_type => $configured_settings) {
    // Remove the entire language type if it no longer exists.
    if (!isset($language_types[$configured_type])) {
      unset($configured_types[$configured_type]);
    }
    // Remove negotiation providers if they no longer exist.
    $configured_types[$configured_type] = array_values(array_intersect($configured_settings, array_keys($defined_providers)));
  }
  $config->set('language_negotiation', $configured_types);
  $config->save();

  backdrop_static_reset('language_types_info');
  backdrop_static_reset('language_negotiation_info');
}

/**
 * Saves a list of language negotiation providers.
 *
 * @param $type
 *   The language negotiation type.
 * @param $negotiation
 *   An array of language negotiation providers in the order they should be
 *   executed.
 *
 */
function language_negotiation_set($type, $negotiation) {
  $defined_providers = language_negotiation_info();
  $default_types = language_types_get_configurable();
  $negotiation_data = array();

  foreach ($negotiation as $id) {
    if (isset($defined_providers[$id])) {
      $provider = $defined_providers[$id];
      // If the provider does not express any preference about types, make it
      // available for any configurable type.
      $types = array_flip(isset($provider['types']) ? $provider['types'] : $default_types);
      // Check whether the provider is defined and has the right type.
      if (isset($types[$type])) {
        $negotiation_data[] = $id;
      }
    }
  }

  config_set('language.settings', "language_negotiation.$type", $negotiation_data);
}

/**
 * Get the language negotiator provider order for a language type.
 *
 * @param $type
 *   The language negotiation type.
 * @return array
 *   An array of language negotiation providers.
 */
function language_negotiation_order($type) {
  $types = language_types_info();
  if (isset($types[$type]['fixed'])) {
    return $types[$type]['fixed'];
  }
  elseif ($configured_order = config_get('language.settings', "language_negotiation.$type")) {
    return $configured_order;
  }
  else {
    return array();
  }
}

/**
 * Returns all the defined language negotiation providers.
 *
 * @return
 *   An array of language negotiation providers.
 */
function language_negotiation_info() {
  $language_providers = &backdrop_static(__FUNCTION__);

  if (!isset($language_providers)) {
    // Collect all the module-defined language negotiation providers.
    $language_providers = module_invoke_all('language_negotiation_info');

    // Add the default language negotiation provider.
    $language_providers[LANGUAGE_NEGOTIATION_DEFAULT] = array(
      'callbacks' => array('language' => 'language_from_default'),
      'weight' => 10,
      'name' => t('Default language'),
      'description' => t('Use the default site language (@language_name).', array('@language_name' => language_default()->name)),
      'config' => 'admin/config/regional/language',
    );

    // Let other modules alter the list of language negotiation providers.
    backdrop_alter('language_negotiation_info', $language_providers);
  }

  return $language_providers;
}

/**
 * Helper function used to cache the language negotiation providers results.
 *
 * @param $provider_id
 *   The language negotiation provider's identifier.
 * @param $provider
 *   (optional) An associative array of information about the provider to be
 *   invoked (see hook_language_negotiation_info() for details). If not passed
 *   in, it will be loaded through language_negotiation_info().
 *
 * @return
 *   A language object representing the language chosen by the provider.
 */
function language_provider_invoke($provider_id, $provider = NULL) {
  $results = &backdrop_static(__FUNCTION__);

  if (!isset($results[$provider_id])) {
    global $user;

    // Get the enabled languages only.
    $languages = language_list(TRUE);

    if (!isset($provider)) {
      $providers = language_negotiation_info();
      if (isset($providers[$provider_id])) {
        $provider = $providers[$provider_id];
      }
    }

    if (isset($provider['file'])) {
      require_once BACKDROP_ROOT . '/' . $provider['file'];
    }

    // If the language negotiation provider has no cache preference or this is
    // satisfied we can execute the callback.
    $cache = !isset($provider['cache']) || $user->uid || $provider['cache'] == config_get('system.core', 'cache');
    $callback = isset($provider['callbacks']['language']) ? $provider['callbacks']['language'] : '';
    $langcode = $cache && function_exists($callback) ? $callback($languages) : FALSE;
    $results[$provider_id] = isset($languages[$langcode]) ? $languages[$langcode] : FALSE;
  }

  // Since objects are resources, we need to return a clone to prevent the
  // language negotiation provider cache from being unintentionally altered. The
  // same providers might be used with different language types based on
  // configuration.
  return !empty($results[$provider_id]) ? clone($results[$provider_id]) : $results[$provider_id];
}

/**
 * Returns the default language negotiation provider.
 *
 * @return
 *   The default language code.
 */
function language_from_default() {
  return language_default()->langcode;
}

/**
 * Splits the given path into prefix and actual path.
 *
 * Parse the given path and return the language object identified by the prefix
 * and the actual path.
 *
 * @param $path
 *   The path to split.
 * @param $languages
 *   An array of valid languages.
 *
 * @return
 *   An array composed of:
 *    - A language object corresponding to the identified prefix on success,
 *      FALSE otherwise.
 *    - The path without the prefix on success, the given path otherwise.
 */
function language_url_split_prefix($path, $languages) {
  $args = empty($path) ? array() : explode('/', $path);
  $prefix = array_shift($args);

  // Search prefix within enabled languages.
  $prefixes = locale_language_negotiation_url_prefixes();
  foreach ($languages as $language) {
    if (isset($prefixes[$language->langcode]) && $prefixes[$language->langcode] == $prefix) {
      // Rebuild $path with the language removed.
      return array($language, implode('/', $args));
    }
  }

  return array(FALSE, $path);
}

/**
 * Returns the possible fallback languages ordered by language weight.
 *
 * @param $type
 *   (optional) The language type. Defaults to LANGUAGE_TYPE_CONTENT.
 *
 * @return
 *   The identifier of the first language negotiation method for the given
 *   language type, or the default method if none exists.
 */
function language_fallback_get_candidates($type = LANGUAGE_TYPE_CONTENT) {
  $fallback_candidates = &backdrop_static(__FUNCTION__);

  if (!isset($fallback_candidates)) {
    // Get languages ordered by weight, add LANGUAGE_NONE as the last one.
    $fallback_candidates = array_keys(language_list());
    $fallback_candidates[] = LANGUAGE_NONE;

    // Let other modules hook in and add/change candidates.
    backdrop_alter('language_fallback_candidates', $fallback_candidates);
  }

  return $fallback_candidates;
}

/**
 * @} End of "language_negotiation"
 */
