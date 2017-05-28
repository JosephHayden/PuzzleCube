var c;
var cvm;
var camera;
var canvas;
var mouseDown = false;
var oldMousePos = null;
var mousePos;
var mouseSensitivity = 20;

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
		console.log('Cursor out of canvas.');
	}, false);
	
	// Create cube and start drawing it.
	c = new Cube(3);
	c.print();
	[cvm, camera] = start(c);
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
		cvm.addAnimation(1, -angle);
		c.rotate(1, false);
		c.print();
	});
	acwb1.addEventListener('click', function(){
		cvm.addAnimation(1, angle);
		c.rotate(1, true);
	});
	cwb2.addEventListener('click', function(){
		cvm.addAnimation(2, -angle);
		c.rotate(2, false);
	});
	acwb2.addEventListener('click', function(){
		cvm.addAnimation(2, angle);
		c.rotate(2, true);
	});
	cwb3.addEventListener('click', function(){
		cvm.addAnimation(3, -angle);
		c.rotate(3, false);
	});
	acwb3.addEventListener('click', function(){
		cvm.addAnimation(3, angle);
		c.rotate(3, true);
	});
	cwb4.addEventListener('click', function(){
		cvm.addAnimation(4, -angle);
		c.rotate(4, false);
	});
	acwb4.addEventListener('click', function(){
		cvm.addAnimation(4, angle);
		c.rotate(4, true);
	});
	cwb5.addEventListener('click', function(){
		cvm.addAnimation(5, -angle);
		c.rotate(5, false);
	});
	acwb5.addEventListener('click', function(){
		cvm.addAnimation(5, angle);
		c.rotate(5, true);
	});
	cwb6.addEventListener('click', function(){
		cvm.addAnimation(0, -angle);
		c.rotate(0, false);
	});
	acwb6.addEventListener('click', function(){
		cvm.addAnimation(0, angle);
		c.rotate(0, true);
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
		cvm.addAnimation(1, angle);
		c.rotate(1, false);
	}
	if(key == 50) { // 2
		cvm.addAnimation(2, angle);
	}
	if(key == 51) { // 3
		cvm.addAnimation(3, angle);
	}
	if(key == 52) { // 4
		cvm.addAnimation(4, angle);
	}
	if(key == 53) { // 5
		cvm.addAnimation(5, angle);
	}
	if(key == 54) { // 6
		cvm.addAnimation(0, angle);
	}
}