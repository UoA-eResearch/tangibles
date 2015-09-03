/**
 *
 * @param error
 * @constructor
 */

function TangibleController(surface, error) {

    this.error = typeof error !== 'undefined' ? a : 12; //set error to default
    this.libraryName;
    this.tangibleLibrary = [];// = {};
    this.tangibles = [];
    this.surface = surface;
    this.selectedTangible = null;

    /**
     *  Event handlers
     */

    this.surface.stage.getContent().addEventListener('touchstart', this.onTouch.bind(this)); //Gotta bind this, so that 'this' in onTouch is actually the controller
    this.surface.onDeselectedCallback = this.onDeselected.bind(this);
}

TangibleController.prototype.onDeselected = function (event) {
    if(this.selectedTangible != null)
    {
        this.selectedTangible.deselect();
        this.selectedTangible = null;
    }
};

/**
 * Loads a tangible library into memory
 * @param name: the name of the tangible library. TODO: document how to create a tangible library
 * 'http://130.216.148.185:8000/capacitive-tangibles/app/libraries/oroo/tangibles.json'
 */

TangibleController.prototype.onTap = function (tangible) {

    console.log(arguments);
    if(this.selectedTangible != null)
    {
        this.selectedTangible.deselect();
    }

    this.selectedTangible = tangible;
    this.selectedTangible.select();
    this.surface.tangibleLayer.draw();

};

TangibleController.prototype.onDragStart = function (tangible) {
    if(this.selectedTangible != null)
    {
        this.selectedTangible.deselect();
        this.selectedTangible = null;
    }
    this.selectedTangible = tangible;
    this.selectedTangible.select();
    //tangible.visual.moveTo(this.surface.stage.dragLayer);  TODO: fix, goes crazy if I use this
    this.surface.stage.draw();
};

TangibleController.prototype.onDragEnd = function (tangible) {
    //tangible.visual.moveTo(this.surface.stage.tangibleLayer);

};

TangibleController.prototype.loadTangibleLibrary = function(url)
{
    var json_data = loadJSON(url);
    console.log(json_data);
    this.tangibleLibrary.length = 0;
    this.libraryName = json_data.name;
    //this.tangibleLibrary = [];

    for(var i = 0; i < json_data.tangibleLibrary.length; i++) {
        var tangible = json_data.tangibleLibrary[i];
        tangible.registrationPoints = toPoints(tangible.registrationPoints);
        tangible.image = 'libraries/' + json_data.name + '/' + tangible.image;
        json_data.tangibleLibrary[i] = tangible;
    }

    this.tangibleLibrary = json_data.tangibleLibrary;
};

TangibleController.prototype.clear = function()
{
    this.surface.clear();
    this.tangibles.length = 0; //clears array
    //this.tangibleLibrary.length = 0;
};

TangibleController.prototype.openDiagram = function(scope, openDiagramEvent, readEvent) {
    try
    {
        console.log(event.target.result);
        var data = JSON.parse(event.target.result);
        console.log(data);

        for(var i = 0; i < data.tangibles.length; i++)
        {
            var tangible = data.tangibles[i];
            this.addTangible(tangible.id, new Point(tangible.position[0], tangible.position[1]), tangible.orientation);
        }

        this.surface.draw();
    }
    catch(error)
    {
        scope.showAlert(openDiagramEvent, "Error Reading File", error.message);
    }
};

TangibleController.prototype.addTangible = function(template, position, orientation)
{
    //var temp = this.tangibleLibrary[id]; //Get template
    var tangible = new Tangible(template.id, template.name, template.scale, template.startAngle, template.image, template.registrationPoints);

    tangible.onTapCallback = this.onTap.bind(this);
    tangible.onDragStartCallback = this.onDragStart.bind(this);
    tangible.onDragEndCallback = this.onDragEnd.bind(this);

    //Set starting orientation and position
    tangible.setPosition(position);
    tangible.setOrientation(orientation);

    this.tangibles.push(tangible);
    this.surface.addTangible(tangible);
};

TangibleController.prototype.saveDiagram = function()
{
    var parsedTangibles = [];

    for(var i = 0; i < this.tangibles.length; i++)
    {
        var tangible = this.tangibles[i];
        parsedTangibles[i] = {"id":tangible.id, "position": [tangible.visual.getX(), tangible.visual.getY()], "orientation": tangible.visual.rotation() - tangible.startAngle};
    }
    //TODO: save
    var json_data = {"libraryName": this.libraryName, "tangibles": parsedTangibles};

    var blob = new Blob([JSON.stringify(json_data)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "diagram.tg");
};

/**
 *
 * @param tangibles
 * @param touchPoints
 */

TangibleController.prototype.getRecognizedTangibleTemplate = function(points) {

    //console.log('Points', points.toString());
    //console.log('Sorted', Tangible.sortCCW(points).toString());

    var recognised = false;

    //var matches = [];

    // We need to have minimum of three touch points to identify the Tangible and it's orientation.
    if (points.length > 2)
    {
        var sortedPoints = Tangible.sortClockwise(points);

        var touchPointsDists = this.getDistances(sortedPoints);

        for(var i = 0; i < this.tangibleLibrary.length; i++)
        {
            var template = this.tangibleLibrary[i];

            if(template.registrationPoints.length == 3)
            {
                var regPointsDists = this.getDistances(Tangible.sortClockwise(template.registrationPoints));
                var numSidesEqual = 0;

                //Counts how many sides of tangible triangle match touch point triangle sides
                for (var j = 0; j < touchPointsDists.length; j++)
                {
                    var touchPointsDist = touchPointsDists[j];

                    for (var k = 0; k < regPointsDists.length; k++){

                        var tangibleDist = regPointsDists[k];

                        if ( touchPointsDist >= tangibleDist - this.error && touchPointsDist <= tangibleDist + this.error) //add degree of error here
                        {
                            numSidesEqual++;
                            break;
                        }
                    }
                }

                //Return recognised tangible
                if ((numSidesEqual == touchPointsDists.length) && (regPointsDists.length == touchPointsDists.length))
                {
                    return template;
                }
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
    var touchPoints = this.surface.getTouchPoints(event);

    this.surface.drawTouchPoints(touchPoints); //Visualise touch points

    //Get recognised tangible and add to surface
    if (touchPoints.length > 2)
    {
        var template = this.getRecognizedTangibleTemplate(touchPoints);
        if (template != null) {
            this.addTangible(template, Tangible.getCentroid(touchPoints), Tangible.getOrientation(touchPoints));
        }
    }

    this.surface.draw();
};
