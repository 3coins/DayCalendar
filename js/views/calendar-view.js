

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/event-list",
    "views/event-view"
], function($, _, Backbone, EventList, EventView){
	
	var events = new EventList();
	
	var CalendarView = Backbone.View.extend({
		
		el: $("#canvas"),
		timeDisplayEl: $("#timeDisplayColumn"),
		timeSlotsEl: $("#timeSlotsColumn"),
		selectedEvent: null,

		events: {
			"dblclick div.half-hour-slot": "createNew",
			"event:selected": "setSelected",
			"event:edit": "showEditForm",
			"event:save": "saveChanges"
		},
		
		initialize: function(){
			this.renderTimeSlotsColumn();
			this.renderTimeDisplayColumn();
			$(window).bind("click", $.proxy(this.unSelectCurrent, this));
			$(window).bind("keyup", $.proxy(this.deleteSelected, this));
			events.bind("reset", this.addAll, this);
			events.fetch();
		},
		
		deleteSelected: function(evt){
			
			// delete is pressed
			if(evt.which === 13){
				var selectedEvent = this.selectedEvent;
				if(selectedEvent){
					var model = events.getByCid(selectedEvent.getModelId());
					selectedEvent.remove();
					this.selectedEvent = null;
					model.destroy();
					events.processEvents();
				}
			}
		},
		
		addAll: function(){
			var timeSlotsEl = this.timeSlotsEl;
			_.forEach(events.models, function(model){
				var view = new EventView({model: model});
				timeSlotsEl.append(view.render().el);
			});
		},
		
		setSelected: function(e, event){
			if(event != this.selectedEvent){
				this.unSelectCurrent();
				this.selectedEvent = event;
			}
		},
		
		unSelectCurrent: function(){
			if(this.selectedEvent){
				this.selectedEvent.unselect();
			}
		},
		
		saveChanges: function(evt,vals){
			if(!this.selectedEvent){
				var model = events.create(vals);
				this.selectedEvent = new EventView({model: model});
				this.timeSlotsEl.append(this.selectedEvent.render().el);
				events.processEvents();
			}else{
				var model = events.getByCid(this.selectedEvent.getModelId());
				
				if(model.get("start") === vals.start && model.get("end") === vals.end){
					model.set(vals);
					model.save();
					this.selectedEvent.render();
				}else{
					model.set(vals);
					//model.save();
					events.processEvents();
				}
			}
		},
		
		createNew: function(evt){
			var pos = $(evt.target).position();
			var start = pos.top/(26 * 2);
			var end = start + 0.5;
			
			// bring up the event edit form
			this.showEditForm(null,{
				start: start,
				end: end,
				left: evt.pageX - this.timeSlotsEl.offset().left,
				top: pos.top,
				title: "New Event",
				description: "Description"
			});
			
			this.selectedEvent = null;
		},
		
		showEditForm: function(evt, model){
			var that = this;
			
			//TODO: might want to show a loading indicator
			if(!this.editView){
				require(["views/edit-view"], function(editView){
					model = model.toJSON ? model.toJSON() : model;
					that.editView = new editView();
					that.timeSlotsEl.append(that.editView.render(model).el);
					that.editView.show(model);
					//TODO: hide the loading indicator
				});
			}else{
				var json = model.toJSON ? model.toJSON() : model;
				that.editView.render(json);
				that.editView.show({
					top: json.top,
					left: json.left + (json.width || 0)
				});
			}
		},
		
		renderTimeSlotsColumn: function(){
			
			var timeSlots = [];
			
			// create the half hour slots
			for(var i = 0; i < 48; i++){
				timeSlots.push("<div class='half-hour-slot");
				if(i < 16 || i > 35){
					timeSlots.push(" non-working-hours");
				}else{
					timeSlots.push(" working-hours");
				}
				if( i % 2 ){
					timeSlots.push(" half-hour-marker");
				}else{
					timeSlots.push(" full-hour-marker");
				}
				timeSlots.push("'></div>");
			}
			
			this.timeSlotsEl.append(timeSlots.join(""));
			
		},

		
		renderTimeDisplayColumn: function(){
			var timeMarkings = [];
			
			// create the time markings
			for(var i = 1; i < 24; i++){
				timeMarkings.push("<div class='time-marking'>");
				if(i === 12){
					timeMarkings.push("Noon");
				}else if(i < 12){
					timeMarkings.push(i);
					timeMarkings.push(" AM");
				}else{
					timeMarkings.push(i - 12);
					timeMarkings.push(" PM");
				}
				timeMarkings.push("</div>");
			}
			// add one last blank div for the 24th hour
			timeMarkings.push("<div class='time-marking'>&nbsp;</div>");
			
			this.timeDisplayEl.append(timeMarkings.join(""));
		}
		
	});
	
	return CalendarView;
});