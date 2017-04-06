<?php
/**
 * Controller class for the test_entity_bundle entity type.
 *
 * This extends the DefaultEntityController class, adding required
 * special handling for bundles (since they are not stored in the database).
 */
class TestEntityBundleController extends DefaultEntityController {

  protected function attachLoad(&$entities, $revision_id = FALSE) {
    // Add bundle information.
    foreach ($entities as $key => $entity) {
      $entity->fttype = 'test_entity_bundle';
      $entities[$key] = $entity;
    }
    parent::attachLoad($entities, $revision_id);
  }
}
