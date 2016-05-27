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

$('#head_signout').click(function(){
	wrapper_sendAction('','post','user/signout', null, null, head_signout_cb_begin, head_signout_cb_complete);
});
$('#head_signin').click(function(){
	if(typeof account_show !== 'undefined') { account_show(true); }
});
$('#head_account').click(function(){
	window.location.href = head_link['root'];
});
