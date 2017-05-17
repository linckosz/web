var alphaScroll = function(iscroll){
	var that = this;
	this.iscroll = iscroll; if(!iscroll.hasVerticalScroll){ return false; }
	this.elem_iscroll_wrapper = $(iscroll.wrapper);
	this.currentLetter = '';

	//build slider
	var elem_slider = $('<ul>').addClass('alphaScroll_slider needsclick').prop('id','');
	for(var i = 65; i <= 90; i++){ //A to Z
		var alpha = String.fromCharCode(i); //capital alpha
		elem_slider.append('<li alphaScroll-slider-val="'+alpha+'">'+alpha+'</li>');
	}

	//add event handlers
	elem_slider.on('mousedown touchstart', this, this.event_handlers.start);
	elem_slider.on('mouseup mouseleave touchend', this, this.event_handlers.end);
	elem_slider.on('mousemove touchmove', this, this.event_handlers.move);

	//add to iscroll wrapper
	this.elem_iscroll_wrapper.append(elem_slider);
}

alphaScroll.prototype.event_handlers = {
	start: function(e){
		var that = e.data;
		e.stopPropagation(); //don't scroll iscroll when using alphaScroll
		$(this).addClass('alphaScroll_slider_active');
		that.scrollToVal($(e.target).attr('alphaScroll-slider-val'));
	},
	end: function(e){
		if(e instanceof $.Event){
			var that = e.data;
			if(e.type == 'mouseleave' && that.elem_iscroll_wrapper.find(e.toElement).length){
				return;
			}
		}
		else if(e instanceof alphaScroll){ var that = e; } 
		
		that.currentLetter = '';
		$('#'+that.iscroll.wrapper.getAttribute('id')+'_alphaScroll_popupLetter').remove();
		$(this).removeClass('alphaScroll_slider_active');
	},
	move: function(e){
		var that = e.data;
		e.preventDefault(); //for iOS, prevent grabbing and attempting to scroll entire document
		if(e.which == 1 || e.type == 'touchmove'){ //mouse is down
			var elem_target;
			if(e.type == 'touchmove'){
				var touches = e.originalEvent.touches[0];
				elem_target = $(document.elementFromPoint(touches.clientX, touches.clientY));
			} else {
				elem_target = $(e.target);
			}
			that.scrollToVal(elem_target.attr('alphaScroll-slider-val'));			
		}
		else if(that.currentLetter && e.type == 'mousemove' && e.which != 1){
			that.event_handlers.end(that);
		}
	},
}

alphaScroll.prototype.show_popupLetter = function(letter){
	var that = this;
	var id_popup = that.iscroll.wrapper.getAttribute('id')+'_alphaScroll_popupLetter';
	if($('#'+id_popup).length){
		$('#'+id_popup).text(letter);
	} else {
		var elem_popup = $('<div>').prop('id',id_popup).text(letter).addClass('alphaScroll_popupLetter');
		$(that.iscroll.wrapper).append(elem_popup);
	}
}

alphaScroll.prototype.scrollToVal = function(val){
	var that = this;
	if(!val || that.currentLetter == val){ return false; } //dont scroll if it is already there
	that.show_popupLetter(val);

	var elem_scrollTo = that.elem_iscroll_wrapper.find('[alphaScroll='+val+']');
	if(elem_scrollTo.length){
		this.currentLetter = val;
		that.iscroll.scrollToElement(elem_scrollTo.get(0),150,0,0,IScroll.utils.ease.quadratic);
	}
}
