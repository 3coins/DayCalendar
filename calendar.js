$(function(){
	
	var events = [];
	var titleOpts = "abcdefghijklmnopqrstuvwxyz";
	
	// generate random events
	for(var i = 0; i < 15; i++){
		var start = Math.floor(Math.random() * (18 - 7) + 8);
		var end = start + Math.ceil(Math.random() * (18 - start));
		events.push({
			title: titleOpts.substring(Math.floor(Math.random() * 12), Math.ceil(Math.random() * 12 + 11)),
			description: "blah blah blah",
			start: start,
			end: end,
			index: i // adding an index to the events avoids calling "isAdjacent" method during second pass,
					 // adjacency matrix and this index can be used to verify if the node is adjacent
		});
	}
	
	/*events = [{
		description : "blah blah blah",
		end : 14,
		start : 12,
		title : "lmnopqrs"
	}, {
		description : "blah blah blah",
		end : 18,
		start : 15,
		title : "oiwropwr"
	}, {
		description : "blah blah blah",
		end : 18,
		start : 13,
		title : "24jlkajflk"
	}, {
		description : "blah blah blah",
		end : 14,
		start : 9,
		title : "asdfkkwer"
	}, {
		description : "blah blah blah",
		end : 16,
		start : 14,
		title : "lmnopqrs"
	}];*/
	
	console.log(events);
	
	
	renderTimeSlotsColumn();
	renderTimeDisplayColumn();
	
	var timeSlotCol = $("#timeSlotsColumn");
	
	var current;
	
	var formTemplate = $("#event-edit-form");
	var eventEditForm;
	
	function updateForm(vals){
		eventEditForm.find("#title").val(vals.title);
		eventEditForm.find("#description").val(vals.description);
		eventEditForm.find("#start").val(vals.start);
		eventEditForm.find("#end").val(vals.end);
	}
	
	function showEventEditForm(opts){
		if(!eventEditForm){
			eventEditForm = formTemplate.tmpl({
				title: opts.title,
				description: opts.description,
				start: opts.start,
				end: opts.end,
			}).appendTo(document.body);
			eventEditForm.find("button.save").click(function(evt){
				evt.stopPropagation();
				// TODO: save the values, update the event block 
				
				// hide the form
				eventEditForm.hide();
			});
			
			eventEditForm.find("button.cancel").click(function(evt){				
				evt.stopPropagation();
				// hide the form
				eventEditForm.hide();
			});
			
		}
		eventEditForm.css({
			top: opts.start * 26 * 2 + timeSlotCol.offset().top,
			left: opts.left
		}).show();
		
		//TODO: update the form
		updateForm(opts);
	}
	
	function selectEvent(domRef){
		if(domRef.get(0) != ( current && current.get(0))){
			domRef.addClass("active");
			if(current){
				current.removeClass("active");
			}
			current = domRef;
		}
	}
	
	timeSlotCol.delegate("div.half-hour-slot", "dblclick", function(evt){
		var pos = $(this).position();
		var start = pos.top/(26 * 2);
		var end = start + 0.5;
		// bring up the event edit form
		showEventEditForm({
			start: start,
			end: end,
			description: "description",
			title: "New Event",
			left: evt.pageX
		});
	});
	
	timeSlotCol.delegate("div.event", "click", function(evt){
		evt.stopPropagation();
		var $this = $(this);
		selectEvent($this);
	});
	
	timeSlotCol.delegate("div.event", "dblclick", function(evt){
		evt.stopPropagation();
		var $this = $(this);
		var index = $this.attr("data-index");
		var data = events[parseInt(index)];
		var pos = $this.position();
		
		// bring up the event edit form
		showEventEditForm({
			start: data.start,
			end: data.end,
			description: data.description,
			title: data.title,
			left: evt.pageX
		});
		
		//setTimeout(function(){selectEvent($this)}, 100);
	});
	
	$(window).click(function(evt){
		if(current){
			current.removeClass("active");
			current = null;
		}
	});
	
	// create a adjacency graph
	var adjMatrix = [];
	
	var timeStart = new Date();
	
	// build adjacency matrix
	jQuery.each(events, function(i, ele){
		var row = [];
		jQuery.each(events, function(j, jEle){
			row.push(isAdjacent(ele, jEle));
		});
		adjMatrix.push(row);
	});
	
	console.log("Ajacency graph time: " + (new Date() - timeStart) );
	
	console.log(adjMatrix);
	
	var eventGraph = [];
	var len = adjMatrix.length;
	
	timeStart = new Date();
	
	// collect all nodes that are connected
	eventGraph = collectConnectedNodes(events, adjMatrix);
	
	
	// reset the visited flag
	resetVisitedFlag(events);

	
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
						
						var adjacent = isAdjacent(ele, event);
						
						if(!adjacent){
							
							jQuery.each(tmp, function(l, item){
								if(adjMatrix[ele.index][item.index]){
									adjacent = true;
									return false;
								} 
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
	
	// reset the visited flag
	resetVisitedFlag(events);
	
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

function resetVisitedFlag(nodes){
	jQuery.each(nodes, function(i, node){
		node.visited = false;
	});
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
	for(var i = 0 ; i < len; i++){
		if(row[i] && !nodes[i].visited){
			pushToStack.push(nodes[i]);
			nodes[i].visited = true;
			collectUnvisitedNeighbors(i, nodes, adjMatrix, pushToStack);
		}
	}
	
	return pushToStack;
}

