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
  $output .= $last ? t('Last checked: @time ago', array('@time' => format_interval(REQUEST_TIME - $last))) : t('Last checked: never') . ' ';
  $output .= l(t('Check manually'), 'admin/reports/updates/check', array('attributes' => array('class' => array('button', 'button-secondary')), 'query' => backdrop_get_destination()));
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
      case UPDATE_NOT_SECURE:
      case UPDATE_REVOKED:
      case UPDATE_NOT_SUPPORTED:
        $title = 'Not secure';
        $class = 'report-error';
        break;
      case UPDATE_NOT_CURRENT:
      default:
        $title = 'Update available';
        $class = 'report-warning';
        break;
      case UPDATE_UNKNOWN:
      case UPDATE_NOT_CHECKED:
      case UPDATE_FETCH_PENDING:
      case UPDATE_NOT_FETCHED:
        $title = 'Unknown';
        $class = 'report-unknown';
        $update_link = 0;
        break;
      case UPDATE_CURRENT:
        $title = 'Current';
        $class = 'report-status';
        $update_link = 0;
        break;
    }

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
      $status_label = l($status_label, $updatepath, array('html' => TRUE));
    }

    $project_section = '';
    if (isset($project['title'])) {
      if (isset($project['link'])) {
        $project_section .= l($project['title'], $project['link']);
      }
      else {
        $project_section .= check_plain($project['title']);
      }
    }
    else {
      $project_section .= check_plain($project['name']);
    }
    $project_section .= ' ' . check_plain($project['existing_version']);
    if ($project['install_type'] == 'dev' && !empty($project['datestamp'])) {
      $project_section .= ' <span class="version-date">(' . format_date($project['datestamp'], 'custom', 'Y-M-d') . ')</span>';
    }

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

    $info_section = '';
    // Render the .info div only if there is something to be rendered in it.
    if (!empty($project['extra']) || count($project['includes']) > 1 || !empty($project['base_themes']) || !empty($project['sub_themes'])) {
      $extra_section = $includes_section = $base_section = $sub_section ='';

      if (!empty($project['extra'])) {
        $extra_section = '<div class="extra">' . "\n";
        foreach ($project['extra'] as $key => $value) {
          $extra_section .= '<div class="' . implode(' ', $value['class']) . '">';
          $extra_section .= check_plain($value['label']) . ': ';
          $extra_section .= backdrop_placeholder($value['data']);
          $extra_section .= "</div>\n";
        }
        $extra_section .= "</div>\n";  // .extra div
      }

      // Render the includes info only if the project has more than one
      // submodule.
      if (count($project['includes']) > 1) {
        $includes_section = '<div class="includes">';
        sort($project['includes']);
        // If the project has both enabled and disabled submodules, then render
        // them as a list with two items, one holding enabled and one holding
        // disabled submodules.
        if (!empty($project['disabled'])) {
          sort($project['disabled']);
          // Make sure we start with a clean slate for each project in the
          // report.
          $includes_items = array();
          $includes_section .= t('Includes:');
          $includes_items[] = t('Enabled: %includes', array('%includes' => implode(', ', $project['includes'])));
          $includes_items[] = t('Disabled: %disabled', array('%disabled' => implode(', ', $project['disabled'])));
          $includes_section .= theme('item_list', array('items' => $includes_items));
        }
        // ...otherwise, render the included modules in a single row.
        else {
          $includes_section .= t('Includes: %includes', array('%includes' => implode(', ', $project['includes'])));
        }
        $includes_section .= "</div>\n";  // .includes div
      }

      if (!empty($project['base_themes'])) {
        $base_section = '<div class="basethemes">';
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
        $base_section .= t('Depends on: !basethemes', array('!basethemes' => implode(', ', $base_themes)));
        $base_section .= "</div>\n";  // .basethemes div
      }

      if (!empty($project['sub_themes'])) {
        $sub_section = '<div class="subthemes">';
        sort($project['sub_themes']);
        $sub_section .= t('Required by: %subthemes', array('%subthemes' => implode(', ', $project['sub_themes'])));
        $sub_section .= "</div>\n";  // .subthemes div
      }

      $info_section = '<div class="info">' . $extra_section . $includes_section . $base_section . $sub_section . '</div>';
    }

    $row = '';
    $row .= '<div class="project">' . $project_section . '</div>';
    $row .= '<div class="version-status">' . $status_label . '</div>';
    if (!empty($versions_inner)) {
      $row .= '<div class="versions">' . $versions_inner . '</div>';
    }
    $row .= $info_section;

    if (!isset($rows[$project['project_type']])) {
      $rows[$project['project_type']] = array();
    }
    $row_key = isset($project['title']) ? backdrop_strtolower($project['title']) : backdrop_strtolower($project['name']);
    $rows[$project['project_type']][$row_key] = array(
      'class' => array($class),
      'data' => array(
        array('data' => '<div title="' . $title . '"><span class="element-invisible">' . $title . '</span></div>', 'class' => 'report-icon'),
        array('data' => $row, 'class' => 'update-data'),
      ),
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

  $version_date = '<span class="version-date">(' . format_date($version['date'], 'custom', 'Y-M-d') . ')</span>';
  $version_details = '<span class="version-details">' . l($version['version'], $version['release_link']) . ' ' . $version_date . '</span></span>';
  $version_title = '<span class="version-title">' . $tag . '</span>';

  $links = array();
  $links['update-download'] = array(
    'title' => t('Download'),
    'href' => $version['download_link'],
  );
  $links['update-release-notes'] = array(
    'title' => t('Release notes'),
    'href' => $version['release_link'],
  );
  $update_links = theme('links__update_version', array('links' => $links));

  $output  = '<div class="version ' . $class . '">';
  $output .= '  <div class="version-info">' . $version_title . ' ' . $version_details . '</div>';
  $output .= '  <div class="version-links">' . $update_links . '</div>';
  $output .= '</div>';

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
