<?php

/**
 * @file
 * Entity classes and controllers for Taxonomy module.
 */

/**
 * Defines the taxonomy term entity.
 */
class TaxonomyTerm extends Entity {

  /**
   * The taxonomy term ID.
   *
   * @var integer
   */
  public $tid;

  /**
   * The machine name of the vocabulary to which the term is assigned.
   *
   * @var string
   */
  public $vocabulary;

  /**
   * Name of the term.
   *
   * @var string
   */
  public $name;

  /**
   * (optional) Description of the term.
   *
   * @var string
   */
  public $description;

  /**
   * (optional) The text format name for the term's description.
   *
   * @var string
   */
  public $format;

  /**
   * (optional) The weight of this term in relation to other terms of the same
   * vocabulary.
   *
   * @var integer
   */
  public $weight = 0;

  /**
   * (optional) The parent term(s) for this term.
   *
   * This property is not loaded, but may be used to modify the term parents via
   * TaxonomyTerm::save().
   *
   * The property can be set to an array of term IDs. An entry of 0 means this
   * term does not have any parents. When omitting this variable during an
   * update, the existing hierarchy for the term remains unchanged.
   *
   * @var array
   */
  public $parent;

  /**
   * Implements EntityInterface::id().
   */
  public function id() {
    return isset($this->tid) ? $this->tid : NULL;
  }

  /**
   * Implements EntityInterface::label().
   */
  public function label() {
    return $this->name;
  }

  /**
   * Implements EntityInterface::bundle().
   */
  public function bundle() {
    return $this->vocabulary;
  }

  /**
   * Implements EntityInterface::entityType().
   */
  public function entityType() {
    return 'taxonomy_term';
  }

  /**
   * Implements EntityInterface::uri()
   */
  public function uri() {
    return array(
      'path' => 'taxonomy/term/' . $this->tid,
      'options' => array(),
    );
  }
}

/**
 * Controller class for taxonomy terms.
 */
class TaxonomyTermController extends EntityDatabaseStorageController {

  /**
   * Overrides EntityDatabaseStorageController::create().
   *
   * @param array $values
   *   An array of values to set, keyed by property name. A value for the
   *   vocabulary ID ('vid') is required.
   */
  public function create(array $values) {
    $entity = parent::create($values);

    // Save new terms with no parents by default.
    if (!isset($entity->parent)) {
      $entity->parent = array(0);
    }
    return $entity;
  }

  /**
   * Overrides EntityDatabaseStorageController::buildQuery().
   */
  protected function buildQuery($ids, $conditions = array(), $revision_id = FALSE) {
    $query = parent::buildQuery($ids, $conditions, $revision_id);
    $query->addTag('translatable');
    $query->addTag('taxonomy_term_access');
    // When name is passed as a condition use LIKE.
    if (isset($conditions['name'])) {
      $query_conditions = &$query->conditions();
      foreach ($query_conditions as $key => $condition) {
        if (is_array($condition) && $condition['field'] == 'base.name') {
          $query_conditions[$key]['operator'] = 'LIKE';
          $query_conditions[$key]['value'] = db_like($query_conditions[$key]['value']);
        }
      }
    }
    return $query;
  }

  /**
   * Overrides EntityDatabaseStorageController::cacheGet().
   */
  protected function cacheGet($ids, $conditions = array()) {
    $terms = parent::cacheGet($ids, $conditions);
    // Name matching is case insensitive, note that with some collations
    // LOWER() and backdrop_strtolower() may return different results.
    foreach ($terms as $term) {
      if (isset($conditions['name']) && backdrop_strtolower($conditions['name'] != backdrop_strtolower($term->name))) {
        unset($terms[$term->tid]);
      }
    }
    return $terms;
  }

  /**
   * Overrides EntityDatabaseStorageController::postDelete().
   *
   * @param TaxonomyTerm[] $entities
   *   An array of term entities that were just deleted.
   */
  protected function postDelete($entities) {
    // See if any of the term's children are about to be become orphans.
    $orphans = array();
    foreach (array_keys($entities) as $tid) {
      if ($children = taxonomy_term_load_children($tid)) {
        foreach ($children as $child) {
          // If the term has multiple parents, we don't delete it.
          $parents = taxonomy_term_load_parents($child->tid);
          // Because the parent has already been deleted, the parent count might
          // be 0.
          if (count($parents) <= 1) {
            $orphans[] = $child->tid;
          }
        }
      }
    }

    // Delete term hierarchy information after looking up orphans but before
    // deleting them so that their children/parent information is consistent.
    db_delete('taxonomy_term_hierarchy')
      ->condition('tid', array_keys($entities))
      ->execute();

    if (!empty($orphans)) {
      taxonomy_term_delete_multiple($orphans);
    }
  }

  /**
   * Overrides EntityDatabaseStorageController::postSave().
   *
   * @param TaxonomyTerm $entity
   *   The term entity that was just saved.
   */
  protected function postSave(EntityInterface $entity, $update) {
    if (isset($entity->parent)) {
      db_delete('taxonomy_term_hierarchy')
        ->condition('tid', $entity->tid)
        ->execute();

      $query = db_insert('taxonomy_term_hierarchy')
        ->fields(array('tid', 'parent'));

      foreach ($entity->parent as $parent) {
        $query->values(array(
          'tid' => $entity->tid,
          'parent' => $parent
        ));
      }
      $query->execute();
    }
  }

  /**
   * Implements EntityControllerInterface::resetCache().
   */
  public function resetCache(array $ids = NULL) {
    backdrop_static_reset('taxonomy_term_count_nodes');
    backdrop_static_reset('taxonomy_get_tree');
    backdrop_static_reset('taxonomy_get_tree:parents');
    backdrop_static_reset('taxonomy_get_tree:terms');
    backdrop_static_reset('taxonomy_term_load_parents');
    backdrop_static_reset('taxonomy_term_load_parents_all');
    backdrop_static_reset('taxonomy_term_load_children');
    parent::resetCache($ids);
  }
}
