<?php

/**
 * @file
 * Load Views' data so that it knows what is available to build queries from.
 */

/**
 * Fetch Views' data from the cache
 *
 * @param $move
 *   Under certain circumstances it makes sense to not get the moved table, but the old one.
 *   One example is views_get_handler.
 */
function _views_fetch_data($table = NULL, $move = TRUE, $reset = FALSE) {
  $cache = &backdrop_static(__FUNCTION__ . '_cache');
  $recursion_protection = &backdrop_static(__FUNCTION__ . '_recursion_protected');
  $fully_loaded = &backdrop_static(__FUNCTION__ . '_fully_loaded');
  if ($reset) {
    $cache = NULL;
    $fully_loaded = FALSE;
  }
  if ($table) {
    if (!isset($cache[$table])) {
      $cid = 'views_data:' . $table;
      if ($data = views_cache_get($cid, TRUE)) {
        $cache[$table] = $data->data;
      }
      else {
        if (!$fully_loaded) {
          // Try to load the full views cache.
          if ($data = views_cache_get('views_data', TRUE)) {
            $cache = $data->data;
          }
          else {
            // No cache entry, rebuild.
            $cache = _views_fetch_data_build();
          }
          $fully_loaded = TRUE;
        }

        // Write back a cache for this table.
        if (isset($cache[$table])) {
          views_cache_set($cid, $cache[$table], TRUE);
        }
        else {
          // If there is still no information about that table, it is missing.
          // Write an empty array to avoid repeated rebuilds.
          views_cache_set($cid, array(), TRUE);
        }
      }
    }
    if (isset($cache[$table])) {
      if (isset($cache[$table]['moved to']) && $move) {
        $moved_table = $cache[$table]['moved to'];
        if (!empty($recursion_protection[$table])) {
          // recursion detected!
          return NULL;
        }
        $recursion_protection[$table] = TRUE;
        $data = _views_fetch_data($moved_table);
        $recursion_protection = array();
        return $data;
      }
      return $cache[$table];
    }
  }
  else {
    if (!$fully_loaded) {
      $data = views_cache_get('views_data', TRUE);
      if (!empty($data->data)) {
        $cache = $data->data;
      }

      if (empty($cache)) {
        $cache = _views_fetch_data_build();
      }
      $fully_loaded = TRUE;
    }
    return $cache;
  }
  // Return an empty array if there is no match.
  return array();
}

/**
 * Build and set the views data cache if empty.
 */
function _views_fetch_data_build() {
  views_include_handlers();
  $cache = module_invoke_all('views_data');
  foreach (module_implements('views_data_alter') as $module) {
    $function = $module . '_views_data_alter';
    $function($cache);
  }
  _views_data_process_entity_types($cache);

  // Keep a record with all data.
  views_cache_set('views_data', $cache, TRUE);
  return $cache;
}

/**
 * Links tables having an 'entity type' specified to the respective generic entity-type tables.
 */
function _views_data_process_entity_types(&$data) {
  foreach ($data as $table_name => $table_info) {
    // Add in a join from the entity-table if an entity-type is given.
    if (!empty($table_info['table']['entity type'])) {
      $entity_table = 'views_entity_' . $table_info['table']['entity type'];

      $data[$entity_table]['table']['join'][$table_name] = array(
        'left_table' => $table_name,
      );
      $data[$entity_table]['table']['entity type'] = $table_info['table']['entity type'];
      // Copy over the default table group if we have none yet.
      if (!empty($table_info['table']['group']) && empty($data[$entity_table]['table']['group'])) {
        $data[$entity_table]['table']['group'] = $table_info['table']['group'];
      }
    }
  }
}

/**
 * Fetch the plugin data from cache.
 */
function _views_fetch_plugin_data($type = NULL, $plugin = NULL, $reset = FALSE) {
  static $cache = NULL;
  if (!isset($cache) || $reset) {
    views_include_handlers();
    $cache = views_discover_plugins();
  }

  if (!$type && !$plugin) {
    return $cache;
  }
  elseif (!$plugin) {
    // Not in the if above so the else below won't run
    if (isset($cache[$type])) {
      return $cache[$type];
    }
  }
  elseif (isset($cache[$type][$plugin])) {
    return $cache[$type][$plugin];
  }

  // Return an empty array if there is no match.
  return array();
}

/**
 * Set a cached item in the views cache.
 *
 * This is just a convenience wrapper around cache_set().
 *
 * @param $cid
 *   The cache ID of the data to store.
 * @param $data
 *   The data to store in the cache. Complex data types will be automatically serialized before insertion.
 *   Strings will be stored as plain text and not serialized.
 * @param $use_language
 *   If TRUE, the data will be cached specific to the currently active language.
 */
function views_cache_set($cid, $data, $use_language = FALSE) {
  if ($use_language) {
    $cid .= ':' . $GLOBALS[LANGUAGE_TYPE_INTERFACE]->langcode;
  }

  cache('views')->set($cid, $data);
}

/**
 * Return data from the persistent views cache.
 *
 * This is just a convenience wrapper around cache_get().
 *
 * @param int $cid
 *   The cache ID of the data to retrieve.
 * @param bool $use_language
 *   If TRUE, the data will be requested specific to the currently active language.
 *
 * @return stdClass|bool
 *   The cache or FALSE on failure.
 */
function views_cache_get($cid, $use_language = FALSE) {
  if ($use_language) {
    $cid .= ':' . $GLOBALS[LANGUAGE_TYPE_INTERFACE]->langcode;
  }

  return cache('views')->get($cid);
}
