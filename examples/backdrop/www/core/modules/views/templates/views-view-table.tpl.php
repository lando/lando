<?php
/**
 * @file
 * Template to display a view as a table.
 *
 * - $classes: An array of classes to apply to the table, based on settings.
 * - $attributes: An array of additional HTML attributes for the table.
 * - $title : The title of this group of rows.  May be empty.
 * - $caption: The caption for this table. May be empty.
 * - $header: An array of header labels indexed by field id.
 * - $header_classes: An array of header classes indexed by field id.
 * - $rows: An array of row items. Each row is an array of content. $rows are
 *   indexed by row number, fields within rows are indexed by field ID.
 * - $row_classes: An array of classes to apply to each row, indexed by row
 *   number. This matches the index in $rows.
 * - $fields: An array of CSS IDs to use for each field id.
 * - $field_classes: An array of classes to apply to each field, indexed by
 *   field id, then row number. This matches the index in $rows.
 * - $field_attributes: An array of additional HTML attributes for each field,
 *   also indexed by field id, then row number. This matches the index in $rows.
 * @ingroup views_templates
 */
?>
<table class="<?php print implode(' ', $classes); ?>"<?php print backdrop_attributes($attributes); ?>>
   <?php if (!empty($title) || !empty($caption)) : ?>
     <caption><?php print $caption . $title; ?></caption>
  <?php endif; ?>
  <?php if (!empty($header)) : ?>
    <thead>
      <tr>
        <?php foreach ($header as $field => $label): ?>
          <th <?php if ($header_classes[$field]) { print 'class="'. implode(' ', $header_classes[$field]) . '" '; } ?>>
            <?php print $label; ?>
          </th>
        <?php endforeach; ?>
      </tr>
    </thead>
  <?php endif; ?>
  <tbody>
    <?php foreach ($rows as $row_count => $row): ?>
      <tr <?php if (!empty($row_classes[$row_count])) { print 'class="' . implode(' ', $row_classes[$row_count]) .'"';  } ?>>
        <?php foreach ($row as $field => $content): ?>
          <td <?php if ($field_classes[$field][$row_count]) { print 'class="'. implode(' ', $field_classes[$field][$row_count]) . '" '; } ?><?php print backdrop_attributes($field_attributes[$field][$row_count]); ?>>
            <?php print $content; ?>
          </td>
        <?php endforeach; ?>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
