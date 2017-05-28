/**
 * @file
 * Attaches behavior for updating filter_html's settings automatically.
 */

(function ($) {

"use strict";

/**
 * Implement a live setting parser to prevent text editors from automatically
 * enabling buttons that are not allowed by this filter's configuration.
 */
if (Backdrop.filterConfiguration) {
  Backdrop.filterConfiguration.liveSettingParsers.filter_html = {
    getRules: function () {
      var currentValue = $('#edit-filters-filter-html-settings-allowed-html').val();
      var rules = [];
      var rule;

      // Build a FilterHTMLRule that reflects the hard-coded behavior that
      // strips all "style" attribute and all "on*" attributes.
      rule = new Backdrop.FilterHTMLRule();
      rule.properties.tags = ['*'];
      rule.properties.forbidden.attributes = ['style', 'on*'];
      rules.push(rule);

      // Build a FilterHTMLRule that reflects the current settings.
      rule = new Backdrop.FilterHTMLRule();
      var parseSetting = Backdrop.behaviors.filterFilterHtmlUpdating._parseSetting;
      rule.allow = true;
      rule.tags = parseSetting(currentValue);
      rules.push(rule);

      return rules;
    }
  };
}

Backdrop.behaviors.filterFilterHtmlUpdating = {

  // The form item contains the "Allowed HTML tags" setting.
  $allowedHTMLFormItem: null,

  // The description for the "Allowed HTML tags" field.
  $allowedHTMLDescription: null,

  // The user-entered tag list of $allowedHTMLFormItem.
  userTags: null,

  // The auto-created tag list thus far added.
  autoTags: null,

  // Track which new features have been added to the text editor.
  newFeatures: {},

  attach: function (context, settings) {
    var that = this;
    $(context).find('[name="filters[filter_html][settings][allowed_html]"]').once('filter-filter_html-updating').each(function () {
      that.$allowedHTMLFormItem = $(this);
      that.$allowedHTMLDescription = that.$allowedHTMLFormItem.closest('.form-item').find('.description');
      that.userTags = that._parseSetting(this.value);

      // Update the new allowed tags based on added text editor features.
      $(document)
          .on('backdropEditorFeatureAdded', function (e, feature) {
            that.newFeatures[feature.name] = feature;
            that._updateAllowedTags();
          })
          .on('backdropEditorFeatureModified', function (e, feature) {
            if (that.newFeatures.hasOwnProperty(feature.name)) {
              that.newFeatures[feature.name] = feature;
              that._updateAllowedTags();
            }
          })
          .on('backdropEditorFeatureRemoved', function (e, feature) {
            if (that.newFeatures.hasOwnProperty(feature.name)) {
              delete that.newFeatures[feature.name];
              that._updateAllowedTags();
            }
          });

      // When the allowed tags list is manually changed, update userTags.
      that.$allowedHTMLFormItem.on('change.updateUserTags', function () {
        var tagList = that._parseSetting(this.value);
        var userTags = [];
        for (var n in tagList) {
          if ($.inArray(tagList[n], that.autoTags) === -1) {
            userTags.push(tagList[n]);
          }
        }
        that.userTags = userTags;
      });
    });
  },

  /**
   * Updates the "Allowed HTML tags" setting and shows an informative message.
   */
  _updateAllowedTags: function () {
    // Update the list of auto-created tags.
    this.autoTags = this._calculateAutoAllowedTags(this.userTags, this.newFeatures);

    // Remove any previous auto-created tag message.
    this.$allowedHTMLDescription.find('.editor-update-message').remove();

    // If any auto-created tags: insert message and update form item.
    if (this.autoTags.length > 0) {
      this.$allowedHTMLDescription.append(Backdrop.theme('filterFilterHTMLUpdateMessage', this.autoTags));
      this.$allowedHTMLFormItem.val(this._generateSetting(this.userTags) + ' ' + this._generateSetting(this.autoTags));
    }
    // Restore to original state.
    else {
      this.$allowedHTMLFormItem.val(this._generateSetting(this.userTags));
    }
  },

  /**
   * Calculates which HTML tags the added text editor buttons need to work.
   *
   * The filter_html filter is only concerned with the required tags, not with
   * any properties, nor with each feature's "allowed" tags.
   *
   * @param Array userAllowedTags
   *   The list of user-defined allowed tags.
   * @param Object newFeatureRules
   *   A list of Backdrop.EditorFeature objects' rules, keyed by their name.
   *
   * @return Array
   *   A list of new allowed tags.
   */
  _calculateAutoAllowedTags: function (userAllowedTags, newFeatures) {
    var autoTags = [];
    for (var featureName in newFeatures) {
      if (newFeatures.hasOwnProperty(featureName)) {
        var newFeature = newFeatures[featureName];
        for (var ruleNumber = 0; ruleNumber < newFeature.rules.length; ruleNumber++) {
          var rule = newFeature.rules[ruleNumber];
          for (var tagNumber = 0; tagNumber < rule.tags.length; tagNumber++) {
            var tagName = rule.tags[tagNumber];
            if ($.inArray(tagName, userAllowedTags) === -1 && $.inArray(tagName, autoTags)) {
              autoTags.push(tagName);
            }
          }
        }
      }
    }
    return autoTags;
  },

  /**
   * Parses the value of this.$allowedHTMLFormItem.
   *
   * @param String setting
   *   The string representation of the setting. e.g. "<p> <br> <a>"
   *
   * @return Array
   *   The array representation of the setting. e.g. ['p', 'br', 'a']
   */
  _parseSetting: function (setting) {
    return setting.length ? setting.substring(1, setting.length - 1).split('> <') : [];
  },

  /**
   * Generates the value of this.$allowedHTMLFormItem.
   *
   * @param Array setting
   *   The array representation of the setting. e.g. ['p', 'br', 'a']
   *
   * @return Array
   *   The string representation of the setting. e.g. "<p> <br> <a>"
   */
  _generateSetting: function (tags) {
    return tags.length ? '<' + tags.join('> <') + '>' : '';
  }

};

/**
 * Theme function for the filter_html update message.
 *
 * @param Array tags
 *   An array of the new tags that are to be allowed.
 * @return
 *   The corresponding HTML.
 */
Backdrop.theme.prototype.filterFilterHTMLUpdateMessage = function (tags) {
  var html = '';
  var tagList = '<' + tags.join('> <') + '>';
  html += '<p class="editor-update-message">';
  html += Backdrop.t('Based on the text editor configuration, these tags have automatically been added: <strong>@tag-list</strong>.', {'@tag-list': tagList});
  html += '</p>';
  return html;
};

})(jQuery);
