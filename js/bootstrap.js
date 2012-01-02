
require.config({
	paths: {
		jquery: "libs/jquery/jquery",
		underscore: "libs/underscore/underscore",
		backbone: "libs/backbone/backbone",
		localstorage: "libs/backbone/backbone-localstorage"
	}
});

require([
	"app"
], function(App){
	App.initialize();
});