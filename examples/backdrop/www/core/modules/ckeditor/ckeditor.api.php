<?php
/**
 * @file
 * Documentation for CKEditor module APIs.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Provides a list of CKEditor plugins.
 *
 * Each plugin for CKEditor must provide an array of properties containing
 * information about the plugin. At minimum, plugins must provide a path and
 * file location so that CKEditor may add the plugin. Available properties for
 * each plugin include:
 *
 * - location: Required for all external plugins. String path to the plugin
 *   directory relative to the Backdrop installation root. Do not include a
 *   trailing slash.
 * - file: Required for all external plugins. String file name of the plugin in
 *   the "location" directory.
 * - internal: Boolean value indicating if the plugin is part of the compressed
 *   CKEditor library package and already loaded on all instances. If TRUE,
 *   the "location" and "file" properties are not needed.
 * - css: An array of CSS files that should be added by CKEditor. These files
 *   are used only when CKEditor is using an iframe wrapper around its content.
 *   If a plugin needs to include CSS for inline and iframe versions, it should
 *   add its CSS via CKEditor's JavaScript CKEDITOR.addCss() method.
 * - enabled callback: String containing a function name that can determine if
 *   this plugin should be enabled based on the current editor configuration.
 *   See the hook_ckeditor_PLUGIN_plugin_check() function for an example.
 * - buttons: An array of buttons that are provided by this plugin. Each button
 *   should by keyed by its CKEditor button name, and should contain an array
 *   of button properties, including:
 *   - label: A human-readable, translated button name.
 *   - image: An image for the button to be used in the toolbar.
 *   - image_rtl: If the image needs to have a right-to-left version, specify
 *     an alternative file that will be used in RTL editors.
 *   - image_alternative: If this button does not render as an image, specify
 *     an HTML string representing the contents of this button. This alternative
 *     will only be used in the administrative section for assembling the
 *     toolbar.
 *   - attributes: An array of HTML attributes which should be added to this
 *     button when rendering the button in the administrative section for
 *     assembling the toolbar.
 *   - multiple: Boolean value indicating if this button may be added multiple
 *     times to the toolbar. This typically is only applicable for dividers and
 *     group indicators.
 *   - required_html: If this button requires certain HTML tags or attributes
 *     to be allowed, specify an nested array for each set of tags that should
 *     be allowed. For example:
 *   - dependencies: An array of other plugin names on which this button
 *     depends. A common use is to add the "contextmenu" plugin, if the button
 *     makes options available only via contextual menu.
 *
 *     @code
 *     array(
 *       array(
 *         'tags' => array('a'),
 *         'attributes' => array('href', 'alt'),
 *         'styles' => array('color', 'text-decoration'),
 *         'classes' => array('external', 'internal'),
 *       ),
 *     );
 *     @endcode
 *
 *     Note that this must be a nested array, to allow for the button to require
 *     different attributes on different tags.
 *   - optional_html: If this button can work with or without certain tags or
 *     attributes in a reduced manner, then specify additional values that can
 *     be used to provide the full functionality. This should match the same
 *     format as the "required_html" return value.
 *
 * @return array
 *   An array of plugin definitions, keyed by the plugin name.
 *
 * @see ckeditor_ckeditor_plugins()
 * @see hook_ckeditor_PLUGIN_plugin_check()
 */
function hook_ckeditor_plugins() {
  $plugins['myplugin'] = array(
    'path' => backdrop_get_path('module', 'mymodule') . '/js/myplugin',
    'file' => 'plugin.js',
    'css' => array(backdrop_get_path('module', 'mymodule') . '/css/myplugin.css'),
    'enabled callback' => 'mymodule_myplugin_plugin_check',
    'buttons' => array(
      'MyPlugin' => array(
        'label' => t('My custom button'),
        'required_html' => array(
          'tags' => array('a'),
          'attributes' => array('href', 'alt'),
          'styles' => array('color', 'text-decoration'),
          'classes' => array('external', 'internal'),
        ),
        'dependencies' => array('contextmenu'),
      ),
    ),
  );

  return $plugins;
}

/**
 * Modify the list of available CKEditor plugins.
 *
 * This hook may be used to modify plugin properties after they have been
 * specified by other modules.
 *
 * @param $plugins
 *   An array of all the existing plugin definitions, passed by reference.
 *
 * @see hook_ckeditor_plugins()
 */
function hook_ckeditor_plugins_alter(array &$plugins) {
  $plugins['someplugin']['enabled callback'] = 'mymodule_someplugin_enabled_callback';
}

/**
 * Modify the list of CSS files that will be added to a CKEditor instance.
 *
 * Modules may use this hook to provide their own custom CSS file without
 * providing a CKEditor plugin. This list of CSS files is only used in the
 * iframe versions of CKEditor.
 *
 * Note that because this hook is only called for modules and the active theme,
 * front-end themes will not be able to use this hook to add their own CSS files
 * if a different admin theme is active. Instead, front-end themes and base
 * themes may specify CSS files to be used in iframe instances of CKEditor
 * through an entry in their .info file:
 *
 * @code
 * ckeditor_stylesheets[] = css/ckeditor-iframe.css
 * @endcode
 *
 * @param $css
 *   An array of CSS files, passed by reference. This is a flat list of file
 *   paths relative to the Backdrop root.
 * @param $format
 *   The corresponding text format object as returned by filter_format_load()
 *   for which the current text editor is being displayed.
 *
 * @see _ckeditor_theme_css()
 */
function hook_ckeditor_css_alter(array &$css, $format) {
  $css[] = backdrop_get_path('module', 'mymodule') . '/css/mymodule-ckeditor.css';
}

/**
 * Modify the raw CKEditor settings passed to the editor.
 *
 * This hook can be useful if you have created a CKEditor plugin that needs
 * additional settings passed to it from Backdrop. In particular, because
 * CKEditor loads JavaScript files directly, use of Backdrop.t() in these
 * plugins will not work. You may use this hook to provide translated strings
 * for your plugin.
 *
 * @param array $settings
 *   The array of settings that will be passed to CKEditor.
 * @param $format
 *   The filter format object containing this editor's settings.
 */
function hook_ckeditor_settings_alter(array &$settings, $format) {
  foreach ($format->editor_settings['toolbar'] as $row) {
    foreach ($row as $button_group) {
      // If a particular button is enabled, then add extra settings.
      if (array_key_exists('MyPlugin', $button_group)) {
        // Pull settings from the format and pass to the JavaScript settings.
        $settings['backdrop']['myplugin_settings'] = $format->editor_settings['myplugin_settings'];
        // Translate a string for use by CKEditor.
        $settings['backdrop']['myplugin_help'] = t('A translated string example that will be used by CKEditor.');
      }
    }
  }
}

/**
 * @} End of "addtogroup hooks".
 */

/**
 * Enabled callback for hook_ckeditor_plugins().
 *
 * Note: This is not really a hook. The function name is manually specified via
 * 'enabled callback' in hook_ckeditor_plugins(), with this recommended callback
 * name pattern. It is called from ckeditor_add_settings().
 *
 * This callback should determine if a plugin should be enabled for a CKEditor
 * instance. Plugins may be enabled based off an explicit setting, or enable
 * themselves based on the configuration of another setting, such as enabling
 * based on a particular button being present in the toolbar.
 *
 * @param object $format
 *   An format object as returned by filter_format_load(). The editor's settings
 *   may be found in $format->editor_settings.
 * @param string $plugin_name
 *   String name of the plugin that is being checked.
 *
 * @return boolean
 *   Boolean TRUE if the plugin should be enabled, FALSE otherwise.
 *
 * @see hook_ckeditor_plugins()
 * @see ckeditor_add_settings()
 *
 * @ingroup callbacks
 */
function hook_ckeditor_PLUGIN_plugin_check($format, $plugin_name) {
  // Automatically enable this plugin if the Underline button is enabled.
  foreach ($format->editor_settings['toolbar']['buttons'] as $row) {
    if (in_array('Underline', $row)) {
      return TRUE;
    }
  }
}
