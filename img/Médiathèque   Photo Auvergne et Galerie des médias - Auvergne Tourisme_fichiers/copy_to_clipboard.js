var clip = null;
window.addEvent('domready', function()
{
	if ( $('copyPermalien') )
	{
		clip = new ZeroClipboard.Client();
		clip.setHandCursor( true );
		clip.addEventListener('mousedown', clip_mouseclick);
		clip.glue('copyPermalien', 'copyPermalien');
		
		/**
		 * Function on addthis 
		 * 
		 */
		$('currentURL').set('value',window.location.href); // permalien content
		$$('.addthis').setStyle('display','none');
		$$('.addthis').setStyle('visibility','visible');
	}
});

function clip_mouseclick(client)
{
	var text = $('currentURL').get('value');
	clip.setText( text );
}
