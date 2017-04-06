<?php
/**
 * Character set converter for database tables.
 *
 * This class is used to upgrade tables from "utf8" character set encoding to
 * "utf8mb4" encoding. This allows for uses of 4 byte characters such as
 * emoji and mathematical symbols.
 *
 * In Backdrop this conversion may be done through UI at
 * admin/config/development/utf8mb4-upgrade. More information about this upgrade
 * can be found in the Backdrop documentation on database configuration:
 * https://api.backdropcms.org/database-configuration
 *
 * Although this class is used within Backdrop purely for the utf8mb4 upgrade,
 * it is a general purpose converter and could be used for other purposes in
 * custom scripts or command-line tools.
 *
 * Based on utf8mb4_convert https://www.drupal.org/project/utf8mb4_convert by
 * joelpittet and stefan.r.
 *
 * @see system_utf8mb4_convert_form()
 * @see _system_utf8mb4_convert_batch()
 */
class DatabaseCharsetConverter {

  /**
   * Default character set to which data should be converted.
   *
   * @var string
   */
  protected $charset = 'utf8mb4';

  /**
   * Default collation to which data should be converted.
   *
   * @var string
   */
  protected $collation = 'utf8mb4_general_ci';

  /**
   * The current connection for all operations.
   *
   * @var DatabaseConnection
   */
  protected $connection;

  /**
   * DatabaseCharsetConverter constructor.
   *
   * @param string $charset
   *   (Optional) The charcter set to be used. Defaults to "utf8mb4".
   * @param string $collation
   *   (Optional) The collation to be used. Defaults to "utf8mb4_general_ci".
   */
  public function __construct($charset = NULL, $collation = NULL) {
    if ($charset) {
      $this->charset = $charset;
    }
    if ($collation) {
      $this->collation = $collation;
    }

    // Default to the default connection.
    $this->connection = Database::getConnection();
  }

  /**
   * Set the active connection for all operations.
   */
  function setConnection(DatabaseConnection $connection) {
    $this->connection = $connection;
  }

  /**
   * Convert the MySQL Backdrop databases character set and collation.
   *
   * @param array $databases
   *   The Backdrop database info array.
   *
   * @throws Exception
   * @throws PDOException
   */
  public function convertAllDatabases(array $databases) {
    $success = FALSE;
    foreach ($databases as $database_key => $database_values) {
      foreach ($database_values as $target => $database) {
        // Do not update slave databases, they will have changes replicated
        // to them automatically. Only update mysql/mysqli-based connections.
        if ($target === 'slave' || !isset($database['driver']) || strpos($database['driver'], 'mysql') !== 0) {
          continue;
        }

        // Connect to next database.
        $connection = Database::getConnection($target, $database_key);
        if ($this->charset == 'utf8mb4' && !$connection->utf8mb4IsSupported()) {
          // Intentionally no translation here in the event this is used
          // outside a full Backdrop bootstrap (e.g. a command line tool).
          throw new Exception('The ' . $database_key . ':' . $target . ' MySQL database does not support UTF8MB4! Ensure that the conditions listed in settings.php related to innodb_large_prefix, the server version, and the MySQL driver version are met. See http://api.backdropcms.org/database-configuration for more information.');
          continue;
        }
        // For each database:
        $this->setConnection($connection);
        $this->convertDatabase($database['database']);

        // Build the list of tables to convert.
        $like = '';
        if ($database['prefix']) {
          $like = ' LIKE "' . $database['prefix'] . '%"';
        }
        $tables = $connection->query('SHOW TABLES' . $like)->fetchAllKeyed();
        $this->convertTables($tables);

        $success = TRUE;
      }
    }
    return $success;
  }

  /**
   * Convert the database charset and collation, but not the tables within it.
   *
   * @param string
   *   Database name.
   * @param string $charset
   *   (Optional) The character set. Defaults to the constructor value.
   * @param string $collation
   *   (Optional) The collation. Defaults to the constructor value.
   *
   * @return bool
   *   TRUE if the database is converted successfully, FALSE on failure.
   *
   * @throws PDOException
   */
  public function convertDatabase($database_name, $charset = NULL, $collation = NULL) {
    $sql = "ALTER DATABASE `$database_name` CHARACTER SET = :charset COLLATE = :collation;";
    return $this->connection->query($sql, array(
      ':charset' => $charset ?: $this->charset,
      ':collation' => $collation ?: $this->collation,
    ));
  }

  /**
   * Converts all the tables defined by backdrop_get_schema().
   *
   * @param array $table_names
   *   A list of table names to convert. These should be actual table names
   *   in the database, with any table prefixes already prepended.
   * @param string $charset
   *   (Optional) The character set. Defaults to the constructor value.
   * @param string $collation
   *   (Optional) The collation. Defaults to the constructor value.
   *
   * @throws PDOException
   */
  public function convertTables($table_names, $charset = NULL, $collation = NULL) {
    foreach ($table_names as $table_name) {
      if (!$this->connection->schema()->tableExists($table_name)) {
        continue;
      }
      $this->convertTable($table_name, $charset, $collation);
    }
  }

  /**
   * Converts a table to a desired character set and collation.
   *
   * @param string $table_name
   *   The table name to convert. This should be the actual table name
   *   in the database, with any table prefix already prepended.
   * @param string $charset
   *   (Optional) The character set. Defaults to the constructor value.
   * @param string $collation
   *   (Optional) The collation. Defaults to the constructor value.
   *
   * @return bool
   *   TRUE if the table is converted successfully, FALSE on failure.
   *
   * @throws PDOException
   */
  public function convertTable($table_name, $charset = NULL, $collation = NULL) {
    $this->connection->query("ALTER TABLE `$table_name` ROW_FORMAT=DYNAMIC ENGINE=INNODB");
    $sql = "ALTER TABLE `$table_name` CHARACTER SET = :charset COLLATE = :collation";
    $result = $this->connection->query($sql, array(
      ':charset' => $charset ?: $this->charset,
      ':collation' => $collation ?: $this->collation,
    ));
    if ($result) {
      $result = $this->convertTableFields($table_name, $charset, $collation);
      $this->connection->query("OPTIMIZE TABLE `$table_name`");
    }
    return $result;
  }

  /**
   * Converts a table's field to a desired character set and collation.
   *
   * @param string $table_name
   *   The table name to convert. This should be the actual table name
   *   in the database, with any table prefix already prepended.
   *   (Optional) The character set. Defaults to the constructor value.
   * @param string $collation
   *   (Optional) The collation. Defaults to the constructor value.
   *
   * @return bool
   *   TRUE if the table fields are converted successfully, FALSE on failure.
   *
   * @throws PDOException
   */
  public function convertTableFields($table_name, $charset = NULL, $collation = NULL) {
    $return = TRUE;
    $results = $this->connection->query("SHOW FULL FIELDS FROM `$table_name`")->fetchAllAssoc('Field');
    $charset = $charset ?: $this->charset;
    $collation = $collation ?: $this->collation;
    foreach ($results as $row) {
      // Skip fields that don't have collation, as they are probably int or similar.
      // or if we are using that collation for this field already save a query
      // or is not binary.
      if (!$row->Collation || $row->Collation === $collation || strpos($row->Collation, '_bin') !== FALSE) {
        continue;
      }
      $default = '';
      if ($row->Default !== NULL) {
        $default = 'DEFAULT ' . ($row->Default == "CURRENT_TIMESTAMP" ? "CURRENT_TIMESTAMP" : ":default");
      }
      elseif ($row->Null == 'YES' && $row->Key == '') {
        if ($row->Type == 'timestamp') {
          $default = 'NULL ';
        }
        $default .= 'DEFAULT NULL';
      }

      $sql = "ALTER TABLE `$table_name`
              MODIFY `" . $row->Field . "` " .
        $row->Type . " " .
        "CHARACTER SET :charset COLLATE :collation " .
        ($row->Null == "YES" ? "" : "NOT NULL ") .
        $default . " " .
        $row->Extra . " " .
        "COMMENT :comment";

      $params = array(
        ':charset' => $charset,
        ':collation' => $collation,
        ':comment' => $row->Comment,
      );
      if (strstr($default, ':default')) {
        $params[':default'] = $row->Default;
      }
      $result = $this->connection->query($sql, $params);
      if (!$result) {
        $return = FALSE;
      }
    }
    return $return;
  }
}
