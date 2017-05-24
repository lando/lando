<?php
/**
 * @file
 * Layout context handler for entities.
 */
class EntityLayoutContext extends LayoutContext {
  /**
   * The entity type for this context.
   *
   * @var string
   */
  protected $entity_type;

  function __construct($plugin_name, $config = array()) {
    parent::__construct($plugin_name, $config);

    $this->entity_type = $plugin_name;
    $this->aliases = array('entity');
  }

  function type() {
    return 'entity';
  }

  function label() {
    $info = entity_get_info($this->entity_type);
    // @todo: Contexts do not yet have settings to make this possible. Once
    // the ability to add manual contexts (e.g. an arbitrary node), then this
    // will actually do something.
    if (isset($this->settings['id'])) {
      if ($entity = entity_load($this->entity_type, $this->settings['id'])) {
        return t('@type: @id (@title)', array('@type' => $info['label'], '@id' => $entity->id(), '@title' => $entity->label()));
      }
      else {
        return t('Unknown @type: @id', array('@type' => $info['label'], '@id' =>$this->settings['id']));
      }
    }
    if ($this->entity_type === 'user' && isset($this->name) && $this->name === 'current_user') {
      return t('Current user');
    }
    else {
      return parent::label();
    }
  }
}
