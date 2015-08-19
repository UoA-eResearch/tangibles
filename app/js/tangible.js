
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



function Tangible(id, name, size, imageSrc, registrationPoints) {
	this.id = id;
	this.name = name;
	this.size = size;
	this.imageSrc = imageSrc;
	this.registrationPoints = registrationPoints;

	//Create visual to represent tangible
	var image = new Image();
	image.src = this.imageSrc;

	this.visual = new Konva.Image({
		image: image,
		x: this.position.x,
		y: this.position.y,
		width: this.size.width,
		height: this.size.height,
		offsetX: this.size.width/2,
		offsetY: this.size.height/2,
		draggable: true
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
		this.visual.x = point.x;
		this.visual.y = point.y;
	};

	/**
	 *
	 * @param angle
	 */

	this.setOrientation = function (angle) {
		this.visual.rotation(angle);
	};
}

