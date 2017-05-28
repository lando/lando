<?php

/**
 * @file
 * Entity controller and class for nodes.
 */

/**
 * Defines the node entity class.
 */
class Node extends Entity {

  /**
   * The node ID.
   *
   * @var integer
   */
  public $nid;

  /**
   * The node revision ID.
   *
   * @var integer
   */
  public $vid;

  /**
   * The node content type (bundle).
   *
   * @var string
   */
  public $type;

  /**
   * The node language code.
   *
   * @var string
   */
  public $langcode = LANGUAGE_NONE;

  /**
   * The node title.
   *
   * @var string
   */
  public $title;

  /**
   * The node owner's user ID.
   *
   * @var integer
   */
  public $uid;

  /**
   * The node published status indicator.
   *
   * Unpublished nodes are only visible to their authors and to administrators.
   * The value is either NODE_PUBLISHED or NODE_NOT_PUBLISHED.
   *
   * @var integer
   */
  public $status;

  /**
   * The node creation timestamp.
   *
   * @var integer
   */
  public $created;

  /**
   * The node modification timestamp.
   *
   * @var integer
   */
  public $changed;

  /**
   * The node comment status indicator.
   *
   * COMMENT_NODE_HIDDEN => no comments
   * COMMENT_NODE_CLOSED => comments are read-only
   * COMMENT_NODE_OPEN => open (read/write)
   *
   * @var integer
   */
  public $comment;

  /**
   * The node promotion status.
   *
   * Promoted nodes should be displayed on the front page of the site. The
   * value is either NODE_PROMOTED or NODE_NOT_PROMOTED.
   *
   * @var integer
   */
  public $promote;

  /**
   * The node sticky status.
   *
   * Sticky nodes should be displayed at the top of lists in which they appear.
   * The value is either NODE_STICKY or NODE_NOT_STICKY.
   *
   * @var integer
   */
  public $sticky;

  /**
   * The node translation set ID.
   *
   * Translations sets are based on the ID of the node containing the source
   * text for the translation set.
   *
   * @var integer
   */
  public $tnid;

  /**
   * The node translation status.
   *
   * If the translation page needs to be updated the value is 1, otherwise 0.
   *
   * @var integer
   */
  public $translate;

  /**
   * The node revision creation timestamp.
   *
   * @var integer
   */
  public $revision_timestamp;

  /**
   * The node revision author's user ID.
   *
   * @var integer
   */
  public $revision_uid;

  /**
   * Create a new Node instance.
   */
  function __construct(array $values = array()) {
    parent::__construct($values);

    // Set the created time to now.
    if (empty($this->created)) {
      $this->created = REQUEST_TIME;
    }
  }

  /**
   * Implements EntityInterface::id().
   */
  public function id() {
    return isset($this->nid) ? $this->nid : NULL;
  }

  /**
   * Implements EntityInterface::entityType().
   */
  public function entityType() {
    return 'node';
  }

  /**
   * Implements EntityInterface::bundle().
   */
  public function bundle() {
    return $this->type;
  }

  /**
   * Implements EntityInterface::label().
   */
  public function label() {
    return $this->title;
  }

  /**
   * Implements EntityInterface::uri().
   */
  public function uri() {
    return array(
      'path' => 'node/' . $this->nid,
      'options' => array(),
    );
  }

  /**
   * Overrides Entity::createDuplicate().
   */
  public function createDuplicate() {
    $duplicate = clone $this;
    $duplicate->nid = NULL;
    $duplicate->vid = NULL;
    return $duplicate;
  }
}


/**
 * Controller class for nodes.
 *
 * This extends the EntityDatabaseStorageController class, adding required
 * special handling for node entities.
 */
class NodeStorageController extends EntityDatabaseStorageController {

  /**
   * Overrides EntityDatabaseStorageController::delete().
   */
  public function delete($ids) {
    $entities = $ids ? $this->load($ids) : FALSE;
    if (!$entities) {
      // If no IDs or invalid IDs were passed, do nothing.
      return;
    }
    $transaction = db_transaction();

    try {
      $this->preDelete($entities);
      foreach ($entities as $id => $entity) {
        $this->invokeHook('predelete', $entity);
      }
      $ids = array_keys($entities);

      db_delete($this->entityInfo['base table'])
        ->condition($this->idKey, $ids, 'IN')
        ->execute();

      if ($this->revisionKey) {
        db_delete($this->revisionTable)
          ->condition($this->idKey, $ids, 'IN')
          ->execute();
      }

      // Reset the cache as soon as the changes have been applied.
      $this->resetCache($ids);

      $this->postDelete($entities);
      foreach ($entities as $id => $entity) {
        $this->invokeHook('delete', $entity);
      }
      // Ignore slave server temporarily.
      db_ignore_slave();
    }
    catch (Exception $e) {
      $transaction->rollback();
      watchdog_exception($this->entityType, $e);
      throw new EntityStorageException($e->getMessage(), (int) $e->getCode(), $e);
    }
  }

  /**
   * Overrides EntityDatabaseStorageController::save().
   *
   * @param Node $entity
   *   The node entity being saved.
   */
  public function save(EntityInterface $entity) {
    $transaction = db_transaction();
    try {
      // Load the stored entity, if any.
      if (!$entity->isNew() && !isset($entity->original)) {
        $entity->original = entity_load_unchanged($this->entityType, $entity->id());
      }

      $this->preSave($entity);
      $this->invokeHook('presave', $entity);

      if ($entity->isNew()) {
        $op = 'insert';
        $return = backdrop_write_record($this->entityInfo['base table'], $entity);
        unset($entity->is_new);
      }
      else {
        $op = 'update';
        $return = backdrop_write_record($this->entityInfo['base table'], $entity, $this->idKey);
      }

      if ($this->revisionKey) {
        $this->saveRevision($entity);
      }

      // Reset general caches, but keep caches specific to certain entities.
      $this->resetCache($op == 'update' ? array($entity->{$this->idKey}): array());

      $this->postSave($entity, $op == 'update');
      $this->invokeHook($op, $entity);

      // Ignore slave server temporarily.
      db_ignore_slave();
      unset($entity->original);

      return $return;
    }
    catch (Exception $e) {
      $transaction->rollback();
      watchdog_exception($this->entityType, $e);
      throw new EntityStorageException($e->getMessage(), (int) $e->getCode(), $e);
    }
  }

  /**
   * Saves a node revision.
   *
   * @param Node $entity
   *   The node entity whose revision should be saved.
   */
  protected function saveRevision(EntityInterface $entity) {
    $record = clone $entity;
    $record->uid = $entity->revision_uid;
    $record->timestamp = $entity->revision_timestamp;

    if (empty($entity->{$this->revisionKey}) || !empty($entity->revision)) {
      backdrop_write_record($this->revisionTable, $record);
      db_update($this->entityInfo['base table'])
        ->fields(array($this->revisionKey => $record->{$this->revisionKey}))
        ->condition($this->idKey, $entity->{$this->idKey})
        ->execute();
    }
    else {
      backdrop_write_record($this->revisionTable, $record, $this->revisionKey);
    }
    // Make sure to update the new revision key for the entity.
    $entity->{$this->revisionKey} = $record->{$this->revisionKey};
  }

  /**
   * Overrides DefaultEntityController::attachLoad().
   *
   * @param Node[] $nodes
   *   An array of nodes on which fields should be attached.
   */
  protected function attachLoad(&$nodes, $revision_id = FALSE) {
    // Create an array of nodes for each content type and pass this to the
    // object type specific callback.
    $typed_nodes = array();
    foreach ($nodes as $id => $entity) {
      $typed_nodes[$entity->type][$id] = $entity;
    }

    // Call object type specific callbacks on each typed array of nodes.
    foreach ($typed_nodes as $node_type => $nodes_of_type) {
      if (node_hook($node_type, 'load')) {
        $function = node_type_get_base($node_type) . '_load';
        $function($nodes_of_type);
      }
    }
    // Besides the list of nodes, pass one additional argument to
    // hook_node_load(), containing a list of node types that were loaded.
    $argument = array_keys($typed_nodes);
    $this->hookLoadArguments = array($argument);
    parent::attachLoad($nodes, $revision_id);
  }

  /**
   * Overrides DefaultEntityController::buildQuery().
   */
  protected function buildQuery($ids, $conditions = array(), $revision_id = FALSE) {
    // Ensure that uid is taken from the {node} table,
    // alias timestamp to revision_timestamp and add revision_uid.
    $query = parent::buildQuery($ids, $conditions, $revision_id);
    $fields =& $query->getFields();
    unset($fields['timestamp']);
    $query->addField('revision', 'timestamp', 'revision_timestamp');
    $fields['uid']['table'] = 'base';
    $query->addField('revision', 'uid', 'revision_uid');
    return $query;
  }

  /**
   * Overrides EntityDatabaseStorageController::invokeHook().
   *
   * @param string $hook
   *   One of 'presave', 'insert', 'update', 'predelete', or 'delete'.
   * @param Node $node
   *   The entity object, always a Node object in this case.
   */
  protected function invokeHook($hook, EntityInterface $node) {
    if ($hook == 'insert' || $hook == 'update') {
      node_invoke($node, $hook);
    }
    elseif ($hook == 'predelete') {
      // 'delete' is triggered in 'predelete' is here to preserve hook ordering
      // from Drupal 7.
      node_invoke($node, 'delete');
    }

    parent::invokeHook($hook, $node);

    if ($hook == 'presave') {
      if ($node->isNew() || !empty($node->revision)) {
        // When inserting either a new node or a new node revision, $node->log
        // must be set because {node_revision}.log is a text column and therefore
        // cannot have a default value. However, it might not be set at this
        // point (for example, if the user submitting a node form does not have
        // permission to create revisions), so we ensure that it is at least an
        // empty string in that case.
        // @todo: Make the {node_revision}.log column nullable so that we can
        // remove this check.
        if (!isset($node->log)) {
          $node->log = '';
        }
      }
      elseif (!isset($node->log) || $node->log === '') {
        // If we are updating an existing node without adding a new revision, we
        // need to make sure $node->log is unset whenever it is empty. As long as
        // $node->log is unset, backdrop_write_record() will not attempt to update
        // the existing database column when re-saving the revision; therefore,
        // this code allows us to avoid clobbering an existing log entry with an
        // empty one.
        unset($node->log);
      }

      // When saving a new node revision, unset any existing $node->vid so as to
      // ensure that a new revision will actually be created, then store the old
      // revision ID in a separate property for use by node hook implementations.
      if (!$node->isNew() && !empty($node->revision) && $node->vid) {
        $node->old_vid = $node->vid;
        $node->vid = NULL;
      }
    }
  }

  /**
   * Overrides EntityDatabaseStorageController::preSave().
   *
   * @param Node $node
   *   The node object about to be saved.
   */
  protected function preSave(EntityInterface $node) {
    // Before saving the node, set changed and revision times.
    $node->changed = REQUEST_TIME;

    if ($this->revisionKey && !empty($node->revision)) {
      $node->revision_timestamp = REQUEST_TIME;

      if (!isset($node->revision_uid)) {
        $node->revision_uid = $GLOBALS['user']->uid;
      }
    }
  }

  /**
   * Overrides EntityDatabaseStorageController::postSave().
   *
   * @param Node $node
   *   The node object that has just been saved.
   */
  function postSave(EntityInterface $node, $update) {
    node_access_acquire_grants($node, $update);
  }

  /**
   * Overrides EntityDatabaseStorageController::preDelete().
   *
   * @param Node[] $entities
   *   An array of node entities about to be deleted.
   */
  function preDelete($nodes) {
    if (module_exists('search')) {
      foreach ($nodes as $nid => $node) {
        search_reindex($node->nid, 'node');
      }
    }
  }

  /**
   * Overrides EntityDatabaseStorageController::postDelete().
   *
   * @param Node[] $nodes
   *   An array of node entities that have just been deleted.
   */
  protected function postDelete($nodes) {
    // Delete values from other tables also referencing this node.
    $ids = array_keys($nodes);

    db_delete('history')
      ->condition('nid', $ids, 'IN')
      ->execute();
    db_delete('node_access')
      ->condition('nid', $ids, 'IN')
      ->execute();
  }
}
