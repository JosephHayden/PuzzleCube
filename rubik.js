function wrap_shift(array)
{
	if(array.length > 1){
		var end = array[array.length - 1];
		for(var idx = array.length - 1; idx > 0; idx--){
			array[idx] = array[idx-1];
		}
		array[0] = end;
	}
}

function wrap_shift_reverse(array)
{
	if(array.length > 1){
		var first = array[0];
		for(var idx = 1; idx < array.length - 1; idx++){
			array[idx] = array[idx-1];
		}
		array[array.length - 1] = first;
	}
}

function Side(dimension, value)
{
	this.cell = Array(dimension*dimension).fill(value);
}

function Cube(dimension)
{
	this.numSides = 6;
	this.dimension = dimension;
	this.face = [];
	for(var sideIdx=0; sideIdx < this.numSides; sideIdx++){
		this.face.push(new Side(dimension, sideIdx));
	}
	
	this.get_cell_ref = function(faceIdx, cellIdx){
		return this.face[faceIdx].cell[cellIdx];
	}
	
	this.set_cell_ref = function(faceIdx, cellIdx, value){
		this.face[faceIdx].cell[cellIdx] = value;
	}
	
	// Each of these is a [face, cell] pair in the strip of all cells bordering a face, listed anticlockwise.
	// The assumed facial topology is:
	/*
		[0]
	 [1][2][3]
		[4]
		[5]
		
		with each cell in row-major format.
	*/
	this.border = initBorderArray(this.dimension);
		
	this.rotate = function(faceIdx){
		// Rotate face.
		rotateArrayCW(this.face[faceIdx], this.dimension);
		// Rotate border dim spaces.
		for(var i = 0; i < this.dimension; i++){
			wrap_shift_ref(this.border[faceIdx], this);
		}
	}
	
	this.print = function(){
		str = Array(this.dimension + 1).join(" ");
		for(var c=0; c < this.face[0].cell.length; c++){
			str = str.concat(this.face[0].cell[c]);
			if((c + 1) % (this.dimension) == 0 && c != this.face[0].cell.length - 1){
				str = str.concat("\n" + Array(this.dimension + 1).join(" "));
			}
		}
		str = str.concat("\n");
		for(var row=0; row < this.dimension; row++){ 
			for(var f=1; f < 4; f++){
				for(var c=row*this.dimension; c < (row + 1)*this.dimension; c++){
					str = str.concat(this.face[f].cell[c]);
				}
			}
			if(row != this.dimension - 1){
				str = str.concat("\n");
			}
		}
		str = str.concat("\n" + Array(this.dimension + 1).join(" "));
		for(var f=4; f < 6; f++){
			for(var c=0; c < this.face[f].cell.length; c++){
				str = str.concat(this.face[f].cell[c]);
				if((c + 1) % (this.dimension) == 0){
					str = str.concat("\n" + Array(this.dimension + 1).join(" "));
				}
			}
		}
		str = str.concat("\n");
		console.log(str);
	}
}

function initBorderArray(dimension){
	border = [[],[],[],[],[],[]];
	// Face 0
	var border_faces = [1, 2, 3];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < dimension; idx++){
			border[0].push([border_faces[border_faces.length - 1 - faceIdx], dimension - 1 - idx]);
		}
	}
	for(var idx = 0; idx < dimension; idx++){
		border[0].push([5, dimension*dimension - 1 - (dimension - 1 - idx)]);
	}
	// Face 1
	border_faces = [0, 2, 4, 5];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < dimension; idx++){
			border[1].push([border_faces[faceIdx], idx*dimension]);
		}
	}

	// Face 2
	border_faces = [1, 0, 3, 4];
	for(var idx = 0; idx < dimension; idx++){
		border[2].push([1, (dimension*dimension) - ((dimension) + idx*(dimension)) + (dimension-1)]);
	}
	for(var idx = 0; idx < dimension; idx++){
		border[2].push([0, (dimension)*(dimension - 1) + idx]);
	}
	for(var idx = 0; idx < dimension; idx++){
		border[2].push([3, idx*(dimension)]);
	}
	for(var idx = 0; idx < dimension; idx++){
		border[2].push([4, dimension - idx - 1]);
	}
	// Face 3
	border_faces = [5, 4, 2, 0];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < dimension; idx++){
			border[3].push([border_faces[faceIdx], (dimension*dimension)- 1 - (idx*dimension)]);
		}
	}
	// Face 4
	border_faces = [1, 2, 3];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < dimension; idx++){
			border[4].push([border_faces[faceIdx], (dimension)*(dimension - 1) + idx]);
		}
	}
	for(var idx = 0; idx < dimension; idx++){
		border[4].push([5, dimension - 1 - idx]);
	}
	// Face 5
	border_faces = [3, 4, 0, 1];
	for(var idx = 0; idx < dimension; idx++){
		border[5].push([border_faces[1], (dimension)*(dimension - 1) + idx]);
	}
	for(var idx = 0; idx < dimension; idx++){
		border[5].push([border_faces[0], (dimension*dimension)- 1 - (idx*dimension)]);
	}
	for(var idx = 0; idx < dimension; idx++){
		border[5].push([border_faces[2], (dimension - 1) - idx]);
	}
	for(var idx = 0; idx < dimension; idx++){
		border[5].push([border_faces[3], idx*dimension]);
	}
	return border;
}

function wrap_shift_ref(array, cube)
{
	if(array.length > 1){
		var end = cube.get_cell_ref(array[array.length - 1][0], array[array.length - 1][1]);
		for(var idx = array.length - 1; idx > 0; idx--){
			cube.set_cell_ref(array[idx][0], array[idx][1], cube.get_cell_ref(array[idx-1][0], array[idx-1][1]));
		}
		cube.set_cell_ref(array[0][0], array[0][1], end);
	}
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