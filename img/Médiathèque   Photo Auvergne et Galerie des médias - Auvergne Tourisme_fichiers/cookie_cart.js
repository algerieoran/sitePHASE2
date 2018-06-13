/**
 * Cookie management for pages/fiches cart
 * mfarrica@agenceinteractive.com
 * 06/01/2009
 *
 * use mootools 1.2 + cookie
 *
 * bug fixed
 *  - delete always the last element - bug fixed by slemoigne 13/01/2009
 *  - add element unlimited if the page isn't refreash - bug fixed by slemoigne 13/01/2009
 *
 */
var CookieCart = new Class({
	Implements: [Options],

	/**
	 * Options
	 *
	 */
	options : {
		add_info : 'name',
		delete_link : '.retirer a',
		delete_info : 'name',
		delete_prefixe : 'cart_',
		delete_all_link : '.toutretirer a',
		delete_container : '.onglet-link',
		update_display : 'nb_record_aff',
		update_notifier : 'carnetupdated',
		cookie_name : 'carnetvoyage',
		info_separator : '|',
		nb_infos : 5,
		record_separator : '¤'
	},
	
	/**
	 * Constructor
	 * 
	 * id : id of add to cart link
	 */
	initialize: function(id, options){

		//init options
		this.setOptions(options);
		// init events
		this.bindEvents(id);
		
		if(Cookie.read(this.options.cookie_name))
			this.content = Cookie.read(this.options.cookie_name);
		else
			this.content = '';
		if (this.content.length > 0)
		{
			this.records = this.content.split(this.options.record_separator);
			this.nb_record = this.records.length;
		}
		else
		{
			this.records = new Array();
			this.nb_record = 0;
		}
	},
	
	bindEvents: function(id){
		if ($(id))
		{
			var arg = $(id).get(this.options.add_info);
			$(id).addEvent('click', function(arg){
				this.add(arg);
			}.bind(this, arg));
		}
		
		if ($$(this.options.delete_link))
		{
			$$(this.options.delete_link).each(function(elem){
				elem.addEvent('click', function(){
					arg = elem.get(this.options.delete_info);
					index = arg.replace(this.options.delete_prefixe,'');
					if (this.remove(index))
					{
						elem.getParent(this.options.delete_container).destroy();
						this.display_counter();
					}
				}.bind(this));
			}.bind(this));
		}
		
		if ($$(this.options.delete_all_link))
		{
			$$(this.options.delete_all_link).each(function(elem){
				elem.addEvent('click', function(){
					if (this.remove_all())
					{
						this.display_counter();
					}
				}.bind(this));
			}.bind(this));
		}
	},
	
	/**
	 * 
	 * 
	 */
	add: function(information){
		var infos = information.split(this.options.info_separator);
		var bReturn = false;
		if (infos.length == this.options.nb_infos)
		{
			//var record = '';
			var found = false;
			if(this.nb_record > 0)
			{
				for(i=0;i<this.nb_record;i++)
				{
					if(this.records[i] == information)
						found = true;
				}
				
				if (!found)
				{
					this.records.push(information);
					//record = this.records.join(this.options.record_separator);
					this.nb_record++;
				}
					
			}
			else
			{
				//record = information;
				this.records = new Array();
				this.records.push(information);
				this.nb_record++;
			}
			
			if (!found)
			{
				Cookie.write(this.options.cookie_name, this.records.join(this.options.record_separator), { path:'/', duration:30 });
				if ($(this.options.update_notifier))
				{
					eFx = new Fx.Tween(this.options.update_notifier, {duration:'long'});
					eFx.start('opacity', 1);
				}
				bReturn = true;
			}
			this.display_counter();
		}
		return bReturn;
	},
	
	/**
	 * 
	 * 
	 */
	remove: function(index){
		this.records.splice(index,1);
		
		this.nb_record = this.nb_record-1;
		if ( this.nb_record == 0 ) 
			return this.remove_all();
		if (Cookie.write(this.options.cookie_name, this.records.join(this.options.record_separator), { path:'/' }))
			return true;
		else
			return false;
	},
	
	/**
	 * 
	 * 
	 */
	remove_all: function(){
		this.nb_record = 0;
		if (Cookie.write(this.options.cookie_name, '', { path:'/' }))
			return true;
		else
			return false;
	},
	
	/**
	 * 
	 * 
	 */
	count: function(){
		return this.nb_record;
	},
	
	/**
	 *
	 *
	 */
	display_counter: function(){
		if ($(this.options.update_display))
		{
			$(this.options.update_display).set('html', this.nb_record);
		}
	},
	
	/**
	 *
	 *
	 */
	debug: function(){
		console.log(this.content);
	}
});