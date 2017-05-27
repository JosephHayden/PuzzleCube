var cvm;
var camera;

function main()
{
	var c = new Cube(3);
	c.print();
	[cvm, camera] = start(c);
	cvm.print();
}

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