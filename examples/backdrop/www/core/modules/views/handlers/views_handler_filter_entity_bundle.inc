<?php

/**
 * @file
 * Definition of views_handler_filter_entity_bundle
 */

/**
 * Filter class which allows to filter by certain bundles of an entity.
 *
 * This class provides workarounds for taxonomy and comment.
 *
 * @ingroup views_filter_handlers
 */
class views_handler_filter_entity_bundle extends views_handler_filter_in_operator {
  /**
   * Stores the entity type on which the filter filters.
   *
   * @var string
   */
  public $entity_type;

  function init(&$view, &$options) {
    parent::init($view, $options);

    $this->get_entity_type();
  }

  /**
   * Set and returns the entity_type.
   *
   * @return string
   *   The entity type on the filter.
   */
  function get_entity_type() {
    if (!isset($this->entity_type)) {
      $data = views_fetch_data($this->table);
      if (isset($data['table']['entity type'])) {
        $this->entity_type = $data['table']['entity type'];
      }

      // If the current filter is under a relationship you can't be sure that the
      // entity type of the view is the entity type of the current filter
      // For example a filter from a node author on a node view does have users as entity type.
      if (!empty($this->options['relationship']) && $this->options['relationship'] != 'none') {
        $relationships = $this->view->display_handler->get_option('relationships');
        if (!empty($relationships[$this->options['relationship']])) {
          $options = $relationships[$this->options['relationship']];
          $data = views_fetch_data($options['table']);
          $this->entity_type = $data['table']['entity type'];
        }
      }
    }

    return $this->entity_type;
  }


  function get_value_options() {
    if (!isset($this->value_options)) {
      $info = entity_get_info($this->entity_type);
      $types = $info['bundles'];
      $this->value_title = t('@entity types', array('@entity' => $info['label']));

      $options = array();
      foreach ($types as $type => $info) {
        $options[$type] = t($info['label']);
      }
      asort($options);
      $this->value_options = $options;
    }
  }

  /**
   * All entity types beside comment and taxonomy terms have a proper implement
   * bundle, though these two need an additional join to node/vocab table
   * to work as required.
   */
  function query() {
    $this->ensure_my_table();

    // Adjust the join for the comment case.
    if ($this->entity_type == 'comment') {
      $join = new views_join();
      $def = array(
        'table' => 'node',
        'field' => 'nid',
        'left_table' => $this->table_alias,
        'left_field' => 'nid',
      );
      $join->definition = $def;
      $join->construct();
      $join->adjusted = TRUE;
      $this->table_alias = $this->query->add_table('node', $this->relationship, $join);
      $this->real_field = 'type';

      // Replace the value to match the node type column.
      foreach ($this->value as &$value) {
        $value = str_replace('comment_node_', '', $value);
      }
    }
    elseif ($this->entity_type == 'taxonomy_term') {
      $join = new views_join();
      $def = array(
        'table' => 'taxonomy_vocabulary',
        'field' => 'vid',
        'left_table' => $this->table_alias,
        'left_field' => 'vid',
      );
      $join->definition = $def;
      $join->construct();
      $join->adjusted = TRUE;
      $this->table_alias = $this->query->add_table('taxonomy_vocabulary', $this->relationship, $join);
      $this->real_field = 'machine_name';
    }
    else {
      $entity_info = entity_get_info($this->entity_type);
      $this->real_field = $entity_info['bundle keys']['bundle'];
    }
    parent::query();
  }
}
