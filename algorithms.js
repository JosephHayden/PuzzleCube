var Algorithm = new function()
{	
	var sum = function(array)
	{
		var sum = 0;
		for(var i = 0; i < array.length; i++){
			sum += array[i];
		}
		return sum;
	};

	var maxValAndIndex = function(array)
	{
		if(array.length == 0){
			return -1;
		}

		var maxIdx = 0;
		var maxVal = array[0];
		
		for(var i = 1; i < array.length; i++){
			if(array[i] > maxVal){
				maxIdx = i;
				maxVal = array[i];
			}
		}
		
		return [maxIdx, maxVal];
	};
	
	/*
		This only has to be public for unit testing.
	*/
	this.getMaxValAndIndex = function(array)
	{
		return maxValAndIndex(array);
	};

	this.maxColor = function(cube)
	{
		var faceColors = Array(cube.face.length).fill(-1);
		for(var faceIdx = 0; faceIdx < cube.face.length; faceIdx++){
			var counts = Array(cube.face.length).fill(0);
			for(var cellIdx = 0; cellIdx < cube.face[faceIdx].cell.length; cellIdx++){
				counts[cube.face[faceIdx].cell[cellIdx]]++;
			}
			// Get index and value of max value in cell color count.
			var [maxIdx, maxCount] = maxValAndIndex(counts);
			while(faceColors[maxIdx] >= counts[maxIdx]){
				// If maxIdx exists with count >= maxCount in faceColors, want to use the next most common.
				counts[maxIdx] = -1;
				maxIdx, maxCount = maxValAndIndex(counts);
			}
			faceColors[maxIdx] = maxCount;
		}
		var cost = sum(faceColors);
		return cost;
	};
};