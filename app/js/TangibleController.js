/**
 *
 * @param error
 * @constructor
 */

function TangibleController(surface, error) {

    this.error = typeof error !== 'undefined' ? a : 50; //set error to default
    this.libraryName;
    this.tangibleLibrary = [];
    this.tangibles = [];
    this.surface = surface;

    /**
     *  Event handlers
     */

    this.surface.stage.getContent().addEventListener('touchstart', this.onTouch.bind(this)); //Gotta bind this, so that 'this' in onTouch is actually the controller
}

/**
 * Loads a tangible library into memory
 * @param name: the name of the tangible library. TODO: document how to create a tangible library
 * 'http://130.216.148.185:8000/capacitive-tangibles/app/libraries/oroo/tangibles.json'
 */

TangibleController.prototype.loadTangibleLibrary = function(url)
{
    var json_data = loadJSON(url);
    console.log(json_data);
    this.tangibleLibrary = [];
    this.libraryName = json_data.name;

    for(var i = 0; i < json_data.tangibleLibrary.length; i++) {
        var tangible = json_data.tangibleLibrary[i];
        var points = toPoints(tangible.registrationPoints);
        this.tangibleLibrary[i] = new Tangible(tangible.id, tangible.name, new Size(tangible.size[0], tangible.size[1]), tangible.startAngle, 'libraries/' + json_data.name + '/' + tangible.image, points);
    }
};

TangibleController.prototype.saveDiagram = function()
{
    var parsedTangibles = [];

    for(var i = 0; i < this.tangibles.length; i++)
    {
        var tangible = this.tangibles[i];
        parsedTangibles[i] = {"id":tangible.id, "position": [tangible.visual.getX(),  tangible.visual.getY()], "orientation": tangible.visual.rotation()};
    }

    var json_data = {"libraryName": this.libraryName, "tangibles": parsedTangibles};

    var blob = new Blob([JSON.stringify(json_data)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "diagram.json");
};

/**
 *
 * @param tangibles
 * @param touchPoints
 */

TangibleController.prototype.getRecognizedTangible = function(points) {
    var recognised = false;

    // We need to have minimum of three touch points to identify the Tangible and it's orientation.
    if (points.length > 2)
    {
        var touchPointsDists = this.getDistances(points);

        for(var i = 0; i < this.tangibleLibrary.length; i++)
        {
            var regTangibleDists = this.getDistances(this.tangibleLibrary[i].registrationPoints);
            var numSidesEqual = 0;

            //Counts how many sides of tangible triangle match touch point triangle sides
            for (var j = 0; j < touchPointsDists.length; j++)
            {
                var touchPointsDist = touchPointsDists[j];

                for (var k = 0; k < regTangibleDists.length; k++){

                    var tangibleDist = regTangibleDists[k];

                    if ( touchPointsDist >= tangibleDist - this.error && touchPointsDist <= tangibleDist + this.error) //add degree of error here
                    {
                        numSidesEqual++;
                        break;
                    }
                }
            }

            //Return recognised tangible
            if ((numSidesEqual == touchPointsDists.length) && (regTangibleDists.length == touchPointsDists.length))
            {
                var temp = this.tangibleLibrary[i];
                return new Tangible(temp.id, temp.name, temp.size, temp.startAngle, temp.imageSrc, temp.registrationPoints);
            }
        }
    }

    return null; //No tangible was recognised
};


/**
 *
 * @param points
 * @returns {number}
 */

TangibleController.prototype.getDistances = function(points)
{
    var distances = new Array();

    // Calculate distances between points and update distances array
    for(var i=0; i < points.length; i++){
        for (var j = (i + 1); j < points.length; j++)
        {
            var distance = points[i].distanceTo(points[j])
            distances.push(distance);
        }
    }

    return distances;
};

/** Tangible detection loop TODO: customise for registration and active use
*
* @param points
* @returns {number}
*/

TangibleController.prototype.onTouch = function(event) {
    var hello = this;

    var touchPoints = this.surface.getTouchPoints(event);

    this.surface.drawTouchPoints(touchPoints); //Visualise touch points

    //Get recognised tangible and add to surface
    if (touchPoints.length > 2)
    {

        var tangible = this.getRecognizedTangible(touchPoints);
        if (tangible != null) {
            //Set starting orientation and position
            tangible.setPosition(Tangible.getCentroid(touchPoints));
            tangible.setOrientation(Tangible.getOrientation(touchPoints));

            // Enable two finger rotation
            var x = tangible.visual;

            this.tangibles.push(tangible);
            this.surface.addTangible(tangible);

            var hammer = Hammer(tangible.visual);
            hammer.on("transformstart", this.onStartRotate.bind(this, tangible));
            hammer.on("transform", this.onEndRotate.bind(this, tangible));
        }
    }

    this.surface.draw();
};

var startAngle = 0;
TangibleController.prototype.onStartRotate = function(tangible, event)
{
    startAngle = tangible.visual.rotation();
};

TangibleController.prototype.onEndRotate = function(tangible, event)
{
    tangible.setOrientation(startAngle + event.gesture.rotation);
    this.surface.draw();
};