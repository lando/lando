/**
 * @file
 * Javascript for the theme settings preview.
 */
(function ($) {
  Backdrop.color = {
    logoChanged: false,
    callback: function(context, settings, form, farb, height, width) {
      // Change the logo to be the real one.
      if (!this.logoChanged) {
        $('#preview #preview-logo img').attr('src', Backdrop.settings.color.logo);
        this.logoChanged = true;
      }
      // Remove the logo if the setting is toggled off. 
      if (Backdrop.settings.color.logo == null) {
        $('div').remove('#preview-logo');
      }

      // Solid background.
      $('#preview', form).css('backgroundColor', $('#palette input[name="palette[bg]"]', form).val());

      // Text preview.
      $('#preview #preview-main h2, #preview .preview-content', form).css('color', $('#palette input[name="palette[text]"]', form).val());
      $('#preview #preview-content a', form).css('color', $('#palette input[name="palette[link]"]', form).val());

      // Sidebar block.
      $('#preview #preview-sidebar #preview-block', form).css('background-color', $('#palette input[name="palette[sidebar]"]', form).val());
      $('#preview #preview-sidebar #preview-block', form).css('border-color', $('#palette input[name="palette[sidebarborders]"]', form).val());

      // Footer wrapper background.
      $('#preview #preview-footer-wrapper', form).css('background-color', $('#palette input[name="palette[footer]"]', form).val());

      // CSS3 Gradients.
      var gradient_start = $('#palette input[name="palette[top]"]', form).val();
      var gradient_end = $('#palette input[name="palette[bottom]"]', form).val();

      $('#preview #preview-header', form).attr('style', "background-color: " + gradient_start + "; background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(" + gradient_start + "), to(" + gradient_end + ")); background-image: -moz-linear-gradient(-90deg, " + gradient_start + ", " + gradient_end + ");");

      $('#preview #preview-site-name', form).css('color', $('#palette input[name="palette[titleslogan]"]', form).val());

      // Main menu
      $('#preview #preview-main-menu-links a', form).css('color', $('#palette input[name="palette[menu]"]', form).val());
      $('#preview #preview-main-menu-links a.active', form).css('color', $('#palette input[name="palette[activemenu]"]', form).val());

      checkTab();

      $('#edit-main-menu-tabs').find('input[type=radio]').on('change',function(){
        checkTab();
      });

      function checkTab() {
        var menuColor = $('#palette input[name="palette[menu]"]', form).val();
        var activeMenuColor = $('#palette input[name="palette[activemenu]"]', form).val();
        if ($('#edit-main-menu-tabs-no-tabs').is(':checked')) {
          updateTabs('none', 'none', 0, menuColor);
          $('#preview-main-menu-links a.active').css({'text-decoration': 'underline', 'color': activeMenuColor });
        }
        if ($('#edit-main-menu-tabs-rounded-tabs').is(':checked')) {
          updateTabs('rgba(255, 255, 255, 0.7)', '0 1px #eee', '8px', '#333');
          $('#preview-main-menu-links a.active').css({
            'text-decoration': 'none',
            'background': '#ffffff'
          });
        }
        if ($('#edit-main-menu-tabs-square-tabs').is(':checked')) {
          updateTabs('rgba(255, 255, 255, 0.7)', '0 1px #eee', 0, '#333');
          $('#preview-main-menu-links a.active').css({
            'text-decoration': 'none',
            'background': '#ffffff'
          });
        }
      }

      function updateTabs(bg, shadow, radius, menuColor) {
        $('#preview #preview-main-menu-links a').css({
          'background': bg,
          'text-shadow': shadow,
          'border-top-left-radius': radius,
          'border-top-right-radius': radius,
          'color': menuColor
        });
      }
    }
  };
})(jQuery);
