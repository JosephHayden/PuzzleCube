function initBorderArray_Test1(){
	this.border = initBorderArray(this.dimension);
	
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
}