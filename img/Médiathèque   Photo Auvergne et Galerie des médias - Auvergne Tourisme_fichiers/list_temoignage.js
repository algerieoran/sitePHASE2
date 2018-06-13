/**
 * addEvent on domready
 *
 */
window.addEvent('domready', function() {
	
	/**
	 * Tweentab on temoignage_select select
	 */
	var oTweenTabTemoignageSelect = new TweenTab(
		'temoignage_select',
		{
			cssSelector : {
				link : '.select',
				block : '.select_content'
			},
			element: {
				blockPrefix : 'TweenTabTemoignageSelect',
				linkPrefix	: 'TweenTabTemoignageSelectLink'
			},
			move : {
				display		: true
			},
			auto_close : {
				active	: true
			}
		}
	);
	oTweenTabMapSelect.addEvent('displayStart', function(){
		$('temoignage_select').setStyle('z-index', 5);
	});


	if ( $chk(bLaunchAuto) && bLaunchAuto == true
		 && $chk(iMediaToLaunch) && $('media_' + iMediaToLaunch) )
	{
		$('media_' + iMediaToLaunch).onclick.run(null, $('media_' + iMediaToLaunch));
	}
});