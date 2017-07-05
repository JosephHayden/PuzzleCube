var cubeModel;
var cvm;
var camera;
var canvas;
var mouseDown = false;
var oldMousePos = null;
var mousePos;
var mouseSensitivity = 20;
var animationLength = 200;
var ACTIONSPACE; // All possible actions.
var actions = []; // An array of actions to be taken.

function main()
{
	// Set up canvas and listeners.
	canvas = document.getElementById("glwindow");
	
	initializeButtons();
	
	// Mouse control logic.
	canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		// Only rotate cube if mouse has direction and is clicked.
		if (mouseDown && oldMousePos != null){
			var delta = [mousePos.x - oldMousePos.x, mousePos.y - oldMousePos.y];
			camera.rotateY(delta[0]*mouseSensitivity*(Math.PI/32));
			camera.rotateX(delta[1]*mouseSensitivity*(Math.PI/32));
			oldMousePos = mousePos;
		} else if (mouseDown){
			oldMousePos = mousePos;
		}
      }, false);

	// Sets mouseDown to true when mouse is clicked.
	canvas.addEventListener('mousedown', function(evt) {
		mouseDown = true;
	}, false);
	
	// Sets mouseDown to false and clears oldMousePos when mouse is unclicked.
	canvas.addEventListener('mouseup', function(evt) {
		mouseDown = false;
		oldMousePos = null;
	}, false);
	
	// When the mouse leaves the canvas, treat that as if the user stopped clicking.
	canvas.addEventListener('mouseleave', function(evt) {
		mouseDown = false;
		oldMousePos = null;
	}, false);
	
	// Create cube and start drawing it.
	cubeModel = new Cube(3);
	[cvm, camera] = start(cubeModel);
	ACTIONSPACE = [
		new Action(0, false), 
		new Action(0, true), 
		new Action(1, false), 
		new Action(1, true),
		new Action(2, false), 
		new Action(2, true),	
		new Action(3, false), 
		new Action(3, true),
		new Action(4, false), 
		new Action(4, true),
		new Action(5, false), 
		new Action(5, true)
	];
	
	// Set up algorithm actions.
	Algorithm.init(ACTIONSPACE);
}

/*
	Creates event handlers for each face rotation button.
*/
function initializeButtons(){
	var angle = Math.PI/2
	
	var cwb1 = document.getElementById("b1cw");
	var cwb2 = document.getElementById("b2cw");
	var cwb3 = document.getElementById("b3cw");
	var cwb4 = document.getElementById("b4cw");
	var cwb5 = document.getElementById("b5cw");
	var cwb6 = document.getElementById("b6cw");
	var acwb1 = document.getElementById("b1acw");
	var acwb2 = document.getElementById("b2acw");
	var acwb3 = document.getElementById("b3acw");
	var acwb4 = document.getElementById("b4acw");
	var acwb5 = document.getElementById("b5acw");
	var acwb6 = document.getElementById("b6acw");
	
	cwb1.addEventListener('click', function(){
		cvm.addAnimation(1, -angle, animationLength);
		cubeModel.rotate(1, false);
		cubeModel.print();
		cvm.print();
	});
	acwb1.addEventListener('click', function(){
		cvm.addAnimation(1, angle, animationLength);
		cubeModel.rotate(1, true);
		cubeModel.print();
		cvm.print();
	});
	cwb2.addEventListener('click', function(){
		cvm.addAnimation(2, -angle, animationLength);
		cubeModel.rotate(2, false);
		cubeModel.print();
		cvm.print();
	});
	acwb2.addEventListener('click', function(){
		cvm.addAnimation(2, angle, animationLength);
		cubeModel.rotate(2, true);
		cubeModel.print();
		cvm.print();
	});
	cwb3.addEventListener('click', function(){
		cvm.addAnimation(3, -angle, animationLength);
		cubeModel.rotate(3, false);
	});
	acwb3.addEventListener('click', function(){
		cvm.addAnimation(3, angle, animationLength);
		cubeModel.rotate(3, true);
	});
	cwb4.addEventListener('click', function(){
		cvm.addAnimation(4, -angle, animationLength);
		cubeModel.rotate(4, false);
	});
	acwb4.addEventListener('click', function(){
		cvm.addAnimation(4, angle, animationLength);
		cubeModel.rotate(4, true);
	});
	cwb5.addEventListener('click', function(){
		cvm.addAnimation(5, -angle, animationLength);
		cubeModel.rotate(5, false);
	});
	acwb5.addEventListener('click', function(){
		cvm.addAnimation(5, angle, animationLength);
		cubeModel.rotate(5, true);
	});
	cwb6.addEventListener('click', function(){
		cvm.addAnimation(0, -angle, animationLength);
		cubeModel.rotate(0, false);
	});
	acwb6.addEventListener('click', function(){
		cvm.addAnimation(0, angle, animationLength);
		cubeModel.rotate(0, true);
	});
	
	var randomizeButton = document.getElementById("randomize");
	randomizeButton.addEventListener('click', function(){
		randomize(30);
		executeAllActions(cvm);
		clearActions();
	});
	var resetButton = document.getElementById("reset");
	resetButton.addEventListener('click', function(){
		cvm = restart(cubeModel);
	});
	var solveButton = document.getElementById("solve");
	solveButton.addEventListener('click', function(){
		//var [pathToSolution, actionPath] = Algorithm.solver(cubeModel, Algorithm.maxColor);
		var solutions = Algorithm.solver(cubeModel, Algorithm.maxColor);
		var actionPath = solutions[1];
		if(solutions != -1){
			for(var i = 0; i < actionPath.length; i++){
				actions.push(new Action(actionPath[i].faceIdx, actionPath[i].antiClockwise));
			}
			executeAllActions(cvm);
			clearActions();
		} 
		else {
			console.log("No solution sequence was found.");
		}
	});
}

// Gets normalized mouse positions.
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: (evt.clientX - rect.left) / rect.width,
	  y: (evt.clientY - rect.top) / rect.height
	};
}

// Handles keyboard controls.
function keyDown(event)
{
	var key = event.keyCode;
	if(key == 68){ // d
		camera.rotateY(Math.PI/32);
	}
	if(key == 65){ // a
		camera.rotateY(-Math.PI/32);
	}
	if(key == 83){ // s
		camera.rotateX(Math.PI/32);
	}
	if(key == 87){ // w
		camera.rotateX(-Math.PI/32);
	}
	var angle = Math.PI/2
	if(key == 49) { // 1
		cvm.addAnimation(1, angle, animationLength);
		cubeModel.rotate(1, false);
	}
	if(key == 50) { // 2
		cvm.addAnimation(2, angle, animationLength);
		cubeModel.rotate(2, false);
	}
	if(key == 51) { // 3
		cvm.addAnimation(3, angle, animationLength);
		cubeModel.rotate(3, false);
	}
	if(key == 52) { // 4
		cvm.addAnimation(4, angle, animationLength);
		cubeModel.rotate(4, false);
	}
	if(key == 53) { // 5
		cvm.addAnimation(5, angle, animationLength);
		cubeModel.rotate(5, false);
	}
	if(key == 54) { // 6
		cvm.addAnimation(0, angle, animationLength);
		cubeModel.rotate(0, false);
	}
}

/*
	Adds a list of random actions to the action array.
	cvm: the cube view model.
	steps: the number of actions the randomizer should add.
*/
function randomize(steps){
	var lastAction = null;
	for(var i = 0; i < steps; i++){
		var actionIdx = Math.floor(Math.random()*ACTIONSPACE.length);
		while(lastAction != null && lastAction.faceIdx == ACTIONSPACE[actionIdx].faceIdx && 
				lastAction.antiClockwise != ACTIONSPACE[actionIdx].antiClockwise) {
			// Want to avoid taking an action that undoes the last action.
			actionIdx = Math.floor(Math.random()*ACTIONSPACE.length);
		}
		actions.push(ACTIONSPACE[actionIdx]);
		lastAction = ACTIONSPACE[actionIdx];
	}
}

function clearActions(){
	actions = [];
}

/*
	Executes all actions in the action array.
	cvm: the viewmodel you are applying the actions to.
*/
function executeAllActions(cvm){
	for(var i = 0; i < actions.length; i++){
		actions[i].execute(cubeModel, cvm);
	}
}