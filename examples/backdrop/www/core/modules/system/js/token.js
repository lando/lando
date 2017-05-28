/**
 * JavaScript behaviors for the display of the Token UI.
 */
(function ($) {

"use strict";

Backdrop.behaviors.tokenTree = {
  attach: function (context, settings) {
    $(context).find('table.token-tree').once('token-tree', function () {
      $(this).treetable({
        'expandable': true,
        'clickableNodeNames': true
      });
    });
  }
};

Backdrop.behaviors.tokenInsert = {
  attach: function (context, settings) {
    // Keep track of which textfield was last selected/focused.
    $(context).find('textarea, input[type="text"]').focus(function() {
      Backdrop.settings.tokenFocusedField = this;
    });

    $(context).find('.token-click-insert .token-key').once('token-click-insert', function() {
      var newThis = $('<a href="javascript:void(0);" title="' + Backdrop.t('Insert this token into your form') + '">' + $(this).html() + '</a>').click(function(){
        if (typeof Backdrop.settings.tokenFocusedField == 'undefined') {
          alert(Backdrop.t('First click a text field into which the token should be inserted.'));
        }
        else {
          var myField = Backdrop.settings.tokenFocusedField;
          var myValue = $(this).text();

          // IE support.
          if (document.selection) {
            myField.focus();
            var sel = document.selection.createRange();
            sel.text = myValue;
          }
          // Mozilla/Webkit.
          else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                          + myValue
                          + myField.value.substring(endPos, myField.value.length);
          }
          // Otherwise just tack to the end.
          else {
            myField.value += myValue;
          }
        }
        return false;
      });
      $(this).html(newThis);
    });

    var more = '&rtrif; ' + Backdrop.t('more');
    var less = '&dtrif; ' + Backdrop.t('less');
    var $link = $('<a class="token-more" href="#">' + more + ' </a>');
    var toggleDescription = function() {
      if ($(this).toggleClass('open').hasClass('open')) {
        $(this).html(less).siblings('.token-description').css('display', 'block');
      }
      else {
        $(this).html(more).siblings('.token-description').css('display', 'none');
      }
      return false;
    }
    $(context).find('.token-description').each(function() {
      var $moreLink = $link.clone();
      $moreLink.click(toggleDescription);
      $(this).css('display', 'none').before(' ').before($moreLink);
    });
  }
};

})(jQuery);
