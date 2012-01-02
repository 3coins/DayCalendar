

define([
    'jquery',
    'underscore',
    'backbone',
    'views/calendar-view'
], function($, _, Backbone, CalendarView){
	
	return {
		
		initialize: function(){
			$(function(){
				//alert("something");
				new CalendarView();
			});
		}
	}
	 
});