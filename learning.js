function generateTrainingData(numDataPoints, actions, steps)
{	
	var X = [];
	var Y = [];

	for(var i = 0; i < numDataPoints; i++){
		var cube = new Cube(3);
		var data = generateDataPoint(cube, actions, steps);
		X.push(data[0]);
		Y.push(data[1]);
	}
	
	// Write training data to file.
}

function generateDataPoint(cube, actions, steps)
{
	var x = [];
	var y = [];
	
	var sourceAction = null;
	for(var i = 0; i < steps; i++){
		var possibleNextStates = [];
		var chosenNextAction = 0;
		
		var lastAction = null;
				
		for(var action = 0; action < actions.length; action++){
			actions[action].execute(cube, null);
			// Add the state to list of possible next states.
			possibleNextStates.push(cube.face);
			actions[action].undo(cube, null);
		}
		// Store the original state at the end of the array.
		possibleNextStates.push(cube.face);
		
		var actionIdx = Math.floor(Math.random()*ACTIONSPACE.length);
		while(lastAction != null && lastAction.faceIdx == ACTIONSPACE[actionIdx].faceIdx && 
			lastAction.antiClockwise != ACTIONSPACE[actionIdx].antiClockwise) {
			// Want to avoid taking an action that undoes the last action.
			actionIdx = Math.floor(Math.random()*ACTIONSPACE.length);
		}
		
		actions[actionIdx].execute(cube);
		chosenNextAction = actionIdx; 
				
		x.push(possibleNextStates);
		if(sourceAction != null){
			// If we took sourceAction to get here, want to take the inverse action to get back.
			// If sourceAction is even, inverse is next idx. Else, inverse is previous idx.
			// After we reverse the list, this will give us the action that produces the next state.
			y.push(sourceAction - ((sourceAction % 2) * 2 - 1));
		}
		sourceAction = chosenNextAction;		
	}
	// Remove first element in array since it has no next action.
	x.shift();
	// Reverse arrays to get a "solution" from a shuffle.
	x.reverse();
	y.reverse();
	return [x, y];
}