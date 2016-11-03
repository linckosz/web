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
	if(typeof ios != 'undefined' )
	{
		var phoneID = '';
		ios.setAlias(phoneID, uid);
	}
}
setMobileAlias();
