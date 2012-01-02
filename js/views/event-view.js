

define([
    "jquery",
    "underscore",
    "backbone",
    "order!text!templates/event/view.html",
    "order!js/libs/jquery-plugins/jquery.tmpl.min.js"
], function($, _, Backbone, viewTpl){
	
	var EventView = Backbone.View.extend({
		
		tagName: "div",
		className: "event",
		
		template: $.template(null, viewTpl),
		
		events: {
			"click": "select",
			"dblclick": "edit"
		},
		
		initialize: function(){
			this.model.bind("update:view", this.update, this);
		},
		
		render: function(){
			var model = this.model.toJSON();
			
			$(this.el).html($.tmpl(this.template,model)).css({
				width: model.width,
				height: model.height,
				top: model.top,
				left: model.left
			}).attr("data-id", this.model.cid);
			
			return this;
		},
		
		update: function(){
			var model = this.model.toJSON();
			$(this.el).html($.tmpl(this.template,model)).css({
				width: model.width,
				height: model.height,
				top: model.top,
				left: model.left
			});
		},
		
		select: function(evt){
			evt.stopPropagation();
			var that = this;
			$(this.el).addClass("active").trigger("event:selected", that);
		},
		
		unselect: function(){
			$(this.el).removeClass("active");
		},
		
		edit: function(evt){
			evt.stopPropagation();
			var that = this;
			$(this.el).trigger("event:edit", that.model, that);
		},
		
		getModelId: function(){
			return $(this.el).attr("data-id");
		}
	});
	
	return EventView;
});