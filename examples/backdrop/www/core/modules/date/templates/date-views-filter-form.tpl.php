<?php

/**
 * @file
 * Template to display the Views date filter form.
 *
 * Values available vary depending on the operator. The availability
 * of date vs adjustment depending on the filter settings. It can
 * be date-only, date and adjustment, or adjustment only.
 *
 * If the operator is anything but 'Is between' or 'Is not between',
 * a single date and adjustment field is available.
 *
 * $date
 * $adjustment
 *
 * If the operator is 'Is between' or 'Is not between',
 * two date and adjustment fields are available.
 *
 * $mindate
 * $minadjustment
 * $maxdate
 * $maxadjustment
 *
 * A description field is also available.
 *
 * $description
 */
?>
<div class="date-views-filter-wrapper container-inline-date">
<?php if (!empty($date) || !empty($adjustment)) : ?>
  <div class="date-views-filter-group">
    <div class="date-views-filter"><?php print $date; ?></div>
    <div class="date-views-filter"><?php print $adjustment ?></div>
  </div>
<?php endif; ?>
<?php if (!empty($mindate) || !empty($minadjustment)) : ?>
  <div class="date-views-filter-group">
    <div class="date-views-filter"><?php print $mindate; ?></div>
    <div class="date-views-filter"><?php print $minadjustment; ?></div>
  </div>
<?php endif; ?>
<?php if (!empty($maxdate) || !empty($maxadjustment)) : ?>
  <div class="date-views-filter-group">
    <div class="date-views-filter"><?php print $maxdate; ?></div>
    <div class="date-views-filter"><?php print $maxadjustment; ?></div>
  </div>
<?php endif; ?>
</div>
<div class="form-item"><div class="description">
  <?php print $description; ?>
</div></div>