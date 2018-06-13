/**
 * SlideShow Object
 * Developed for Mootools v1.2.5
 *
 * @class SlideShow
 * @author Stéphane HULARD <s.hulard@gmail.com>
 * @contributor Simon FREMAUX <simon.fremaux@gmail.com>
 * @classDescription Manage a slideshow of images with fade effect (allow resize of slides)
 * @copy Agence Interactive
 */
var SlideShow = new Class({

	/**
	 * USER EVENTS:
	 *	- loaded -> Launched when all IMG are loaded
	 */
	Implements: [Options, Events],

	/**
	 * Options
	 */
	options :
	{
		slides: [],
		dimensions:
		{
			slide:
			{
				width: 100,
				height: 100
			}
		},
		transition:
		{
			deadtime: 5000,
			show:
			{
				duration: 4000,
				method: Fx.Transitions.Expo.easeIn
			},
			hide:
			{
				duration: 2000,
				method: Fx.Transitions.Expo.easeOut
			}
		}
	},

	/**
	 * Constructor
	 * @param Element oElement
	 * @param Hash oOptions
	 * @return void
	 */
	initialize: function( oElement, oOptions )
	{
		if( $type(oElement) == 'element' )
		{
			this.oContainer = oElement;
			this.oElement = new Element('div', {'class': 'slideshow'});

			this.oSize = oElement.getSize();
			this.reset();
			this.bFirstLaunch= true;

			this.setOptions( oOptions );
			if( $type(this.options.slides) == 'array' && this.options.slides.length > 0 )
			{
				this.options.slides.each(
					function( sItem )
					{
						if( $type(sItem) == 'string' )
							this.aSlide.push( sItem );
					}
				);
			}
		}
		else
			throw "SlideShow Element given is not a valid HTML DOM Element"
	},

	/**
	 * Add aSlide inside Slide to load list
	 * @param String sURL
	 * @return void
	 */
	addSlide: function( sURL )
	{
		this.aSlide.push( sURL );
		this.iNbSlides++;
	},

	/**
	 * Load slides with Mootools Asset system
	 * @return void
	 */
	loadSlides: function()
	{
		var oSlider = this;
		oSlider.aSlide.each(
			//For each item to load
			function( sURL, iIndex )
			{
				oSlider.addEvent(
					//Initialize load for current item
					'loadslide-' + iIndex,
					function()
					{
						oSlider.removeEvents('loadslide-' + iIndex);

						var oIMG = new Image();
						oIMG.onload =  function(){
							/* If it is the first IMG, we remove the Loader */
							if ( iIndex == 0 && $defined(oSlider.oLoader))
								oSlider.oLoader.dispose();

							//Build new HTML Element (for overflow management)
							var oTmp = new Element( 'div' );
							oTmp.appendChild(oIMG);
							
							oSlider.aImgSize.push({ width : oIMG.width, height : oIMG.height });

							//Inject new image inside HTML structure
							oTmp.setStyles({
								'width': oSlider.options.dimensions.slide.width,
								'height': oSlider.options.dimensions.slide.height,
								'opacity': 0
							});
							oSlider.oElement.appendChild(oTmp);

							if( iIndex == ( oSlider.aSlide.length - 1 ) )
							{
								oSlider.oContainer.appendChild( oSlider.oElement );
								oSlider.fireEvent('loaded');
							}
							else
								oSlider.fireEvent('loadslide-'+(iIndex + 1));
						};
						oIMG.src = sURL;
					}
				);
			}
		);

		//Init loading
		this.fireEvent('loadslide-0');
	},

	/**
	 * Start slideshow animation in defined period
	 * @return void
	 */
	start: function()
	{
		this.resize();
		if ( $defined(this.oCurrentFx) && $chk(this.oCurrentFx) )
		{
			this.oCurrentFx.cancel();
			this.oCurrentFx.removeEvents();
			if ( $defined(this.iNext) && $chk(this.iNext) )
				this.iCurrent = this.iNext;
			else
				this.iCurrent = this.getNextIndex();

			this.oCurrentFx = undefined;
			this.iNext = undefined;
		}

		var aChildren = this.oElement.getElements('div');
		var oSlide = function()
		{
			var oLast = aChildren[this.getCurrent()];

			//Hide last element
			if ( $chk(oLast) && !this.bFirstLaunch )
			{
				aChildren.each(function(item) {
					if ( item != oLast )
						item.setStyle('z-index', '85');
				});

				oLast.setStyle('z-index', '95');
				var oLastFx = new Fx.Tween( oLast,
				{
					duration: this.options.transition.hide.duration / 2,
					transition: this.options.transition.hide.method,
					onStart: function()
					{
						var oChild;
						if ( $defined(this.iNext) && $chk(this.iNext) ) // we go to a specific index
							oChild = aChildren[this.iNext];
						else if ( $chk(aChildren[this.getNextIndex()]) )
							oChild = aChildren[this.getNextIndex()];

						oChild.setStyle('z-index', '90');
						oChild.setStyle('opacity', '1');
						this.fireEvent('hideStart');
					}.bind(this),
					onComplete: function()
					{
						if ( $defined(this.iNext) && $chk(this.iNext) )
							this.iCurrent = this.iNext;
						else
							this.iCurrent = this.getNextIndex();

						this.oCurrentFx.removeEvents();
						this.oCurrentFx = undefined;
						this.iNext = undefined;
						this.fireEvent('showComplete');
						this.fireEvent('slide-changed');
					}.bind(this)
				});
				this.oCurrentFx = oLastFx;
				oLastFx.start('opacity','0');
			}
			else if (this.bFirstLaunch)
			{
			  aChildren.each(function(item) {
					if ( item != oLast )
						item.setStyle('z-index', '85');
				});
				oLast.setStyle('z-index', '95');

			  var oChild;
				if ( $defined(this.iNext) && $chk(this.iNext) ) // we go to a specific index
					oChild = aChildren[this.iNext];
				else if ( $chk(aChildren[this.getNextIndex()]) )
					oChild = aChildren[this.getNextIndex()];

				oChild.setStyle('z-index', '90');
				oChild.setStyle('opacity', '1');
				this.fireEvent('hideStart');

				if ( $defined(this.iNext) && $chk(this.iNext) )
					this.iCurrent = this.iNext;
				else
					this.iCurrent = this.getNextIndex();

				this.iNext = undefined;
				this.fireEvent('showComplete');
				this.fireEvent('slide-changed');
				this.bFirstLaunch = false;
			}
			else
				this.fireEvent('slide-changed');
		}

		oSlide.run( [], this);
		if ( this.iNbSlides > 1 )
			this.oTimer = oSlide.periodical( this.options.transition.deadtime + this.options.transition.show.duration + this.options.transition.hide.duration, this );
	},

	/**
	 * Stop current slider
	 * @return void
	 */
	stop: function()
	{
		if( this.oTimer )
			this.oTimer = $clear( this.oTimer );
	},

	/**
	 * Reset current slideshow
	 * @return void
	 */
	reset: function()
	{
		if ( $defined(this.oCurrentFx) )
		{
			this.oCurrentFx.cancel();
			this.oCurrentFx.removeEvents();
		}
		this.stop();

		this.aSlide = new Array();
		this.iNbSlides = 0;
		this.iCurrent = 0;
		this.oTimer = null;
		this.aImgSize = new Array();
		this.oElement.set('html', '');

		//this.showLoader();

	},

	/**
	 * Resize current slideshow at selected size or from container
	 * @param Integer iWidth	Optional
	 * @param Integer iHeight	Optional
	 * @return void
	 */
	resize: function( iWidth, iHeight )
	{
		if ( this.oElement.getParent() )
		{
			var oNewSize = new Object();
			var oMaxSize = new Object();
			if( !$chk(iHeight) && !$chk(iHeight) )
			{
				oMaxSize.x = oNewSize.x = this.oElement.getParent().getSize().x - this.oElement.getParent().getStyle('padding-left').toInt() - this.oElement.getParent().getStyle('padding-right').toInt();
				oMaxSize.y = oNewSize.y = this.oElement.getParent().getSize().y - this.oElement.getParent().getStyle('padding-top').toInt() - this.oElement.getParent().getStyle('padding-bottom').toInt();
			}
			else
			{
				if( !$chk(iWidth) )
				{
					oNewSize.y = iHeight;
					oNewSize.x = this.oElement.getParent().getSize().x - this.oElement.getParent().getStyle('padding-left').toInt() - this.oElement.getParent().getStyle('padding-right').toInt();
				}
				else if( !$chk(iHeight) )
				{
					oNewSize.x = iWidth;
					oNewSize.y = this.oElement.getParent().getSize().y - this.oElement.getParent().getStyle('padding-top').toInt() - this.oElement.getParent().getStyle('padding-bottom').toInt();
				}
				else
				{
					oNewSize.x = iWidth;
					oNewSize.y = iHeight;
				}

				oMaxSize.x = oNewSize.x;
				oMaxSize.y = oNewSize.y;
			}

			var oImgSize;
			var iRatioWidth;
			var iRatioHeight;
			// on calcul le format actuel du conteneur - paysage ou portrait - Si > 1 paysage
			var iFormat = oNewSize.x / oNewSize.y;
			var iRatioTmp;
			this.oElement.getElements('div').each(
				function( oItem, key )
				{
					if ( $defined(this.aImgSize) )
					{
						oImgSize = this.aImgSize[key];
						iRatioWidth = oImgSize.width / oNewSize.x;
						iRatioHeight = oImgSize.height / oNewSize.y;
						if ( iFormat == 1)
						{
							if ( oImgSize.width > oImgSize.height)
							{
								// on retaille d'après la hauteur
								oNewSize.x =  oImgSize.width * iRatioHeight;
							}
							else
							{
								// on retaille d'après la largeur
								oNewSize.y = oImgSize.height * iRatioWidth;
							}
						}
						else
						{
							if ( iFormat > 1 )
							{ // format horizontale
								iRatioTmp = oImgSize.width / oNewSize.x;
								if ( ( oImgSize.height / iRatioTmp ) < oNewSize.y )
								{
									// on retaille d'après la hauteur
									oNewSize.x = (oImgSize.width / iRatioHeight);
								}
								else
								{
									// on retaille d'après la largeur
									oNewSize.y = (oImgSize.height / iRatioWidth);
								}
							}
							else
							{ // format verticale
								iRatioTmp = oImgSize.height / oNewSize.y;
								if ( (oImgSize.width/iRatioTmp) < oNewSize.x)
								{
									// on retaille d'après la largeur
									oNewSize.y = oImgSize.height / iRatioWidth;
								}
								else
								{
									// on retaille d'après la hauteur
									oNewSize.x =  oImgSize.width / iRatioHeight;
								}
							}
						}
						/* end calcul */
					}

					var iLeft = 0;
					if ( oNewSize.x > oMaxSize.x)
						iLeft = (oNewSize.x - oMaxSize.x) / 2;

					var iTop = 0;
					if ( oNewSize.y > oMaxSize.y)
						iTop = (oNewSize.y - oMaxSize.y) / 2;

					if (  oNewSize.y <= oMaxSize.y )
						oMaxSize.y = oNewSize.y;

					iLeft = (oNewSize.x - oMaxSize.x) / 2;
					oItem.setStyles({
						'width': oMaxSize.x + 'px',
						'height': oMaxSize.y + 'px'
					});
					oItem.getElement('img').setStyles({
						'width': oNewSize.x + 'px',
						'height': oNewSize.y + 'px',
						'left' : -iLeft,
						'top' : -iTop
					});
			}.bind(this));
		}
	},


	/**
	 * Get number of slides
	 * @return Integer
	 */
	getNbSlides: function() { return this.iNbSlides; },

	/**
	 * Show the slide corresponding to the passed key
	 * @return Integer
	 */
	showSlide: function(iIndex)
	{
		var aChildren = this.oElement.getElements('div');
		if ( $chk(aChildren[iIndex]) )
		{
		  if ( $defined(this.oCurrentFx) )
  		{
  			this.oCurrentFx.cancel();
  			this.oCurrentFx.removeEvents();
  		}
			this.stop();
			this.iNext = iIndex;
			this.start();
		}
	},

	/**
	 * Check if slideshow is launched or not
	 * @return Boolean
	 */
	isLaunched: function()
	{
		var bReturn = false;
		if( this.oTimer )
			bReturn = true;

		return bReturn;
	},

/**
	 * Get ID of current slide
	 * @return Integer
	 */
	getCurrent: function() { return this.iCurrent%this.getNbSlides(); },

	getNextIndex : function()
	{
		return (this.iCurrent+1) % this.getNbSlides();
	},

	getPreviousIndex : function()
	{
		if ( (this.iCurrent-1) < 0 )
			return this.getNbSlides() - 1;
		else
			return this.iCurrent - 1;
	},

	mouseSlide : function(x)
	{
		if ( this.mouse.click )
		{
			var diff = this.mouse.x - x;
			if ( Math.abs(diff) > 200 )
			{
				if ( diff < 0 )
					this.showSlide(this.getNextIndex());
				else
					this.showSlide(this.getPreviousIndex());

			}
		}
	},

	showLoader : function()
	{

		if ( !$defined(this.oLoader) )
		{
			this.oLoader = new Element('img', { src : 'img/global/baseline.png', alt : 'Chargement...', title : 'Chargement...'});
			this.oLoader.setStyle('position', 'relative');
		}

		if ( this.oContainer && this.oElement)
		{
			this.oElement.set('html', '');
			var iWidth = this.oContainer.getStyle('width').toInt();
			var iHeight = this.oContainer.getStyle('height').toInt();

			this.oLoader.setStyle('left', (iWidth/2 - 16) + 'px');
			this.oLoader.setStyle('top', (iHeight/2 - 16) + 'px');
			this.oLoader.inject(this.oElement);
		}
	}
});

SlideShow.getInstance = function SlideShowInstance( oElement, oOptions )
{
    if ( !$defined(this.oInstance) && $defined( oElement ) && $defined( oOptions ) )
		this.oInstance = new SlideShow( oElement, oOptions );
	else if( $defined(this.oInstance) && $defined( oElement ) && $defined( oOptions ) && oOptions != this.options )
	{
		this.oInstance.reset();
		this.oInstance = new SlideShow( oElement, oOptions );
	}

    return this.oInstance;
}