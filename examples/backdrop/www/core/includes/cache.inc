<?php

/**
 * @file
 * Functions and interfaces for cache handling.
 */

/**
 * Instantiates and statically caches the correct class for a cache bin.
 *
 * By default, this returns an instance of the BackdropDatabaseCache class.
 * Classes implementing BackdropCacheInterface can register themselves both as a
 * default implementation and for specific bins.
 *
 * @param $bin
 *   The cache bin for which the cache object should be returned, defaults to
 *   'cache'.
 *
 * @return BackdropCacheInterface
 *   The cache object associated with the specified bin.
 *
 * @see BackdropCacheInterface
 */
function cache($bin = 'cache') {
  // Temporary backwards compatibiltiy layer, allow old style prefixed cache
  // bin names to be passed as arguments.
  $bin = str_replace('cache_', '', $bin);

  // We do not use backdrop_static() here because we do not want to change the
  // storage of a cache bin mid-request.
  static $cache_objects;
  if (!isset($cache_objects[$bin])) {
    $class = settings_get('cache_class_' . $bin);
    if (!isset($class)) {
      $class = settings_get('cache_default_class', 'BackdropDatabaseCache');
    }
    $cache_objects[$bin] = new $class($bin);
  }
  return $cache_objects[$bin];
}

/**
 * Returns data from the persistent cache.
 *
 * Data may be stored as either plain text or as serialized data. cache_get()
 * will automatically return unserialized objects and arrays.
 *
 * @param string $cid
 *   The cache ID of the data to retrieve.
 * @param string $bin
 *   The cache bin from which data should be retrieved. Valid core values are
 *   "cache", "bootstrap", "field", "filter", "form", "menu", "page", "path",
 *   "update", "views", and "views_data". Bin names may include the prefix of
 *   "cache_", but it is stripped out before execution.
 *
 * @return
 *   The cache or FALSE on failure.
 */
function cache_get($cid, $bin = 'cache') {
  return cache($bin)->get($cid);
}

/**
 * Returns data from the persistent cache when given an array of cache IDs.
 *
 * @param $cids
 *   An array of cache IDs for the data to retrieve. This is passed by
 *   reference, and will have the IDs successfully returned from cache
 *   removed.
 * @param $bin
 *   The cache bin from which data should be retrieved. Valid core values are
 *   "cache", "bootstrap", "field", "filter", "form", "menu", "page", "path",
 *   "update", "views", and "views_data". Bin names may include the prefix of
 *   "cache_", but it is stripped out before execution
 *
 * @return
 *   An array of the items successfully returned from cache indexed by cid.
 */
function cache_get_multiple(array &$cids, $bin = 'cache') {
  return cache($bin)->getMultiple($cids);
}

/**
 * Stores data in the persistent cache.
 *
 * The persistent cache is split up into several cache bins. In the default
 * cache implementation, each cache bin corresponds to a database table by the
 * same name. Other implementations might want to store several bins in data
 * structures that get flushed together. While it is not a problem for most
 * cache bins if the entries in them are flushed before their expire time, some
 * might break functionality or are extremely expensive to recalculate. The
 * other bins are expired automatically by core. Contributed modules can add
 * additional bins and get them expired automatically by implementing
 * hook_flush_caches().
 *
 * The reasons for having several bins are as follows:
 * - Smaller bins mean smaller database tables and allow for faster selects and
 *   inserts.
 * - We try to put fast changing cache items and rather static ones into
 *   different bins. The effect is that only the fast changing bins will need a
 *   lot of writes to disk. The more static bins will also be better cacheable
 *   with MySQL's query cache.
 *
 * @param string $cid
 *   The cache ID of the data to store.
 * @param mixed $data
 *   The data to store in the cache. Complex data types will be automatically
 *   serialized before insertion. Strings will be stored as plain text and are
 *   not serialized.
 * @param string $bin
 *   The cache bin in which data should be stored. Valid core values are
 *   "cache", "bootstrap", "field", "filter", "form", "menu", "page", "path",
 *   "update", "views", and "views_data". Bin names may include the prefix of
 *   "cache_", but it is stripped out before execution
 * @param int $expire
 *   One of the following values:
 *   - CACHE_PERMANENT: Indicates that the item should never be removed unless
 *     explicitly told to using cache_clear_all() with a cache ID.
 *   - CACHE_TEMPORARY: Indicates that the item should be removed at the next
 *     general cache wipe.
 *   - A Unix timestamp: Indicates that the item should be kept at least until
 *     the given time, after which it behaves like CACHE_TEMPORARY.
 *
 * @see cache_get()
 */
function cache_set($cid, $data, $bin = 'cache', $expire = CACHE_PERMANENT) {
  return cache($bin)->set($cid, $data, $expire);
}

/**
 * Flushes all cache items in a bin.
 *
 * @param string $bin
 *   The bin whose data should be emptied.
 */
function cache_flush($bin) {
  return cache($bin)->flush();
}

/**
 * Clears data from the cache.
 *
 * If called with the arguments $cid and $bin set to NULL or omitted, then
 * expirable entries will be cleared from the page and layout bins, and the
 * $wildcard argument is ignored.
 *
 * @param string $cid
 *   The cache ID or an array of cache IDs. Otherwise, all cache entries that
 *   can expire are deleted.
 * @param string $bin
 *   The cache bin whose data should be cleared. Mandatory argument if $cid is
 *   set.
 * @param bool $wildcard
 *   If TRUE, the $cid argument must contain a string value and cache IDs
 *   starting with $cid are deleted in addition to the exact cache ID specified
 *   by $cid. If $wildcard is TRUE and $cid is '*', the entire cache is emptied.
 *
 *   The wildcard parameter is a legacy argument. If needing to do a full bin
 *   flush, use cache_flush() instead. Prefix-based flushes are also
 *   discouraged, as not all cache backends natively support wildcard
 *   functionality.
 *
 * @see cache_flush()
 */
function cache_clear_all($cid = NULL, $bin = NULL, $wildcard = FALSE) {
  // Default value cache flush.
  if (!isset($cid) && !isset($bin)) {
    if (module_exists('layout')) {
      cache('layout_path')->flush();
    }
    cache('page')->flush();
    return;
  }

  if (!$wildcard) {
    if (is_null($cid)) {
      cache($bin)->garbageCollection();
    }
    else {
      cache($bin)->delete($cid);
    }
  }
  else {
    if ($cid === '*') {
      cache($bin)->flush();
    }
    else {
      cache($bin)->deletePrefix($cid);
    }
  }
}

/**
 * Checks if a cache bin is empty.
 *
 * A cache bin is considered empty if it does not contain any valid data for any
 * cache ID.
 *
 * @param string $bin
 *   The cache bin to check.
 *
 * @return
 *   TRUE if the cache bin specified is empty.
 */
function cache_is_empty($bin) {
  return cache($bin)->isEmpty();
}

/**
 * Defines an interface for cache implementations.
 *
 * All cache implementations have to implement this interface.
 * BackdropDatabaseCache provides the default implementation, which can be
 * consulted as an example.
 *
 * To make Backdrop use your implementation for a certain cache bin, you have to
 * set a value in settings.php with the name of the cache bin as its key and the
 * name of your class as its value. For example, if your implementation of
 * BackdropCacheInterface was called MyCustomCache, the following line in
 * settings.php would make Backdrop use it for the 'cache_page' bin:
 * @code
 *  $settings['cache_class_cache_page'] = 'MyCustomCache';
 * @endcode
 *
 * Additionally, you can register your cache implementation to be used by
 * default for all cache bins by setting the $settings['cache_default_class'] to
 * the name of your implementation of the BackdropCacheInterface, e.g.
 * @code
 *  $settings['cache_default_class'] = 'MyCustomCache';
 * @endcode
 *
 * To implement a completely custom cache bin, use the same format:
 * @code
 *  $settings['cache_class_custom_bin'] = 'MyCustomCache';
 * @endcode
 * To access your custom cache bin, specify the name of the bin when storing
 * or retrieving cached data:
 * @code
 *  cache('custom_bin')->set($cid, $data, $expire);
 *  cache('custom_bin')->get($cid, 'custom_bin');
 * @endcode
 *
 * @see cache()
 * @see BackdropDatabaseCache
 */
interface BackdropCacheInterface {

  /**
   * Returns data from the persistent cache.
   *
   * Data may be stored as either plain text or as serialized data.
   * cache()->get() will automatically return unserialized objects and arrays.
   *
   * @param string $cid
   *   The cache ID of the data to retrieve.
   *
   * @return
   *   The cache or FALSE on failure.
   */
  function get($cid);

  /**
   * Returns data from the persistent cache when given an array of cache IDs.
   *
   * @param array $cids
   *   An array of cache IDs for the data to retrieve. This is passed by
   *   reference, and will have the IDs successfully returned from cache
   *   removed.
   *
   * @return
   *   An array of the items successfully returned from cache indexed by cid.
   */
   function getMultiple(array &$cids);

  /**
   * Stores data in the persistent cache.
   *
   * @param string $cid
   *   The cache ID of the data to store.
   * @param mixed $data
   *   The data to store in the cache. Complex data types will be automatically
   *   serialized before insertion. Strings will be stored as plain text and not
   *   serialized. Some storage engines only allow objects up to a maximum of
   *   1MB in size to be stored by default. When caching large arrays or
   *   similar, take care to ensure $data does not exceed this size.
   * @param int $expire
   *   (optional) One of the following values:
   *   - CACHE_PERMANENT: Indicates that the item should never be removed unless
   *     explicitly told to using cache_clear_all() with a cache ID.
   *   - CACHE_TEMPORARY: Indicates that the item should be removed at the next
   *     general cache wipe.
   *   - A Unix timestamp: Indicates that the item should be kept at least until
   *     the given time, after which it behaves like CACHE_TEMPORARY.
   */
  function set($cid, $data, $expire = CACHE_PERMANENT);

  /**
   * Deletes an item from the cache.
   *
   * @param string $cid
   *    The cache ID to delete.
   */
  function delete($cid);

  /**
   * Deletes multiple items from the cache.
   *
   * @param $cids
   *   An array of $cids to delete.
   */
  function deleteMultiple(Array $cids);

  /**
   * Deletes items from the cache using a wildcard prefix.
   *
   * @param string $prefix
   *   A wildcard prefix.
   */
  function deletePrefix($prefix);

  /**
   * Flushes all cache items in a bin.
   */
  function flush();

  /**
   * Performs garbage collection on a cache bin. Removing expired items.
   */
  function garbageCollection();

  /**
   * Checks if a cache bin is empty.
   *
   * A cache bin is considered empty if it does not contain any valid data for
   * any cache ID.
   *
   * @return
   *   TRUE if the cache bin specified is empty.
   */
  function isEmpty();
}

/**
 * Defines a stub cache implementation.
 *
 * The stub implementation is needed when database access is not yet available.
 * Because Backdrop's caching system never requires that cached data be present,
 * these stub functions can short-circuit the process and sidestep the need for
 * any persistent storage. Using this cache implementation during normal
 * operations would have a negative impact on performance.
 *
 * This also can be used for testing purposes.
 */
class BackdropNullCache implements BackdropCacheInterface {

  /**
   * Constructs a BackdropNullCache object.
   *
   * @param $bin
   *   The cache bin for which the object is created.
   */
  function __construct($bin) {}

  /**
   * Implements BackdropCacheInterface::get().
   */
  function get($cid) {
    return FALSE;
  }

  /**
   * Implements BackdropCacheInterface::getMultiple().
   */
  function getMultiple(array &$cids) {
    return array();
  }

  /**
   * Implements BackdropCacheInterface::set().
   */
  function set($cid, $data, $expire = CACHE_PERMANENT) {}

  /**
   * Implements BackdropCacheInterface::delete().
   */
  function delete($cid) {}

  /**
   * Implements BackdropCacheInterface::deleteMultiple().
   */
  function deleteMultiple(array $cids) {}

  /**
   * Implements BackdropCacheInterface::deletePrefix().
   */
  function deletePrefix($prefix) {}

  /**
   * Implements BackdropCacheInterface::flush().
   */
  function flush() {}

  /**
   * Implements BackdropCacheInterface::expire().
   */
  function expire() {}

  /**
   * Implements BackdropCacheInterface::garbageCollection().
   */
  function garbageCollection() {}

  /**
   * Implements BackdropCacheInterface::isEmpty().
   */
  function isEmpty() {
    return TRUE;
  }
}

/**
 * Defines a default cache implementation.
 *
 * This is Backdrop's default cache implementation. It uses the database to store
 * cached data. Each cache bin corresponds to a database table by the same name.
 */
class BackdropDatabaseCache implements BackdropCacheInterface {
  protected $bin;

  /**
   * Constructs a new BackdropDatabaseCache object.
   */
  function __construct($bin) {
    // All cache tables should be prefixed with 'cache_', except for the
    // default 'cache' bin.
    if ($bin != 'cache') {
      $bin = 'cache_' . $bin;
    }
    $this->bin = $bin;

    // Bootstrap the database if it is not yet available.
    if (!function_exists('db_query') || backdrop_get_bootstrap_phase() < BACKDROP_BOOTSTRAP_DATABASE) {
      backdrop_bootstrap(BACKDROP_BOOTSTRAP_DATABASE, FALSE);
    }
  }

  /**
   * Implements BackdropCacheInterface::get().
   */
  function get($cid) {
    $cids = array($cid);
    $cache = $this->getMultiple($cids);
    return reset($cache);
  }

  /**
   * Implements BackdropCacheInterface::getMultiple().
   */
  function getMultiple(array &$cids) {
    try {
      // When serving cached pages, the overhead of using db_select() was found
      // to add around 30% overhead to the request. Since $this->bin is a
      // variable, this means the call to db_query() here uses a concatenated
      // string. This is highly discouraged under any other circumstances, and
      // is used here only due to the performance overhead we would incur
      // otherwise. When serving an uncached page, the overhead of using
      // db_select() is a much smaller proportion of the request.
      $result = db_query('SELECT cid, data, created, expire, serialized FROM {' . db_escape_table($this->bin) . '} WHERE cid IN (:cids)', array(':cids' => $cids));
      $cache = array();
      foreach ($result as $item) {
        $item = $this->prepareItem($item);
        if ($item) {
          $cache[$item->cid] = $item;
        }
      }
      $cids = array_diff($cids, array_keys($cache));
      return $cache;
    }
    catch (Exception $e) {
      // If the database is never going to be available, cache requests should
      // return FALSE in order to allow exception handling to occur.
      return array();
    }
  }

  /**
   * Prepares a cached item.
   *
   * Checks that items are either permanent or did not expire, and unserializes
   * data as appropriate.
   *
   * @param $cache
   *   An item loaded from BackdropCacheInterface::get() or BackdropCacheInterface::getMultiple().
   *
   * @return stdClass|FALSE
   *   The item with data unserialized as appropriate or FALSE if there is no
   *   valid item to load.
   */
  protected function prepareItem($cache) {
    if (!isset($cache->data)) {
      return FALSE;
    }

    if ($cache->serialized) {
      $cache->data = unserialize($cache->data);
    }

    return $cache;
  }

  /**
   * Implements BackdropCacheInterface::set().
   */
  function set($cid, $data, $expire = CACHE_PERMANENT) {
    $fields = array(
      'serialized' => 0,
      'created' => REQUEST_TIME,
      'expire' => $expire,
    );
    if (!is_string($data)) {
      $fields['data'] = serialize($data);
      $fields['serialized'] = 1;
    }
    else {
      $fields['data'] = $data;
      $fields['serialized'] = 0;
    }

    try {
      db_merge($this->bin)
        ->key(array('cid' => $cid))
        ->fields($fields)
        ->execute();
    }
    catch (Exception $e) {
      // The database may not be available, so we'll ignore these calls.
    }
  }

  /**
   * Implements BackdropCacheInterface::delete().
   */
  function delete($cid) {
    db_delete($this->bin)
      ->condition('cid', $cid)
      ->execute();
  }

  /**
 * Implements BackdropCacheInterface::deleteMultiple().
 */
  function deleteMultiple(array $cids) {
    // Delete in chunks when a large array is passed.
    do {
      db_delete($this->bin)
        ->condition('cid', array_splice($cids, 0, 1000), 'IN')
        ->execute();
    }
    while (count($cids));
  }

  /**
   * Implements BackdropCacheInterface::deletePrefix().
   */
  function deletePrefix($prefix) {
    db_delete($this->bin)
      ->condition('cid', db_like($prefix) . '%', 'LIKE')
      ->execute();
  }

  /**
   * Implements BackdropCacheInterface::flush().
   */
  function flush() {
    db_truncate($this->bin)->execute();
  }

  /**
   * Implements BackdropCacheInterface::garbageCollection().
   */
  function garbageCollection() {
    db_delete($this->bin)
      ->condition('expire', CACHE_PERMANENT, '<>')
      ->condition('expire', REQUEST_TIME, '<')
      ->execute();
  }

  /**
   * Implements BackdropCacheInterface::isEmpty().
   */
  function isEmpty() {
    $this->garbageCollection();
    $query = db_select($this->bin);
    $query->addExpression('1');
    $result = $query->range(0, 1)
      ->execute()
      ->fetchField();
    return empty($result);
  }
}
