$(function(){
	
	var events = [];
	var titleOpts = "abcdefghijklmnopqrstuvwxyz";
	
	// generate random events
	for(var i = 0; i < 10; i++){
		var start = Math.floor(Math.random() * (18 - 7) + 8);
		var end = start + Math.ceil(Math.random() * (18 - start));
		events.push({
			title: titleOpts.substring(Math.floor(Math.random() * 12), Math.ceil(Math.random() * 12 + 11)),
			description: "blah blah blah",
			start: start,
			end: end
		});
	}
	
	/*var events = [{
		title: "Piyush's Interview",
		start: 9,
		end: 11,
		description: "Interview with Piyush Jain"
	}, {
		title: "Another Interview",
		start: 10,
		end: 12,
		description: "Interview with another candidate"
	}, {
		title: "Lunch",
		start: 11,
		end: 13,
		description: "Go to Lunch"
	}, {
		title: "Test Event",
		start: 12,
		end: 14,
		description: "Some Other Event"
	}, {
		title: "Test Test Event",
		start: 13,
		end: 15,
		description: "blah blah blah blah"
	}, {
		title: "Another Test Event",
		start: 14,
		end: 16,
		description: "blah blah blah"
	},{
		title: "kjadkljAnother Test Event",
		start: 15,
		end: 17,
		description: "blah blah blah"
	},{
		title: "lkajflkjoiwr,mv",
		start: 16,
		end: 19,
		description: "blah blah blah"
	},{
		title: "lkajflkjoiwr,mv",
		start: 16,
		end: 18,
		description: "blah blah blah"
	},{
		title: "ierewrkljalf",
		start: 17,
		end: 18,
		description: "blah blah blah"
	}];*/
	
	renderTimeSlotsColumn();
	renderTimeDisplayColumn();
	
	var timeSlotCol = $("#timeSlotsColumn");
	
	// create a adjacency graph
	var adjGraph = [];
	
	var timeStart = new Date();
	
	jQuery.each(events, function(i, ele){
		var row = [];
		jQuery.each(events, function(j, jEle){
			row.push(isAdjacent(ele, jEle));
		});
		adjGraph.push(row);
	});
	
	console.log("Ajacency graph time: " + (new Date() - timeStart) );
	
	console.log(adjGraph);
	
	var eventGraph = [];
	var len = adjGraph.length;
	
	timeStart = new Date();
	
	eventGraph = collectConnectedNodes(events, adjGraph);
	
	jQuery.each(events, function(i, item){
		item.visited = false;
	});

	
	console.log(" Collecting groups time: " + (new Date() - timeStart));
	
	console.log(eventGraph);
	
	timeStart = new Date();
	
	//return;
	
	// make another pass to do further grouping within a set
	for(var i = 0; i < eventGraph.length; i++){
		
		var grp = eventGraph[i];
		var len = grp.length;
		
		for(var j = 0; j < len; j++){
			
			var event = grp[j];
			
			if(event.visited){
				
				grp.splice(j, 1);
				len--;
				j--;
				
			}else{
				
				var tmp = [];
				
				for(var k = 0; k < grp.length; k++){
					var ele = grp[k];
					if(!ele.visited && $.type(ele) !== "array"){
						
						var adjacent = isAdjacent(event, ele);
						
						if(!adjacent){
							
							jQuery.each(tmp, function(l, item){
								if( isAdjacent(ele, item) ){
									adjacent = true;
									return false;
								}; 
							});
								
							if(!adjacent){	
								grp[k].visited = true;
								tmp.push(ele);
							}
						}
						
					}
				}
				grp[j] = [grp[j]].concat(tmp);
			}
		}
		
	}
	
	console.log("Second pass time: " + (new Date() - timeStart));
	
	console.log(eventGraph);
	
	var totalWidth = timeSlotCol.width();
	var hourSlotHeight = $(".half-hour-slot").first().outerHeight() * 2; 
	var myTemplate = $("#event-template");
	
	timeStart = new Date();
	
	for(var i = 0; i < eventGraph.length; i++){
		
		var grp = eventGraph[i];
		var width = Math.floor(totalWidth / (grp.length) - 2);
		for(var j = 0; j < grp.length; j++){
			var event = grp[j];
			if(event != null){
				jQuery.each(event, function(index, evt){
					evt.height =  (evt.end - evt.start) * hourSlotHeight - 3;
					evt.width = width;
					evt.top = ( evt.start * hourSlotHeight );
					evt.left = j * (width + 2) + (1 * j) ;
				});
				myTemplate.tmpl(event).appendTo(timeSlotCol);
			}
		}
	}
	
	console.log("rendering events time : " + (new Date() - timeStart));
	
});

function isAdjacent(a, b){
	
	if(b.start === a.end || b.end === a.start){
		return false;
	}
	
	if(a.start === b.start && a.end === b.end && a.title !== b.title){
		return true;
	}
	
	// b start lies between a start and end
	if(b.start >= a.start && b.start < a.end){
		return true;
	}
	
	// b end lies between a start and end
	if(b.end >= a.start && b.end < a.end){
		return true;
	}
	
	// a start lies between b start and end
	if(a.start >= b.start && a.start < b.end){
		return true;
	}
	
	// a end lies between b start and end
	if(a.end >= b.start && a.end < b.end){
		return true;
	}
	
	return false;
}

function renderTimeSlotsColumn(){
	
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
	
	
	$("#timeSlotsColumn").append(timeSlots.join(""));
	
}


function renderTimeDisplayColumn(){
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
	
	$("#timeDisplayColumn").append(timeMarkings.join(""));
}

function collectConnectedNodes(nodes, adjMatrix){
	var len = nodes.length;
	var graph = [];
	for(var index = 0; index < len; index++){
		if(!nodes[index].visited){
			var tmp = collectUnvisitedNeighbors(index, nodes, adjMatrix, []);
			if(tmp.length){
				graph.push(tmp);
			}
		}
	}
	return graph;
}


function collectUnvisitedNeighbors(nodeIndex, nodes, adjMatrix, pushToStack){
	var len = nodes.length;
	var row = adjMatrix[nodeIndex];
	for(var i = nodeIndex ; i < len; i++){
		if(row[i] && !nodes[i].visited){
			pushToStack.push(nodes[i]);
			nodes[i].visited = true;
			collectUnvisitedNeighbors(i, nodes, adjMatrix, pushToStack);
		}
	}
	
	return pushToStack;
}

