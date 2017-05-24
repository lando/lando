/**
 * @file
 * Backdrop Image plugin.
 *
 * This alters the existing CKEditor image2 widget plugin to:
 * - require a data-file-id attribute (which Backdrop uses to track where images
 *   are being used)
 * - use a Backdrop-native dialog (that is in fact just an alterable Backdrop form
 *   like any other) instead of CKEditor's own dialogs.
 *   @see \Backdrop\editor\Form\EditorImageDialog
 */
(function ($, Backdrop, CKEDITOR) {

"use strict";

CKEDITOR.plugins.add('backdropimage', {
  requires: 'image2',

  beforeInit: function (editor) {
    // Override the image2 widget definition to require and handle the
    // additional data-file-id attribute.
    editor.on('widgetDefinition', function (event) {
      var widgetDefinition = event.data;
      if (widgetDefinition.name !== 'image') {
        return;
      }

      // Override requiredContent & allowedContent.
      widgetDefinition.requiredContent = 'img[alt,src,width,height]';
      widgetDefinition.allowedContent.img.attributes += ',data-file-id';
      // We don't allow <figure>, <figcaption>, <div> or <p>  in our downcast.
      delete widgetDefinition.allowedContent.figure;
      delete widgetDefinition.allowedContent.figcaption;
      delete widgetDefinition.allowedContent.div;
      delete widgetDefinition.allowedContent.p;

      // Override the 'link' part, to completely disable image2's link
      // support: http://dev.ckeditor.com/ticket/11341.
      widgetDefinition.parts.link = 'This is a nonsensical selector to disable this functionality completely';

      // Override downcast(): since we only accept <img> in our upcast method,
      // the element is already correct. We only need to update the element's
      // data-file-id attribute.
      widgetDefinition.downcast = function (element) {
        if (this.data['data-file-id']) {
          element.attributes['data-file-id'] = this.data['data-file-id'];
        }
        else if (element.attributes['data-file-id']) {
          delete element.attributes['data-file-id'];
        }
      };

      // We want to upcast <img> elements to a DOM structure required by the
      // image2 widget; we only accept an <img> tag, and that <img> tag MAY
      // have a data-file-id attribute.
      widgetDefinition.upcast = function (element, data) {
        if (element.name !== 'img') {
          return;
        }
        // Don't initialize on pasted fake objects.
        else if (element.attributes['data-cke-realelement']) {
          return;
        }

        // Parse the data-file-id attribute.
        data['data-file-id'] = element.attributes['data-file-id'];

        return element;
      };

      // Protected; keys of the widget data to be sent to the Backdrop dialog.
      // Keys in the hash are the keys for image2's data, values are the keys
      // that the Backdrop dialog uses.
      widgetDefinition._mapDataToDialog = {
        'src': 'src',
        'alt': 'alt',
        'width': 'width',
        'height': 'height',
        'data-file-id': 'data-file-id'
      };

      // Protected; transforms widget's data object to the format used by the
      // \Backdrop\editor\Form\EditorImageDialog dialog, keeping only the data
      // listed in widgetDefinition._dataForDialog.
      widgetDefinition._dataToDialogValues = function (data) {
        var dialogValues = {};
        var map = widgetDefinition._mapDataToDialog;
        Object.keys(widgetDefinition._mapDataToDialog).forEach(function (key) {
          dialogValues[map[key]] = data[key];
        });
        return dialogValues;
      };

      // Protected; the inverse of _dataToDialogValues.
      widgetDefinition._dialogValuesToData = function (dialogReturnValues) {
        var data = {};
        var map = widgetDefinition._mapDataToDialog;
        Object.keys(widgetDefinition._mapDataToDialog).forEach(function (key) {
          if (dialogReturnValues.hasOwnProperty(map[key])) {
            data[key] = dialogReturnValues[map[key]];
          }
        });
        return data;
      };

      // Protected; creates Backdrop dialog save callback.
      widgetDefinition._createDialogSaveCallback = function (editor, widget) {
        return function (dialogReturnValues) {
          var firstEdit = !widget.ready;

          // Dialog may have blurred the widget. Re-focus it first.
          if (!firstEdit) {
            widget.focus();
          }

          editor.fire('saveSnapshot');

          // Pass `true` so DocumentFragment will also be returned.
          var container = widget.wrapper.getParent(true);
          var image = widget.parts.image;

          // Set the updated widget data, after the necessary conversions from
          // the dialog's return values.
          // Note: on widget#setData this widget instance might be destroyed.
          var data = widgetDefinition._dialogValuesToData(dialogReturnValues.attributes);

          // If there is no image src, delete the widget from the editor.
          if (!data.src) {
            widget.destroy();
            image.remove();
            return widget;
          }

          // If width and height are not set, load the image and populate.
          if (!(data.width || data.height) && !(data.width.length || data.height.length)) {
            var imagetoSize = new Image();
            imagetoSize.onload = function() {
              widget.setData('width', this.width);
              widget.setData('height', this.height);
            };
            imagetoSize.src = data.src;
          }

          // Save the data to internal widget.
          widget.setData(data);

          // Retrieve the widget once again. It could've been destroyed
          // when shifting state, so might deal with a new instance.
          widget = editor.widgets.getByElement(image);

          // It's first edit, just after widget instance creation, but before it was
          // inserted into DOM. So we need to retrieve the widget wrapper from
          // inside the DocumentFragment which we cached above and finalize other
          // things (like ready event and flag).
          if (firstEdit) {
            editor.widgets.finalizeCreation(container);
          }

          setTimeout(function () {
            // (Re-)focus the widget.
            widget.focus();
            // Save snapshot for undo support.
            editor.fire('saveSnapshot');
          });

          return widget;
        };
      };
    });

    // Add a widget#edit listener to every instance of image2 widget in order
    // to handle its editing with a Backdrop-native dialog.
    // This includes also a case just after the image was created
    // and dialog should be opened for it for the first time.
    editor.widgets.on('instanceCreated', function (event) {
      var widget = event.data;

      if (widget.name !== 'image') {
        return;
      }

      widget.on('edit', function (event) {
        // Cancel edit event to break image2's dialog binding
        // (and also to prevent automatic insertion before opening dialog).
        event.cancel();

        // Open backdropimage dialog.
        editor.execCommand('editbackdropimage', {
          existingValues: widget.definition._dataToDialogValues(widget.data),
          saveCallback: widget.definition._createDialogSaveCallback(editor, widget)
        });
      });
    });

    // Register the "editbackdropimage" command, which essentially just replaces
    // the "image" command's CKEditor dialog with a Backdrop-native dialog.
    editor.addCommand('editbackdropimage', {
      allowedContent: 'img[alt,!src,width,height,!data-file-id]',
      requiredContent: 'img[alt,src,width,height,data-file-id]',
      modes: {wysiwyg: 1},
      canUndo: true,
      exec: function (editor, data) {
        // Default to uploads being enabled, unless specifically requested not
        // to be. Access permission is checked in the back-end form itself, this
        // is just to prevent UX confusion from allowing uploads but then having
        // them cleaned up by Backdrop's temporary file cleanup.
        var uploadsEnabled = editor.element.$.getAttribute('data-editor-uploads') === 'false' ? 0 : 1;
        var dialogSettings = {
          title: data.dialogTitle,
          uploads: uploadsEnabled,
          dialogClass: 'editor-image-dialog'
        };
        Backdrop.ckeditor.openDialog(editor, editor.config.backdrop.imageDialogUrl, data.existingValues, data.saveCallback, dialogSettings);
      }
    });

    // Register the toolbar button.
    if (editor.ui.addButton) {
      editor.ui.addButton('BackdropImage', {
        label: Backdrop.t('Image'),
        // Note that we use the original image2 command!
        command: 'image',
        icon: this.path + '/image.png'
      });
    }
  },

  afterInit: function (editor) {
    var cmd;
    var disableButtonIfOnWidget = function (evt) {
      var widget = editor.widgets.focused;
      if (widget && widget.name === 'image') {
        this.setState(CKEDITOR.TRISTATE_DISABLED);
        evt.cancel();
      }
    };

    // Disable image2's integration with the link/backdroplink plugins: don't
    // allow the widget itself to become a link. Support for that may be added
    // by an text filter that adds a data- attribute specifically for that.
    if (editor.plugins.backdroplink) {
      cmd = editor.getCommand('backdroplink');
      cmd.contextSensitive = 1;
      cmd.on('refresh', disableButtonIfOnWidget);
    }

    // Disable alignment buttons if the align filter is not enabled.
    if (editor.plugins.justify && !editor.config.backdrop.alignFilterEnabled) {
      var commands = ['justifyleft', 'justifycenter', 'justifyright', 'justifyblock'];
      for (var n = 0; n < commands.length; n++) {
        cmd = editor.getCommand(commands[n]);
        cmd.contextSensitive = 1;
        cmd.on('refresh', disableButtonIfOnWidget, null, null, 4);
      }
    }
  }

});

})(jQuery, Backdrop, CKEDITOR);
