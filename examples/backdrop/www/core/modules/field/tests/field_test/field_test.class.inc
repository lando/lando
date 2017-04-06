<?php
/**
 * Test class for the test_entity entity type.
 */
class TestFieldEntity extends Entity {
  function id() {
    return $this->id;
  }

  public function entityType() {
    return 'test_field_entity';
  }

  function label() {
    return $this->label;
  }

  function uri() {
    return 'test/' . $this->id;
  }
}
