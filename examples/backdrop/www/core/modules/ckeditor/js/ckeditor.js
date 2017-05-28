(function (Backdrop, CKEDITOR, $) {

  "use strict";

  Backdrop.editors.ckeditor = {

    attach: function (element, format) {
      if (!$('#ckeditor-modal').length) {
        $('<div id="ckeditor-modal" />').hide().appendTo('body');
      }

      this._loadExternalPlugins(format);
      // Set a title on the CKEditor instance that includes the text field's
      // label so that screen readers say something that is understandable
      // for end users.
      var label = $('label[for=' + element.getAttribute('id') + ']').text();
      format.editorSettings.title = Backdrop.t("Rich Text Editor, !label field", {'!label': label});

      // CKEditor initializes itself in a read-only state if the 'disabled'
      // attribute is set. It does not respect the 'readonly' attribute,
      // however, so we set the 'readOnly' configuration property manually in
      // that case, for the CKEditor instance that's about to be created.
      format.editorSettings.readOnly = element.hasAttribute('readonly');

      // Try to match the textarea height on which we're replacing.
      format.editorSettings.height = $(element).height();

      // Hide the resizable grippie while CKEditor is active.
      $(element).siblings('.grippie').hide();

      return !!CKEDITOR.replace(element, format.editorSettings);
    },

    detach: function (element, format, trigger) {
      var editor = CKEDITOR.dom.element.get(element).getEditor();
      if (!editor) {
        return false;
      }

      var height = $(editor.container.$).find('iframe').height();

      if (editor) {
        if (trigger === 'serialize') {
          editor.updateElement();
        }
        else {
          editor.destroy();
          element.removeAttribute('contentEditable');
        }
      }

      // Set the textarea height to match the potentially resized CKEditor.
      if (height) {
        $(element).height(height);
      }

      // Restore the resize grippie.
      $(element).siblings('.grippie').show();
      return !!editor;
    },

    onChange: function (element, callback) {
      var editor = CKEDITOR.dom.element.get(element).getEditor();
      var timeout;
      if (editor) {
        editor.on('change', function() {
          window.clearTimeout(timeout);
          timeout = window.setTimeout(function () {
            callback(editor.getData());
          }, 400);
        });
      }
      return !!editor;
    },

    _loadExternalPlugins: function (format) {
      var externalPlugins = format.editorSettings.backdrop.externalPlugins;
      // Register and load additional CKEditor plugins as necessary.
      if (externalPlugins) {
        for (var pluginName in externalPlugins) {
          if (externalPlugins.hasOwnProperty(pluginName)) {
            CKEDITOR.plugins.addExternal(pluginName, Backdrop.settings.basePath + externalPlugins[pluginName]['path'] + '/', externalPlugins[pluginName]['file']);
          }
        }
      }
    }

  };

  Backdrop.ckeditor = {
    /**
     * Variable storing the current dialog's save callback.
     */
    saveCallback: null,

    /**
     * Open a dialog for a Backdrop-based plugin.
     *
     * This dynamically loads jQuery UI (if necessary) using the Backdrop AJAX
     * framework, then opens a dialog at the specified Backdrop path.
     *
     * @param editor
     *   The CKEditor instance that is opening the dialog.
     * @param string url
     *   The URL that contains the contents of the dialog.
     * @param Object existingValues
     *   Existing values that will be sent via POST to the url for the dialog
     *   contents.
     * @param Function saveCallback
     *   A function to be called upon saving the dialog.
     * @param Object dialogSettings
     *   An object containing settings to be passed to the jQuery UI.
     */
    openDialog: function (editor, url, existingValues, saveCallback, dialogSettings) {
      // Locate a suitable place to display our loading indicator.
      var $target = $(editor.container.$);
      if (editor.elementMode === CKEDITOR.ELEMENT_MODE_REPLACE) {
        $target = $target.find('.cke_contents');
      }

      // Remove any previous loading indicator.
      $target.css('position', 'relative').find('.ckeditor-dialog-loading').remove();

      // Add a consistent dialog class.
      var classes = dialogSettings.dialogClass ? dialogSettings.dialogClass.split(' ') : [];
      classes.push('editor-dialog');
      dialogSettings.dialogClass = classes.join(' ');
      dialogSettings.autoResize = true;
      dialogSettings.modal = true;
      dialogSettings.target = '#ckeditor-modal';

      // Add a "Loading…" message, hide it underneath the CKEditor toolbar, create
      // a Backdrop.ajax instance to load the dialog and trigger it.
      var $content = $('<div class="ckeditor-dialog-loading"><span style="top: -40px;" class="ckeditor-dialog-loading-link"><a>' + Backdrop.t('Loading...') + '</a></span></div>');
      $content.appendTo($target);
      new Backdrop.ajax('ckeditor-dialog', $content.find('a').get(0), {
        accepts: 'application/vnd.backdrop-dialog',
        dialog: dialogSettings,
        selector: '.ckeditor-dialog-loading-link',
        url: url,
        event: 'ckeditor-internal.ckeditor',
        progress: {'type': 'throbber'},
        submit: {
          editor_object: existingValues
        }
      });
      $content.find('a')
          .on('click', function () { return false; })
          .trigger('ckeditor-internal.ckeditor');

      // After a short delay, show "Loading…" message.
      window.setTimeout(function () {
        $content.find('span').animate({top: '0px'});
      }, 500);

      // Store the save callback to be executed when this dialog is closed.
      Backdrop.ckeditor.saveCallback = saveCallback;
    }
  };

  // Respond to new dialogs that are opened by CKEditor, closing the AJAX loader.
  $(window).on('dialog:beforecreate', function (e, dialog, $element, settings) {
    $('.ckeditor-dialog-loading').animate({top: '-40px'}, function () {
      $(this).remove();
    });
  });

  // Respond to dialogs that are saved, sending data back to CKEditor.
  $(window).on('editor:dialogsave', function (e, values) {
    if (Backdrop.ckeditor.saveCallback) {
      Backdrop.ckeditor.saveCallback(values);
    }
  });

  // Respond to dialogs that are closed, removing the current save handler.
  $(window).on('dialog:afterclose', function (e, dialog, $element) {
    if (Backdrop.ckeditor.saveCallback) {
      Backdrop.ckeditor.saveCallback = null;
    }
  });

})(Backdrop, CKEDITOR, jQuery);
