<?php
/**
 * @file
 * Exceptions classes for Field module.
 */

/**
 * Base class for all exceptions thrown by Field API functions.
 *
 * This class has no functionality of its own other than allowing all
 * Field API exceptions to be caught by a single catch block.
 */
class FieldException extends Exception {}

/**
 * Exception class thrown by hook_field_update_forbid().
 */
class FieldUpdateForbiddenException extends FieldException {}

/**
 * Exception thrown by field_attach_validate() on field validation errors.
 */
class FieldValidationException extends FieldException {
  var $errors;

  /**
   * Constructor for FieldValidationException.
   *
   * @param $errors
   *   An array of field validation errors, keyed by field name and
   *   delta that contains two keys:
   *   - 'error': A machine-readable error code string, prefixed by
   *     the field module name. A field widget may use this code to decide
   *     how to report the error.
   *   - 'message': A human-readable error message such as to be
   *     passed to form_error() for the appropriate form element.
   */
  function __construct($errors) {
    $this->errors = $errors;
    parent::__construct(t('Field validation errors'));
  }
}
