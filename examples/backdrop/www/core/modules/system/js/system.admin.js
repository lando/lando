(function ($) {

// Cache IDs in an array for ease of use.
var ids = [];

/**
 * Internal function to check using Ajax if clean URLs can be enabled on the
 * settings page.
 *
 * This function is not used to verify whether or not clean URLs
 * are currently enabled.
 */
Backdrop.behaviors.cleanURLsSettingsCheck = {
  attach: function (context, settings) {
    // This behavior attaches by ID, so is only valid once on a page.
    // Also skip if we are on an install page, as Backdrop.cleanURLsInstallCheck will handle
    // the processing.
    if (!($('#edit-clean-url').length) || $('#edit-clean-url.install').once('clean-url').length) {
      return;
    }
    var url = settings.basePath + 'admin/config/urls/settings/check';
    $.ajax({
      url: location.protocol + '//' + location.host + url,
      dataType: 'json',
      success: function () {
        // Check was successful. Redirect using a "clean URL". This will force the form that allows enabling clean URLs.
        location = settings.basePath + "admin/config/urls/settings";
      }
    });
  }
};

/**
 * Internal function to check using Ajax if clean URLs can be enabled on the
 * install page.
 *
 * This function is not used to verify whether or not clean URLs
 * are currently enabled.
 */
Backdrop.cleanURLsInstallCheck = function () {
  var url = location.protocol + '//' + location.host + Backdrop.settings.basePath + 'admin/config/urls/settings/check';
  // Submit a synchronous request to avoid database errors associated with
  // concurrent requests during install.
  $.ajax({
    async: false,
    url: url,
    dataType: 'json',
    success: function () {
      // Check was successful.
      $('#edit-clean-url').attr('value', 1);
    }
  });
};

/**
 * When a field is filled out, apply its value to other fields that will likely
 * use the same value. In the installer this is used to populate the
 * administrator e-mail address with the same value as the site e-mail address.
 */
Backdrop.behaviors.copyFieldValue = {
  attach: function (context) {
    // List of fields IDs on which to bind the event listener.
    // Create an array of IDs to use with jQuery.
    for (var sourceId in Backdrop.settings.copyFieldValue) {
      if (Backdrop.settings.copyFieldValue.hasOwnProperty(sourceId)) {
        ids.push(sourceId);
      }
    }
    if (ids.length) {
      // Listen to value:copy events on all dependant fields.
      // We have to use body and not document because of the way jQuery events
      // bubble up the DOM tree.
      $('body').once('copy-field-values').on('value:copy', this.valueTargetCopyHandler);
      // Listen on all source elements.
      $('#' + ids.join(', #')).once('copy-field-values').on('blur', this.valueSourceBlurHandler);
    }
  },
  detach: function (context, settings, trigger) {
    if (trigger === 'unload' && ids.length) {
      $('body').removeOnce('copy-field-values').off('value:copy');
      $('#' + ids.join(', #')).removeOnce('copy-field-values').off('blur');
    }
  },
  /**
   * Event handler that fill the target element with the specified value.
   *
   * @param e
   *   Event object.
   * @param value
   *   Custom value from jQuery trigger.
   */
  valueTargetCopyHandler: function (e, value) {
    var $target = $(e.target);
    if ($target.val() === '') {
      $target.val(value);
    }
  },
  /**
   * Handler for a Blur event on a source field.
   *
   * This event handler will trigger a 'value:copy' event on all dependant fields.
   */
  valueSourceBlurHandler: function (e) {
    var value = $(e.target).val();
    var targetIds = Backdrop.settings.copyFieldValue[e.target.id];
    $('#' + targetIds.join(', #')).trigger('value:copy', value);

  }
};

})(jQuery);
