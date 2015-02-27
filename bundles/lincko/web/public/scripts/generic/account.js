function account_show(select) {
	if(typeof select==="undefined"){ select = false; }
	$('#account_wrapper').css('z-index',1500).css("display", "table");
	$('#base_wrapper').addClass('blur');
	account_select(select);
}

function account_hide() {
	$('#account_wrapper').css('z-index',-1).hide();
	$('#base_wrapper').removeClass('blur');
}

function account_select(select) {
	$('#account_signin_box, #account_joinus_box').hide();
	$('#account_tab_joinus, #account_tab_signin').removeClass('account_trans');
	$('#account_tab_joinus > div, #account_tab_signin > div').removeClass('account_tab_joinus').removeClass('account_tab_signin');
	if(select){
		$('#account_signin_box').show();
		$('#account_tab_joinus').addClass('account_trans');
		$('#account_tab_joinus > div').addClass('account_tab_joinus');
	} else {
		$('#account_joinus_box').show();
		$('#account_tab_signin').addClass('account_trans');
		$('#account_tab_signin > div').addClass('account_tab_signin');
	}
}