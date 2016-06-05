import Konva from 'konva';
import {Points, Point} from './points';
import {Visual} from './visual';
import {Recogniser} from './recogniser';
import {Canvas2Image} from 'canvas2image';
import html2canvas from 'html2canvas';

export class AbstractTangibleController {

    constructor()
    {
        if (new.target === AbstractTangibleController) {
            throw new TypeError("Cannot construct AbstractTangibleController instances directly");
        }

        this.touchPointsLayer = new Konva.Layer();
        this.resizeFunc = this.onResize.bind(this);
        $(window).resize(this.resizeFunc);
    }

    destroy()
    {
        console.log('destroying!');

        if(this.stage != null)
        {
            this.stage.destroyChildren();
            this.stage.destroy();
        }

        $(window).off("resize", this.resizeFunc);
    }

    /**
     *
     * @param rawPoints A Konvajs event with touch points, e.g. a touchstart event
     * @returns {Array}
     */

    toPoints(rawPoints, scale=false) {
        var touchPoints = [];
        var rect = this.stage.container().getBoundingClientRect();

        for (var i = 0; i < rawPoints.length; i++) {
            var touch = rawPoints[i];
            var x = touch.clientX - rect.left;
            var y = touch.clientY - rect.top;

            if(scale)
            {
                var pointScaled = this.touchToStage({x: x, y: y});
                touchPoints.push(pointScaled);
            }
            else
            {
                touchPoints.push({x: x, y: y});
            }
        }

        return touchPoints;
    }

    onResize() {
        if (this.stage != null) {
            var container = document.getElementById(this.containerID);
            console.log(container);

            if(container != undefined)
            {
                var rect = container.getBoundingClientRect();
                console.log("Resizing. " + this.containerID + ": w" + rect.width + ", h" + rect.height);
                this.stage.setWidth(rect.right - rect.left);
                this.stage.setHeight(rect.bottom - rect.top);
                this.width = rect.right - rect.left;
                this.height = rect.bottom - rect.top;
                this.stage.draw();
            }
        }
    }

    stageToTouch (point) {
        return {
            x: this.stage.x() + point.x * this.stage.scaleX(),
            y: this.stage.y() + point.y * this.stage.scaleY()
        };
    }

    touchToStage (point) {
        return {
            x: (point.x - this.stage.x() + this.stage.offsetX()*this.stage.scaleX()) / this.stage.scaleX(),
            y: (point.y - this.stage.y() + this.stage.offsetY()*this.stage.scaleY()) / this.stage.scaleY()
        };
    }

    drawTouchPoints(touchPoints) {
        for (var i = 0; i < touchPoints.length; i++) {

            if (i < this.touchPointsLayer.children.length) {
                var shape = this.touchPointsLayer.children[i];
                shape.setX(touchPoints[i].x);
                shape.setY(touchPoints[i].y);
                shape.scaleX(1.0/this.stage.scaleX());
                shape.scaleY(1.0/this.stage.scaleY());
                shape.show();
            }
            else {
                this.touchPointsLayer.add(new Konva.Circle({
                    radius: 10,
                    fill: '#6eb3ca',
                    stroke: '#ffffff',
                    x: touchPoints[i].x,
                    y: touchPoints[i].y,
                    scaleX: 1.0/this.stage.scaleX(),
                    scaleY: 1.0/this.stage.scaleY(),
                    perfectDrawEnabled: false,
                    listening: false
                }));
            }
        }

        //Hide all touch points that we haven't edited
        for (i = touchPoints.length; i < this.touchPointsLayer.children.length; i++) {
            this.touchPointsLayer.children[i].hide();
        }

        this.touchPointsLayer.draw();
    }
}


export class TangibleController extends AbstractTangibleController{

    constructor(containerID) {
        super();
        this.visuals = {};
        this.scale = 1.0;
        this.selectedVisual = null;
        this.recogniser = new Recogniser();

        this.containerID = containerID;
        this.enable = true;
        this.init = true;

        var rect = document.getElementById(containerID).getBoundingClientRect();

        this.width = rect.right - rect.left;
        this.height = rect.bottom - rect.top;

        this.stage = new Konva.Stage({
            container: this.containerID,
            width: this.width,
            height: this.height,
            draggable: true,
            x: this.width / 2,
            y: this.height / 2,
            offset: {
                x : this.width / 2,
                y : this.height / 2
            }
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

        //this.touchPointsLayer = new Konva.Layer();
        this.tangibleLayer = new Konva.Layer();
        this.stage.add(this.deselectLayer, this.tangibleLayer, this.touchPointsLayer); //Left param on bottom, right on top
        this.stage.getContent().addEventListener('touchstart', this.onTouch.bind(this));
    }

    onDeselected() {
        if (this.selectedVisual != null) {
            this.selectedVisual.deselect();
            this.selectedVisual = null;
        }
    }

    diagramThumb()
    {
        return new Promise(function(resolve, reject) {
            html2canvas($("#" + this.containerID)).then(function(canvas) {
                var thumbWidth = 100;
                var scale = thumbWidth / this.width;
                resolve(Canvas2Image.convertToImage(canvas, thumbWidth, this.height * scale).currentSrc.slice(22));
            }.bind(this));
        }.bind(this));
    }

    onTap(visual) {

        console.log(arguments);
        if (this.selectedVisual != null) {
            this.selectedVisual.deselect();
        }

        this.selectedVisual = visual;
        this.selectedVisual.select();
        this.tangibleLayer.batchDraw();
    }

    onDragStart(visual) {
        if (this.selectedVisual != null) {
            this.selectedVisual.deselect();
            this.selectedVisual = null;
        }
        this.selectedVisual = visual;
        this.selectedVisual.select();
        this.stage.batchDraw();
    }

    zoomOut()
    {
        if(this.tangibleLayer.children.length > 0)
        {
            this.scale = Math.max(0.1, this.scale - 0.1);
            this.stage.scaleX(this.scale);
            this.stage.scaleY(this.scale);
            this.stage.draw();
        }

    }

    deleteSelected() {
        if(this.selectedVisual != null)
        {
            this.selectedVisual.remove();
            delete this.visuals[this.selectedVisual.id];
            this.selectedVisual = null;
            this.stage.draw();
        }
    }

    deleteAll() {
        for(let [id, visual] of Object.entries(this.visuals))
        {
            visual.remove();
            delete this.visuals[id];
        }

        this.stage.draw();
    }

    zoomIn()
    {
        if(this.tangibleLayer.children.length > 0) {
            this.scale = Math.min(2.0, this.scale + 0.1);
            this.stage.scaleX(this.scale);
            this.stage.scaleY(this.scale);
            this.stage.draw();
        }
    }

    bringForward()
    {
        if(this.selectedVisual != null)
        {
            this.selectedVisual.shape.moveUp();
            this.stage.batchDraw();
        }
    }

    sendBackward()
    {
        if(this.selectedVisual != null)
        {
            this.selectedVisual.shape.moveDown();
            this.stage.batchDraw();
        }
    }

    bringToFront()
    {
        if(this.selectedVisual != null)
        {
            this.selectedVisual.shape.moveToTop();
            this.stage.batchDraw();
        }
    }

    sendToBack()
    {
        if(this.selectedVisual != null)
        {
            this.selectedVisual.shape.moveToBottom();
            this.stage.batchDraw();
        }
    }

    clear() {
        this.touchPointsLayer.destroyChildren();
        this.tangibleLayer.destroyChildren();
        this.visuals = {};
        this.stage.batchDraw();
    }


    openDiagram(diagram, library, $tgImages) {

        this.clear();
        this.diagram = diagram;
        this.library = library;
        this.$tgImages = $tgImages;

        //Setup recogniser
        var features = [];
        var targets = [];

        for (let [id, tangible] of Object.entries(this.library.tangibles)) {
            features.push(tangible.registrationPoints);
            targets.push(id);
        }

        this.recogniser.fit(features, targets);

        //Centre diagram
        var points = [];
        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            points.push(instance.position);
        }

        var curCentre = Points.getCentroid(points);
        var newCentre = {x: this.stage.getWidth()/2, y: this.stage.getHeight()/2};
        var offset = Point.subtract(newCentre, curCentre);

        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            instance.position = Point.add(instance.position, offset);
        }

        //Setup visuals
        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            var template = this.library.tangibles[instance.type];
            this.addVisual(id, instance.type, instance, template, this.stage);
        }
    }

    addVisual(instanceId, typeId, model, template, stage) {
        var visual = new Visual(instanceId, typeId, template, stage, this.$tgImages.getTangibleImage(typeId, this.library), this.initVisual.bind(this, model));
        this.visuals[instanceId] = visual;
        visual.onTapCallback = this.onTap.bind(this);
        visual.onDragStartCallback = this.onDragStart.bind(this);
    }

    initZIndicies()
    {
        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            var visual = this.visuals[id];
            visual.setZIndex(instance.zIndex);
        }

        this.scale = this.diagram.scale;
        this.stage.scaleX(this.scale);
        this.stage.scaleY(this.scale);
        this.tangibleLayer.batchDraw();
    }

    initVisual(model, visual) {
        //Set starting orientation and position
        visual.setPosition(model.position);
        visual.setOrientation(model.orientation);
        this.tangibleLayer.add(visual.shape);

        if(this.tangibleLayer.children.length == Object.entries(this.diagram.tangibles).length && this.init)
        {
            console.log('init z indicies');
            this.initZIndicies();
            this.init = false;
        }

        this.stage.batchDraw();
    }

    /** Visual detection loop TODO: customise for registration and active use
     *
     * @param event
     * @returns {number}
     */

    onTouch(event) {
        if (this.enable) {
            var points = this.toPoints(event.touches);
            var scaledPoints = this.toPoints(event.touches, true);
            this.drawTouchPoints(scaledPoints); //Visualise touch points

            //Get recognised tangible and add to surface
            if (event.touches.length > 2) {
                var matches = this.recogniser.predict(points);

                if (matches.length > 0) {
                    var closestMatch = matches[0];
                    var template = this.library.tangibles[closestMatch.target];

                    var position = Points.getCentroid(scaledPoints);
                    var orientation = Points.getOrientation(points) - Points.getOrientation(template.registrationPoints); //current-original orientation

                    var id = Random.id();
                    var instance = {type: closestMatch.target, position: position, orientation: orientation, zIndex: 0};
                    this.diagram.tangibles[id] = instance;
                    this.addVisual(id, instance.type, instance, template, this.stage);
                }
            }

            this.stage.batchDraw();
        }
    }
}