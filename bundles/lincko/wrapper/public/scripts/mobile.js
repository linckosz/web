function setMobileAlias(){
	var sha = wrapper_localstorage.sha;
	if(typeof sha == 'undefined') {
		sha = '';
	}

	if(typeof android != 'undefined' ) {
		android.setAlias('android', sha);
	} else if(typeof iOS != 'undefined' ) {
		//window.webkit.messageHandlers.iOS.postMessage(sha)
		iOS.setAlias(sha);
	} else if(typeof winPhone != 'undefined' ) {
		winPhone.setAlias(sha);
	}
}
setMobileAlias();

function isMobileApp(){
	return (
		   typeof android != 'undefined'
		|| typeof iOS != 'undefined'
		|| typeof winPhone != 'undefined'
	);
}

function useMobileNotification(){
	var notif = false;
	if(isMobileApp()){
		notif = true;
	}
	return notif;
}

function device_download(url, target, name){
	if(typeof target == 'undefined'){ target = '_blank'; }
	if(typeof name == 'undefined'){ name = 'file'; }
	if(typeof android != 'undefined' && typeof android.download == 'function') {
		android.download(url);
	} else if(typeof iOS != 'undefined' && typeof iOS.download == 'function') {
		iOS.download(url);
	} else if(typeof winPhone != 'undefined' && typeof winPhone.download == 'function') {
		winPhone.download(url);
	} else {
		//window.open(url, target);
		//Another method if some browser (safari?) do not work
		var anchor = document.createElement('a');
		anchor.href = url;
		anchor.target = target;
		anchor.download = name;
		anchor.click();
		
	}
}
