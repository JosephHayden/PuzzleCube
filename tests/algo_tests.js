QUnit.test( "MaxValAndIndex Empty", function( assert ) {
	var array = [];
	var result = Algorithm.getMaxValAndIndex(array);
	assert.ok( result == -1, "Passed!" );
});

QUnit.test( "MaxValAndIndex Single Positive", function( assert ) {
	var array = [1];
	var result = Algorithm.getMaxValAndIndex(array);
	assert.ok( result[0] == 0 && result[1] == 1, "Passed!" );
});

QUnit.test( "MaxValAndIndex Single Negative", function( assert ) {
	var array = [-12];
	var result = Algorithm.getMaxValAndIndex(array);
	assert.ok( result[0] == 0 && result[1] == -12, "Passed!" );
});

QUnit.test( "MaxValAndIndex Negative", function( assert ) {
	var array = [-1, -5, -3];
	var result = Algorithm.getMaxValAndIndex(array);
	assert.ok( result[0] == 0 && result[1] == -1, "Passed!" );
});

QUnit.test( "MaxValAndIndex Multiple Positive", function( assert ) {
	var array = [1, 5, 12, 42, 22, 13];
	var result = Algorithm.getMaxValAndIndex(array);
	assert.ok( result[0] == 3 && result[1] == 42, "Passed!" );
});

QUnit.test( "MaxColor - Cube Unshuffled", function( assert ) {
	var cube = new Cube(3);
	var cost = Algorithm.maxColor(cube.face);
	assert.ok( cost == 54, "Passed!" );
});

QUnit.test( "MaxColor - Cube One Spin: Face 0", function( assert ) {
	var cube = new Cube(3);
	var expected = 42;
	cube.rotate(0);
	var cost = Algorithm.maxColor(cube.face);
	assert.ok( cost == expected, "Cost: " + cost + ", Expected: " + expected );
});

QUnit.test( "MaxColor - Cube Two Spins: Face 0", function( assert ) {
	var cube = new Cube(3);
	var expected = 42;
	cube.rotate(0);
	cube.rotate(0);
	var cost = Algorithm.maxColor(cube.face);
	assert.ok( cost == expected, "Cost: " + cost + ", Expected: " + expected );
});

QUnit.test( "MaxColor - Cube One Spin: Face 0, One Spin: Face 1", function( assert ) {
	var cube = new Cube(3);
	var expected = 32;
	cube.rotate(0);
	cube.rotate(1);
	var cost = Algorithm.maxColor(cube.face);
	assert.ok( cost == expected, "Cost: " + cost + ", Expected: " + expected );
});

QUnit.test( "Node, Copy Cube", function( assert ) {
	var cube = new Cube(3);
	var node = new Node(cube, null, null);
	cube.rotate(1, false);
	assert.notOk( node.stateEquals(cube.face), "Cube state: " + cube.face + "\n Node state: " +  node.state.face );
});

QUnit.test( "RotateArrayCW", function( assert ) {
	var dimension = 3;
	var array = [1, 2, 3,
				4, 5, 6,
				7, 8, 9];
	var expected = [7, 4, 1,
					8, 5, 2,
					9, 6, 3];
	var actual = rotateArrayCW(array, dimension);
	var actual = rotateArrayCW(array, dimension);
	var equal = (expected.length == actual.length) && expected.every(function(element, index) {
		return element === actual[index]; 
	});

	assert.ok( equal, "Expected: " + expected + "\nActual: " + actual );
});

QUnit.test( "RotateArrayAntiCW", function( assert ) {
	var dimension = 3;
	var array = [1, 2, 3,
				4, 5, 6,
				7, 8, 9];
	var expected = [3, 6, 9,
					2, 5, 8,
					1, 4, 7];
	var actual = rotateArrayAntiCW(array, dimension);
	var equal = (expected.length == actual.length) && expected.every(function(element, index) {
		return element === actual[index]; 
	});

	assert.ok( equal, "Expected: " + expected + "\nActual: " + actual );
});

var twoDimEquals = function(a, b)
{
	for(var i = 0; i < a.length; i++){
		for(var j = 0; j < b.length; j++){
			if(a[i][j] !== b[i][j]){
				return false;
			}
		}
	}
	return true;
}

QUnit.test( "Cube Serialization 1", function( assert ) {
	var dimension = 3;
	var cube = new Cube(dimension);
	var result = new Cube(dimension);
	var serialized = Algorithm.serializeState(cube.face);
	result.fromSerializedState(serialized);
	
	var equal = twoDimEquals(cube.face, result.face);
	
	assert.ok( equal, "Pre-serialization:\n" + cube.print() + "Post-serialization:\n" + result.print() );
});

QUnit.test( "Cube Serialization 2", function( assert ) {
	var dimension = 3;
	var cube = new Cube(dimension);
	cube.rotate(1, false);
	var result = new Cube(dimension);
	var serialized = Algorithm.serializeState(cube.face);
	result.fromSerializedState(serialized);
	
	var equal = twoDimEquals(cube.face, result.face);
	
	assert.ok( equal, "Pre-serialization:\n" + cube.print() + "Post-serialization:\n" + result.print() );
});
