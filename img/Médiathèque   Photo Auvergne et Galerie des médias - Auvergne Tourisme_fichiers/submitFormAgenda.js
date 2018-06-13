/**
* fonction permettant de valider le calendrier du drilldown sous la forme 
* d'une url drilldown
*
*/
function submitRequestFork( idField, urlLocation, nameDateDebut, nameDateFin )
{
	var aValue = new Array();
	var startValue = '';
	var endValue = '';
	var chaine = '';
	
	aValue = getStartEndValue( nameDateDebut, nameDateFin );
	startValue = aValue[0] == 'jj/mm/aaaa' || aValue[0] == 'yyyy/mm/dd' || aValue[0] == '' ? 'empty' : aValue[0];
	endValue = aValue[1] == 'jj/mm/aaaa' || aValue[0] == 'yyyy/mm/dd' || aValue[0] == '' ? 'empty' : aValue[1];
	
	// reg expr for url
	model = '(.*\/)(.*)(\/[a-zA-Z\-]*)(\-[0-9]{1,2}\-[0-9]{1}\.html)(.*$)';
	
	regExp = new RegExp(model);
	
	chaine = window.location.href;
	if( $chk(urlLocation) )
		chaine = urlLocation;
	
	extract = regExp.exec(chaine);
	
	sSearchQuery = extract[2];
	aSearchQuery = sSearchQuery.split('~');
	
	if(startValue == '' && endValue == '')
		aSearchQuery[idField.toInt()] = '';
	else
		aSearchQuery[idField.toInt()] = startValue + '|' + endValue;
	
	sSearchQuery = aSearchQuery.join('~');
	
	url = extract[1]+sSearchQuery+extract[3]+extract[4];
	
	window.location.href = url;
}

function getStartEndValue( nameDateDebut, nameDateFin )
{
	var aReturn = new Array();
	var startValue = '';
	var endValue = '';
	
	var regExp = new RegExp('([0-9]{2})/([0-9]{2})/([0-9]{4})', 'g');
	var sOrderDateElement = '$3-$2-$1';
	if( sCalendarFormat == 'Y/m/d' )
	{
		regExp = new RegExp('([0-9]{4})/([0-9]{2})/([0-9]{2})', 'g');
		sOrderDateElement = '$1-$2-$3';
	}
		
	// get start value
	if( $chk(nameDateDebut) ) {
		startValue = $$('[name=' + nameDateDebut + ']').get('value');
	} else if( $chk(nameDateFin) ) {
		startValue = $$('[name=' + nameDateFin + ']').get('value');
	} else {
		alert('Date de début non renseignée');
	}
	aReturn[0] = startValue[0].replace(regExp, sOrderDateElement);
	
	// get end value
	if( $chk(nameDateFin) ) {
		endValue = $$('[name=' + nameDateFin + ']').get('value');
	} else if( $chk(nameDateDebut) ) {
		endValue = $$('[name=' + nameDateDebut + ']').get('value');
	} else {
		alert('Date de fin non renseignée');
	}
	aReturn[1] = endValue[0].replace(regExp, sOrderDateElement);
	
	return aReturn;
}