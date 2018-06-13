/**
 * SlideShowInterest Object
 * Developed for Mootools v1.2.5
 *
 * @class SlideShow
 * @author Simon FREMAUX <simon.fremaux@gmail.com>
 * @classDescription Manage a slideshow of images with fade effect (allow resize of slides)
 * @copy Agence Interactive
 */
var SlideShowInterest = new Class({

	/**
	 * USER EVENTS:
	 *	- loaded -> Launched when all IMG are loaded
	 */
	Implements: [Options, Events],
	Extends : SlideShow,

	STATE_FULL : 2,
	STATE_PARTIAL : 1,
	/**
	 * Options
	 */
	options :
	{
		state : this.STATE_PARTIAL,
		aPOI : []
	},

	/**
	 * Constructor
	 * @param Element oElement
	 * @param Hash oOptions
	 * @return void
	 */
	initialize: function( oElement, oOptions, oInterestOptions )
	{
		this.parent(oElement, oOptions);
		this.setOptions(oInterestOptions);
	},

	/**
	 * setPOI
	 * @param Array aPOI
	 * @return void
	 */
	setPOI: function( aPOI )
	{
		this.options.aPOI = aPOI;
	},

	/**
	 * addPOI
	 * @param Integer iPOI
	 * @return void
	 */
	addPOI: function( iPOI )
	{
		this.options.aPOI.push(iPOI);
	},

	/**
	 * handlePOI
	 * @param Integer iIndex
	 * @param Integer iCenter
	 * @return void
	 */
	 handlePOI : function(iIndex, iCenter)
	 {
		if ( iIndex <= this.getNbSlides() )
		{
			if ( $chk(this.options.aPOI[iIndex]) )
			{
				var aChildren = this.oElement.getElements('div img');
				if ( $chk(aChildren[iIndex]) )
				{

					if ( this.options.state != this.STATE_FULL )
					{
						var iRatio = parseInt(aChildren[iIndex].getParent().getStyle('width'), 10)*100 / this.aImgSize[iIndex].width;
						var iMargin = iRatio*this.options.aPOI[iIndex]/100;
						aChildren[iIndex].tween('margin-left', parseInt('-' +(iMargin-iCenter), 10));
					}
					else
						aChildren[iIndex].tween('margin-left', 0);
				}
			}
		}
	 },

	/**
	 * handleAllPOI
	 * @param Integer iIndex
	 * @param Integer iCenter
	 * @return void
	 */
	 handleAllPOI : function(iCenter)
	 {
		for(var i = 0; i <  this.getNbSlides(); i++)
		{
			this.handlePOI(i, iCenter);
		}
	 }


	
	
});

SlideShowInterest.getInstance = function SlideShowInterestInstance( oElement, oOptions )
{
    if ( !$defined(this.oInstance) && $defined( oElement ) && $defined( oOptions ) )
		this.oInstance = new SlideShowInterest( oElement, oOptions );
	else if( $defined(this.oInstance) && $defined( oElement ) && $defined( oOptions ) && oOptions != this.options )
	{
		this.oInstance.reset();
		this.oInstance = new SlideShowInterest( oElement, oOptions );
	}

    return this.oInstance;
}