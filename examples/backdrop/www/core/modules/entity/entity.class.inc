<?php

/**
 * @file
 * Provides an interface and a base class for entities.
 */

/**
 * Defines a common interface for all entity objects.
 */
interface EntityInterface {

  /**
   * Constructs a new entity object.
   *
   * @param $values
   *   An array of values to set, keyed by property name. If the entity type
   *   has bundles, the bundle key has to be specified.
   */
  public function __construct(array $values);

  /**
   * Returns the entity identifier (the entity's machine name or numeric ID).
   *
   * @return
   *   The identifier of the entity, or NULL if the entity does not yet have
   *   an identifier.
   */
  public function id();

  /**
   * Returns whether the entity is new.
   *
   * Usually an entity is new if no ID exists for it yet. However, entities may
   * be enforced to be new with existing IDs too.
   *
   * @return
   *   TRUE if the entity is new, or FALSE if the entity has already been saved.
   */
  public function isNew();

  /**
   * Returns the type of the entity.
   *
   * @return
   *   The type of the entity.
   */
  public function entityType();

  /**
   * Returns the bundle of the entity.
   *
   * @return
   *   The bundle of the entity. Defaults to the entity type if the entity type
   *   does not make use of different bundles.
   */
  public function bundle();

  /**
   * Returns the label of the entity.
   *
   * @return
   *   The label of the entity, or NULL if there is no label defined.
   */
  public function label();

  /**
   * Returns the URI elements of the entity.
   *
   * @return
   *   An array containing the 'path' and 'options' keys used to build the URI
   *   of the entity, and matching the signature of url(). NULL if the entity
   *   has no URI of its own.
   */
  public function uri();

  /**
   * Saves an entity permanently.
   *
   * @return
   *   Either SAVED_NEW or SAVED_UPDATED, depending on the operation performed.
   *
   * @throws EntityStorageException
   *   In case of failures an exception is thrown.
   */
  public function save();

  /**
   * Deletes an entity permanently.
   *
   * @throws EntityStorageException
   *   In case of failures an exception is thrown.
   */
  public function delete();

  /**
   * Creates a duplicate of the entity.
   *
   * @return EntityInterface
   *   A clone of the current entity with all identifiers unset, so saving
   *   it inserts a new entity into the storage system.
   */
  public function createDuplicate();
}

/**
 * Defines a base entity class.
 */
abstract class Entity extends stdClass implements EntityInterface {
  /**
   * Constructs a new entity object.
   */
  public function __construct(array $values = array()) {
    // Set initial values.
    foreach ($values as $key => $value) {
      $this->$key = $value;
    }
  }

  /**
   * Implements EntityInterface::isNew().
   */
  public function isNew() {
    // We support creating entities with pre-defined IDs to ease migrations.
    // For that the "is_new" property may be set to TRUE.
    return !empty($this->is_new) || !$this->id();
  }

  /**
   * Implements EntityInterface::bundle().
   *
   * Entity types that do not support bundles simply return the entity type as
   * their bundle. Subclasses should override this method if supporting bundles.
   */
  public function bundle() {
    return $this->entityType();
  }

  /**
   * Implements EntityInterface::save().
   */
  public function save() {
    return entity_get_controller($this->entityType())->save($this);
  }

  /**
   * Implements EntityInterface::delete().
   */
  public function delete() {
    if (!$this->isNew()) {
      entity_get_controller($this->entityType())->delete(array($this->id()));
    }
  }

  /**
   * Implements EntityInterface::createDuplicate().
   */
  public function createDuplicate() {
    $entity_info = entity_get_info($this->entityType());
    $duplicate = clone $this;
    $duplicate->{$entity_info['entity keys']['id']} = NULL;
    if (isset($entity_info['entity_keys']['revision'])) {
      $duplicate->{$entity_info['entity keys']['revision']} = NULL;
    }
    return $duplicate;
  }
}

/**
 * Defines an exception thrown when a malformed entity is passed.
 */
class EntityMalformedException extends Exception { }
