
/**
 *
 * @param id
 * @param name
 * @param size
 * @param image
 * @param touchPoints
 * @param distances
 * @param angles
 * @param biggestAnglePoint
 * @param center
 * @constructor
 * //TODO: remove unnecessary parameters
 */

//{"id":2, "name":"Dart", "size":[400,34], "image":"005_dart.png", "touchPoints":[], "distances":[], "angles": [], "biggestAnglePoint":[], "center":[]},

//tangiblesList, orientation, touchPoints, name, type, size

/*

 this.ID = id;
 this.name = name;
 this.type = type;
 this.size = size;
 this.touchPoints = touches;
 this.outlinePoints = outline;
 this.calculateDistances();  //this fills the tangible point distance map
 console.log(JSON.stringify(this));
 return this;
 */


function Tangible(id, name, size, image, touchPoints) {
	this.id = id;
	this.name = name;
	this.size = size;
	this.image = image;
	this.touchPoints = touchPoints;

	this.getCentre = function () { return getCentre(this); };
	this.getAngles = function () { return getAngles(this); };
	this.getDistanceMap = function () { return getDistanceMap(this); };
	this.getPointWithMaxAngle = function () { return getPointWithMaxAngle(this); };
	this.update = function () { update(this); };
}

/**
 * ???
 */

function update(tangible, newTouches)
{

}

/**
 *
 */

function getCentre(tangible)
{
	var centerX=(this.touchPoints[0][0]+this.touchPoints[1][0]+this.touchPoints[2][0])/3;
	var centerY=(this.touchPoints[0][1]+this.touchPoints[1][1]+this.touchPoints[2][1])/3;
	return new Point(centerX, centerY);
}


/**
 *
 */

function getPointWithMaxAngle(tangible) {
	var distanceMap = tangible.getDistanceMap();
	var maxIndex = distanceMap.indexOf(Math.max.apply(Math, distanceMap));
	var point;

	if (maxIndex == 2) {
		point = tangible.touchPoints[0];
	} else if (maxIndex == 1) {
		point = tangible.touchPoints[1];
	} else if (maxIndex == 0) {
		point = tangible.touchPoints[2];
	}

	return point;
}

/**
 *
 */

function getAngles(tangible)
{
	var distanceMap = tangible.getDistanceMap();
	var angles = new Array();

	if(this.distances.length==3) {
		var x = distanceMap[0];
		var y = distanceMap[1];
		var z = distanceMap[2];

		var a1 = Math.acos((x * x + z * z - y * y) / (2 * x * z));
		var a2 = Math.acos((y * y + z * z - x * x) / (2 * y * z));
		var a3 = Math.acos((x * x + y * y - z * z) / (2 * x * y));

		angles.push(a1);
		angles.push(a2);
		angles.push(a3);
	}

	return angles;
}

/**
 *
 */

function getDistanceMap(tangible)
{
	var distanceMap = new Array();

	// Calculate distances between points and update distances array
	for(var i=0; i < tangible.touchPoints.length; i++){
		var ax = tangible.touchPoints[i][0];
		var ay = tangible.touchPoints[i][1];

		for (var j = (i + 1); j < tangible.touchPoints.length; j++)
		{
			// Calculate the distance between two points
			var bx = tangible.touchPoints[j][0];
			var by = tangible.touchPoints[j][1];

			var dx = ax - bx;
			var dy = ay - by;
			var distance = Math.sqrt(dx * dx + dy * dy);

			this.distanceMap.push(distance);
		}
	}

	return distanceMap;
}