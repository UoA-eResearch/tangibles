

function Surface(containerID) {
    var rect = document.getElementById(containerID).getBoundingClientRect();

    this.containerID = containerID;

    this.stage = new Kinetic.Stage({
        container: this.containerID,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
    });

    this.touchPointsLayer = new Kinetic.Layer();
    this.stage.add(this.touchPointsLayer);

    stage.getContent().addEventListener('touchstart', function(event) {
        touchPoints = getTouchPoints(event);
        drawTouchPoints(touchPoints);
    });


    this.touchPoints = touchPoints;

    this.getCentre = function () { return getCentre(this); };
    this.getAngles = function () { return getAngles(this); };
    this.getDistanceMap = function () { return getDistanceMap(this); };
    this.getPointWithMaxAngle = function () { return getPointWithMaxAngle(this); };
    this.update = function () { update(this); };



    console.log('Rect', rect);



    touchPointsLayer = new Kinetic.Layer();
    stage.add(touchPointsLayer);


}

/**
 *
 * @param event: A Konvajs event with touch points, e.g. a touchstart event
 * @returns: an array of Point instances
 */

function getTouchPoints(event)
{
    var touches = event.touches;
    var touchPoints = new Array();
    var rect =  stage.container().getBoundingClientRect();
    //console.log('Rect', rect);

    for (var i=0; i < touches.length; i++) {
        var touch = touches[i];
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;

        touchPoints.push(new Point(x, y));
    }

    return touchPoints;
}


/**
 *
 * @param touchPoints
 */

function drawTouchPoints(touchPoints)
{
    touchPointsLayer.destroyChildren();

    for(var i=0; i < touchPoints.length; i++)
    {
        var point = touchPoints[i];
        //console.log('Point', point);

        var circle = new Kinetic.Circle({
            radius: 10,
            fill: '#6eb3ca',
            stroke: '#ffffff',
            x: point.x,
            y: point.y,
            perfectDrawEnabled : false,
            listening : false
        });

        touchPointsLayer.add(circle);
        touchPointsLayer.batchDraw();
    }
}
