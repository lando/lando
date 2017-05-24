<?php

/**
 * @file
 * Hooks provided by the Filter module.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Define content filters.
 *
 * User submitted content is passed through a group of filters before it is
 * output in HTML, in order to remove insecure or unwanted parts, correct or
 * enhance the formatting, transform special keywords, etc. A group of filters
 * is referred to as a "text format". Administrators can create as many text
 * formats as needed. Individual filters can be enabled and configured
 * differently for each text format.
 *
 * This hook is invoked by filter_get_filters() and allows modules to register
 * input filters they provide.
 *
 * Filtering is a two-step process. First, the content is 'prepared' by calling
 * the 'prepare callback' function for every filter. The purpose of the 'prepare
 * callback' is to escape HTML-like structures. For example, imagine a filter
 * which allows the user to paste entire chunks of programming code without
 * requiring manual escaping of special HTML characters like < or &. If the
 * programming code were left untouched, then other filters could think it was
 * HTML and change it. For many filters, the prepare step is not necessary.
 *
 * The second step is the actual processing step. The result from passing the
 * text through all the filters' prepare steps gets passed to all the filters
 * again, this time with the 'process callback' function. The process callbacks
 * should then actually change the content: transform URLs into hyperlinks,
 * convert smileys into images, etc.
 *
 * For performance reasons content is only filtered once; the result is stored
 * in the cache table and retrieved from the cache the next time the same piece
 * of content is displayed. If a filter's output is dynamic, it can override the
 * cache mechanism, but obviously this should be used with caution: having one
 * filter that does not support caching in a particular text format disables
 * caching for the entire format, not just for one filter.
 *
 * Beware of the filter cache when developing your module: it is advised to set
 * your filter to 'cache' => FALSE while developing, but be sure to remove that
 * setting if it's not needed, when you are no longer in development mode.
 *
 * @return
 *   An associative array of filters, whose keys are internal filter names,
 *   which should be unique and therefore prefixed with the name of the module.
 *   Each value is an associative array describing the filter, with the
 *   following elements (all are optional except as noted):
 *   - title: (required) An administrative summary of what the filter does.
 *   - description: Additional administrative information about the filter's
 *     behavior, if needed for clarification.
 *   - settings callback: The name of a function that returns configuration form
 *     elements for the filter. See callback_filter_settings() for details.
 *   - default settings: An associative array containing default settings for
 *     the filter, to be applied when the filter has not been configured yet.
 *   - js settings callback: The name of a function that returns configuration
 *     options that should be added to the page via JavaScript for use on the
 *     client side. See hook_filter_FILTER_js_settings() for details.
 *   - prepare callback: The name of a function that escapes the content before
 *     the actual filtering happens. See callback_filter_prepare() for
 *     details.
 *   - process callback: (required) The name the function that performs the
 *     actual filtering. See callback_filter_process() for details.
 *   - allowed html callback: If this filter restricts available HTML tags,
 *     the name of the function that returns the tag information. See
 *     callback_filter_allowed_html() for details.
 *   - cache (default TRUE): Specifies whether the filtered text can be cached.
 *     Note that setting this to FALSE makes the entire text format not
 *     cacheable, which may have an impact on the site's overall performance.
 *     See filter_format_allowcache() for details.
 *   - tips callback: The name of a function that returns end-user-facing filter
 *     usage guidelines for the filter. See callback_filter_tips() for
 *     details.
 *   - weight: A default weight for the filter in new text formats.
 *
 * @see filter_example.module
 * @see hook_filter_info_alter()
 */
function hook_filter_info() {
  $filters['filter_html'] = array(
    'title' => t('Limit allowed HTML tags'),
    'description' => t('Allows you to restrict the HTML tags the user can use. It will also remove harmful content such as JavaScript events, JavaScript URLs and CSS styles from those tags that are not removed.'),
    'process callback' => '_filter_html',
    'settings callback' => '_filter_html_settings',
    'allowed html callback' => '_filter_html_allowed_html',
    'default settings' => array(
      'allowed_html' => '<a> <em> <strong> <cite> <blockquote> <code> <ul> <ol> <li> <dl> <dt> <dd> <h3> <h4> <h5> <p>',
      'filter_html_help' => 1,
      'filter_html_nofollow' => 0,
    ),
    'tips callback' => '_filter_html_tips',
  );
  $filters['filter_autop'] = array(
    'title' => t('Convert line breaks'),
    'description' => t('Converts line breaks into HTML (i.e. &lt;br&gt; and &lt;p&gt;) tags.'),
    'process callback' => '_filter_autop',
    'tips callback' => '_filter_autop_tips',
  );
  return $filters;
}

/**
 * Perform alterations on filter definitions.
 *
 * @param $info
 *   Array of information on filters exposed by hook_filter_info()
 *   implementations.
 */
function hook_filter_info_alter(&$info) {
  // Replace the PHP evaluator process callback with an improved
  // PHP evaluator provided by a module.
  $info['php_code']['process callback'] = 'my_module_php_evaluator';

  // Alter the default settings of the URL filter provided by core.
  $info['filter_url']['default settings'] = array(
    'filter_url_length' => 100,
  );
}

/**
 * Define text editors, such as WYSIWYGs or toolbars to assist with text input.
 *
 * Text editors are bound to an individual text format. When a format is
 * activated in a 'text_format' element, the text editor associated with the
 * format should be activated on the text area.
 *
 * @return
 *   An associative array of editors, whose keys are internal editor names,
 *   which should be unique and therefore prefixed with the name of the module.
 *   Each value is an associative array describing the editor, with the
 *   following elements (all are optional except as noted):
 *   - title: (required) A human readable name for the editor.
 *   - settings callback: The name of a function that returns configuration
 *     form elements for the editor. See hook_editor_EDITOR_settings() for
 *     details.
 *   - default settings: An associative array containing default settings for
 *     the editor, to be applied when the editor has not been configured yet.
 *   - js settings callback: The name of a function that returns configuration
 *     options that should be added to the page via JavaScript for use on the
 *     client side. See hook_editor_EDITOR_js_settings() for details.
 *
 * @see filter_example.module
 * @see hook_filter_info_alter()
 */
function hook_editor_info() {
  $editors['myeditor'] = array(
    'title' => t('My Editor'),
    'settings callback' => '_myeditor_settings',
    'default settings' => array(
      'enable_toolbar' => TRUE,
      'toolbar_buttons' => array('bold', 'italic', 'underline', 'link', 'image'),
      'resizeable' => TRUE,
    ),
    'js settings callback' => '_myeditor_js_settings',
  );
  return $editors;
}

/**
 * Perform alterations on editor definitions.
 *
 * @param $editors
 *   Array of information on editors exposed by hook_editor_info()
 *   implementations.
 */
function hook_editor_info_alter(&$editors) {
  $editors['some_other_editor']['title'] = t('A different name');
}

/**
 * Perform alterations on the JavaScript settings that are added for filters.
 *
 * Note that changing settings here only affects the client side behavior of the
 * filter. To affect the filter globally both on the client side and server
 * side, use hook_filter_info_alter().
 *
 * @param array $settings
 *   All the settings that will be added to the page via backdrop_add_js() for
 *   the text formats to which a user has access.
 */
function hook_filter_js_settings_alter(&$settings) {
  $settings['full_html']['allowed_tags'][] = 'strong';
  $settings['full_html']['allowed_tags'][] = 'em';
  $settings['full_html']['allowed_tags'][] = 'img';
}

/**
 * @} End of "addtogroup hooks".
 */

/**
 * Provide a settings form for filter settings.
 *
 * Callback for hook_filter_info().
 *
 * This callback function is used to provide a settings form for filter
 * settings, for filters that need settings on a per-text-format basis. This
 * function should return the form elements for the settings; the filter
 * module will take care of saving the settings in the database.
 *
 * If the filter's behavior depends on an extensive list and/or external data
 * (e.g. a list of smileys, a list of glossary terms), then the filter module
 * can choose to provide a separate, global configuration page rather than
 * per-text-format settings. In that case, the settings callback function
 * should provide a link to the separate settings page.
 *
 * @param $form
 *   The prepopulated form array of the filter administration form.
 * @param $form_state
 *   The state of the (entire) configuration form.
 * @param $filter
 *   The filter array containing the current settings for the given format,
 *   in $filter['settings'].
 * @param $format
 *   The format object being configured.
 *
 * @return
 *   An array of form elements defining settings for the filter. Array keys
 *   should match the array keys in $filter->settings and $defaults.
 *
 * @ingroup callbacks
 */
function callback_filter_settings($form, &$form_state, $filter, $format) {
  $elements = array();
  $elements['nofollow'] = array(
    '#type' => 'checkbox',
    '#title' => t('Add rel="nofollow" to all links'),
    '#default_value' => $filter->settings['nofollow'],
  );
  return $elements;
}

/**
 * Provide prepared text with special characters escaped.
 *
 * Callback for hook_filter_info().
 *
 * See hook_filter_info() for a description of the filtering process. Filters
 * should not use the 'prepare callback' step for anything other than escaping,
 * because that would short-circuit the control the user has over the order in
 * which filters are applied.
 *
 * @param $text
 *   The text string to be filtered.
 * @param $filter
 *   The filter object containing settings for the given format.
 * @param $format
 *   The text format object assigned to the text to be filtered.
 * @param $langcode
 *   The language code of the text to be filtered.
 * @param $cache
 *   A Boolean indicating whether the filtered text is going to be cached in
 *   {cache_filter}.
 * @param $cache_id
 *   The ID of the filtered text in {cache_filter}, if $cache is TRUE.
 *
 * @return
 *   The prepared, escaped text.
 *
 * @ingroup callbacks
 */
function callback_filter_prepare($text, $filter, $format, $langcode, $cache, $cache_id) {
  // Escape <code> and </code> tags.
  $text = preg_replace('|<code>(.+?)</code>|se', "[codefilter_code]$1[/codefilter_code]", $text);
  return $text;
}

/**
 * Provide text filtered to conform to the supplied format.
 *
 * Callback for hook_filter_info().
 *
 * See hook_filter_info() for a description of the filtering process. This step
 * is where the filter actually transforms the text.
 *
 * @param $text
 *   The text string to be filtered.
 * @param $filter
 *   The filter object containing settings for the given format.
 * @param $format
 *   The text format object assigned to the text to be filtered.
 * @param $langcode
 *   The language code of the text to be filtered.
 * @param $cache
 *   A Boolean indicating whether the filtered text is going to be cached in
 *   {cache_filter}.
 * @param $cache_id
 *   The ID of the filtered text in {cache_filter}, if $cache is TRUE.
 *
 * @return
 *   The filtered text.
 *
 * @ingroup callbacks
 */
function callback_filter_process($text, $filter, $format, $langcode, $cache, $cache_id) {
  $text = preg_replace('|\[codefilter_code\](.+?)\[/codefilter_code\]|se', "<pre>$1</pre>", $text);

  return $text;
}

/**
 * Returns HTML allowed by this filter's configuration.
 *
 * This callback function is only necessary for filters that strip away HTML
 * tags (and possibly attributes) and allows other modules to gain insight in
 * a generic manner into which HTML tags and attributes are allowed by a
 * format.
 *
 * Note that providing this callback does not mean that Backdrop will strip out
 * these tags for you. This still must be done using callback_filter_prepare()
 * and callback_filter_process(). This callback is used to collect the
 * end-result list of tags and attributes so that it may be passed to front-end
 * editors such as CKEditor.
 *
 * @param $filter
 *   The filter object containing settings for the given format.
 * @param $format
 *   The full text format object.
 *
 * @return array
 *   A nested array with the following keys:
 *     - 'allowed': (optional) the allowed tags as keys, and for each of those
 *       tags (keys) either of the following values:
 *       - TRUE to indicate any attribute is allowed.
 *       - FALSE to indicate no attributes are allowed.
 *       - an array to convey attribute restrictions: the keys must be
 *         attribute names (which may use a wildcard, e.g. "data-*"), the
 *         possible values are similar to the above:
 *           - TRUE to indicate any attribute value is allowed.
 *           - FALSE to indicate the attribute is forbidden.
 *           - an array to convey attribute value restrictions: the key must
 *             be attribute values (which may use a wildcard, e.g. "xsd:*"),
 *             the possible values are TRUE or FALSE: to mark the attribute
 *             value as allowed or forbidden, respectively.
 *     - 'forbidden': (optional) the forbidden tags.
 *
 *   There is one special case: the "wildcard tag", "*": any attribute
 *   restrictions on that pseudo-tag apply to all tags.
 *
 *   Here is an extensive example, for a very granular filter:
 *   @code
 *   array(
 *     'allowed' => array(
 *       // Allows any attribute with any value on the <div> tag.
 *       'div' => TRUE,
 *       // Allows no attributes on the <p> tag.
 *       'p' => FALSE,
 *       // Allows the following attributes on the <a> tag:
 *       //  - 'href', with any value;
 *       //  - 'rel', with the value 'nofollow' value.
 *       'a' => array(
 *         'href' => TRUE,
 *         'rel' => array('nofollow' => TRUE),
 *       ),
 *       // Only allows the 'src' and 'alt' attributes on the <alt> tag,
 *       // with any value.
 *       'img' => array(
 *         'src' => TRUE,
 *         'alt' => TRUE,
 *       ),
 *       // Allow RDFa on <span> tags, using only the dc, foaf, xsd and sioc
 *       // vocabularies/namespaces.
 *       'span' => array(
 *         'property' => array('dc:*' => TRUE, 'foaf:*' => TRUE),
 *         'datatype' => array('xsd:*' => TRUE),
 *         'rel' => array('sioc:*' => TRUE),
 *       ),
 *       // Forbid the 'style' and 'on*' ('onClick' etc.) attributes on any
 *       // tag.
 *       '*' => array(
 *         'style' => FALSE,
 *         'on*' => FALSE,
 *       ),
 *     )
 *   )
 *   @endcode
 *
 *   A simpler example disallowing a few tags:
 *   @code
 *   array(
 *     'forbidden' => array('iframe', 'script')
 *   )
 *   @endcode
 *
 *   A filter that doesn't allow any HTML at all.
 *   @code
 *   array(
 *     'allowed' => array()
 *   )
 *   @endcode
 *
 *   And for a filter that applies no restrictions, i.e. allows any HTML:
 *   @code
 *   FALSE
 *   @endcode
 *
 * @see filter_format_allowed_html()
 */
function callback_filter_allowed_html($filter, $format) {
  // This example is pulled from "filter_html" filter provided by core.
  $restrictions = array('allowed' => array());
  $tags = preg_split('/\s+|<|>/', $filter->settings['allowed_html'], -1, PREG_SPLIT_NO_EMPTY);
  // List the allowed HTML tags.
  foreach ($tags as $tag) {
    $restrictions['allowed'][$tag] = TRUE;
  }
  // The 'style' and 'on*' ('onClick' etc.) attributes are always forbidden.
  $restrictions['allowed']['*'] = array('style' => FALSE, 'on*' => FALSE);
  return $restrictions;
}

/**
 * Return help text for a filter.
 *
 * Callback for hook_filter_info().
 *
 * A filter's tips should be informative and to the point. Short tips are
 * preferably one-liners.
 *
 * @param $filter
 *   An object representing the filter.
 * @param $format
 *   An object representing the text format the filter is contained in.
 * @param $long
 *   Whether this callback should return a short tip to display in a form
 *   (FALSE), or whether a more elaborate filter tips should be returned for
 *   theme_filter_tips() (TRUE).
 *
 * @return
 *   Translated text to display as a tip.
 *
 * @ingroup callbacks
 */
function callback_filter_tips($filter, $format, $long) {
 if ($long) {
    return t('Lines and paragraphs are automatically recognized. The &lt;br /&gt; line break, &lt;p&gt; paragraph and &lt;/p&gt; close paragraph tags are inserted automatically. If paragraphs are not recognized simply add a couple blank lines.');
  }
  else {
    return t('Lines and paragraphs break automatically.');
  }
}

/**
 * JavaScript settings callback for hook_filter_info().
 *
 * Note: This is not really a hook. The function name is manually specified via
 * 'js settings callback' in hook_filter_info(), with this recommended callback
 * name pattern. It is called from filter_get_js_settings().
 *
 * Some filters include a JavaScript implementation of their filter that can be
 * used in editing interfaces. This integration can be used by rich text editors
 * to provide a better WYSIWYG experience, where the filtering is simulated in
 * a way that helps the user understand the effects of a filter while editing
 * content. This callback allows configuration options for a filter to be passed
 * to the page as a JavaScript setting. As not all settings need to be passed
 * to the client side, this function may be used to send only applicable
 * settings.
 *
 * @param $filter
 *   The filter object containing the current settings for the given format,
 *   in $filter->settings.
 * @param $format
 *   The format object which contains the filter.
 * @param $filters
 *   The complete list of filter objects that are enabled for the given format.
 *
 * @return
 *   An array of settings that will be added to the page for use by this
 *   filter's JavaScript integration.
 */
function hook_filter_FILTER_js_settings($filter, $format, $filters) {
  return array(
    'myFilterSetting' => $filter->settings['my_filter_setting'],
  );
}

/**
 * Settings callback for hook_editor_info().
 *
 * Note: This is not really a hook. The function name is manually specified via
 * 'settings callback' in hook_editor_info(), with this recommended callback
 * name pattern. It is called from filter_admin_format_form().
 *
 * This callback function is used to provide a settings form for editor
 * settings. This function should return the form elements for the settings; the
 * Filter module will take care of saving the settings in the database.
 *
 * If the editor's behavior depends on an extensive list and/or external data,
 * then the editor module can choose to provide a separate, global configuration
 * page rather than per-text-format settings. In that case, the settings
 * callback function should provide a link to the separate settings page.
 *
 * @param $form
 *   The prepopulated form array of the filter administration form.
 * @param $form_state
 *   The state of the (entire) configuration form.
 * @param $format
 *   The format object being configured.
 * @param $defaults
 *   The default settings for the editor, as defined in 'default settings' in
 *   hook_editor_info(). These should be combined with $editor->settings to
 *   define the form element defaults.
 * @param $filters
 *   The complete list of filter objects that are enabled for the given format.
 *
 * @return
 *   An array of form elements defining settings for the filter. Array keys
 *   should match the array keys in $filter->settings and $defaults.
 */
function hook_editor_EDITOR_settings($form, &$form_state, $format, $defaults, $filters) {
  $format->settings += $defaults;

  $elements = array();
  $elements['enable_toolbar'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable toolbar'),
    '#default_value' => $format->settings['enable_toolbar'],
  );
  $elements['buttons'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Enabled buttons'),
    '#options' => array(
      'bold' => t('Bold'),
      'italic' => t('Italic'),
      'underline' => t('Underline'),
      'link' => t('Link'),
      'image' => t('Image'),
    ),
    '#default_value' => $format->settings['buttons'],
  );
  $elements['resizeable'] = array(
    '#type' => 'checkbox',
    '#title' => t('Resizeable'),
    '#default_value' => $format->settings['resizeable'],
  );
  return $elements;
}

/**
 * JavaScript settings callback for hook_editor_info().
 *
 * Note: This is not really a hook. The function name is manually specified via
 * 'js settings callback' in hook_editor_info(), with this recommended callback
 * name pattern. It is called from filter_get_js_settings().
 *
 * Most editors use JavaScript to provide a WYSIWYG or toolbar on the client
 * side interface. This callback can be used to convert internal settings of the
 * editor into JavaScript variables that will be accessible when the editor
 * is loaded.
 *
 * @param $format
 *   The format object on which this editor will be used.
 * @param $filters
 *   The complete list of filter objects that are enabled for the given format.
 * @param $existing_settings
 *   The existing settings that have so far been added to the page, including
 *   all settings by individual filters. The existing settings added by filters
 *   can be used to adjust the editor-specific settings.
 *
 * @return
 *   An array of settings that will be added to the page for use by this
 *   editor's JavaScript integration.
 */
function hook_editor_EDITOR_js_settings($format, $filters, $existing_settings) {
  return array(
    'toolbar' => $format->settings['enable_toolbar'],
    'buttons' => $format->settings['buttons'],
    'resizeable' => $format->settings['resizeable'],
  );
}

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Perform actions when a new text format has been created.
 *
 * @param $format
 *   The format object of the format being updated.
 *
 * @see hook_filter_format_update()
 * @see hook_filter_format_disable()
 */
function hook_filter_format_insert($format) {
  mymodule_cache_rebuild();
}

/**
 * Perform actions when a text format has been updated.
 *
 * This hook allows modules to act when a text format has been updated in any
 * way. For example, when filters have been reconfigured, disabled, or
 * re-arranged in the text format.
 *
 * @param $format
 *   The format object of the format being updated.
 *
 * @see hook_filter_format_insert()
 * @see hook_filter_format_disable()
 */
function hook_filter_format_update($format) {
  mymodule_cache_rebuild();
}

/**
 * Perform actions when a text format has been disabled.
 *
 * @param $format
 *   The format object of the format being disabled.
 *
 * @see hook_filter_format_insert()
 * @see hook_filter_format_update()
 */
function hook_filter_format_disable($format) {
  mymodule_cache_rebuild();
}

/**
 * @} End of "addtogroup hooks".
 */
