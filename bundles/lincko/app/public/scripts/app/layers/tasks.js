/* Category 22xx */


/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_tasks_tasklist = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/


function app_layers_tasks_launchPage(param){
	console.log('app_layers_tasks_launchPage');
	if(typeof param === 'undefined'){ param = null; }
	app_layers_tasks_feedPage();
}

function app_layers_tasks_closePage(){
	console.log('skytasks_closePage');
	/*
	enquire.unregister(responsive.minTablet, app_layers_tasks_minTablet);
	enquire.unregister(responsive.maxMobileL, app_layers_tasks_maxMobileL);
	enquire.unregister(responsive.minMobileL, app_layers_tasks_minMobileL);
	enquire.unregister(responsive.isMobile, app_layers_tasks_isMobile);
	*/

	//app_layers_tasks_tasklist.destroy();

};

var app_layers_tasks_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	console.log('skytasks_feedPage');
	var position = $('#app_layers_tasks');
	var Elem;
	position.empty();

	Elem = $('#-app_layers_tasks_tasklist').clone();
	Elem.prop('id','app_layers_tasks_tasklist');
	Elem.appendTo(position);

	var tasklist_subConstruct = function(){
		var that = this;
		that.elem_newcardCircle.click(function(){
			submenu_Build('taskdetail', null, null, 
				{
					"type":that.list_type,
					"id": 'new', 
				}, true);
		})
		.appendTo(that.list_wrapper);


		app_application_lincko.add(
			that.list.prop('id'),
			'projects_'+app_content_menu.projects_id,
			function(){
				console.log('projects_'+app_content_menu.projects_id);
			}
		);

	}//END OF tasklist_subConstruct

	app_layers_tasks_tasklist = new skylist(
		'tasks',
		$('#app_layers_tasks_tasklist'),
		[
			Lincko.Translation.get('app', 3301, 'html').toUpperCase(),/*all*/
			Lincko.Translation.get('app', 3302, 'html').toUpperCase(),/*today*/
			Lincko.Translation.get('app', 3303, 'html').toUpperCase(),/*tomorrow*/
			'Spaces'
		],
		tasklist_subConstruct
	);

	app_layers_tasks_tasklist.skylist_update = app_layers_tasks_tasklist.tasklist_update;


	//update tasklist when database is changed
	/*
	app_application_lincko.add(
		'app_layers_tasks_tasklist',
		'projects_'+app_content_menu.projects_id,
		function(){
			app_layers_tasks_tasklist.tasklist_update();
		}
		*/
		
		//app_layers_dev_skytasks_tasklist.tasklist_update
		//app_layers_dev_skytasks_tasklist[app_layers_dev_skytasks_tasklist_id].tasklist_update
		/*
		function(){
			//console.log('dev_skytasks lincko.add task update');
			app_layers_dev_skytasks_tasklist.tasklist_update('all');
		}

	);*/

};//end of app_layers_tasks_feedPage()
