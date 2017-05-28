<?php
/**
 * @file
 * Default view template to display a rows in a grid.
 *
 * - $title: The title of this group of rows.  May be empty.
 * - $classes: An array of classes to apply to the grid, based on settings.
 * - $attributes: An array of additional HTML attributes for the grid.
 * - $caption: The caption for this grid. May be empty.
 * - $rows: A nested array of rows. Each row contains an array of columns.
 * - $row_classes: An array of classes to apply to each row, indexed by row
 *   number. This matches the index in $rows.
 * - $column_classes: An array of classes to apply to each column, indexed by
 *   row number, then column number. This matches the index in $rows.
 *
 * @ingroup views_templates
 */
?>
<?php if (!empty($title)) : ?>
  <h3><?php print $title; ?></h3>
<?php endif; ?>
<table class="<?php print implode(' ', $classes); ?>"<?php print backdrop_attributes($attributes); ?>>
  <?php if (!empty($caption)) : ?>
    <caption><?php print $caption; ?></caption>
  <?php endif; ?>

  <tbody>
    <?php foreach ($rows as $row_number => $columns): ?>
      <tr <?php if (!empty($row_classes[$row_number])) { print 'class="' . implode(' ', $row_classes[$row_number]) .'"';  } ?>>
        <?php foreach ($columns as $column_number => $item): ?>
          <td <?php if ($column_classes[$row_number][$column_number]) { print 'class="' . implode(' ', $column_classes[$row_number][$column_number]) .'"';  } ?>>
            <?php print $item; ?>
          </td>
        <?php endforeach; ?>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
