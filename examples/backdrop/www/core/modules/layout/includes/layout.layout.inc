<?php
/**
 * @file
 * Contains hook implementations Layout module provides for itself.
 */

/**
 * Implements hook_layout_context_info().
 */
function layout_layout_context_info() {
  $info['node'] = array(
    'title' => t('Node'),
    // Define the class which is used to handle this context.
    'class' => 'EntityLayoutContext',
    // Define menu paths where the node ID is a "known" context.
    'menu paths' => array(
      'node/%node',
      'node/%node/view',
    ),
    // Given the menu paths defined above, identify the part of the path that
    // is needed to generate this context.
    'path placeholder' => '%node',

    // Given an argument, the callback that will be responsible for loading the
    // main context data.
    'load callback' => 'node_load',
  );
  $info['user'] = array(
    'title' => t('User'),
    'class' => 'EntityLayoutContext',
    'menu paths' => array(
      'user/%user',
      'user/%user/view',
    ),
    'path placeholder' => '%user',
    'load callback' => 'user_load',
  );
  $info['taxonomy_term'] = array(
    'title' => t('Term'),
    'class' => 'EntityLayoutContext',
    'menu paths' => array(
      'taxonomy/term/%term',
      'taxonomy/term/%term/view',
    ),
    'path placeholder' => '%term',
    'load callback' => 'taxonomy_term_load',
  );
  $info['overrides_path'] = array(
    'title' => t('Overrides path'),
    'description' => t('Layout overrides existing path provided by another module.'),
    'class' => 'LayoutOverridesPathContext',
    'path placeholder' => NULL,
    'menu paths' => array(),
    'hidden' => TRUE,
  );
  $info['string'] = array(
    'title' => t('String pass-through'),
    'class' => 'LayoutStringContext',
    'path placeholder' => NULL,
    'menu paths' => array(),
  );
  return $info;
}

/**
 * Implements hook_layout_access_info().
 */
function layout_layout_access_info() {
  $entity_types = entity_get_info();

  // Provide type-specific plugins for each entity type.
  foreach ($entity_types as $entity_type => $entity_info) {

    // Create a key such as "node_type" or "comment_node_type".
    // Skip users, which don't support multiple types.
    if (!empty($entity_info['entity keys']['bundle'])) {
      $key = $entity_type . '_' . $entity_info['entity keys']['bundle'];
      $bundle_label = array_key_exists('bundle label', $entity_info) ? $entity_info['bundle label'] : 'Type';
      $info[$key] = array(
        'title' => t('@entity: @bundle', array('@entity' => $entity_info['label'], '@bundle' => $bundle_label)),
        'description' => t('Control access by @entity_type @bundle_label.', array('@entity_type' => $entity_type, '@bundle_label' => backdrop_strtolower($bundle_label))),
        'entity_type' => $entity_type,
        'class' => 'EntityBundleLayoutAccess',
        'required contexts' => array(
          $entity_type => $entity_type,
        ),
      );
    }

    // Create a entity id key such as "nid" or "cid".
    $key = $entity_type . '_' . $entity_info['entity keys']['id'];
    $key_label = strtoupper($entity_info['entity keys']['id']);
    $info[$key] = array(
      'title' => t('@entity: @entity_id_key', array('@entity' => $entity_info['label'], '@entity_id_key' => $key_label)),
      'description' => t('Control access by @entity_type @entity_id_key.', array('@entity_type' => $entity_type, '@entity_id_key' => $key_label)),
      'entity_type' => $entity_type,
      'class' => 'EntityIDLayoutAccess',
      'required contexts' => array(
        $entity_type => $entity_type,
      ),
    );
  }

  $info['front'] = array(
    'title' => t('Front page'),
    'description' => t('Is this the front page.'),
    'class' => 'FrontLayoutAccess',
  );
  $info['language'] = array(
    'title' => t('Site language'),
    'description' => t('Control access by the currently active interface language.'),
    'class' => 'LanguageLayoutAccess',
  );
  $info['user_permission'] = array(
    'title' => t('User: Permission'),
    'description' => t('Control access by permission string.'),
    'class' => 'UserPermissionLayoutAccess',
    'required contexts' => array(
      'user' => 'user',
    ),
  );
  $info['user_role'] = array(
    'title' => t('User: Role'),
    'description' => t('Control access by role.'),
    'class' => 'UserRoleLayoutAccess',
    // Contexts are specified as context key => context type. The key will be
    // used in the $contexts array passed to the access class methods. The type
    // references a context provided by hook_layout_context_info().
    'required contexts' => array(
      'user' => 'user',
    ),
    // Optional if needing to clarify between contexts of the same type.
    'required contexts labels' => array(
      'user' => t('User'),
    ),
  );
  $info['path'] = array(
    'title' => t('URL path'),
    'description' => t('Control access by the current path.'),
    'class' => 'PathLayoutAccess',
  );
  return $info;
}

/**
 * Implements hook_layout_renderer_info().
 */
function layout_layout_renderer_info() {
  $info['broken'] = array(
    'class' => 'LayoutRendererBroken',
  );
  $info['editor'] = array(
    'class' => 'LayoutRendererEditor',
  );
  $info['standard'] = array(
    'class' => 'LayoutRendererStandard',
  );
  return $info;
}

/**
 * Implements hook_layout_style_info().
 */
function layout_layout_style_info() {
  $info['default'] = array(
    'title' => t('Default'),
    'description' => t('The default block rendering style with predictable tags provided by the site template.'),
    'block theme' => 'block',
    'class' => 'LayoutStyle',
    'template' => 'templates/block',
    'file' => 'layout.theme.inc',
  );
  $info['dynamic'] = array(
    'title' => t('Dynamic'),
    'description' => t('Customizable rendering style in which every HTML tag can be configured.'),
    'block theme' => 'block_dynamic',
    'class' => 'LayoutStyleDynamic',
    'template' => 'templates/block-dynamic',
    'file' => 'layout.theme.inc',
  );
  return $info;
}
