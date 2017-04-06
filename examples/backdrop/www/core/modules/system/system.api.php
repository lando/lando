<?php
/**
 * @file
 * Hooks provided by Backdrop core and the System module.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Defines one or more hooks that are exposed by a module.
 *
 * Normally hooks do not need to be explicitly defined. However, by declaring a
 * hook explicitly, a module may define a "group" for it. Modules that implement
 * a hook may then place their implementation in either $module.module or in
 * $module.$group.inc. If the hook is located in $module.$group.inc, then that
 * file will be automatically loaded when needed.
 * In general, hooks that are rarely invoked and/or are very large should be
 * placed in a separate include file, while hooks that are very short or very
 * frequently called should be left in the main module file so that they are
 * always available.
 *
 * @return
 *   An associative array whose keys are hook names and whose values are an
 *   associative array containing:
 *   - group: A string defining the group to which the hook belongs. The module
 *     system will determine whether a file with the name $module.$group.inc
 *     exists, and automatically load it when required.
 *
 * See system_hook_info() for all hook groups defined by Backdrop core.
 *
 * @see hook_hook_info_alter().
 */
function hook_hook_info() {
  $hooks['token_info'] = array(
    'group' => 'tokens',
  );
  $hooks['tokens'] = array(
    'group' => 'tokens',
  );
  return $hooks;
}

/**
 * Alter information from hook_hook_info().
 *
 * @param $hooks
 *   Information gathered by module_hook_info() from other modules'
 *   implementations of hook_hook_info(). Alter this array directly.
 *   See hook_hook_info() for information on what this may contain.
 */
function hook_hook_info_alter(&$hooks) {
  // Our module wants to completely override the core tokens, so make
  // sure the core token hooks are not found.
  $hooks['token_info']['group'] = 'mytokens';
  $hooks['tokens']['group'] = 'mytokens';
}

/**
 * Define administrative paths.
 *
 * Modules may specify whether or not the paths they define in hook_menu() are
 * to be considered administrative. Other modules may use this information to
 * display those pages differently (e.g. in a different theme).
 *
 * To change the administrative status of menu items defined in another module's
 * hook_menu(), modules should implement hook_admin_paths_alter().
 *
 * @return
 *   An associative array. For each item, the key is the path in question, in
 *   a format acceptable to backdrop_match_path(). The value for each item should
 *   be TRUE (for paths considered administrative) or FALSE (for non-
 *   administrative paths).
 *
 * @see hook_menu()
 * @see backdrop_match_path()
 * @see hook_admin_paths_alter()
 */
function hook_admin_paths() {
  $paths = array(
    'mymodule/*/add' => TRUE,
    'mymodule/*/edit' => TRUE,
  );
  return $paths;
}

/**
 * Redefine administrative paths defined by other modules.
 *
 * @param $paths
 *   An associative array of administrative paths, as defined by implementations
 *   of hook_admin_paths().
 *
 * @see hook_admin_paths()
 */
function hook_admin_paths_alter(&$paths) {
  // Treat all user pages as administrative.
  $paths['user'] = TRUE;
  $paths['user/*'] = TRUE;
  // Treat the post node form as a non-administrative page.
  $paths['node/add/post'] = FALSE;
}

/**
 * Perform periodic actions.
 *
 * Modules that require some commands to be executed periodically can
 * implement hook_cron(). The engine will then call the hook whenever a cron
 * run happens, as defined by the administrator. Typical tasks managed by
 * hook_cron() are database maintenance, backups, recalculation of settings
 * or parameters, automated mailing, and retrieving remote data.
 *
 * Short-running or non-resource-intensive tasks can be executed directly in
 * the hook_cron() implementation.
 *
 * Long-running tasks and tasks that could time out, such as retrieving remote
 * data, sending email, and intensive file tasks, should use the queue API
 * instead of executing the tasks directly. To do this, first define one or
 * more queues via hook_cron_queue_info(). Then, add items that need to be
 * processed to the defined queues.
 */
function hook_cron() {
  // Short-running operation example, not using a queue.
  db_delete('history')
    ->condition('timestamp', NODE_NEW_LIMIT, '<')
    ->execute();
}

/**
 * Declare queues holding items that need to be run periodically.
 *
 * While there can be only one hook_cron() process running at the same time,
 * there can be any number of processes defined here running. Because of
 * this, long running tasks are much better suited for this API. Items queued
 * in hook_cron() might be processed in the same cron run if there are not many
 * items in the queue, otherwise it might take several requests, which can be
 * run in parallel.
 *
 * @return
 *   An associative array where the key is the queue name and the value is
 *   again an associative array. Possible keys are:
 *   - 'worker callback': A PHP callable to call that is an implementation of
 *     callback_queue_worker().
 *   - 'time': (optional) How much time Backdrop should spend on calling this
 *     worker in seconds. Defaults to 15.
 *   - 'skip on cron': (optional) Set to TRUE to avoid being processed during
 *     cron runs. i.e. you want to control all queue execution manually.
 *
 * @see hook_cron()
 * @see hook_cron_queue_info_alter()
 */
function hook_cron_queue_info() {
  $queues['aggregator_feeds'] = array(
    'worker callback' => 'aggregator_refresh',
    'time' => 60,
  );
  return $queues;
}

/**
 * Alter cron queue information before cron runs.
 *
 * Called by backdrop_cron_run() to allow modules to alter cron queue settings
 * before any jobs are processesed.
 *
 * @param array $queues
 *   An array of cron queue information.
 *
 * @see hook_cron_queue_info()
 * @see backdrop_cron_run()
 */
function hook_cron_queue_info_alter(&$queues) {
  // This site has many feeds so let's spend 90 seconds on each cron run
  // updating feeds instead of the default 60.
  $queues['aggregator_feeds']['time'] = 90;
}

/**
 * Work on a single queue item.
 *
 * Callback for hook_queue_info().
 *
 * @param $queue_item_data
 *   The data that was passed to BackdropQueue::createItem() when the item was
 *   queued.
 *
 * @throws \Exception
 *   The worker callback may throw an exception to indicate there was a problem.
 *   The cron process will log the exception, and leave the item in the queue to
 *   be processed again later.
 *
 * @see backdrop_cron_run()
 */
function callback_queue_worker($queue_item_data) {
  $node = node_load($queue_item_data);
  $node->title = 'Updated title';
  $node->save();
}

/**
 * Allows modules to declare their own Form API element types and specify their
 * default values.
 *
 * This hook allows modules to declare their own form element types and to
 * specify their default values. The values returned by this hook will be
 * merged with the elements returned by hook_form() implementations and so
 * can return defaults for any Form APIs keys in addition to those explicitly
 * mentioned below.
 *
 * Each of the form element types defined by this hook is assumed to have
 * a matching theme function, e.g. theme_elementtype(), which should be
 * registered with hook_theme() as normal.
 *
 * For more information about custom element types see the explanation at
 * http://drupal.org/node/169815.
 *
 * @return
 *  An associative array describing the element types being defined. The array
 *  contains a sub-array for each element type, with the machine-readable type
 *  name as the key. Each sub-array has a number of possible attributes:
 *  - "#input": boolean indicating whether or not this element carries a value
 *    (even if it's hidden).
 *  - "#process": array of callback functions taking $element, $form_state,
 *    and $complete_form.
 *  - "#after_build": array of callback functions taking $element and $form_state.
 *  - "#validate": array of callback functions taking $form and $form_state.
 *  - "#element_validate": array of callback functions taking $element and
 *    $form_state.
 *  - "#pre_render": array of callback functions taking $element and $form_state.
 *  - "#post_render": array of callback functions taking $element and $form_state.
 *  - "#submit": array of callback functions taking $form and $form_state.
 *  - "#title_display": optional string indicating if and how #title should be
 *    displayed, see theme_form_element() and theme_form_element_label().
 *
 * @see hook_element_info_alter()
 * @see system_element_info()
 */
function hook_element_info() {
  $types['filter_format'] = array(
    '#input' => TRUE,
  );
  return $types;
}

/**
 * Alter the element type information returned from modules.
 *
 * A module may implement this hook in order to alter the element type defaults
 * defined by a module.
 *
 * @param $type
 *   All element type defaults as collected by hook_element_info().
 *
 * @see hook_element_info()
 */
function hook_element_info_alter(&$type) {
  // Decrease the default size of textfields.
  if (isset($type['textfield']['#size'])) {
    $type['textfield']['#size'] = 40;
  }
}

/**
 * Perform cleanup tasks.
 *
 * This hook is run at the end of most regular page requests. It is often
 * used for page logging and specialized cleanup. This hook MUST NOT print
 * anything because by the time it runs the response is already sent to
 * the browser.
 *
 * This hook by default is not called on pages served by the default page cache,
 * but can be enabled through the $settings['invoke_page_cache_hooks'] option in
 * settings.php.
 *
 * @param $destination
 *   If this hook is invoked as part of a backdrop_goto() call, then this argument
 *   will be a fully-qualified URL that is the destination of the redirect.
 */
function hook_exit($destination = NULL) {
  db_update('counter')
    ->expression('hits', 'hits + 1')
    ->condition('type', 1)
    ->execute();
}

/**
 * Perform necessary alterations to the JavaScript before it is presented on
 * the page.
 *
 * @param $javascript
 *   An array of all JavaScript being presented on the page.
 *
 * @see backdrop_add_js()
 * @see backdrop_get_js()
 * @see backdrop_js_defaults()
 */
function hook_js_alter(&$javascript) {
  // Swap out jQuery to use an updated version of the library.
  $javascript['core/misc/jquery.js']['data'] = backdrop_get_path('module', 'jquery_update') . '/jquery.js';
}

/**
 * Registers JavaScript/CSS libraries associated with a module.
 *
 * Modules implementing this return an array of arrays. The key to each
 * sub-array is the machine readable name of the library. Each library may
 * contain the following items:
 *
 * - 'title': The human readable name of the library.
 * - 'website': The URL of the library's web site.
 * - 'version': A string specifying the version of the library; intentionally
 *   not a float because a version like "1.2.3" is not a valid float. Use PHP's
 *   version_compare() to compare different versions.
 * - 'js': An array of JavaScript elements; each element's key is used as $data
 *   argument, each element's value is used as $options array for
 *   backdrop_add_js(). To add library-specific (not module-specific) JavaScript
 *   settings, the key may be skipped, the value must specify
 *   'type' => 'setting', and the actual settings must be contained in a 'data'
 *   element of the value.
 * - 'css': Like 'js', an array of CSS elements passed to backdrop_add_css().
 * - 'dependencies': An array of libraries that are required for a library. Each
 *   element is an array listing the module and name of another library. Note
 *   that all dependencies for each dependent library will also be added when
 *   this library is added.
 *
 * Registered information for a library should contain re-usable data only.
 * Module- or implementation-specific data and integration logic should be added
 * separately.
 *
 * @return
 *   An array defining libraries associated with a module.
 *
 * @see system_library_info()
 * @see backdrop_add_library()
 * @see backdrop_get_library()
 */
function hook_library_info() {
  // Library One.
  $libraries['library-1'] = array(
    'title' => 'Library One',
    'website' => 'http://example.com/library-1',
    'version' => '1.2',
    'js' => array(
      backdrop_get_path('module', 'my_module') . '/library-1.js' => array(),
    ),
    'css' => array(
      backdrop_get_path('module', 'my_module') . '/library-2.css' => array(
        'type' => 'file',
        'media' => 'screen',
      ),
    ),
  );
  // Library Two.
  $libraries['library-2'] = array(
    'title' => 'Library Two',
    'website' => 'http://example.com/library-2',
    'version' => '3.1-beta1',
    'js' => array(
      // JavaScript settings may use the 'data' key.
      array(
        'type' => 'setting',
        'data' => array('library2' => TRUE),
      ),
    ),
    'dependencies' => array(
      // Require jQuery UI core by System module.
      array('system', 'ui'),
      // Require our other library.
      array('my_module', 'library-1'),
      // Require another library.
      array('other_module', 'library-3'),
    ),
  );
  return $libraries;
}

/**
 * Alters the JavaScript/CSS library registry.
 *
 * Allows certain, contributed modules to update libraries to newer versions
 * while ensuring backwards compatibility. In general, such manipulations should
 * only be done by designated modules, since most modules that integrate with a
 * certain library also depend on the API of a certain library version.
 *
 * @param $libraries
 *   The JavaScript/CSS libraries provided by $module. Keyed by internal library
 *   name and passed by reference.
 * @param $module
 *   The name of the module that registered the libraries.
 *
 * @see hook_library_info()
 */
function hook_library_info_alter(&$libraries, $module) {
  // Update Farbtastic to version 2.0.
  if ($module == 'system' && isset($libraries['farbtastic'])) {
    // Verify existing version is older than the one we are updating to.
    if (version_compare($libraries['farbtastic']['version'], '2.0', '<')) {
      // Update the existing Farbtastic to version 2.0.
      $libraries['farbtastic']['version'] = '2.0';
      $libraries['farbtastic']['js'] = array(
        backdrop_get_path('module', 'farbtastic_update') . '/farbtastic-2.0.js' => array(),
      );
    }
  }
}

/**
 * Alter CSS files before they are output on the page.
 *
 * @param $css
 *   An array of all CSS items (files and inline CSS) being requested on the page.
 *
 * @see backdrop_add_css()
 * @see backdrop_get_css()
 */
function hook_css_alter(&$css) {
  // Remove defaults.css file.
  unset($css[backdrop_get_path('module', 'system') . '/defaults.css']);
}

/**
 * Alter the commands that are sent to the user through the Ajax framework.
 *
 * @param $commands
 *   An array of all commands that will be sent to the user.
 *
 * @see ajax_render()
 */
function hook_ajax_render_alter(&$commands) {
  // Inject any new status messages into the content area.
  $commands[] = ajax_command_prepend('#block-system-main .content', theme('status_messages'));
}

/**
 * Alter a menu router item right after it has been retrieved from the database or cache.
 *
 * This hook is invoked by menu_get_item() and allows for run-time alteration of router
 * information (page_callback, title, and so on) before it is translated and checked for
 * access. The passed-in $router_item is statically cached for the current request, so this
 * hook is only invoked once for any router item that is retrieved via menu_get_item().
 *
 * Usually, modules will only want to inspect the router item and conditionally
 * perform other actions (such as preparing a state for the current request).
 * Note that this hook is invoked for any router item that is retrieved by
 * menu_get_item(), which may or may not be called on the path itself, so implementations
 * should check the $path parameter if the alteration should fire for the current request
 * only.
 *
 * @param $router_item
 *   The menu router item for $path.
 * @param $path
 *   The originally passed path, for which $router_item is responsible.
 * @param $original_map
 *   The path argument map, as contained in $path.
 *
 * @see menu_get_item()
 */
function hook_menu_get_item_alter(&$router_item, $path, $original_map) {
  // When retrieving the router item for the current path...
  if ($path == $_GET['q']) {
    // ...call a function that prepares something for this request.
    mymodule_prepare_something();
  }
}

/**
 * Define menu items and page callbacks.
 *
 * This hook enables modules to register paths in order to define how URL
 * requests are handled. Paths may be registered for URL handling only, or they
 * can register a link to be placed in a menu (usually the Main menu). A path
 * and its associated information is commonly called a "menu router item".
 * This hook is rarely called (for example, when modules are enabled), and
 * its results are cached in the database.
 *
 * hook_menu() implementations return an associative array whose keys define
 * paths and whose values are an associative array of properties for each
 * path. (The complete list of properties is in the return value section below.)
 *
 * @section sec_callback_funcs Callback Functions
 * The definition for each path may include a page callback function, which is
 * invoked when the registered path is requested. If there is no other
 * registered path that fits the requested path better, any further path
 * components are passed to the callback function. For example, your module
 * could register path 'abc/def':
 * @code
 *   function mymodule_menu() {
 *     $items['abc/def'] = array(
 *       'page callback' => 'mymodule_abc_view',
 *     );
 *     return $items;
 *   }
 *
 *   function mymodule_abc_view($ghi = 0, $jkl = '') {
 *     // ...
 *   }
 * @endcode
 * When path 'abc/def' is requested, no further path components are in the
 * request, and no additional arguments are passed to the callback function (so
 * $ghi and $jkl would take the default values as defined in the function
 * signature). When 'abc/def/123/foo' is requested, $ghi will be '123' and
 * $jkl will be 'foo'. Note that this automatic passing of optional path
 * arguments applies only to page and theme callback functions.
 *
 * @subsection sub_callback_arguments Callback Arguments
 * In addition to optional path arguments, the page callback and other callback
 * functions may specify argument lists as arrays. These argument lists may
 * contain both fixed/hard-coded argument values and integers that correspond
 * to path components. When integers are used and the callback function is
 * called, the corresponding path components will be substituted for the
 * integers. That is, the integer 0 in an argument list will be replaced with
 * the first path component, integer 1 with the second, and so on (path
 * components are numbered starting from zero). To pass an integer without it
 * being replaced with its respective path component, use the string value of
 * the integer (e.g., '1') as the argument value. This substitution feature
 * allows you to re-use a callback function for several different paths. For
 * example:
 * @code
 *   function mymodule_menu() {
 *     $items['abc/def'] = array(
 *       'page callback' => 'mymodule_abc_view',
 *       'page arguments' => array(1, 'foo'),
 *     );
 *     return $items;
 *   }
 * @endcode
 * When path 'abc/def' is requested, the page callback function will get 'def'
 * as the first argument and (always) 'foo' as the second argument.
 *
 * If a page callback function uses an argument list array, and its path is
 * requested with optional path arguments, then the list array's arguments are
 * passed to the callback function first, followed by the optional path
 * arguments. Using the above example, when path 'abc/def/bar/baz' is requested,
 * mymodule_abc_view() will be called with 'def', 'foo', 'bar' and 'baz' as
 * arguments, in that order.
 *
 * Special care should be taken for the page callback backdrop_get_form(), because
 * your specific form callback function will always receive $form and
 * &$form_state as the first function arguments:
 * @code
 *   function mymodule_abc_form($form, &$form_state) {
 *     // ...
 *     return $form;
 *   }
 * @endcode
 * See @link form_api Form API documentation @endlink for details.
 *
 * @section sec_path_wildcards Wildcards in Paths
 * @subsection sub_simple_wildcards Simple Wildcards
 * Wildcards within paths also work with integer substitution. For example,
 * your module could register path 'my-module/%/edit':
 * @code
 *   $items['my-module/%/edit'] = array(
 *     'page callback' => 'mymodule_abc_edit',
 *     'page arguments' => array(1),
 *   );
 * @endcode
 * When path 'my-module/foo/edit' is requested, integer 1 will be replaced
 * with 'foo' and passed to the callback function. Note that wildcards may not
 * be used as the first component.
 *
 * @subsection sub_autoload_wildcards Auto-Loader Wildcards
 * Registered paths may also contain special "auto-loader" wildcard components
 * in the form of '%mymodule_abc', where the '%' part means that this path
 * component is a wildcard, and the 'mymodule_abc' part defines the prefix for a
 * load function, which here would be named mymodule_abc_load(). When a matching
 * path is requested, your load function will receive as its first argument the
 * path component in the position of the wildcard; load functions may also be
 * passed additional arguments (see "load arguments" in the return value
 * section below). For example, your module could register path
 * 'my-module/%mymodule_abc/edit':
 * @code
 *   $items['my-module/%mymodule_abc/edit'] = array(
 *     'page callback' => 'mymodule_abc_edit',
 *     'page arguments' => array(1),
 *   );
 * @endcode
 * When path 'my-module/123/edit' is requested, your load function
 * mymodule_abc_load() will be invoked with the argument '123', and should
 * load and return an "abc" object with internal id 123:
 * @code
 *   function mymodule_abc_load($abc_id) {
 *     return db_query("SELECT * FROM {mymodule_abc} WHERE abc_id = :abc_id", array(':abc_id' => $abc_id))->fetchObject();
 *   }
 * @endcode
 * This 'abc' object will then be passed into the callback functions defined
 * for the menu item, such as the page callback function mymodule_abc_edit()
 * to replace the integer 1 in the argument array. Note that a load function
 * should return FALSE when it is unable to provide a loadable object. For
 * example, the node_load() function for the 'node/%node/edit' menu item will
 * return FALSE for the path 'node/999/edit' if a node with a node ID of 999
 * does not exist. The menu routing system will return a 404 error in this case.
 *
 * @subsection sub_argument_wildcards Argument Wildcards
 * You can also define a %wildcard_to_arg() function (for the example menu
 * entry above this would be 'mymodule_abc_to_arg()'). The _to_arg() function
 * is invoked to retrieve a value that is used in the path in place of the
 * wildcard. A good example is user.module, which defines
 * user_uid_optional_to_arg() (corresponding to the menu entry
 * 'tracker/%user_uid_optional'). This function returns the user ID of the
 * current user.
 *
 * The _to_arg() function will get called with three arguments:
 * - $arg: A string representing whatever argument may have been supplied by
 *   the caller (this is particularly useful if you want the _to_arg()
 *   function only supply a (default) value if no other value is specified,
 *   as in the case of user_uid_optional_to_arg().
 * - $map: An array of all path fragments (e.g. array('node','123','edit') for
 *   'node/123/edit').
 * - $index: An integer indicating which element of $map corresponds to $arg.
 *
 * _load() and _to_arg() functions may seem similar at first glance, but they
 * have different purposes and are called at different times. _load()
 * functions are called when the menu system is collecting arguments to pass
 * to the callback functions defined for the menu item. _to_arg() functions
 * are called when the menu system is generating links to related paths, such
 * as the tabs for a set of MENU_LOCAL_TASK items.
 *
 * @section sec_render_tabs Rendering Menu Items As Tabs
 * You can also make groups of menu items to be rendered (by default) as tabs
 * on a page. To do that, first create one menu item of type MENU_NORMAL_ITEM,
 * with your chosen path, such as 'foo'. Then duplicate that menu item, using a
 * subdirectory path, such as 'foo/tab1', and changing the type to
 * MENU_DEFAULT_LOCAL_TASK to make it the default tab for the group. Then add
 * the additional tab items, with paths such as "foo/tab2" etc., with type
 * MENU_LOCAL_TASK. Example:
 * @code
 * // Make "Foo settings" appear on the admin Config page
 * $items['admin/config/system/foo'] = array(
 *   'title' => 'Foo settings',
 *   'type' => MENU_NORMAL_ITEM,
 *   // Page callback, etc. need to be added here.
 * );
 * // Make "Tab 1" the main tab on the "Foo settings" page
 * $items['admin/config/system/foo/tab1'] = array(
 *   'title' => 'Tab 1',
 *   'type' => MENU_DEFAULT_LOCAL_TASK,
 *   // Access callback, page callback, and theme callback will be inherited
 *   // from 'admin/config/system/foo', if not specified here to override.
 * );
 * // Make an additional tab called "Tab 2" on "Foo settings"
 * $items['admin/config/system/foo/tab2'] = array(
 *   'title' => 'Tab 2',
 *   'type' => MENU_LOCAL_TASK,
 *   // Page callback and theme callback will be inherited from
 *   // 'admin/config/system/foo', if not specified here to override.
 *   // Need to add access callback or access arguments.
 * );
 * @endcode
 *
 * @return
 *   An array of menu items. Each menu item has a key corresponding to the
 *   Backdrop path being registered. The corresponding array value is an
 *   associative array that may contain the following key-value pairs:
 *   - "title": Required. The untranslated title of the menu item.
 *   - "title callback": Function to generate the title; defaults to t().
 *     If you require only the raw string to be output, set this to FALSE.
 *   - "title arguments": Arguments to send to t() or your custom callback,
 *     with path component substitution as described above.
 *   - "description": The untranslated description of the menu item.
 *   - "page callback": The function to call to display a web page when the user
 *     visits the path. If omitted, the parent menu item's callback will be used
 *     instead.
 *   - "page arguments": An array of arguments to pass to the page callback
 *     function, with path component substitution as described above.
 *   - "delivery callback": The function to call to package the result of the
 *     page callback function and send it to the browser. Defaults to
 *     backdrop_deliver_html_page() unless a value is inherited from a parent menu
 *     item. Note that this function is called even if the access checks fail,
 *     so any custom delivery callback function should take that into account.
 *     Backdrop includes the following delivery callbacks in core:
 *     - backdrop_deliver_html_page(): The default used for printing HTML pages.
 *       Menu items with this callback may be wrapped in a layout template by
 *       Layout module. See layout_route_handler().
 *     - backdrop_json_deliver: The value of the menu callback will be rendered
 *       as JSON without any further processing. This delivery callback should
 *       be used on any path that should return a JSON response at all times,
 *       even on access denied or 404 pages.
 *     - ajax_deliver: This delivery callback is used when returning AJAX
 *       commands that will be interpreted by Backdrop core's ajax.js file. This
 *       delivery callback is set automatically if the menu callback returns a
 *       renderable element with the #type property "ajax_commands".
 *     - ajax_deliver_dialog: This delivery callback is used when the contents
 *       of a menu callback should be returned as AJAX commands to open as a
 *       dialog. This delivery callback is set automatically if the requesting
 *       AJAX call requested a dialog. See system_page_delivery_callback_alter().
 *   - "access callback": A function returning TRUE if the user has access
 *     rights to this menu item, and FALSE if not. It can also be a boolean
 *     constant instead of a function, and you can also use numeric values
 *     (will be cast to boolean). Defaults to user_access() unless a value is
 *     inherited from the parent menu item; only MENU_DEFAULT_LOCAL_TASK items
 *     can inherit access callbacks. To use the user_access() default callback,
 *     you must specify the permission to check as 'access arguments' (see
 *     below).
 *   - "access arguments": An array of arguments to pass to the access callback
 *     function, with path component substitution as described above. If the
 *     access callback is inherited (see above), the access arguments will be
 *     inherited with it, unless overridden in the child menu item.
 *   - "theme callback": (optional) A function returning the machine-readable
 *     name of the theme that will be used to render the page. If not provided,
 *     the value will be inherited from a parent menu item. If there is no
 *     theme callback, or if the function does not return the name of a current
 *     active theme on the site, the theme for this page will be determined by
 *     either hook_custom_theme() or the default theme instead. As a general
 *     rule, the use of theme callback functions should be limited to pages
 *     whose functionality is very closely tied to a particular theme, since
 *     they can only be overridden by modules which specifically target those
 *     pages in hook_menu_alter(). Modules implementing more generic theme
 *     switching functionality (for example, a module which allows the theme to
 *     be set dynamically based on the current user's role) should use
 *     hook_custom_theme() instead.
 *   - "theme arguments": An array of arguments to pass to the theme callback
 *     function, with path component substitution as described above.
 *   - "file": A file that will be included before the page callback is called;
 *     this allows page callback functions to be in separate files. The file
 *     should be relative to the implementing module's directory unless
 *     otherwise specified by the "file path" option. Does not apply to other
 *     callbacks (only page callback).
 *   - "file path": The path to the directory containing the file specified in
 *     "file". This defaults to the path to the module implementing the hook.
 *   - "load arguments": An array of arguments to be passed to each of the
 *     wildcard object loaders in the path, after the path argument itself.
 *
 *     For example, if a module registers path node/%node/revisions/%/view
 *     with load arguments set to array(3), the '%node' in the path indicates
 *     that the loader function node_load() will be called with the second
 *     path component as the first argument. The 3 in the load arguments
 *     indicates that the fourth path component will also be passed to
 *     node_load() (numbering of path components starts at zero). So, if path
 *     node/12/revisions/29/view is requested, node_load(12, 29) will be called.
 *
 *     There are also two "magic" values that can be used in load arguments.
 *     "%index" indicates the index of the wildcard path component. "%map"
 *     indicates the path components as an array. For example, if a module
 *     registers for several paths of the form 'user/%user_category/edit/*', all
 *     of them can use the same load function user_category_load(), by setting
 *     the load arguments to array('%map', '%index'). For instance, if the user
 *     is editing category 'foo' by requesting path 'user/32/edit/foo', the load
 *     function user_category_load() will be called with 32 as its first
 *     argument, the array ('user', 32, 'edit', 'foo') as the map argument,
 *     and 1 as the index argument (because %user_category is the second path
 *     component and numbering starts at zero). user_category_load() can then
 *     use these values to extract the information that 'foo' is the category
 *     being requested.
 *   - "weight": An integer that determines the relative position of items in
 *     the menu; higher-weighted items sink. Defaults to 0. Menu items with the
 *     same weight are ordered alphabetically.
 *   - "menu_name": Optional. Set this to a custom menu if you don't want your
 *     item to be placed in the Main menu.
 *   - "expanded": Optional. If set to TRUE, and if a menu link is provided for
 *     this menu item (as a result of other properties), then the menu link is
 *     always expanded, equivalent to its 'always expanded' checkbox being set
 *     in the UI.
 *   - "context": (optional) Defines the context a tab may appear in. By
 *     default, all tabs are only displayed as local tasks when being rendered
 *     in a page context. All tabs that should be accessible as contextual links
 *     in page region containers outside of the parent menu item's primary page
 *     context should be registered using one of the following contexts:
 *     - MENU_CONTEXT_PAGE: (default) The tab is displayed as local task for the
 *       page context only.
 *     - MENU_CONTEXT_INLINE: The tab is displayed as contextual link outside of
 *       the primary page context only.
 *     Contexts can be combined. For example, to display a tab both on a page
 *     and inline, a menu router item may specify:
 *     @code
 *       'context' => MENU_CONTEXT_PAGE | MENU_CONTEXT_INLINE,
 *     @endcode
 *   - "tab_parent": For local task menu items, the path of the task's parent
 *     item; defaults to the same path without the last component (e.g., the
 *     default parent for 'admin/people/create' is 'admin/people').
 *   - "tab_root": For local task menu items, the path of the closest non-tab
 *     item; same default as "tab_parent".
 *   - "position": Position of the block ('left' or 'right') on the system
 *     administration page for this item.
 *   - "type": A bitmask of flags describing properties of the menu item.
 *     Many shortcut bitmasks are provided as constants in menu.inc:
 *     - MENU_NORMAL_ITEM: Normal menu items show up in the menu tree and can be
 *       moved/hidden by the administrator.
 *     - MENU_CALLBACK: Callbacks simply register a path so that the correct
 *       information is generated when the path is accessed.
 *     - MENU_SUGGESTED_ITEM: Modules may "suggest" menu items that the
 *       administrator may enable.
 *     - MENU_LOCAL_ACTION: Local actions are menu items that describe actions
 *       on the parent item such as adding a new user or block, and are
 *       rendered in the action-links list in your theme.
 *     - MENU_LOCAL_TASK: Local tasks are menu items that describe different
 *       displays of data, and are generally rendered as tabs.
 *     - MENU_DEFAULT_LOCAL_TASK: Every set of local tasks should provide one
 *       "default" task, which should display the same page as the parent item.
 *     If the "type" element is omitted, MENU_NORMAL_ITEM is assumed.
 *   - "options": An array of options to be passed to l() when generating a link
 *     from this menu item. Note that the "options" parameter has no effect on
 *     MENU_LOCAL_TASK, MENU_DEFAULT_LOCAL_TASK, and MENU_LOCAL_ACTION items.
 *
 * For a detailed usage example, see page_example.module.
 * For comprehensive documentation on the menu system, see
 * http://drupal.org/node/102338.
 */
function hook_menu() {
  $items['example'] = array(
    'title' => 'Example Page',
    'page callback' => 'example_page',
    'access arguments' => array('access content'),
    'type' => MENU_SUGGESTED_ITEM,
  );
  $items['example/feed'] = array(
    'title' => 'Example RSS feed',
    'page callback' => 'example_feed',
    'access arguments' => array('access content'),
    'type' => MENU_CALLBACK,
  );

  return $items;
}

/**
 * Alter the data being saved to the {menu_router} table after hook_menu is invoked.
 *
 * This hook is invoked by menu_router_build(). The menu definitions are passed
 * in by reference. Each element of the $items array is one item returned
 * by a module from hook_menu. Additional items may be added, or existing items
 * altered.
 *
 * @param $items
 *   Associative array of menu router definitions returned from hook_menu().
 */
function hook_menu_alter(&$items) {
  // Example - disable the page at node/add
  $items['node/add']['access callback'] = FALSE;
}

/**
 * Alter the data being saved to the {menu_links} table by menu_link_save().
 *
 * @param $item
 *   Associative array defining a menu link as passed into menu_link_save().
 *
 * @see hook_translated_menu_link_alter()
 */
function hook_menu_link_alter(&$item) {
  // Make all new admin links hidden (a.k.a disabled).
  if (strpos($item['link_path'], 'admin') === 0 && empty($item['mlid'])) {
    $item['hidden'] = 1;
  }
  // Flag a link to be altered by hook_translated_menu_link_alter().
  if ($item['link_path'] == 'devel/cache/clear') {
    $item['options']['alter'] = TRUE;
  }
  // Flag a link to be altered by hook_translated_menu_link_alter(), but only
  // if it is derived from a menu router item; i.e., do not alter a custom
  // menu link pointing to the same path that has been created by a user.
  if ($item['link_path'] == 'user' && $item['module'] == 'system') {
    $item['options']['alter'] = TRUE;
  }
}

/**
 * Alter a menu link after it has been translated and before it is rendered.
 *
 * This hook is invoked from _menu_link_translate() after a menu link has been
 * translated; i.e., after dynamic path argument placeholders (%) have been
 * replaced with actual values, the user access to the link's target page has
 * been checked, and the link has been localized. It is only invoked if
 * $item['options']['alter'] has been set to a non-empty value (e.g., TRUE).
 * This flag should be set using hook_menu_link_alter().
 *
 * Implementations of this hook are able to alter any property of the menu link.
 * For example, this hook may be used to add a page-specific query string to all
 * menu links, or hide a certain link by setting:
 * @code
 *   'hidden' => 1,
 * @endcode
 *
 * @param $item
 *   Associative array defining a menu link after _menu_link_translate()
 * @param $map
 *   Associative array containing the menu $map (path parts and/or objects).
 *
 * @see hook_menu_link_alter()
 */
function hook_translated_menu_link_alter(&$item, $map) {
  if ($item['href'] == 'devel/cache/clear') {
    $item['localized_options']['query'] = backdrop_get_destination();
  }
}

/**
 * Inform modules that a menu link has been created.
 *
 * This hook is used to notify modules that menu items have been
 * created. Contributed modules may use the information to perform
 * actions based on the information entered into the menu system.
 *
 * @param $link
 *   Associative array defining a menu link as passed into menu_link_save().
 *
 * @see hook_menu_link_update()
 * @see hook_menu_link_delete()
 */
function hook_menu_link_insert($link) {
  // In our sample case, we track menu items as editing sections
  // of the site. These are stored in our table as 'disabled' items.
  $record['mlid'] = $link['mlid'];
  $record['menu_name'] = $link['menu_name'];
  $record['status'] = 0;
  backdrop_write_record('menu_example', $record);
}

/**
 * Inform modules that a menu link has been updated.
 *
 * This hook is used to notify modules that menu items have been
 * updated. Contributed modules may use the information to perform
 * actions based on the information entered into the menu system.
 *
 * @param $link
 *   Associative array defining a menu link as passed into menu_link_save().
 *
 * @see hook_menu_link_insert()
 * @see hook_menu_link_delete()
 */
function hook_menu_link_update($link) {
  // If the parent menu has changed, update our record.
  $menu_name = db_query("SELECT menu_name FROM {menu_example} WHERE mlid = :mlid", array(':mlid' => $link['mlid']))->fetchField();
  if ($menu_name != $link['menu_name']) {
    db_update('menu_example')
      ->fields(array('menu_name' => $link['menu_name']))
      ->condition('mlid', $link['mlid'])
      ->execute();
  }
}

/**
 * Inform modules that a menu link has been deleted.
 *
 * This hook is used to notify modules that menu items have been
 * deleted. Contributed modules may use the information to perform
 * actions based on the information entered into the menu system.
 *
 * @param $link
 *   Associative array defining a menu link as passed into menu_link_save().
 *
 * @see hook_menu_link_insert()
 * @see hook_menu_link_update()
 */
function hook_menu_link_delete($link) {
  // Delete the record from our table.
  db_delete('menu_example')
    ->condition('mlid', $link['mlid'])
    ->execute();
}

/**
 * Alter tabs and actions displayed on the page before they are rendered.
 *
 * This hook is invoked by menu_local_tasks(). The system-determined tabs and
 * actions are passed in by reference. Additional tabs or actions may be added,
 * or existing items altered.
 *
 * Each tab or action is an associative array containing:
 * - #theme: The theme function to use to render.
 * - #link: An associative array containing:
 *   - title: The localized title of the link.
 *   - href: The system path to link to.
 *   - localized_options: An array of options to pass to l().
 * - #active: Whether the link should be marked as 'active'.
 *
 * @param $data
 *   An associative array containing:
 *   - actions: An associative array containing:
 *     - count: The amount of actions determined by the menu system, which can
 *       be ignored.
 *     - output: A list of of actions, each one being an associative array
 *       as described above.
 *   - tabs: An indexed array (list) of tab levels (up to 2 levels), each
 *     containing an associative array:
 *     - count: The amount of tabs determined by the menu system. This value
 *       does not need to be altered if there is more than one tab.
 *     - output: A list of of tabs, each one being an associative array as
 *       described above.
 * @param $router_item
 *   The menu system router item of the page.
 * @param $root_path
 *   The path to the root item for this set of tabs.
 */
function hook_menu_local_tasks_alter(&$data, $router_item, $root_path) {
  // Add an action linking to node/add to all pages.
  $data['actions']['output'][] = array(
    '#theme' => 'menu_local_task',
    '#link' => array(
      'title' => t('Add content'),
      'href' => 'node/add',
      'localized_options' => array(
        'attributes' => array(
          'title' => t('Add content'),
        ),
      ),
    ),
  );

  // Add a tab linking to node/add to all pages.
  $data['tabs'][0]['output'][] = array(
    '#theme' => 'menu_local_task',
    '#link' => array(
      'title' => t('Example tab'),
      'href' => 'node/add',
      'localized_options' => array(
        'attributes' => array(
          'title' => t('Add content'),
        ),
      ),
    ),
    // Define whether this link is active. This can be omitted for
    // implementations that add links to pages outside of the current page
    // context.
    '#active' => ($router_item['path'] == $root_path),
  );
}

/**
 * Alter links in the active trail before it is rendered as the breadcrumb.
 *
 * This hook is invoked by menu_get_active_breadcrumb() and allows alteration
 * of the breadcrumb links for the current page, which may be preferred instead
 * of setting a custom breadcrumb via backdrop_set_breadcrumb().
 *
 * Implementations should take into account that menu_get_active_breadcrumb()
 * subsequently performs the following adjustments to the active trail *after*
 * this hook has been invoked:
 * - The last link in $active_trail is removed, if its 'href' is identical to
 *   the 'href' of $item. This happens, because the breadcrumb normally does
 *   not contain a link to the current page.
 * - The (second to) last link in $active_trail is removed, if the current $item
 *   is a MENU_DEFAULT_LOCAL_TASK. This happens in order to do not show a link
 *   to the current page, when being on the path for the default local task;
 *   e.g. when being on the path node/%/view, the breadcrumb should not contain
 *   a link to node/%.
 *
 * Each link in the active trail must contain:
 * - title: The localized title of the link.
 * - href: The system path to link to.
 * - localized_options: An array of options to pass to url().
 *
 * @param $active_trail
 *   An array containing breadcrumb links for the current page.
 * @param $item
 *   The menu router item of the current page.
 *
 * @see backdrop_set_breadcrumb()
 * @see menu_get_active_breadcrumb()
 * @see menu_get_active_trail()
 * @see menu_set_active_trail()
 */
function hook_menu_breadcrumb_alter(&$active_trail, $item) {
  // Always display a link to the current page by duplicating the last link in
  // the active trail. This means that menu_get_active_breadcrumb() will remove
  // the last link (for the current page), but since it is added once more here,
  // it will appear.
  if (!backdrop_is_front_page()) {
    $end = end($active_trail);
    if ($item['href'] == $end['href']) {
      $active_trail[] = $end;
    }
  }
}

/**
 * Alter contextual links before they are rendered.
 *
 * This hook is invoked by menu_contextual_links(). The system-determined
 * contextual links are passed in by reference. Additional links may be added
 * or existing links can be altered.
 *
 * Each contextual link must at least contain:
 * - title: The localized title of the link.
 * - href: The system path to link to.
 * - localized_options: An array of options to pass to url().
 *
 * @param $links
 *   An associative array containing contextual links for the given $root_path,
 *   as described above. The array keys are used to build CSS class names for
 *   contextual links and must therefore be unique for each set of contextual
 *   links.
 * @param $router_item
 *   The menu router item belonging to the $root_path being requested.
 * @param $root_path
 *   The (parent) path that has been requested to build contextual links for.
 *   This is a normalized path, which means that an originally passed path of
 *   'node/123' became 'node/%'.
 *
 * @see hook_contextual_links_view_alter()
 * @see menu_contextual_links()
 * @see hook_menu()
 * @see contextual_preprocess()
 */
function hook_menu_contextual_links_alter(&$links, $router_item, $root_path) {
  // Add a link to all contextual links for nodes.
  if ($root_path == 'node/%') {
    $links['foo'] = array(
      'title' => t('Do fu'),
      'href' => 'foo/do',
      'localized_options' => array(
        'query' => array(
          'foo' => 'bar',
        ),
      ),
    );
  }
}

/**
 * Perform alterations before a form is rendered.
 *
 * One popular use of this hook is to add form elements to the node form. When
 * altering a node form, the node entity can be accessed at $form['#node'].
 *
 * In addition to hook_form_alter(), which is called for all forms, there are
 * two more specific form hooks available. The first,
 * hook_form_BASE_FORM_ID_alter(), allows targeting of a form/forms via a base
 * form (if one exists). The second, hook_form_FORM_ID_alter(), can be used to
 * target a specific form directly.
 *
 * The call order is as follows: all existing form alter functions are called
 * for module A, then all for module B, etc., followed by all for any base
 * theme(s), and finally for the theme itself. The module order is determined
 * by system weight, then by module name.
 *
 * Within each module, form alter hooks are called in the following order:
 * first, hook_form_alter(); second, hook_form_BASE_FORM_ID_alter(); third,
 * hook_form_FORM_ID_alter(). So, for each module, the more general hooks are
 * called first followed by the more specific.
 *
 * @param $form
 *   Nested array of form elements that comprise the form.
 * @param $form_state
 *   A keyed array containing the current state of the form. The arguments
 *   that backdrop_get_form() was originally called with are available in the
 *   array $form_state['build_info']['args'].
 * @param $form_id
 *   String representing the name of the form itself. Typically this is the
 *   name of the function that generated the form.
 *
 * @see hook_form_BASE_FORM_ID_alter()
 * @see hook_form_FORM_ID_alter()
 * @see forms_api_reference.html
 */
function hook_form_alter(&$form, &$form_state, $form_id) {
  if (isset($form['type']) && $form['type']['#value'] . '_node_settings' == $form_id) {
    $form['workflow']['upload_' . $form['type']['#value']] = array(
      '#type' => 'radios',
      '#title' => t('Attachments'),
      '#default_value' => config_get('my_module.settings', 'upload_' . $form['type']['#value']),
      '#options' => array(t('Disabled'), t('Enabled')),
    );
  }
}

/**
 * Provide a form-specific alteration instead of the global hook_form_alter().
 *
 * Modules can implement hook_form_FORM_ID_alter() to modify a specific form,
 * rather than implementing hook_form_alter() and checking the form ID, or
 * using long switch statements to alter multiple forms.
 *
 * Form alter hooks are called in the following order: hook_form_alter(),
 * hook_form_BASE_FORM_ID_alter(), hook_form_FORM_ID_alter(). See
 * hook_form_alter() for more details.
 *
 * @param $form
 *   Nested array of form elements that comprise the form.
 * @param $form_state
 *   A keyed array containing the current state of the form. The arguments
 *   that backdrop_get_form() was originally called with are available in the
 *   array $form_state['build_info']['args'].
 * @param $form_id
 *   String representing the name of the form itself. Typically this is the
 *   name of the function that generated the form.
 *
 * @see hook_form_alter()
 * @see hook_form_BASE_FORM_ID_alter()
 * @see backdrop_prepare_form()
 * @see forms_api_reference.html
 */
function hook_form_FORM_ID_alter(&$form, &$form_state, $form_id) {
  // Modification for the form with the given form ID goes here. For example, if
  // FORM_ID is "user_register_form" this code would run only on the user
  // registration form.

  // Add a checkbox to registration form about agreeing to terms of use.
  $form['terms_of_use'] = array(
    '#type' => 'checkbox',
    '#title' => t("I agree with the website's terms and conditions."),
    '#required' => TRUE,
  );
}

/**
 * Provide a form-specific alteration for shared ('base') forms.
 *
 * By default, when backdrop_get_form() is called, Backdrop looks for a function
 * with the same name as the form ID, and uses that function to build the form.
 * In contrast, base forms allow multiple form IDs to be mapped to a single base
 * (also called 'factory') form function.
 *
 * Modules can implement hook_form_BASE_FORM_ID_alter() to modify a specific
 * base form, rather than implementing hook_form_alter() and checking for
 * conditions that would identify the shared form constructor.
 *
 * To identify the base form ID for a particular form (or to determine whether
 * one exists) check the $form_state. The base form ID is stored under
 * $form_state['build_info']['base_form_id'].
 *
 * See hook_forms() for more information on how to implement base forms in
 * Backdrop.
 *
 * Form alter hooks are called in the following order: hook_form_alter(),
 * hook_form_BASE_FORM_ID_alter(), hook_form_FORM_ID_alter(). See
 * hook_form_alter() for more details.
 *
 * @param $form
 *   Nested array of form elements that comprise the form.
 * @param $form_state
 *   A keyed array containing the current state of the form.
 * @param $form_id
 *   String representing the name of the form itself. Typically this is the
 *   name of the function that generated the form.
 *
 * @see hook_form_alter()
 * @see hook_form_FORM_ID_alter()
 * @see backdrop_prepare_form()
 * @see hook_forms()
 */
function hook_form_BASE_FORM_ID_alter(&$form, &$form_state, $form_id) {
  // Modification for the form with the given BASE_FORM_ID goes here. For
  // example, if BASE_FORM_ID is "node_form", this code would run on every
  // node form, regardless of node type.

  // Add a checkbox to the node form about agreeing to terms of use.
  $form['terms_of_use'] = array(
    '#type' => 'checkbox',
    '#title' => t("I agree with the website's terms and conditions."),
    '#required' => TRUE,
  );
}

/**
 * Map form_ids to form builder functions.
 *
 * By default, when backdrop_get_form() is called, the system will look for a
 * function with the same name as the form ID, and use that function to build
 * the form. If no such function is found, Backdrop calls this hook. Modules
 * implementing this hook can then provide their own instructions for mapping
 * form IDs to constructor functions. As a result, you can easily map multiple
 * form IDs to a single form constructor (referred to as a 'base' form).
 *
 * Using a base form can help to avoid code duplication, by allowing many
 * similar forms to use the same code base. Another benefit is that it becomes
 * much easier for other modules to apply a general change to the group of
 * forms; hook_form_BASE_FORM_ID_alter() can be used to easily alter multiple
 * forms at once by directly targeting the shared base form.
 *
 * Two example use cases where base forms may be useful are given below.
 *
 * First, you can use this hook to tell the form system to use a different
 * function to build certain forms in your module; this is often used to define
 * a form "factory" function that is used to build several similar forms. In
 * this case, your hook implementation will likely ignore all of the input
 * arguments. See node_forms() for an example of this. Note, node_forms() is the
 * hook_forms() implementation; the base form itself is defined in node_form().
 *
 * Second, you could use this hook to define how to build a form with a
 * dynamically-generated form ID. In this case, you would need to verify that
 * the $form_id input matched your module's format for dynamically-generated
 * form IDs, and if so, act appropriately.
 *
 * @param $form_id
 *   The unique string identifying the desired form.
 * @param $args
 *   An array containing the original arguments provided to backdrop_get_form()
 *   or backdrop_form_submit(). These are always passed to the form builder and
 *   do not have to be specified manually in 'callback arguments'.
 *
 * @return
 *   An associative array whose keys define form_ids and whose values are an
 *   associative array defining the following keys:
 *   - callback: The name of the form builder function to invoke. This will be
 *     used for the base form ID, for example, to target a base form using
 *     hook_form_BASE_FORM_ID_alter().
 *   - callback arguments: (optional) Additional arguments to pass to the
 *     function defined in 'callback', which are prepended to $args.
 *   - wrapper_callback: (optional) The name of a form builder function to
 *     invoke before the form builder defined in 'callback' is invoked. This
 *     wrapper callback may prepopulate the $form array with form elements,
 *     which will then be already contained in the $form that is passed on to
 *     the form builder defined in 'callback'. For example, a wrapper callback
 *     could setup wizard-alike form buttons that are the same for a variety of
 *     forms that belong to the wizard, which all share the same wrapper
 *     callback.
 */
function hook_forms($form_id, $args) {
  // Simply reroute the (non-existing) $form_id 'mymodule_first_form' to
  // 'mymodule_main_form'.
  $forms['mymodule_first_form'] = array(
    'callback' => 'mymodule_main_form',
  );

  // Reroute the $form_id and prepend an additional argument that gets passed to
  // the 'mymodule_main_form' form builder function.
  $forms['mymodule_second_form'] = array(
    'callback' => 'mymodule_main_form',
    'callback arguments' => array('some parameter'),
  );

  // Reroute the $form_id, but invoke the form builder function
  // 'mymodule_main_form_wrapper' first, so we can prepopulate the $form array
  // that is passed to the actual form builder 'mymodule_main_form'.
  $forms['mymodule_wrapped_form'] = array(
    'callback' => 'mymodule_main_form',
    'wrapper_callback' => 'mymodule_main_form_wrapper',
  );

  return $forms;
}

/**
 * Perform setup tasks for all page requests.
 *
 * This hook is run at the beginning of the page request. It is typically
 * used to set up global parameters that are needed later in the request.
 *
 * If needing to execute code early in the page request, consider using
 * hook_init() instead. In hook_boot(), only the most basic APIs are available
 * and not all modules have been loaded. This hook by default is not called on
 * pages served by the default page cache, but can be enabled through the
 * $settings['invoke_page_cache_hooks'] option in settings.php.
 *
 * @see hook_init()
 */
function hook_boot() {
  // We need user_access() in the shutdown function. Make sure it gets loaded.
  backdrop_load('module', 'user');
  backdrop_register_shutdown_function('devel_shutdown');
}

/**
 * Perform setup tasks for non-cached page requests.
 *
 * This hook is run at the beginning of the page request. It is typically
 * used to set up global parameters that are needed later in the request.
 * When this hook is called, the theme and all modules are already loaded in
 * memory.
 *
 * This hook is not run on cached pages.
 *
 * To add CSS or JS that should be present on all pages, modules should not
 * implement this hook, but declare these files in their .info file.
 *
 * @see hook_boot()
 */
function hook_init() {
  // Since this file should only be loaded on the front page, it cannot be
  // declared in the info file.
  if (backdrop_is_front_page()) {
    backdrop_add_css(backdrop_get_path('module', 'foo') . '/foo.css');
  }
}

/**
 * Define image toolkits provided by this module.
 *
 * The file which includes each toolkit's functions must be included in this
 * hook.
 *
 * The toolkit's functions must be named image_toolkitname_operation().
 * where the operation may be:
 *   - 'load': Required. See image_gd_load() for usage.
 *   - 'save': Required. See image_gd_save() for usage.
 *   - 'settings': Optional. See image_gd_settings() for usage.
 *   - 'resize': Optional. See image_gd_resize() for usage.
 *   - 'rotate': Optional. See image_gd_rotate() for usage.
 *   - 'crop': Optional. See image_gd_crop() for usage.
 *   - 'desaturate': Optional. See image_gd_desaturate() for usage.
 *
 * @return
 *   An array with the toolkit name as keys and sub-arrays with these keys:
 *     - 'title': A string with the toolkit's title.
 *     - 'available': A Boolean value to indicate that the toolkit is operating
 *       properly, e.g. all required libraries exist.
 *
 * @see system_image_toolkits()
 */
function hook_image_toolkits() {
  return array(
    'working' => array(
      'title' => t('A toolkit that works.'),
      'available' => TRUE,
    ),
    'broken' => array(
      'title' => t('A toolkit that is "broken" and will not be listed.'),
      'available' => FALSE,
    ),
  );
}

/**
 * Alter an email message created with the backdrop_mail() function.
 *
 * hook_mail_alter() allows modification of email messages created and sent
 * with backdrop_mail(). Usage examples include adding and/or changing message
 * text, message fields, and message headers.
 *
 * Email messages sent using functions other than backdrop_mail() will not
 * invoke hook_mail_alter(). For example, a contributed module directly
 * calling the backdrop_mail_system()->mail() or PHP mail() function
 * will not invoke this hook. All core modules use backdrop_mail() for
 * messaging, it is best practice but not mandatory in contributed modules.
 *
 * @param $message
 *   An array containing the message data. Keys in this array include:
 *  - 'id':
 *     The backdrop_mail() id of the message. Look at module source code or
 *     backdrop_mail() for possible id values.
 *  - 'to':
 *     The address or addresses the message will be sent to. The
 *     formatting of this string must comply with RFC 2822.
 *  - 'from':
 *     The address the message will be marked as being from, which is
 *     either a custom address or the site-wide default email address.
 *  - 'subject':
 *     Subject of the email to be sent. This must not contain any newline
 *     characters, or the email may not be sent properly.
 *  - 'body':
 *     An array of strings containing the message text. The message body is
 *     created by concatenating the individual array strings into a single text
 *     string using "\n\n" as a separator.
 *  - 'headers':
 *     Associative array containing mail headers, such as From, Sender,
 *     MIME-Version, Content-Type, etc.
 *  - 'params':
 *     An array of optional parameters supplied by the caller of backdrop_mail()
 *     that is used to build the message before hook_mail_alter() is invoked.
 *  - 'language':
 *     The language object used to build the message before hook_mail_alter()
 *     is invoked.
 *  - 'send':
 *     Set to FALSE to abort sending this email message.
 *
 * @see backdrop_mail()
 */
function hook_mail_alter(&$message) {
  if ($message['id'] == 'modulename_messagekey') {
    if (!example_notifications_optin($message['to'], $message['id'])) {
      // If the recipient has opted to not receive such messages, cancel
      // sending.
      $message['send'] = FALSE;
      return;
    }
    $message['body'][] = "--\nMail sent out from " . config_get('system.core', 'site_name');
  }
}

/**
 * Alter the registry of modules implementing a hook.
 *
 * This hook is invoked during module_implements(). A module may implement this
 * hook in order to reorder the implementing modules, which are otherwise
 * ordered by the module's system weight.
 *
 * Note that hooks invoked using backdrop_alter() can have multiple variations
 * (such as hook_form_alter() and hook_form_FORM_ID_alter()). backdrop_alter()
 * will call all such variants defined by a single module in turn. For the
 * purposes of hook_module_implements_alter(), these variants are treated as
 * a single hook. Thus, to ensure that your implementation of
 * hook_form_FORM_ID_alter() is called at the right time, you will have to
 * change the order of hook_form_alter() implementation in
 * hook_module_implements_alter().
 *
 * @param $implementations
 *   An array keyed by the module's name. The value of each item corresponds
 *   to a $group, which is usually FALSE, unless the implementation is in a
 *   file named $module.$group.inc.
 * @param $hook
 *   The name of the module hook being implemented.
 */
function hook_module_implements_alter(&$implementations, $hook) {
  if ($hook == 'node_view') {
    $group = $implementations['my_module'];
    unset($implementations['my_module']);
    $implementations['my_module'] = $group;
  }
}

/**
 * Return additional themes provided by modules.
 *
 * Only use this hook for testing purposes. Use a hidden MYMODULE_test.module
 * to implement this hook. Testing themes should be hidden, too.
 *
 * This hook is invoked from _system_rebuild_theme_data() and allows modules to
 * register additional themes outside of the regular 'themes' directories of a
 * Backdrop installation.
 *
 * @return
 *   An associative array. Each key is the system name of a theme and each value
 *   is the corresponding path to the theme's .info file.
 */
function hook_system_theme_info() {
  $themes['mymodule_test_theme'] = backdrop_get_path('module', 'mymodule') . '/mymodule_test_theme/mymodule_test_theme.info';
  return $themes;
}

/**
 * Alter the information parsed from module and theme .info files
 *
 * This hook is invoked in _system_rebuild_module_data() and in
 * _system_rebuild_theme_data(). A module may implement this hook in order to
 * add to or alter the data generated by reading the .info file with
 * backdrop_parse_info_file().
 *
 * @param $info
 *   The .info file contents, passed by reference so that it can be altered.
 * @param $file
 *   Full information about the module or theme, including $file->name, and
 *   $file->filename
 * @param $type
 *   Either 'module' or 'theme', depending on the type of .info file that was
 *   passed.
 */
function hook_system_info_alter(&$info, $file, $type) {
  // Only fill this in if the .info file does not define a 'datestamp'.
  if (empty($info['datestamp'])) {
    $info['datestamp'] = filemtime($file->filename);
  }
}

/**
 * Define user permissions.
 *
 * This hook can supply permissions that the module defines, so that they
 * can be selected on the user permissions page and used to grant or restrict
 * access to actions the module performs.
 *
 * Permissions are checked using user_access().
 *
 * For a detailed usage example, see page_example.module.
 *
 * @return
 *   An array whose keys are permission names and whose corresponding values
 *   are arrays containing the following key-value pairs:
 *   - title: The human-readable name of the permission, to be shown on the
 *     permission administration page. This should be wrapped in the t()
 *     function so it can be translated.
 *   - description: (optional) A description of what the permission does. This
 *     should be wrapped in the t() function so it can be translated.
 *   - restrict access: (optional) A boolean which can be set to TRUE to
 *     indicate that site administrators should restrict access to this
 *     permission to trusted users. This should be used for permissions that
 *     have inherent security risks across a variety of potential use cases
 *     (for example, the "administer filters" and "bypass node access"
 *     permissions provided by Backdrop core). When set to TRUE, a standard
 *     warning message defined in user_admin_permissions() and output via
 *     theme_user_permission_description() will be associated with the
 *     permission and displayed with it on the permission administration page.
 *     Defaults to FALSE.
 *   - warning: (optional) A translated warning message to display for this
 *     permission on the permission administration page. This warning overrides
 *     the automatic warning generated by 'restrict access' being set to TRUE.
 *     This should rarely be used, since it is important for all permissions to
 *     have a clear, consistent security warning that is the same across the
 *     site. Use the 'description' key instead to provide any information that
 *     is specific to the permission you are defining.
 *
 * @see theme_user_permission_description()
 */
function hook_permission() {
  return array(
    'administer my module' =>  array(
      'title' => t('Administer my module'),
      'description' => t('Perform administration tasks for my module.'),
    ),
  );
}

/**
 * Register a module (or theme's) theme implementations.
 *
 * The implementations declared by this hook have two purposes: either they
 * specify how a particular render array is to be rendered as HTML (this is
 * usually the case if the theme function is assigned to the render array's
 * #theme property), or they return the HTML that should be returned by an
 * invocation of theme(). See
 * @link http://drupal.org/node/933976 Using the theme layer Drupal 7.x @endlink
 * for more information on how to implement theme hooks.
 *
 * The following parameters are all optional.
 *
 * @param array $existing
 *   An array of existing implementations that may be used for override
 *   purposes. This is primarily useful for themes that may wish to examine
 *   existing implementations to extract data (such as arguments) so that
 *   it may properly register its own, higher priority implementations.
 * @param $type
 *   Whether a theme, module, etc. is being processed. This is primarily useful
 *   so that themes tell if they are the actual theme being called or a parent
 *   theme. May be one of:
 *   - 'module': A module is being checked for theme implementations.
 *   - 'base_theme_engine': A theme engine is being checked for a theme that is
 *     a parent of the actual theme being used.
 *   - 'theme_engine': A theme engine is being checked for the actual theme
 *     being used.
 *   - 'base_theme': A base theme is being checked for theme implementations.
 *   - 'theme': The actual theme in use is being checked.
 * @param $theme
 *   The actual name of theme, module, etc. that is being being processed.
 * @param $path
 *   The directory path of the theme or module, so that it doesn't need to be
 *   looked up.
 *
 * @return array
 *   An associative array of theme hook information. The keys on the outer
 *   array are the internal names of the hooks, and the values are arrays
 *   containing information about the hook. Each information array must contain
 *   either a 'variables' element or a 'render element' element, but not both.
 *   Use 'render element' if you are theming a single element or element tree
 *   composed of elements, such as a form array, a page array, or a single
 *   checkbox element. Use 'variables' if your theme implementation is
 *   intended to be called directly through theme() and has multiple arguments
 *   for the data and style; in this case, the variables not supplied by the
 *   calling function will be given default values and passed to the template
 *   or theme function. The returned theme information array can contain the
 *   following key/value pairs:
 *   - variables: (see above) Each array key is the name of the variable, and
 *     the value given is used as the default value if the function calling
 *     theme() does not supply it. Template implementations receive each array
 *     key as a variable in the template file (so they must be legal PHP
 *     variable names). Function implementations are passed the variables in a
 *     single $variables function argument.
 *   - render element: (see above) The name of the renderable element or element
 *     tree to pass to the theme function. This name is used as the name of the
 *     variable that holds the renderable element or tree in preprocess and
 *     process functions.
 *   - file: The file the implementation resides in. This file will be included
 *     prior to the theme being rendered, to make sure that the function or
 *     preprocess function (as needed) is actually loaded; this makes it
 *     possible to split theme functions out into separate files quite easily.
 *   - path: Override the path of the file to be used. Ordinarily the module or
 *     theme path will be used, but if the file will not be in the default
 *     path, include it here. This path should be relative to the Backdrop root
 *     directory.
 *   - template: If specified, this theme implementation is a template, and
 *     this is the template file name without an extension. Do not include the
 *     extension .tpl.php; it will be added automatically. If 'path' is
 *     specified, then the template should be located in this path.
 *   - function: If specified, this will be the function name to invoke for
 *     this implementation. If neither 'template' nor 'function' is specified,
 *     a default function name will be assumed. For example, if a module
 *     registers the 'node' theme hook, 'theme_node' will be assigned to its
 *     function. If the chameleon theme registers the node hook, it will be
 *     assigned 'chameleon_node' as its function.
 *   - base hook: A string declaring the base theme hook if this theme
 *     implementation is actually implementing a suggestion for another theme
 *     hook.
 *   - pattern: A regular expression pattern to be used to allow this theme
 *     implementation to have a dynamic name. The convention is to use __ to
 *     differentiate the dynamic portion of the theme. For example, to allow
 *     users to be themed by role, the pattern might be: 'user__'. Then,
 *     when the user is themed, call:
 *     @code
 *     theme(array('user__' . $rid, 'user'), $user)
 *     @endcode
 *   - preprocess functions: A list of functions used to preprocess this data.
 *     Ordinarily this won't be used; it's automatically filled in. By default,
 *     for a module this will be filled in as template_preprocess_HOOK. For
 *     a theme this will be filled in as phptemplate_preprocess and
 *     phptemplate_preprocess_HOOK as well as themename_preprocess and
 *     themename_preprocess_HOOK.
 *   - override preprocess functions: Set to TRUE when a theme does NOT want
 *     the standard preprocess functions to run. This can be used to give a
 *     theme FULL control over how variables are set. For example, if a theme
 *     wants total control over how certain variables in the page.tpl.php are
 *     set, this can be set to true. Please keep in mind that when this is used
 *     by a theme, that theme becomes responsible for making sure necessary
 *     variables are set.
 *   - type: (automatically derived) Where the theme hook is defined:
 *     'module', 'theme_engine', or 'theme'.
 *   - theme path: (automatically derived) The directory path of the theme or
 *     module, so that it doesn't need to be looked up.
 *
 * @see hook_theme_registry_alter()
 */
function hook_theme($existing, $type, $theme, $path) {
  return array(
    'feed_icon' => array(
      'variables' => array('url' => NULL, 'title' => NULL),
    ),
    'status_report' => array(
      'render element' => 'requirements',
      'file' => 'system.admin.inc',
    ),
  );
}

/**
 * Alter the theme registry information returned from hook_theme().
 *
 * The theme registry stores information about all available theme hooks,
 * including which callback functions those hooks will call when triggered,
 * what template files are exposed by these hooks, and so on.
 *
 * Note that this hook is only executed as the theme cache is re-built.
 * Changes here will not be visible until the next cache clear.
 *
 * The $theme_registry array is keyed by theme hook name, and contains the
 * information returned from hook_theme(), as well as additional properties
 * added by _theme_process_registry().
 *
 * For example:
 * @code
 * $theme_registry['user_profile'] = array(
 *   'variables' => array(
 *     'account' => NULL,
 *   ),
 *   'template' => 'core/modules/user/user-profile',
 *   'file' => 'core/modules/user/user.pages.inc',
 *   'type' => 'module',
 *   'theme path' => 'core/modules/user',
 *   'preprocess functions' => array(
 *     0 => 'template_preprocess',
 *     1 => 'template_preprocess_user_profile',
 *   ),
 * );
 * @endcode
 *
 * @param $theme_registry
 *   The entire cache of theme registry information, post-processing.
 *
 * @see hook_theme()
 * @see _theme_process_registry()
 */
function hook_theme_registry_alter(&$theme_registry) {
  // Remove the base preprocess function for nodes.
  foreach ($theme_registry['node']['preprocess functions'] as $key => $value) {
    if ($value == 'template_preprocess_node') {
      unset($theme_registry['node']['preprocess functions'][$key]);
    }
  }
}

/**
 * Return the machine-readable name of the theme to use for the current page.
 *
 * This hook can be used to dynamically set the theme for the current page
 * request. It should be used by modules which need to override the theme
 * based on dynamic conditions (for example, a module which allows the theme to
 * be set based on the current user's role). The return value of this hook will
 * be used on all pages except those which have a valid per-page or per-section
 * theme set via a theme callback function in hook_menu(); the themes on those
 * pages can only be overridden using hook_menu_alter().
 *
 * Note that returning different themes for the same path may not work with page
 * caching. This is most likely to be a problem if an anonymous user on a given
 * path could have different themes returned under different conditions.
 *
 * Since only one theme can be used at a time, the last (i.e., highest
 * weighted) module which returns a valid theme name from this hook will
 * prevail.
 *
 * @return
 *   The machine-readable name of the theme that should be used for the current
 *   page request. The value returned from this function will only have an
 *   effect if it corresponds to a currently-active theme on the site. Do not
 *   return a value if you do not wish to set a custom theme.
 */
function hook_custom_theme() {
  // Allow the user to request a particular theme via a query parameter.
  if (isset($_GET['theme'])) {
    return $_GET['theme'];
  }
}

/**
 * Log an event message.
 *
 * This hook allows modules to route log events to custom destinations, such as
 * SMS, Email, pager, syslog, ...etc.
 *
 * @param array $log_entry
 *   An associative array containing the following keys:
 *   - type: The type of message for this entry.
 *   - user: The user object for the user who was logged in when the event
 *     happened.
 *   - request_uri: The request URI for the page the event happened in.
 *   - referer: The page that referred the user to the page where the event
 *     occurred.
 *   - ip: The IP address where the request for the page came from.
 *   - timestamp: The UNIX timestamp of the date/time the event occurred.
 *   - severity: The severity of the message; one of the following values as
 *     defined in @link http://www.faqs.org/rfcs/rfc3164.html RFC 3164: @endlink
 *     - WATCHDOG_EMERGENCY: Emergency, system is unusable.
 *     - WATCHDOG_ALERT: Alert, action must be taken immediately.
 *     - WATCHDOG_CRITICAL: Critical conditions.
 *     - WATCHDOG_ERROR: Error conditions.
 *     - WATCHDOG_WARNING: Warning conditions.
 *     - WATCHDOG_NOTICE: Normal but significant conditions.
 *     - WATCHDOG_INFO: Informational messages.
 *     - WATCHDOG_DEBUG: Debug-level messages.
 *     - WATCHDOG_DEPRECATED: Deprecated use of a function or feature.
 *   - link: An optional link provided by the module that called the watchdog()
 *     function.
 *   - message: The text of the message to be logged. Variables in the message
 *     are indicated by using placeholder strings alongside the variables
 *     argument to declare the value of the placeholders. See t() for
 *     documentation on how the message and variable parameters interact.
 *   - variables: An array of variables to be inserted into the message on
 *     display. Will be NULL or missing if a message is already translated or if
 *     the message is not possible to translate.
 */
function hook_watchdog(array $log_entry) {
  global $base_url, $language;

  $severity_list = array(
    WATCHDOG_EMERGENCY  => t('Emergency'),
    WATCHDOG_ALERT      => t('Alert'),
    WATCHDOG_CRITICAL   => t('Critical'),
    WATCHDOG_ERROR      => t('Error'),
    WATCHDOG_WARNING    => t('Warning'),
    WATCHDOG_NOTICE     => t('Notice'),
    WATCHDOG_INFO       => t('Info'),
    WATCHDOG_DEBUG      => t('Debug'),
    WATCHDOG_DEPRECATED => t('Deprecated Use'),
  );

  $to = 'someone@example.com';
  $params = array();
  $params['subject'] = t('[@site_name] @severity_desc: Alert from your web site', array(
    '@site_name' => config_get('system.core', 'site_name'),
    '@severity_desc' => $severity_list[$log_entry['severity']],
  ));

  $params['message']  = "\nSite:         @base_url";
  $params['message'] .= "\nSeverity:     (@severity) @severity_desc";
  $params['message'] .= "\nTimestamp:    @timestamp";
  $params['message'] .= "\nType:         @type";
  $params['message'] .= "\nIP Address:   @ip";
  $params['message'] .= "\nRequest URI:  @request_uri";
  $params['message'] .= "\nReferrer URI: @referer_uri";
  $params['message'] .= "\nUser:         (@uid) @name";
  $params['message'] .= "\nLink:         @link";
  $params['message'] .= "\nMessage:      \n\n@message";

  $params['message'] = t($params['message'], array(
    '@base_url'      => $base_url,
    '@severity'      => $log_entry['severity'],
    '@severity_desc' => $severity_list[$log_entry['severity']],
    '@timestamp'     => format_date($log_entry['timestamp']),
    '@type'          => $log_entry['type'],
    '@ip'            => $log_entry['ip'],
    '@request_uri'   => $log_entry['request_uri'],
    '@referer_uri'   => $log_entry['referer'],
    '@uid'           => $log_entry['user']->uid,
    '@name'          => $log_entry['user']->name,
    '@link'          => strip_tags($log_entry['link']),
    '@message'       => strip_tags($log_entry['message']),
  ));

  backdrop_mail('emaillog', 'entry', $to, $language, $params);
}

/**
 * Prepare a message based on parameters; called from backdrop_mail().
 *
 * Note that hook_mail(), unlike hook_mail_alter(), is only called on the
 * $module argument to backdrop_mail(), not all modules.
 *
 * @param $key
 *   An identifier of the mail.
 * @param $message
 *   An array to be filled in. Elements in this array include:
 *   - id: An ID to identify the mail sent. Look at module source code
 *     or backdrop_mail() for possible id values.
 *   - to: The address or addresses the message will be sent to. The
 *     formatting of this string must comply with RFC 2822.
 *   - subject: Subject of the e-mail to be sent. This must not contain any
 *     newline characters, or the mail may not be sent properly. backdrop_mail()
 *     sets this to an empty string when the hook is invoked.
 *   - body: An array of lines containing the message to be sent. Backdrop will
 *     format the correct line endings for you. backdrop_mail() sets this to an
 *     empty array when the hook is invoked.
 *   - from: The address the message will be marked as being from, which is
 *     set by backdrop_mail() to either a custom address or the site-wide
 *     default email address when the hook is invoked.
 *   - headers: Associative array containing mail headers, such as From,
 *     Sender, MIME-Version, Content-Type, etc. backdrop_mail() pre-fills
 *     several headers in this array.
 * @param $params
 *   An array of parameters supplied by the caller of backdrop_mail().
 */
function hook_mail($key, &$message, $params) {
  $account = $params['account'];
  $context = $params['context'];
  $variables = array(
    '%site_name' => config_get('system.core', 'site_name'),
    '%username' => user_format_name($account),
  );
  if ($context['hook'] == 'taxonomy') {
    $entity = $params['entity'];
    $vocabulary = taxonomy_vocabulary_load($entity->vocabulary);
    $variables += array(
      '%term_name' => $entity->name,
      '%term_description' => $entity->description,
      '%term_id' => $entity->tid,
      '%vocabulary_name' => $vocabulary->name,
      '%vocabulary_description' => $vocabulary->description,
      '%vocabulary_machine_name' => $vocabulary->machine_name,
    );
  }

  // Node-based variable translation is only available if we have a node.
  if (isset($params['node'])) {
    $node = $params['node'];
    $variables += array(
      '%uid' => $node->uid,
      '%node_url' => url('node/' . $node->nid, array('absolute' => TRUE)),
      '%node_type' => node_type_get_name($node),
      '%title' => $node->title,
      '%teaser' => $node->teaser,
      '%body' => $node->body,
    );
  }
  $subject = strtr($context['subject'], $variables);
  $body = strtr($context['message'], $variables);
  $message['subject'] .= str_replace(array("\r", "\n"), '', $subject);
  $message['body'][] = backdrop_html_to_text($body);
}

/**
 * Add a list of cache tables to be cleared.
 *
 * This hook allows your module to add cache bins to the list of cache bins
 * that will be cleared by the Clear button on the Performance page or
 * whenever backdrop_flush_all_caches is invoked.
 *
 * @return
 *   An array of cache bins.
 *
 * @see backdrop_flush_all_caches()
 */
function hook_flush_caches() {
  return array('example');
}

/**
 * Perform necessary actions before modules are installed.
 *
 * This function allows all modules to react prior to a module being installed.
 *
 * @param $modules
 *   An array of modules about to be installed.
 */
function hook_modules_preinstall($modules) {
  mymodule_cache_clear();
}

/**
 * Perform necessary actions before modules are enabled.
 *
 * This function allows all modules to react prior to a module being enabled.
 *
 * @param $module
 *   An array of modules about to be enabled.
 */
function hook_modules_preenable($modules) {
  mymodule_cache_clear();
}

/**
 * Perform necessary actions after modules are installed.
 *
 * This function differs from hook_install() in that it gives all other modules
 * a chance to perform actions when a module is installed, whereas
 * hook_install() is only called on the module actually being installed. See
 * module_enable() for a detailed description of the order in which install and
 * enable hooks are invoked.
 *
 * This hook should be implemented in a .module file, not in an .install file.
 *
 * @param $modules
 *   An array of the modules that were installed.
 *
 * @see module_enable()
 * @see hook_modules_enabled()
 * @see hook_install()
 */
function hook_modules_installed($modules) {
  if (in_array('other_module', $modules)) {
    backdrop_set_message(t('My module works together with Other Module. See the settings page for new options.'));
  }
}

/**
 * Perform necessary actions after modules are enabled.
 *
 * This function differs from hook_enable() in that it gives all other modules a
 * chance to perform actions when modules are enabled, whereas hook_enable() is
 * only called on the module actually being enabled. See module_enable() for a
 * detailed description of the order in which install and enable hooks are
 * invoked.
 *
 * @param $modules
 *   An array of the modules that were enabled.
 *
 * @see hook_enable()
 * @see hook_modules_installed()
 * @see module_enable()
 */
function hook_modules_enabled($modules) {
  if (in_array('lousy_module', $modules)) {
    backdrop_set_message(t('mymodule is not compatible with lousy_module'), 'error');
    mymodule_disable_functionality();
  }
}

/**
 * Perform necessary actions after modules are disabled.
 *
 * This function differs from hook_disable() in that it gives all other modules
 * a chance to perform actions when modules are disabled, whereas hook_disable()
 * is only called on the module actually being disabled.
 *
 * @param $modules
 *   An array of the modules that were disabled.
 *
 * @see hook_disable()
 * @see hook_modules_uninstalled()
 */
function hook_modules_disabled($modules) {
  if (in_array('lousy_module', $modules)) {
    mymodule_enable_functionality();
  }
}

/**
 * Perform necessary actions after modules are uninstalled.
 *
 * This function differs from hook_uninstall() in that it gives all other
 * modules a chance to perform actions when a module is uninstalled, whereas
 * hook_uninstall() is only called on the module actually being uninstalled.
 *
 * It is recommended that you implement this hook if your module stores
 * data that may have been set by other modules.
 *
 * @param $modules
 *   An array of the modules that were uninstalled.
 *
 * @see hook_uninstall()
 * @see hook_modules_disabled()
 */
function hook_modules_uninstalled($modules) {
  foreach ($modules as $module) {
    db_delete('mymodule_table')
      ->condition('module', $module)
      ->execute();
  }
  mymodule_cache_rebuild();
}

/**
 * Registers PHP stream wrapper implementations associated with a module.
 *
 * Provide a facility for managing and querying user-defined stream wrappers
 * in PHP. PHP's internal stream_get_wrappers() doesn't return the class
 * registered to handle a stream, which we need to be able to find the handler
 * for class instantiation.
 *
 * If a module registers a scheme that is already registered with PHP, it will
 * be unregistered and replaced with the specified class.
 *
 * @return
 *   A nested array, keyed first by scheme name ("public" for "public://"),
 *   then keyed by the following values:
 *   - 'name' A short string to name the wrapper.
 *   - 'class' A string specifying the PHP class that implements the
 *     BackdropStreamWrapperInterface interface.
 *   - 'description' A string with a short description of what the wrapper does.
 *   - 'type' (Optional) A bitmask of flags indicating what type of streams this
 *     wrapper will access - local or remote, readable and/or writeable, etc.
 *     Many shortcut constants are defined in stream_wrappers.inc. Defaults to
 *     STREAM_WRAPPERS_NORMAL which includes all of these bit flags:
 *     - STREAM_WRAPPERS_READ
 *     - STREAM_WRAPPERS_WRITE
 *     - STREAM_WRAPPERS_VISIBLE
 *
 * @see file_get_stream_wrappers()
 * @see hook_stream_wrappers_alter()
 * @see system_stream_wrappers()
 */
function hook_stream_wrappers() {
  return array(
    'public' => array(
      'name' => t('Public files'),
      'class' => 'BackdropPublicStreamWrapper',
      'description' => t('Public local files served by the webserver'),
      'type' => STREAM_WRAPPERS_LOCAL_NORMAL,
    ),
    'private' => array(
      'name' => t('Private files'),
      'class' => 'BackdropPrivateStreamWrapper',
      'description' => t('Private local files served by Backdrop'),
      'type' => STREAM_WRAPPERS_LOCAL_NORMAL,
    ),
    'temp' => array(
      'name' => t('Temporary files'),
      'class' => 'BackdropTempStreamWrapper',
      'description' => t('Temporary local files for upload and previews'),
      'type' => STREAM_WRAPPERS_LOCAL_HIDDEN,
    ),
    'cdn' => array(
      'name' => t('Content delivery network files'),
      'class' => 'MyModuleCDNStreamWrapper',
      'description' => t('Files served by a content delivery network'),
      // 'type' can be omitted to use the default of STREAM_WRAPPERS_NORMAL
    ),
    'youtube' => array(
      'name' => t('YouTube video'),
      'class' => 'MyModuleYouTubeStreamWrapper',
      'description' => t('Video streamed from YouTube'),
      // A module implementing YouTube integration may decide to support using
      // the YouTube API for uploading video, but here, we assume that this
      // particular module only supports playing YouTube video.
      'type' => STREAM_WRAPPERS_READ_VISIBLE,
    ),
  );
}

/**
 * Alters the list of PHP stream wrapper implementations.
 *
 * @see file_get_stream_wrappers()
 * @see hook_stream_wrappers()
 */
function hook_stream_wrappers_alter(&$wrappers) {
  // Change the name of private files to reflect the performance.
  $wrappers['private']['name'] = t('Slow files');
}

/**
 * Load additional information into file entities.
 *
 * file_load_multiple() calls this hook to allow modules to load
 * additional information into each file.
 *
 * @param $files
 *   An array of file entities, indexed by fid.
 *
 * @see file_load_multiple()
 * @see file_load()
 */
function hook_file_load($files) {
  // Add the upload specific data into the file entity.
  $result = db_query('SELECT * FROM {upload} u WHERE u.fid IN (:fids)', array(':fids' => array_keys($files)))->fetchAll(PDO::FETCH_ASSOC);
  foreach ($result as $record) {
    foreach ($record as $key => $value) {
      $files[$record['fid']]->$key = $value;
    }
  }
}

/**
 * Check that files meet a given criteria.
 *
 * This hook lets modules perform additional validation on files. They're able
 * to report a failure by returning one or more error messages.
 *
 * @param File $file
 *   The file entity being validated.
 * @return
 *   An array of error messages. If there are no problems with the file return
 *   an empty array.
 *
 * @see file_validate()
 */
function hook_file_validate(File $file) {
  $errors = array();

  if (empty($file->filename)) {
    $errors[] = t("The file's name is empty. Please give a name to the file.");
  }
  if (strlen($file->filename) > 255) {
    $errors[] = t("The file's name exceeds the 255 characters limit. Please rename the file and try again.");
  }

  return $errors;
}

/**
 * Act on a file being inserted or updated.
 *
 * This hook is called when a file has been added to the database. The hook
 * doesn't distinguish between files created as a result of a copy or those
 * created by an upload.
 *
 * @param File $file
 *   The file entity that is about to be created or updated.
 */
function hook_file_presave(File $file) {
  // Change the file timestamp to an hour prior.
  $file->timestamp -= 3600;
}

/**
 * Respond to a file being added.
 *
 * This hook is called after a file has been added to the database. The hook
 * doesn't distinguish between files created as a result of a copy or those
 * created by an upload.
 *
 * @param File $file
 *   The file that has been added.
 */
function hook_file_insert(File $file) {
  // Add a message to the log, if the file is a jpg
  $validate = file_validate_extensions($file, 'jpg');
  if (empty($validate)) {
    watchdog('file', 'A jpg has been added.');
  }
}

/**
 * Respond to a file being updated.
 *
 * This hook is called when an existing file is saved.
 *
 * @param File $file
 *   The file that has just been updated.
 */
function hook_file_update(File $file) {
  $file_user = user_load($file->uid);
  // Make sure that the file name starts with the owner's user name.
  if (strpos($file->filename, $file_user->name) !== 0) {
    $old_filename = $file->filename;
    $file->filename = $file_user->name . '_' . $file->filename;
    $file->save();

    watchdog('file', t('%source has been renamed to %destination', array('%source' => $old_filename, '%destination' => $file->filename)));
  }
}

/**
 * Respond to a file that has been copied.
 *
 * @param File $file
 *   The newly copied file entity.
 * @param File $source
 *   The original file before the copy.
 *
 * @see file_copy()
 */
function hook_file_copy(File $file, File $source) {
  $file_user = user_load($file->uid);
  // Make sure that the file name starts with the owner's user name.
  if (strpos($file->filename, $file_user->name) !== 0) {
    $file->filename = $file_user->name . '_' . $file->filename;
    $file->save();

    watchdog('file', t('Copied file %source has been renamed to %destination', array('%source' => $source->filename, '%destination' => $file->filename)));
  }
}

/**
 * Respond to a file that has been moved.
 *
 * @param File $file
 *   The updated file entity after the move.
 * @param File $source
 *   The original file entity before the move.
 *
 * @see file_move()
 */
function hook_file_move(File $file, File $source) {
  $file_user = user_load($file->uid);
  // Make sure that the file name starts with the owner's user name.
  if (strpos($file->filename, $file_user->name) !== 0) {
    $file->filename = $file_user->name . '_' . $file->filename;
    $file->save();

    watchdog('file', t('Moved file %source has been renamed to %destination', array('%source' => $source->filename, '%destination' => $file->filename)));
  }
}

/**
 * Act prior to file deletion.
 *
 * This hook is invoked when deleting a file before the file is removed from the
 * filesystem and before its records are removed from the database.
 *
 * @param File $file
 *   The file that is about to be deleted.
 *
 * @see hook_file_delete()
 * @see FileStorageController::delete()
 * @see upload_file_delete()
 */
function hook_file_predelete(File $file) {
  // Delete all information associated with the file.
  db_delete('upload')->condition('fid', $file->fid)->execute();
}

/**
 * Respond to file deletion.
 *
 * This hook is invoked after the file has been removed from
 * the filesystem and after its records have been removed from the database.
 *
 * @param File $file
 *   The file that has just been deleted.
 *
 * @see hook_file_predelete()
 * @see FileStorageController::delete()
 */
function hook_file_delete(File $file) {
  // Delete all information associated with the file.
  db_delete('upload')->condition('fid', $file->fid)->execute();
}

/**
 * Control access to private file downloads and specify HTTP headers.
 *
 * This hook allows modules enforce permissions on file downloads when the
 * private file download method is selected. Modules can also provide headers
 * to specify information like the file's name or MIME type.
 *
 * @param $uri
 *   The URI of the file.
 * @return
 *   If the user does not have permission to access the file, return -1. If the
 *   user has permission, return an array with the appropriate headers. If the
 *   file is not controlled by the current module, the return value should be
 *   NULL.
 *
 * @see file_download()
 */
function hook_file_download($uri) {
  // Check if the file is controlled by the current module.
  if (!file_prepare_directory($uri)) {
    $uri = FALSE;
  }
  if (strpos(file_uri_target($uri), config_get('system.core', 'user_picture_path') . '/picture-') === 0) {
    if (!user_access('access user profiles')) {
      // Access to the file is denied.
      return -1;
    }
    else {
      $info = image_get_info($uri);
      return array('Content-Type' => $info['mime_type']);
    }
  }
}

/**
 * Alter the URL to a file.
 *
 * This hook is called from file_create_url(), and  is called fairly
 * frequently (10+ times per page), depending on how many files there are in a
 * given page.
 * If CSS and JS aggregation are disabled, this can become very frequently
 * (50+ times per page) so performance is critical.
 *
 * This function should alter the URI, if it wants to rewrite the file URL.
 *
 * @param $uri
 *   The URI to a file for which we need an external URL, or the path to a
 *   shipped file.
 */
function hook_file_url_alter(&$uri) {
  global $user;

  // User 1 will always see the local file in this example.
  if ($user->uid == 1) {
    return;
  }

  $cdn1 = 'http://cdn1.example.com';
  $cdn2 = 'http://cdn2.example.com';
  $cdn_extensions = array('css', 'js', 'gif', 'jpg', 'jpeg', 'png');

  // Most CDNs don't support private file transfers without a lot of hassle,
  // so don't support this in the common case.
  $schemes = array('public');

  $scheme = file_uri_scheme($uri);

  // Only serve shipped files and public created files from the CDN.
  if (!$scheme || in_array($scheme, $schemes)) {
    // Shipped files.
    if (!$scheme) {
      $path = $uri;
    }
    // Public created files.
    else {
      $wrapper = file_stream_wrapper_get_instance_by_scheme($scheme);
      $path = $wrapper->getDirectoryPath() . '/' . file_uri_target($uri);
    }

    // Clean up Windows paths.
    $path = str_replace('\\', '/', $path);

    // Serve files with one of the CDN extensions from CDN 1, all others from
    // CDN 2.
    $pathinfo = pathinfo($path);
    if (isset($pathinfo['extension']) && in_array($pathinfo['extension'], $cdn_extensions)) {
      $uri = $cdn1 . '/' . $path;
    }
    else {
      $uri = $cdn2 . '/' . $path;
    }
  }
}

/**
 * Check installation requirements and do status reporting.
 *
 * This hook has three closely related uses, determined by the $phase argument:
 * - Checking installation requirements ($phase == 'install').
 * - Checking update requirements ($phase == 'update').
 * - Status reporting ($phase == 'runtime').
 *
 * Note that this hook, like all others dealing with installation and updates,
 * must reside in a module_name.install file, or it will not properly abort
 * the installation of the module if a critical requirement is missing.
 *
 * During the 'install' phase, modules can for example assert that
 * library or server versions are available or sufficient.
 * Note that the installation of a module can happen during installation of
 * core itself (by install.php) with an installation profile or later by hand.
 * As a consequence, install-time requirements must be checked without access
 * to the full Backdrop API, because it is not available during install.php.
 * For localization you should for example use $t = get_t() to
 * retrieve the appropriate localization function name (t() or st()).
 * If a requirement has a severity of REQUIREMENT_ERROR, install.php will abort
 * or at least the module will not install.
 * Other severity levels have no effect on the installation.
 * Module dependencies do not belong to these installation requirements,
 * but should be defined in the module's .info file.
 *
 * The 'runtime' phase is not limited to pure installation requirements
 * but can also be used for more general status information like maintenance
 * tasks and security issues.
 * The returned 'requirements' will be listed on the status report in the
 * administration section, with indication of the severity level.
 * Moreover, any requirement with a severity of REQUIREMENT_ERROR severity will
 * result in a notice on the administration configuration page.
 *
 * @param $phase
 *   The phase in which requirements are checked:
 *   - install: The module is being installed.
 *   - update: The module is enabled and update.php is run.
 *   - runtime: The runtime requirements are being checked and shown on the
 *     status report page.
 *
 * @return
 *   An associative array where the keys are arbitrary but must be unique (it
 *   is suggested to use the module short name as a prefix) and the values are
 *   themselves associative arrays with the following elements:
 *   - title: The name of the requirement.
 *   - value: The current value (e.g., version, time, level, etc). During
 *     install phase, this should only be used for version numbers, do not set
 *     it if not applicable.
 *   - description: The description of the requirement/status.
 *   - severity: The requirement's result/severity level, one of:
 *     - REQUIREMENT_INFO: For info only.
 *     - REQUIREMENT_OK: The requirement is satisfied.
 *     - REQUIREMENT_WARNING: The requirement failed with a warning.
 *     - REQUIREMENT_ERROR: The requirement failed with an error.
 */
function hook_requirements($phase) {
  $requirements = array();
  // Ensure translations don't break during installation.
  $t = get_t();

  // Report Backdrop version
  if ($phase == 'runtime') {
    $requirements['backdrop'] = array(
      'title' => $t('Backdrop CMS'),
      'value' => BACKDROP_VERSION,
      'severity' => REQUIREMENT_INFO
    );
  }

  // Test PHP version
  $requirements['php'] = array(
    'title' => $t('PHP'),
    'value' => ($phase == 'runtime') ? l(phpversion(), 'admin/reports/status/php') : phpversion(),
  );
  if (version_compare(phpversion(), BACKDROP_MINIMUM_PHP) < 0) {
    $requirements['php']['description'] = $t('Your PHP installation is too old. Backdrop CMS requires at least PHP %version.', array('%version' => BACKDROP_MINIMUM_PHP));
    $requirements['php']['severity'] = REQUIREMENT_ERROR;
  }

  // Report cron status
  if ($phase == 'runtime') {
    $cron_last = state_get('cron_last');

    if (is_numeric($cron_last)) {
      $requirements['cron']['value'] = $t('Last run !time ago', array('!time' => format_interval(REQUEST_TIME - $cron_last)));
    }
    else {
      $requirements['cron'] = array(
        'description' => $t('Cron has not run. It appears cron jobs have not been setup on your system. Check the help pages for <a href="@url">configuring cron jobs</a>.', array('@url' => 'http://drupal.org/cron')),
        'severity' => REQUIREMENT_ERROR,
        'value' => $t('Never run'),
      );
    }

    $requirements['cron']['description'] .= ' ' . $t('You can <a href="@cron">run cron manually</a>.', array('@cron' => url('admin/reports/status/run-cron')));

    $requirements['cron']['title'] = $t('Cron maintenance tasks');
  }

  return $requirements;
}

/**
 * Define the current version of the database schema.
 *
 * A Backdrop schema definition is an array structure representing one or more
 * tables and their related keys and indexes. A schema is defined by
 * hook_schema() which must live in your module's .install file.
 *
 * This hook is called at install and uninstall time, and in the latter case, it
 * cannot rely on the .module file being loaded or hooks being known. If the
 * .module file is needed, it may be loaded with backdrop_load().
 *
 * The tables declared by this hook will be automatically created when the
 * module is first enabled, and removed when the module is uninstalled. This
 * happens before hook_install() is invoked, and after hook_uninstall() is
 * invoked, respectively.
 *
 * By declaring the tables used by your module via an implementation of
 * hook_schema(), these tables will be available on all supported database
 * engines. You don't have to deal with the different SQL dialects for table
 * creation and alteration of the supported database engines.
 *
 * See the Schema API Handbook at http://drupal.org/node/146843 for details on
 * schema definition structures. Note that foreign key definitions are for
 * documentation purposes only; foreign keys are not created in the database,
 * nor are they enforced by Backdrop.
 *
 * @return array
 *   A schema definition structure array. For each element of the
 *   array, the key is a table name and the value is a table structure
 *   definition.
 *
 * @see hook_schema_alter()
 *
 * @ingroup schemaapi
 */
function hook_schema() {
  $schema['node'] = array(
    // Example (partial) specification for table "node".
    'description' => 'The base table for nodes.',
    'fields' => array(
      'nid' => array(
        'description' => 'The primary identifier for a node.',
        'type' => 'serial',
        'unsigned' => TRUE,
        'not null' => TRUE,
      ),
      'vid' => array(
        'description' => 'The current {node_revision}.vid version identifier.',
        'type' => 'int',
        'unsigned' => TRUE,
        'not null' => TRUE,
        'default' => 0,
      ),
      'type' => array(
        'description' => 'The {node_type} of this node.',
        'type' => 'varchar',
        'length' => 32,
        'not null' => TRUE,
        'default' => '',
      ),
      'title' => array(
        'description' => 'The title of this node, always treated as non-markup plain text.',
        'type' => 'varchar',
        'length' => 255,
        'not null' => TRUE,
        'default' => '',
      ),
    ),
    'indexes' => array(
      'node_changed'        => array('changed'),
      'node_created'        => array('created'),
    ),
    'unique keys' => array(
      'nid_vid' => array('nid', 'vid'),
      'vid'     => array('vid')
    ),
    // For documentation purposes only; foreign keys are not created in the
    // database.
    'foreign keys' => array(
      'node_revision' => array(
        'table' => 'node_revision',
        'columns' => array('vid' => 'vid'),
      ),
      'node_author' => array(
        'table' => 'users',
        'columns' => array('uid' => 'uid'),
      ),
    ),
    'primary key' => array('nid'),
  );
  return $schema;
}

/**
 * Perform alterations to existing database schemas.
 *
 * When a module modifies the database structure of another module (by
 * changing, adding or removing fields, keys or indexes), it should
 * implement hook_schema_alter() to update the default $schema to take its
 * changes into account.
 *
 * See hook_schema() for details on the schema definition structure.
 *
 * @param $schema
 *   Nested array describing the schemas for all modules.
 *
 * @ingroup schemaapi
 */
function hook_schema_alter(&$schema) {
  // Add field to existing schema.
  $schema['users']['fields']['timezone_id'] = array(
    'type' => 'int',
    'not null' => TRUE,
    'default' => 0,
    'description' => 'Per-user timezone configuration.',
  );
}

/**
 * Perform alterations to a structured query.
 *
 * Structured (aka dynamic) queries that have tags associated may be altered by any module
 * before the query is executed.
 *
 * @param $query
 *   A Query object describing the composite parts of a SQL query.
 *
 * @see hook_query_TAG_alter()
 * @see node_query_node_access_alter()
 * @see QueryAlterableInterface
 * @see SelectQueryInterface
 */
function hook_query_alter(QueryAlterableInterface $query) {
  if ($query->hasTag('micro_limit')) {
    $query->range(0, 2);
  }
}

/**
 * Perform alterations to a structured query for a given tag.
 *
 * @param $query
 *   An Query object describing the composite parts of a SQL query.
 *
 * @see hook_query_alter()
 * @see node_query_node_access_alter()
 * @see QueryAlterableInterface
 * @see SelectQueryInterface
 */
function hook_query_TAG_alter(QueryAlterableInterface $query) {
  // Skip the extra expensive alterations if site has no node access control modules.
  if (!node_access_view_all_nodes()) {
    // Prevent duplicates records.
    $query->distinct();
    // The recognized operations are 'view', 'update', 'delete'.
    if (!$op = $query->getMetaData('op')) {
      $op = 'view';
    }
    // Skip the extra joins and conditions for node admins.
    if (!user_access('bypass node access')) {
      // The node_access table has the access grants for any given node.
      $access_alias = $query->join('node_access', 'na', '%alias.nid = n.nid');
      $or = db_or();
      // If any grant exists for the specified user, then user has access to the node for the specified operation.
      foreach (node_access_grants($op, $query->getMetaData('account')) as $realm => $gids) {
        foreach ($gids as $gid) {
          $or->condition(db_and()
            ->condition($access_alias . '.gid', $gid)
            ->condition($access_alias . '.realm', $realm)
          );
        }
      }

      if (count($or->conditions())) {
        $query->condition($or);
      }

      $query->condition($access_alias . 'grant_' . $op, 1, '>=');
    }
  }
}

/**
 * Perform setup tasks when the module is installed.
 *
 * If the module implements hook_schema(), the database tables will
 * be created before this hook is fired.
 *
 * Implementations of this hook are by convention declared in the module's
 * .install file. The implementation can rely on the .module file being loaded.
 * The hook will only be called the first time a module is enabled or after it
 * is re-enabled after being uninstalled. The module's schema version will be
 * set to the module's greatest numbered update hook. Because of this, any time
 * a hook_update_N() is added to the module, this function needs to be updated
 * to reflect the current version of the database schema.
 *
 * See the @link http://drupal.org/node/146843 Schema API documentation @endlink
 * for details on hook_schema and how database tables are defined.
 *
 * Note that since this function is called from a full bootstrap, all functions
 * (including those in modules enabled by the current page request) are
 * available when this hook is called. Use cases could be displaying a user
 * message, or calling a module function necessary for initial setup, etc.
 *
 * Please be sure that anything added or modified in this function that can
 * be removed during uninstall should be removed with hook_uninstall().
 *
 * @see hook_schema()
 * @see module_enable()
 * @see hook_enable()
 * @see hook_disable()
 * @see hook_uninstall()
 * @see hook_modules_installed()
 */
function hook_install() {
  // Populate the default {node_access} record.
  db_insert('node_access')
    ->fields(array(
      'nid' => 0,
      'gid' => 0,
      'realm' => 'all',
      'grant_view' => 1,
      'grant_update' => 0,
      'grant_delete' => 0,
    ))
    ->execute();
}

/**
 * Perform a single update.
 *
 * For each change that requires one or more actions to be performed when
 * updating a site, add a new hook_update_N(), which will be called by
 * update.php. The documentation block preceding the update function is used as
 * the description for the update on the pending updates at update.php. Schema
 * updates should adhere to the
 * @link http://drupal.org/node/150215 Schema API. @endlink
 *
 * Implementations of this hook should be placed in a mymodule.install file in
 * the same directory as mymodule.module. Backdrop core's updates are implemented
 * using the system module as a name and stored in database/updates.inc.
 *
 * Implementations of hook_update_N() are named (module name)_update_(number).
 * The numbers are composed of three parts:
 * - 1 digit for Backdrop core compatibility.
 * - 1 digit for your module's major release version (e.g., is this the 1.x-1.*
 *   (1) or 1.x-2.* (2) series of your module?). This digit should be 0 for
 *   initial porting of your module to a new Backdrop core API.
 * - 2 digits for sequential counting, starting with 00.
 *
 * Backdrop includes special considerations for updating from Drupal 7 websites.
 * While Drupal 7 updates should be numbered 7xxx, Backdrop 1.x updates are
 * numbered 1xxx. For the sake of compatibility, Backdrop will run any
 * remaining 7xxx updates before running 1xxx updates. For the safest upgrade
 * path possible, it's recommended Drupal 7 modules are running their latest
 * version before attempting to upgrade to Backdrop equivalents. This upgrade
 * compatibility also means that adhering to the naming convention of 1xxx for
 * Backdrop updates is extremely important. Backdrop updates numbered greater
 * than 6999 will have unexpected behavior, as they are reserved for Drupal 7
 * compatibility.
 *
 * Examples:
 * - mymodule_update_1000(): This is the required update for mymodule to run
 *   with Backdrop core API 1.x when upgrading from Drupal core API 7.x.
 * - mymodule_update_1100(): This is the first update to get the database ready
 *   to run mymodule 1.x-1.*.
 * - mymodule_update_1200(): This is the first update to get the database ready
 *   to run mymodule 7.x-2.*. Users can directly update from 1.x-2.* to 2.x-2.*
 *   and they get all 10xx and 12xx updates, but not 11xx updates, because
 *   those reside in the 1.x-1.x branch only.
 *
 * A good rule of thumb is to remove updates older than two major releases of
 * Backdrop. See hook_update_last_removed() to notify Backdrop about the
 * removals. For further information about releases and release numbers see the
 * @link https://backdropcms.org/about/releases Backdrop CMS Release Cycle handbook page @endlink
 *
 * Because Backdrop keeps track of the last ran update based on the function
 * name, you should never renumber update functions. It may result in updates
 * being either skipped or run twice.
 *
 * Not all module functions are available from within a hook_update_N() function.
 * In order to call a function from your mymodule.module or an include file,
 * you need to explicitly load that file first.
 *
 * During database updates the schema of any module could be out of date. For
 * this reason, caution is needed when using any API function within an update
 * function - particularly CRUD functions, functions that depend on the schema
 * (for example by using backdrop_write_record()), and any functions that invoke
 * hooks. See @link update_api Update versions of API functions @endlink for
 * details.
 *
 * If your update task is potentially time-consuming, you'll need to implement a
 * multipass update to avoid PHP timeouts. Multipass updates use the $sandbox
 * parameter provided by the batch API (normally, $context['sandbox']) to store
 * information between successive calls, and the $sandbox['#finished'] value
 * to provide feedback regarding completion level.
 *
 * See the batch operations page for more information on how to use the
 * @link http://drupal.org/node/180528 Batch API. @endlink
 *
 * @param $sandbox
 *   Stores information for multipass updates. See above for more information.
 *
 * @throws BackdropUpdateException, PDOException
 *   In case of error, update hooks should throw an instance of BackdropUpdateException
 *   with a meaningful message for the user. If a database query fails for whatever
 *   reason, it will throw a PDOException.
 *
 * @return
 *   Optionally, update hooks may return a translated string that will be
 *   displayed to the user after the update has completed. If no message is
 *   returned, no message will be presented to the user.
 *
 * @see batch
 * @see schemaapi
 * @see update_api
 * @see hook_update_last_removed()
 * @see update_get_update_list()
 */
function hook_update_N(&$sandbox) {
  // For non-multipass updates, the signature can simply be;
  // function hook_update_N() {

  // For most updates, the following is sufficient.
  db_add_field('mytable1', 'newcol', array('type' => 'int', 'not null' => TRUE, 'description' => 'My new integer column.'));

  // However, for more complex operations that may take a long time,
  // you may hook into Batch API as in the following example.

  // Update 3 users at a time to have an exclamation point after their names.
  // (They're really happy that we can do batch API in this hook!)
  if (!isset($sandbox['progress'])) {
    $sandbox['progress'] = 0;
    $sandbox['current_uid'] = 0;
    // We'll -1 to disregard the uid 0...
    $sandbox['max'] = db_query('SELECT COUNT(DISTINCT uid) FROM {users}')->fetchField() - 1;
  }

  $users = db_select('users', 'u')
    ->fields('u', array('uid', 'name'))
    ->condition('uid', $sandbox['current_uid'], '>')
    ->range(0, 3)
    ->orderBy('uid', 'ASC')
    ->execute();

  foreach ($users as $user) {
    $user->name .= '!';
    db_update('users')
      ->fields(array('name' => $user->name))
      ->condition('uid', $user->uid)
      ->execute();

    $sandbox['progress']++;
    $sandbox['current_uid'] = $user->uid;
  }

  $sandbox['#finished'] = empty($sandbox['max']) ? 1 : ($sandbox['progress'] / $sandbox['max']);

  // To display a message to the user when the update is completed, return it.
  // If you do not want to display a completion message, simply return nothing.
  return t('The update did what it was supposed to do.');

  // In case of an error, simply throw an exception with an error message.
  throw new BackdropUpdateException('Something went wrong; here is what you should do.');
}

/**
 * Return an array of information about module update dependencies.
 *
 * This can be used to indicate update functions from other modules that your
 * module's update functions depend on, or vice versa. It is used by the update
 * system to determine the appropriate order in which updates should be run, as
 * well as to search for missing dependencies.
 *
 * Implementations of this hook should be placed in a mymodule.install file in
 * the same directory as mymodule.module.
 *
 * @return
 *   A multidimensional array containing information about the module update
 *   dependencies. The first two levels of keys represent the module and update
 *   number (respectively) for which information is being returned, and the
 *   value is an array of information about that update's dependencies. Within
 *   this array, each key represents a module, and each value represents the
 *   number of an update function within that module. In the event that your
 *   update function depends on more than one update from a particular module,
 *   you should always list the highest numbered one here (since updates within
 *   a given module always run in numerical order).
 *
 * @see update_resolve_dependencies()
 * @see hook_update_N()
 */
function hook_update_dependencies() {
  // Indicate that the mymodule_update_1000() function provided by this module
  // must run after the another_module_update_1002() function provided by the
  // 'another_module' module.
  $dependencies['mymodule'][1000] = array(
    'another_module' => 1002,
  );
  // Indicate that the mymodule_update_1001() function provided by this module
  // must run before the yet_another_module_update_1004() function provided by
  // the 'yet_another_module' module. (Note that declaring dependencies in this
  // direction should be done only in rare situations, since it can lead to the
  // following problem: If a site has already run the yet_another_module
  // module's database updates before it updates its codebase to pick up the
  // newest mymodule code, then the dependency declared here will be ignored.)
  $dependencies['yet_another_module'][1004] = array(
    'mymodule' => 1001,
  );
  return $dependencies;
}

/**
 * Return a number which is no longer available as hook_update_N().
 *
 * If you remove some update functions from your mymodule.install file, you
 * should notify Backdrop of those missing functions. This way, Backdrop can
 * ensure that no update is accidentally skipped.
 *
 * Implementations of this hook should be placed in a mymodule.install file in
 * the same directory as mymodule.module.
 *
 * If upgrading from a Drupal 7 module where the last removed update was a
 * update function numbering in the 7xxx values, that update number should still
 * be returned even though it is a higher number than the first Backdrop module
 * update (which should start at hook_update_1000). When comparing update
 * numbers, Backdrop will consider 1xxx updates to come after 7xxx updates.
 *
 * @return int
 *   An integer, corresponding to hook_update_N() which has been removed from
 *   mymodule.install.
 *
 * @see hook_update_N()
 */
function hook_update_last_removed() {
  // We've removed the 1.x-1.x version of mymodule, including database updates.
  // For the 1.x-2.x version of the module, the next update function would be
  // mymodule_update_1200().
  return 1103;
}

/**
 * Remove any information that the module sets.
 *
 * The information that the module should remove includes:
 * - settings that the module has set using state_set().
 * - modifications to existing tables
 *
 * The module should not remove its entry from the {system} table. Database
 * tables defined by hook_schema() will be removed automatically.
 *
 * The uninstall hook must be implemented in the module's .install file. It
 * will fire when the module gets uninstalled but before the module's database
 * tables are removed, allowing your module to query its own tables during
 * this routine.
 *
 * When hook_uninstall() is called, your module will already be disabled, so
 * its .module file will not be automatically included. If you need to call API
 * functions from your .module file in this hook, use backdrop_load() to make
 * them available. (Keep this usage to a minimum, though, especially when
 * calling API functions that invoke hooks, or API functions from modules
 * listed as dependencies, since these may not be available or work as expected
 * when the module is disabled.)
 *
 * @see hook_install()
 * @see hook_schema()
 * @see hook_disable()
 * @see hook_modules_uninstalled()
 */
function hook_uninstall() {
  state_del('my_module_last_cron');
}

/**
 * Perform necessary actions after module is enabled.
 *
 * The hook is called every time the module is enabled. It should be
 * implemented in the module's .install file. The implementation can
 * rely on the .module file being loaded.
 *
 * @see module_enable()
 * @see hook_install()
 * @see hook_modules_enabled()
 */
function hook_enable() {
  mymodule_cache_rebuild();
}

/**
 * Perform necessary actions before module is disabled.
 *
 * The hook is called every time the module is disabled. It should be
 * implemented in the module's .install file. The implementation can rely
 * on the .module file being loaded.
 *
 * @see hook_uninstall()
 * @see hook_modules_disabled()
 */
function hook_disable() {
  mymodule_cache_rebuild();
}

/**
 * Define the paths to classes and interfaces within a module.
 *
 * Most classes and interfaces in Backdrop should be autoloaded. This will
 * prevent the need to manually include the file that contains that class with
 * PHP's include_once() or require_once().
 *
 * Note that all paths to classes are relative to the module that is
 * implementing this hook. If you need to reference classes outside of the
 * module root or modify existing paths, use hook_autoload_info_alter() instead.
 *
 * Class names in Backdrop are typically CamelCase, with uppercase letters at
 * the start of each word (including the first letter) and no underscores.
 * The file names for classes are typically either [module_name].[class_name].inc
 * or simply [ModuleNameClassName].php.
 *
 * For more information about class naming conventions see the
 * @link https://api.backdropcms.org/php-standards Backdrop Coding Standards @endlink
 *
 * The contents of this hook are not cached. Because of this, absolutely no
 * logic should be included in this hook. Do not do any database queries or
 * traverse files or directories on disk. Each class and interface class should
 * be specified manually with the exact path to ensure fast performance.
 *
 * @see backdrop_autoload()
 * @see hook_autoload_info_alter()
 */
function hook_autoload_info() {
  return array(
    'MyModuleClassName' => 'includes/my_module.class_name.inc',
    'MyModuleOtherName' => 'includes/my_module.other_name.inc',
    'MyModuleSomeInterface' => 'includes/my_module.some_interface.inc',
  );
}

/**
 * Perform alterations to the list of classes included in the registry.
 *
 * This hook may be used to modify the list of classes and interfaces used by
 * Backdrop that have been provided by other modules. If your module is
 * defining it's own classes or interfaces, it should use hook_autoload_info()
 * instead.
 *
 * @param $class_registry
 *   List of classes in the registry.
 *
 * @see backdrop_autoload()
 * @see hook_autoload_info()
 */
function hook_autoload_info_alter(&$class_registry) {
  // Replace the database cache with a different database cache.
  $class_registry['BackdropDatabaseCache'] = 'alternative/path/to/cache.inc';
}

/**
 * Return an array of tasks to be performed by an installation profile.
 *
 * Any tasks you define here will be run, in order, after the installer has
 * finished the site configuration step but before it has moved on to the
 * final import of languages and the end of the installation. This is invoked
 * by install_tasks().  You can have any number of custom tasks to perform
 * during this phase.
 *
 * Each task you define here corresponds to a callback function which you must
 * separately define and which is called when your task is run. This function
 * will receive the global installation state variable, $install_state, as
 * input, and has the opportunity to access or modify any of its settings. See
 * the install_state_defaults() function in the installer for the list of
 * $install_state settings used by Backdrop core.
 *
 * At the end of your task function, you can indicate that you want the
 * installer to pause and display a page to the user by returning any themed
 * output that should be displayed on that page (but see below for tasks that
 * use the form API or batch API; the return values of these task functions are
 * handled differently). You should also use backdrop_set_title() within the task
 * callback function to set a custom page title. For some tasks, however, you
 * may want to simply do some processing and pass control to the next task
 * without ending the page request; to indicate this, simply do not send back
 * a return value from your task function at all. This can be used, for
 * example, by installation profiles that need to configure certain site
 * settings in the database without obtaining any input from the user.
 *
 * The task function is treated specially if it defines a form or requires
 * batch processing; in that case, you should return either the form API
 * definition or batch API array, as appropriate. See below for more
 * information on the 'type' key that you must define in the task definition
 * to inform the installer that your task falls into one of those two
 * categories. It is important to use these APIs directly, since the installer
 * may be run non-interactively (for example, via a command line script), all
 * in one page request; in that case, the installer will automatically take
 * care of submitting forms and processing batches correctly for both types of
 * installations. You can inspect the $install_state['interactive'] boolean to
 * see whether or not the current installation is interactive, if you need
 * access to this information.
 *
 * Remember that a user installing Backdrop interactively will be able to reload
 * an installation page multiple times, so you should use state_set() and
 * state_get() if you are collecting any data that you need to store and
 * inspect later. It is important to remove any temporary variables using
 * state_del() before your last task has completed and control is handed
 * back to the installer.
 *
 * @param array $install_state
 *   An array of information about the current installation state.
 *
 * @return array
 *   A keyed array of tasks the profile will perform during the final stage of
 *   the installation. Each key represents the name of a function (usually a
 *   function defined by this profile, although that is not strictly required)
 *   that is called when that task is run. The values are associative arrays
 *   containing the following key-value pairs (all of which are optional):
 *   - display_name: The human-readable name of the task. This will be
 *     displayed to the user while the installer is running, along with a list
 *     of other tasks that are being run. Leave this unset to prevent the task
 *     from appearing in the list.
 *   - display: This is a boolean which can be used to provide finer-grained
 *     control over whether or not the task will display. This is mostly useful
 *     for tasks that are intended to display only under certain conditions;
 *     for these tasks, you can set 'display_name' to the name that you want to
 *     display, but then use this boolean to hide the task only when certain
 *     conditions apply.
 *   - type: A string representing the type of task. This parameter has three
 *     possible values:
 *     - normal: (default) This indicates that the task will be treated as a
 *       regular callback function, which does its processing and optionally
 *       returns HTML output.
 *     - batch: This indicates that the task function will return a batch API
 *       definition suitable for batch_set(). The installer will then take care
 *       of automatically running the task via batch processing.
 *     - form: This indicates that the task function will return a standard
 *       form API definition (and separately define validation and submit
 *       handlers, as appropriate). The installer will then take care of
 *       automatically directing the user through the form submission process.
 *   - run: A constant representing the manner in which the task will be run.
 *     This parameter has three possible values:
 *     - INSTALL_TASK_RUN_IF_NOT_COMPLETED: (default) This indicates that the
 *       task will run once during the installation of the profile.
 *     - INSTALL_TASK_SKIP: This indicates that the task will not run during
 *       the current installation page request. It can be used to skip running
 *       an installation task when certain conditions are met, even though the
 *       task may still show on the list of installation tasks presented to the
 *       user.
 *     - INSTALL_TASK_RUN_IF_REACHED: This indicates that the task will run on
 *       each installation page request that reaches it. This is rarely
 *       necessary for an installation profile to use; it is primarily used by
 *       the Backdrop installer for bootstrap-related tasks.
 *   - function: Normally this does not need to be set, but it can be used to
 *     force the installer to call a different function when the task is run
 *     (rather than the function whose name is given by the array key). This
 *     could be used, for example, to allow the same function to be called by
 *     two different tasks.
 *
 * @see install_state_defaults()
 * @see batch_set()
 * @see hook_install_tasks_alter()
 * @see install_tasks()
 */
function hook_install_tasks(&$install_state) {
  // Here, we define a variable to allow tasks to indicate that a particular,
  // processor-intensive batch process needs to be triggered later on in the
  // installation.
  $myprofile_needs_batch_processing = state_get('myprofile_needs_batch_processing', FALSE);
  $tasks = array(
    // This is an example of a task that defines a form which the user who is
    // installing the site will be asked to fill out. To implement this task,
    // your profile would define a function named myprofile_data_import_form()
    // as a normal form API callback function, with associated validation and
    // submit handlers. In the submit handler, in addition to saving whatever
    // other data you have collected from the user, you might also call
    // state_set('myprofile_needs_batch_processing', TRUE) if the user has
    // entered data which requires that batch processing will need to occur
    // later on.
    'myprofile_data_import_form' => array(
      'display_name' => st('Data import options'),
      'type' => 'form',
    ),
    // Similarly, to implement this task, your profile would define a function
    // named myprofile_settings_form() with associated validation and submit
    // handlers. This form might be used to collect and save additional
    // information from the user that your profile needs. There are no extra
    // steps required for your profile to act as an "installation wizard"; you
    // can simply define as many tasks of type 'form' as you wish to execute,
    // and the forms will be presented to the user, one after another.
    'myprofile_settings_form' => array(
      'display_name' => st('Additional options'),
      'type' => 'form',
    ),
    // This is an example of a task that performs batch operations. To
    // implement this task, your profile would define a function named
    // myprofile_batch_processing() which returns a batch API array definition
    // that the installer will use to execute your batch operations. Due to the
    // 'myprofile_needs_batch_processing' variable used here, this task will be
    // hidden and skipped unless your profile set it to TRUE in one of the
    // previous tasks.
    'myprofile_batch_processing' => array(
      'display_name' => st('Import additional data'),
      'display' => $myprofile_needs_batch_processing,
      'type' => 'batch',
      'run' => $myprofile_needs_batch_processing ? INSTALL_TASK_RUN_IF_NOT_COMPLETED : INSTALL_TASK_SKIP,
    ),
    // This is an example of a task that will not be displayed in the list that
    // the user sees. To implement this task, your profile would define a
    // function named myprofile_final_site_setup(), in which additional,
    // automated site setup operations would be performed. Since this is the
    // last task defined by your profile, you should also use this function to
    // call state_del('myprofile_needs_batch_processing') and clean up the
    // variable that was used above. If you want the user to pass to the final
    // Backdrop installation tasks uninterrupted, return no output from this
    // function. Otherwise, return themed output that the user will see (for
    // example, a confirmation page explaining that your profile's tasks are
    // complete, with a link to reload the current page and therefore pass on
    // to the final Backdrop installation tasks when the user is ready to do so).
    'myprofile_final_site_setup' => array(
    ),
  );
  return $tasks;
}

/**
 * Change the page the user is sent to by backdrop_goto().
 *
 * @param $path
 *   A Backdrop path or a full URL.
 * @param $options
 *   An associative array of additional URL options to pass to url().
 * @param $http_response_code
 *   The HTTP status code to use for the redirection. See backdrop_goto() for more
 *   information.
 */
function hook_backdrop_goto_alter(&$path, &$options, &$http_response_code) {
  // A good addition to misery module.
  $http_response_code = 500;
}

/**
 * Alter XHTML HEAD tags before they are rendered by backdrop_get_html_head().
 *
 * Elements available to be altered are only those added using
 * backdrop_add_html_head_link() or backdrop_add_html_head(). CSS and JS files
 * are handled using backdrop_add_css() and backdrop_add_js(), so the head links
 * for those files will not appear in the $head_elements array.
 *
 * @param $head_elements
 *   An array of renderable elements. Generally the values of the #attributes
 *   array will be the most likely target for changes.
 */
function hook_html_head_alter(&$head_elements) {
  foreach ($head_elements as $key => $element) {
    if (isset($element['#attributes']['rel']) && $element['#attributes']['rel'] == 'canonical') {
      // I want a custom canonical URL.
      $head_elements[$key]['#attributes']['href'] = mymodule_canonical_url();
    }
  }
}

/**
 * Alter the full list of installation tasks.
 *
 * This hook is invoked on the install profile in install_tasks().
 *
 * You can use this hook to change or replace any part of the Backdrop
 * installation process that occurs after the installation profile is selected.
 *
 * @param $tasks
 *   An array of all available installation tasks, including those provided by
 *   Backdrop core. You can modify this array to change or replace individual
 *   steps within the installation process.
 * @param $install_state
 *   An array of information about the current installation state.
 *
 * @see hook_install_tasks()
 * @see install_tasks()
 */
function hook_install_tasks_alter(&$tasks, $install_state) {
  // Replace the entire site configuration form provided by Backdrop core
  // with a custom callback function defined by this installation profile.
  $tasks['install_configure_form']['function'] = 'myprofile_install_configure_form';
}

/**
 * Alter MIME type mappings used to determine MIME type from a file extension.
 *
 * This hook is run when file_mimetype_mapping() is called. It is used to
 * allow modules to add to or modify the default mapping from
 * file_default_mimetype_mapping().
 *
 * @param $mapping
 *   An array of mimetypes correlated to the extensions that relate to them.
 *   The array has 'mimetypes' and 'extensions' elements, each of which is an
 *   array.
 *
 * @see file_default_mimetype_mapping()
 */
function hook_file_mimetype_mapping_alter(&$mapping) {
  // Add new MIME type 'backdrop/info'.
  $mapping['mimetypes']['example_info'] = 'backdrop/info';
  // Add new extension '.info' and map it to the 'backdrop/info' MIME type.
  $mapping['extensions']['info'] = 'example_info';
  // Override existing extension mapping for '.ogg' files.
  $mapping['extensions']['ogg'] = 189;
}

/**
 * Declares information about actions.
 *
 * Any module can define actions, and then call actions_execute() to make those
 * actions happen in response to events.
 *
 * An action consists of two parts:
 * - an action definition (returned by this hook)
 * - a function which performs the action (which by convention is named
 *   MODULE_description-of-function_action)
 *
 * @return
 *   An associative array of action descriptions. The keys of the array
 *   are the names of the action functions, and each corresponding value
 *   is an associative array with the following key-value pairs:
 *   - 'type': The type of object this action acts upon. Core actions have types
 *     'node', 'user', 'comment', and 'system'.
 *   - 'label': The human-readable name of the action, which should be passed
 *     through the t() function for translation.
 *   - 'callback': Optional. A function name that will execute the action if the
 *     name of the action differs from the function name.
 *   - 'file': Optional. Relative path to a file from the module's directory
 *     that contains the callback function.
 *
 * @see action_get_info()
 *
 * @ingroup actions
 */
function hook_action_info() {
  return array(
    'comment_unpublish_action' => array(
      'type' => 'comment',
      'label' => t('Unpublish comment'),
      'callback' => 'comment_unpublish_action',
    ),
  );
}

/**
 * Alters the actions declared by another module.
 *
 * Called by action_get_info() to allow modules to alter the return values from
 * implementations of hook_action_info().
 *
 * @see action_get_info()
 *
 * @ingroup actions
 */
function hook_action_info_alter(&$actions) {
  $actions['node_unpublish_action']['label'] = t('Unpublish and remove from public view.');
}

/**
 * Declare archivers to the system.
 *
 * An archiver is a class that is able to package and unpackage one or more files
 * into a single possibly compressed file.  Common examples of such files are
 * zip files and tar.gz files.  All archiver classes must implement
 * ArchiverInterface.
 *
 * Each entry should be keyed on a unique value, and specify three
 * additional keys:
 * - class: The name of the PHP class for this archiver.
 * - extensions: An array of file extensions that this archiver supports.
 * - weight: This optional key specifies the weight of this archiver.
 *   When mapping file extensions to archivers, the first archiver by
 *   weight found that supports the requested extension will be used.
 *
 * @see hook_archiver_info_alter()
 */
function hook_archiver_info() {
  return array(
    'tar' => array(
      'class' => 'ArchiverTar',
      'extensions' => array('tar', 'tar.gz', 'tar.bz2'),
    ),
  );
}

/**
 * Alter archiver information declared by other modules.
 *
 * See hook_archiver_info() for a description of archivers and the archiver
 * information structure.
 *
 * @param $info
 *   Archiver information to alter (return values from hook_archiver_info()).
 */
function hook_archiver_info_alter(&$info) {
  $info['tar']['extensions'][] = 'tgz';
}

/**
 * Alters the delivery callback used to send the result of the page callback to the browser.
 *
 * Called by backdrop_deliver_page() to allow modules to alter how the
 * page is delivered to the browser.
 *
 * This hook is intended for altering the delivery callback based on
 * information unrelated to the path of the page accessed. For example,
 * it can be used to set the delivery callback based on a HTTP request
 * header (as shown in the code sample). To specify a delivery callback
 * based on path information, use hook_menu() or hook_menu_alter().
 *
 * This hook can also be used as an API function that can be used to explicitly
 * set the delivery callback from some other function. For example, for a module
 * named MODULE:
 * @code
 * function MODULE_page_delivery_callback_alter(&$callback, $set = FALSE) {
 *   static $stored_callback;
 *   if ($set) {
 *     $stored_callback = $callback;
 *   }
 *   elseif (isset($stored_callback)) {
 *     $callback = $stored_callback;
 *   }
 * }
 * function SOMEWHERE_ELSE() {
 *   $desired_delivery_callback = 'foo';
 *   MODULE_page_delivery_callback_alter($desired_delivery_callback, TRUE);
 * }
 * @endcode
 *
 * @param $callback
 *   The name of a function.
 *
 * @see backdrop_deliver_page()
 */
function hook_page_delivery_callback_alter(&$callback) {
  // jQuery sets a HTTP_X_REQUESTED_WITH header of 'XMLHttpRequest'.
  // If a page would normally be delivered as an html page, and it is called
  // from jQuery, deliver it instead as an Ajax response.
  if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' && $callback == 'backdrop_deliver_html_page') {
    $callback = 'ajax_deliver';
  }
}

/**
 * Alters theme operation links.
 *
 * @param $theme_groups
 *   An associative array containing groups of themes.
 *
 * @see system_themes_page()
 */
function hook_system_themes_page_alter(&$theme_groups) {
  foreach ($theme_groups as $state => &$group) {
    foreach ($theme_groups[$state] as &$theme) {
      // Add a foo link to each list of theme operations.
      $theme->operations[] = array(
        'title' => t('Foo'),
        'href' => 'admin/appearance/foo',
        'query' => array('theme' => $theme->name)
      );
    }
  }
}

/**
 * Alters inbound URL requests.
 *
 * @param $path
 *   The path being constructed, which, if a path alias, has been resolved to a
 *   Backdrop path by the database, and which also may have been altered by
 *   other modules before this one.
 * @param $original_path
 *   The original path, before being checked for path aliases or altered by any
 *   modules.
 * @param $path_language
 *   The language of the path.
 *
 * @see backdrop_get_normal_path()
 */
function hook_url_inbound_alter(&$path, $original_path, $path_language) {
  // Create the path user/me/edit, which allows a user to edit their account.
  if (preg_match('|^user/me/edit(/.*)?|', $path, $matches)) {
    global $user;
    $path = 'user/' . $user->uid . '/edit' . $matches[1];
  }
}

/**
 * Alters outbound URLs.
 *
 * @param $path
 *   The outbound path to alter, not adjusted for path aliases yet. It won't be
 *   adjusted for path aliases until all modules are finished altering it, thus
 *   being consistent with hook_url_inbound_alter(), which adjusts for all path
 *   aliases before allowing modules to alter it. This may have been altered by
 *   other modules before this one.
 * @param $options
 *   A set of URL options for the URL so elements such as a fragment or a query
 *   string can be added to the URL.
 * @param $original_path
 *   The original path, before being altered by any modules.
 *
 * @see url()
 */
function hook_url_outbound_alter(&$path, &$options, $original_path) {
  // Use an external RSS feed rather than the Backdrop one.
  if ($path == 'rss.xml') {
    $path = 'http://example.com/rss.xml';
    $options['external'] = TRUE;
  }

  // Instead of pointing to user/[uid]/edit, point to user/me/edit.
  if (preg_match('|^user/([0-9]*)/edit(/.*)?|', $path, $matches)) {
    global $user;
    if ($user->uid == $matches[1]) {
      $path = 'user/me/edit' . $matches[2];
    }
  }
}

/**
 * Provide replacement values for placeholder tokens.
 *
 * This hook is invoked when someone calls token_replace(). That function first
 * scans the text for [type:token] patterns, and splits the needed tokens into
 * groups by type. Then hook_tokens() is invoked on each token-type group,
 * allowing your module to respond by providing replacement text for any of
 * the tokens in the group that your module knows how to process.
 *
 * A module implementing this hook should also implement hook_token_info() in
 * order to list its available tokens on editing screens.
 *
 * @param $type
 *   The machine-readable name of the type (group) of token being replaced, such
 *   as 'node', 'user', or another type defined by a hook_token_info()
 *   implementation.
 * @param $tokens
 *   An array of tokens to be replaced. The keys are the machine-readable token
 *   names, and the values are the raw [type:token] strings that appeared in the
 *   original text.
 * @param $data
 *   (optional) An associative array of data objects to be used when generating
 *   replacement values, as supplied in the $data parameter to token_replace().
 * @param $options
 *   (optional) An associative array of options for token replacement; see
 *   token_replace() for possible values.
 *
 * @return
 *   An associative array of replacement values, keyed by the raw [type:token]
 *   strings from the original text.
 *
 * @see hook_token_info()
 * @see hook_tokens_alter()
 */
function hook_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $url_options = array('absolute' => TRUE);
  if (isset($options['language'])) {
    $url_options['language'] = $options['language'];
    $language_code = $options['language']->langcode;
  }
  else {
    $language_code = NULL;
  }
  $sanitize = !empty($options['sanitize']);

  $replacements = array();

  if ($type == 'node' && !empty($data['node'])) {
    $node = $data['node'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        // Simple key values on the node.
        case 'nid':
          $replacements[$original] = $node->nid;
          break;

        case 'title':
          $replacements[$original] = $sanitize ? check_plain($node->title) : $node->title;
          break;

        case 'edit-url':
          $replacements[$original] = url('node/' . $node->nid . '/edit', $url_options);
          break;

        // Default values for the chained tokens handled below.
        case 'author':
          $name = ($node->uid == 0) ? config_get('system.core', 'anonymous') : $node->name;
          $replacements[$original] = $sanitize ? filter_xss($name) : $name;
          break;

        case 'created':
          $replacements[$original] = format_date($node->created, 'medium', '', NULL, $language_code);
          break;
      }
    }

    if ($author_tokens = token_find_with_prefix($tokens, 'author')) {
      $author = user_load($node->uid);
      $replacements += token_generate('user', $author_tokens, array('user' => $author), $options);
    }

    if ($created_tokens = token_find_with_prefix($tokens, 'created')) {
      $replacements += token_generate('date', $created_tokens, array('date' => $node->created), $options);
    }
  }

  return $replacements;
}

/**
 * Alter replacement values for placeholder tokens.
 *
 * @param $replacements
 *   An associative array of replacements returned by hook_tokens().
 * @param $context
 *   The context in which hook_tokens() was called. An associative array with
 *   the following keys, which have the same meaning as the corresponding
 *   parameters of hook_tokens():
 *   - 'type'
 *   - 'tokens'
 *   - 'data'
 *   - 'options'
 *
 * @see hook_tokens()
 */
function hook_tokens_alter(array &$replacements, array $context) {
  $options = $context['options'];

  if (isset($options['language'])) {
    $url_options['language'] = $options['language'];
    $language_code = $options['language']->langcode;
  }
  else {
    $language_code = NULL;
  }
  $sanitize = !empty($options['sanitize']);

  if ($context['type'] == 'node' && !empty($context['data']['node'])) {
    $node = $context['data']['node'];

    // Alter the [node:title] token, and replace it with the rendered content
    // of a field (field_title).
    if (isset($context['tokens']['title'])) {
      $title = field_view_field('node', $node, 'field_title', 'default', $language_code);
      $replacements[$context['tokens']['title']] = backdrop_render($title);
    }
  }
}

/**
 * Provide information about available placeholder tokens and token types.
 *
 * Tokens are placeholders that can be put into text by using the syntax
 * [type:token], where type is the machine-readable name of a token type, and
 * token is the machine-readable name of a token within this group. This hook
 * provides a list of types and tokens to be displayed on text editing screens,
 * so that people editing text can see what their token options are.
 *
 * The actual token replacement is done by token_replace(), which invokes
 * hook_tokens(). Your module will need to implement that hook in order to
 * generate token replacements from the tokens defined here.
 *
 * @return
 *   An associative array of available tokens and token types. The outer array
 *   has two components:
 *   - types: An associative array of token types (groups). Each token type is
 *     an associative array with the following components:
 *     - name: The translated human-readable short name of the token type.
 *     - description: A translated longer description of the token type.
 *     - needs-data: The type of data that must be provided to token_replace()
 *       in the $data argument (i.e., the key name in $data) in order for tokens
 *       of this type to be used in the $text being processed. For instance, if
 *       the token needs a node object, 'needs-data' should be 'node', and to
 *       use this token in token_replace(), the caller needs to supply a node
 *       object as $data['node']. Some token data can also be supplied
 *       indirectly; for instance, a node object in $data supplies a user object
 *       (the author of the node), allowing user tokens to be used when only
 *       a node data object is supplied.
 *   - tokens: An associative array of tokens. The outer array is keyed by the
 *     group name (the same key as in the types array). Within each group of
 *     tokens, each token item is keyed by the machine name of the token, and
 *     each token item has the following components:
 *     - name: The translated human-readable short name of the token.
 *     - description: A translated longer description of the token.
 *     - type (optional): A 'needs-data' data type supplied by this token, which
 *       should match a 'needs-data' value from another token type. For example,
 *       the node author token provides a user object, which can then be used
 *       for token replacement data in token_replace() without having to supply
 *       a separate user object.
 *     - deprecated (optional): If set to TRUE, the token will not be displayed
 *       in token listings, but will still be replaced if encountered and pass
 *       form validation by token_element_validate().
 *
 * @see hook_token_info_alter()
 * @see hook_tokens()
 */
function hook_token_info() {
  $type = array(
    'name' => t('Nodes'),
    'description' => t('Tokens related to individual nodes.'),
    'needs-data' => 'node',
  );

  // Core tokens for nodes.
  $node['nid'] = array(
    'name' => t('Node ID'),
    'description' => t('The unique ID of the node.'),
  );
  $node['title'] = array(
    'name' => t('Title'),
    'description' => t('The title of the node.'),
  );
  $node['edit-url'] = array(
    'name' => t('Edit URL'),
    'description' => t("The URL of the node's edit page."),
  );

  // Chained tokens for nodes.
  $node['created'] = array(
    'name' => t('Date created'),
    'description' => t('The date the node was posted.'),
    'type' => 'date',
  );
  $node['author'] = array(
    'name' => t('Author'),
    'description' => t('The author of the node.'),
    'type' => 'user',
  );

  return array(
    'types' => array('node' => $type),
    'tokens' => array('node' => $node),
  );
}

/**
 * Alter the metadata about available placeholder tokens and token types.
 *
 * @param $data
 *   The associative array of token definitions from hook_token_info().
 *
 * @see hook_token_info()
 */
function hook_token_info_alter(&$data) {
  // Modify description of node tokens for our site.
  $data['tokens']['node']['nid'] = array(
    'name' => t("Node ID"),
    'description' => t("The unique ID of the post."),
  );
  $data['tokens']['node']['title'] = array(
    'name' => t("Title"),
    'description' => t("The title of the post."),
  );

  // Chained tokens for nodes.
  $data['tokens']['node']['created'] = array(
    'name' => t("Date created"),
    'description' => t("The date the post was posted."),
    'type' => 'date',
  );
}

/**
 * Alter batch information before a batch is processed.
 *
 * Called by batch_process() to allow modules to alter a batch before it is
 * processed.
 *
 * @param $batch
 *   The associative array of batch information. See batch_set() for details on
 *   what this could contain.
 *
 * @see batch_set()
 * @see batch_process()
 *
 * @ingroup batch
 */
function hook_batch_alter(&$batch) {
  // Add a query string to the completion page URL.
  if (isset($batch['url_options']['query'])) {
    $batch['url_options']['query']['foo'] = 'bar';
  }
}

/**
 * Provide information on Updaters (classes that can update Backdrop).
 *
 * An Updater is a class that knows how to update various parts of the Backdrop
 * file system, for example to update modules that have newer releases, or to
 * install a new theme.
 *
 * @return
 *   An associative array of information about the updater(s) being provided.
 *   This array is keyed by a unique identifier for each updater, and the
 *   values are subarrays that can contain the following keys:
 *   - class: The name of the PHP class which implements this updater.
 *   - name: Human-readable name of this updater.
 *   - weight: Controls what order the Updater classes are consulted to decide
 *     which one should handle a given task. When an update task is being run,
 *     the system will loop through all the Updater classes defined in this
 *     registry in weight order and let each class respond to the task and
 *     decide if each Updater wants to handle the task. In general, this
 *     doesn't matter, but if you need to override an existing Updater, make
 *     sure your Updater has a lighter weight so that it comes first.
 *
 * @see backdrop_get_updaters()
 * @see hook_updater_info_alter()
 */
function hook_updater_info() {
  return array(
    'module' => array(
      'class' => 'ModuleUpdater',
      'name' => t('Update modules'),
      'weight' => 0,
    ),
    'theme' => array(
      'class' => 'ThemeUpdater',
      'name' => t('Update themes'),
      'weight' => 0,
    ),
  );
}

/**
 * Alter the Updater information array.
 *
 * An Updater is a class that knows how to update various parts of the Backdrop
 * file system, for example to update modules that have newer releases, or to
 * install a new theme.
 *
 * @param array $updaters
 *   Associative array of updaters as defined through hook_updater_info().
 *   Alter this array directly.
 *
 * @see backdrop_get_updaters()
 * @see hook_updater_info()
 */
function hook_updater_info_alter(&$updaters) {
  // Adjust weight so that the theme Updater gets a chance to handle a given
  // update task before module updaters.
  $updaters['theme']['weight'] = -1;
}

/**
 * Alter the default country list.
 *
 * @param $countries
 *   The associative array of countries keyed by ISO 3166-1 country code.
 *
 * @see country_get_list()
 * @see standard_country_list()
 */
function hook_countries_alter(&$countries) {
  // Elbonia is now independent, so add it to the country list.
  $countries['EB'] = 'Elbonia';
}

/**
 * Alter the default timezone country list.
 *
 * @param $timezone_countries
 *   The associative array of ISO 3166-1 country codes keyed by timezone.
 *
 * @see timezone_country_get_list()
 * @see standard_timezone_country_list()
 */
function hook_timezone_countries_alter(&$timezone_countries) {
  // Elbonia is now independent, so add its timezone to the list.
  $timezone_countries['Europe/Elbonia'] = 'EB';
}

/**
 * Control site status before menu dispatching.
 *
 * The hook is called after checking whether the site is offline but before
 * the current router item is retrieved and executed by
 * menu_execute_active_handler(). If the site is in offline mode,
 * $menu_site_status is set to MENU_SITE_OFFLINE.
 *
 * @param $menu_site_status
 *   Supported values are MENU_SITE_OFFLINE, MENU_ACCESS_DENIED,
 *   MENU_NOT_FOUND and MENU_SITE_ONLINE. Any other value than
 *   MENU_SITE_ONLINE will skip the default menu handling system and be passed
 *   for delivery to backdrop_deliver_page() with a NULL
 *   $default_delivery_callback.
 * @param $path
 *   Contains the system path that is going to be loaded. This is read only,
 *   use hook_url_inbound_alter() to change the path.
 */
function hook_menu_site_status_alter(&$menu_site_status, $path) {
  // Allow access to my_module/authentication even if site is in offline mode.
  if ($menu_site_status == MENU_SITE_OFFLINE && user_is_anonymous() && $path == 'my_module/authentication') {
    $menu_site_status = MENU_SITE_ONLINE;
  }
}

/**
 * Register information about FileTransfer classes provided by a module.
 *
 * The FileTransfer class allows transferring files over a specific type of
 * connection. Core provides classes for FTP and SSH. Contributed modules are
 * free to extend the FileTransfer base class to add other connection types,
 * and if these classes are registered via hook_filetransfer_info(), those
 * connection types will be available to site administrators using the Update
 * manager when they are redirected to the authorize.php script to authorize
 * the file operations.
 *
 * @return array
 *   Nested array of information about FileTransfer classes. Each key is a
 *   FileTransfer type (not human readable, used for form elements and
 *   variable names, etc), and the values are subarrays that define properties
 *   of that type. The keys in each subarray are:
 *   - 'title': Required. The human-readable name of the connection type.
 *   - 'class': Required. The name of the FileTransfer class. The constructor
 *     will always be passed the full path to the root of the site that should
 *     be used to restrict where file transfer operations can occur (the $jail)
 *     and an array of settings values returned by the settings form.
 *   - 'file': Required. The include file containing the FileTransfer class.
 *     This should be a separate .inc file, not just the .module file, so that
 *     the minimum possible code is loaded when authorize.php is running.
 *   - 'file path': Optional. The directory (relative to the Backdrop root)
 *     where the include file lives. If not defined, defaults to the base
 *     directory of the module implementing the hook.
 *   - 'weight': Optional. Integer weight used for sorting connection types on
 *     the authorize.php form.
 *
 * @see FileTransfer
 * @see authorize.php
 * @see hook_filetransfer_info_alter()
 * @see backdrop_get_filetransfer_info()
 */
function hook_filetransfer_info() {
  $info['sftp'] = array(
    'title' => t('SFTP (Secure FTP)'),
    'file' => 'sftp.filetransfer.inc',
    'class' => 'FileTransferSFTP',
    'weight' => 10,
  );
  return $info;
}

/**
 * Alter the FileTransfer class registry.
 *
 * @param array $filetransfer_info
 *   Reference to a nested array containing information about the FileTransfer
 *   class registry.
 *
 * @see hook_filetransfer_info()
 */
function hook_filetransfer_info_alter(&$filetransfer_info) {
  if (config_get('mymodule.settings', 'paranoia')) {
    // Remove the FTP option entirely.
    unset($filetransfer_info['ftp']);
    // Make sure the SSH option is listed first.
    $filetransfer_info['ssh']['weight'] = -10;
  }
}

/**
 * @} End of "addtogroup hooks".
 */

/**
 * @defgroup update_api Update versions of API functions
 * @{
 * Functions that are similar to normal API functions, but do not invoke hooks.
 *
 * These simplified versions of core API functions are provided for use by
 * update functions (hook_update_N() implementations).
 *
 * During database updates the schema of any module could be out of date. For
 * this reason, caution is needed when using any API function within an update
 * function - particularly CRUD functions, functions that depend on the schema
 * (for example by using backdrop_write_record()), and any functions that invoke
 * hooks.
 *
 * Instead, a simplified utility function should be used. If a utility version
 * of the API function you require does not already exist, then you should
 * create a new function. The new utility function should be named
 * _update_N_mymodule_my_function(). N is the schema version the function acts
 * on (the schema version is the number N from the hook_update_N()
 * implementation where this schema was introduced, or a number following the
 * same numbering scheme), and mymodule_my_function is the name of the original
 * API function including the module's name.
 *
 * Examples:
 * - _update_6000_mymodule_save(): This function performs a save operation
 *   without invoking any hooks using the 6.x schema.
 * - _update_7000_mymodule_save(): This function performs the same save
 *   operation using the 7.x schema.
 *
 * The utility function should not invoke any hooks, and should perform database
 * operations using functions from the
 * @link database Database abstraction layer, @endlink
 * like db_insert(), db_update(), db_delete(), db_query(), and so on.
 *
 * If a change to the schema necessitates a change to the utility function, a
 * new function should be created with a name based on the version of the schema
 * it acts on. See _update_7000_bar_get_types() and _update_7001_bar_get_types()
 * in the code examples that follow.
 *
 * For example, foo.install could contain:
 * @code
 * function foo_update_dependencies() {
 *   // foo_update_7010() needs to run after bar_update_7000().
 *   $dependencies['foo'][7010] = array(
 *     'bar' => 7000,
 *   );
 *
 *   // foo_update_7036() needs to run after bar_update_7001().
 *   $dependencies['foo'][7036] = array(
 *     'bar' => 7001,
 *   );
 *
 *   return $dependencies;
 * }
 *
 * function foo_update_7000() {
 *   // No updates have been run on the {bar_types} table yet, so this needs
 *   // to work with the 6.x schema.
 *   foreach (_update_6000_bar_get_types() as $type) {
 *     // Rename a variable.
 *   }
 * }
 *
 * function foo_update_7010() {
 *    // Since foo_update_7010() is going to run after bar_update_7000(), it
 *    // needs to operate on the new schema, not the old one.
 *    foreach (_update_7000_bar_get_types() as $type) {
 *      // Rename a different variable.
 *    }
 * }
 *
 * function foo_update_7036() {
 *   // This update will run after bar_update_7001().
 *   foreach (_update_7001_bar_get_types() as $type) {
 *   }
 * }
 * @endcode
 *
 * And bar.install could contain:
 * @code
 * function bar_update_7000() {
 *   // Type and bundle are confusing, so we renamed the table.
 *   db_rename_table('bar_types', 'bar_bundles');
 * }
 *
 * function bar_update_7001() {
 *   // Database table names should be singular when possible.
 *   db_rename_table('bar_bundles', 'bar_bundle');
 * }
 *
 * function _update_6000_bar_get_types() {
 *   db_query('SELECT * FROM {bar_types}')->fetchAll();
 * }
 *
 * function _update_7000_bar_get_types() {
 *   db_query('SELECT * FROM {bar_bundles'})->fetchAll();
 * }
 *
 * function _update_7001_bar_get_types() {
 *   db_query('SELECT * FROM {bar_bundle}')->fetchAll();
 * }
 * @endcode
 *
 * @see hook_update_N()
 * @see hook_update_dependencies()
 */

/**
 * @} End of "defgroup update_api".
 */
