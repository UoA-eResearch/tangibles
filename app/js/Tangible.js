
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



function Tangible(id, name, scale, startAngle, imageData, registrationPoints, cb) {
	this.id = id;
	this.name = name;
	this.scale = scale;
    //this.imageData = imageData;
	this.selected = false;
	this.registrationPoints = registrationPoints;
	this.startAngle = startAngle;
	this.onTapCallback = null;
	this.onDragStartCallback = null;
	this.onDragEndCallback = null;
    this.onloadCb = cb;
    this.isTouchEnabled = true;

    //Create visual to represent tangible
    this.imageObj = new Image();
    this.imageObj.onload = this.onLoad.bind(this);

    if(imageData != null) {
        this.imageObj.src = 'data:image/png;base64,' + imageData;
    }
}

Tangible.prototype.setTouchEnabled = function(isEnabled)
{
    this.isTouchEnabled = isEnabled;
    this.visual.draggable(isEnabled);
};

Tangible.prototype.onLoad = function()
{
    this.width = this.imageObj.naturalWidth * this.scale;
    this.height = this.imageObj.naturalHeight * this.scale;

    if(this.visual == undefined)
    {
        this.visual = new Konva.Image({
            image: this.imageObj,
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
            shadowOpacity: 0.0
        });

        this.visual.on('tap', this.onTap.bind(this));
        this.visual.on('dragstart', this.onDragStart.bind(this));
        this.visual.on('dragend', this.onDragEnd.bind(this));

        // Enable two finger rotation
        this.hammerStartAngle = 0;
        this.hammer = Hammer(this.visual);
        this.hammer.on("transformstart", this.onStartRotate.bind(this)).on("transform", this.onEndRotate.bind(this));
    }
    else
    {
        this.visual.image(this.imageObj);
        this.visual.width(this.width);
        this.visual.height(this.height);
        this.visual.offsetX(this.width/2);
        this.visual.offsetY(this.height/2);
    }

    this.onloadCb(this);

};

Tangible.prototype.onStartRotate = function(event)
{
    if(this.isTouchEnabled)
    {
        console.log(event);
        this.hammerStartAngle = this.visual.rotation() - this.startAngle;
    }
};

Tangible.prototype.onEndRotate = function(event)
{
    if(this.isTouchEnabled) {
        this.setOrientation(this.hammerStartAngle + event.gesture.rotation);
    }
};

Tangible.prototype.onDragStart = function(event)
{
	if(this.onDragStartCallback != null && this.isTouchEnabled)
	{
		this.onDragStartCallback(this);
	}
};

Tangible.prototype.onDragEnd = function(event)
{
	if(this.onDragEndCallback != null && this.isTouchEnabled)
	{
		this.onDragEndCallback(this);
	}
};

Tangible.prototype.onTap = function(event)
{
    if(this.isTouchEnabled) {
        event.cancelBubble = true;

        if (this.onTapCallback != null) {
            this.onTapCallback(this);
        }
    }
};

Tangible.prototype.select = function()
{
	this.visual.setAttrs({
		shadowColor: 'black',
		shadowOpacity: 0.7,
		shadowOffset: {x : 0, y : 0}
	});
	this.visual.cache();
};

Tangible.prototype.deselect = function()
{
	this.visual.setAttrs({
		shadowColor: 'black',
		shadowOpacity: 0.0,
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

Tangible.prototype.setImageData = function (imageData)
{
    var src = 'data:image/png;base64,' + imageData;
    this.imageObj.src = src;
};

/**
 *
 * @param scale
 */

Tangible.prototype.setScale = function (scale) {
    var width = this.imageObj.naturalWidth * scale;
    var height = this.imageObj.naturalHeight * scale;
    this.visual.width(width);
    this.visual.height(height);
    this.visual.offsetX(width/2);
    this.visual.offsetY(height/2);
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


Tangible.sortClockwise = function(points)
{
    var centre = Tangible.getCentroid(points);
    var max_i = Tangible.getAnchorIndex(centre, points); // Point with furthest distance
    var indices = [0, 1, 2]; // indices of triangle
    indices.splice(indices.indexOf(max_i), 1); // remove index of anchor

    // Two possible orders
    var sort_a = [points[max_i], points[indices[0]], points[indices[1]]];
    var sort_b = [points[max_i], points[indices[1]], points[indices[0]]];

    // If determinant > 0 then sort_a CCW
    if(Tangible.determinant(sort_a) > 0)
    {
        return sort_a;
    }

    // Else sort_b CCW
    return sort_b;
};

Tangible.determinant = function(points)
{
    return points[0].x*points[1].y + points[1].x*points[2].y + points[2].x*points[0].y - points[1].y*points[2].x - points[2].y*points[0].x - points[0].y*points[1].x;
};

Tangible.getAnchorIndex = function(centre, points)
{
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

    return max_i;
};

/**
 *
 * @param points
 * @returns {number}
 */

Tangible.getOrientation = function(points)
{
	var centre = Tangible.getCentroid(points);
	var max_i = Tangible.getAnchorIndex(centre, points);

	return centre.angleTo(points[max_i]);
};
