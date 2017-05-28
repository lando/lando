(function ($) {

/**
 * Attach handlers to evaluate the strength of any password fields and to check
 * that its confirmation is correct.
 */
Backdrop.behaviors.password = {
  attach: function (context, settings) {
    var translate = settings.password;
    $('input.password-field', context).once('password', function () {
      var $passwordInput = $(this);
      var $innerWrapper = $(this).parent();
      var $outerWrapper = $(this).parent().parent();

      // Add identifying class to password element parent.
      $innerWrapper.addClass('password-parent');

      // Add the password confirmation layer.
      $outerWrapper.find('input.password-confirm').wrap('<span class="password-confirm-wrapper"></span>').after('<span class="password-match"><span class="password-match-title">' + translate.confirmTitle + '</span><span class="password-match-text"></span></span>').addClass('confirm-parent');
      var $confirmInput = $outerWrapper.find('input.password-confirm');
      var $matchResult = $outerWrapper.find('span.password-match');
      var passwordMeter = '<span class="password-strength"><span class="password-strength-title">' + translate.strengthTitle + '</span><span class="password-strength-text" aria-live="assertive"></span><span class="password-indicator"><span class="indicator"></span></span></span>';
      $passwordInput.wrap('<span class="password-confirm-wrapper"></span>').after(passwordMeter);

      // Check the password strength.
      var passwordCheck = function () {

        // Evaluate the password strength.
        var result = Backdrop.evaluatePasswordStrength($passwordInput.val(), translate.username);

        // Adjust the length of the strength indicator.
        $innerWrapper.find('.indicator').css('width', result.strength + '%');

        // Update the strength indication text.
        $innerWrapper.find('.password-strength-text').html(translate[result.level]);

        // Give a class to the strength.
        $innerWrapper.find('.password-strength').attr('class', 'password-strength ' + result.level);

        passwordCheckMatch();
      };

      // Check that password and confirmation inputs match.
      var passwordCheckMatch = function () {

        if ($confirmInput.val()) {
          var success = $passwordInput.val() === $confirmInput.val();

          // Remove the previous styling if any exists.
          if (this.confirmClass) {
            $matchResult.removeClass(this.confirmClass);
          }

          // Fill in the success message and set the class accordingly.
          this.confirmClass = success ? 'match' : 'mismatch';
          $matchResult.addClass(this.confirmClass).find('.password-match-text').html(translate['confirm' + (success ? 'Success' : 'Failure')]);
        }
        else {
          this.confirmClass = 'empty';
          $matchResult.addClass(this.confirmClass);
        }
      };

      // Monitor keyup and blur events.
      // Blur must be used because a mouse paste does not trigger keyup.
      $passwordInput.bind('keyup focus blur', passwordCheck).triggerHandler('keyup');
      $confirmInput.bind('keyup blur', passwordCheckMatch);
    });
  }
};

/**
 * Evaluate the strength of a user's password.
 *
 * Returns the estimated strength and the relevant output message.
 */
Backdrop.evaluatePasswordStrength = function (password, username) {
  var strength = 0;
  var level = 'empty';
  var hasLowercase = /[a-z]+/.test(password);
  var hasUppercase = /[A-Z]+/.test(password);
  var hasNumbers = /[0-9]+/.test(password);
  var hasPunctuation = /[^a-zA-Z0-9]+/.test(password);

  // If there is a username edit box on the page, compare password to that, otherwise
  // use value from the database.
  var usernameBox = $('input.username');
  if (usernameBox.length > 0) {
    username = usernameBox.val();
  }

  // Calculate the number of unique character sets within a string.
  // Adapted from https://github.com/dropbox/zxcvbn.
  var cardinality = (hasLowercase * 26) + (hasUppercase * 26) + (hasNumbers * 10) + (hasPunctuation * 33);

  // Assign strength based on the level of entropy within the password, times
  // its length. Again, adapted from zxcvbn.
  strength = (Math.log(cardinality) / Math.log(2)) * password.length + 1;

  // Check if password is the same as the username.
  if (password !== '' && password.toLowerCase() === username.toLowerCase()) {
    strength = 5;
  }

  // Based on the strength, work out what text should be shown by the password strength meter.
  if (strength >= 90) {
    level = 'strong';
  }
  else if (strength > 70) {
    level = 'good';
  }
  else if (strength > 50) {
    level = 'fair';
  }
  else if (strength > 0) {
    level = 'weak';
  }

  // Cap at 100 and round to the nearest integer.
  strength = parseInt(Math.min(strength, 100));

  // Assemble the final message.
  return { strength: strength, level: level };
};

/**
 * Field instance settings screen: force the 'Display on registration form'
 * checkbox checked whenever 'Required' is checked.
 */
Backdrop.behaviors.fieldUserRegistration = {
  attach: function (context, settings) {
    var $checkbox = $('form#field-ui-field-edit-form input#edit-instance-settings-user-register-form');

    if ($checkbox.length) {
      $('input#edit-instance-required', context).once('user-register-form-checkbox', function () {
        $(this).bind('change', function (e) {
          if ($(this).prop('checked')) {
            $checkbox.prop('checked', true);
          }
        });
      });

    }
  }
};

})(jQuery);
