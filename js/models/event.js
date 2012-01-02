

define([
    'underscore',
    'backbone'
], function(_, Backbone){
	
	var EventModel = Backbone.Model.extend({
		defaults:{
			title: "New Event",
			description: "description"
		}
	});
	
	return EventModel;
});