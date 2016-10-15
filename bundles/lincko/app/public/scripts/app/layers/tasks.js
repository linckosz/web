/* Category 22xx */


/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_tasks_tasklist = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/


function app_layers_tasks_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_tasks_feedPage();
}

function app_layers_tasks_closePage(){
	if(app_layers_tasks_tasklist){
		app_layers_tasks_tasklist.destroy();
	}
};

var app_layers_tasks_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_tasks');
	var Elem;
	position.recursiveEmpty();

	Elem = $('#-app_layers_tasks_tasklist').clone();
	Elem.prop('id','app_layers_tasks_tasklist');
	Elem.appendTo(position);

	var rightOptionCount = 2;
	if( Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') ){
		rightOptionCount = 1;
	}

	
	app_layers_tasks_tasklist = new skylist(
		'tasks',
		$('#app_layers_tasks_tasklist'),
		[
			Lincko.Translation.get('app', 3301, 'html').toUpperCase(),/*all*/
			Lincko.Translation.get('app', 3302, 'html').toUpperCase(),/*today*/
			Lincko.Translation.get('app', 3303, 'html').toUpperCase(),/*tomorrow*/
			//'Spaces'
		],
		null,
		rightOptionCount,
		null,
		'layer_tasks'
	);

	//app_layers_tasks_tasklist.skylist_update = app_layers_tasks_tasklist.tasklist_update;

};//end of app_layers_tasks_feedPage()
