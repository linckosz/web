var isOffline = false;
var isOffline_threshold = 60; //60s
var isOffline_firstDC = null;

var isOffline_update = function(DC){
	if(typeof DC != 'boolean'){ var DC = true; }

	if(!DC && (isOffline || isOffline_firstDC)){ //back online
		isOffline_firstDC = null;
		isOffline = false;
	}
	else if(DC && !isOffline){ //disconnected, but offline is still set to false
		if(!isOffline_firstDC){
			isOffline_firstDC = new wrapper_date().timestamp;
		}
		else if(typeof isOffline_firstDC == 'number' && new wrapper_date().timestamp > isOffline_firstDC + isOffline_threshold){
			isOffline = true;
			isOffline_showPopup();
		}
	}
	
	return isOffline;
}

var isOffline_showPopup = function(){
	if(isOffline && !$('#isOffline_popup').length ){
		//show
		var elem_popup = $('#-isOffline_popup').clone().prop('id', 'isOffline_popup');
		elem_popup.find('[find=btn_ok]').click(function(){
			$('#isOffline_popup').recursiveRemove();
		});
		$('body').append(elem_popup);
		return true;
	}
	else{
		return false;
	}
}
