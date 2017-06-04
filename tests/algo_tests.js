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
	var cost = Algorithm.maxColor(cube);
	assert.ok( cost == 54, "Passed!" );
});

QUnit.test( "MaxColor - Cube One Spin: Face 0", function( assert ) {
	var cube = new Cube(3);
	var expected = 42;
	cube.rotate(0);
	var cost = Algorithm.maxColor(cube);
	assert.ok( cost == expected, "Cost: " + cost + ", Expected: " + expected );
});

QUnit.test( "MaxColor - Cube Two Spins: Face 0", function( assert ) {
	var cube = new Cube(3);
	var expected = 42;
	cube.rotate(0);
	cube.rotate(0);
	var cost = Algorithm.maxColor(cube);
	assert.ok( cost == expected, "Cost: " + cost + ", Expected: " + expected );
});

QUnit.test( "MaxColor - Cube One Spin: Face 0, One Spin: Face 1", function( assert ) {
	var cube = new Cube(3);
	var expected = 32;
	cube.rotate(0);
	cube.rotate(1);
	var cost = Algorithm.maxColor(cube);
	assert.ok( cost == expected, "Cost: " + cost + ", Expected: " + expected );
});

