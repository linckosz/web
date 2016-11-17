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
}
setMobileAlias();
