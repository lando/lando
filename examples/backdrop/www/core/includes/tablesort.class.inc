<?php
/**
 * @file
 * Classes for extending table sort queries.
 */

/**
 * Query extender class for tablesort queries.
 */
class TableSort extends SelectQueryExtender {

  /**
   * The array of fields that can be sorted by.
   *
   * @var array
   */
  protected $header = array();

  public function __construct(SelectQueryInterface $query, DatabaseConnection $connection) {
    parent::__construct($query, $connection);

    // Add convenience tag to mark that this is an extended query. We have to
    // do this in the constructor to ensure that it is set before preExecute()
    // gets called.
    $this->addTag('tablesort');
  }

  /**
   * Order the query based on a header array.
   *
   * @see theme_table()
   * @param $header
   *   Table header array.
   * @return SelectQueryInterface
   *   The called object.
   */
  public function orderByHeader(Array $header) {
    $this->header = $header;
    $ts = $this->init();
    if (!empty($ts['sql'])) {
      // Based on code from db_escape_table(), but this can also contain a dot.
      $field = preg_replace('/[^A-Za-z0-9_.]+/', '', $ts['sql']);

      // orderBy() will ensure that only ASC/DESC values are accepted, so we
      // don't need to sanitize that here.
      $this->orderBy($field, $ts['sort']);
    }
    return $this;
  }

  /**
   * Initialize the table sort context.
   */
  protected function init() {
    $ts = $this->order();
    $ts['sort'] = $this->getSort();
    $ts['query'] = $this->getQueryParameters();
    return $ts;
  }

  /**
   * Determine the current sort direction.
   *
   * @param $headers
   *   An array of column headers in the format described in theme_table().
   * @return
   *   The current sort direction ("asc" or "desc").
   */
  protected function getSort() {
    return tablesort_get_sort($this->header);
  }

  /**
   * Compose a URL query parameter array to append to table sorting requests.
   *
   * @return
   *   A URL query parameter array that consists of all components of the current
   *   page request except for those pertaining to table sorting.
   *
   * @see tablesort_get_query_parameters()
   */
  protected function getQueryParameters() {
    return tablesort_get_query_parameters();
  }

  /**
   * Determine the current sort criterion.
   *
   * @param $headers
   *   An array of column headers in the format described in theme_table().
   * @return
   *   An associative array describing the criterion, containing the keys:
   *   - "name": The localized title of the table column.
   *   - "sql": The name of the database field to sort on.
   */
  protected function order() {
    return tablesort_get_order($this->header);
  }
}
