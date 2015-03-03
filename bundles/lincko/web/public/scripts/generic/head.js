/*
var IMGpagefirst = new Image();
IMGpagefirst.src = '';

// Faire un array true/false => faire un a = !a puis recupere la source dans l'array,
// cela est pour preloader les images background au passage de la souris ou du doigt pour eviter le flash du temps de chargement
*/

var head_signout_cb_success = function(msg){
}

var head_signout_cb_error = function(xhr_err, ajaxOptions, thrownError){
}

var head_signout_cb_begin = function(){
	$(document.body).css('cursor', 'progress');
}

var head_signout_cb_complete = function(){
	$(document.body).css('cursor', '');
	window.location.href = head_link['home'];
}

$('[id^="head_menu_"]').click(function(){
	Mobile_menu_Build("nav");
});
$('[id^="head_logo_"]').click(function(){
	window.location.href = head_link['home'];
});
$('[id^="head_home_"]').click(function(){
	window.location.href = head_link['home'];
});
$('[id^="head_features_"]').click(function(){
	window.location.href = head_link['features'];
});
$('[id^="head_price_"]').click(function(){
	window.location.href = head_link['price'];
});
$('[id^="head_download_"]').click(function(){
	window.location.href = head_link['download'];
});
$('[id^="head_help_"]').click(function(){
	window.location.href = head_link['help'];
});
$('[id^="head_signout_"]').click(function(){
	sendAction('','post','user/signout', head_signout_cb_success, head_signout_cb_error, head_signout_cb_begin, head_signout_cb_complete);
});
$('[id^="head_signin_"]').click(function(){
	if(typeof account_show !== 'undefined') { account_show(true); }
});
$('[id^="head_joinus_"]').click(function(){
	if(typeof account_show !== 'undefined') { account_show(false); }
});
$('[id^="head_account_"]').click(function(){
	window.location.href = head_link['root'];
});


//Delete the click event from activated menu
$('.head_menu.active').off('click');
