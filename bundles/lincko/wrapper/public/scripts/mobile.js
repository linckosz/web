function setMobileAlias(){
	var uid = wrapper_localstorage.uid;
	if(typeof uid == 'undefined' || isNaN(uid))
	{
		uid = '';
	}
	if(typeof android != 'undefined' )
	{
		android.setAlias('android', uid);
	}
	if(typeof iOS != 'undefined' )
	{
		iOS.setAlias(uid);
	}
}
setMobileAlias();
