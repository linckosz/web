/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_dev_skynotes_editor = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/

function app_layers_skynotes_launchPage(){
	console.log('skynotes_launch fn');
	//feed page
	app_layers_skynotes_feedPage();
};

var app_layers_skynotes_feedPage = function(){
	var position = $('#app_layers_skynotes');
	var Elem;
	position.recursiveEmpty();

	//var elem_easyeditor_wrapper;

/*
	Elem = $('#-app_layers_skynotes_editor').clone().prop('id','app_layers_skynotes_editor');
	elem_easyeditor_wrapper = $('#-app_layers_skynotes_wrapper').clone().prop('id','app_layers_skynotes_wrapper');
	elem_easyeditor_wrapper_inner = elem_easyeditor_wrapper.find('.app_layers_skynotes_wrapper_inner').prop('id','app_layers_skynotes_wrapper_inner');
	Elem.appendTo(elem_easyeditor_wrapper_inner);
	elem_easyeditor_wrapper.appendTo(position);
*/
	//Elem.easyEditor();

	$('#-skynotes_test').clone().prop('id','skynotes_test').appendTo(position);

	//app_layers_dev_skynotes_editor = new app_layers_dev_skynotes_ClassTextEditor(Elem);
	app_layers_dev_skynotes_editor=null;
	delete app_layers_dev_skynotes_editor;
	app_layers_dev_skynotes_editor = new app_layers_dev_skynotes_ClassTextEditor($('#skynotes_test'));

	//$('#app_layers_skynotes_wrapper_inner').addClass('overthrow');

	
	

};



var app_layers_dev_skynotes_ClassTextEditor = function(elem){
	elem.recursiveEmpty();
	this.elem_wrapper = elem;
	this.elem_wrapper_inner;
	this.elem_wrapper_inner_clone;
	this.elem_editor;

	this.that = this;
	this.editor_height;

	this.construct();

}
app_layers_dev_skynotes_ClassTextEditor.prototype.construct = function(){
	var that = this;

	that.elem_wrapper_inner = $('<div id="app_layers_skynotes_wrapper_inner" class="app_layers_skynotes_wrapper_inner"></div>');
	//that.elem_editor = $('#-app_layers_skynotes_editor').clone().prop('id','app_layers_skynotes_editor');
	that.elem_editor = $('<div class="needsclick app_layers_skynotes_editor"></div>')

	that.elem_editor.appendTo(that.elem_wrapper_inner);
	that.elem_wrapper_inner.appendTo(that.elem_wrapper);//.addClass('overthrow');
	that.elem_wrapper.addClass('app_layers_skynotes_wrapper');
	that.elem_editor.easyEditor({
		buttons: ['bold', 'italic', 'link', 'h2', 'h3', 'h4', 'alignleft', 'aligncenter', 'alignright', 'quote', 'code', 'image', 'youtube', 'x']
	});
	that.elem_editor.prev('.easyeditor-toolbar').addClass('app_layers_skynotes_editortool_mobile');
	//$('#-app_layers_skynotes_concealer').prop('id','app_layers_skynotes_concealer').insertAfter(that.elem_wrapper_inner);



/*
	elem_easyeditor_wrapper_inner.addClass('overthrow');
	//that.elem.addClass('overthrow');
	that.elem.prev('.easyeditor-toolbar').addClass('app_layers_skynotes_editortool_mobile');


	//console.log(elem_easyeditor_wrapper);

	$('#-app_layers_skynotes_concealer').prop('id','app_layers_skynotes_concealer').insertAfter(elem_easyeditor_wrapper_inner);
*/


	that.elem_wrapper_inner.keydown(function(){
		console.log('keydown');
		//myIScrollList['app_layers_skynotes_wrapper_inner'].refresh();
/*
		// Create a cloned input element below the original one
		if (!that.elem_wrapper_inner_clone) {
			var zIndex = that.elem_wrapper_inner.css('zIndex');
			if (parseInt(zIndex, 10) == NaN) {
				zIndex = 10;
				that.elem_wrapper_inner.css({zIndex: zIndex});
			}
						  
			that.elem_wrapper_inner_clone = that.elem_wrapper_inner.clone().prop('id','app_layers_skynotes_wrapper_inner_clone');
			that.elem_wrapper_inner_clone.css({
				zIndex: zIndex-1,
				position: 'absolute',
				top: 0,
				left: 0,
				overflow: 'hidden',
				height:500,
			});
			that.elem_wrapper_inner.before(that.elem_wrapper_inner_clone);
		} else {
			// Update contents of the cloned element from the original one
			that.elem_wrapper_inner_clone.html(that.elem_wrapper_inner.html());
		}

		// Here comes the hack:
		//   - set overflow visible but hide element via opactity.
		//   - show cloned element in the meantime
		that.elem_wrapper_inner_clone.css({opacity: 1});
		that.elem_wrapper_inner.css({overflow: 'visible', opacity: 0});
		
		// Immediately turn of overflow and show element again.
		setTimeout(function() {
			that.elem_wrapper_inner.css({overflow: 'hidden', opacity: 1});
			that.elem_wrapper_inner_clone.css({opacity: 0});
		 }, 1);
		myIScrollList['app_layers_skynotes_wrapper_inner'].refresh();


		/*
		var IScroll = myIScrollList['app_layers_skynotes_wrapper_inner'];
		IScroll.refresh();
		
		var wrapper_height = $('#app_layers_skynotes_wrapper').height();
		var scrollY_height = $('#app_layers_skynotes_wrapper').find('.scrollY').height();
		console.log('IScroll.y: '+IScroll.y);
		console.log('wrapper-scrollY: '+(wrapper_height-scrollY_height));


		var editor_height_new = $(this).height();
		console.log('editor height: '+editor_height);
		console.log('editor_height_new: '+editor_height_new);
		if(editor_height_new > editor_height && false){
			IScroll.scrollBy(0,-20);
			console.log('scrolled');
		}
		editor_height = editor_height_new;
		*/
	});

	/*
	easyeditor_toolbar.click(function(){
		if (responsive.test("maxMobileL")){
			if ( easyeditor_toolbar.height() > easyeditor_toolbar.width() ){
				easyeditor_toolbar.velocity({height:60}, {
					mobileHA: hasGood3Dsupport,
				});
			}
			else {
				easyeditor_toolbar.velocity({height:325}, {
					mobileHA: hasGood3Dsupport,
				});
			}
		}
	});
	*/

	$(window).resize(function(){
		that.window_resize();
	});
	//that.window_resize();
	$(window).trigger('resize');

	wrapper_IScroll_cb_creation['app_layers_skynotes_editor'] = function(){
		console.log('skynotes callback creation');
		/*
		myIScrollList['app_layers_skynotes_editor'].on('beforeScrollStart', function(){
			console.log('myscroll refresh');
			myIScrollList['app_layers_skynotes_editor'].refresh();
		});
		*/
	}

	wrapper_IScroll_options_new['app_layers_skynotes_wrapper_inner'] = { 
		bounce: false, 
		fadeScrollbars: false,
	};

}
app_layers_dev_skynotes_ClassTextEditor.prototype.window_resize = function(){
	console.log('window resize skynotes');
	var that = this;
	/*
	var content_height = $('#app_layers_content').outerHeight();
	$('#app_layers_skynotes_wrapper').height(content_height-400);
	*/

	var editor_maxHeight = that.elem_wrapper.height();
	console.log(that.elem_wrapper);
	console.log(editor_maxHeight);
	editor_maxHeight -= that.elem_wrapper_inner.find('.easyeditor-toolbar').outerHeight();
	console.log(editor_maxHeight);
	that.elem_editor.css('height', editor_maxHeight);

}
