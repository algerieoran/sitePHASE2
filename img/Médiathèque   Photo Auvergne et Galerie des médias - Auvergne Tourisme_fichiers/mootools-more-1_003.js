// MooTools: the javascript framework.
/*
---

script: More.js

name: More

description: MooTools Locale extends

license: MIT-style license

authors:
  - Nicolas Grandgirard

requires:
  - Core/MooTools
  - More/Locale
*/
MooTools.lang.addData = function(mPatern,mValue)
{
	if ( $type(mPatern) == 'array' && $type(mValue) == 'array' && mValue.length == mPatern.length)
	{
		this.mPatern = mPatern;
		this.mValue = mValue;
	}
	else
	{
		this.mPatern = undefined;
		this.mValue = undefined;
	}
	return this;
};
MooTools.lang.replaceVar = function(sString)
{
	if ( $chk(sString) && $chk(this.mPatern) && $chk(this.mValue) )
		for(var i=0; i<this.mPatern.length;i++)
			sString = sString.replace(this.mPatern[i], this.mValue[i]);

	return sString;
};

MooTools.lang.get = function(set, key, args){
	if (key) set += '.' + key.replace( /\./g, '~' );

	var sResult = Locale.get(set, args);
	return (typeof sResult=='string')?this.replaceVar(sResult.replace( /~/g, '.' )):sResult;
};