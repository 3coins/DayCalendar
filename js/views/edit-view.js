

define([
    "jquery",
    "underscore",
    "backbone",
    "order!text!templates/event/edit.html",
    "order!js/libs/jquery-plugins/jquery.tmpl.min.js"
], function($, _, Backbone, editTpl){
	
	var EditView = Backbone.View.extend({
		tagName: "div",
		className: "event-form",
		template: $.template(null, editTpl),
		events:{
			"click button.save": "save",
			"click button.cancel": "cancel"
		},
		
		render: function(vals){
			$(this.el).html($.tmpl(this.template, vals));
			return this;
		},
		
		save: function(evt){
			evt.stopPropagation();
			this.hide();
			$(this.el).trigger("event:save", this.getValues());
		},
		
		getValues: function(){
			var el = $(this.el);
			return {
				start: parseFloat(el.find("#start").val()),
				end: parseFloat(el.find("#end").val()),
				title: el.find("#title").val(),
				description: el.find("#description").val()
			};
		},
		
		show: function(vals){
			$(this.el).css({
				top: vals.top,
				left: vals.left
			}).show();
		},
		
		hide: function(){
			$(this.el).hide();
		},
		
		cancel: function(evt){
			evt.stopPropagation();
			$(this.el).hide().trigger("edit:cancel");
		}
	});
	
	return EditView;
});