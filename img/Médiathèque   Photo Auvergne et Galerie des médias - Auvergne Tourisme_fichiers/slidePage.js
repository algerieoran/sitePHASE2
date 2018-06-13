/**
 * slide Page
 *
 * @author slemoigne@agenceinteractive.com
 *
 * @version 1.0 - 2009-06-03
 *
 * Use mootools 1.2
 */

var SlidePage = new Class({
	
	Implements: [Events, Options],
	
	/**
	 * Options
	 *
	 */
	options : {
		move : {
			property	: 'right',
			from		: '-534',
			to			: '0',
			duration	: 500,
			transition	: Fx.Transitions.Sine.easeOut
		}
	},
	
	/**
	 * Constructor
	 *
	 */
	initialize: function( sIdPage, options ) {
		this.sIdPage = sIdPage;
		this.setOptions(options);
		this.oMove = null;
		
		if ( $(this.sIdPage).getStyle(this.options.move.property) == this.options.move.to + 'px' )
			this.bOpen = true;
		else
			this.bOpen = false;
		
		this.initMove();
		
	},
	
	/**
	 * slide
	 *
	 */
	slide: function() {
		this.slideStart();
	
		var oFunctionOutComplete = function(e){
				this.slideComplete();
				this.removeEvent('slideInComplete', oFunctionInComplete);
				this.removeEvent('slideOutComplete', oFunctionOutComplete);
			}.bind(this);
	
		var oFunctionInComplete = function(e){
			this.addEvent('slideOutComplete', oFunctionOutComplete);
			this.slideOut();
		}.bind(this);
	
		this.addEvent('slideInComplete', oFunctionInComplete);

		if ( this.bOpen == true )
			this.slideIn();
		else
			this.slideInComplete();
	},
	
	/**
	 * init Move
	 *
	 * Initialisation du mouvement de slide
	 *
	 */
	initMove: function() {
		this.oMove = new Fx.Tween(
			this.sIdPage, 
			{
				wait : false, 
				transition : this.options.move.transition,
				duration : this.options.move.duration
			}
		);
	},
	
	/**
	 * slide In
	 *
	 */
	slideIn: function() {
		
    this.oMove.removeEvents('start');
	  this.oMove.removeEvents('complete');
    
	  this.oMove.addEvents({ 
      'start': function(e){
        this.slideInStart();
        this.bOpen = false;
      }.bind(this),
      
      'complete': function(e){
        this.slideInComplete();
      }.bind(this)
    });
    
    this.oMove.start(
      this.options.move.property,
      this.options.move.from
    );
	},
	
	/**
	 * slide Out
	 *
	 */
	slideOut: function() {
		
	  this.oMove.removeEvents('start');
	  this.oMove.removeEvents('complete');
	  
	  this.oMove.addEvents({ 
      'start': function(e){
        this.slideOutStart();
      }.bind(this),
      
      'complete': function(e){
        this.slideOutComplete();
			  this.bOpen = true;
      }.bind(this)
    });
	  
		this.oMove.start(
			this.options.move.property,
			this.options.move.to
		);
	},
	
	
	/**
	 * Event
	 *
	 */
	slideInStart: function() {
		this.fireEvent('slideInStart');
	},
	slideInComplete: function() {
		this.fireEvent('slideInComplete');
	},
	slideOutStart: function() {
		this.fireEvent('slideOutStart');
	},
	slideOutComplete: function() {
		this.fireEvent('slideOutComplete');
	},
	slideStart: function() {
		this.fireEvent('slideStart');
	},
	slideComplete: function() {
		this.fireEvent('slideComplete');
	}
	

});