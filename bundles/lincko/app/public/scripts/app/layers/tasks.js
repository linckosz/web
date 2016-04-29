/* Category 22xx */


/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_tasks_tasklist = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/


function app_layers_tasks_launchPage(param){
	console.log('app_layers_tasks_launchPage');
	if(typeof param === 'undefined'){ param = null; }
	app_layers_tasks_feedPage();
}

function app_layers_skytasks_closePage(){
	console.log('skytasks_closePage');
	enquire.unregister(responsive.minTablet, app_layers_skytasks_minTablet);
	enquire.unregister(responsive.maxMobileL, app_layers_skytasks_maxMobileL);
	enquire.unregister(responsive.minMobileL, app_layers_skytasks_minMobileL);
	enquire.unregister(responsive.isMobile, app_layers_skytasks_isMobile);

	app_layers_tasks_tasklist.destroy();

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

	app_layers_tasks_tasklist = new skylist(
		'tasks',
		$('#app_layers_tasks_tasklist'),
		[
			Lincko.Translation.get('app', 3301, 'html').toUpperCase(),/*all*/
			Lincko.Translation.get('app', 3302, 'html').toUpperCase(),/*today*/
			Lincko.Translation.get('app', 3303, 'html').toUpperCase(),/*tomorrow*/
			'Spaces'
		]
		);



	/*--------------Enquire.JS------------------------------*/
	enquire.register(responsive.minTablet, app_layers_skytasks_minTablet);
	enquire.register(responsive.maxMobileL, app_layers_skytasks_maxMobileL);
	enquire.register(responsive.minMobileL, app_layers_skytasks_minMobileL);
	enquire.register(responsive.isMobile, app_layers_skytasks_isMobile);
	/*--------------Enquire.JS------------------------------*/


	//update tasklist when database is changed
	app_application_lincko.add(
		'app_layers_tasks_tasklist',
		'tasks',
		function(){
			app_layers_tasks_tasklist.tasklist_update();
		}
		
		//app_layers_dev_skytasks_tasklist.tasklist_update
		//app_layers_dev_skytasks_tasklist[app_layers_dev_skytasks_tasklist_id].tasklist_update
		/*
		function(){
			//console.log('dev_skytasks lincko.add task update');
			app_layers_dev_skytasks_tasklist.tasklist_update('all');
		}
		*/
	);

};//end of app_layers_skytasks_feedPage()

/*--------------START of enquire.js functions------------------------------*/
var app_layers_skytasks_minTablet = function(){
	console.log('skytasks minTablet');
	app_layers_tasks_tasklist.minTablet();
};
var app_layers_skytasks_maxMobileL = function(){
	console.log('skytasks maxMobileL');
	app_layers_tasks_tasklist.maxMobileL();
};

var app_layers_skytasks_minMobileL = function() {
	console.log('skytasks minMobileL');
	app_layers_tasks_tasklist.minMobileL();

};
var app_layers_skytasks_isMobile = function() {
	console.log('skytasks isMobile');
	app_layers_tasks_tasklist.isMobile();

};
/*--------------END of enquire.js functions------------------------------*/
