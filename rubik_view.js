var canvas;
var gl;
var horizAspect = 500.0/500.0;
var cubeVerticesBuffer;
var cubeIndicesBuffer;
var cubeColorBuffer;
var vertexPositionAttribute;
var vertexColorAttribute;
var shaderProgram;
var rectLoc = 0.0;
var lastTime = 0; 
var camera;

function Camera(position, target) {
	this.position = $V(position);
	this.target = $V(target);
	this.xAngle = 0;
	this.yAngle = 0;
	this.transformMatrix = Matrix.I(4);
	this.viewMatrix = Matrix.I(4);
	
	this.updateLookAt = function(p, t) {
		var cameraDirection = p.subtract(t).toUnitVector();
		var up = $V([0.0, 1.0, 0.0]);
		this.cameraRight = (up.cross(cameraDirection)).toUnitVector();
		this.cameraUp = (cameraDirection.cross(this.cameraRight));
		
		this.lookAt = $M([
			[this.cameraRight.e(1), this.cameraRight.e(2), this.cameraRight.e(3), 0],
			[this.cameraUp.e(1), this.cameraUp.e(2), this.cameraUp.e(3), 0],
			[cameraDirection.e(1), cameraDirection.e(2), cameraDirection.e(3), 0],
			[0, 0, 0, 1]
		]).x($M([
			[1, 0, 0, -this.position.e(1)],
			[0, 1, 0, -this.position.e(2)],
			[0, 0, 1, -this.position.e(3)],
			[0, 0, 0, 1]
		]));
	}
	
	this.updateLookAt(this.position, this.target);
	
	this.rotateY = function(angle){
		this.position = $V(this.position).rotate(angle, Line.create([this.target.e(1), this.target.e(2), this.target.e(3)], 
													[0, 1, 0]));
		this.yAngle += angle;
		this.updateLookAt(this.position, this.target);
	}
	
	this.rotateX = function(angle){
		if(Math.abs(this.xAngle + angle) < Math.PI / 2){
			// Only allow update if not going to cross y plane.
			this.position = $V(this.position).rotate(angle, Line.create([this.target.e(1), this.target.e(2), this.target.e(3)], 
														[this.cameraRight.e(1), this.cameraRight.e(2), this.cameraRight.e(3)]));
			this.xAngle += angle;
			this.updateLookAt(this.position, this.target);
		}
	}
	
	this.translate = function(direction){
		this.position = $V(this.position).add($V(direction));
		this.target = $V(this.target).add($V(direction));
		this.updateLookAt(this.position, this.target);
	}
}

function CubeViewModel(dimension, cubeSize) {
	this.dimension = dimension;
	this.cells = [];
	
	// Create shell of cubes.
	for(var depth=0; depth < dimension; depth++){
		var dimSquared = dimension*dimension;
		var shift = (dimension - 1)*cubeSize / 2.0;
		for(var i=0; i < dimSquared; i++){
			var x_idx = i % dimension;
			var y_idx = Math.floor(i / dimension);
			// Only want to add outermost cubes, to get shell.
			if(x_idx == 0 || x_idx == dimension-1 || y_idx == 0 || y_idx == dimension-1 || depth == 0 || depth == dimension-1){
				var x = x_idx * cubeSize - shift;
				var y = y_idx * cubeSize - shift;
				var z = depth * cubeSize - shift;
				this.cells.push([x, y, z]);
			}
		}
 	}
	
	this.draw = function(ctx){
	}
}

var cvm = new CubeViewModel(3, 2.02);
start();

//
// start
//
// Called when the canvas is created to get the ball rolling.
// Figuratively, that is. There's nothing moving in this demo.
//
function start() {
  canvas = document.getElementById("glwindow");

  initWebGL(canvas);      // Initialize the GL context
  
  // Only continue if WebGL is available and working

  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Set clear color to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  initShaders();
  initBuffers();
  
  camera = new Camera([0, 0, 0], [0, 0, -20]);
  
  canvas.setAttribute("tabindex", 0); // So canvas can get focus.
  canvas.addEventListener( "keydown", keyDown, true);
  
  window.requestAnimationFrame(drawScene);
}

function keyDown(event){
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
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
  gl = null;

  try {
    gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
  }
  catch(e) {
  }

  // If we don't have a GL context, give up now

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

function resize() {
	gl.viewport(0, 0, canvas.width, canvas.height);
	horizAspect = canvas.height/canvas.width;
}

function initShaders() {
	var fragmentShader = getShader(gl, 'shader-fs');
	var vertexShader = getShader(gl, 'shader-vs');
	
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
	}
	
	gl.useProgram(shaderProgram);
	
	vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(vertexPositionAttribute);
	
	vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'vertexColor');
	gl.enableVertexAttribArray(vertexColorAttribute);
}

function getShader(gl, id, type) {
	var shaderScript, theSource, currentChild, shader;
	
	shaderScript = document.getElementById(id);
	
	if (!shaderScript){
		return null;
	}
	
	theSource = shaderScript.text;
	if (!type) {
		if (shaderScript.type == 'x-shader/x-fragment') {
			type = gl.FRAGMENT_SHADER;
		} else if (shaderScript.type == 'x-shader/x-vertex') {
			type = gl.VERTEX_SHADER;
		} else {
			return null;
		}
	}
	shader = gl.createShader(type);
	gl.shaderSource(shader, theSource);
	gl.compileShader(shader);
	
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}

function initBuffers() {
	cubeVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	
	var vertices = [
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,
		1.0, 1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
	];
		
	/*
	cubeIndicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndicesBuffer);*/
	
	var indices = [
		0, 1, 2, 
		1, 3, 2, // Front
		6, 5, 4,
		6, 7, 5, // Back
		6, 4, 0,
		2, 6, 0, // Right
		1, 5, 7,
		7, 1, 3, // Left
		0, 4, 5,
		0, 5, 1, // Top
		2, 3, 7,
		2, 7, 6, // Bottom
	];
	
	var dupe_vertices = [];
	
	for(var i=0; i < indices.length; i++){
		var x = vertices.slice(indices[i]*3, indices[i]*3+3);
		dupe_vertices = dupe_vertices.concat(x);
	}
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dupe_vertices), gl.STATIC_DRAW);
	
	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
	cubeColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
	// Colors for each face of the cube. Adjacent flat tris get same color.
	var colors = [
		1, 0, 0,
		1, 0, 0,
		1, 0, 0,
		1, 0, 0,
		1, 0, 0,
		1, 0, 0, // Face 1
		0, 1, 0,
		0, 1, 0,
		0, 1, 0,
		0, 1, 0,
		0, 1, 0,
		0, 1, 0, // Face 2
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1, // Face 3
		1, 1, 0,
		1, 1, 0,
		1, 1, 0,
		1, 1, 0,
		1, 1, 0,
		1, 1, 0, // Face 4
		1, 0, 1,
		1, 0, 1,
		1, 0, 1,
		1, 0, 1,
		1, 0, 1,
		1, 0, 1, // Face 5
		0, 1, 1,
		0, 1, 1,
		0, 1, 1,
		0, 1, 1,
		0, 1, 1,
		0, 1, 1 // Face 6
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(colors), gl.STATIC_DRAW);
}

function drawScene(time) {
	// Passed as milliseconds, want seconds.
	time *= 0.001;
	var deltaTime = time - lastTime;
	lastTime = time;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0);
	
	var colorUniform = gl.getUniformLocation(shaderProgram, "color");
	gl.uniform3fv(colorUniform, [0.0, 0.0, 255]);
	
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 3, gl.SHORT, false, 0, 0);
	
	for(var cellIdx=0; cellIdx < cvm.cells.length; cellIdx++){
		loadIdentity();
		mvTranslate([cvm.cells[cellIdx][0], cvm.cells[cellIdx][1], cvm.cells[cellIdx][2] - 20]);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, 36, gl.FLOAT, 0);
	}
	requestAnimationFrame(drawScene);
}

function loadIdentity() {
	mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
	mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
	multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function mvRotate(t) {
	multMatrix(Matrix.RotationY(t).ensure4x4());
}

function mvScale(s) {
	multMatrix(Matrix.I(4).x(s));
}

function setMatrixUniforms() {
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
	
	var viewUniform = gl.getUniformLocation(shaderProgram, "uViewMatrix");
	gl.uniformMatrix4fv(viewUniform, false, new Float32Array(camera.lookAt.flatten()));
}