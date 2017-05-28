<?php

/**
 * @file
 * Provide views data and handlers that aren't tied to any other module.
 *
 * @ingroup views_module_handlers
 */

/**
 * Implements hook_views_data().
 */
function views_views_data() {
  $data['views']['table']['group'] = t('Global');
  $data['views']['table']['join'] = array(
    // #global is a special flag which let's a table appear all the time.
    '#global' => array(),
  );

  $data['views']['random'] = array(
    'title' => t('Random'),
    'help' => t('Randomize the display order.'),
    'sort' => array(
      'handler' => 'views_handler_sort_random',
    ),
  );

  $data['views']['null'] = array(
    'title' => t('Null'),
    'help' => t('Allow a contextual filter value to be ignored. The query will not be altered by this contextual filter value. Can be used when contextual filter values come from the URL, and a part of the URL needs to be ignored.'),
    'argument' => array(
      'handler' => 'views_handler_argument_null',
    ),
  );

  $data['views']['nothing'] = array(
    'title' => t('Custom text'),
    'help' => t('Provide custom text or link.'),
    'field' => array(
      'handler' => 'views_handler_field_custom',
    ),
  );

  $data['views']['counter'] = array(
    'title' => t('View result counter'),
    'help' => t('Displays the actual position of the view result'),
    'field' => array(
      'handler' => 'views_handler_field_counter',
    ),
  );

  $data['views']['area'] = array(
    'title' => t('Text area'),
    'help' => t('Provide markup text for the area.'),
    'area' => array(
      'handler' => 'views_handler_area_text',
    ),
  );

  $data['views']['area_text_custom'] = array(
    'title' => t('Unfiltered text'),
    'help' => t('Add unrestricted, custom text or markup. This is similar to the custom text field.'),
    'area' => array(
      'handler' => 'views_handler_area_text_custom',
    ),
  );

  $data['views']['view'] = array(
    'title' => t('View area'),
    'help' => t('Insert a view inside an area.'),
    'area' => array(
      'handler' => 'views_handler_area_view',
    ),
  );

  $data['views']['result'] = array(
    'title' => t('Result summary'),
    'help' => t('Shows result summary, for example the items per page.'),
    'area' => array(
      'handler' => 'views_handler_area_result',
    ),
  );

  if (module_exists('contextual')) {
    $data['views']['contextual_links'] = array(
      'title' => t('Contextual Links'),
      'help' => t('Display fields in a contextual links menu.'),
      'field' => array(
        'handler' => 'views_handler_field_contextual_links',
      ),
    );
  }

  $data['views']['combine'] = array(
   'title' => t('Combine fields filter'),
    'help' => t('Combine two fields together and search by them.'),
    'filter' => array(
      'handler' => 'views_handler_filter_combine',
    ),
  );

  $data['views']['dropbutton'] = array(
    'title' => t('Dropbutton'),
    'help' => t('Display fields in a dropbutton.'),
    'field' => array(
      'handler' => 'views_handler_field_dropbutton',
      'label' => t('Operations'),
    ),
  );

  $data['views']['expression'] = array(
    'title' => t('Math expression'),
    'help' => t('Evaluates a mathematical expression and displays it.'),
    'field' => array(
      'handler' => 'views_handler_field_math',
      'float' => TRUE,
    ),
  );

  $data['views']['fields_compare'] = array(
    'title' => t('Fields comparison'),
    'help' => t('Compare database fields against eachother.'),
    'filter' => array(
      'help' => t('Use fields comparison to filter the result of the view.'),
      'handler' => 'views_handler_filter_fields_compare',
    )
  );

  return $data;
}

/**
 * Implements hook_views_plugins().
 */
function views_views_plugins() {
  $plugins = array(
    // display, style, row, argument default, argument validator and access.
    'display' => array(
      // Default settings for all display plugins.
      'default' => array(
        'title' => t('Master'),
        'help' => t('Default settings for this view.'),
        'handler' => 'views_plugin_display_default',
        'theme' => 'views_view',
        'no ui' => TRUE,
        'no remove' => TRUE,
        'js' => array('core/misc/form.js', 'core/misc/collapse.js', 'core/misc/textarea.js', 'core/misc/tabledrag.js', 'core/misc/autocomplete.js', 'core/misc/states.js'),
        'use ajax' => TRUE,
        'use pager' => TRUE,
        'use more' => TRUE,
        'accept attachments' => TRUE,
        'help topic' => 'display-default',
      ),
      'page' => array(
        'title' => t('Page'),
        'help' => t('Display the view as a page, with a URL and menu links.'),
        'handler' => 'views_plugin_display_page',
        'theme' => 'views_view',
        'uses hook menu' => TRUE,
        'contextual links locations' => array('page'),
        'use ajax' => TRUE,
        'use pager' => TRUE,
        'use more' => TRUE,
        'accept attachments' => TRUE,
        'admin' => t('Page'),
        'help topic' => 'display-page',
      ),
      'block' => array(
        'title' => t('Block'),
        'help' => t('Display the view as a block.'),
        'handler' => 'views_plugin_display_block',
        'theme' => 'views_view',
        'uses hook block' => TRUE,
        'contextual links locations' => array('block'),
        'use ajax' => TRUE,
        'use pager' => TRUE,
        'use more' => TRUE,
        'accept attachments' => TRUE,
        'admin' => t('Block'),
        'help topic' => 'display-block',
      ),
      'attachment' => array(
        'title' => t('Attachment'),
        'help' => t('Attachments added to other displays to achieve multiple views in the same view.'),
        'handler' => 'views_plugin_display_attachment',
        'theme' => 'views_view',
        'contextual links locations' => array(),
        'use ajax' => TRUE,
        'use pager' => FALSE,
        'use more' => TRUE,
        'accept attachments' => FALSE,
        'help topic' => 'display-attachment',
      ),
      'feed' => array(
        'title' => t('Feed'),
        'help' => t('Display the view as a feed, such as an RSS feed.'),
        'handler' => 'views_plugin_display_feed',
        'uses hook menu' => TRUE,
        'use ajax' => FALSE,
        'use pager' => FALSE,
        'accept attachments' => FALSE,
        'admin' => t('Feed'),
        'help topic' => 'display-feed',
      ),
      'embed' => array(
        'title' => t('Embed'),
        'help' => t('Provide a display which can be embedded using the views api.'),
        'handler' => 'views_plugin_display_embed',
        'theme' => 'views_view',
        'uses hook menu' => FALSE,
        'use ajax' => TRUE,
        'use pager' => TRUE,
        'accept attachments' => FALSE,
        'admin' => t('Embed'),
        'no ui' => !config_get('views_ui.settings', 'display_embed'),
      ),
    ),
    'display_extender' => array(
      // Default settings for all display_extender plugins.
      'default' => array(
        'title' => t('Empty display extender'),
        'help' => t('Default settings for this view.'),
        'handler' => 'views_plugin_display_extender',
        // You can force the plugin to be enabled
        'enabled' => FALSE,
        'no ui' => TRUE,
      ),
    ),
    'style' => array(
      // Default settings for all style plugins.
      'default' => array(
        'title' => t('Unformatted list'),
        'help' => t('Displays rows one after another.'),
        'handler' => 'views_plugin_style_default',
        'theme' => 'views_view_unformatted',
        'uses row plugin' => TRUE,
        'uses row class' => TRUE,
        'uses grouping' => TRUE,
        'uses options' => TRUE,
        'type' => 'normal',
        'help topic' => 'style-unformatted',
      ),
      'list' => array(
        'title' => t('HTML list'),
        'help' => t('Displays rows as an HTML list.'),
        'handler' => 'views_plugin_style_list',
        'theme' => 'views_view_list',
        'uses row plugin' => TRUE,
        'uses row class' => TRUE,
        'uses options' => TRUE,
        'type' => 'normal',
        'help topic' => 'style-list',
      ),
      'grid' => array(
        'title' => t('Grid'),
        'help' => t('Displays rows in a grid.'),
        'handler' => 'views_plugin_style_grid',
        'theme' => 'views_view_grid',
        'uses fields' => FALSE,
        'uses row plugin' => TRUE,
        'uses row class' => TRUE,
        'uses options' => TRUE,
        'type' => 'normal',
        'help topic' => 'style-grid',
      ),
      'table' => array(
        'title' => t('Table'),
        'help' => t('Displays rows in a table.'),
        'handler' => 'views_plugin_style_table',
        'theme' => 'views_view_table',
        'uses row plugin' => FALSE,
        'uses row class' => TRUE,
        'uses fields' => TRUE,
        'uses options' => TRUE,
        'type' => 'normal',
        'help topic' => 'style-table',
      ),
      'default_summary' => array(
        'title' => t('List'),
        'help' => t('Displays the default summary as a list.'),
        'handler' => 'views_plugin_style_summary',
        'theme' => 'views_view_summary',
        'type' => 'summary', // only shows up as a summary style
        'uses options' => TRUE,
        'help topic' => 'style-summary',
      ),
      'unformatted_summary' => array(
        'title' => t('Unformatted'),
        'help' => t('Displays the summary unformatted, with option for one after another or inline.'),
        'handler' => 'views_plugin_style_summary_unformatted',
        'theme' => 'views_view_summary_unformatted',
        'type' => 'summary', // only shows up as a summary style
        'uses options' => TRUE,
        'help topic' => 'style-summary-unformatted',
      ),
      'rss' => array(
        'title' => t('RSS Feed'),
        'help' => t('Generates an RSS feed from a view.'),
        'handler' => 'views_plugin_style_rss',
        'theme' => 'views_view_rss',
        'uses row plugin' => TRUE,
        'uses options' => TRUE,
        'type' => 'feed',
        'help topic' => 'style-rss',
      ),
    ),
    'row' => array(
      'fields' => array(
        'title' => t('Fields'),
        'help' => t('Displays the fields with an optional template.'),
        'handler' => 'views_plugin_row_fields',
        'theme' => 'views_view_fields',
        'uses fields' => TRUE,
        'uses options' => TRUE,
        'type' => 'normal',
        'help topic' => 'style-row-fields',
      ),
      'rss_fields' => array(
        'title' => t('Fields'),
        'help' => t('Display fields as RSS items.'),
        'handler' => 'views_plugin_row_rss_fields',
        'theme' => 'views_view_row_rss',
        'uses fields' => TRUE,
        'uses options' => TRUE,
        'type' => 'feed',
        'help topic' => 'style-row-fields',
      ),
    ),
    'argument default' => array(
      'parent' => array(
        'no ui' => TRUE,
        'handler' => 'views_plugin_argument_default',
        'parent' => '',
      ),
      'fixed' => array(
        'title' => t('Fixed value'),
        'handler' => 'views_plugin_argument_default_fixed',
      ),
      'php' => array(
        'title' => t('PHP Code'),
        'handler' => 'views_plugin_argument_default_php',
      ),
      'raw' => array(
        'title' => t('Raw value from URL'),
        'handler' => 'views_plugin_argument_default_raw',
      ),
    ),
    'argument validator' => array(
      'php' => array(
        'title' => t('PHP Code'),
        'handler' => 'views_plugin_argument_validate_php',
      ),
      'numeric' => array(
        'title' => t('Numeric'),
        'handler' => 'views_plugin_argument_validate_numeric',
      ),
    ),
    'access' => array(
      'none' => array(
        'title' => t('None'),
        'help' => t('Will be available to all users.'),
        'handler' => 'views_plugin_access_none',
        'help topic' => 'access-none',
      ),
      'role' => array(
        'title' => t('Role'),
        'help' => t('Access will be granted to users with any of the specified roles.'),
        'handler' => 'views_plugin_access_role',
        'uses options' => TRUE,
        'help topic' => 'access-role',
      ),
      'perm' => array(
        'title' => t('Permission'),
        'help' => t('Access will be granted to users with the specified permission string.'),
        'handler' => 'views_plugin_access_perm',
        'uses options' => TRUE,
        'help topic' => 'access-perm',
      ),
    ),
    'query' => array(
      'parent' => array(
        'no ui' => TRUE,
        'handler' => 'views_plugin_query',
        'parent' => '',
      ),
      'views_query' => array(
        'title' => t('SQL Query'),
        'help' => t('Query will be generated and run using the Backdrop database API.'),
        'handler' => 'views_plugin_query_default'
      ),
    ),
    'cache' => array(
      'parent' => array(
        'no ui' => TRUE,
        'handler' => 'views_plugin_cache',
        'parent' => '',
      ),
      'none' => array(
        'title' => t('None'),
        'help' => t('No caching of Views data.'),
        'handler' => 'views_plugin_cache_none',
        'help topic' => 'cache-none',
      ),
      'time' => array(
        'title' => t('Time-based'),
        'help' => t('Simple time-based caching of data.'),
        'handler' => 'views_plugin_cache_time',
        'uses options' => TRUE,
        'help topic' => 'cache-time',
      ),
    ),
    'exposed_form' => array(
      'parent' => array(
        'no ui' => TRUE,
        'handler' => 'views_plugin_exposed_form',
        'parent' => '',
      ),
      'basic' => array(
        'title' => t('Basic'),
        'help' => t('Basic exposed form'),
        'handler' => 'views_plugin_exposed_form_basic',
        'uses options' => TRUE,
        'help topic' => 'exposed-form-basic',
      ),
      'input_required' => array(
        'title' => t('Input required'),
        'help' => t('An exposed form that only renders a view if the form contains user input.'),
        'handler' => 'views_plugin_exposed_form_input_required',
        'uses options' => TRUE,
        'help topic' => 'exposed-form-input-required',
      ),
    ),
    'pager' => array(
      'parent' => array(
        'no ui' => TRUE,
        'handler' => 'views_plugin_pager',
        'parent' => '',
      ),
      'none' => array(
        'title' => t('Display all items'),
        'help' => t("Display all items that this view might find"),
        'handler' => 'views_plugin_pager_none',
        'help topic' => 'pager-none',
        'uses options' => TRUE,
        'type' => 'basic',
      ),
      'some' => array(
        'title' => t('Display a specified number of items'),
        'help' => t('Display a limited number items that this view might find.'),
        'handler' => 'views_plugin_pager_some',
        'help topic' => 'pager-some',
        'uses options' => TRUE,
        'type' => 'basic',
      ),
      'full' => array(
        'title' => t('Paged output, full pager'),
        'short title' => t('Full'),
        'help' => t('Paged output, full Backdrop style'),
        'handler' => 'views_plugin_pager_full',
        'help topic' => 'pager-full',
        'uses options' => TRUE,
      ),
      'mini' => array(
        'title' => t('Paged output, mini pager'),
        'short title' => t('Mini'),
        'help' => t('Use the mini pager output.'),
        'handler' => 'views_plugin_pager_mini',
        'help topic' => 'pager-mini',
        'uses options' => TRUE,
        'parent' => 'full',
      ),
    ),
  );

  $plugins['style']['jump_menu_summary'] = array(
    'title' => t('Jump menu'),
    'help' => t('Puts all of the results into a select box and allows the user to go to a different page based upon the results.'),
    'handler' => 'views_plugin_style_summary_jump_menu',
    'theme' => 'views_view_summary_jump_menu',
    'type' => 'summary', // only shows up as a summary style
    'uses options' => TRUE,
    'help topic' => 'style-summary-jump-menu',
  );
  $plugins['style']['jump_menu'] = array(
    'title' => t('Jump menu'),
    'help' => t('Puts all of the results into a select box and allows the user to go to a different page based upon the results.'),
    'handler' => 'views_plugin_style_jump_menu',
    'theme' => 'views_view_jump_menu',
    'uses row plugin' => TRUE,
    'uses fields' => TRUE,
    'uses options' => TRUE,
    'type' => 'normal',
    'help topic' => 'style-jump-menu',
  );

  return $plugins;
}
