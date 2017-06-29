var Algorithm = new function()
{	
	var cubeActions = [];
	// Initialize all possible actions for each face.
	for(var i = 0; i < 6; i++) {
		cubeActions.push(new CubeAction(i, false));
		cubeActions.push(new CubeAction(i, true));
	}
	
	var sum = function(array)
	{
		var sum = 0;
		for(var i = 0; i < array.length; i++){
			sum += array[i];
		}
		return sum;
	};

	var maxValAndIndex = function(array)
	{
		if(array.length == 0){
			return -1;
		}

		var maxIdx = 0;
		var maxVal = array[0];
		
		for(var i = 1; i < array.length; i++){
			if(array[i] > maxVal){
				maxIdx = i;
				maxVal = array[i];
			}
		}
		
		return [maxIdx, maxVal];
	};
	
	/*
		This only has to be public for unit testing.
	*/
	this.getMaxValAndIndex = function(array)
	{
		return maxValAndIndex(array);
	};

	this.maxColor = function(cube)
	{
		var faceColors = Array(cube.face.length).fill(-1);
		for(var faceIdx = 0; faceIdx < cube.face.length; faceIdx++){
			var counts = Array(cube.face.length).fill(0);
			for(var cellIdx = 0; cellIdx < cube.face[faceIdx].cell.length; cellIdx++){
				counts[cube.face[faceIdx].cell[cellIdx]]++;
			}
			// Get index and value of max value in cell color count.
			var [maxIdx, maxCount] = maxValAndIndex(counts);
			while(faceColors[maxIdx] >= counts[maxIdx]){
				// If maxIdx exists with count >= maxCount in faceColors, want to use the next most common.
				counts[maxIdx] = -1;
				maxIdx, maxCount = maxValAndIndex(counts);
			}
			faceColors[maxIdx] = maxCount;
		}
		var cost = sum(faceColors);
		return cost;
	};
	
	/*
		Given a cube and a policy, returns a set of actions required to solve the cube.
	*/
	this.solver = function(cube, policy)
	{
		initialState = cube
	}
	
	this.AStar = function(initialState, actions, goalState, policy)
	{
		var openList = [];
		var closedList = [];
		// Put a node on openList for initial state.
		openList.push(new Node(initialState, null));
		
		while(openList.length != 0){
			var q = openList.pop();
			var successors = [];
			for(var i = 0; i < cubeActions.length; i++){
				// Perform the action and save the state to a successor node.
				var node = new Node(cubeActions[i].executeAction(q.state), q);
				if (node.state == goalState) {
					// Stop search.
				}
				// g is the cost of the current state.
				node.g = policy(node.state);
				// h is the estimated distance between the cost of the goalstate and the cost of the current state.
				node.h = policy(goalState) - node.g;
				// f is the sum of the cost of the current state and the distance to the goal state.
				node.f = node.g + node.h;
				// Put the successor node on the heap.
				successors.push(node);
				// Undo the change to q.state, since actions mutate states.
				cubeAction[i].undoAction(q.state);
			}
			// Put q on closedList.
			closedList.push(q);
		}
	}
};

var Node = function(state, parent){
	this.f = 0;
	this.h = 0;
	this.g = 0;
	this.parent = state;
	this.state = parent;
};

this.CubeAction = function(faceIdx, antiClockwise)
{
	this.faceIdx = faceIdx;
	this.antiClockwise = antiClockwise;
	
	this.executeAction = function(cube)
	{
		cube.rotate(faceIdx, antiClockwise);
	}
	
	this.undoAction = function(cube)
	{
		cube.rotate(faceIdx, !antiClockwise);
	}
}