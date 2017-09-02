function Action(faceIdx, antiClockwise)
{
	var animationLength = 200;
	this.faceIdx = faceIdx;
	this.antiClockwise = antiClockwise;
	this.angle;
	if (this.antiClockwise) {
		this.angle = Math.PI/2;
	} else {
		this.angle = -Math.PI/2;
	}
	
	this.undo = function(model, cvm)
	{
		if(model != null){
			model.rotate(this.faceIdx, !this.antiClockwise);
		}
		if(cvm != null){
			cvm.addAnimation(this.faceIdx, -this.angle, animationLength);
		}
	};
	
	this.rotateModel = function(model)
	{
		if(model != null){
			model.rotate(this.faceIdx, this.antiClockwise);
		}
		return model;
	}
	
	this.execute = function(model, cvm)
	{
		this.rotateModel(model);
		if(cvm != null){
			cvm.addAnimation(this.faceIdx, this.angle, animationLength);
		}
	};
	
	this.serialize = function()
	{
		var arr = [this.faceIdx.toString(), this.antiClockwise.toString(), this.angle.toString()];
		return arr.join("&");
	};
	
	this.deserialize = function(string)
	{
		splitStr = string.split("&");
		this.faceIdx = parseInt(splitStr[0]);
		this.antiClockwise = (splitStr[1] == "true");
		this.angle = parseFloat(splitStr[2]);
	}
}