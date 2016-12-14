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

function device_download(url, target){
	window.open(url, target);
	return true;
	if(typeof android != 'undefined' ) {
		android.download(url);
	} else if(typeof iOS != 'undefined' ) {
		iOS.download(url);
	} else if(typeof winPhone != 'undefined' ) {
		winPhone.download(url);
	} else {
		window.open(url, target);
		/*
		Another method if some browser (safari?) do not work
		var anchor = document.createElement('a');
		anchor.href = this.props.download_url;
		anchor.target = '_blank';
		anchor.download = this.props.file_name;
		anchor.click();
		*/
	}
}
