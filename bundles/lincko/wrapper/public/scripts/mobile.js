function setMobileAlias(){
	var sha = wrapper_localstorage.sha;
	if(typeof sha == 'undefined')
	{
		sha = '';
	}
	if(typeof android != 'undefined' )
	{
		android.setAlias('android', sha);
	}
	if(typeof iOS != 'undefined' )
	{
		iOS.setAlias(sha);
	}
	if(typeof winPhone != 'undefined' )
	{
		winPhone.setAlias(sha);
	}
}
setMobileAlias();

function isMobileApp(){
	return (android || iOS || winPhone);
}
