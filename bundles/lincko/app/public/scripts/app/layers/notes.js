/* Category 22xx */


/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_notes_noteslist = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/


function app_layers_notes_launchPage(param){
	console.log('app_layers_notes_launchPage');
	if(typeof param === 'undefined'){ param = null; }
	app_layers_notes_feedPage();
}

function app_layers_notes_closePage(){
	console.log('skytasks_closePage');
	/*
	enquire.unregister(responsive.minTablet, app_layers_notes_minTablet);
	enquire.unregister(responsive.maxMobileL, app_layers_notes_maxMobileL);
	enquire.unregister(responsive.minMobileL, app_layers_notes_minMobileL);
	enquire.unregister(responsive.isMobile, app_layers_notes_isMobile);
	*/

	app_layers_notes_noteslist.destroy();

};

var app_layers_notes_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	console.log('skytasks_feedPage');
	var position = $('#app_layers_notes');
	var Elem;
	position.empty();

	Elem = $('#-app_layers_notes_noteslist').clone();
	Elem.prop('id','app_layers_notes_noteslist');
	Elem.appendTo(position);


	app_layers_notes_noteslist = new skylist(
		'notes',
		$('#app_layers_notes_noteslist'),
		null
	);


};//end of app_layers_notes_feedPage()


