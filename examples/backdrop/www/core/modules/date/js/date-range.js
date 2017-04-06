(function ($) {

"use strict";

Backdrop.behaviors.dateRange = {};

Backdrop.behaviors.dateRange.attach = function (context, settings) {
  var $context = $(context);
  var $widgets = $context.find('.end-date-wrapper').once('date-select-range');
  for (var i = 0; i < $widgets.length; i++) {
    new Backdrop.date.EndDateHandler($widgets.eq(i).parent());
  }
};

Backdrop.date = Backdrop.date || {};

/**
 * Constructor for the EndDateHandler object.
 *
 * The EndDateHandler is responsible for synchronizing a date select widget's
 * end date with its start date. This behavior lasts until the user
 * interacts with the end date widget.
 *
 * @param widget
 *   The fieldset DOM element containing the from and to dates.
 */
Backdrop.date.EndDateHandler = function ($widget) {
  this.$widget = $widget;
  this.$toggle = this.$widget.find('[data-toggle-todate]');
  this.$start = this.$widget.find('.start-date-wrapper');
  this.$end = this.$widget.find('.end-date-wrapper');

  // The toggle may not always exist in the event end dates are required.
  if (this.$toggle.length) {
    this.bindToggle();
  }

  this.initializeSelects();
  // Only act on date fields where the end date is completely blank or already
  // the same as the start date. Otherwise, we do not want to override whatever
  // the default value was.
  if (this.endDateIsBlank() || this.endDateIsSame()) {
    this.bindClickHandlers();
    // Start out with identical start and end dates.
    this.syncEndDate();
  }
};

/**
 * Enable the toggle of the end date based on the checkbox.
 */
Backdrop.date.EndDateHandler.prototype.bindToggle = function () {
  var handler = this;
  this.$toggle.bind('change.endDateHandler', function() {
    if (this.checked) {
      handler.$end.show();
    }
    else {
      handler.$end.hide();
    }
  });
  this.$toggle.trigger('change.endDateHandler');
};

/**
 * Store all the select dropdowns in an array on the object, for later use.
 */
Backdrop.date.EndDateHandler.prototype.initializeSelects = function () {
  var $starts = this.$start.find('select');
  var $end, $start, endId, i, id;
  this.selects = {};
  for (i = 0; i < $starts.length; i++) {
    $start = $($starts[i]);
    id = $start.attr('id');
    endId = id.replace('-value-', '-value2-');
    $end = $('#' + endId);
    this.selects[id] = {
      'id': id,
      'start': $start,
      'end': $end
    };
  }
};

/**
 * Returns true if all dropdowns in the end date widget are blank.
 */
Backdrop.date.EndDateHandler.prototype.endDateIsBlank = function () {
  for (var id in this.selects) {
    if (this.selects.hasOwnProperty(id)) {
      if (this.selects[id].end.val() !== '') {
        return false;
      }
    }
  }
  return true;
};

/**
 * Returns true if the end date widget has the same value as the start date.
 */
Backdrop.date.EndDateHandler.prototype.endDateIsSame = function () {
  for (var id in this.selects) {
    if (this.selects.hasOwnProperty(id)) {
      if (this.selects[id].end.val() != this.selects[id].start.val()) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Add a click handler to each of the start date's select dropdowns.
 */
Backdrop.date.EndDateHandler.prototype.bindClickHandlers = function () {
  var handler = this;
  for (var id in this.selects) {
    if (this.selects.hasOwnProperty(id)) {
      this.selects[id].start.bind('click.endDateHandler', function(e) {
        handler.startClickHandler.apply(handler, [e])
      });
      this.selects[id].end.bind('focus.endDateHandler', function(e) {
        handler.endFocusHandler.apply(handler, [e]);
      });
    }
  }
};

/**
 * Click event handler for each of the start date's select dropdowns.
 */
Backdrop.date.EndDateHandler.prototype.startClickHandler = function () {
  this.syncEndDate();
};

/**
 * Focus event handler for each of the end date's select dropdowns.
 */
Backdrop.date.EndDateHandler.prototype.endFocusHandler = function (event) {
  for (var id in this.selects) {
    if (this.selects.hasOwnProperty(id)) {
      this.selects[id].start.unbind('click.endDateHandler');
    }
  }
  $(event.target).unbind('focus', this.endFocusHandler);
};

Backdrop.date.EndDateHandler.prototype.syncEndDate = function () {
  for (var id in this.selects) {
    if (this.selects.hasOwnProperty(id)) {
      this.selects[id].end.val(this.selects[id].start.val());
    }
  }
};

}(jQuery));
