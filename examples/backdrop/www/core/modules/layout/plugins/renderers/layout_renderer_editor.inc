<?php

/**
 * @file
 * Class file to control the main Layout editor.
 */

class LayoutRendererEditor extends LayoutRendererStandard {
  /**
   * {@inheritdoc}
   */
  function __construct(Layout $layout, array $renderer_plugin) {
    parent::__construct($layout, $renderer_plugin);

    // Set the page title region if not already.
    if (!isset($this->layout_info['regions']['title'])) {
      $this->layout_info['regions']['title'] = t('Page title');
    }
    $this->admin = TRUE;

  }

  /**
   * {@inheritdoc}
   */
  function addMeta() {
    parent::addMeta();
    backdrop_add_library('system', 'ui.sortable');
    backdrop_add_js(backdrop_get_path('module', 'layout') . '/js/layout.admin.js');
    backdrop_add_css(backdrop_get_path('module', 'layout') . '/css/layout.admin.css');
  }

  /**
   * {@inheritdoc}
   */
  function render() {
    $this->addMeta();

    $output = '<div id="layout-edit-main">';
    $output .= $this->renderLayout();
    $output .= '</div>';

    return $output;
  }

  /**
   * {@inheritdoc}
   */
  function renderRegion($region_id, $blocks) {
    $render_title_region = TRUE;
    $all_layout_blocks = $this->layout->content;
    foreach ($all_layout_blocks as $block) {
      if ($block->module == 'system' && $block->delta == 'page_components' && ($block->childDelta == 'title' || $block->childDelta =='title_combo')) {
        $render_title_region = FALSE;
        break;
      }
    }

    $output = '';
    if ($region_id == 'title') {
      if ($render_title_region) {
        return $this->renderTitleRegion($region_id);
      }
      else {
        $output = '<div id="layout-title-region-empty"></div>';
      }
    }
    else {
      $content = implode('', $blocks);
      $region_buttons = $this->getRegionLinks($region_id);

      $output = '<div class="layout-editor-region" id="layout-editor-region-' . $region_id . '" data-region-name="' . $region_id . '">';
      $output .= '<div class="layout-editor-region-title clearfix">';
      $output .= '<h2 class="label">' . check_plain($this->layout_info['regions'][$region_id]) . '</h2>';
      $output .= $region_buttons;
      $output .= '</div>';
      $output .= '<div class="layout-editor-region-content">' . $content . '</div>';
      $output .= '</div>';
    }

    return $output;
  }

  /**
   * Render the Page Title region in the Layout Editor.
   */
  function renderTitleRegion($region_id) {
    $region_buttons = $this->getRegionLinks($region_id);
    $description = layout_get_title_description($this->layout);

    $output  = '<div class="layout-editor-block" id="layout-editor-title" data-region-name="' . $region_id . '">';
    $output .= '  <div class="layout-editor-block-title clearfix">';
    $output .= '    <span class="text">' . check_plain($this->layout_info['regions'][$region_id]) . '</span>';
    $output .= '    <span class="description">' . $description . '</span>';
    $output .= '    <span class="buttons">' . $region_buttons . '</span>';
    $output .= '  </div>';
    $output .= '</div>';

    return $output;
  }

  /**
   * {@inheritdoc}
   */
  function renderBlock($block) {
    $buttons = $this->getBlockLinks($block);
    $content = $block->getAdminPreview();

    $output = '<div class="layout-editor-block clearfix" id="layout-editor-block-' . $block->uuid . '" data-block-id="' . $block->uuid . '">';
    $output .= '<div class="layout-editor-block-title clearfix">';
    $output .= '<span class="handle"></span><span class="text">' . $block->getAdminTitle() . '</span>';
    if ($buttons) {
      $output .= '<span class="buttons">' . $buttons . '</span>';
    }
    $output .= '</div>'; // layout-block-title
    $output .= '<div class="layout-editor-block-content">' . render($content) . '</div>';
    $output .= '</div>'; // layout-block

    return $output;
  }


  /**
   * {@inheritdoc}
   */
  function renderBlocks() {
    $this->rendered['blocks'] = array();
    foreach ($this->prepared['blocks'] as $uuid => $block) {
      $this->rendered['blocks'][$uuid] = $this->renderBlock($block);
    }
    return $this->rendered['blocks'];
  }

  /**
   * Short-cut to generate a URL path to a particular action.
   *
   * @param string $command
   *   The command to which the URL should point, usually "configure-block",
   *   "remove-block", or "add-block".
   * @param ...
   *   Any additional parameters to be tacked on the end of the URL.
   *
   * @return string
   *   A Backdrop menu path.
   */
  function getUrl($command) {
    $args = func_get_args();
    $command = array_shift($args);
    $url = 'admin/structure/layouts/manage/' . $this->layout->name . '/' . $command . '/' . $this->plugin['name'];
    if ($args) {
      $url .= '/' . implode('/', $args);
    }
    return $url;
  }

  /**
   * Render the links to display when editing a region.
   */
  protected function getRegionLinks($region_id) {
    $links = array();
    if ($region_id == 'title') {
      $links['title'] = array(
        'title' => t('Configure'),
        'href' => $this->getUrl('edit-title', $region_id),
        'attributes' => array(
          'class' => array('use-ajax'),
          'data-dialog' => TRUE,
          'data-dialog-options' => json_encode(array('dialogClass' => 'layout-dialog')),
        ),
      );
    }
    else {
      $links['add'] = array(
        'title' => t('Add block'),
        'href' => $this->getUrl('add-block', $region_id),
        'attributes' => array(
          'class' => array('use-ajax'),
          'data-dialog' => TRUE,
          'data-dialog-options' => json_encode(array('dialogClass' => 'layout-dialog')),
        ),
      );
      $links['configure'] = array(
        'title' => t('Configure region'),
        'href' => $this->getUrl('configure-region', $region_id),
        'attributes' => array(
          'class' => array('use-ajax'),
          'data-dialog' => TRUE,
          'data-dialog-options' => json_encode(array('dialogClass' => 'layout-dialog')),
        ),
      );
    }

    $dropbutton = array(
      '#type' => 'dropbutton',
      '#links' => $links,
    );

    return backdrop_render($dropbutton);
  }

  /**
   * Render the links to display when editing a block.
   */
  protected function getBlockLinks($block) {
    $links = array();
    $links['configure'] = array(
      'title' => t('Configure'),
      'href' => $this->getUrl('configure-block', $block->uuid),
      'attributes' => array(
        'class' => array('use-ajax'),
        'data-dialog' => TRUE,
        'data-dialog-options' => json_encode(array('dialogClass' => 'layout-dialog')),
      ),
    );

    if ($block->module == 'system' && $block->delta == 'page_components' && ($block->childDelta == 'title' || $block->childDelta =='title_combo')) {
      $links['title'] = array(
        'title' => t('Page title settings'),
        'href' => $this->getUrl('edit-title', 'title'),
        'attributes' => array(
          'class' => array('use-ajax'),
          'data-dialog' => TRUE,
          'data-dialog-options' => json_encode(array('dialogClass' => 'layout-dialog')),
        ),
      );
    }

    $links['remove'] = array(
      'title' => t('Remove'),
      'href' => $this->getUrl('remove-block', $block->uuid),
      'query' => array('token' => backdrop_get_token('layout-' . $this->layout->name)),
      'attributes' => array(
        'class' => array('remove-block', 'use-ajax'),
      ),
    );

    $dropbutton = array(
      '#type' => 'dropbutton',
      '#links' => $links,
    );

    return backdrop_render($dropbutton);
  }
}
