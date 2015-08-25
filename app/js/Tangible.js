
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



function Tangible(id, name, scale, startAngle, image, registrationPoints) {
	this.id = id;
	this.name = name;
	this.scale = scale;
	this.image = image;
	this.selected = false;
	this.registrationPoints = registrationPoints;
	this.startAngle = startAngle;
	this.onTapCallback = null;
	this.onDragStartCallback = null;
	this.onDragEndCallback = null;

	//Create visual to represent tangible
	var image = new Image();
	image.src = this.image;
    this.width = image.naturalWidth * this.scale;
    this.height = image.naturalHeight * this.scale;

	this.visual = new Konva.Image({
		image: image,
		x: 0,
		y: 0,
		width: this.width,
		height: this.height,
		offsetX: this.width/2,
		offsetY: this.height/2,
		draggable: true,
		shadowColor: 'black',
		shadowBlur: 30,
		shadowOffset: {x : 0, y : 0},
		shadowOpacity: 0.4
	});

	this.visual.on('tap', this.onTap.bind(this));
	this.visual.on('dragstart', this.onDragStart.bind(this));
	this.visual.on('dragend', this.onDragEnd.bind(this));

	// Enable two finger rotation
	this.hammerStartAngle = 0;
	this.hammer = Hammer(this.visual);
	this.hammer.on("transformstart", this.onStartRotate.bind(this)).on("transform", this.onEndRotate.bind(this));

	// Enables transparency intersection
	this.visual.cache();
	this.visual.drawHitFromCache();

}

Tangible.prototype.onStartRotate = function(event)
{
	console.log(event);
	this.hammerStartAngle = this.visual.rotation() - this.startAngle;
};

Tangible.prototype.onEndRotate = function(event)
{
	this.setOrientation(this.hammerStartAngle + event.gesture.rotation);
};

Tangible.prototype.onDragStart = function(event)
{
	if(this.onDragStartCallback != null)
	{
		this.onDragStartCallback(this);
	}
};

Tangible.prototype.onDragEnd = function(event)
{
	if(this.onDragEndCallback != null)
	{
		this.onDragEndCallback(this);
	}
};

Tangible.prototype.onTap = function(event)
{
	event.cancelBubble = true;

	if(this.onTapCallback != null)
	{
		this.onTapCallback(this);
	}
};

Tangible.prototype.select = function()
{
	this.visual.setAttrs({
		shadowColor: 'blue',
		shadowOpacity: 0.7,
		shadowOffset: {x : 0, y : 0}
	});
	this.visual.cache();
};

Tangible.prototype.deselect = function()
{
	this.visual.setAttrs({
		shadowColor: 'black',
		shadowOpacity: 0.4,
		shadowOffset: {x : 0, y : 0}
	});
	this.visual.cache();
};

/**
 *
 * @param point: Point
 */

Tangible.prototype.setPosition = function (point){
	this.visual.setX(point.x);
	this.visual.setY(point.y);
};

/**
 *
 * @param angle
 */

Tangible.prototype.setOrientation = function (angle) {
	this.visual.rotation(angle + this.startAngle) ;
};

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
