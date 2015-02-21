/*
var IMGpagefirst = new Image();
IMGpagefirst.src = '';

// Faire un array true/false => faire un a = !a puis recupere la source dans l'array,
// cela est pour preloader les images background au passage de la souris ou du doigt pour eviter le flash du temps de chargement
*/
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
