(function($) {

Backdrop.adminBar = Backdrop.adminBar || {};
Backdrop.adminBar.behaviors = Backdrop.adminBar.behaviors || {};
Backdrop.adminBar.cache = Backdrop.adminBar.cache || {};

/**
 * Core behavior for Administration bar.
 *
 * Test whether there is an administration bar is in the output and execute all
 * registered behaviors.
 */
Backdrop.behaviors.adminBar = {
  attach: function (context, settings) {
    // Initialize settings.
    settings.admin_bar = $.extend({
      suppress: false,
      margin_top: false,
      position_fixed: false,
      destination: '',
      basePath: settings.basePath,
      hash: 0,
      replacements: {}
    }, settings.admin_bar || {});
    // Check whether administration bar should be suppressed.
    if (settings.admin_bar.suppress) {
      return;
    }
    var $adminBar = $('#admin-bar');
    // Client-side caching; if administration bar is not in the output, it is
    // fetched from the server and cached in the browser.
    if (!$adminBar.length && settings.admin_bar.hash) {
      Backdrop.adminBar.getCache(settings.admin_bar.hash, function (response) {
        if (typeof response == 'string' && response.length > 0) {
          $adminBar = $(response);
          // Temporarily hide the admin bar while adjustments are made.
          $adminBar.css({visibility: 'hidden'}).appendTo('body', context);
          // Apply our behaviors.
          Backdrop.adminBar.attachBehaviors(context, settings, $adminBar);
          // Display the admin bar as soon as everything is done.
          setTimeout(function () {
            $adminBar.css({visibility: ''});
          }, 0);
        }
      });
    }
    // If the menu is in the output already, this means there is a new version.
    else if (!$adminBar.hasClass('admin-bar-processed')) {
      // Apply our behaviors.
      Backdrop.adminBar.attachBehaviors(context, settings, $adminBar);
    }
  }
};

/**
 * Retrieve content from client-side cache.
 *
 * @param hash
 *   The md5 hash of the content to retrieve.
 * @param onSuccess
 *   A callback function invoked when the cache request was successful.
 */
Backdrop.adminBar.getCache = function (hash, onSuccess) {
  // Check for locally cached content.
  if (Backdrop.adminBar.cache.hash) {
    if (typeof onSuccess === 'function') {
      onSuccess(Backdrop.adminBar.cache.hash);
    }
    return;
  }
  // Send an AJAX request for the admin bar content, only if we’re not already
  // waiting on a response from a previous request.
  if (!Backdrop.adminBar.ajaxRequest) {
    Backdrop.adminBar.ajaxRequest = $.ajax({
      cache: true,
      type: 'GET',
      dataType: 'text', // Prevent auto-evaluation of response.
      global: false, // Do not trigger global AJAX events.
      url: Backdrop.settings.admin_bar.basePath.replace(/admin_bar/, 'js/admin_bar/cache/' + hash),
      success: [function (response) {
        // Cache the response data in a variable.
        Backdrop.adminBar.cache.hash = response;
      }, onSuccess],
      complete: function () {
        Backdrop.adminBar.ajaxRequest = false;
      }
    });
  }
  else {
    // Invoke our callback when the AJAX request is complete.
    Backdrop.adminBar.ajaxRequest.done(onSuccess);
  }
};

/**
 * If we have a hash, send the AJAX request right away, in an effort to have it
 * complete as early as possible.
 */
if (Backdrop.settings.admin_bar.hash && Backdrop.settings.admin_bar.basePath) {
  Backdrop.adminBar.getCache(Backdrop.settings.admin_bar.hash);
}

/**
 * @defgroup admin_behaviors Administration behaviors.
 * @{
 */

/**
 * Attach administrative behaviors.
 */
Backdrop.adminBar.attachBehaviors = function (context, settings, $adminBar) {
  if ($adminBar.length) {
    $adminBar.addClass('admin-bar-processed');
    $.each(Backdrop.adminBar.behaviors, function() {
      this(context, settings, $adminBar);
    });
  }
};

/**
 * Apply active trail highlighting based on current path.
 */
Backdrop.adminBar.behaviors.adminBarActiveTrail = function (context, settings, $adminBar) {
  if (settings.admin_bar.activeTrail) {
    $adminBar.find('#admin-bar-menu > li > ul > li > a[href="' + settings.admin_bar.activeTrail + '"]').addClass('active-trail');
  }
};

/**
 * Apply margin to page.
 *
 * We apply the class to the HTML element, since it’s the only element that’s
 * guaranteed to exist at execution time.
 */
Backdrop.adminBar.behaviors.adminBarMarginTop = function (context, settings) {
  if (!settings.admin_bar.suppress && settings.admin_bar.margin_top) {
    $('html:not(.admin-bar)', context).addClass('admin-bar');
  }
};
// Don’t wait until the DOM is ready, run this immediately to prevent flickering
// or jumping page content.
Backdrop.adminBar.behaviors.adminBarMarginTop(document, Backdrop.settings);

/**
 * Apply 'position: fixed'.
 */
Backdrop.adminBar.behaviors.positionFixed = function (context, settings, $adminBar) {
  if (settings.admin_bar.position_fixed) {
    $adminBar.addClass('admin-bar-position-fixed');
    $adminBar.css('position', 'fixed');

    // Set a data attribute to inform other parts of the page that we're
    // offsetting the top margin, then trigger an offset change. See
    // tableheader.js for an example of how this is utilized.
    var height = $adminBar.height();
    $adminBar.attr('data-offset-top', height);
    $(document).triggerHandler('offsettopchange');
  }
};

/**
 * Perform dynamic replacements in cached menu.
 */
Backdrop.adminBar.behaviors.replacements = function (context, settings, $adminBar) {
  for (var item in settings.admin_bar.replacements) {
    if (settings.admin_bar.replacements.hasOwnProperty(item)) {
      $(item, $adminBar).html(settings.admin_bar.replacements[item]);
    }
  }
};

/**
 * Inject destination query strings for current page.
 */
Backdrop.adminBar.behaviors.destination = function (context, settings, $adminBar) {
  if (settings.admin_bar.destination) {
    $('a.admin-bar-destination', $adminBar).each(function() {
      this.search += (!this.search.length ? '?' : '&') + Backdrop.settings.admin_bar.destination;
    });
  }
};

/**
 * Adjust the top level items based on the available viewport width.
 */
Backdrop.adminBar.behaviors.collapseWidth = function (context, settings, $adminBar) {
  var $menu = $adminBar.find('#admin-bar-menu');
  var $extra = $adminBar.find('#admin-bar-extra');
  var menuWidth;
  var extraWidth;
  var availableWidth;

  var adjustItems = function () {
    // Expand the menu items to their full width to check their size.
    $menu.removeClass('dropdown').addClass('top-level');
    $extra.removeClass('dropdown').addClass('top-level');

    $adminBar.trigger('beforeResize');

    menuWidth = $menu.width();
    extraWidth = $extra.width();

    // Available width is anything except the menus that may be collapsed.
    availableWidth = $adminBar.width();
    $adminBar.children().children().not($menu).not($extra).each(function() {
      availableWidth -= $(this).width();
    });

    // Collapse the extra items first if needed.
    if (availableWidth - menuWidth - extraWidth < 20) {
      $extra.addClass('dropdown').removeClass('top-level');
      extraWidth = $extra.width();
    }
    // See if the menu also needs to be collapsed.
    if (availableWidth - menuWidth - extraWidth < 20) {
      $menu.addClass('dropdown').removeClass('top-level');
    }
    $adminBar.trigger('afterResize');
  };


  adjustItems();
  // Adjust items when window is resized.
  Backdrop.optimizedResize.add(adjustItems);

};

/**
 * Apply JavaScript-based hovering behaviors.
 *
 * @todo This has to run last.  If another script registers additional behaviors
 *   it will not run last.
 */
Backdrop.adminBar.behaviors.hover = function (context, settings, $adminBar) {
  // Bind events for opening and closing menus on hover/click/touch.
  $adminBar.on('mouseenter', 'li.expandable', expandChild);
  $adminBar.on('mouseleave', 'li.expandable', closeChild);

  // On touch devices, the first click on an expandable link should not go to
  // that page, but a second click will. Use touch start/end events to target
  // these devices.
  var touchElement;
  var needsExpanding;
  $adminBar.on('touchstart touchend click', 'li.expandable > a, li.expandable > span', function(e) {
    // The touchstart event fires before all other events, including mouseenter,
    // allowing us to check the expanded state consistently across devices.
    if (e.type === 'touchstart') {
      touchElement = e.target;
      needsExpanding = $(this).siblings('ul').length > 0 && !$(this).siblings('ul').hasClass('expanded');
    }
    // If clicking on a not-yet-expanded item, expand it and suppress the click.
    if ((e.type === 'click' || e.type === 'touchend') && touchElement) {
      if (touchElement === e.target) {
        if (needsExpanding) {
          expandChild.apply($(this).parent()[0], [e]);
          e.preventDefault();
        }
        else if ($(this).is('span')) {
          closeChild.apply($(this).parent()[0], [e]);
        }
      }
      // If the touch ended on a different element than it started, suppress it.
      else if (touchElement !== e.target) {
        e.preventDefault();
      }
    }
  });

  // Close all menus if clicking outside the menu.
  $(document).bind('click', function (e) {
    if ($(e.target).closest($adminBar).length === 0) {
      $adminBar.find('ul').removeClass('expanded');
    }
  });

  function expandChild(e) {
    // Stop the timer.
    clearTimeout(this.sfTimer);

    // Display child lists.
    var $childList = $(this).children('ul');

    // Add classes for the expanded trail of links.
    $childList
      .parents('ul').addBack().addClass('expanded')
      .siblings('a, span').addClass('expanded-trail');
    // Immediately hide nephew lists.
    $childList.parent().siblings('li')
      .find('ul.expanded').removeClass('expanded').end()
      .find('.expanded-trail').removeClass('expanded-trail');
  }
  function closeChild(e) {
    // Start the timer.
    var $uls = $(this).find('> ul');
    var $link = $(this).find('> a, > span');
    this.sfTimer = setTimeout(function () {
      $uls.removeClass('expanded');
      $link.removeClass('expanded-trail');
    }, 400);
  }
};

/**
 * Apply the search bar functionality.
 */
Backdrop.adminBar.behaviors.search = function (context, settings, $adminBar) {
  var $input = $adminBar.find('.admin-bar-search input');
  // Initialize the current search needle.
  var needle = $input.val();
  // Cache of all links that can be matched in the menu.
  var links;
  // Minimum search needle length.
  var needleMinLength = 2;
  // Append the results container.
  var $results = $('<div class="admin-bar-search-results" />').insertAfter($input.parent());

  /**
   * Executes the search upon user input.
   */
  function keyupHandler(e) {
    var matches, $html, value = $(this).val();

    // Only proceed if the search needle has changed.
    if (value !== needle || e.type === 'focus') {
      needle = value;
      // Initialize the cache of menu links upon first search.
      if (!links && needle.length >= needleMinLength) {
        links = buildSearchIndex($adminBar.find('#admin-bar-menu .dropdown li:not(.admin-bar-action, .admin-bar-action li) > a'));
      }

      // Close any open items.
      $adminBar.find('li.highlight').trigger('mouseleave').removeClass('highlight');

      // Empty results container when deleting search text.
      if (needle.length < needleMinLength) {
        $results.empty();
      }
      // Only search if the needle is long enough.
      if (needle.length >= needleMinLength && links) {
        matches = findMatches(needle, links);
        // Build the list in a detached DOM node.
        $html = buildResultsList(matches);
        // Display results.
        $results.empty().append($html);
      }
      $adminBar.trigger('searchChanged');
    }
  }

  /**
   * Builds the search index.
   */
  function buildSearchIndex($links) {
    return $links
      .map(function () {
        var text = (this.textContent || this.innerText);
        // Skip menu entries that do not contain any text (e.g., the icon).
        if (typeof text === 'undefined') {
          return;
        }
        return {
          text: text,
          textMatch: text.toLowerCase(),
          element: this
        };
      });
  }

  /**
   * Searches the index for a given needle and returns matching entries.
   */
  function findMatches(needle, links) {
    var needleMatch = needle.toLowerCase();
    // Select matching links from the cache.
    return $.grep(links, function (link) {
      return link.textMatch.indexOf(needleMatch) !== -1;
    });
  }

  /**
   * Builds the search result list in a detached DOM node.
   */
  function buildResultsList(matches) {
    var $html = $('<ul class="dropdown" />');
    $.each(matches, function () {
      var result = this.text;
      var $element = $(this.element);

      // Check whether there is a parent category that can be prepended.
      var $category = $element.parent().parent().parent();
      var categoryText = $category.find('> a').text();
      if ($category.length && categoryText) {
        result = categoryText + ': ' + result;
      }

      var $result = $('<li><a href="' + $element.attr('href') + '">' + result + '</a></li>');
      $result.data('original-link', $(this.element).parent());
      $html.append($result);
    });
    return $html;
  }

  /**
   * Highlights selected result.
   */
  function resultsHandler(e) {
    var $this = $(this);
    var show = e.type === 'mouseenter' || e.type === 'focusin' || e.type === 'touchstart';
    // Supress the normal click handling on first touch, only highlighting.
    if (e.type === 'touchstart' && !$(this).hasClass('active-search-item')) {
      e.preventDefault();
    }
    if (show) {
      $adminBar.find('.active-search-item').removeClass('active-search-item');
      $(this).addClass('active-search-item');
    }
    else {
      $(this).removeClass('active-search-item');
    }
    $this.trigger(show ? 'showPath' : 'hidePath', [this]);
  }

  /**
   * Closes the search results and clears the search input.
   */
  function resultsClickHandler(e, link) {
    var $original = $(this).data('original-link');
    $original.trigger('mouseleave');
    $input.val('').trigger('keyup');
  }

  /**
   * Shows the link in the menu that corresponds to a search result.
   */
  function highlightPathHandler(e, link) {
    if (link) {
      $adminBar.find('li.highlight').removeClass('highlight');
      var $original = $(link).data('original-link');
      var show = e.type === 'showPath';
      // Toggle an additional CSS class to visually highlight the matching link.
      $original.toggleClass('highlight', show);
      $original.trigger(show ? 'mouseenter' : 'mouseleave');
    }
  }

  function resetSearchDisplay(e) {
    $adminBar.find('#admin-bar-extra > li > ul > li:not(li.admin-bar-search)').css('display', '');
  }
  function updateSearchDisplay(e) {
    // Build the list of extra items to be hidden if in small window mode.
    var $hideItems = $adminBar.find('#admin-bar-extra > li > ul > li:not(li.admin-bar-search)').css('display', '');
    if ($results.children().length) {
      if ($adminBar.find('#admin-bar-extra').hasClass('dropdown')) {
        $hideItems.css('display', 'none');
      }
    }
  }

  // Attach showPath/hidePath handler to search result entries.
  $results.on('touchstart mouseenter focus blur', 'li', resultsHandler);
  // Hide the result list after a link has been clicked.
  $results.on('click', 'li', resultsClickHandler);
  // Attach hover/active highlight behavior to search result entries.
  $adminBar.on('showPath hidePath', '.admin-bar-search-results li', highlightPathHandler);
  // Show/hide the extra parts of the menu on resize.
  $adminBar.on('beforeResize', resetSearchDisplay);
  $adminBar.on('afterResize searchChanged', updateSearchDisplay);
  // Attach the search input event handler.
  $input.bind('focus keyup search', keyupHandler);

  // Close search if clicking outside the menu.
  $(document).on('click', function (e) {
    if ($(e.target).closest($adminBar).length === 0) {
      $results.empty();
    }
  });
};

/**
 * @} End of "defgroup admin_behaviors".
 */

})(jQuery);
