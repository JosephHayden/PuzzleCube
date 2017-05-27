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
	
	canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		if (mouseDown && oldMousePos != null){
			var delta = [mousePos.x - oldMousePos.x, mousePos.y - oldMousePos.y];
			camera.rotateY(delta[0]*mouseSensitivity*(Math.PI/32));
			camera.rotateX(delta[1]*mouseSensitivity*(Math.PI/32));
			oldMousePos = mousePos;
		} else if (mouseDown){
			oldMousePos = mousePos;
		}
      }, false);

	canvas.addEventListener('mousedown', function(evt) {
		mouseDown = true;
	}, false);
	
	canvas.addEventListener('mouseup', function(evt) {
		mouseDown = false;
		oldMousePos = null;
	}, false);
	
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
		c.rotate(1);
		c.print();
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