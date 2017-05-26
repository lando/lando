<?php

/**
 * The standard render for a Layout display object.
 *
 * Given a fully-loaded Layout object, this class will turn its combination of
 * layout, blocks, and styles into HTML, invoking caching appropriately along
 * the way. Interacting with the renderer externally is very simple - just pass
 * it the display object and call the render() method:
 *
 * @code
 *   // Given that $layout is a fully loaded Layout object.
 *   $renderer = layout_get_renderer('standard', $layout)
 *   $html_output = $renderer->render();
 * @endcode
 */
class LayoutRendererStandard {
  /**
   * The fully-loaded Layout object that is to be rendered.
   *
   * @var Layout
   */
  var $layout;

  /**
   * The information from hook_layout_info() for the layout being rendered.
   *
   * This array is stored here for easy access, as it contains most importantly
   * the list of regions that can be configured.
   *
   * @var array
   */
  var $layout_info;

  /**
   * A multilevel array of rendered data. The first level of the array
   * indicates the type of rendered data, typically with up to three keys:
   * 'layout', 'regions', and 'blocks'. The relevant rendered data is stored as
   * the value for each of these keys as it is generated:
   *  - 'blocks' are an associative array of rendered output, keyed on UUID.
   *  - 'regions' are an associative array of rendered output, keyed on region
   *    name.
   *  - 'layout' is the whole of the rendered output.
   *
   * @var array
   */
  var $rendered = array();

  /**
   * A multilevel array of data prepared for rendering. The first level of the
   * array indicates the type of prepared data. The standard renderer populates
   * and uses two top-level keys, 'blocks' and 'regions':
   *  - 'blocks' are an associative array of block objects to be rendered, keyed
   *    on UUID and sorted into proper rendering order.
   *  - 'regions' are an associative array of regions, keyed on region name,
   *    each of which is itself an indexed array of UUIDs in the order in
   *    which those blocks appear in that region.
   *
   * @var array
   */
  var $prepared = array();

  /**
   * Boolean state variable, indicating whether or not the prepare() method has
   * been run.
   *
   * This state is checked in LayoutRendererStandard::render_layout() to
   * determine whether the prepare method should be automatically triggered.
   *
   * @var bool
   */
  var $prep_run = FALSE;

  /**
   * The plugin definition that defines this renderer handler.
   *
   * @var array
   */
  var $plugin;

  /**
   * TRUE if this renderer is rendering in administrative mode
   * which will allow layouts to have extra functionality.
   *
   * @var bool
   */
  var $admin = FALSE;

  /**
   * Where to add standard meta information. There are three possibilities:
   * - standard: Put the meta information in the normal location. Default.
   * - inline: Put the meta information directly inline. This will
   *   not work for javascript.
   *
   * @var string
   */
  var $meta_location = 'standard';

  /**
   * Stores the menu response if the main content is not found or access denied.
   *
   * This will either be NULL, MENU_ACCESS_DENIED, or MENU_NOT_FOUND.
   *
   * @var int
   */
  var $menu_response;

  /**
   * Include rendered HTML prior to the layout.
   *
   * @var string
   */
  var $prefix = '';

  /**
   * Include rendered HTML after the layout.
   *
   * @var string
   */
  var $suffix = '';

  /**
   * Construct the object that will be used to render the layout.
   *
   * @param Layout $layout
   *   The layout object to be rendered.
   * @param array $plugin
   *   The definition of the renderer plugin.
   *
   * @throws LayoutMissingException
   */
  function __construct(Layout $layout, array $renderer_plugin) {
    $this->plugin = $renderer_plugin;
    $layout_info = layout_get_layout_template_info($layout->layout_template);
    $this->layout = &$layout;

    if (empty($layout_info)) {
      throw new LayoutMissingException(t('The layout plugin "@plugin" could not been found to display the "@title" layout.', array('@plugin' => $layout->layout_template, '@title' => $layout->title)));
    }
    else {
      $this->layout_info = $layout_info;
    }
  }

  /**
   * Prepare the attached display for rendering.
   *
   * This is the outermost prepare method. It calls several sub-methods as part
   * of the overall preparation process. This compartmentalization is intended
   * to ease the task of modifying renderer behavior in child classes.
   *
   * If you override this method, it is important that you either call this
   * method via parent::prepare(), or manually set $this->prep_run = TRUE.
   */
  function prepare() {
    $this->prepareBlocks($this->layout->content);
    $this->prepareRegions($this->layout->positions, $this->layout->settings);
    $this->prep_run = TRUE;
  }

  /**
   * Prepare the list of blocks to be rendered, accounting for visibility/access
   * settings and rendering order.
   *
   * This method represents the standard approach for determining the list of
   * blocks to be rendered that is compatible with all parts of the Layout
   * architecture. It first applies visibility & access checks, then sort blocks
   * into their proper rendering order, and returns the result as an array.
   *
   * Inheriting classes should override this method if that renderer needs to
   * regularly make additions to the set of blocks that will be rendered.
   *
   * @param array $blocks
   *  An associative array of block data (Block objects), keyed by UUID.
   * @return array
   *  An associative array of blocks to be rendered, keyed on UUID and sorted
   *  into proper rendering order.
   */
  function prepareBlocks(array $blocks) {
    // Use local variables as writing to them is very slightly faster
    $first = $normal = $last = array();

    // Prepare the list of blocks to be rendered
    foreach ($blocks as $uuid => $block) {

      // Check access on each block.
      if (empty($this->admin)) {
        // Assign contexts to each block.
        $has_contexts = TRUE;
        $required_contexts = $block->getRequiredContexts();
        if ($required_contexts) {
          $has_contexts = $this->layout->hasContexts($required_contexts);
          if ($has_contexts) {
            $block->setContexts($this->layout->getContexts());
          }
        }
        elseif ($block->conditions) {
          $block->setContexts($this->layout->getContexts());
        }

        // Then check access on the block.
        if (!$has_contexts || !$block->checkAccess()) {
          continue;
        }
      }

      $block_info = layout_get_block_info($block->module, $block->delta);

      // If this block wants to render last, add it to the $last array. We allow
      // this because some blocks need to be rendered after other blocks,
      // primarily so they can do things like the leftovers of forms.
      if (!empty($block_info['render last'])) {
        $last[$uuid] = $block;
      }
      // If it wants to render first, add it to the $first array. This is used
      // by blocks that need to do some processing before other blocks are
      // rendered.
      else if (!empty($block_info['render first'])) {
        $first[$uuid] = $block;
      }
      // Otherwise, render it in the normal order.
      else {
        $normal[$uuid] = $block;
      }
    }

    $this->prepared['blocks'] = $first + $normal + $last;
    return $this->prepared['blocks'];
  }

  /**
   * Prepare the list of regions to be rendered.
   *
   * This method is primarily about properly initializing the style plugin that
   * will be used to render the region. This is crucial as regions cannot be
   * rendered without a style plugin (in keeping with Layout's philosophy of
   * hardcoding none of its output), but for most regions no style has been
   * explicitly set. The logic here is what accommodates that situation:
   *  - If a region has had its style explicitly set, then we fetch that plugin
   *    and continue.
   *  - If the region has no explicit style, but a style was set at the layout
   *    level, then inherit the style from the layout.
   *  - If neither the region nor the layout have explicitly set styles, then
   *    fall back to the hardcoded 'default' style, a very minimal style.
   *
   * The other important task accomplished by this method is ensuring that even
   * regions without any blocks are still properly prepared for the rendering
   * process. This is essential because the way layouts are loaded, results only
   * in a list of regions that contain blocks - not necessarily all the regions
   * defined by the layout plugin, which can only be determined by asking the
   * plugin at runtime. This method consults that retrieved list of regions and
   * prepares all of those, ensuring none are inadvertently skipped.
   *
   * @param array $region_block_list
   *   An associative array of block IDs, keyed on the region to which those IDs
   *   are assigned.
   * @param array $settings
   *   All known region style settings, including both the top-level layout's
   *   settings (if any) and all region-specific settings (if any).
   * @return array
   *   An array of regions prepared for rendering.
   */
  function prepareRegions(array $region_block_list, array $settings) {
    // Initialize defaults to be used for regions without their own explicit
    // settings. Use display settings if they exist, else hardcoded defaults.
    $default = array(
      'style' => !empty($settings['style']) ? $settings['style'] : 'default',
      'style settings' => isset($settings['style_settings']['default']) ? $settings['style_settings']['default'] : array(),
    );
    $regions = array();
    if (empty($settings)) {
      // No region settings exist, init all with the defaults.
      foreach ($this->layout_info['regions'] as $region_id => $title) {
        // Ensure this region has at least an empty block array.
        $blocks = array();
        if (isset($region_block_list[$region_id])) {
          $blocks = $region_block_list[$region_id];
        }

        $regions[$region_id] = $default;
        $regions[$region_id]['uuids'] = $blocks;
      }
    }
    else {
      // Some settings exist; iterate through each region and set individually.
      foreach ($this->layout_info['regions'] as $region_id => $title) {
        // Ensure this region has at least an empty blocks array.
        $blocks = !empty($region_block_list[$region_id]) ? $region_block_list[$region_id] : array();

        if (empty($settings[$region_id]['style']) || $settings[$region_id]['style'] == -1) {
          $regions[$region_id] = $default;
        }
        else {
          $regions[$region_id]['style'] = $settings[$region_id]['style'];
        }

        $regions[$region_id]['style settings'] = isset($settings[$region_id]) ? $settings[$region_id] : array();
        $regions[$region_id]['uuids'] = $blocks;
      }
    }

    $this->prepared['regions'] = $regions;
    return $this->prepared['regions'];
  }

  /**
   * Render the entire layout and attach meta data.
   *
   * @return string
   *  Themed & rendered HTML output.
   */
  function render() {
    $this->addMeta();
    return $this->renderLayout();
  }

  /**
   * Perform display/layout-level render operations.
   *
   * This method triggers all the inner block/region rendering processes, passes
   * that to the layout plugin's theme callback, and returns the rendered HTML.
   *
   * If display-level caching is enabled and that cache is warm, this method
   * will not be called.
   *
   * @return string
   *   The HTML string representing the entire rendered, themed layout.
   */
  function renderLayout() {
    if (empty($this->prep_run)) {
      $this->prepare();
    }
    $this->renderBlocks();

    // Return 404 or 403 if set by the main content block.
    if ($this->menu_response) {
      return $this->menu_response;
    }

    $this->renderRegions();

    module_load_include('inc', 'layout', 'layout.theme');
    if (empty($this->layout_info['template'])) {
      $theme = 'layout__' . $this->layout->layout_template;
    }
    else {
      $theme = str_replace('-', '_', $this->layout_info['template']);
    }
    $this->rendered['layout'] = theme($theme, array('content' => $this->rendered['regions'], 'settings' => $this->layout->settings, 'layout' => $this->layout, 'layout_info' => $this->layout_info, 'renderer' => $this, 'admin' => $this->admin));
    return $this->prefix . $this->rendered['layout'] . $this->suffix;
  }

  /**
   * Attach out-of-band page metadata (e.g., CSS and JS).
   *
   * This must be done before render, because layouts-within-layouts must have
   * their CSS added in the right order: inner content before outer content.
   */
  function addMeta() {
    if (!empty($this->layout_info['stylesheets'])) {
      foreach ($this->layout_info['stylesheets'] as $media => $file_names) {
        foreach ($file_names as $file_name) {
          $this->addCss($this->layout_info['path'] . '/' . $file_name, array('media' => $media));
        }
      }
    }
    if (!empty($this->layout_info['libraries'])) {
      foreach ($this->layout_info['libraries'] as $library) {
        $this->addLibrary('layout', $library);
      }
    }
  }

  /**
   * Add CSS information to the renderer.
   *
   * To facilitate previews over Views, CSS can now be added in a manner
   * that does not necessarily mean just using backdrop_add_css. Therefore,
   * during the layout rendering process, this method can be used to add
   * css and make certain that ti gets to the proper location.
   *
   * The arguments should exactly match backdrop_add_css().
   *
   * @see backdrop_add_css
   */
  function addCss($filename, $options = array()) {
    switch ($this->meta_location) {
      case 'standard':
        backdrop_add_css($filename, $options);
        break;
      case 'inline':
        $url = base_path() . $filename;
        $this->prefix .= '<link rel="stylesheet" href="' . $url . '" />' . "\n";
        break;
    }
  }

  /**
   * Add Library information to the renderer.
   */
  function addLibrary($module, $name) {
    backdrop_add_library($module, $name);
  }

  /**
   * Render all prepared blocks, first by dispatching to their plugin's render
   * callback, then handing that output off to the block's style plugin.
   *
   * @return array
   *   The array of rendered blocks, keyed on block UUID.
   */
  function renderBlocks() {
    $this->rendered['blocks'] = array();

    // Do a pass through all blocks to check for the main system content block.
    // This serves a dual-purpose of rendering the system block first, allowing
    // modifications to other blocks (such as breadcrumb), and it prevents
    // rendering of all other blocks in the event of a 404 or 403 response from
    // the system menu handler.
    foreach ($this->prepared['blocks'] as $uuid => $block) {
      if ($block->module === 'system' && $block->delta === 'main') {
        $system_content = $this->renderBlock($block);
        $response_code = (int) $system_content;
        // If a 404 or 403 skip all rendering and return nothing, as the error
        // page will generate its own replacement content.
        if ($response_code === MENU_NOT_FOUND || $response_code === MENU_ACCESS_DENIED) {
          $this->menu_response = $response_code;
          return array();
        }
      }
    }

    // Render all other blocks.
    foreach ($this->prepared['blocks'] as $uuid => $block) {
      if ($block->module === 'system' && $block->delta === 'main') {
        $this->rendered['blocks'][$uuid] = $system_content;
      }
      elseif ($content = $this->renderBlock($block)) {
        $this->rendered['blocks'][$uuid] = $content;
      }
    }

    return $this->rendered['blocks'];
  }

  /**
   * Render a block using its designated style.
   *
   * This method also manages 'title block' functionality, where the title from
   * an individual block can be bubbled up to take over the title for the entire
   * display.
   *
   * @param Block $block
   *   The block to be rendered.
   *
   * @return string
   *   The rendered block as HTML.
   */
  function renderBlock($block) {
    if ($this->layout->settings['title_display'] === LAYOUT_TITLE_BLOCK) {
      if ($block->uuid === $this->layout->settings['title_block']) {
        $this->layout->settings['title'] = $block->getTitle();
      }
    }

    $output = '';
    if ($content = $block->getContent()) {
      $style = layout_get_style_info($block->style->plugin);

      // Ensure block content is a renderable array for contextual links.
      if (is_string($content)) {
        $content = array(
          '#markup' => $content,
        );
      }
      // Add the contextual links.
      if (!($block->module === 'system' && $block->delta === 'main')) {
        $content['#contextual_links']['layout'] = array('admin/structure/layouts/manage/' . $this->layout->name . '/modal', array($block->uuid));
      }

      $title = '';
      if ($block->settings['title_display'] !== LAYOUT_TITLE_NONE) {
        $title = $block->getTitle();
      }

      // Assemble a structured content array.
      $content = (object) array(
        'title' => $title,
        'content' => $content,
      );

      if (isset($style) && isset($style['block theme'])) {
        $output = theme($style['block theme'] . '__' . $block->module . '__' . strtr($block->delta, '-', '_'), array('content' => $content, 'layout' => $this->layout, 'block' => $block, 'style' => $style, 'settings' => $block->style->settings));
      }
      else {
        // Fallback.
        $output = theme('block', array('content' => $content, 'layout' => $this->layout, 'block' => $block));
      }
    }
    return $output;
  }

  /**
   * Render all prepared regions, placing already-rendered blocks into their
   * appropriate positions therein.
   *
   * @return array
   *   An array of rendered layout regions, keyed on the region name.
   */
  function renderRegions() {
    $this->rendered['regions'] = array();

    // Loop through all layout regions, put all blocks that belong to the
    // current region in an array, then render the region. Primarily this
    // ensures that the blocks are arranged in the proper order.
    foreach ($this->prepared['regions'] as $region_id => $conf) {
      $region_blocks = array();
      foreach ($conf['uuids'] as $uuid) {
        // Only include blocks for region rendering if they had some output.
        if (!empty($this->rendered['blocks'][$uuid])) {
          $region_blocks[$uuid] = $this->rendered['blocks'][$uuid];
        }
      }
      $this->rendered['regions'][$region_id] = $this->renderRegion($region_id, $region_blocks);
    }

    return $this->rendered['regions'];
  }

  /**
   * Render a single layout region.
   *
   * Primarily just a passthrough to the layout region rendering callback
   * specified by the style plugin that is attached to the current layout
   * region.
   *
   * @param $region_id
   *   The ID of the layout region being rendered.
   * @param $blocks
   *   An array of blocks that are assigned to the region that's being rendered.
   *
   * @return string
   *   The rendered, HTML string output of the passed-in region.
   */
  function renderRegion($region_id, $blocks) {
    $style_settings = $this->prepared['regions'][$region_id]['style settings'];
    $tag = isset($style_settings['element']) ? $style_settings['element'] : '';
    $classes = array();
    if (isset($style_settings['classes'])) {
      $classes =  explode(' ', $style_settings['classes']);
    }

    return theme('layout_region_inner', array('blocks' => $blocks, 'tag' => $tag, 'classes' => $classes));
  }

  /**
   * Ensure that the page content block is included in the default region.
   *
   * This method is used specifically when the "default" layout is used,
   * to make sure that the current page content is rendered in the default
   * region of the fallback layout; thus ensuring the UI of the site remains
   * usable.
   */
  function ensurePageContentBlock() {
    $page_content_uuid = NULL;
    $default_region = $this->layout_info['default region'];

    // Check that the page content block exists in the layout.
    foreach ($this->layout->content as $uuid => $block) {
      if ($block->module === 'system' && $block->delta === 'main') {
        $page_content_uuid = $uuid;
      }
    }

    // If no page content block found at all, create one on the fly.
    if (!$page_content_uuid) {
      $block = layout_create_handler('block', 'system:main');
      $block->uuid = 'default';
      $this->layout->content['default'] = $block;
      $page_content_uuid = $block->uuid;
    }

    // Add the page content block to the default region in the first position.
    if (!isset($this->layout->positions[$default_region])) {
      $this->layout->positions[$default_region] = array();
    }
    if (!in_array($page_content_uuid, $this->layout->positions[$default_region])) {
      array_unshift($this->layout->positions[$default_region], $page_content_uuid);
    }
  }
}
