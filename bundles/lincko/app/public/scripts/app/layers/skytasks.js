/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_dev_skytasks_test_var = null;
var app_layers_dev_skytasks_timesort = null;
var app_layers_dev_skytasks_tasklist = null;
var app_layers_dev_skytasks_tasklist_searchTimeout = null;
var app_layers_dev_skytasks_tasklist_searchTerm = null;
//var app_layers_dev_skytasks_tasklist = {};
var app_layers_dev_skytasks_tasklist_id = 1;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/

var app_layers_dev_skytasks_memoryTest = function(){
	for( var i=0; i<200; i++){
		app_layers_dev_skytasks_tasklist = new app_layers_dev_skytasks_ClassTasklist($('#app_layers_dev_skytasks_tasklist_wrapper'));
	}
}
var app_layers_dev_skytasks_memoryTest2 = function(){
	for( var i=0; i<200; i++){
		app_layers_dev_skytasks_tasklist = new app_layers_dev_skytasks_ClassTasklist($('#app_layers_dev_skytasks_tasklist_wrapper'));
		app_layers_dev_skytasks_tasklist.destroy();
	}
}

function app_layers_dev_skytasks_launchPage(){
	console.log('app_layers_dev_skytasks_launchPage');
	//feed page
	app_layers_dev_skytasks_feedPage();
};
function app_layers_dev_skytasks_closePage(){
	console.log('app_layers_dev_skytasks_closePage');
	enquire.unregister(responsive.minTablet, app_layers_dev_skytasks_minTablet);
	enquire.unregister(responsive.maxMobileL, app_layers_dev_skytasks_maxMobileL);
	enquire.unregister(responsive.minMobileL, app_layers_dev_skytasks_minMobileL);
	enquire.unregister(responsive.isMobile, app_layers_dev_skytasks_isMobile);

	app_layers_dev_skytasks_tasklist.destroy();

};


var app_layers_dev_skytasks_feedPage = function(){
	console.log('app_layers_dev_skytasks_feedPage');
	var position = $('#app_layers_dev_skytasks');
	var Elem;
	position.empty();

	
/*
	app_layers_dev_skytasks_timesort = new app_layers_dev_skytasks_ClassTimesort(
		$('#app_layers_dev_skytasks_timesort'),
		[
			Lincko.Translation.get('app', 3301, 'html'),/*all*/
/*			Lincko.Translation.get('app', 3302, 'html'),/*today*/
/*			Lincko.Translation.get('app', 3303, 'html'),/*tomorrow*/
/*			'Spaces'
		],
		app_layers_dev_skytasks_tasklist.tasklist_update
	);
*/
	//app_layers_dev_skytasks_timesort2 = new app_layers_dev_skytasks_ClassTimesort($('#app_layers_dev_skytasks_timesort2'),['11','22','33','44']);

	Elem = $('#-app_layers_dev_skytasks_tasklist_wrapper').clone();
	Elem.prop('id','app_layers_dev_skytasks_tasklist_wrapper');
	Elem.appendTo(position);

/*
	app_layers_dev_skytasks_tasklist[++app_layers_dev_skytasks_tasklist_id] = new app_layers_dev_skytasks_ClassTasklist($('#app_layers_dev_skytasks_tasklist_wrapper'));
*/

	app_layers_dev_skytasks_tasklist = new app_layers_dev_skytasks_ClassTasklist($('#app_layers_dev_skytasks_tasklist_wrapper'));

	var app_layers_dev_skytasks_tasklist_filter = function(type, filter_by){
		//app_layers_dev_skytasks_tasklist[app_layers_dev_skytasks_tasklist_id].tasklist_update(filter_by);
		app_layers_dev_skytasks_tasklist.tasklist_update(type, filter_by);
	}

	app_layers_dev_skytasks_timesort = new app_layers_dev_skytasks_ClassTimesort(
		$('#app_layers_dev_skytasks_timesort'),
		[
			Lincko.Translation.get('app', 3301, 'html').toUpperCase(),/*all*/
			Lincko.Translation.get('app', 3302, 'html').toUpperCase(),/*today*/
			Lincko.Translation.get('app', 3303, 'html').toUpperCase(),/*tomorrow*/
			'Spaces'
		],
		app_layers_dev_skytasks_tasklist_filter
	);




	/*--------------Enquire.JS------------------------------*/
	enquire.register(responsive.minTablet, app_layers_dev_skytasks_minTablet);
	enquire.register(responsive.maxMobileL, app_layers_dev_skytasks_maxMobileL);
	enquire.register(responsive.minMobileL, app_layers_dev_skytasks_minMobileL);
	enquire.register(responsive.isMobile, app_layers_dev_skytasks_isMobile);
	/*--------------Enquire.JS------------------------------*/


	//update tasklist when database is changed
	app_application_lincko.add(
		'app_layers_dev_skytasks_tasklist_wrapper',
		'tasks',
		function(){
			app_layers_dev_skytasks_tasklist.tasklist_update();
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
var app_layers_dev_skytasks_minTablet = function(){
	console.log('dev_skytasks minTablet');
	app_layers_dev_skytasks_timesort.minTablet();
	app_layers_dev_skytasks_tasklist.minTablet();
};
var app_layers_dev_skytasks_maxMobileL = function(){
	console.log('dev_skytasks maxMobileL');
	app_layers_dev_skytasks_timesort.maxMobileL();
	app_layers_dev_skytasks_tasklist.maxMobileL();
};

var app_layers_dev_skytasks_minMobileL = function() {
	console.log('dev_skytasks minMobileL');
	app_layers_dev_skytasks_tasklist.minMobileL();

};
var app_layers_dev_skytasks_isMobile = function() {
	console.log('dev_skytasks isMobile');
	app_layers_dev_skytasks_tasklist.isMobile();

};
/*--------------END of enquire.js functions------------------------------*/
