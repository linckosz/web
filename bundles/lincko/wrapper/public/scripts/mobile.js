

function setMobileAlias(){
	var sha = wrapper_localstorage.sha;
	if(typeof sha == 'undefined') {
		sha = '';
	}

	if(typeof android != 'undefined' ) {
		android.setAlias('android', sha);
	} else if(typeof window !== 'undefined' &&  typeof window.webkit !== 'undefined' && typeof window.webkit.messageHandlers !== 'undefined' && typeof window.webkit.messageHandlers.iOS !== 'undefined') {
		var obj = {
			sha: sha,
		}
		window.webkit.messageHandlers.iOS.postMessage(obj);
	}
	if(typeof winPhone != 'undefined' )
	{
		winPhone.setAlias(sha);
	}
}
setMobileAlias();

function isMobileApp(check_website){
	if(check_website && wrapper_force_open_website){
		return false; //Act as a browser (help to open the website inside an app)
	}
	return (
		   typeof android != 'undefined'
		|| (typeof window.webkit != 'undefined' && typeof window.webkit.messageHandlers != 'undefined' && typeof window.webkit.messageHandlers.iOS != 'undefined')
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
		android.download(url,document.cookie);
	}
	else if(typeof window.webkit != 'undefined' && typeof window.webkit.messageHandlers != 'undefined' && typeof window.webkit.messageHandlers.iOS != 'undefined') {
		var download_obj = {
			url: url,
			cookie: document.cookie,
		};
		window.webkit.messageHandlers.iOS.postMessage(download_obj);
	}
	else if(typeof winPhone != 'undefined' && typeof winPhone.download == 'function') {
		winPhone.download(url);
	}
	else {
		//window.open(url, target);
		//Another method if some browser (safari?) do not work
		var anchor = document.createElement('a');
		anchor.href = url;
		anchor.target = target;
		anchor.download = name;
		anchor.click();
	}
}

function device_type(){
	if(typeof android != 'undefined') {
		return "android";
	}
	else if(typeof window.webkit != 'undefined' && typeof window.webkit.messageHandlers != 'undefined' && typeof window.webkit.messageHandlers.iOS) {
		return "ios";
	}
	else if(typeof winPhone != 'undefined') {
		return "winphone";
	}
	else if(/webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)) {
		return "mobilebrowser";
	}
	return "other";
}
