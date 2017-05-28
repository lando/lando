<?php
/**
 * @file
 * Exceptions used by the Layout module.
 */

/**
 * General exceptions thrown by Layout module.
 */
class LayoutException extends Exception {}

/**
 * Exceptions thrown while attempting to save a layout.
 */
class LayoutSaveException extends LayoutException {}

/**
 * Exceptions thrown when a layout cannot be loaded.
 */
class LayoutMissingException extends LayoutException {}
