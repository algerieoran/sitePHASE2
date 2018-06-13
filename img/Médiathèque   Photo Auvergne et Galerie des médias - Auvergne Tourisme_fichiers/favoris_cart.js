var FavoriCart = new Class({
	Implements: [Options],
	Extends: CookieCart,

	/**
	 * Options
	 *
	 */
	options : {
		display_number : -5,
		display_mini_container : 'ul.carnet-voyage',
		display_container : '.favoris_list',
		max_record : 15
	},
	
	initialize : function(id, options) {
		this.parent(id, options);
	},
	
	/**
	 * 
	 * 
	 */
	display_list: function() {
		if ( $$(this.options.display_mini_container) )
		{
			var bFromLast = false;
			var iNumber = this.options.display_number;
			if ( iNumber < 0) 
			{
				bFromLast = true;
				iNumber = -iNumber;
			}
			var aDisplay = new Array();
			var aTemp = new Array(); 
			if ( bFromLast )
				for(var i = this.nb_record-1; i >= this.nb_record - iNumber && i >= 0; i-- ) 
				{
					aTemp = this.records[i].split(this.options.info_separator);
					aTemp.push(i);
					aDisplay.push(aTemp);
				}
			else 
				for(var i = 0; i < iNumber; i++ )
					if ( i < this.nb_records ) 
					{
						aTemp = this.records[i].split(this.options.info_separator);
						aTemp.push(i);
						aDisplay.push(this.records[i].split(this.options.info_separator));
					}
			
			var sAff = '';
			var iLength = aDisplay.length;
			
			if ( iLength > 0 )
			{
				for(i = 0; i < iLength && i < iNumber; i++) 
				{
					sAff += '<li>';
						sAff += '<a href="'+ aDisplay[i][0] +'">' + ((aDisplay[i][1].length > 40) ? aDisplay[i][1].substring(0,40) + '...' : aDisplay[i][1]) + '</a>';
					sAff += '</li>';
				}
			}
			else 
			{
				sAff = '<li><a class="disabled">'+MooTools.lang.get('fromPHP', 'Votre carnet de voyage est vide') +'</a></li>';
			}	
			
			$$(this.options.display_mini_container).set('html',sAff);
			
		}
	},
	
	add : function(information) {
		return this.parent(information);
	},
	
	add_fav : function(sLink, sName, sType, sLat, sLong) {
		var bReturn = false;
		if (this.add(sLink + this.options.info_separator + sName + this.options.info_separator + sType + this.options.info_separator + sLat +this.options.info_separator + sLong))
		{
			this.display_list();
			bReturn = true;
		}
		return bReturn;
	},

	remove : function(index) {
		var bReturn = this.parent(index);
		this.display_list();
		return bReturn;
	},
	

	remove_fav : function(link) {
		var bReturn = false;
		var index = -1;
		var aTemp;
		for(var i = 0; i < this.nb_record; i++) 
		{
			aTemp = this.records[i].split(this.options.info_separator);
			if ( aTemp[0] == link ) {
				index = i;
				break;
			}
		}
		
		if ( this.remove(index) ) 
		{
			bReturn = true;
			line = $$('.fav_del_item[rel='+ link +']');
			if ( line ) 
				line[0].getParent().getParent().dispose();
			
		}
		this.display_list();
		return bReturn;
	},
	
	
	remove_selected_fav : function(aFav) {
		bReturn = true;
		for(var i=0; i<aFav.length && bReturn == true; i++) {
			bReturn = this.remove_fav(aFav[i]);
		}
		this.display_list();
		return bReturn;
	},
	
	remove_all : function() {
		var bReturn = this.parent();
		this.display_list();
		return bReturn;
	}
});