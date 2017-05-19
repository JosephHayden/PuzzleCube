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
	
	this.border = [
	[[1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [3, 1], [5, 3], [5, 2]],
	[[0, 0], [0, 2], [2, 0], [2, 3], [3, 0], [3, 2], [4, 0], [4, 2]],
	[[1, 3], [1, 1], [0, 2], [0, 3], [3, 0], [3, 2], [4, 1], [4, 0]],
	[[5, 3], [5, 2], [4, 3], [4, 2], [2, 3], [2, 2], [0, 3], [0, 2]],
	[[1, 2], [1, 3], [2, 2], [2, 3], [5, 2], [5, 3], [4, 1], [4, 0]],
	[[3, 2], [3, 3], [5, 2], [5, 3], [0, 1], [0, 0], [1, 0], [1, 2]],
	];
	
	this.rotate = function(faceIdx){
		// Rotate face.
		wrap_shift(this.face[faceIdx].cell);
		// Rotate border dim spaces.
		for(var i = 0; i < this.dimension; i++){
			wrap_shift_ref(this.border[faceIdx], this);
		}
	}
	
	this.print = function(){
		str = "  "
		for(var c=0; c < this.face[0].cell.length; c++){
			str = str.concat(this.face[0].cell[c]);
			if(c % this.dimension == 1){
				str = str.concat("\n  ");
			}
		}
		str = str.concat("\n");
		for(var f=1; f < 4; f++){
			for(var c=0; c < this.dimension; c++){
				str = str.concat(this.face[f].cell[c]);
			}
		}
		str = str.concat("\n");
		for(var f=1; f < 4; f++){
			for(var c=2; c < this.dimension + 2; c++){
				str = str.concat(this.face[f].cell[c]);
			}
		}
		str = str.concat("\n  ");
		for(var f=4; f < 6; f++){
			for(var c=0; c < this.face[f].cell.length; c++){
				str = str.concat(this.face[f].cell[c]);
				if(c % this.dimension == 1){
					str = str.concat("\n  ");
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