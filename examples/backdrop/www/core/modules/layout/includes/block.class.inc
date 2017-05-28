<?php
/**
 * @file
 * A class that wraps around a block to store settings information.
 */
class Block extends LayoutHandler {

  /**
   * The module that provides this block.
   *
   * @var string
   */
  var $module;

  /**
   * The key for this block within the module.
   *
   * @var string
   */
  var $delta;

  /**
   * If this block has children, the sub-block identifier.
   *
   * @var string|NULL
   */
  var $childDelta;

  /**
   * The identifier for this instance of this block.
   *
   * @var string
   */
  var $uuid;

  /**
   * The current style for this block.
   *
   * @var LayoutStyle
   */
  var $style;

  /**
   * An array of all access rules (of type LayoutAccess), keyed by ID.
   *
   * @var LayoutAccess[]
   */
  var $conditions = array();

  /**
   * An array of LayoutContext instances used by this block.
   *
   * @var LayoutContext[]
   */
  var $contexts = array();

  /**
   * Create a new Block object.
   *
   * @param string $plugin_name
   *   The Layout plugin name. In the case of a block, this is a key identifying
   *   the block module, delta, and (if applicable) child delta, separated by
   *   colons.
   * @param array $data
   *   Settings that provide current configuration of the block, such as
   *   access rules, style settings, block settings, etc.
   */
  function __construct($plugin_name, array $data = array()) {
    parent::__construct($plugin_name, $data);
    $this->plugin = $plugin_name;

    // Provide defaults.
    $data += array(
      'settings' => array(),
      'style' => array(
        'plugin' => 'default',
        'data' => array(),
      ),
      'conditions' => array(),
    );
    $data['settings'] += array(
      'title_display' => LAYOUT_TITLE_DEFAULT,
      'title' => '',
      'style' => 'default',
      'block_settings' => array(),
      'contexts' => array(),
    );

    // Initialize basics, module, delta, UUID, and childDelta.
    list($this->module, $this->delta) = explode(':', $plugin_name);
    $this->uuid = isset($data['uuid']) ? $data['uuid'] : NULL;
    $this->is_new = !$this->uuid;
    $parts = explode(':', $this->plugin, 3);
    $this->childDelta = isset($parts[2]) ? $parts[2] : NULL;

    // Initialize the style.
    $this->style = layout_create_handler('layout_style', $data['style']['plugin'], $data['style']['data']);

    // Initialize conditions.
    foreach ($data['conditions'] as $condition) {
      $this->conditions[] = layout_create_handler('layout_access', $condition['plugin'], $condition['data']);
    }

    // All other settings.
    $this->settings = $data['settings'];
  }

  /**
   * Do any processing prior to getTitle() and getContent() being called.
   *
   * The contexts will have been set on the object at this point, just prior to
   * the block being rendered. This method is useful to save duplicate
   * processing if both getTitle() and getContent() need to use the same data.
   */
  function prepare() {}

  /**
   * Return the title of a block as configured in the layout.
   *
   * @return mixed
   */
  function getTitle() {
    $title = NULL;
    if ($this->settings['title_display'] === LAYOUT_TITLE_CUSTOM && $this->settings['title']) {
      $title = check_plain($this->settings['title']);
    }
    return $title;
  }

  /**
   * Return an administrative title that will always have a value.
   */
  function getAdminTitle() {
    $title = $this->getTitle();
    if (empty($title)) {
      // Last effort, use the title from hook_block_info().
      $info = $this->getBlockInfo();
      $title = $info['info'];
    }
    return $title;
  }

  /**
   * Return the content of a block.
   *
   * @return mixed
   */
  function getContent() {
    return '';
  }

  /**
   * Return a preview for this block.
   */
  function getAdminPreview() {
    $info = $this->getBlockInfo();
    $preview = '';
    if (isset($info['description'])) {
      $preview .= '<p>' . $info['description'] . '</p>';
    }
    $preview .= $this->getAdminConditionsPreview();

    return $preview;
  }

  /**
   * Return the block info for this block, as provided by hook_block_info().
   *
   * @return array
   *   The block info.
   */
  function getBlockInfo() {
    $block_info = layout_get_block_info($this->module, $this->delta);

    // If this is a child block, merge in its child-specific data.
    if ($this->childDelta) {
      $children_blocks = $this->getChildren();
      $block_info = array_merge($block_info, $children_blocks[$this->childDelta]);
    }

    return $block_info;
  }

  /**
   * Return a fieldset listing any visibility conditions set for this block.
   */
  function getAdminConditionsPreview() {
    $preview = '';

    if (!empty($this->conditions)) {
      $condition_list = array();
      foreach ($this->conditions as $condition) {
        $condition_list[] = $condition->summary();
      }
      $conditions = theme('item_list', array('items' => $condition_list, 'attributes' => array('class' => array('block-conditions'))));
      $fieldset = array(
        '#type' => 'fieldset',
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
        '#title' => t('Conditions'),
        '#children' => $conditions,
        '#parents' => array(),
      );
      $form_state = array();
      form_process_fieldset($fieldset, $form_state);

      $preview = backdrop_render($fieldset);
    }
    return $preview;
  }

  /**
   * Build the settings form for editing this block.
   */
  function form(&$form, &$form_state) {
    $layout = $form_state['layout'];
    $contexts = $layout->getContexts();
    $block_info = $this->getBlockInfo();
    $current_context_settings = isset($this->settings['contexts']) ? $this->settings['contexts'] : array();

    $form['contexts'] = layout_contexts_form_element($contexts, $current_context_settings, $block_info);

    $form['title_display']['#tree'] = FALSE;
    $form['title_display']['title_display'] = array(
      '#type' => 'select',
      '#title' => t('Block title type'),
      '#options' => array(
        LAYOUT_TITLE_DEFAULT => t('Default'),
        LAYOUT_TITLE_CUSTOM => t('Custom'),
        LAYOUT_TITLE_NONE => t('None'),
      ),
      '#default_value' => $this->settings['title_display'],
    );
    $form['title_display']['title'] = array(
      '#type' => 'textfield',
      '#default_value' => $this->settings['title'],
      '#title' => t('Custom title'),
      '#states' => array(
        'visible' => array(
          'form.layout-block-configure-form :input[name="title_display"]' => array('value' => LAYOUT_TITLE_CUSTOM),
        ),
      ),
      '#maxlength' => 255,
    );
  }

  /**
   * Validate handler to validate the form settings.
   */
  function formValidate($form, &$form_state) {
    // No additional validation needed yet.
  }

  /**
   * Submit handler to save the form settings.
   */
  function formSubmit($form, &$form_state) {
    $this->settings['title_display'] = $form_state['values']['title_display'];
    $this->settings['title'] = $form_state['values']['title'];
    $this->settings['style'] = $form_state['values']['style'];
    if (isset($form_state['values']['contexts'])) {
      $this->settings['contexts'] = $form_state['values']['contexts'];
    }
    // Remove contexts if none are visible in the form.
    else {
      $this->settings['contexts'] = array();
    }
  }

  /**
   * Clone this block to give it a new UUID but the same configuration.
   */
  function getClone() {
    $new_block = clone $this;
    $uuid = new Uuid();
    $new_block->uuid = $uuid->generate();
    $new_block->is_new = TRUE;
    return $new_block;
  }

  /**
   * Convert the configuration of this block to an array for storage.
   */
  function toArray() {
    $array = array(
      'module' => $this->module,
      'delta' => $this->delta,
      'settings' => $this->settings,
      'uuid' => $this->uuid,
      'style' => array(
        'plugin' => $this->style->plugin,
        'data' => $this->style->toArray(),
      ),
    );
    foreach ($this->conditions as $condition) {
      $array['conditions'][] = array(
        'plugin' => $condition->plugin,
        'data' => $condition->toArray(),
      );
    }
    return $array;
  }

  /**
   * Get a list of all required context plugin names for this block.
   *
   * @return array
   *   An unindexed array of context plugin names.
   */
  function getRequiredContexts() {
    $required_contexts = array();
    $block_info = $this->getBlockInfo();
    if (!empty($block_info['required contexts'])) {
      $required_contexts = $block_info['required contexts'];
    }
    return $required_contexts;
  }

  /**
   * Set the contexts for this block.
   */
  function setContexts(array $all_contexts) {
    $block_info = $this->getBlockInfo();
    $all_contexts_set = TRUE;
    if (!empty($block_info['required contexts'])) {
      $all_contexts_set = layout_set_handler_contexts($this->contexts, $all_contexts, $block_info['required contexts'], $this->settings['contexts']);
    }
    if (!$all_contexts_set) {
      return FALSE;
    }

    // Let each condition select its contexts as needed as well.
    foreach ($this->conditions as $condition) {
      $all_contexts_set = $condition->setContexts($all_contexts);
      if (!$all_contexts_set) {
        return FALSE;
      }
    }

    // Contexts set for the block and all its children.
    return TRUE;
  }

  /**
   * Check if this block should be shown based on current contexts.
   */
  function checkAccess() {
    foreach ($this->conditions as $condition) {
      if (!$condition->checkAccess()) {
        return FALSE;
      }
    }
    return TRUE;
  }

  /**
   * Allows an array of "child blocks" for display in the "Add Block" dialog.
   *
   * This allows a single entry in hook_block_info() to provide multiple
   * block instances displaying different fields.
   *
   * Note that this function may return NULL or an empty array, which have
   * different meanings. NULL means that a block does not provide children at
   * all. An empty array means that a block may provide children, but that there
   * are none currently.
   *
   * return array|NULL
   */
  function getChildren() {
    return NULL;
  }
}

/**
 * A class used for blocks when their providing module or delta does not exist.
 */
class BlockBroken extends Block {
  function getTitle() {
    return '';
  }
  function getAdminTitle() {
    return t('Broken block');
  }
  function getAdminPreview() {
    $preview = '';
    if (!module_exists($this->module)) {
      $preview .= t('This block requires the %module module. Either re-enable the module, or remove this block.', array('%module' => $this->module));
    }
    else {
      $preview .= t('This block provided by the %module module is missing. The block has an identifier of %delta, which may have been deleted or is no longer valid.', array('%module' => $this->module, '%delta' => $this->delta));
    }
    $preview = '<p class="error">' . $preview . '</p>';
    return $preview;
  }
  function getContent() {
    return '';
  }
  function checkAccess() {
    return FALSE;
  }
}
