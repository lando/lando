<?php

/**
 * @file
 * Class that holds information relating to a layouts context.
 *
 * This class does not extend the LayoutHandler class because contexts are not
 * stored directly within configuration. Instead contexts are determined based
 * on the Layout's path
 */
abstract class LayoutContext {
  /**
   * The name of the plugin that provides this context.
   *
   * @var string
   */
  var $plugin;

  /**
   * An array of plugin names by which this context may also be called.
   *
   * For example the "node" plugin is an alias of the "entity" plugin.
   *
   * @var array
   *
   * @see EntityLayoutContext
   */
  var $aliases = array();

  /**
   * Indicator as to whether this context is required and cannot be removed.
   *
   * Required contexts typically are those provided by a menu path wildcard.
   * While these contexts are required to exist, they can be changed to a
   * different type of context. e.g. A layout at path "foo/%" could have a
   * required context at position 1 with either a "node" or "string" plugin. The
   * required characteristic means that this context must exist, but its type
   * may be user-defined.
   *
   * @var bool
   */
  var $required = FALSE;

  /**
   * Indicator as to whether this context may not be changed to a different one.
   *
   * Locked contexts are those that are provided by a menu path and tied to a
   * particular context through hook_layout_context_info(). e.g. A layout at
   * path "node/%" will have a locked context of type "node" in position 1.
   * Locked contexts must always exist and may not be changed to a different
   * type through the UI.
   *
   * @var bool
   */
  var $locked = FALSE;

  /**
   * The order of this context in its containing layout.
   *
   * If this context is bound to an argument in a path, this will match that
   * position in the path.
   *
   * @var int
   */
  var $position;

  /**
   * A machine-name for this context.
   *
   * Usually this is auto-generated, but may be customizable in the future.
   */
  var $name;

  /**
   * The human-readable label for this context if available.
   *
   * @var string
   */
  var $label;

  /**
   * The data within this context.
   *
   * @var mixed
   */
  var $data;

  /**
   * The argument value from the URL or passed in directly.
   *
   * @var string
   */
  var $argument;

  /**
   * A list of values that must match in order for this context to be valid.
   *
   * This list is compared against the $data object to ensure that this context
   * applies to the current situation. The key of each entry maps to a property
   * on the $data object. And the values of each entry must match the $data
   * property value in order to be considered valid.
   *
   * @var array
   */
  var $restrictions = array();

  /**
   * Constructor for LayoutContext objects.
   */
  function __construct($plugin_name, $config = array()) {
    $this->plugin = $plugin_name;
    $properties = array(
      'required',
      'locked',
      'position',
      'name',
      'label',
    );
    foreach ($properties as $property) {
      if (isset($config[$property])) {
        $this->$property = $config[$property];
      }
    }
  }

  /**
   * Return the indicator for this context, i.e. "entity", "string".
   */
  abstract function type();

  /**
   * Assemble a human-readable label of this object.
   */
  function label() {
    if ($this->label) {
      return $this->label;
    }
    $info = layout_get_context_info($this->plugin);
    if (isset($this->position)) {
      return t('@label from path (position @position)', array('@label' => $info['title'], '@position' => $this->position + 1));
    }
    else {
      return check_plain($info['title']);
    }
  }

  /**
   * Set the data for this context.
   */
  function setData($data) {
    $this->data = $data;
  }

  /**
   * Check if this context matches a plugin name.
   *
   * This helps identify contexts which have aliases, such as a "node" context
   * which is also considered an "entity" context.
   *
   * For example:
   * @code
   * $context = layout_create_context('node');
   *
   * var_dump($context->isA('node')); // TRUE.
   * var_dump($context->isA('entity')); // TRUE.
   * var_dump($context->isA('user')); // FALSE.
   * @endcode
   *
   * @param string $plugin
   *
   * @return bool
   */
  function isA($plugin) {
    return $plugin === $this->plugin || in_array($plugin, $this->aliases);
  }
}

/**
 * A class to be used for contexts whose handler cannot be found.
 */
class LayoutContextBroken extends LayoutContext {
  function type() {
    return 'broken';
  }
  function label() {
    return t('Broken or missing context (@plugin)', array('@plugin' => $this->plugin));
  }
}

/**
 * Pass-through context used when an unknown argument is encountered.
 */
class LayoutOverridesPathContext extends LayoutContext {
  function type() {
    return 'overrides_path';
  }
  function label() {
    return t('Layout overrides path');
  }
}

/**
 * Pass-through context used when an unknown argument is encountered.
 */
class LayoutStringContext extends LayoutContext {
  function type() {
    return 'string';
  }
  function label() {
    return t('String pass-through');
  }
}
