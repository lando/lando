/**
 * @file
 * Responsive Admin tabs.
 */

(function ($) {
"use strict";

Backdrop.behaviors.responsivePrimaryTabs = {
  attach: function(context, settings) {
    var $primaryTabs = $(context).find('ul.tabs.primary').once('responsive-tabs');
    if ($primaryTabs.length === 0) {
      return;
    }

    var $tabsWrapper = $primaryTabs.parent();
    var $tabs = $('li', $primaryTabs);
    var responsiveTabs = false;
    var previousWindowWidth;
    var tabWidths = [];
    var tabHeight;
    var widestTabWidth = 0;
    var expandControlWidth;
    var activeTabNth = $('li.active', $primaryTabs).index();
    var expandedTabsHeaderPadding = 0;
    var defaultHeaderPadding = '20px';
    var $mobileHeaderPadder = $('<div class="responsive-tabs-mobile-header-padder" style="height: ' + expandedTabsHeaderPadding + 'px"></div>');
    var $body = $('body');
    var tabsWrapperPadding = {
      'top': parseInt($tabsWrapper.css('padding-top').replace("px", "")),
      'right': parseInt($tabsWrapper.css('padding-right').replace("px", "")),
      'left': parseInt($tabsWrapper.css('padding-left').replace("px", ""))
    };

    // These are essentially breakpoints to be measured against the tabArea.
    var allTabsWidth;             // Will show all tabs.
    var activeTabAndBeforeWidth;  // Will chop off tabs after active tab.
    var activeTabAndAfterWidth;   // Will chop off tabs before active tab.

    function initResponsivePrimaryTabs() {
      tabHeight = $('li:first-child', $primaryTabs).outerHeight();
      $tabsWrapper.once('responsive-tabs', function(){
        $primaryTabs.after(
          '<div class="expand-dropdown-tabs-control" aria-hidden="true" style="height: ' + tabHeight + 'px">' +
            '<span class="expand-dropdown-tabs-label"></span>' +
          '</div>'
        );
        $('.expand-dropdown-tabs-control', $tabsWrapper).click(function(){
          $tabsWrapper.toggleClass('expand-dropdown-tabs');
          $(this).toggleClass('js-active');
          // If there's not enough room for mobile tabs.
          if (expandedTabsHeaderPadding > 0 && $tabsWrapper.hasClass('expand-dropdown-tabs')) {
            $mobileHeaderPadder.css('height', expandedTabsHeaderPadding + 'px');
            $body.prepend($mobileHeaderPadder);
            $body.scrollTop($body.scrollTop() + expandedTabsHeaderPadding);
          } else {
            $mobileHeaderPadder.remove();
            $body.scrollTop($body.scrollTop() - expandedTabsHeaderPadding);
          }
        });

        // Add control as first item.
        expandControlWidth = $('.expand-dropdown-tabs-control', $tabsWrapper).outerWidth();

        // Wrap tab link text with wrapper so we can get tab width if font size is updated
        $tabs.find('a').wrapInner('<span class="responsive-tabs-link-text-wrapper"></span>');

        calculateTabWidths();

        // Add classes to display tabs correctly for current screen width.
        adjustTabsDisplay();
      });
    }

    initResponsivePrimaryTabs();

    function calculateTabWidths() {
      // Reset var
      tabWidths = [];

      // Calculate the tab widths before we do anything that will change them.
      // Add expandControlWidth as first tab.
      allTabsWidth = expandControlWidth;
      activeTabAndBeforeWidth = expandControlWidth;
      activeTabAndAfterWidth = expandControlWidth;
      // Add each tab width.
      $tabs.each(function(i) {
        // Tab width is text width + 20px padding on both sides + 2px border-right
        var currentTabWidth = $('.responsive-tabs-link-text-wrapper', this).outerWidth() + 42;
        tabWidths.push(currentTabWidth);
        allTabsWidth += currentTabWidth;
        if (i <= activeTabNth) {
          activeTabAndBeforeWidth += currentTabWidth;
        }
        if (i >= activeTabNth) {
          activeTabAndAfterWidth += currentTabWidth;
        }
        if (currentTabWidth > widestTabWidth) {
          widestTabWidth = currentTabWidth;
        }
      });

      if (activeTabNth === 0) {
        activeTabAndBeforeWidth += tabWidths[1];
      } else if (activeTabNth === $tabs.length - 1) {
        activeTabAndAfterWidth += tabWidths[$tabs.length - 2];
      }

    }

    function closeTabsDropdown() {
      $tabsWrapper.removeClass('expand-dropdown-tabs');
      $tabsWrapper.find('.expand-dropdown-tabs-control').removeClass('js-active');
      $mobileHeaderPadder.remove();
    }

    function handleResize() {
      var currentWindowWidth = $(window).width();

      // Only fire this if window width has changed.
      if (currentWindowWidth !== previousWindowWidth) {
        // Set previousWindowWidth for next event.
        previousWindowWidth = currentWindowWidth;

        // Shut tabs dropdown if it's open
        closeTabsDropdown();

        // Add classes to display tabs correctly for current screen width.
        adjustTabsDisplay();
      }
    }

    function adjustTabsDisplay() {
      var responsiveTabsType;
      // Make sure that we've run initResponsivePrimaryTabs(),
      // and that there are tabs on this page.
      if (tabWidths.length > 0) {
        var tabArea = $primaryTabs.outerWidth();
        var accumulatedTabWidth = expandControlWidth;

        if (tabArea >= allTabsWidth) {
          responsiveTabs = false;
          $tabsWrapper.addClass('desktop-primary-tabs');
          $tabsWrapper.removeClass('responsive-tabs-before responsive-tabs-after responsive-tabs-mobile');

          // Cleanup things that may have been left over from other
          // responsive tab strategies.
          $primaryTabs.find('.duplicated-tab').removeClass('duplicated-tab');
          $tabsWrapper.find('.responsive-tabs-dropdown').remove();
          $primaryTabs.css({'padding-left': '', 'top': '' });
        }
        else {
          responsiveTabs = true;

          /**
           * Responsive tab strategies.
           * 'andBefore'  Show the active tab and the ones before it.
           * 'andAfter'   Show the active tab and the ones after it.
           * 'mobile'     Put all tabs in a dropdown.
           */
          var $responsiveTabsDropdown = $('<ul class="primary responsive-tabs-dropdown" aria-hidden="true" style="top: ' + (tabHeight + tabsWrapperPadding.top) + 'px; width: ' + (widestTabWidth + expandControlWidth + 20) + 'px"></ul>');
          if (tabArea >= activeTabAndBeforeWidth) {
            /**
             * 'andBefore' Responsive Tab Strategy.
             */
            responsiveTabsType = 'andBefore';

            var $lastVisibleTab = null;
            // Manage classes on tabs.
            $tabs.each(function(i) {
              accumulatedTabWidth += tabWidths[i];
              if (responsiveTabsType === 'andBefore') {
                if (i <= activeTabNth || accumulatedTabWidth <= tabArea) {
                  $(this).removeClass('duplicated-tab');
                  $lastVisibleTab = $(this);
                }
                else {
                  $responsiveTabsDropdown.append($(this).clone());
                  $(this).addClass('duplicated-tab');
                }
              }
            });

            // Manage classes on wrapper.
            $tabsWrapper.addClass('responsive-tabs-before')
              .removeClass('desktop-primary-tabs responsive-tabs-after responsive-tabs-mobile');

            // Apply expand control's position.
            var expandControlLeft = $lastVisibleTab.position().left + $lastVisibleTab.outerWidth() + tabsWrapperPadding.left;
            $('.expand-dropdown-tabs-control', $tabsWrapper).css('left', expandControlLeft);
            $responsiveTabsDropdown.css('right', tabArea - expandControlLeft - expandControlWidth + tabsWrapperPadding.right + tabsWrapperPadding.left);

            // Cleanup things that may have been left over from other
            // responsive tab strategies.
            $primaryTabs.css('padding-left', 0);
            expandedTabsHeaderPadding = 0;
          }
          else if (tabArea >= activeTabAndAfterWidth) {
            /**
             * 'andAfter' Responsive Tab Strategy
             */
            responsiveTabsType = 'andAfter';
            accumulatedTabWidth = expandControlWidth;

            // In order to get this dropdown to lay out correctly
            // making new element that comes after the shown tabs.
            // Iterate through tabs in reverse and give appropriate classes.
            $($tabs.get().reverse()).each(function(reverseI) {
              var i = $tabs.length - 1 - reverseI;
              accumulatedTabWidth += tabWidths[i];
              if (i >= activeTabNth || accumulatedTabWidth <= tabArea) {
                $(this).removeClass('duplicated-tab');
              }
              else {
                $responsiveTabsDropdown.prepend($(this).clone());
                $(this).addClass('duplicated-tab');
              }
            });

            // Dropdown control gets left aligned.
            $('.expand-dropdown-tabs-control', $tabsWrapper).css('left', tabsWrapperPadding.left);
            $primaryTabs.css('padding-left', expandControlWidth);

            // Manage classes on wrapper.
            $tabsWrapper.addClass('responsive-tabs-after').removeClass('desktop-primary-tabs responsive-tabs-before responsive-tabs-mobile');

            // Cleanup things that may have been left over from other
            // responsive tab strategies.
            expandedTabsHeaderPadding = 0;
          }
          else {
            /**
             * 'mobile' Responsive Tab Strategy.
             */
            responsiveTabsType = 'mobile';

            // Manage classes on tabs and wrappers
            $primaryTabs.find('.duplicated-tab').removeClass('duplicated-tab');
            $tabsWrapper.addClass('responsive-tabs-mobile').removeClass('responsive-tabs-before responsive-tabs-after desktop-primary-tabs');

            // Figure out how to lay primary tabs behind the expand control.
            var tabsOffset = activeTabNth * (tabHeight + 2);
            var tabsTopDistance = $tabsWrapper.position().top;
            $primaryTabs.css('top', '-' + tabsOffset + 'px');
            if (tabsOffset > tabsTopDistance) {
              expandedTabsHeaderPadding = tabsOffset - tabsTopDistance + defaultHeaderPadding;
            }

            // Get the active tab's text.
            var $activeTabText = $('<span class="expand-dropdown-tabs-label">' + $primaryTabs.find('li.active a').html() + '</span>');
            $activeTabText.find('.element-invisible').remove();
            $tabsWrapper.find('.expand-dropdown-tabs-label').replaceWith($activeTabText);
            $tabsWrapper.find('.expand-dropdown-tabs-control').css('left', 'auto');

            // Cleanup things that may have been left over from other
            // responsive tab strategies.
            $tabsWrapper.find('.responsive-tabs-dropdown').remove();
            $primaryTabs.css('padding-left', 0);
          }

          // Insert $responsiveTabsDropdown to markup if it's not empty.
          if ($responsiveTabsDropdown.find('li').length > 0) {
            $responsiveTabsDropdown.find('.duplicated-tab').removeClass('duplicated-tab');
            if ($tabsWrapper.find('.responsive-tabs-dropdown').length > 0) {
              $tabsWrapper.find('.responsive-tabs-dropdown').replaceWith($responsiveTabsDropdown);
            }
            else {
              $primaryTabs.after($responsiveTabsDropdown);
            }
          }
        }
      }
    }

    // If they click outside of the responsive tabs, shut them
    $('html').click(function(e){
      var $target = $(e.target);
      if (responsiveTabs && !$target.is('.responsive-tabs-processed') && $target.parents('.responsive-tabs-processed').length < 1) {
        closeTabsDropdown();
      }
    });

    Backdrop.isFontLoaded('Open Sans', function() {
      adjustTabsDisplay();
      calculateTabWidths();
    });

    Backdrop.optimizedResize.add(handleResize);
    $(document).ready(handleResize);
  }

}

})(jQuery);
