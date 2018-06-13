//----------------------------------------------------------------------------

//declare external to domready to use in function
var oSlidePage;
var oReservationTweenTab;
var oActiviteTweenTab;
var oFavorites;
var legendtoreplace = '';
var iFBTimer;
var sCalendarFormat = 'd/m/Y';
var sCalendar96Format = '%d/%m/%Y';
var sToday;
var sTomorrow;

var iPageLeftMoveTo = 534;
var iPageRightMoveFrom = -534;

//----------------------------------------------------------------------------

/**
 * addThis config
 *
 */
var addthis_config = {
  data_use_flash: false
}

/**
 * addEvent on load
 *
 */
window.addEvent('load', function() {
  //Cufon call
  try {
    Cufon.replace('.menu_100 li a span, .partenaire li span, .is_vignette span, .offres_heb li span, .whiteBold, .paragraph h4, .paragraph-colonne h4, .bbrown, .sansa_black, h2 span', {fontFamily: 'SansBlack'});
    Cufon.replace('.white, .brown, .blue, .green, .black, .highlight_toggler h5, .media h2 span, .paragraph h3, .sansa', {fontFamily: 'SansaWeb'});
    Cufon.replace('.sansa_bold', {fontFamily: 'SansaWebBold'});
    Cufon.replace('h2:not(.nocufon)', {
      ignore: {
        span: true
      },
      fontFamily: 'SansaWeb'
    });
    Cufon.replace('.SansaBlack', {
      hover: true,
      hoverables: { span: true },
      fontFamily: 'SansBlack'
    });
    Cufon.replace('.Sansa', {
      hover: true,
      hoverables: { span: true },
      fontFamily: 'SansaWeb'
    });
    Cufon.replace('.bloc-temoignage .descr a', {
      hover: true,
      hoverables: { span: true },
      fontFamily: 'SansaWebBold'
    });
    Cufon.now(); //no view delay in IE7
  } catch (e) {}
});

/**
 * addEvent on domready
 *
 */

window.addEvent('domready', function() {
  
  //Slideshow coup de coeur
  if($('gallery')) {
    var gallery = new slideGallery($$('.gallery-cdc'), {
      autoplay: true
    });
  }

  //Slideshow notre slection
  if($('sliderWE')) {
    var gallery = new slideGallery($$('.slider'), {
      autoplay: true
    });
  }

  //Slideshow liste article
  if($$('.slider-article').length > 0) {
        $$('.slider-article').each( function(oElem) {
            var gallery = new slideGallery(oElem, {
                autoplay: true
            });
        });
  }

  // Gestion encart newsletter
  if( $('encart_nl') ) {
    var oFxNL = new Fx.Tween($$('.element.newsletter')[0], {
      transition: 'linear',
      property: 'height'
    });
    var iHeightNL = 214;
    var oNews = $$('.element.newsletter')[0];
    $$('#encart_nl').addEvent('mouseover', function() {
      oNews.addClass('displayed');
      oFxNL.start(0, iHeightNL);
    });
    $$('#close_nl').addEvent('click', function() {
      oNews.removeClass('displayed');
      oFxNL.start(iHeightNL, 0);
    });
    
    if( typeof bDisplayNL != 'undefined' && bDisplayNL )
      $('encart_nl').fireEvent('mouseover');
  }

  // define date format  
  initDateFormat(iGlobVersion);

  // define slider left/right move to/from
  if ($('pageContent'))
  {
    iPageLeftMoveTo = $('pageContent').getWidth();
    iPageRightMoveFrom = -($('pageContent').getWidth());
  }

  // Gestion Google track event pour auvergne.travel/en
  if (typeof (pageTrack) != "undefined")
    pageTracker._trackEvent('From', 'Travel');

  initChangeLocation();

  //------------------------------------------------------------------------

  /**
   * slide top button
   *
   */
  $('pageContent').addEvent('scroll', function() {
    if (this.getScroll().y == 0)
    {
      $$('.slidetop').fade(0);
    }
    else
    {
      $$('.slidetop').fade(1);
    }
  });
  $$('.slidetop').addEvent('click', function() {
    $('pageContent').scrollTo(0);
  });

  //------------------------------------------------------------------------

  /**
   * flash
   *
   */

  function setSlideVideoBtnPosition()
  {
    var iBodySizeX = $('body').getSize().x;
    var iPageSizeX = $('page').getSize().x;
    var iPageRightPos = parseInt($('page').getStyle('right'), 10);
    var iBkgVideoSizeX = parseInt($('bkgVideo').getStyle('width'), 10);
    var iBkgVideoSizeY = parseInt($('bkgVideo').getStyle('height'), 10);
    $('bkgVideo').setStyle('left', ((iBodySizeX - iPageSizeX - iPageRightPos) / 2 - iBkgVideoSizeX / 2) + 'px');
    $('bkgVideo').setStyle('top', (($('body').getSize().y / 2) - iBkgVideoSizeY / 2) + 'px');
  }

  if (!$defined(sSection))
    sSection = 'default';

  if ($('bkgdFlash'))
  {
    SlideShowInterest.getInstance(
      $('bkgdFlash'),
      {
        dimensions:
        {
          slide:
            {
              width: $('bkgdFlash').getSize().x - $('bkgdFlash').getStyle('padding-left').toInt() - $('bkgdFlash').getStyle('padding-right').toInt(),
              height: $('bkgdFlash').getSize().y - $('bkgdFlash').getStyle('padding-top').toInt() - $('bkgdFlash').getStyle('padding-bottom').toInt()
            }
        },
        transition:
        {
          deadtime: 6000,
          show: {duration: 1000},
          hide: {duration: 2000}
        }
      }
    );

    window.addEvent('resize', function()
    {
      SlideShowInterest.getInstance().resize();
      if ($('bkgVideo'))
        if ($('bkgVideo').getStyle('display') == 'block')
          setSlideVideoBtnPosition();
    }
    );

    aXMLDiapo.each(function(oSlide)
    {
      SlideShowInterest.getInstance().addSlide(oSlide.file);
      SlideShowInterest.getInstance().addPOI(oSlide.poi);
    }
    );

    var iCurrentIndex = 0;
    SlideShowInterest.getInstance().addEvents({
      'loaded': function()
      {
        SlideShowInterest.getInstance().handleAllPOI(($('body').getSize().x - $('page').getSize().x) / 2);
        SlideShowInterest.getInstance().start();

        if (aXMLDiapo && aXMLDiapo.length > 1)
        {
          $('bkgdFlashNext').addEvent('click', function()
          {
            SlideShowInterest.getInstance().showSlide(SlideShowInterest.getInstance().getNextIndex());
          }
          );
          $('bkgdFlashPrevious').addEvent('click', function()
          {
            SlideShowInterest.getInstance().showSlide(SlideShowInterest.getInstance().getPreviousIndex());
          }
          );
          $('bkgdFlashPause').addEvent('click', function()
          {
            if (SlideShowInterest.getInstance().oTimer)
              SlideShowInterest.getInstance().stop();
            else
              SlideShowInterest.getInstance().start();
          }
          );
        }
        else
        {
          $('bkgdFlashNext').setStyle('display', 'none');
          $('bkgdFlashPrevious').setStyle('display', 'none');
          $('bkgdFlashPause').setStyle('display', 'none');
        }

        /* if not home */
        if (sSection != 1)
        {
          $('bkgdFlash').addEvent('mousemove', function(event)
          {
            var sImg = 'img/global/slideShow/more-less_' + sSeasonColor + '.png';

            $('bkgCursor').set('class', 'state-' + SlideShowInterest.getInstance().options.state);
            $('bkgCursor').setStyle('background-image', 'url(' + sImg + ')');
            $('bkgCursor').setStyle('left', (event.client.x + 20) + 'px');
            $('bkgCursor').setStyle('top', (event.client.y + 20) + 'px');
            $('bkgCursor').setStyle('display', 'block');
          }
          );

          $('bkgdFlash').addEvent('mouseleave', function()
          {
            $('bkgCursor').setStyle('display', 'none');
            $('bkgCursor').setStyle('left', '-100px');
            $('bkgCursor').setStyle('top', '-100px');
          }
          );

          var oVideoMove = new Fx.Tween(
            'bkgVideo',
            {
              wait: false,
              transition: Fx.Transitions.Sine.easeOut,
              duration: 500
            }
          );

          oSlidePage.addEvents({
            'slideInStart': function(e) {
              /* slide In - full view -  the video button */
              if ($('bkgVideo'))
              {
                if ($('bkgVideo').getStyle('display') == 'block')
                {
                  var iBodySizeX = $('body').getSize().x;
                  var iPageSizeX = $('page').getSize().x;
                  var iBkgVideoSizeX = parseInt($('bkgVideo').getStyle('width'), 10);
                  oVideoMove.start(
                    'left',
                    ((iBodySizeX - iPageSizeX + iPageLeftMoveTo) / 2 - iBkgVideoSizeX / 2)
                  );
                }
              }
              SlideShowInterest.getInstance().handlePOI(iCurrentIndex, 0);
            },
            'slideOutStart': function(e) {
              /* slide Out - partial view - of the video button */
              if ($('bkgVideo'))
              {
                if ($('bkgVideo').getStyle('display') == 'block')
                {
                  var iBodySizeX = $('body').getSize().x;
                  var iPageSizeX = $('page').getSize().x;
                  var iBkgVideoSizeX = parseInt($('bkgVideo').getStyle('width'), 10);
                  oVideoMove.start(
                    'left',
                    ((iBodySizeX - iPageSizeX) / 2 - iBkgVideoSizeX / 2)
                  );
                }
              }
              SlideShowInterest.getInstance().handlePOI(iCurrentIndex, ($('body').getSize().x - $('page').getSize().x) / 2);
            },
            'slideOutComplete': function(e) {
              SlideShowInterest.getInstance().handleAllPOI(($('body').getSize().x - $('page').getSize().x) / 2);
            },
            'slideInComplete': function(e) {
              SlideShowInterest.getInstance().handleAllPOI(($('body').getSize().x - $('page').getSize().x) / 2);
            }
          });
          $('bkgdFlash').addEvent('click', function()
          {
            if (SlideShowInterest.getInstance().options.state == SlideShowInterest.getInstance().STATE_FULL)
            {
              SlideShowInterest.getInstance().options.state = SlideShowInterest.getInstance().STATE_PARTIAL;
              oSlidePage.slideOut();
            }
            else
            {
              SlideShowInterest.getInstance().options.state = SlideShowInterest.getInstance().STATE_FULL;
              oSlidePage.slideIn();
            }

            $('bkgCursor').set('class', 'state-' + SlideShowInterest.getInstance().options.state);
          }
          );
        }
      }.bind(this),
      'hideStart': function()
      {
        if (sSection != 1)
          SlideShowInterest.getInstance().handlePOI(SlideShowInterest.getInstance().getCurrent(), ($('body').getSize().x - $('page').getSize().x) / 2);
      }.bind(this),
      'showComplete': function()
      {
        if (sSection != 1)
          SlideShowInterest.getInstance().handlePOI(SlideShowInterest.getInstance().getNextIndex(), ($('body').getSize().x - $('page').getSize().x) / 2);
      }.bind(this)

    });

    var sBasehref = '';
    $$('base').each(function(el) {
      if (el.href.trim() != '')
        sBasehref = el.href.trim();
    });

    /* Legend Background */
    SlideShowInterest.getInstance().addEvent('slide-changed',
            function()
            {
              var iIndex = iCurrentIndex = SlideShowInterest.getInstance().getCurrent();
              if (legendtoreplace == '')
                legendtoreplace = $$('#legendSlideContent .legend1').get('href')[0];

              if (aXMLDiapo[iIndex].GPSLatitude != '' && aXMLDiapo[iIndex].GPSLatitude != 0
                      && aXMLDiapo[iIndex].GPSLongitude != '' && aXMLDiapo[iIndex].GPSLongitude != 0)
              {
                var sLegend = legendtoreplace;
                sLegend = sLegend.replace(/¤GPSLatitude¤/g, aXMLDiapo[iIndex].GPSLatitude);
                sLegend = sLegend.replace(/¤GPSLongitude¤/g, aXMLDiapo[iIndex].GPSLongitude);

                $$('.home_legend .legend1').setStyle('display', 'block');
                $$('.home_legend .legend1').set('href', sLegend);
              } else
                $$('.home_legend .legend1').setStyle('display', 'none');

              $('legendFlash').set('html', aXMLDiapo[iIndex].legend);

              if (aXMLDiapo[iIndex].idFicheSteno != '')
              {
                $$('.home_legend .legend2').setStyle('display', 'block');
                $$('.home_legend .legend2').set('href', aXMLDiapo[iIndex].idFicheSteno);
              }
              else
                $$('.home_legend .legend2').setStyle('display', 'none');

              if (aXMLDiapo[iIndex].alt != '')
                $$('#legendCarto img').set('class', 'alt' + aXMLDiapo[iIndex].alt);
              else
                $$('#legendCarto img').set('class', '');

              if ($chk(aXMLDiapo[iIndex].video) && aXMLDiapo[iIndex].video != '')
              {
                setSlideVideoBtnPosition();
                $('bkgVideo').getElement('a').removeEvents();
                $('bkgVideo').getElement('a').addEvent('click', function() {
                  viewVideo(aXMLDiapo[iIndex].video)
                });
                $('bkgVideo').setStyle('display', 'block');
              }
              else
              {
                $('bkgVideo').getElement('a').removeEvents('click');
                $('bkgVideo').setStyle('display', 'none');
              }

              $$('.home_legend #legendSlide .legend5').setStyle('display', 'block');
              $$('.home_legend #legendSlide .legend5').set('href', sitePath + aXMLDiapo[iIndex].ecard);

              if (aXMLDiapo[iIndex].background != false)
              {
                $$('.home_legend #legendSlide .legend6').setStyle('display', 'block');
                $$('.home_legend #legendSlide .legend6').set('href', sitePath + aXMLDiapo[iIndex].background);
              } else
              {
                $$('.home_legend #legendSlide .legend6').setStyle('display', 'none');
              }


              if (aXMLDiapo[iIndex].screenSaverPath != '')
              {
                $$('.home_legend .legend7').setStyle('display', 'block');
                $$('.home_legend .legend7').set('href', 'javascript:window.open("' + aXMLDiapo[iIndex].screenSaverPath + '", "_blank");void(0);');
              } else
                $$('.home_legend .legend7').setStyle('display', 'none');

            }
    );
    SlideShowInterest.getInstance().loadSlides();
  }

  //------------------------------------------------------------------------

  /**
   * slide page
   *
   */
  if ($('page') && $('slogan'))
  {
    // set width of page content

    //set position of slogan
    iPagePositionX = $('page').getPosition().x;
    iSloganPositionX = iPagePositionX - 158 + iPageLeftMoveTo;

    //slide page
    oSlidePage = new SlidePage(
      'page',
      {
        move: {
          from: iPageRightMoveFrom
        }
      }
    );

    oSlideSlogan = new SlidePage(
            'slogan',
            {
              move: {
                property: 'left',
                from: iSloganPositionX,
                to: 20
              }
            }
    );

    //add event to activate other slide
    oSlidePage.addEvent('slideInStart', function(e) {
      oSlideSlogan.slideIn();
      $$('.page_content .objects_cart').setStyle('display', 'none');
    });
    oSlidePage.addEvent('slideOutStart', function(e) {
      oSlideSlogan.slideOut();
    });
    oSlidePage.addEvent('slideOutComplete', function(e) {
      $$('.page_content .objects_cart').setStyle('display', 'block');
    });

    //add event on link
    $$('a').each(function(el) {
      if (!el.hasClass('smoothbox') && !el.hasClass('broch') && (el.target && el.target != '_blank'))
      {
        el.addEvent('click', function(e) {
          e.stop();

          //change page after move
          oSlidePage.addEvent('slideInComplete', function(e) {
            window.location = el.href;
          });
          oSlidePage.addEvent('slideOutComplete', function(e) {
            window.location = el.href;
          });

          if (oMenuOverTweenTab)
          {
            oMenuOverTweenTab.addEvent('hideStart', function(e) {
              //clear timer - not open new section during close move
              $clear(oMenuTweenTab.iChangeTimer);
            });
            oMenuOverTweenTab.addEvent('hideComplete', function(e) {
              oMenuOverTweenTab.removeEvents();
              oMenuTweenTab.hideCurrentElement();
            });

            oMenuTweenTab.addEvent('hideStart', function(e) {
              //clear timer - not open new section during close move
              $clear(oMenuTweenTab.iChangeTimer);
            });
            oMenuTweenTab.addEvent('hideComplete', function(e) {
              oMenuTweenTab.removeEvents();

              //href
              if (el.href.contains('home.html'))
              {
                //oSlidePage.slideIn();
                oBkgdFlash.viewEnlarge();
              }
              else if ($('pageContent').getChildren().length == 0 && !el.href.contains('home.html') && !el.href.contains('javascript'))
                oSlidePage.slideOut();
              else
                window.location = el.href;
            });

            oMenuOverTweenTab.hideCurrentElement();
          }
        });
      }
    });

  }

  //------------------------------------------------------------------------

  /**
   * calendar on menu over
   *
   */
  oCalendar = new Calendar(
    {commonCalendarInput: sCalendarFormat},
    {
      inject: 'calendarContainer',
      offset: 1,
      submitClick: true,
      scroll: false
    }
  );
  try
  {
    if ($chk(oCalendar.calendars) && oCalendar.calendars.length > 0 && $chk(oCalendar.calendars[0]))
    {
      oCalendar.toggle(oCalendar.calendars[0]);
      oCalendar.addEvent('submitForm', function() {
        $('common_form_cal').submit();
      });
    }
  } catch (e) {
  }

  //------------------------------------------------------------------------

  /**
   * legend
   * Adapted if new design activated
   */
	if( $$('.new_design').length > 0 ) {
		$$('.legend').addEvent('click', function(){
			// do it if legend exists
			if( this.getElements('.noarrow').length == 0 ) {
				$(this).getElements('.legend_top').toggleClass('open');
				$(this).getElements('.arrow').toggleClass('open');
			}
		});
	}
	else {
		$$('.legend').addEvent('click', function(){
			if( $(this).getElements('.legend_top').getStyle('display') != 'block' ) {
				$(this).getElements('.legend_top').setStyle('display', 'block');
			}
			else {
				$(this).getElements('.legend_top').setStyle('display', 'none');
			}
		});
	}

  //------------------------------------------------------------------------

  /**
   * navigationTop
   *
   */
  if ($('topNavigationSisterSlide') && $('topNavigationSister'))
  {
    var iSisterSlideHeight = $('topNavigationSisterSlide').getFirst('div').getSize().y;
    var oSisterSlideTween = new Fx.Tween(
            $('topNavigationSisterSlide')
            );
    $('topNavigationSister').addEvent('mouseenter', function(e) {
      $('topNavigationSister').addClass('sister_active');
      oSisterSlideTween.start('height', iSisterSlideHeight);
    });
    $('topNavigationSister').addEvent('mouseleave', function(e) {
      oSisterSlideTween.addEvent('onComplete', function(el) {
        oSisterSlideTween.removeEvents();
        $('topNavigationSister').removeClass('sister_active');
      });
      oSisterSlideTween.start('height', 0);
    });
  }

  //------------------------------------------------------------------------

  /**
   * rechercheFullText
   *
   */
  if ($('menuFullTextSlide') && $('menuFullText'))
  {
    var iFullTextSlideHeight = $('menuFullTextSlide').getFirst('div').getSize().y;
    var oFullTextSlideTween = new Fx.Tween(
            $('menuFullTextSlide'),
            {
              onComplete: function() {
                $('menuFullText').removeClass('fulltext_active');
              },
              onStart: function() {
                $('menuFullText').addClass('fulltext_active');
              }
            }
    );
    $('menuFullText').addEvent('mouseenter', function(e) {
      oFullTextSlideTween.start('height', iFullTextSlideHeight);
    });
    $('menuFullText').addEvent('mouseleave', function(e) {
      oFullTextSlideTween.start('height', 0);
    });
  }

  //------------------------------------------------------------------------

  //------------------------------------------------------------------------
  /**
   * tweenTab on menu
   *
   */

  //Fix if no space to display menu
  window.addEvent('resize', function() {
    var oMenuOver = $$('#page .menu_over');
    var oWindowSize = window.getSize();
    var oPageSize = $('page').getSize();
    if (oWindowSize.x - oPageSize.x < 230)
    {
      oMenuOver.setStyle('right', 'auto');
      oMenuOver.setStyle('left', '210px');
    }
    else
    {
      oMenuOver.setStyle('right', '210px');
      oMenuOver.setStyle('left', 'auto');
    }
  });

  oMenuTweenTab = new TweenTab(
          'page',
          {
            change: {
              link: 'mouseenter',
              delay: 0
            },
            cssSelector: {
              link: '.menu',
              block: '.menu_over'
            },
            element: {
              blockPrefix: 'TweenMenu',
              linkPrefix: 'TweenMenuLink'
            },
            move: {
              property: 'width',
              from: '0',
              to: '230',
              duration: 100
            },
            auto_close: {
              active: true,
              delay: 500
            }
          }
  );

  oMenuOverTweenTab = new TweenTab(
          'page',
          {
            change: {
              link: 'mouseenter',
              delay: 200
            },
            cssSelector: {
              link: '.menu li a',
              block: '.menu_over .content'
            },
            element: {
              blockPrefix: 'TweenMenuOver',
              linkPrefix: 'TweenMenuOverLink'
            },
            move: {
              property: 'width',
              from: '0',
              to: '180',
              duration: 200
            },
            auto_close: {
              active: true,
              delay: 200
            },
            activeLink: function(sId) {
              $(sId).addClass('active');
            },
            disableLink: function(sId) {
              $(sId).removeClass('active');
            }
          }
  );

  //------------------------------------------------------------------------

  /**
   * tweenTab on block_selection
   *
   */
  if ($('activiteSlideshow'))
  {
    oActiviteTweenTab = new TweenTab(
            'activiteSlideshow',
            {
              cssSelector: {
                link: '.navigation li a',
                block: '.element_activity'
              },
              element: {
                blockPrefix: 'TweenActivite',
                linkPrefix: 'TweenActiviteLink'
              },
              move: {
                property: 'opacity',
                from: '0',
                to: '1'
              },
              auto_scrolling: {
                active: true,
                period: 15000,
                period_restart: 15000
              },
              activeLink: function(sId) {
                $(sId).addClass('active');
              },
              disableLink: function(sId) {
                $(sId).removeClass('active');
              }
            }
    );
    oActiviteTweenTab.displayElement(0); //met avant à cause des eventuels pb de chargement

  }

  //------------------------------------------------------------------------

  /**
   * tweenTab on block_selection
   *
   */
  if ($('nextWE'))
  {
    oTweenNextWETweenTab = new TweenTab(
            'nextWE',
            {
              cssSelector: {
                link: '.navigation li a',
                block: '.element_activity'
              },
              element: {
                blockPrefix: 'TweenNextWE',
                linkPrefix: 'TweenNextWELink'
              },
              move: {
                property: 'opacity',
                from: '0',
                to: '1'
              },
              auto_scrolling: {
                active: true,
                period: 5000,
                period_restart: 5000
              },
              activeLink: function(sId) {
                $(sId).addClass('active');
              },
              disableLink: function(sId) {
                $(sId).removeClass('active');
              }
            }
    );
    oTweenNextWETweenTab.displayElement(0); //met avant à cause des eventuels pb de chargement

  }

  //------------------------------------------------------------------------

  /**
   * tweenTab on reservation
   *
   */
  if ($('reservationSlideshow'))
  {
    $$('#reservationSlideshow .element').setStyle('opacity', 0);
    oReservationTweenTab = new TweenTab(
            'reservationSlideshow',
            {
              cssSelector: {
                link: '.navigation li a',
                block: '.element'
              },
              element: {
                blockPrefix: 'TweenReservation',
                linkPrefix: 'TweenReservationLink'
              },
              move: {
                property: 'opacity',
                from: '0',
                to: '1'
              },
              auto_scrolling: {
                active: true,
                period: 12000,
                period_restart: 12000
              },
              activeLink: function(sId) {
                $(sId).addClass('active');
              },
              disableLink: function(sId) {
                $(sId).removeClass('active');
              }
            }
    );
    oReservationTweenTab.displayElement(0); //met avant à cause des eventuels pb de chargement
  }

  //------------------------------------------------------------------------

  /**
   * tweenTab on tools
   *
   */

  var aToolsSlideshowElementHeight = Array();
  $$('#toolsSlideshow .tools-hover .element').each(function(el, i) {
    var iTmpSize = 0;
    var aChild = el.getChildren('div');
    aChild.each(function(child) {
      iTmpSize += child.getSize().y;
    });
    aToolsSlideshowElementHeight[i] = iTmpSize;
  });
  //tools
  var oToolsTweenTab = new TweenTab(
    'toolsSlideshow',
    {
      change: {
        link: 'mouseenter',
        delay: 500
      },
      cssSelector: {
        link: '.tools li a[rel="rollover"]',
        block: '.tools-hover .element'
      },
      element: {
        blockPrefix: 'TweenTools',
        linkPrefix: 'TweenToolsLink'
      },
      move: {
        property: 'height',
        from: '0',
        to: aToolsSlideshowElementHeight
      },
      auto_close: {
        active: true
      }
    }
  );
  /**
   * "Carnet de Voyage" create and initialize
   */
  oFavorites = new FavoriCart("FavCart");
  oFavorites.display_list();
  if ($$('.fav_del_item'))
    $$('.fav_del_item').each(function(elem)
    {
      elem.addEvent('click', function()
      {
        var bReturn = del_selection(this);
        if (bReturn == true)
          alert(MooTools.lang.get('fromPHP', 'Suppression réussie'));
      });
    });
  if ($('sendfriend'))
  {
    $('sendfriend').addEvent('submit', function(e)
    {
      $$('.sendthis .addthis_content .result').setStyle('display', 'none');
      $$('.sendthis .addthis_content .formulaire').setStyle('display', 'none');
      var sUrl = $('sendfriend').action;

      e.stop();
      var myRequest = new Request(
      {
        url: sUrl,
        method: 'get',
        data: 'email=' + $('email').get('value') + '&destinataire=' + $('destinataire').get('value') + '&url=' + encodeURIComponent(window.location.href),
        onSuccess: function(responseText) {
          $$('.sendthis .addthis_content .formulaire').setStyle('display', 'none');
          $$('.sendthis .addthis_content .result').set('html', responseText);
          $$('.sendthis .addthis_content .result').setStyle('display', 'block');
        }
      });
      myRequest.send();
    });
  }

  $$('#toolsSlideshow .tools-hover .newsletter form').addEvent('submit', function(e) {
    var email = $$('#newsletter_mail').get("value")[0];
    var exp_reg_mail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,6}$/;
    if (exp_reg_mail.test(email)) {
      $('errorNL').setStyle('display', 'none');
      
      var sUrl = $('form_nl').action;
      e.stop();
      var oRequest = new Request(
      {
        url: sUrl,
        method: 'get',
        data: 'email=' + $('newsletter_mail').get('value'),
        onSuccess: function(responseText) {
          $('valideNL').setStyle('display', 'block');
        }
      });
      oRequest.send();
    }
    else {
      $('errorNL').setStyle('display', 'block');
      e.preventDefault();
    }
  });

  //------------------------------------------------------------------------

  /**
   * Tweentab on map select
   */
  oTweenTabMapSelect = new TweenTab(
    'map',
    {
      cssSelector: {
        link: '.select',
        block: '.select_content'
      },
      element: {
        blockPrefix: 'TweenMapSelect',
        linkPrefix: 'TweenMapSelectLink'
      },
      move: {
        display: true
      },
      auto_close: {
        active: true
      }
    }
  );

  //------------------------------------------------------------------------

  /**
   * Tweentab on addthis
   *
   */
  oTooltip = new TweenTab(
    'pageContent',
    {
      change: {
        link: 'click',
        delay: 0
      },
      cssSelector: {
        link: '.share',
        block: '.addthis'
      },
      element: {
        blockPrefix: 'addthisLink',
        linkPrefix: 'addthisBlock'
      },
      move: {
        display: true
      },
      auto_close: {
        active: true,
        delay: 500
      }
    }
  );


  /** FB Like **/
  if ($$('.facebook_like').length > 0 && $$('.facebook_bubble').length > 0)
  {
    var oFBLink = $$('.facebook_like')[0];
    var oFBBubble = $$('.facebook_bubble')[0];

    hideFBBubble = function hideFBBubble() {
      var oFBBubble = $$('.facebook_bubble')[0];
      oFBBubble.setStyle('visibility', 'hidden');
    }

    oFBLink.addEvents({
      'click': function() {
        oFBBubble.setStyle('visibility', 'visible');
      }
    });

    oFBBubble.addEvents({
      'mouseenter': function() {
        $clear(iFBTimer);
      },
      'mouseleave': function() {
        iFBTimer = hideFBBubble.delay(500);
      }
    });
  }

  /** send friend **/
  if ($$('.send_friend'))
  {
    if ($$('.sendthis').length == 1)
      $$('.sendthis')[0].setStyle('display', 'none');

    var tTimerSendThis = null;
    var iTimerSendThisTime = 2000;
    var showSendThis = function()
    {
      if ($$('.sendthis'))
      {
        $$('.sendthis')[0].setStyle('display', 'block');
        tTimerSendThis = hideSendThis.delay(iTimerSendThisTime);
      }
    }

    var hideSendThis = function()
    {
      if ($$('.sendthis'))
        $$('.sendthis')[0].setStyle('display', 'none');
    }

    var sendFriendFocus = false;
    $$('.send_friend').addEvent('click', function() {
      if ($$('.sendthis')[0].getStyle('display').toString() == 'none')
        showSendThis();
    });

    var changeFocus = function(bBool)
    {
      sendFriendFocus = bBool;
      if (bBool)
        $clear(tTimerSendThis);
      else
        tTimerSendThis = hideSendThis.delay(iTimerSendThisTime);
    }

    $$('#sendfriend #email').addEvent('focus', changeFocus.pass(true));
    $$('#sendfriend #destinataire').addEvent('focus', changeFocus.pass(true));
    $$('#sendfriend').addEvent('mouseenter', function() {
      $clear(tTimerSendThis);
    });

    $$('#sendfriend #email').addEvent('blur', changeFocus.pass(false));
    $$('#sendfriend #destinataire').addEvent('blur', changeFocus.pass(false));
    $$('#sendfriend').addEvent('mouseleave', function() {
      if (!sendFriendFocus)
        tTimerSendThis = hideSendThis.delay(iTimerSendThisTime);
    });
  }


  //------------------------------------------------------------------------

  /**
   * input
   *
   * empty input
   */
  var aInput = Array;
  $$('input[type=text].toclear').each(function(el, i) {
    aInput[i] = '';
    el.addEvent('focus', function() {
      if (aInput[i] == '')
        aInput[i] = el.value;
      if (el.value == aInput[i])
        el.value = '';
    });
    el.addEvent('blur', function() {
      if (el.value == '')
        el.value = aInput[i];
    });
  });

  //------------------------------------------------------------------------

  /**
   * info-resa
   *
   */
  $$('.page .info_resa').addEvent('mouseenter', function() {
    $$('.page  .info_resa .text').setStyle('display', 'block');
    $$('.page  .info_resa .img').setStyle('display', 'none');

  });
  $$('.page .info_resa').addEvent('mouseleave', function() {
    $$('.page .info_resa .img').setStyle('display', 'block');
    $$('.page .info_resa .text').setStyle('display', 'none');
  });

  //------------------------------------------------------------------------

  /**
   * font
   *
   */
  var iFontSize = 1;
  var iFontSizeMax = 1.4;
  var iFontSizeMin = 0.8;
  $$('#pageContent .tools li .height_less').addEvent('click', function(e) {
    e.stop();

    iFontSize = iFontSize - 0.1;
    if (iFontSize < iFontSizeMin)
      iFontSize = iFontSizeMin;

    $('pageContent').setStyle('font-size', iFontSize + 'em');
  });
  $$('#pageContent .tools li .height_more').addEvent('click', function(e) {
    e.stop();

    iFontSize = iFontSize + 0.1;
    if (iFontSize > iFontSizeMax)
      iFontSize = iFontSizeMax;

    $('pageContent').setStyle('font-size', iFontSize + 'em');
  });

});


function add_selection(sLink, sName, sType, sLatitude, sLongitude)
{
  var bReturn = oFavorites.add_fav(sLink, sName, sType, sLatitude, arguments[4]);

  var sSuffix = 'add_cart';
  if ($chk(arguments[5]) && arguments[5] === true)
    sSuffix = 'add_dd_cart';
  else
  if ($chk(arguments[5]) && arguments[5] == 3)
    sSuffix = 'add_dd_gmap_cart';

  showCartNotification(bReturn, sSuffix);

  return bReturn;
}


function showCartNotification(bTypeMsg, sSuffix)
{
  if ($(sSuffix))
    $(sSuffix).setStyle('display', 'none');

  $$('#' + sSuffix + ' .addthis_content p').setStyle('display', 'none');
  if (bTypeMsg)
  {
    $$('#' + sSuffix + ' .addthis_content .added').setStyle('display', 'block');
  }
  else
  {
    $$('#' + sSuffix + ' .addthis_content .already').setStyle('display', 'block');
  }

  if ($(sSuffix))
    $(sSuffix).setStyle('display', 'block');

  var cart_notification = function() {
    if ($(sSuffix))
      $(sSuffix).setStyle('display', 'none');
  };

  cart_notification.delay(2000);
}

function localize_multi_fav(id_version)
{
  var aFavChecked = $$('.fav_checkbox_item:checked');
  var aId = new Array();
  var aObtType = new Array();
  aFavChecked.each(function(elem) {
    var aInfo = elem.getParent('tr').getElements('.fav_info').get('rel')[0].split('|');
    if (aInfo[2].toInt() == 1)
    {
      aId.push(aInfo[0]);
      aObtType.push(aInfo[1]);
    }
  });
  if (aId.length == aObtType.length && aId.length > 0)
    localize_fav(aId.join('|'), aObtType.join('|'), id_version);
}

function localize_fav(sId, sObtType, id_version)
{
  TB_show('', sitePath + '/content/popup/CartoSearch_loader.inc.php?id_version=' + id_version + '&amp;id_carnet=' + sId + '&amp;type_obt=' + sObtType + '&amp;keepThis=true&amp;TB_iframe=true&amp;width=800&amp;height=520', '');
}

function del_selection(element)
{
  var bReturn = false;
  if (oFavorites.remove_fav(element.rel))
  {
    bReturn = true;
  }
  else
  {
    alert(MooTools.lang.get('fromPHP', 'Une erreur s\'est produite durant la suppression de la page.'));
  }
  return bReturn;
}

function remove_selected_fav()
{
  var bReturn = false;
  var aFavChecked = $$('.fav_checkbox_item:checked');
  var aFavCheckedLink = new Array();
  var sLinkDel;
  aFavChecked.each(function(elem) {
    sLinkDel = elem.getParent('tr').getElements('.fav_del_item').get('rel');
    aFavCheckedLink.push(sLinkDel);
  });
  if (aFavCheckedLink.length > 0)
  {
    bReturn = oFavorites.remove_selected_fav(aFavCheckedLink);
  }
  else
  {
    alert(MooTools.lang.get('fromPHP', 'Vous devez sélectionner un ou plusieurs éléments à supprimer du carnet'));
    return bReturn;
  }

  if (bReturn == true)
  {
    alert(MooTools.lang.get('fromPHP', 'Suppression réussie'));
  }
  else
  {
    alert(MooTools.lang.get('fromPHP', 'Une erreur s\'est produite durant la suppression'));
  }
}

function remove_all_fav()
{
  if (oFavorites.count() > 0)
  {
    var bReturn = oFavorites.remove_all();
    if (bReturn)
    {
      $$('.liste-objets table tbody').dispose();
      alert(MooTools.lang.get('fromPHP', 'Le carnet de voyage a bien été vidé'));
    }
    else
    {
      alert('Une erreur est survenue durant l\'opération');
    }
    oFavorites.display_list();
  }
}


//----------------------------------------------------------------------------

/**
 * function call by SlideShow
 * video launcher
 *
 */
function viewVideo(sUrl)
{
  var sBasehref = '';
  $$('base').each(function(el) {
    if (el.href.trim() != '')
      sBasehref = el.href.trim();
  });

  if (SlideShowInterest)
    SlideShowInterest.getInstance().stop();

  //pause autoscroll element
  if ($defined(oActiviteTweenTab))
    oActiviteTweenTab.stopAutoScrollingPeriod();

  if ($defined(oReservationTweenTab))
    oReservationTweenTab.stopAutoScrollingPeriod();

  //show smoothbox
  TB_show('Video', sBasehref + sUrl + '&amp;keepThis=true&amp;TB_iframe=true&amp;width=800&amp;height=520', '');
}

/**
 * function call by smoothbox in TB_init
 * close video
 */

function closeVideo()
{
  if (SlideShowInterest)
    SlideShowInterest.getInstance().start();

  //play autoscroll element
  if (oActiviteTweenTab)
    oActiviteTweenTab.startAutoScrollingPeriod();

  if (oReservationTweenTab)
    oReservationTweenTab.startAutoScrollingPeriod();
}

/**
 * function to add current page to the navigator's favorites
 */

function addFavorite()
{
  var sUrl = window.location.href;
  var sTitle = document.title;

  if (Browser.Engine.trident)
    window.external.AddFavorite(sUrl, sTitle);
  else
  if (window.sidebar)
    window.sidebar.addPanel(sTitle, sUrl, '');
  else
    alert(MooTools.lang.get('fromPHP', 'Appuyez sur ctrl+D pour ajouter aux Favoris (Commande+D pour macs) après avoir cliqué sur Ok'));

}


/**
 * Create an xhr object for ajax
 */
function creatXhr() {
  try {
    xhr = new ActiveXObject('Msxml2.XMLHTTP');
  }
  catch (e)
  {
    try {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    catch (e2)
    {
      try {
        xhr = new XMLHttpRequest();
      }
      catch (e3) {
        xhr = false;
      }
    }
  }
  return xhr;
}

function dispoLoaderShow()
{
  if ($('dispoLoader') && $('body'))
  {
    $('dispoLoader').setStyle('display', 'block');

    $$('#dispoLoader img').each(function(oElem)
    {
      oBodySize = $('body').getSize();
      oElementSize = oElem.getSize();

      oElem.setStyle('top', (oBodySize.y / 2) - (oElementSize.y / 2));
      oElem.setStyle('left', (oBodySize.x / 2) - (oElementSize.x / 2));
      oElem.setStyle('opacity', 1);
    });
  }
}

function loadMedia(sId, sType, sTitle, sDesc, sCopyright)
{
  var myRequest = new Request(
    {
      url: '../content/scripts/smoothLike.php',
      method: 'get',
      data: 'type=' + sType + '&id=' + sId + '&title=' + sTitle + '&desc=' + sDesc + '&cpright=' + sCopyright,
      onSuccess: function(responseText) {
        var oTemp = $('TB_window').getChildren();
        oTemp.setStyle('display', 'none');

        var oSmoothLike = new Element('div', {id: 'smoothLike'});
        $('TB_window').grab(oSmoothLike);
        oSmoothLike.set('html', responseText);
        oSmoothLike.getElementById('TB_closeWindowButtonLike').addEvent('click', function()
        {
          oTemp.setStyle('display', 'block');
          oSmoothLike.dispose();
        }
        );

      }
    }
  );
  myRequest.send();
}



/**
 * getCurrentLocation
 * 
 * Get current location for AJAX navigation with History object
 * 
 * @return string
 */
function getCurrentLocation()
{
  if (typeof ch != 'undefined' && ch.navigation != undefined && ch.navigation.Manager != undefined)
  {
    return (new ch.navigation.Manager()).getPath()
  }
  else
  {
    return window.location.href;
  }
}

/**
 * initChangeLocation()
 * 
 * Action to launch when location change
 *
 */
function initChangeLocation()
{
  if (typeof window.History != 'undefined' && typeof window.History.getPath != 'undefined')
  {
    History.addEvent('change', function() {
      updateToolsAfterChangeLocation();
    });
  }
  else if (typeof ch != 'undefined' && typeof ch.navigation != 'undefined')
  {
    ch.navigation.Manager.addEvent('change', function() {
      updateToolsAfterChangeLocation();
    });
  }
}

/**
 * updateToolsAfterChangeLocation
 * 
 * Add to card is auto, not
 * Update facebook iframe
 * Update permalien
 * 
 */
function updateToolsAfterChangeLocation()
{
  var sUrl = getCurrentLocation();

  // Permalien
  $('currentURL').set('value', sUrl);

  // Facebook iframe
  var aIframe = $$('.facebook_bubble iframe');
  if (aIframe[0])
  {
    var oIframe = aIframe[0];
    var sSrc = oIframe.src;
    var oReg = new RegExp('href=(.*)&layout=', "g");
    oIframe.src = sSrc.replace(oReg, 'href=' + sUrl + '&layout=');
  }
}

/**
 * initGlobal vars for date format
 * 
 */
function initDateFormat(iGlobVersion)
{
  // get today
  var oToday = new Date();
  var sTodayMonth = oToday.getMonth();
  var sTodayDay = oToday.getDate();
  var sTodayYear = oToday.getFullYear();
  sToday = sTodayYear + "/" + (sTodayMonth + 1) + "/" + sTodayDay;

  // get tomorrow
  var oTomorrow = new Date(oToday.setDate(oToday.getDate() + 1));
  var sTomorrowMonth = oTomorrow.getMonth();
  var sTomorrowDay = oTomorrow.getDate();
  var sTomorrowYear = oTomorrow.getFullYear();
  sTomorrow = sTomorrowYear + "/" + (sTomorrowMonth + 1) + "/" + sTomorrowDay;

  if ($chk(iGlobVersion) && iGlobVersion == 2)
  {
    sCalendarFormat = 'Y/m/d';
    sCalendar96Format = '%Y/%m/%d';
  }
}