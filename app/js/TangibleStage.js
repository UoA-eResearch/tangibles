/**
 *
 * @param containerID
 * @constructor
 */

function TangibleStage(containerID) {

    this.containerID = containerID;

    var rect = document.getElementById(containerID).getBoundingClientRect();
    this.stage = new Konva.Stage({
        container: this.containerID,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
    });

    this.touchPointsLayer = new Konva.Layer();
    this.dragLayer = new Konva.Layer();
    this.tangibleLayer = new Konva.Layer();
    this.stage.add(this.touchPointsLayer, this.dragLayer, this.tangibleLayer);

    //Drag and drop events
    this.stage.on('dragstart', function(evt) {
        var shape = evt.target;
        shape.moveTo(dragLayer); // Improves dragging performance
        this.draw();
        shape.setAttrs({
            shadowOffset: {
                x: 15,
                y: 15
            },
            scale: {
                x: shape.getAttr('startScale') * 1.2,
                y: shape.getAttr('startScale') * 1.2
            }
        });
    });

    this.stage.on('dragend', function(evt) {
        var shape = evt.target;
        shape.moveTo(this.tangibleLayer);
        this.draw();
        shape.to({
            duration: 0.5,
            easing: Konva.Easings.ElasticEaseOut,
            scaleX: shape.getAttr('startScale'),
            scaleY: shape.getAttr('startScale'),
            shadowOffsetX: 5,
            shadowOffsetY: 5
        });
    });

    /**
     *
     * @param event A Konvajs event with touch points, e.g. a touchstart event
     * @returns {Array}
     */

    this.getTouchPoints = function (event) { var touches = event.touches;
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

    this.addTangible = function (tangible) {
        this.tangibleLayer.add(tangible.visual);
    };

    this.deleteTangible = function(tangible)
    {
        this.tangibleLayer.destroy(tangible.visual);
    };

    this.draw = function () {
      this.stage.batchDraw();
    };

    /**
     *
     * @param touchPoints
     */

    this.drawTouchPoints = function(touchPoints)
    {
        //Hide all touch points
        for(var i = 0; i < this.touchPointsLayer.length; i++)
        {
            this.touchPointsLayer[i].hide();
        }

        for(var i = 0; i < touchPoints.length; i++)
        {
            var point = touchPoints[i];
            //console.log('Point', point);

            if(i < this.touchPointVisuals.length)
            {
                var visual = this.touchPointsLayer[i];
                visual.x = touchPoints[i].x;
                visual.y = touchPoints[i].y;
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

            this.touchPointsLayer.batchDraw();
        }
    };

    $(window).resize(function() {
        if(this.stage != null)
        {
            var rect = document.getElementById(this.containerID).getBoundingClientRect();
            this.stage.setWidth(rect.right - rect.left);
            this.stage.setHeight(rect.bottom - rect.top);
            console.log('Resizing surface', rect);
        }
    });
}

