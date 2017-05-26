<?php
/**
 * Taxonomy vocabularies allow the grouping of taxonomy terms.
 *
 * This class is responsible for saving and storing configuration files for
 * vocabularies.
 */
class TaxonomyVocabulary {

  /**
   * Human-readable of the vocabulary.
   *
   * @var string
   */
  public $name;

  /**
   * The vocabulary machine name.
   *
   * @var string
   */
  public $machine_name;

  /**
   * (optional) Description of the vocabulary.
   *
   * @var string
   */
  public $description;

  /**
   * The type of hierarchy allowed within the vocabulary.
   *
   * Possible values:
   * - TAXONOMY_HIERARCHY_DISABLED: No parents.
   * - TAXONOMY_HIERARCHY_SINGLE: Single parent.
   * - TAXONOMY_HIERARCHY_MULTIPLE: Multiple parents.
   *
   * @var integer
   */
  public $hierarchy = TAXONOMY_HIERARCHY_DISABLED;

  /**
   * (optional) The weight of this vocabulary in relation to other vocabularies.
   *
   * @var integer
   */
  public $weight = 0;

  function __construct($config = array()) {
    foreach ($config as $key => $value) {
      $this->$key = $value;
    }
  }

  /**
   * Saves a taxonomy vocabulary to configuration.
   *
   * @return
   *   Either SAVED_NEW if the vocabulary was created, or SAVED_UPDATED if the
   *   vocabulary was updated.
   */
  function save() {
    module_invoke_all('taxonomy_vocabulary_presave', $this);

    $config = config('taxonomy.vocabulary.' . $this->machine_name);
    $is_new = $config->isNew();
    $config->set('name', $this->name);
    $config->set('machine_name', $this->machine_name);
    $config->set('description', $this->description);
    $config->set('hierarchy', $this->hierarchy);
    $config->set('weight', $this->weight);
    $config->save();

    if ($is_new) {
      $status = SAVED_NEW;
      module_invoke_all('taxonomy_vocabulary_insert', $this);
      field_attach_create_bundle('taxonomy_term', $this->machine_name);
    }
    else {
      $status = SAVED_UPDATED;
      module_invoke_all('taxonomy_vocabulary_update', $this);
    }

    backdrop_static_reset('taxonomy_vocabulary_load_multiple');
    return $status;
  }

  /**
   * Deletes a taxonomy vocabulary.
   */
  function delete() {
    module_invoke_all('taxonomy_vocabulary_predelete', $this);

    // Only load terms without a parent, child terms will get deleted too.
    $tids = db_query('SELECT t.tid FROM {taxonomy_term_data} t INNER JOIN {taxonomy_term_hierarchy} th ON th.tid = t.tid WHERE t.vocabulary = :vocabulary AND th.parent = 0', array(':vocabulary' => $this->machine_name))->fetchCol();
    taxonomy_term_delete_multiple($tids);

    // Load all Taxonomy module fields and delete those which use only this
    // vocabulary.
    $taxonomy_fields = field_read_fields(array('module' => 'taxonomy'));
    foreach ($taxonomy_fields as $field_name => $taxonomy_field) {
      $modified_field = FALSE;
      // Term reference fields may reference terms from more than one
      // vocabulary.
      foreach ($taxonomy_field['settings']['allowed_values'] as $key => $allowed_value) {
        if ($allowed_value['vocabulary'] == $this->machine_name) {
          unset($taxonomy_field['settings']['allowed_values'][$key]);
          $modified_field = TRUE;
        }
      }
      if ($modified_field) {
        if (empty($taxonomy_field['settings']['allowed_values'])) {
          field_delete_field($field_name);
        }
        else {
          // Update the field definition with the new allowed values.
          field_update_field($taxonomy_field);
        }
      }
    }

    field_attach_delete_bundle('taxonomy_term', $this->machine_name);

    module_invoke_all('taxonomy_vocabulary_delete', $this);

    // Delete the configuration file.
    $config = config('taxonomy.vocabulary.' . $this->machine_name);
    $config->delete();

    backdrop_static_reset('taxonomy_vocabulary_load_multiple');
  }
}
