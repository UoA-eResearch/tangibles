/**
 *
 * @param error
 * @constructor
 */

function TangibleController(surface, db_uri, threshold) {

    this.threshold = typeof threshold !== 'undefined' ? a : 100; //set error to default
    this.libraryName;
    this.tangibleLibrary = [];// = {};
    this.tangibles = [];
    this.diagrams = []; //TODO: move to AppCtrl
    this.surface = surface;
    this.selectedTangible = null;
    this.libraryId = undefined;
    this.diagramId = undefined; //TODO: make diagram object
    this.diagramRev = undefined;
    this.diagramName = "Untitled diagram";
    this.db_uri = db_uri;

    /**
     *  Event handlers
     */

    this.surface.onTouchCallback = this.onTouch.bind(this);
    this.surface.onDeselectedCallback = this.onDeselected.bind(this);

    //this.surface.stage.getContent().addEventListener('touchstart', this.onTouch.bind(this)); //Gotta bind this, so that 'this' in onTouch is actually the controller

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

TangibleController.prototype.loadTangibleLibrary = function(data)
{
    console.log(arguments);

    this.tangibleLibrary.length = 0;
    this.libraryName = data.name;
    this.libraryId = data._id;

    for(var i = 0; i < data.tangibles.length; i++) {
        var tangible = data.tangibles[i];
        tangible.registrationPoints = toPoints(tangible.registrationPoints);
        tangible.imageData = data._attachments[tangible.image].data;
        //tangible.image; = this.db_uri + '/' + this.libraryId + '/' + tangible.image;
        this.tangibleLibrary[i] = tangible;
    }
};

TangibleController.prototype.clear = function()
{
    this.surface.clear();
    this.diagramId = undefined;
    this.diagramRev = undefined;
    this.diagramName = "Untitled diagram";
    this.tangibles.length = 0; //clears array
    //this.tangibleLibrary.length = 0;
};

TangibleController.prototype.loadDiagrams = function(data)
{
    console.log(data);
    this.diagrams.length = 0;

    for(var i=0; i < data.rows.length; i++)
    {
        var item = data.rows[i].key;
        item.thumb = this.db_uri + '/' + item.id + '/' + item.thumb;
        this.diagrams.push(item);
    }
};

TangibleController.prototype.openDiagram = function(diagram) {

    this.clear();
    console.log(diagram);

    this.diagramId = diagram._id;
    this.diagramRev = diagram._rev;
    this.diagramName = diagram.name;

    for(var i = 0; i < diagram.tangibles.length; i++)
    {
        var tangible = diagram.tangibles[i];
        var template = this.tangibleLibrary[tangible.id-1];
        this.addTangible(template, new Point(tangible.position[0], tangible.position[1]), tangible.orientation);
    }

    this.surface.tangibleLayer.draw();
};

TangibleController.prototype.addTangible = function(template, position, orientation)
{
    //var temp = this.tangibleLibrary[id]; //Get template
    var tangible = new Tangible(template.id, template.name, template.scale, template.startAngle, template.imageData, template.registrationPoints, this.initTangible.bind(this, position, orientation));

    tangible.onTapCallback = this.onTap.bind(this);
    tangible.onDragStartCallback = this.onDragStart.bind(this);
    tangible.onDragEndCallback = this.onDragEnd.bind(this);


};

TangibleController.prototype.initTangible = function(position, orientation, tangible)
{
    //Set starting orientation and position
    tangible.setPosition(position);
    tangible.setOrientation(orientation);
    this.tangibles.push(tangible);
    this.surface.addTangible(tangible);
    this.surface.draw();
};

TangibleController.prototype.getDiagramDoc = function()
{
    var tangibles = [];

    for(var i = 0; i < this.tangibles.length; i++)
    {
        var tangible = this.tangibles[i];
        tangibles[i] = {"id":tangible.id, "position": [tangible.visual.getX(), tangible.visual.getY()], "orientation": tangible.visual.rotation() - tangible.startAngle};
    }

    return {"_id": this.diagramId, "_rev": this.diagramRev, "type": "diagram", "libraryId": this.libraryId, "name": this.diagramName, "tangibles": tangibles};
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
    var matches = [];

    // We need to have minimum of three touch points to identify the Tangible and it's orientation.
    if (points.length == 3)
    {
        var touchSorted = Tangible.sortClockwise(points);
        var touchDistA = touchSorted[0].distanceTo(touchSorted[1]);
        var touchDistB = touchSorted[0].distanceTo(touchSorted[2]);
        var touchDistC = touchSorted[1].distanceTo(touchSorted[2]);

        for(var i = 0; i < this.tangibleLibrary.length; i++)
        {
            var template = this.tangibleLibrary[i];

            if(template.registrationPoints.length == 3)
            {
                var regPointsDists = Tangible.sortClockwise(template.registrationPoints);
                var regDistA = regPointsDists[0].distanceTo(regPointsDists[1]);
                var regDistB = regPointsDists[0].distanceTo(regPointsDists[2]);
                var regDistC = regPointsDists[1].distanceTo(regPointsDists[2]);
                var similarity = Math.abs(touchDistA-regDistA) + Math.abs(touchDistB-regDistB) + Math.abs(touchDistC - regDistC);
                //console.log('sim: ', similarity, ' ', template.name);
                matches.push([similarity, template]);
            }
        }

        matches.sort(function(a, b){
            if(a[0] < b[0])
                return -1;
            if(a[0] > b[0])
                return 1;
            return 0;
        });

        ////debug
        //for(var i = 0; i < matches.length; i++)
        //{
        //    console.log(matches[i][0] + ": ", matches[i][1].name)
        //}
        //
        //console.log("")

        //console.log('sorted: ', matches.toString());
        //var sim = matches[0][0];
        //if(sim < this.threshold)
        return matches[0][1];

       // return null;
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

TangibleController.prototype.onTouch = function(touchPoints) {
    var touchPoints = this.surface.getTouchPoints(event);

    //Get recognised tangible and add to surface
    if (touchPoints.length > 2)
    {
        var template = this.getRecognizedTangibleTemplate(touchPoints);
        if (template != null) {
            var originalOrientation = Tangible.getOrientation(template.registrationPoints);
            var curOrientation = Tangible.getOrientation(touchPoints);

            this.addTangible(template, Tangible.getCentroid(touchPoints), curOrientation-originalOrientation);
        }
    }

    this.surface.draw();
};
