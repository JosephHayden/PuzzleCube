var canvas;
var gl;
var cvm;
var horizAspect = 500.0/500.0;
var cubeVerticesBuffer;
var overlayCubeVerticesBuffer;
var cubeIndicesBuffer;
var cubeColorBuffer;
var cubeVerticesTextureCoordBuffer;
var vertexPositionAttribute;
var vertexColorAttribute;
var textureCoordAttribute;
var shaderProgram;
var overlayShaderProgram;
var overlayTexture;
var textureLoaded = false;
var overlayImage;
var rectLoc = 0.0;
var lastTime = 0; 
var camera;
var sideEnum;

function Camera(position, target) 
{
	this.position = $V(position);
	this.target = $V(target);
	this.xAngle = 0;
	this.yAngle = 0;
	this.transformMatrix = Matrix.I(4);
	this.viewMatrix = Matrix.I(4);
	
	this.updateLookAt = function(p, t) 
	{
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
	
	this.rotateY = function(angle)
	{
		this.position = $V(this.position).rotate(angle, Line.create([this.target.e(1), this.target.e(2), this.target.e(3)], 
													[0, 1, 0]));
		this.yAngle += angle;
		this.updateLookAt(this.position, this.target);
	}
	
	this.rotateX = function(angle)
	{
		if(Math.abs(this.xAngle + angle) < Math.PI / 2){
			// Only allow update if not going to cross y plane.
			this.position = $V(this.position).rotate(angle, Line.create([this.target.e(1), this.target.e(2), this.target.e(3)], 
														[this.cameraRight.e(1), this.cameraRight.e(2), this.cameraRight.e(3)]));
			this.xAngle += angle;
			this.updateLookAt(this.position, this.target);
		}
	}
	
	this.translate = function(direction)
	{
		this.position = $V(this.position).add($V(direction));
		this.target = $V(this.target).add($V(direction));
		this.updateLookAt(this.position, this.target);
	}
}

function CubeViewModel(cubeSize, cube) 
{
	this.cube = cube;
	this.dimension = cube.dimension;
	this.animations = [];
	this.cell_positions = [];
	this.cell_rotations = [];
	var q = new Quaternion();
	
	this.face_normals = [
		[ 0, 0, 1 ],
		[ 1, 0, 0 ],
		[ 0, 1, 0 ],
		[ -1, 0, 0 ],
		[ 0, 0, -1 ],
		[ 0,-1, 0 ]
	];
	
	// Holds indices of cell_positions in each face.
	this.face = [[], [], [], [], [], []];
	
	this.border = this.cube.border;
	
	// Index of current cell. Use this instead of calculating from iterators to avoid
	// complications that arise from skipping inner cell_positions.
	var cellIdx = 0;
	// Create shell of cubes.
	for(var depth=0; depth < this.dimension; depth++)
	{
		var dimSquared = this.dimension*this.dimension;
		var shift = (this.dimension - 1)*cubeSize / 2.0;
		for(var i=0; i < dimSquared; i++){
			var x_idx = i % this.dimension;
			var y_idx = Math.floor(i / this.dimension);
			// Only want to add outermost cubes, to get shell.
			if(x_idx == 0 || x_idx == this.dimension-1 || y_idx == 0 || y_idx == this.dimension-1 || depth == 0 || depth == this.dimension-1){
				var x = x_idx * cubeSize - shift;
				var y = y_idx * cubeSize - shift;
				var z = depth * cubeSize - shift;
				this.cell_positions.push([x, y, z]);
				//this.cell_rotations.push(Quaternion.fromEuler(1, 0, 0));
				var quat = Quaternion.fromAxisAngle([0, 0, 1], 0);
				this.cell_rotations.push(quat);

				sideEnum = {
					LEFT : 1,
					RIGHT : 3,
					TOP : 5,
					BOTTOM : 2,
					BACK : 0,
					FRONT : 4
				}
				
				var sharedSides = [];

				if (x_idx == 0) { // Left face
					sharedSides.push(sideEnum.LEFT);
				} else if (x_idx == this.dimension - 1) { // Right face
					sharedSides.push(sideEnum.RIGHT);
				}
				if (y_idx == 0) { // Bottom face
					sharedSides.push(sideEnum.BOTTOM);
				} else if (y_idx == this.dimension - 1) { // Top face
					sharedSides.push(sideEnum.TOP);
				}
				if (depth == 0) { // Back face
					sharedSides.push(sideEnum.BACK);
				} else if (depth == this.dimension - 1){ // Front face
					sharedSides.push(sideEnum.FRONT);
				}
				
				for(var f=0; f < sharedSides.length; f++){
					this.face[sharedSides[f]].push(cellIdx);
				}
				cellIdx++;
			}
		}
 	}
	
	for(var faceIdx = 0; faceIdx < this.face.length; faceIdx++){
		switch(faceIdx){
			case sideEnum.LEFT:
				this.face[sideEnum.LEFT] = TwoDSort(this.face[sideEnum.LEFT], this.dimension, false, true);
				break;
			case sideEnum.RIGHT:
				this.face[sideEnum.RIGHT] = TwoDSort(this.face[sideEnum.RIGHT], this.dimension, true, true);
				break;
			case sideEnum.TOP:
				this.face[sideEnum.TOP] = TwoDSort(this.face[sideEnum.TOP], this.dimension, true, false);
				break;
			case sideEnum.BOTTOM:
				this.face[sideEnum.BOTTOM] = TwoDSort(this.face[sideEnum.BOTTOM], this.dimension, true, true);
				break;
			case sideEnum.BACK:
				this.face[sideEnum.BACK] = TwoDSort(this.face[sideEnum.BACK], this.dimension, true, false);
				break;
			case sideEnum.FRONT:
				this.face[sideEnum.FRONT] = TwoDSort(this.face[sideEnum.FRONT], this.dimension, true, true);
				break;
			default:
				break;
		}
	}
	
	this.get_cell_ref = function(faceIdx, cellIdx)
	{
		return this.face[faceIdx][cellIdx];
	}
	
	this.set_cell_ref = function(faceIdx, cellIdx, value)
	{
		this.face[faceIdx][cellIdx] = value;
	}
	
	this.rotate = function(faceIdx, angle)
	{
		// Rotate cells in face.
		for(var i=0; i < this.face[faceIdx].length; i++){
			// Rotating around center point.
			var rotVec = $V(this.cell_positions[this.face[faceIdx][i]]).rotate(-angle, Line.create([0, 0, 0], this.face_normals[faceIdx]));
			this.cell_positions[this.face[faceIdx][i]][0] = rotVec.e(1);
			this.cell_positions[this.face[faceIdx][i]][1] = rotVec.e(2);
			this.cell_positions[this.face[faceIdx][i]][2] = rotVec.e(3);
			var q1 = this.cell_rotations[this.face[faceIdx][i]]; // Quaternion for current cell.
			// Quaternion for current rotation axis.
			var q2 = Quaternion.fromAxisAngle(this.face_normals[faceIdx], -angle);
			// Result of rotating cell quaternion around rotation axis.
			var q3 = q2.mul(q1);
			this.cell_rotations[this.face[faceIdx][i]] = q3;
		}
	}
	
	this.onQuarterTurn = function(faceIdx)
	{
		this.face[faceIdx] = rotateArrayCW(this.face[faceIdx], this.dimension);

		for(var i = 0; i < this.dimension; i++){
			wrap_shift_view_ref(this.border[faceIdx], this);
		}
	}
	
	this.addAnimation = function(faceIdx, angle)
	{
		this.animations.push(new Animation(this, faceIdx, angle, 1000));
	}
	
	/*
		Draws full cube. 
		Requires GL setup prior to use.
	*/
	this.drawFull = function(){
		for(var cellIdx=0; cellIdx < this.cell_positions.length; cellIdx++){
			loadIdentity();
			// Because we're using row-major format, multiply T*R.
			mvTranslate([this.cell_positions[cellIdx][0], this.cell_positions[cellIdx][1], this.cell_positions[cellIdx][2]]);
			mvRotate(this.cell_rotations[cellIdx]);
			setMatrixUniforms(shaderProgram);
			gl.drawArrays(gl.TRIANGLES, 0, 36, gl.FLOAT, 0);
		}
	}
	
	/*  
		Draws one slice of cube. 
		sliceIdx: index of the face to draw.
		Requires GL setup prior to use.
	*/
	this.drawSlice = function(sliceIdx){
		for(var cellIdx=0; cellIdx < this.face[sliceIdx].length; cellIdx++){
			loadIdentity();
			mvTranslate([this.cell_positions[this.face[sliceIdx][cellIdx]][0], 
						 this.cell_positions[this.face[sliceIdx][cellIdx]][1], 
						 this.cell_positions[this.face[sliceIdx][cellIdx]][2]]);
			mvRotate(this.cell_rotations[this.face[sliceIdx][cellIdx]]);
			setMatrixUniforms(shaderProgram);
			gl.drawArrays(gl.TRIANGLES, 0, 36, gl.FLOAT, 0);
		}
	}
	
	/*
		Draws one cell of a cube. 
		cellIdx: index of the cell to draw.
		Requires GL setup prior to use.	
	*/
	this.drawCell = function(cellIdx){
		loadIdentity();
		mvTranslate([this.cell_positions[cellIdx][0], this.cell_positions[cellIdx][1], this.cell_positions[cellIdx][2]]);
		mvRotate(this.cell_rotations[cellIdx]);
		console.log("ROTATION: " + this.cell_rotations[cellIdx].toEuler());
		setMatrixUniforms(shaderProgram);
		gl.drawArrays(gl.TRIANGLES, 0, 36, gl.FLOAT, 0);
	}
	
	this.print = function(){
		str = Array(this.dimension + 1).join("   ");
		for(var c=0; c < this.face[0].length; c++){
			str = str.concat(this.face[0][c].toString().paddingLeft("   "));
			if((c + 1) % (this.dimension) == 0 && c != this.face[0].length - 1){
				str = str.concat("\n" + Array(this.dimension + 1).join("   "));
			}
		}
		str = str.concat("\n");
		for(var row=0; row < this.dimension; row++){ 
			for(var f=1; f < 4; f++){
				for(var c=row*this.dimension; c < (row + 1)*this.dimension; c++){
					str = str.concat(this.face[f][c].toString().paddingLeft("   "));
				}
			}
			if(row != this.dimension - 1){
				str = str.concat("\n");
			}
		}
		str = str.concat("\n" + Array(this.dimension + 1).join("   "));
		for(var f=4; f < 6; f++){
			for(var c=0; c < this.face[f].length; c++){
				str = str.concat(this.face[f][c].toString().paddingLeft("   "));
				if((c + 1) % (this.dimension) == 0){
					str = str.concat("\n" + Array(this.dimension + 1).join("   "));
				}
			}
		}
		str = str.concat("\n");
		console.log("VIEW:");
		console.log(str);
	}
}

function wrap_shift_view_ref(array, cubeViewModel)
{
	if(array.length > 1){
		var end = cubeViewModel.get_cell_ref(array[array.length - 1][0], array[array.length - 1][1]);
		for(var idx = array.length - 1; idx > 0; idx--){
			cubeViewModel.set_cell_ref(array[idx][0], array[idx][1], cubeViewModel.get_cell_ref(array[idx-1][0], array[idx-1][1]));
		}
		cubeViewModel.set_cell_ref(array[0][0], array[0][1], end);
	}
}

function wrap_shift_view_ref_rev(array, cubeViewModel)
{
	if(array.length > 1){
		var front = cubeViewModel.get_cell_ref(array[0][0], array[0][1]);
		for(var idx = 1; idx > array.length; idx++){
			cubeViewModel.set_cell_ref(array[idx][0], array[idx][1], cubeViewModel.get_cell_ref(array[idx-1][0], array[idx-1][1]));
		}
		cubeViewModel.set_cell_ref(array[array.length - 1][0], array[array.length - 1][1], front);
	}
}

/*
	Called when the canvas is created.
*/
function start(cube) 
{
  canvas = document.getElementById("glwindow");

  initWebGL(canvas);      // Initialize the GL context
  
  cvm = new CubeViewModel(2.02, cube);
  
  // Only continue if WebGL is available and working

  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Set clear color to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  initShaders();
  initBuffers();
  initTextures();
  
  camera = new Camera([0, 0, 20], [0, 0, 0]);
  
  canvas.setAttribute("tabindex", 0); // So canvas can get focus.
  canvas.addEventListener("keydown", keyDown, true);
  
  window.requestAnimationFrame(drawScene);
  
  return [cvm, camera];
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() 
{
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

function resize() 
{
	gl.viewport(0, 0, canvas.width, canvas.height);
	horizAspect = canvas.height/canvas.width;
}

function initShaders() 
{
	var fragmentShader = getShader(gl, 'shader-fs');
	var vertexShader = getShader(gl, 'shader-vs');
	
	var overlayFragmentShader = getShader(gl, 'overlay-shader-fs');
	var overlayVertexShader = getShader(gl, 'overlay-shader-vs');
	
	// Shader for the cubes.
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
	
	// Overlay shader (with texture).
	overlayShaderProgram = gl.createProgram();
	gl.attachShader(overlayShaderProgram, overlayVertexShader);
	gl.attachShader(overlayShaderProgram, overlayFragmentShader);
	gl.linkProgram(overlayShaderProgram);
	
	if (!gl.getProgramParameter(overlayShaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(overlayShaderProgram));
	}
	
	gl.useProgram(overlayShaderProgram);
	
	vertexPositionAttribute = gl.getAttribLocation(overlayShaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(vertexPositionAttribute);
	
	textureCoordAttribute = gl.getAttribLocation(overlayShaderProgram, 'aTextureCoord');
	gl.enableVertexAttribArray(textureCoordAttribute);
	gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
}

function getShader(gl, id, type) 
{
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

function initBuffers() 
{
	overlayCubeVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, overlayCubeVerticesBuffer);
	
	var vertices = [
	  // Front face
	  -1.0, -1.0,  1.0,
	   1.0, -1.0,  1.0,
	   1.0,  1.0,  1.0,
	  -1.0,  1.0,  1.0,
	  
	  // Back face
	  -1.0, -1.0, -1.0,
	  -1.0,  1.0, -1.0,
	   1.0,  1.0, -1.0,
	   1.0, -1.0, -1.0,
	  
	  // Top face
	  -1.0,  1.0, -1.0,
	  -1.0,  1.0,  1.0,
	   1.0,  1.0,  1.0,
	   1.0,  1.0, -1.0,
	  
	  // Bottom face
	  -1.0, -1.0, -1.0,
	   1.0, -1.0, -1.0,
	   1.0, -1.0,  1.0,
	  -1.0, -1.0,  1.0,
	  
	  // Right face
	   1.0, -1.0, -1.0,
	   1.0,  1.0, -1.0,
	   1.0,  1.0,  1.0,
	   1.0, -1.0,  1.0,
	  
	  // Left face
	  -1.0, -1.0, -1.0,
	  -1.0, -1.0,  1.0,
	  -1.0,  1.0,  1.0,
	  -1.0,  1.0, -1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	
	var indices = [
	  0,  1,  2,      0,  2,  3,    // front
	  4,  5,  6,      4,  6,  7,    // back
	  8,  9,  10,     8,  10, 11,   // top
	  12, 13, 14,     12, 14, 15,   // bottom
	  16, 17, 18,     16, 18, 19,   // right
	  20, 21, 22,     20, 22, 23    // left
	];
	
	cubeIndicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
	cubeVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	
	var dupe_vertices = [];
	
	// Creates array of 32 vertices, so each triangle has its own verts.
	for(var i=0; i < indices.length; i++){
		var x = vertices.slice(indices[i]*3, indices[i]*3+3);
		dupe_vertices = dupe_vertices.concat(x);
	}
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dupe_vertices), gl.STATIC_DRAW);
	
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
		1, 1, 1,
		1, 1, 1,
		1, 1, 1,
		1, 1, 1,
		1, 1, 1,
		1, 1, 1, // Face 4
		1, 1, 0,
		1, 1, 0,
		1, 1, 0,
		1, 1, 0,
		1, 1, 0,
		1, 1, 0, // Face 5
		1, 0.5, 0,
		1, 0.5, 0,
		1, 0.5, 0,
		1, 0.5, 0,
		1, 0.5, 0,
		1, 0.5, 0 // Face 6
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	cubeVerticesTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
	
	var textureCoordinates = [
    // Front
    0.0,  1.0,
    0.33,  1.0,
    0.33,  0.5,
    0.0,  0.5,
    // Back
    0.99,  1.0,
    0.99,  0.5,
	0.66,  0.5,
	0.66,  1.0,
    // Top
	0.33,  0.5,
    0.33,  1.0,
	0.66,  1.0,
    0.66,  0.5,
    // Bottom
    0.33,  0.5,
	0.66,  0.5,
	0.66,  0.0,
    0.33,  0.0,
    // Right
	0.99,  0.5,
    0.99,  0.0,
    0.66,  0.0,
	0.66,  0.5,
    // Left
	0.0,  0.5,
    0.33,  0.5,
    0.33,  0.0,
	0.0,  0.0
	];
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
}

function drawScene(time) 
{
	if(cvm.animations.length > 0){
		// Pop off any finished animations.
		while(cvm.animations.length > 0 && cvm.animations[cvm.animations.length - 1].isFinished){
			cvm.animations.pop();
		}
		if(cvm.animations.length > 0){
			// Update animation at front of stack.
			cvm.animations[cvm.animations.length - 1].update();
		}
	}

	// Passed as milliseconds, want seconds.
	time *= 0.001;
	var deltaTime = time - lastTime;
	lastTime = time;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0);
	
	gl.useProgram(shaderProgram);
	
	var colorUniform = gl.getUniformLocation(shaderProgram, "color");
	gl.uniform3fv(colorUniform, [0.0, 0.0, 255]);
	
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);
	
	//cvm.drawCell(17);
	cvm.drawFull();
	//cvm.drawSlice(5);
	
	gl.useProgram(overlayShaderProgram);
	// Only want to draw the overlay if the texture is loaded (since the texture is all we're using it for).
	if(textureLoaded){
		drawOverlay();
	}

	requestAnimationFrame(drawScene);
}

function drawOverlay(){
	loadIdentity();
	
	var scaleUniform = gl.getUniformLocation(overlayShaderProgram, "uScaleMatrix");
	gl.uniformMatrix4fv(scaleUniform, false, new Float32Array($M([[3.5, 0, 0, 0], [0, 3.5, 0, 0], [0, 0, 3.5, 0], [0, 0, 0, 1]]).flatten()));
	
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, overlayCubeVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
	//gl.enableVertexAttribArray(textureCoordAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, overlayTexture);
	gl.uniform1i(gl.getUniformLocation(overlayShaderProgram, 'uSampler'), 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndicesBuffer);
	setMatrixUniforms(overlayShaderProgram);
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function loadIdentity() 
{
	mvMatrix = Matrix.I(4);
}

function multMatrix(m) 
{
	mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) 
{
	multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function mvRotate(q) 
{
	/*
	multMatrix(Matrix.RotationY(t[1]).ensure4x4());
	multMatrix(Matrix.RotationZ(t[2]).ensure4x4());
	multMatrix(Matrix.RotationX(t[0]).ensure4x4());
	*/
	var m1 = $M(q.toMatrix4(true));
	multMatrix(m1);
}

/* 
	Sorts a 1d representation of 2d space by its axes.
	xDimIncreasing: specifies whether x axis in array space should be increasing or decreasing.
	yDimIncreasing: specifies whether y axis in array space should be increasing or decreasing.
	Modifies array.
	Returns sorted array.
*/
function TwoDSort(array, dimensions, xDimIncreasing, yDimIncreasing){
	var newArr = Array(dimensions);
	for(var i = 0; i < newArr.length; i++){
		newArr[i] = [];
	}
	// Break sorted array into #dim rows.
	for(var i = 0; i < array.length; i++){
		var idx = Math.floor(i/dimensions);
		newArr[idx].push(array[i]);
	}
	// Sort each row in order of xDimIncreasing.
	for(var i = 0; i < newArr.length; i++){
		newArr[i].sort(function(a, b){ 
			if(xDimIncreasing)
				return a >= b;
			else
				return a < b;
		});
	}
	// Sort rows in order of yDimIncreasing.
	newArr.sort(function(a, b){
		if(yDimIncreasing)
			return a[0] >= b[0];
		else
			return a[0] < b[0];
	});
	
	return [].concat.apply([], newArr);
}

function mvScale(s) 
{
	multMatrix(Matrix.I(4).x(s));
}

function setMatrixUniforms(program) 
{
	var pUniform = gl.getUniformLocation(program, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(program, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
	
	var viewUniform = gl.getUniformLocation(program, "uViewMatrix");
	gl.uniformMatrix4fv(viewUniform, false, new Float32Array(camera.lookAt.flatten()));
}

/*
	Rotates a 1D representation of a 2D array clockwise.
*/
function rotateArrayCW(array, dimension){
	var newArr = Array(array.length);
	for(var x = 0; x < dimension; x++){
		for(var y = 0; y < dimension; y++){
			var newX = dimension - 1 - x;
			var newIdx = (dimension*y) + newX;
			newArr[newIdx] = array[(dimension*x) + y];
		}
	}
	return newArr;
}

/*
	Rotates a 1D representation of a 2D array anticlockwise.
*/
function rotateArrayAntiCW(array, dimension){
	var newArr = Array(array.length);
	for(var x = 0; x < dimension; x++){
		for(var y = 0; y < dimension; y++){
			var newY = dimension - 1 - y;
			var newIdx = (dimension*newY) + x;
			newArr[newIdx] = array[(dimension*x) + y];
		}
	}
	return newArr;
}

String.prototype.paddingLeft = function (paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};

function initTextures() {
  overlayTexture = gl.createTexture();
  overlayImage = new Image();
  overlayImage.onload = function() { handleTextureLoaded(overlayImage, overlayTexture); }
  overlayImage.src = 'overlay_texture.png';
}

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  textureLoaded = true;
}

/*
	Takes a start and an end quaternion, and a value t. Finds the interpolated value at t between qStart and qEnd.
	qStart: An initial quaternion.
	qEnd: The target quaternion.
	t: A value from [0, 1] which is the interpolation parameter.
	Returns: Quaternion of qStart and qEnd interpolated at t.
*/
function slerp(qStart, qEnd, t){
	var dif = qEnd.sub(qStart);
	var delta = def.pow(t);
	return qStart.mul(delta);
}

/*
	Animates the rotation of a cube face.
	cvm: a reference to the cube we are animating.
	faceIdx: the index of the face we want to rotate, as defined in cvm.
	angle: the angle we want to rotate the face around its normal.
	rotationTime: the number of milliseconds the rotation should take to complete.
*/
function Animation(cvm, faceIdx, angle, rotationTime){
	this.isFinished = false;
	this.cvm = cvm;
	this.startTime = new Date().getTime();
	this.startAngle = 0;
	this.targetAngle = angle;
	this.currentAngle = 0;
	this.rotationTime = rotationTime;
	this.faceIdx = faceIdx;
	var currentTime = this.startTime;
	
	Animation.easeInOut = function(t)
	{
		return 3*Math.pow(t, 2) - 2*Math.pow(t, 3);
	}
	
	this.update = function(){
		// Use smooth-step function to get smooth transition from 0 to 1.
		currentTime = new Date().getTime();
		var x = Math.min((currentTime - this.startTime) / this.rotationTime, 1.0);
		// Sample the curve value at x.
		var t = Animation.easeInOut(x);
		if(t == 1.0){
			this.isFinished = true;
			this.cvm.onQuarterTurn(this.faceIdx);
		}
		var delta = this.targetAngle*t - this.currentAngle;
		console.log(delta);
		this.cvm.rotate(this.faceIdx, delta);
		this.currentAngle += delta;
	}
}