<?php
/**
 * @file
 * Hooks provided by the Path module.
 *
 * Path module provides automatic path aliasing by using tokens in path
 * patterns. Thus the simplest integration is just to provide tokens using
 * hook_token_info() and hook_tokens().
 *
 * If you wish to provide automatic path creation for custom paths provided by
 * your module, there are a few steps involved.
 *
 * 1. hook_path_info()
 *    Provide information required by Path for the settings form as well as
 *    bulk generation. See the documentation for hook_path_info() for more
 *    details.
 *
 * 2. path_generate_entity_alias()
 *    At the appropriate time (usually when a new item is being created for
 *    which a generated alias is desired), call path_generate_entity_alias()
 *    with the appropriate parameters to generate the alias. Then save the
 *    alias with path_save_automatic_alias(). See the user, taxonomy, and node
 *    hook implementations for examples.
 *
 * 3. path_delete_all_by_source()
 *    At the appropriate time (usually when an item is being deleted), call
 *    path_delete_all_by_source() to remove any aliases that were created for the
 *    content being removed. See the documentation for path_delete_all_by_source() for
 *    more details.
 *
 * There are other integration points with Path module, namely alter hooks that
 * allow you to change the data used by Path at various points in the
 * process. See the below hook documentation for details.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Respond to a path being inserted.
 *
 * @param $path
 *   An associative array containing the following keys:
 *   - source: The internal system path.
 *   - alias: The URL alias.
 *   - pid: Unique path alias identifier.
 *   - langcode: The language code of the alias.
 *
 * @see path_save()
 */
function hook_path_insert($path) {
  db_insert('mytable')
    ->fields(array(
      'alias' => $path['alias'],
      'pid' => $path['pid'],
    ))
    ->execute();
}

/**
 * Respond to a path being updated.
 *
 * @param $path
 *   An associative array containing the following keys:
 *   - source: The internal system path.
 *   - alias: The URL alias.
 *   - pid: Unique path alias identifier.
 *   - langcode: The language code of the alias.
 *
 * @see path_save()
 */
function hook_path_update($path) {
  db_update('mytable')
    ->fields(array('alias' => $path['alias']))
    ->condition('pid', $path['pid'])
    ->execute();
}

/**
 * Respond to a path being deleted.
 *
 * @param $path
 *   An associative array containing the following keys:
 *   - source: The internal system path.
 *   - alias: The URL alias.
 *   - pid: Unique path alias identifier.
 *   - langcode: The language code of the alias.
 *
 * @see path_delete()
 */
function hook_path_delete($path) {
  db_delete('mytable')
    ->condition('pid', $path['pid'])
    ->execute();
}

/**
 * @} End of "addtogroup hooks".
 */

/**
 * Provide information about the way your module's aliases will be built.
 *
 * The information you provide here is used to build the form
 * on search/path/patterns
 *
 * @return array
 *   A 2-level array of automatic path settings. Each item should have a unique
 *   key (often the name of the providing module). Each sub-array should contain
 *   the following:
 *   - entity type: The type of entity on which patterns will be created. All
 *       entities of this type will have a "path" property added to their
 *       objects upon loading.
 *   - label: Translated label for the settings group.
 *   - pattern description: The translated label for the default URL alias
 *       pattern (e.g. t('Default path pattern (applies to all content types
 *       with blank patterns)')
 *   - pattern default: Default URL alias pattern (e.g. 'content/[node:title]')
 *   - type delete callback: The name of the function that should be run for
 *       bulk deletion of entity bundle types.
 *       See node_path_type_delete_callback() for an example.
 *   - batch update callback: The name of function that should be ran for
 *       bulk update. See node_path_bulk_update_batch_process() for an example.
 *   - batch file: The name of the file with the bulk update function.
 *   - source prefix: The prefix for source URLs generated for this type of
 *       path (e.g nodes have a source prefix of "node/" and taxonomy terms have
 *       a prefix of "taxonomy/term/". This is used when bulk deleting paths.
 *   - pattern items: Optional. An array of descriptions keyed by bundles.
 *
 * @see path_get_info()
 * @see path_entity_load()
 * @see path_entity_insert()
 * @see path_entity_update()
 * @see path_entity_delete()
 */
function hook_path_info() {
  // Aliases on files are not normally supported, this would add support for
  // auto-aliasing files.
  $info['file'] = array(
    'entity type' => 'file',
    'label' => t('File paths'),
    'pattern description' => t('Default path pattern (applies to all file types with blank patterns below)'),
    'pattern default' => 'files/[file:name]',
    'type delete callback' => 'node_path_type_delete_callback',
    'batch update callback' => 'file_entity_path_bulk_update_batch_process',
    'batch file' => 'file.path.inc',
  );

  foreach (file_type_get_enabled_types() as $file_type => $type) {
    $info['file']['pattern items'][$file_type] = t('Pattern for all @file_type paths.', array('@file_type' => $type->label));
  }
  return $info;
}

/**
 * Determine if a possible URL alias would conflict with any existing paths.
 *
 * Returning TRUE from this function will trigger path_alias_uniquify() to
 * generate a similar URL alias with a suffix to avoid conflicts.
 *
 * @param string $alias
 *   The potential URL alias.
 * @param string $source
 *   The source path for the alias (e.g. 'node/1').
 * @param string $langcode
 *   The language code for the alias (e.g. 'en').
 *
 * @return bool
 *   TRUE if $alias conflicts with an existing, reserved path, or FALSE/NULL if
 *   it does not match any reserved paths.
 *
 * @see path_alias_uniquify()
 */
function hook_path_is_alias_reserved($alias, $source, $langcode) {
  // Check our module's list of paths and return TRUE if $alias matches any of
  // them.
  return (bool) db_query("SELECT 1 FROM {mytable} WHERE path = :path", array(':path' => $alias))->fetchField();
}

/**
 * Alter the pattern to be used before an alias is generated.
 *
 * @param string $pattern
 *   The alias pattern to pass to token_replace() to generate the URL alias.
 * @param array $context
 *   An associative array with additional information, containing:
 *   - entity: The entity for which a pattern is being created.
 *   - source: A string of the source path for the alias (e.g. 'node/1').
 *   - langcode: A string of the language code for the alias (e.g. 'en').
 */
function hook_path_pattern_alter(&$pattern, array &$context) {
  // Switch out any [node:created:*] tokens with [node:updated:*] on update.
  $entity = $context['entity'];
  if ($entity->entityType() == 'node' && !$entity->isNew()) {
    $pattern = preg_replace('/\[node:created(\:[^]]*)?\]/', '[node:updated$1]', $pattern);
  }
}

/**
 * Alter generated aliases before saving.
 *
 * @param string $alias
 *   The automatic alias after token replacement and strings cleaned.
 * @param array $context
 *   An associative array with additional information, containing:
 *   - entity: The entity for which a pattern is being created.
 *   - source: A string of the source path for the alias (e.g. 'node/1').
 *   - langcode: A string of the language code for the alias (e.g. 'en').
 */
function hook_path_alias_alter(&$alias, array &$context) {
  // Add a suffix so that all aliases get saved as 'content/my-title.html'
  $alias .= '.html';

  // Force all aliases to be saved as language neutral.
  $context['langcode'] = LANGUAGE_NONE;
}

/**
 * Alter the list of punctuation characters used by Path module.
 *
 * @param $punctuation
 *   An array of punctuation used during replacement keyed by punctuation name.
 *   Each punctuation record should be an array with the following key/value
 *   pairs:
 *   - value: The raw value of the punctuation mark.
 *   - name: The human-readable name of the punctuation mark. This must be
 *     translated using t() already.
 */
function hook_path_punctuation_chars_alter(array &$punctuation) {
  // Add the trademark symbol.
  $punctuation['trademark'] = array('value' => '™', 'name' => t('Trademark symbol'));

  // Remove the dollar sign.
  unset($punctuation['dollar']);
}
