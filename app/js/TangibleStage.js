/**
 *
 * @param containerID
 * @constructor
 */

function TangibleStage(containerID)
{
    this.containerID = containerID;

    var rect = document.getElementById(containerID).getBoundingClientRect();

    this.width = rect.right - rect.left;
    this.height = rect.bottom - rect.top;

    this.stage = new Konva.Stage({
        container: this.containerID,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
    });

    this.deselectLayer = new Konva.Layer();

    this.deselected_rect = new Konva.Rect({
        x: 0,
        y: 0,
        width: this.width,
        height: this.height
    });

    this.deselected_rect.on('touchstart', this.onDeselected.bind(this));
    this.deselectLayer.add(this.deselected_rect);
    this.onDeselectedCallback = null;

    this.touchPointsLayer = new Konva.Layer();
    this.dragLayer = new Konva.Layer();
    this.tangibleLayer = new Konva.Layer();
    this.stage.add(this.deselectLayer, this.tangibleLayer, this.dragLayer, this.touchPointsLayer); //Left param on bottom, right on top

    $(window).resize(this.onResize.bind(this));
}

TangibleStage.prototype.onDeselected = function () {
    if(this.onDeselectedCallback != null)
    {
        this.onDeselectedCallback(this);
    }
};

TangibleStage.prototype.clear = function()
{
    this.dragLayer.destroyChildren();
    this.tangibleLayer.destroyChildren();
    this.draw();
};

/**
 *
 * @param event A Konvajs event with touch points, e.g. a touchstart event
 * @returns {Array}
 */

TangibleStage.prototype.getTouchPoints = function (event) { var touches = event.touches;
    var touchPoints = new Array();
    var rect =  this.stage.container().getBoundingClientRect();
    //console.log('Rect', rect);

    for (var i=0; i < touches.length; i++) {
        var touch = touches[i];
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;

        touchPoints.push(new Point(x, y));
    }

    return touchPoints;
};

TangibleStage.prototype.addTangible = function (tangible) {
    this.tangibleLayer.add(tangible.visual);
};

TangibleStage.prototype.deleteTangible = function(tangible)
{
    this.tangibleLayer.destroy(tangible.visual);
};

TangibleStage.prototype.draw = function () {
    this.stage.batchDraw();
};

/**
 *
 * @param touchPoints
 */

TangibleStage.prototype.drawTouchPoints = function(touchPoints)
{
    for(var i = 0; i < touchPoints.length; i++)
    {
        var point = touchPoints[i];
        //console.log('Point', point);

        if(i < this.touchPointsLayer.children.length)
        {
            var visual = this.touchPointsLayer.children[i];
            visual.setX(touchPoints[i].x);
            visual.setY(touchPoints[i].y);
            visual.show();
        }
        else
        {
            var visual = new Konva.Circle({
                radius: 10,
                fill: '#6eb3ca',
                stroke: '#ffffff',
                x: touchPoints[i].x,
                y: touchPoints[i].y,
                perfectDrawEnabled : false,
                listening : false
            });
            this.touchPointsLayer.add(visual);
        }
    }

    //Hide all touch points
    for(var i = touchPoints.length; i < this.touchPointsLayer.children.length; i++)
    {
        this.touchPointsLayer.children[i].hide();
    }

    this.touchPointsLayer.draw();
};

TangibleStage.prototype.onResize = function () {
    if(this.stage != null)
    {
        var rect = document.getElementById(this.containerID).getBoundingClientRect();
        this.stage.setWidth(rect.right - rect.left);
        this.stage.setHeight(rect.bottom - rect.top);
        console.log('Resizing surface', rect);
    }
};
