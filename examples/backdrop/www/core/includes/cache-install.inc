<?php

/**
 * @file
 * Provides a stub cache implementation to be used during installation.
 */

/**
 * Defines a stub cache implementation to be used during installation.
 *
 * The stub implementation is needed when database access is not yet available.
 * Because Backdrop's caching system never requires that cached data be present,
 * these stub functions can short-circuit the process and sidestep the need for
 * any persistent storage. Obviously, using this cache implementation during
 * normal operations would have a negative impact on performance.
 */
class BackdropFakeCache extends BackdropDatabaseCache implements BackdropCacheInterface {

  /**
   * Overrides BackdropDatabaseCache::get().
   */
  function get($cid) {
    return FALSE;
  }

  /**
   * Overrides BackdropDatabaseCache::getMultiple().
   */
  function getMultiple(array &$cids) {
    return array();
  }

  /**
   * Overrides BackdropDatabaseCache::set().
   */
  function set($cid, $data, $expire = CACHE_PERMANENT) {
  }

  /**
   * Overrides BackdropDatabaseCache::delete().
   */
  function delete($cid) {
    try {
      if (class_exists('Database')) {
        parent::delete($cid);
      }
    }
    catch (Exception $e) {
    }
  }

  /**
   * Overrides BackdropDatabaseCache::deleteMultiple().
   */
  function deleteMultiple(array $cids) {
    try {
      if (class_exists('Database')) {
        parent::deleteMultiple($cids);
      }
    }
    catch (Exception $e) {
    }
  }

  /**
   * Overrides BackdropDatabaseCache::deletePrefix().
   */
  function deletePrefix($cid) {
    try {
      if (class_exists('Database')) {
        parent::deletePrefix($cid);
      }
    }
    catch (Exception $e) {
    }
  }

  /**
   * Overrides BackdropDatabaseCache::flush().
   */
  function flush() {
    try {
      if (class_exists('Database')) {
        parent::flush();
      }
    }
    catch (Exception $e) {
    }
  }

  /**
   * Overrides BackdropDatabaseCache::garbageCollection().
   */
  function garbageCollection() {
    try {
      if (class_exists('Database')) {
        parent::garbageCollection();
      }
    }
    catch (Exception $e) {
    }
  }

  /**
   * Overrides BackdropDatabaseCache::isEmpty().
   */
  function isEmpty() {
    return TRUE;
  }
}
