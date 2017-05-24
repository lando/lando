(function ($) {

Backdrop.behaviors.dateYearRange = {};

Backdrop.behaviors.dateYearRange.attach = function (context, settings) {
  var $textfield, $textfields, i;

  // Turn the years back and forward fieldsets into dropdowns.
  $textfields = $('input.select-list-with-custom-option', context).once('date-year-range');
  for (i = 0; i < $textfields.length; i++) {
    $textfield = $($textfields[i]);
    new Backdrop.dateYearRange.SelectListWithCustomOption($textfield);
  }
};


Backdrop.dateYearRange = {};

/**
 * Constructor for the SelectListWithCustomOption object.
 *
 * This object is responsible for turning the years back and forward textfields
 * into dropdowns with an 'other' option that lets the user enter a custom
 * value.
 */
Backdrop.dateYearRange.SelectListWithCustomOption = function ($textfield) {
  this.$textfield = $textfield;
  this.$description = $textfield.next('div.description');
  this.defaultValue = $textfield.val();
  this.$dropdown = this.createDropdown();
  this.$dropdown.insertBefore($textfield);
};

/**
 * Get the value of the textfield as it existed on page load.
 *
 * @param {String} type
 *   The type of the variable to be returned. Defaults to string.
 * @return
 *   The original value of the textfield. Returned as an integer, if the type
 *   parameter was 'int'.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.getOriginal = function (type) {
  var original;
  if (type === 'int') {
    original = parseInt(this.defaultValue, 10);
    if (window.isNaN(original)) {
      original = 0;
    }
  }
  else {
    original = this.defaultValue;
  }
  return original;
};

/**
 * Get the correct first value for the dropdown.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.getStartValue = function () {
  var direction = this.getDirection();
  var start;
  switch (direction) {
    case 'back':
      // For the 'years back' dropdown, the first option should be -10, unless
      // the default value of the textfield is even smaller than that.
      start = Math.min(this.getOriginal('int'), -10);
      break;
    case 'forward':
      start = 0;
      break;
  }
  return start;
};

/**
 * Get the correct last value for the dropdown.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.getEndValue = function () {
  var direction = this.getDirection();
  var end;
  var originalString = this.getOriginal();
  switch (direction) {
    case 'back':
      end = 0;
      break;
    case 'forward':
      // If the original value of the textfield is an absolute year such as
      // 2020, don't try to include it in the dropdown.
      if (originalString.indexOf('+') === -1) {
        end = 10;
      }
      // If the original value is a relative value (+x), we want it to be
      // included in the possible dropdown values.
      else {
        end = Math.max(this.getOriginal('int'), 10);
      }
      break;
  }
  return end;
};

/**
 * Create a dropdown select list with the correct options for this textfield.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.createDropdown = function () {
  var $dropdown = $('<select>').addClass('form-select date-year-range-select');
  var $option, i, value;
  var start = this.getStartValue();
  var end = this.getEndValue();
  var direction = this.getDirection();
  for (i = start; i <= end; i++) {
    // Make sure we include the +/- sign in the option value.
    value = i;
    if (i > 0) {
      value = '+' + i;
    }
    // Zero values must have a + or - in front.
    if (i === 0) {
      if (direction === 'back') {
        value = '-' + i;
      }
      else {
        value = '+' + i;
      }
    }
    $option = $('<option>' + Backdrop.formatPlural(value, '@count year from now', '@count years from now') + '</option>').val(value);
    $dropdown.append($option);
  }
  // Create an 'Other' option.
  $option = $('<option class="custom-option">' + Backdrop.t('Other') + '</option>').val('');
  $dropdown.append($option);

  // When the user changes the selected option in the dropdown, perform
  // appropriate actions (such as showing or hiding the textfield).
  $dropdown.bind('change', $.proxy(this.handleDropdownChange, this));

  // Set the initial value of the dropdown.
  this._setInitialDropdownValue($dropdown);
  return $dropdown;
};

Backdrop.dateYearRange.SelectListWithCustomOption.prototype._setInitialDropdownValue = function ($dropdown) {
  var textfieldValue = this.getOriginal();
  // Determine whether the original textfield value exists in the dropdown.
  var possible = $dropdown.find('option[value="' + textfieldValue + '"]');
  // If the original textfield value is one of the dropdown options, preselect
  // it and hide the 'other' textfield.
  if (possible.length) {
    $dropdown.val(textfieldValue);
    this.hideTextfield();
  }
  // If the original textfield value isn't one of the dropdown options, choose
  // the 'Other' option in the dropdown.
  else {
    $dropdown.val('');
  }
};

/**
 * Determine whether this is the "years back" or "years forward" textfield.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.getDirection = function () {
  if (this.direction) {
    return this.direction;
  }
  var direction;
  if (this.$textfield.hasClass('back')) {
    direction = 'back';
  }
  else if (this.$textfield.hasClass('forward')) {
    direction = 'forward';
  }
  this.direction = direction;
  return direction;
};

/**
 * Change handler for the dropdown, to modify the textfield as appropriate.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.handleDropdownChange = function () {
  // Since the dropdown changed, we need to make the content of the textfield
  // match the (new) selected option.
  this.syncTextfield();

  // Show the textfield if the 'Other' option was selected, and hide it if one
  // of the preset options was selected.
  if ($(':selected', this.$dropdown).hasClass('custom-option')) {
    this.revealTextfield();
  }
  else {
    this.hideTextfield();
  }
};

/**
 * Display the textfield and its description.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.revealTextfield = function () {
  this.$textfield.show();
  this.$description.show();
};

/**
 * Hide the textfield and its description.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.hideTextfield = function () {
  this.$textfield.hide();
  this.$description.hide();
};

/**
 * Copy the selected value of the dropdown to the textfield.
 *
 * FAPI doesn't know about the JS-only dropdown, so the textfield needs to
 * reflect the value of the dropdown.
 */
Backdrop.dateYearRange.SelectListWithCustomOption.prototype.syncTextfield = function () {
  var value = this.$dropdown.val();
  this.$textfield.val(value);
};

})(jQuery);
