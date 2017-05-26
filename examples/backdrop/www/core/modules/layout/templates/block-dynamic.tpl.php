<?php
/**
 * @file
 * Template for outputting the dynamic block styling within a Layout.
 *
 * This template outputs the same content as the layout-block.tpl.php template,
 * but uses a dynamic value for all its HTML tags. This allows site-builders to
 * customize every aspect of the block markup through the user interface. If
 * you need to customize the output of a block in the theme layer, it may be
 * easier to configure the block to use the default style, and override the
 * simpler block.tpl.php file instead.
 *
 * Variables available:
 * - $wrapper_tag: The HTML tag to be used around the entire block.
 * - $classes: Array of classes that should be displayed on the block's wrapper.
 * - $attributes: Attributes that should be displayed on this block's wrapper.
 * - $title: The title of the block.
 * - $title_prefix/$title_suffix: A prefix and suffix for the title tag. This
 *   is important to print out as administrative links to edit this block are
 *   printed in these variables.
 * - $title_tag: The HTML tag to be used on the title of the block.
 * - $content_tag: The HTML tag to be used around the content.
 * - $content_attributes: Attributes that should be displayed on the content.
 * - $content: The actual content of the block.
 */
?>
<?php if ($wrapper_tag): ?>
<<?php print $wrapper_tag; ?> class="<?php print implode(' ', $classes); ?>"<?php print backdrop_attributes($attributes); ?>>
<?php endif; ?>

<?php print render($title_prefix); ?>
<?php if ($title): ?>
  <<?php print $title_tag; ?><?php print backdrop_attributes($title_attributes); ?>><?php print $title; ?></<?php print $title_tag; ?>>
<?php endif;?>
<?php print render($title_suffix); ?>

<?php if ($content_tag): ?>
<<?php print $content_tag; ?><?php print backdrop_attributes($content_attributes); ?>>
<?php endif; ?>
<?php print render($content); ?>
<?php if ($content_tag): ?>
</<?php print $content_tag; ?>>
<?php endif; ?>

<?php if ($wrapper_tag): ?>
</<?php print $wrapper_tag; ?>>
<?php endif; ?>