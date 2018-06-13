/**
 * FlashDiaporamaControler
 *
 * @author slemoigne@agenceinteractive.com
 *
 * @version 1.1 - 2009-06-10
 * @last modified 2009-07-28
 *
 * Use mootools 1.2
 */

var FlashDiaporamaControler = new Class({

	/**
	 * Constructor
	 *
	 * @param string - id of flash
	 * @param string - id of pause button
	 * @param string - id of next button
	 * @param string - id of previous button
	 */
	initialize: function( sIdFlash, sIdPause, sIdNext, sIdPrevious ) {
		this.sIdFlash = sIdFlash;
		this.sIdPause = sIdPause;
		this.sIdNext = sIdNext;
		this.sIdPrevious = sIdPrevious;

		this.bPaused = false;
		this.bIsLoaded = false;
		this.bMooPaused = false;

		this.initEvent();
	},

	/**
	 * init event
	 *
	 */
	initEvent: function(){

		//next
		$(this.sIdNext).addEvent('click', function(e){
			e.stop();
			$(this.sIdFlash).goNext();
		}.bind(this));

		//previous
		$(this.sIdPrevious).addEvent('click', function(e){
			e.stop();
			$(this.sIdFlash).goPrevious();
		}.bind(this));

		//pause
		$(this.sIdPause).addEvent('click', this.alternatePause.bind(this) , this);

	},

	/**
	 * alternate pause
	 *
	 */
	alternatePause: function() {

		if ( this.bIsLoaded )
		{
			if ( !this.bPaused )
				this.pause();
			else
				this.lecture();
		}
	},

	/**
	 * pause
	 *
	 */
	pause: function() {
		if ( this.bIsLoaded && !this.bPaused )
		{
			$(this.sIdFlash).togglePause();
			this.bPaused = true;
			$(this.sIdPause).addClass('active');
		}
	},

	/**
	 * lecture
	 *
	 */
	lecture: function() {
		if ( this.bIsLoaded && this.bPaused )
		{
			$(this.sIdFlash).togglePause();
			this.bPaused = false;
			$(this.sIdPause).removeClass('active');
		}
	},

	/**
	 * mootools pause
	 *
	 */
	mooPause: function(){
		if ( this.bIsLoaded && !this.bMooPaused )
		{
			try{
				//$(this.sIdFlash).mootoolsPause();
				var oObject = document.getElementById(this.sIdFlash);
				oObject.mootoolsPause();
				this.bMooPaused = true;
			}
			catch(e)
			{
				//alert(e);
			}

		}
	},

	/**
	 * mootools lecture
	 *
	 */
	mooLecture: function(){
		if ( this.bIsLoaded && this.bMooPaused )
		{
			try{
				//$(this.sIdFlash).mootoolsPause();
				var oObject = document.getElementById(this.sIdFlash);
				oObject.mootoolsPause();
				this.bMooPaused = false;
			}
			catch(e)
			{
				//alert(e);
			}

		}
	}

});