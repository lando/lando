<?php
/**
 * @file
 * Default simple view template to display a list of rows.
 *
 * - $title: The title of this group of rows.  May be empty.
 * - $rows: An array of row items. Each row is an array of content.
 *   $rows are indexed by row number.
 * - $row_classes: An array of classes to apply to each row, indexed by row
 *   number. This matches the index in $rows.
 *
 * @ingroup views_templates
 */
?>
<?php if (!empty($title)): ?>
  <h3><?php print $title; ?></h3>
<?php endif; ?>
<?php foreach ($rows as $row_count => $row): ?>
  <div <?php if (!empty($row_classes[$row_count])) { print 'class="' . implode(' ', $row_classes[$row_count]) . '"';  } ?>>
    <?php print $row; ?>
  </div>
<?php endforeach; ?>
