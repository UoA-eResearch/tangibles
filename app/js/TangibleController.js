/**
 *
 * @param error
 * @constructor
 */

function TangibleController(surface, error) {

    this.error = typeof error !== 'undefined' ? a : 10; //set error to default
    this.tangibleLibrary = [];
    this.tangibles = [];
    this.surface = surface;

    /**
     * //Tangible detection loop TODO: customise for registration and active use
     *
     * @param points
     * @returns {number}
     */

    this.surface.stage.getContent().addEventListener('touchstart', function(event) {
        var touchPoints = this.surface.getTouchPoints(event);

        this.surface.drawTouchPoints(touchPoints); //Visualise touch points

        //Get recognised tangible and add to surface
        var tangible = this.getRecognizedTangible(touchPoints);
        if(tangible != null)
        {
            //Set starting orientation and position
            tangible.setPosition(this.getCentre(touchPoints));
            tangible.setOrientation(this.getOrientation(touchPoints));

            // Enable two finger rotation
            var hammer = Hammer(this.visual);
            hammer.on("transformstart", function(e) {
                var startAngle = this.visual.rotation();
            }).on("transform", function(e) {
                tangible.setOrientation(startAngle + e.gesture.rotation);
                this.surface.draw();
            });

            this.tangibles.push(tangible);
            this.surface.addTangible(tangible);
        }

        this.surface.draw();
    });


    /**
     * Returns centroid of a list of points
     * @param points
     * @returns {number}
     */

    this.getCentre = function(points)
    {
        var centre = new Point(0, 0);

        for(var i = 0; i < touchPoints.length; i++)
        {
            centre.x = centre.x + touchPoints[i].x;
            centre.y = centre.y + touchPoints[i].y;
        }

        centre.x = centre.x / touchPoints.length;
        centre.x = centre.x / touchPoints.length;

        return centre;
    };


    /**
     *
     * @param points
     * @returns {number}
     */

    this.getOrientation = function(points)
    {
        var centre = this.getCentre(points);
        var distances = [];

        for(var i = 0; i < points.length; i++)
        {
            distances[i] = centre.distanceTo(points[i]);
        }

        var maxI = distances.indexOf(Math.max(distances));

        var dx = points[maxI].x - centre.x;
        var dy = points[maxI].y - centre.y;
        var angle = Math.atan2(dy, dx); // range (-PI, PI]
        angle *= 180 / Math.PI;

        return angle;
    };


    /**
     * Loads a tangible library into memory
     * @param name: the name of the tangible library. TODO: document how to create a tangible library
     * 'http://localhost:63342/capacitive-tangibles/app/libraries/oroo/tangibles.json'
     */

    this.loadTangibleLibrary = function(url)
    {
        var datum = loadJSON(url).tangibleLibrary;
        console.log(data);
        this.tangibleLibrary = [];

        for(var i = 0; i < datum.length; i++) {
            var data = datum[i];
            var points = toPoints(data.registrationPoints);
            this.tangibleLibrary[i] = new Tangible(data.id, data.name, new Size(data.size[0], data.size[1]), data.image, points);
        }
    };


    /**
     *
     * @param tangibles
     * @param touchPoints
     */

    this.getRecognizedTangible = function(points) {
        var recognised = false;

        // We need to have minimum of three touch points to identify the Tangible and it's orientation.
        if (points.length > 2)
        {
            var touchPointsDMap = this.getDistanceMap(points);

            for(var i = 0; i < this.tangibleLibrary.length; i++)
            {
                var tangibleDMap = this.getDistanceMap(this.tangibleLibrary[i].registrationPoints);
                var numSidesEqual = 0;

                //Counts how many sides of tangible triangle match touch point triangle sides
                for (var j = 0; j < touchPointsDMap.length; j++)
                {
                    var touchPointsDist = touchPointsDMap[j];

                    for (var k = 0; k < tangibleDMap.length; k++){

                        var tangibleDist = tangibleDMap[k];

                        if ( touchPointsDist >= tangibleDist - this.error && touchPointsDist <= tangibleDist + this.error) //add degree of error here
                        {
                            numSidesEqual++;
                            break;
                        }
                    }
                }

                //Return recognised tangible
                if ((numSidesEqual == touchPointsDMap.length) && (tangibleDMap.length == touchPointsDMap.length))
                {
                    return tangibles[i];
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

    this.getDistanceMap = function(points)
    {
        var distanceMap = new Array();

        // Calculate distances between points and update distances array
        for(var i=0; i < points.length; i++){
            var ax = points[i][0];
            var ay = points[i][1];

            for (var j = (i + 1); j < points.length; j++)
            {
                // Calculate the distance between two points
                var bx = points[j][0];
                var by = points[j][1];

                var dx = ax - bx;
                var dy = ay - by;
                var distance = Math.sqrt(dx * dx + dy * dy);

                distanceMap.push(distance);
            }
        }

        return distanceMap;
    };
}

