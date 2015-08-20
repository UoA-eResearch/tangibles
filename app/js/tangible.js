
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

//{"id":2, "name":"Dart", "size":[400,34], "image":"005_dart.png", "registrationPoints":[], "distances":[], "angles": [], "biggestAnglePoint":[], "center":[]},

//tangiblesList, orientation, registrationPoints, name, type, size

/*

 this.ID = id;
 this.name = name;
 this.type = type;
 this.size = size;
 this.registrationPoints = touches;
 this.outlinePoints = outline;
 this.calculateDistances();  //this fills the tangible point distance map
 console.log(JSON.stringify(this));
 return this;
 */



function Tangible(id, name, size, startAngle, imageSrc, registrationPoints) {
	this.id = id;
	this.name = name;
	this.size = size;
	this.imageSrc = imageSrc;
	this.registrationPoints = registrationPoints;
	this.startAngle = startAngle;

	//Create visual to represent tangible
	var image = new Image();
	image.src = this.imageSrc;

	this.visual = new Konva.Image({
		image: image,
		x: 0,
		y: 0,
		width: this.size.width,
		height: this.size.height,
		offsetX: this.size.width/2,
		offsetY: this.size.height/2,
		draggable: true,
		shadowColor: 'black',
		shadowBlur: 30,
		shadowOffset: {x : 10, y : 10},
		shadowOpacity: 0.4
	});

    // Enables transparency intersection
	this.visual.cache();
	this.visual.drawHitFromCache();

	// Add cursor styling
	this.visual.on('mouseover', function() {
		document.body.style.cursor = 'pointer';
	});

	this.visual.on('mouseout', function() {
		document.body.style.cursor = 'default';
	});

	/**
	 *
	 * @param point: Point
	 */

	this.setPosition = function (point){
		this.visual.setX(point.x);
		this.visual.setY(point.y);
	};

	/**
	 *
	 * @param angle
	 */

	this.setOrientation = function (angle) {
		this.visual.rotation(angle + this.startAngle) ;
	};
}

/**
 * Returns centroid of a list of points
 * @param points
 * @returns {number}
 */

Tangible.getCentroid = function(points)
{
	var centre = new Point(0, 0);

	for(var i = 0; i < points.length; i++)
	{
		centre.x = centre.x + points[i].x;
		centre.y = centre.y + points[i].y;
	}

	centre.x = centre.x / points.length;
	centre.y = centre.y / points.length;

	return centre;
};


/**
 *
 * @param points
 * @returns {number}
 */

Tangible.getOrientation = function(points)
{
	var centre = Tangible.getCentroid(points);
	var max = 0;
	var max_i = -1;

	//Find point with greatest distance, we use this as a reference point for determining the angle of the tangible
	for(var i = 0; i < points.length; i++)
	{
		var dist = centre.distanceTo(points[i]);

		if(dist > max)
		{
			max = dist;
			max_i = i;
		}
	}

	return centre.angleTo(points[max_i]);
};