var Algorithm = new function()
{	
	var actions = [];
	
	this.init = function(actionArray)
	{
		actions = actionArray;
	};
	
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

	this.maxColor = function(cubeState)
	{
		var faceColors = Array(cubeState.length).fill(-1);
		for(var faceIdx = 0; faceIdx < cubeState.length; faceIdx++){
			// Holds the number of colors in each face.
			var counts = Array(cubeState.length).fill(0);
			for(var cellIdx = 0; cellIdx < cubeState[faceIdx].length; cellIdx++){
				counts[cubeState[faceIdx][cellIdx]]++;
			}
			// Get index and value of max value in cell color count.
			var [maxIdx, maxCount] = maxValAndIndex(counts);
			while(faceColors[maxIdx] >= counts[maxIdx]){
				// If maxIdx exists with count >= maxCount in faceColors, want to use the next most common.
				// Set count of that color to -1 so it will be discounted.
				counts[maxIdx] = -1;
				[maxIdx, maxCount] = maxValAndIndex(counts);
			}
			faceColors[maxIdx] = maxCount;
		}
		var cost = sum(faceColors);
		return cost;
	};
	
		/*
		Given a terminal node, returns a list of nodes that were taken to reach that node, 
		and a list of actions that were taken to reach that node's state.
	*/
	this.reconstructPath = function(node)
	{
		var path = [node];
		var actionPath = [node.action];
		while(node.parent != null){
			node = node.parent;
			path.push(node);
			if(node.action != null){
				actionPath.push(node.action);
			}
		}
		return [path, actionPath.reverse()];
	};
	
	/*
		Given a cube state which is an array of six faces, produce a string representing the cube configuration.
	*/
	this.serializeState = function(state)
	{
		str = "";
		for(var faceIdx = 0; faceIdx < state.length; faceIdx++){
			str = str.concat(state[faceIdx].toString());
			str = str.concat(".");
		}
		return str;
	}
	
	this.AStar = function(initialState, actions, goalState, policy)
	{
		var openList = [];
		var closedList = [];
		var visited = new Map();
		
		var initialNode = new Node(initialState, null, null);
		initialNode.setAttributes(policy);
		
		// Put a node on openList for initial state.
		openList.push(initialNode);
		
		if(openList[0].stateEquals(goalState)) {
			return [[], []];
		}
		
		while(openList.length != 0){
			// Make sure list remains sorted by f.
			openList.sort(this.compare);
			var q = openList.pop();
			var successors = [];
			var checkSuccessors = true;
			
			var key = this.serializeState(q.state.face);
			if(visited.has(key)){
				// If we've visited this state configuration before.
				for(var nodeIdx = 0; nodeIdx < closedList.length; nodeIdx++){
					if(closedList[nodeIdx].stateEquals(q.state.face) && closedList[nodeIdx].state.f < q.state.f) {
						// If current path has lower cost than previous path, make parent of previous node parent of current node.
						q.parent = closedList[nodeIdx].parent;
					} else {
						// If current path has higher cost, there's already a better path to this node.
						checkSuccessors = false;
					}
				}
			} else {
				// If this is first time visiting state configuration, add it to visited map.
				visited.set(key, true);
			}
			
			if (q.stateEquals(goalState)) {
				// Stop search.
				return this.reconstructPath(q);
			}
			
			if(checkSuccessors){
				for(var i = 0; i < actions.length; i++){
					// Perform the action and save the state to a successor node.
					var node = new Node(actions[i].rotateModel(q.state), q, actions[i]);
					// Undo the change to q.state, since actions mutate states.
					actions[i].undo(q.state, null);
					if (node.stateEquals(goalState)) {
						// Stop search.
						return this.reconstructPath(node);
					}
					node.setAttributes(policy);
					// Put the successor node in the array.
					successors.push(node);
				}
				// Add successors to list of open states.
				openList = openList.concat(successors);
			}
			// Put q on closedList.
			closedList.push(q);
		}
		// If we reach this without returning a path, we could not reach the goal state.
		return -1;
	};
	
	// Compare nodes.
	this.compare = function(a, b)
	{
		return a.f - b.f;
	};
	
	/*
		Given a cube and a policy, returns a set of actions required to solve the cube.
	*/
	this.solver = function(cube, policy)
	{
		var initialState = cube;
		var goalState = cube.solution;
		var numFaces = 6;
		console.log("solver running");
		return this.AStar(initialState, actions, goalState, policy);
	};
};

var Node = function(state, parent, action){
	this.f = 0; // f = h + g
	this.h = 0; // Heuristic distance to goal state. 
	this.g = 0; // Distance from initial state.
	this.parent = parent;
	if(state != null){
		this.state = state.copy();
	}
	// The action that led to getting to this state.
	this.action = action;
	
	/*
		Returns true if node state is equal to otherState, false otherwise.
	*/
	this.stateEquals = function(otherState)
	{
		for(var i = 0; i < this.state.face.length; i++){
			for(var j = 0; j < this.state.face[0].length; j++){
				if(this.state.face[i][j] != otherState[i][j]){
					return false;
				}
			}
		}
		return true;
	};
	
	this.setAttributes = function(policy)
	{
		// g is the total cost to the current state (ie cost of this node + g of parent node).
		this.g = policy(this.state.face);
		// h is the estimated cost to the goal-state from the current state.
		this.h = policy(this.state.solution);
		// f is the sum of the cost of the current state and the distance to the goal state.
		this.f = this.g + this.h;
	};
};