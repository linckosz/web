/* Category 22xx */


/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_notes_noteslist = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/


function app_layers_notes_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_notes_feedPage();
}

function app_layers_notes_closePage(){
	if(app_layers_notes_noteslist){
		app_layers_notes_noteslist.destroy();
	}
};

var app_layers_notes_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_notes');
	var Elem;
	position.recursiveEmpty();

	Elem = $('#-app_layers_notes_noteslist').clone();
	Elem.prop('id','app_layers_notes_noteslist');
	Elem.appendTo(position);


	app_layers_notes_noteslist = new skylist(
		'notes',
		$('#app_layers_notes_noteslist'),
		null,
		false,
		false,
		false,
		'layer_notes'
	);


};//end of app_layers_notes_feedPage()


