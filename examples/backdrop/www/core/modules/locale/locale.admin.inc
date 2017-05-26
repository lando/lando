<?php

/**
 * @file
 * Administration functions for locale.module.
 */

include_once BACKDROP_ROOT . '/core/includes/language.inc';
include_once BACKDROP_ROOT . '/core/includes/locale.inc';

/**
 * Builds the configuration form for language negotiation.
 */
function language_negotiation_configure_form() {

  $form = array(
    '#submit' => array('language_negotiation_configure_form_submit'),
    '#theme' => 'language_negotiation_configure_form',
    '#language_types' => language_types_get_configurable(),
    '#language_types_info' => language_types_info(),
    '#language_providers' => language_negotiation_info(),
  );

  foreach ($form['#language_types'] as $type) {
    language_negotiation_configure_form_table($form, $type);
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save settings'),
  );

  return $form;
}

/**
 * Helper function to build a language provider table.
 */
function language_negotiation_configure_form_table(&$form, $type) {
  $info = $form['#language_types_info'][$type];

  $table_form = array(
    '#title' => t('@type language detection', array('@type' => $info['name'])),
    '#tree' => TRUE,
    '#description' => $info['description'],
    '#language_providers' => array(),
    '#show_operations' => FALSE,
    'weight' => array('#tree' => TRUE),
    'enabled' => array('#tree' => TRUE),
  );

  $language_providers = $form['#language_providers'];
  $enabled_providers = (array) config_get('language.settings', "language_negotiation.$type");

  // Order providers list by weight.
  foreach ($language_providers as $id => $provider) {
    $set_weight = array_search($id, $enabled_providers);
    $language_providers[$id]['set_weight'] = $set_weight !== FALSE ? $set_weight - 10 : 20;
  }
  // Put the default language at the bottom of the list.
  $last_provider = end($enabled_providers);
  if ($last_provider === LANGUAGE_NEGOTIATION_DEFAULT) {
    $language_providers[$id]['set_weight'] = 21;
  }
  backdrop_sort($language_providers, array('set_weight' => SORT_NUMERIC, 'weight' => SORT_NUMERIC));
  if ($last_provider === LANGUAGE_NEGOTIATION_DEFAULT) {
    $language_providers[$id]['set_weight'] = 10;
  }

  foreach ($language_providers as $id => $provider) {
    $enabled = in_array($id, $enabled_providers);
    $provider = $language_providers[$id];

    // List the provider only if the current type is defined in its 'types' key.
    // If it is not defined default to all the configurable language types.
    $types = array_flip(isset($provider['types']) ? $provider['types'] : $form['#language_types']);

    if (isset($types[$type])) {
      $table_form['#language_providers'][$id] = $provider;
      $provider_name = check_plain($provider['name']);

      $table_form[$id]['weight'] = array(
        '#type' => 'weight',
        '#title' => t('Weight for !title language detection method', array('!title' => backdrop_strtolower($provider_name))),
        '#title_display' => 'invisible',
        '#default_value' => $provider['set_weight'] > 10 ? $provider['weight'] : $provider['set_weight'],
        '#attributes' => array('class' => array("language-provider-weight-$type")),
      );

      $table_form[$id]['title'] = array('#markup' => $provider_name);

      $table_form[$id]['enabled'] = array(
        '#type' => 'checkbox',
        '#title' => t('Enable !title language detection method', array('!title' => backdrop_strtolower($provider_name))),
        '#title_display' => 'invisible',
        '#default_value' => $enabled,
      );
      if ($id === LANGUAGE_NEGOTIATION_DEFAULT) {
        $table_form[$id]['enabled']['#default_value'] = TRUE;
        $table_form[$id]['enabled']['#attributes'] = array('disabled' => 'disabled');
      }

      $table_form[$id]['description'] = array('#markup' => filter_xss_admin($provider['description']));

      $config_op = array();
      if (isset($provider['config'])) {
        $config_op = array('#type' => 'link', '#title' => t('Configure'), '#href' => $provider['config']);
        // If there is at least one operation enabled show the operation column.
        $table_form['#show_operations'] = TRUE;
      }
      $table_form[$id]['operation'] = $config_op;
    }
  }

  $form[$type] = $table_form;
}

/**
 * Submit handler for language negotiation settings.
 */
function language_negotiation_configure_form_submit($form, &$form_state) {
  $configurable_types = $form['#language_types'];

  foreach ($configurable_types as $type) {
    $negotiation = array();
    $providers = $form_state['values'][$type];
    $providers[LANGUAGE_NEGOTIATION_DEFAULT]['enabled'] = 1;
    backdrop_sort($providers);

    foreach ($providers as $id => $provider_settings) {
      if ($provider_settings['enabled']) {
        $negotiation[] = $id;
      }
    }

    language_negotiation_set($type, $negotiation);
  }

  $form_state['redirect'] = 'admin/config/regional/language/detection';
  backdrop_set_message(t('Language negotiation configuration saved.'));
}

/**
 * Builds the URL language provider configuration form.
 *
 * @see language_negotiation_configure_url_form_validate()
 * @see language_negotiation_configure_url_form_submit()
 */
function language_negotiation_configure_url_form($form, &$form_state) {
  $form['locale_language_negotiation_url_part'] = array(
    '#title' => t('Part of the URL that determines language'),
    '#type' => 'radios',
    '#options' => array(
      LANGUAGE_NEGOTIATION_URL_PREFIX => t('Path prefix'),
      LANGUAGE_NEGOTIATION_URL_DOMAIN => t('Domain'),
    ),
    '#default_value' => config_get('locale.settings', 'language_negotiation_url_part'),
  );

  $form['prefix'] = array(
    '#type' => 'fieldset',
    '#tree' => TRUE,
    '#title' => t('Path prefix configuration'),
    '#description' => t('Language codes or other custom text to use as a path prefix for URL language detection. For the default language, this value may be left blank. <strong>Modifying this value may break existing URLs. Use with caution in a production environment.</strong> Example: Specifying "deutsch" as the path prefix code for German results in URLs like "example.com/deutsch/contact".'),
    '#states' => array(
      'visible' => array(
        ':input[name="locale_language_negotiation_url_part"]' => array(
          'value' => (string) LANGUAGE_NEGOTIATION_URL_PREFIX,
        ),
      ),
    ),
  );
  $form['domain'] = array(
    '#type' => 'fieldset',
    '#tree' => TRUE,
    '#title' => t('Domain configuration'),
    '#description' => t('The domain names to use for these languages. Leave blank for the default language. Use with caution in a production environment.<strong>Modifying this value may break existing URLs. Use with caution in a production environment.</strong> Example: Specifying "de.example.com" as language domain for German will result in an URL like "http://de.example.com/contact".'),
    '#states' => array(
      'visible' => array(
        ':input[name="locale_language_negotiation_url_part"]' => array(
          'value' => (string) LANGUAGE_NEGOTIATION_URL_DOMAIN,
        ),
      ),
    ),
  );

  // Get the enabled languages only.
  $languages = language_list(TRUE);
  $prefixes = locale_language_negotiation_url_prefixes();
  $domains = locale_language_negotiation_url_domains();

  // Use a mock language for the URL field prefix to prevent use of any language
  // codes in the field prefix.
  $mock_language = (object)(array(
    'langcode' => '',
  ));
  foreach ($languages as $langcode => $language) {
    $form['prefix'][$langcode] = array(
      '#type' => 'textfield',
      '#title' => t('%language (%langcode) path prefix', array('%language' => $language->name, '%langcode' => $language->langcode)),
      '#maxlength' => 64,
      '#default_value' => isset($prefixes[$langcode]) ? $prefixes[$langcode] : '',
      '#field_prefix' => url('', array('absolute' => TRUE, 'language' => $mock_language)) . (config_get('system.core', 'clean_url') ? '' : '?q=')
    );
    $form['domain'][$langcode] = array(
      '#type' => 'textfield',
      '#title' => t('%language (%langcode) domain', array('%language' => $language->name, '%langcode' => $language->langcode)),
      '#maxlength' => 128,
      '#default_value' => isset($domains[$langcode]) ? $domains[$langcode] : '',
    );
  }

  $form_state['redirect'] = 'admin/config/regional/language/detection';

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  return $form;
}

/**
 * Validation handler for url provider configuration.
 *
 * Validate that the prefixes and domains are unique, and make sure that
 * the prefix and domain are only blank for the default.
 */
function language_negotiation_configure_url_form_validate($form, &$form_state) {
  // Get the enabled languages only.
  $languages = language_list(TRUE);
  $default = language_default();

  // Count repeated values for uniqueness check.
  $count = array_count_values($form_state['values']['prefix']);
  foreach ($languages as $langcode => $language) {
    $value = $form_state['values']['prefix'][$langcode];

    if ($value === '') {
      if (!$language->default && $form_state['values']['locale_language_negotiation_url_part'] == LANGUAGE_NEGOTIATION_URL_PREFIX) {
        // Validation error if the prefix is blank for a non-default language, and value is for selected negotiation type.
        form_error($form['prefix'][$langcode], t('The prefix may only be left blank for the default language.'));
      }
    }
    elseif (isset($count[$value]) && $count[$value] > 1) {
      // Validation error if there are two languages with the same domain/prefix.
      form_error($form['prefix'][$langcode], t('The prefix for %language, %value, is not unique.', array('%language' => $language->name, '%value' => $value)));
    }
  }

  // Count repeated values for uniqueness check.
  $count = array_count_values($form_state['values']['domain']);
  foreach ($languages as $langcode => $language) {
    $value = $form_state['values']['domain'][$langcode];

    if ($value === '') {
      if (!$language->default && $form_state['values']['locale_language_negotiation_url_part'] == LANGUAGE_NEGOTIATION_URL_DOMAIN) {
        // Validation error if the domain is blank for a non-default language, and value is for selected negotiation type.
        form_error($form['domain'][$langcode], t('The domain may only be left blank for the default language.'));
      }
    }
    elseif (isset($count[$value]) && $count[$value] > 1) {
      // Validation error if there are two languages with the same domain/domain.
      form_error($form['domain'][$langcode], t('The domain for %language, %value, is not unique.', array('%language' => $language->name, '%value' => $value)));
    }
  }
}

/**
 * Form submission handler for language_negotiation_configure_url_form().
 */
function language_negotiation_configure_url_form_submit($form, &$form_state) {
  // Save selected format (prefix or domain).
  config_set('locale.settings', 'language_negotiation_url_part', $form_state['values']['locale_language_negotiation_url_part']);

  // Save new domain and prefix values.
  locale_language_negotiation_url_prefixes_save($form_state['values']['prefix']);
  locale_language_negotiation_url_domains_save($form_state['values']['domain']);

  backdrop_set_message(t('Configuration saved.'));
}

/**
 * The URL language provider configuration form.
 *
 * @see language_negotiation_configure_session_form_submit()
 */
function language_negotiation_configure_session_form($form, &$form_state) {
  $form['language_negotiation_session_parameter'] = array(
    '#title' => t('Request/session parameter'),
    '#type' => 'textfield',
    '#default_value' => config_get('locale.settings', 'language_negotiation_session_parameter'),
    '#description' => t('Name of the request/session parameter used to determine the desired language.'),
  );

  $form_state['redirect'] = 'admin/config/regional/language/detection';

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  return $form;
}

/**
 * Form submission handler for language_negotiation_configure_session_form().
 */
function language_negotiation_configure_session_form_submit($form, &$form_state) {
  config_set('locale.settings', 'language_negotiation_session_parameter', $form_state['values']['language_negotiation_session_parameter']);
  backdrop_set_message(t('The configuration options have been saved.'));
}

/**
 * @} End of "locale-language-administration"
 */

/**
 * Form callback; Display fields for setting the date format for each language.
 */
function locale_date_format_form($form, &$form_state, $format) {
  backdrop_set_title(t('Localize %format', array('%format' => $format['name'])), PASS_THROUGH);

  // We use the system_date_time_lookup() function from system.admin.inc.
  form_load_include($form_state, 'inc', 'system', 'system.admin');
  $form_state['format'] = $format;

  $form['#tree'] = TRUE;
  $form['help'] = array(
    '#type' => 'help',
    '#markup' => t('Each language may format dates and times differently. Languages without a specific format will fallback to the default. See the <a href="@url">PHP manual</a> for available options.', array('@url' => 'http://php.net/manual/function.date.php')),
  );

  $form['locales']['default'] = array(
    '#type' => 'item',
    '#title' => t('Default'),
    '#markup' => '<strong>' . check_plain($format['pattern']) . '</strong>',
    '#field_suffix' => '<small>' . t('Displayed as %date_format' , array('%date_format' => format_date(REQUEST_TIME, 'custom', $format['pattern']))) . '</small>',
  );

  // Get the enabled languages only.
  $languages = language_list(TRUE);
  foreach ($languages as $langcode => $language) {
    $pattern = isset($format['locales'][$langcode]) ? $format['locales'][$langcode] : '';
    if (!empty($form_state['values']['locales'][$langcode])) {
      $pattern = $form_state['values']['locales'][$langcode];
    }
    $placeholder_pattern = $pattern ? $pattern : $format['pattern'];
    $preview = t('Displayed as %date_format', array('%date_format' => format_date(REQUEST_TIME, 'custom', $placeholder_pattern)));

    $form['locales'][$langcode] = array(
      '#title' => check_plain($language->name),
      '#type' => 'textfield',
      '#maxlength' => 100,
      '#default_value' => $pattern,
      '#field_suffix' => '<small class="pattern-preview">' . $preview . '</small>',
      '#ajax' => array(
        'callback' => 'system_date_time_lookup',
        'event' => 'keyup',
        'progress' => array('type' => 'none', 'message' => NULL),
        'disable' => FALSE,
      ),
      '#placeholder' => $placeholder_pattern,
      '#size' => 30,
      '#wrapper_attributes' => array(
        'id' => 'locale-pattern-' . $langcode,
      ),
    );
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Submit handler for configuring localized date formats on the locale_date_format_form.
 */
function locale_date_format_form_submit($form, &$form_state) {
  $format = $form_state['format'];
  foreach ($form_state['values']['locales'] as $langcode => $pattern) {
    if (!empty($pattern)) {
      $format['locales'][$langcode] = $pattern;
    }
  }
  system_date_format_save($format);
  backdrop_set_message(t('Date localizations saved.'));
  $form_state['redirect'] = 'admin/config/regional/date-time';
}

