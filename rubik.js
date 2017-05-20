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
	this.border = [[],[],[],[],[],[]];
	// Face 0
	var border_faces = [1, 2, 3];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < this.dimension; idx++){
			this.border[0].push([border_faces[faceIdx], idx]);
		}
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[0].push([5, this.dimension*this.dimension - 1 - idx]);
	}
	// Face 1
	border_faces = [0, 2, 3, 4];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < this.dimension; idx++){
			this.border[1].push([border_faces[faceIdx], idx*this.dimension]);
		}
	}
	// Face 2
	border_faces = [1, 0, 3, 4];
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[2].push([1, (this.dimension*this.dimension) - ((this.dimension) + idx*(this.dimension)) + (this.dimension-1)]);
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[2].push([0, (this.dimension)*(this.dimension - 1) + idx]);
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[2].push([3, idx*(this.dimension)]);
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[2].push([4, this.dimension - idx - 1]);
	}
	// Face 3
	border_faces = [5, 4, 2, 0];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < this.dimension; idx++){
			this.border[3].push([border_faces[faceIdx], (this.dimension*this.dimension)- 1 - idx]);
		}
	}
	// Face 4
	border_faces = [1, 2, 3];
	for(var faceIdx = 0; faceIdx < border_faces.length; faceIdx++){
		for(var idx = 0; idx < this.dimension; idx++){
			this.border[4].push([border_faces[faceIdx], (this.dimension)*(this.dimension - 1) + idx]);
		}
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[4].push([5, this.dimension - 1 - idx]);
	}
	// Face 5
	border_faces = [3, 5, 0, 1];
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[5].push([3, (this.dimension)*(this.dimension - 1) + idx]);
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[5].push([5, (this.dimension)*(this.dimension - 1) + idx]);
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[5].push([0, (this.dimension - 1) - idx]);
	}
	for(var idx = 0; idx < this.dimension; idx++){
		this.border[5].push([1, idx*this.dimension]);
	}
	
	var check_border = [
	[[1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [3, 1], [5, 3], [5, 2]], // Face 0
	[[0, 0], [0, 2], [2, 0], [2, 2], [3, 0], [3, 2], [4, 0], [4, 2]], // Face 1
	[[1, 3], [1, 1], [0, 2], [0, 3], [3, 0], [3, 2], [4, 1], [4, 0]], // Face 2
	[[5, 3], [5, 2], [4, 3], [4, 2], [2, 3], [2, 2], [0, 3], [0, 2]], // Face 3
	[[1, 2], [1, 3], [2, 2], [2, 3], [3, 2], [3, 3], [5, 1], [5, 0]], // Face 4
	[[3, 2], [3, 3], [5, 2], [5, 3], [0, 1], [0, 0], [1, 0], [1, 2]], // Face 5
	];
	
	var line = "";
	for(var i = 0; i < check_border.length; i++){
		for(var j=0; j < this.border[i].length; j++){
			line = line.concat(check_border[i][j] + " ");
		}
		line = line.concat("\n");
	}
	line = line.concat("\n");
	console.log("EXPECTED:");
	console.log(line);
	line = "";
	for(var i = 0; i < check_border.length; i++){
		for(var j=0; j < this.border[i].length; j++){
			line = line.concat(this.border[i][j] + " ");
		}
		line = line.concat("\n");
	}
	console.log("ACTUAL:");
	console.log(line);
		
	this.rotate = function(faceIdx){
		// Rotate face.
		wrap_shift(this.face[faceIdx].cell);
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

function main()
{
	c = new Cube(2);
	c.set_cell_ref(2, 0, 'x');
	c.rotate(0);
	c.print();
}