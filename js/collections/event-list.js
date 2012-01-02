	

define([
    "jquery",    
    "underscore",
    "backbone",
    "models/event",
    "localstorage"
], function($, _, Backbone, model, Store){
	
	var EventList = Backbone.Collection.extend({
		model: model,
		localStorage: new Store("calevents"),
		
		processEvents: function(){
			var adjMatrix = this.buildAjacencyMatrix();
			var eventGraph = this.collectConnectedNodes(this.models, adjMatrix);
			this.resetVisitedFlag();
			this.groupNonAdjacentNodes(eventGraph, adjMatrix);
			this.calculatePositionAndDimensions(eventGraph);
			this.updateView();
		},
		
		updateView: function(){
			_.each(this.models, function(model){
				model.save();
				model.trigger("update:view");
			});
		},
		
		clear: function(){
			_.each(this.models, function(model){
				model.destroy();
			});
		},
		
		buildAjacencyMatrix: function(){
			var matrix = [];
			var models = this.models;
			var isAdjacent = this.isAdjacent;
			_.forEach(models, function(ele){
				var row = [];
				_.forEach(models, function(jEle){
					row.push(isAdjacent(ele, jEle));
				});
				matrix.push(row);
			});
			return matrix;
		},
		isAdjacent: function(a,b){
			
			var astart = a.get("start");
			var aend = a.get("end");
			var atitle = a.get("title");
			var bstart = b.get("start");
			var bend = b.get("end");
			var btitle = b.get("title");
			
			
			if(bstart === aend || b.end === astart){
				return false;
			}
			
			if(astart === bstart && aend === bend && atitle !== btitle){
				return true;
			}
			
			// b start lies between a start and end
			if(bstart >= astart && bstart < aend){
				return true;
			}
			
			// b end lies between a start and end
			if(bend >= astart && bend < aend){
				return true;
			}
			
			// a start lies between b start and end
			if(astart >= bstart && astart < bend){
				return true;
			}
			
			// a end lies between b start and end
			if(aend >= bstart && a.end < bend){
				return true;
			}
			
			return false;
		},
		
		collectConnectedNodes: function(nodes, adjMatrix){
			var len = nodes.length;
			var graph = [];
			for(var index = 0; index < len; index++){
				if(!nodes[index].get("visited")){
					var tmp = this.collectUnvisitedNeighbors(index, nodes, adjMatrix, []);
					if(tmp.length){
						graph.push(tmp);
					}
				}
			}
			return graph;
		},
		
		collectUnvisitedNeighbors: function(nodeIndex, nodes, adjMatrix, pushToStack){
			var len = nodes.length;
			var row = adjMatrix[nodeIndex];
			for(var i = 0 ; i < len; i++){
				var node = nodes[i];
				if(row[i] && !node.get("visited")){
					pushToStack.push(node);
					node.set({"visited": true});
					this.collectUnvisitedNeighbors(i, nodes, adjMatrix, pushToStack);
				}
			}
			
			return pushToStack;
		},
		
		resetVisitedFlag: function(){
			_.forEach(this.models, function(node){
				node.set({"visited": false});
			});
		},
		
		groupNonAdjacentNodes: function(eventGraph, adjMatrix){
		
			for(var i = 0; i < eventGraph.length; i++){
				var grp = eventGraph[i];
				var len = grp.length;
				
				for(var j = 0; j < len; j++){
					
					var event = grp[j];
					
					if(event.get("visited")){
						
						grp.splice(j, 1);
						len--;
						j--;
						
					}else{
						
						var tmp = [];
						
						for(var k = 0; k < grp.length; k++){
							var ele = grp[k];
							if($.type(ele) !== "array" && !ele.get("visited")){
								
								var adjacent = this.isAdjacent(ele, event);
								
								if(!adjacent){
									
									jQuery.each(tmp, function(l, item){
										if(this.isAdjacent(ele, item)){
											adjacent = true;
											return false;
										} 
									});
										
									if(!adjacent){	
										grp[k].set({"visited":true});
										tmp.push(ele);
									}
								}
								
							}
						}
						grp[j] = [grp[j]].concat(tmp);
					}
				}
				
			}
		},
		
		calculatePositionAndDimensions: function(eventGraph){
			var totalWidth = $("#timeSlotsColumn").width();
			var hourSlotHeight = $(".half-hour-slot").first().outerHeight() * 2; 
			console.log(eventGraph);
			for(var i = 0; i < eventGraph.length; i++){
				
				var grp = eventGraph[i];
				var width = Math.floor(totalWidth / (grp.length) - 2);
				for(var j = 0; j < grp.length; j++){
					var event = grp[j];
					//if(!event.get("visited")){
						jQuery.each(event, function(index, evt){
							evt.set({
								height: (evt.get("end") - evt.get("start")) * hourSlotHeight - 3,
								width: width,
								top: evt.get("start") * hourSlotHeight,
								left: j * (width + 2) + (1 * j) 
							});
						});
					//}
				}
			}
		}
		
	});
	
	return EventList;
});