importScripts('rubik.js');
importScripts('algorithms.js');
importScripts('actions.js');

onmessage = function(e) {
	if (e.data[0] == "start"){
		var dimension = parseInt(e.data[1]);	
		var cube = new Cube(dimension);
		var actionStrings = e.data[2].split(";");
		var serializedState = e.data[3];
		// Reconstruct the actions from the serialized string.
		var actions = [];
		for (var i = 0; i < actionStrings.length; i++){
			var action = new Action(0, false);
			action.deserialize(actionStrings[i]);
			actions.push(action);
		}
		cube.fromSerializedState(serializedState);
		console.log('Solution search started.');
		solveCube(cube, actions);
	}
}

function solveCube(cube, actions){
	// solutions consists of [state path, action path]
	Algorithm.init(actions);
	var solutions = Algorithm.solver(cube, Algorithm.maxColor);
	var message;
	if(solutions != -1){
		var actionPath = solutions[1];
		message = actionPath.map(function(elem) {
			return elem.serialize();
		}).join(";");
	} 
	else {
		message = "no solution";
	}
	
	postMessage( message );
}