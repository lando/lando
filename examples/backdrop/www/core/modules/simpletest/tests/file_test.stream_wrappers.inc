<?php
/**
 * @file
 * Stream wrapper classes used in testing.
 */

/**
 * Helper class for testing the stream wrapper registry.
 *
 * Dummy stream wrapper implementation (dummy://).
 */
class BackdropDummyStreamWrapper extends BackdropLocalStreamWrapper {
  function getDirectoryPath() {
    return 'files';
  }

  /**
   * Override getInternalUri().
   *
   * Return a dummy path for testing.
   */
  function getInternalUri() {
    return '/dummy/example.txt';
  }

  /**
   * Override getExternalUrl().
   *
   * Return the HTML URI of a public file.
   */
  function getExternalUrl() {
    return '/dummy/example.txt';
  }
}

/**
 * Helper class for testing the stream wrapper registry.
 *
 * Dummy remote stream wrapper implementation (dummy-remote://).
 *
 * Basically just the public scheme but not returning a local file for realpath.
 */
class BackdropDummyRemoteStreamWrapper extends BackdropPublicStreamWrapper {
  function realpath() {
    return FALSE;
  }
}
