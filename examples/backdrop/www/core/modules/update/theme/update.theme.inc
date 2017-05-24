<?php
/**
 * @file
 * Theme functions for the Update module.
 */

/**
 * Returns HTML for the first page in the process of updating projects.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_update_manager_update_form($variables) {
  $form = $variables['form'];
  $last = state_get('update_last_check', 0);
  $output = theme('update_last_check', array('last' => $last));
  $output .= backdrop_render_children($form);
  return $output;
}

/**
 * Returns HTML for the last time we checked for update data.
 *
 * In addition to properly formatting the given timestamp, this function also
 * provides a "Check manually" link that refreshes the available update and
 * redirects back to the same page.
 *
 * @param $variables
 *   An associative array containing:
 *   - last: The timestamp when the site last checked for available updates.
 *
 * @see theme_update_report()
 * @see theme_update_available_updates_form()
 * @ingroup themeable
 */
function theme_update_last_check($variables) {
  $last = $variables['last'];
  $output = '<div class="update checked">';
  $output .= $last ? t('Last checked: @time ago', array('@time' => format_interval(REQUEST_TIME - $last))) : t('Last checked: never');
  $output .= ' <span class="check-manually">(' . l(t('Check manually'), 'admin/reports/updates/check', array('query' => backdrop_get_destination())) . ')</span>';
  $output .= "</div>\n";
  return $output;
}

/**
 * Returns HTML for the project status report.
 *
 * @param array $variables
 *   An associative array containing:
 *   - data: An array of data about each project's status.
 *
 * @ingroup themeable
 */
function theme_update_report($variables) {
  $data = $variables['data'];

  $last = state_get('update_last_check', 0);
  $output = theme('update_last_check', array('last' => $last));

  if (!is_array($data)) {
    $output .= '<p>' . $data . '</p>';
    return $output;
  }

  $header = array();
  $rows = array();

  // Create an array of status values keyed by module, theme, or layout name, since
  // we'll need this while generating the report if we have to cross reference
  // anything (e.g. subthemes which have base themes missing an update).
  foreach ($data as $project) {
    foreach ($project['includes'] as $key => $name) {
      $status[$key] = $project['status'];
    }
  }

  foreach ($data as $project) {
    // Don't show a link to the "Update modules" page for core.
    $update_link = ($project['name'] != 'backdrop');
    switch ($project['status']) {
      case UPDATE_CURRENT:
        $class = 'status';
        $icon = theme('image', array('uri' => 'core/misc/watchdog-ok.png', 'width' => 18, 'height' => 18, 'alt' => t('ok'), 'title' => t('ok')));
        $update_link = 0;
        break;
      case UPDATE_UNKNOWN:
      case UPDATE_NOT_CHECKED:
      case UPDATE_FETCH_PENDING:
      case UPDATE_NOT_FETCHED:
        $class = 'unknown';
        $icon = '';
        $update_link = 0;
        break;
      case UPDATE_NOT_SECURE:
      case UPDATE_REVOKED:
      case UPDATE_NOT_SUPPORTED:
        $class = 'error';
        $icon = theme('image', array('uri' => 'core/misc/watchdog-error.png', 'width' => 18, 'height' => 18, 'alt' => t('error'), 'title' => t('error')));
        break;
      case UPDATE_NOT_CURRENT:
      default:
        $class = 'warning';
        $icon = theme('image', array('uri' => 'core/misc/watchdog-warning.png', 'width' => 18, 'height' => 18, 'alt' => t('warning'), 'title' => t('warning')));
        break;
    }

    $row = '<div class="version-status">';
    $status_label = theme('update_status_label', array('status' => $project['status']));
    if (empty($status_label)) {
      $status_label = check_plain($project['reason']);
    }
    if ($update_link) {
      switch ($project['project_type']) {
        case 'theme':
          $updatepath = 'admin/appearance/update';
          break;

        case 'layout':
          $updatepath = 'admin/layouts/update';
          break;

        case 'module':
        default:
          $updatepath = 'admin/modules/update';
      }
      $row .= l($status_label, $updatepath, array('html' => TRUE));
    }
    else {
      $row .= $status_label;
    }
    $row .= '<span class="icon">' . $icon . '</span>';
    $row .= "</div>\n";

    $row .= '<div class="project">';
    if (isset($project['title'])) {
      if (isset($project['link'])) {
        $row .= l($project['title'], $project['link']);
      }
      else {
        $row .= check_plain($project['title']);
      }
    }
    else {
      $row .= check_plain($project['name']);
    }
    $row .= ' ' . check_plain($project['existing_version']);
    if ($project['install_type'] == 'dev' && !empty($project['datestamp'])) {
      $row .= ' <span class="version-date">(' . format_date($project['datestamp'], 'custom', 'Y-M-d') . ')</span>';
    }
    $row .= "</div>\n";

    $versions_inner = '';
    $security_class = array();
    $version_class = array();
    if (isset($project['recommended'])) {
      if ($project['status'] != UPDATE_CURRENT || $project['existing_version'] !== $project['recommended']) {

        // First, figure out what to recommend.
        // If there's only 1 security update and it has the same version we're
        // recommending, give it the same CSS class as if it was recommended,
        // but don't print out a separate "Recommended" line for this project.
        if (!empty($project['security updates']) && count($project['security updates']) == 1 && $project['security updates'][0]['version'] === $project['recommended']) {
          $security_class[] = 'version-recommended';
          $security_class[] = 'version-recommended-strong';
        }
        else {
          $version_class[] = 'version-recommended';
          // Apply an extra class if we're displaying both a recommended
          // version and anything else for an extra visual hint.
          if ($project['recommended'] !== $project['latest_version']
              || !empty($project['also'])
              || ($project['install_type'] == 'dev'
                && isset($project['dev_version'])
                && $project['latest_version'] !== $project['dev_version']
                && $project['recommended'] !== $project['dev_version'])
              || (isset($project['security updates'][0])
                && $project['recommended'] !== $project['security updates'][0])
              ) {
            $version_class[] = 'version-recommended-strong';
          }
          $versions_inner .= theme('update_version', array('version' => $project['releases'][$project['recommended']], 'tag' => t('Recommended version:'), 'class' => $version_class));
        }

        // Now, print any security updates.
        if (!empty($project['security updates'])) {
          $security_class[] = 'version-security';
          foreach ($project['security updates'] as $security_update) {
            $versions_inner .= theme('update_version', array('version' => $security_update, 'tag' => t('Security update:'), 'class' => $security_class));
          }
        }
      }

      if ($project['recommended'] !== $project['latest_version']) {
        $versions_inner .= theme('update_version', array('version' => $project['releases'][$project['latest_version']], 'tag' => t('Latest version:'), 'class' => array('version-latest')));
      }
      if ($project['install_type'] == 'dev'
          && $project['status'] != UPDATE_CURRENT
          && isset($project['dev_version'])
          && $project['recommended'] !== $project['dev_version']) {
        $versions_inner .= theme('update_version', array('version' => $project['releases'][$project['dev_version']], 'tag' => t('Development version:'), 'class' => array('version-latest')));
      }
    }

    if (isset($project['also'])) {
      foreach ($project['also'] as $also) {
        $versions_inner .= theme('update_version', array('version' => $project['releases'][$also], 'tag' => t('Also available:'), 'class' => array('version-also-available')));
      }
    }

    if (!empty($versions_inner)) {
      $row .= "<div class=\"versions\">\n" . $versions_inner . "</div>\n";
    }

    // Render the .info div only if there is something to be rendered in it.
    if (!empty($project['extra']) || count($project['includes']) > 1 || !empty($project['base_themes']) || !empty($project['sub_themes'])) {
      $row .= "<div class=\"info\">\n";

      if (!empty($project['extra'])) {
        $row .= '<div class="extra">' . "\n";
        foreach ($project['extra'] as $key => $value) {
          $row .= '<div class="' . implode(' ', $value['class']) . '">';
          $row .= check_plain($value['label']) . ': ';
          $row .= backdrop_placeholder($value['data']);
          $row .= "</div>\n";
        }
        $row .= "</div>\n";  // .extra div
      }

      // Render the includes info only if the project has more than one
      // submodule.
      if (count($project['includes']) > 1) {
        $row .= '<div class="includes">';
        sort($project['includes']);
        // If the project has both enabled and disabled submodules, then render
        // them as a list with two items, one holding enabled and one holding
        // disabled submodules.
        if (!empty($project['disabled'])) {
          sort($project['disabled']);
          // Make sure we start with a clean slate for each project in the
          // report.
          $includes_items = array();
          $row .= t('Includes:');
          $includes_items[] = t('Enabled: %includes', array('%includes' => implode(', ', $project['includes'])));
          $includes_items[] = t('Disabled: %disabled', array('%disabled' => implode(', ', $project['disabled'])));
          $row .= theme('item_list', array('items' => $includes_items));
        }
        // ...otherwise, render the included modules in a single row.
        else {
          $row .= t('Includes: %includes', array('%includes' => implode(', ', $project['includes'])));
        }
        $row .= "</div>\n";  // .includes div
      }

      if (!empty($project['base_themes'])) {
        $row .= '<div class="basethemes">';
        asort($project['base_themes']);
        $base_themes = array();
        foreach ($project['base_themes'] as $base_key => $base_theme) {
          switch ($status[$base_key]) {
            case UPDATE_NOT_SECURE:
            case UPDATE_REVOKED:
            case UPDATE_NOT_SUPPORTED:
              $base_themes[] = t('%base_theme (!base_label)', array('%base_theme' => $base_theme, '!base_label' => theme('update_status_label', array('status' => $status[$base_key]))));
              break;

            default:
              $base_themes[] = backdrop_placeholder($base_theme);
          }
        }
        $row .= t('Depends on: !basethemes', array('!basethemes' => implode(', ', $base_themes)));
        $row .= "</div>\n";  // .basethemes div
      }

      if (!empty($project['sub_themes'])) {
        $row .= '<div class="subthemes">';
        sort($project['sub_themes']);
        $row .= t('Required by: %subthemes', array('%subthemes' => implode(', ', $project['sub_themes'])));
        $row .= "</div>\n";  // .subthemes div
      }

      $row .= "</div>\n";  // info div.
    }

    if (!isset($rows[$project['project_type']])) {
      $rows[$project['project_type']] = array();
    }
    $row_key = isset($project['title']) ? backdrop_strtolower($project['title']) : backdrop_strtolower($project['name']);
    $rows[$project['project_type']][$row_key] = array(
      'class' => array($class),
      'data' => array($row),
    );
  }

  $project_types = array(
    'core' => t('Backdrop CMS'),
    'module' => t('Modules'),
    'theme' => t('Themes'),
    'layout' => t('Layouts'),
    'module-disabled' => t('Disabled modules'),
    'theme-disabled' => t('Disabled themes'),
    'layout-disabled' => t('Disabled layouts'),
  );
  foreach ($project_types as $type_name => $type_label) {
    if (!empty($rows[$type_name])) {
      ksort($rows[$type_name]);
      $output .= "\n<h3>" . $type_label . "</h3>\n";
      $output .= theme('table', array('header' => $header, 'rows' => $rows[$type_name], 'attributes' => array('class' => array('update'))));
    }
  }
  backdrop_add_css(backdrop_get_path('module', 'update') . '/css/update.css');
  return $output;
}

/**
 * Returns HTML for the version display of a project.
 *
 * @param array $variables
 *   An associative array containing:
 *   - version: An array of data about the latest released version, containing:
 *     - version: The version number.
 *     - release_link: The URL for the release notes.
 *     - date: The date of the release.
 *     - download_link: The URL for the downloadable file.
 *   - tag: The title of the project.
 *   - class: A string containing extra classes for the wrapping table.
 *
 * @ingroup themeable
 */
function theme_update_version($variables) {
  $version = $variables['version'];
  $tag = $variables['tag'];
  $class = implode(' ', $variables['class']);

  $output = '';
  $output .= '<table class="version ' . $class . '">';
  $output .= '<tr>';
  $output .= '<td class="version-title">' . $tag . "</td>\n";
  $output .= '<td class="version-details">';
  $output .= l($version['version'], $version['release_link']);
  $output .= ' <span class="version-date">(' . format_date($version['date'], 'custom', 'Y-M-d') . ')</span>';
  $output .= "</td>\n";
  $output .= '<td class="version-links">';
  $links = array();
  $links['update-download'] = array(
    'title' => t('Download'),
    'href' => $version['download_link'],
  );
  $links['update-release-notes'] = array(
    'title' => t('Release notes'),
    'href' => $version['release_link'],
  );
  $output .= theme('links__update_version', array('links' => $links));
  $output .= '</td>';
  $output .= '</tr>';
  $output .= "</table>\n";
  return $output;
}

/**
 * Returns HTML for a label to display for a project's update status.
 *
 * @param array $variables
 *   An associative array containing:
 *   - status: The integer code for a project's current update status.
 *
 * @see update_calculate_project_data()
 * @ingroup themeable
 */
function theme_update_status_label($variables) {
  switch ($variables['status']) {
    case UPDATE_NOT_SECURE:
      return '<span class="security-error">' . t('Security update required!') . '</span>';

    case UPDATE_REVOKED:
      return '<span class="revoked">' . t('Revoked!') . '</span>';

    case UPDATE_NOT_SUPPORTED:
      return '<span class="not-supported">' . t('Not supported!') . '</span>';

    case UPDATE_NOT_CURRENT:
      return '<span class="not-current">' . t('Update available') . '</span>';

    case UPDATE_CURRENT:
      return '<span class="current">' . t('Up to date') . '</span>';

  }
}
