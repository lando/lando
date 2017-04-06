<?php
/**
 * @file
 * Test entity classes.
 */

/**
 * Test class for the test_entity entity type.
 */
class TestEntity extends Entity {
  public $id;

  function id() {
    return $this->id;
  }

  public function entityType() {
    return 'entity_test';
  }

  function label() {
    return 'label';
  }

  function uri() {
    return array(
      'path' => 'test/' . $this->id,
    );
  }
}
