/**
 * display block with tween transition
 *
 * @author slemoigne@agenceinteractive.com
 *
 * @version 2.0 - 2009-06-02
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT : not use auto_scrolling and auto_close in same time
 * ---------------------------------------------------------------------------
 *
 * Use mootools 1.2
 */

var TweenTab = new Class({
	
	Implements: [Events, Options],
	
	/**
	 * Options
	 *
	 */
	options : {
		//Alternate open/close block when you click on link
		alternate : false,
		
		//Event
		change: {
			link : 'click',
			delay : 0,
			arrow : 'click'
		},
		
		//Select element
		cssSelector: {
			link : '.link',
			block : '.block',
			arrow : '.arrow'
		},
		
		//Prefix id
		element: {
			blockPrefix : 'TweenTab',
			linkPrefix	: 'TweenTabLink'
		},
		
		//Move of element
		move : {
			display		: false,
			property	: 'height',
			from		: '0',
			to			: '200',
			duration	: 500,
			transition	: Fx.Transitions.Sine.easeOut
		},
		
		//Add class on arrow
		status : {
			on 			: 'arrow_display',
			off 		: 'arrow_hide'
		},
		
		//Auto scrolling
		auto_scrolling : {
			active			: false,
			period			: 5000,
			period_restart	: 10000,
			direction		: 'right' //left, right
		},
		
		//Auto close of block
		auto_close : {
			active	: false,
			delay : 500
		},
		
		//Link's style function
		activeLink: function(sId) {},
		disableLink: function(sId) {},
		autoCloseCancel : false
	},
	
	/**
	 * Constructor
	 *
	 * @param string - id of container
	 * @param string - id of status element
	 */
	initialize: function(sIdContainer, options) {
	
		//Init var
		this.sIdContainer = sIdContainer; 	//Id container
		this.iNbElement = 0; 				//Nb element
		this.sCurrentId = null; 			//Id of current element without prefix
		this.sLastId = null; 				//Id of last element without prefix
		this.bOpen = false; 				//Open/Close block
		this.bChangeElement = true;			//Authorize or not to change element
		this.iChangeTimer = 0;				//Timer to change element
	
		this.setOptions(options);

		this.initElement();
		this.initEvent();
		
		//Start auto scrolling
		if ( this.options.auto_scrolling.active )
		{
			this.iAutoScrollingPeriod = null;
			this.iAutoScrollingTimer = null;
			this.startAutoScrollingPeriod();
		}
		
		//AutoClose
		if ( this.options.auto_close.active )
		{
			this.bOverLink = false;
			this.bOverBlock = false;
			this.iAutoCloseTimer = 0;
			this.initEventAutoClose();
		}
	},
	
	/**
	 * Destroy - unset var and remove event
	 *
	 */
	destroy: function() {
		$$('#' + this.sIdContainer + ' ' + this.options.cssSelector.link).removeEvents();
		$(this.sIdStatus).removeEvent(this.options.change.arrow);
	
		this.sIdContainer = null;
		this.sIdStatus = null;
		this.sCurrentId = null;
		this.sLastId = null;
		this.bChangeElement = null;
		this.bOpen = null;
		this.period = null;
		this.timer = null;
		this.options = null;
	},
	
	//------------------------------------------------------------------------
	
	/**
	 * InitElement - add id on element
	 *
	 */
	initElement: function() {
		
		//Add id on link element
		$$('#' + this.sIdContainer + ' ' + this.options.cssSelector.link).each(function(el, i){
			el.id = this.options.element.linkPrefix + i;
		}.bind(this));

		//Add id on block element
		$$('#' + this.sIdContainer + ' ' + this.options.cssSelector.block).each(function(el, i){
			el.id = this.options.element.blockPrefix + i;
		}.bind(this));
		
		//Count nb of element
		iNbLink = $$('#' + this.sIdContainer + ' ' + this.options.cssSelector.link).length - 1;
		iNbBlock = $$('#' + this.sIdContainer + ' ' + this.options.cssSelector.block).length - 1;
		
		//Get min
		if ( iNbLink > iNbBlock ) 
			this.iNbElement = iNbBlock;
		else
			this.iNbElement = iNbLink;
			
	},
	
	//------------------------------------------------------------------------
	
	/**
	 * Init event - add event on element
	 *
	 */
	initEvent: function() {
		this.initEventElement();
		this.initEventArrow();
	},
	
	/**
	 * Init Element
	 *
	 */
	initEventElement: function() {
		//Add event on link element
		$$('#' + this.sIdContainer + ' ' + this.options.cssSelector.link).each(function(el){
			el.addEvent(this.options.change.link, function(e){
			
				//Clear timer
				$clear(this.iChangeTimer);
				
				//Extract id without prefix
				sId = el.id.replace(this.options.element.linkPrefix, '');
				
				this.changeElementStart(sId); //event
				
				//Stop autoscrolling if active
				if ( this.options.auto_scrolling.active )
					this.stopAutoScrollingPeriodRestart();
				
				//Change element
				this.iChangeTimer = this.changeElement.delay(
					this.options.change.delay,
					this,
					sId
				);
					
			}.bind(this));
		}.bind(this));
	},
	
	/**
	 * Init arrow
	 *
	 */
	initEventArrow: function() {
		//Add event on arrow
		$$('#' + this.sIdContainer + ' ' + this.options.arrow).addEvent(this.options.change.arrow, function(e){
			if ( this.bOpen )
				this.hideCurrentElement();
			else
				this.displayLastElement();
		}.bind(this));
	},
	
	//------------------------------------------------------------------------
	
	/**
	 * Init event auto close
	 *
	 */
	initEventAutoClose: function() {
		//Link
		$$('#' + this.sIdContainer + ' ' + this.options.cssSelector.link).each(function(el){

			el.addEvent('mouseenter', function(e){

				//Clear timer
				$clear(this.iAutoCloseTimer);
			
				//extract id without prefix
				sId = el.id.replace(this.options.element.linkPrefix, '');

				//
				if ( this.sCurrentId == sId )
					this.bOverLink = true;

			}.bind(this));

			el.addEvent('mouseleave', function(e){
			
				//Clear timer
				$clear(this.iChangeTimer);
			
				//Extract id without prefix
				sId = el.id.replace(this.options.element.linkPrefix, '');

				//
				if ( this.sCurrentId == sId )	
					this.bOverLink = false;

				//Call auto close
				this.iAutoCloseTimer = this.autoClose.delay(
					this.options.auto_close.delay,
					this
				);

			}.bind(this));
		}.bind(this));

		//Block
		$$('#' + this.sIdContainer + ' ' + this.options.cssSelector.block).each(function(el){

			el.addEvent('mouseenter', function(e){
			
				//Clear timer
				$clear(this.iAutoCloseTimer);
				$clear(this.iChangeTimer);
			
				//extract id without prefix
				sId = el.id.replace(this.options.element.blockPrefix, '');

				//
				if ( this.sCurrentId == sId )
					this.bOverBlock = true;

			}.bind(this));

			el.addEvent('mouseleave', function(e){
			
				//extract id without prefix
				sId = el.id.replace(this.options.element.blockPrefix, '');

				//
				if ( this.sCurrentId == sId )	
					this.bOverBlock = false;

				//Call auto close
				this.iAutoCloseTimer = this.autoClose.delay(
					this.options.auto_close.delay,
					this
				);

			}.bind(this));				
		}.bind(this));
	},
	
	/**
	 * Auto close
	 *
	 */
	autoClose: function() {
		if ( this.bOverBlock == false && this.bOverLink == false && this.options.autoCloseCancel == false )
			this.hideCurrentElement();
	},
	
	//------------------------------------------------------------------------
	
	/**
	 * Change element
	 *
	 * @param string - id of element to display without prefix = num
	 */
	changeElement: function(sId) {
		//Change element if different
		if ( this.sCurrentId != sId && this.bChangeElement )
		{
			//If one element display -> hide it
			if ( this.sCurrentId != null )
			{
				this.bChangeElement = false;
			
				//add Event "hideComplete" on this
				var oTmpFunction = function() {
					this.removeEvent('hideComplete', oTmpFunction);
					this.displayElement(sId);
				}.bind(this);
				this.addEvent('hideComplete', oTmpFunction);
			
				//Hide Element	
				this.hideCurrentElement();
			}
			else
				this.displayElement(sId);
		}
		//If alternate active
		else if ( this.alternate && this.bChangeElement )
		{
			if ( this.bOpen )
				this.hideCurrentElement();
			else
				this.displayLastElement();
		}
	},
	
	/**
	 * Display element
	 *
	 * @param string - id of element to display without prefix
	 */
	displayElement: function(sId) {
		
		this.sCurrentId = sId;
		this.bOpen = true;
		this.options.activeLink(this.options.element.linkPrefix + sId);
		
		//Class on arrow
		$$('#' + this.sIdContainer + ' ' + this.options.arrow).removeClass(this.options.status.off);
		$$('#' + this.sIdContainer + ' ' + this.options.arrow).addClass(this.options.status.on);
		
		//Display element
		if ( this.options.move.display )
		{
			this.displayStart(); //event
			$(this.options.element.blockPrefix + sId).setStyle('display','block');
			this.displayComplete(); //event
		}
		else
		{
			// display element before tween
			$(this.options.element.blockPrefix + sId).setStyle('display','block');
			
			//Get to
			sTo = this.options.move.to;
			if ( $type(this.options.move.to) == 'array' )
				sTo  = this.options.move.to[sId.toInt()];
						
			//New Fx Tween
			var oFx = new Fx.Tween(
				$(this.options.element.blockPrefix + sId),
				{
					wait : false, 
					transition : this.options.move.transition,
					duration : this.options.move.duration,
					onStart: function(){
						this.displayStart(); //event
					}.bind(this),
					onComplete: function(){
						this.displayComplete(); //event
					}.bind(this)
				}
			);
			
			//Start move
			oFx.start(
				this.options.move.property,
				sTo
			);					
		}
		
	},
	
	/**
	 * Hide element
	 *
	 * @param string - id of element to hide without prefix
	 */
	hideElement: function(sId) {
	
		this.sLastId = this.sCurrentId;
		this.bOpen = false;
		this.sCurrentId = null;
		this.options.disableLink(this.options.element.linkPrefix + sId);
		
		//Class on arrow
		$$('#' + this.sIdContainer + ' ' + this.options.arrow).removeClass(this.options.status.on);
		$$('#' + this.sIdContainer + ' ' + this.options.arrow).addClass(this.options.status.off);
		
		//Display element
		if ( this.options.move.display )
		{
			this.hideStart(); //event
			$(this.options.element.blockPrefix + sId).setStyle('display','none');
			this.bChangeElement = true;
			this.hideComplete(); //event
		}
		else
		{
			//Get from
			sFrom = this.options.move.from;
			if ( $type(this.options.move.from) == 'array' )
				sFrom  = this.options.move.from[sId.toInt()];
		
			//New Fx Tween
			var oFx = new Fx.Tween(
				$(this.options.element.blockPrefix + sId),
				{
					wait : false, 
					transition : this.options.move.transition,
					duration : this.options.move.duration,
					onStart: function(){
						this.hideStart(); //event
					}.bind(this),
					onComplete: function(){
						// display element none before tween
						$(this.options.element.blockPrefix + sId).setStyle('display','none');
						
						this.bChangeElement = true;
						this.hideComplete(); //event
					}.bind(this)
				}
			);
			
			//Start move
			oFx.start(
				this.options.move.property,
				sFrom
			);
		}
		
	},
	
	/**
	 * Hide current element
	 *
	 */
	hideCurrentElement: function() {
		if ( this.sCurrentId != null )
			this.hideElement(this.sCurrentId);
		else
			this.hideComplete(); //event
	},
	
	/**
	 * Display last element
	 *
	 */
	displayLastElement: function() {
		if ( this.sLastId != null )
			this.displayElement(this.sLastId);
		else
			this.displayComplete(); //event
	},
	
	//------------------------------------------------------------------------
	
	/**
	 * Periodical display element
	 *
	 */
	periodicalDisplayElement: function() {
		if ( this.sCurrentId != null )
		{
			var iElement = 0;

			if ( this.options.auto_scrolling.direction == 'right' )
			{
				iElement = this.sCurrentId.toInt() + 1;
				if ( iElement > this.iNbElement )
					iElement = 0;
			}
			else
			{
				iElement = this.sCurrentId.toInt() - 1;
				if ( iElement < 0 )
					iElement = this.iNbElement;
			}
			this.changeElement(iElement.toString());
		}
	},
	
	/**
	 * Start call periodical move
	 *
	 */
	startAutoScrollingPeriod: function() {
		this.iAutoScrollingPeriod = this.periodicalDisplayElement.periodical(
			this.options.auto_scrolling.period,
			this
		);
	},

	/**
	 * Stop periodical move and start it after
	 *
	 */
	stopAutoScrollingPeriodRestart: function() {
		$clear(this.iAutoScrollingPeriod);
		$clear(this.iAutoScrollingTimer);
		this.iAutoScrollingTimer = this.startAutoScrollingPeriod.delay(
			this.options.auto_scrolling.period_restart,
			this
		);
	},

	/**
	 * Stop periodical move
	 *
	 */
	stopAutoScrollingPeriod: function() {
		$clear(this.iAutoScrollingPeriod);
		$clear(this.iAutoScrollingTimer);
	},
	
	//------------------------------------------------------------------------
	
	/**
	 * GET
	 *
	 */
	getSCurrentId: function() {
		return this.sCurrentId;
	},
	getBOpen: function() {
		return this.bOpen;
	},
	
	//------------------------------------------------------------------------
	
	/**
	 * EVENT
	 *
	 */
	hideStart: function() {
		this.fireEvent('hideStart');
	},
	hideComplete: function() {
		this.fireEvent('hideComplete');
	},
	displayStart: function() {
		this.fireEvent('displayStart');
	},
	displayComplete: function() {
		this.fireEvent('displayComplete');
	},
	changeElementStart: function(sId) {
		this.fireEvent('clickElement', sId); //compatibility with v1.0
		this.fireEvent('changeElementStart', sId);
	}
	
});