import Konva from 'konva';
import {Points, Point} from './points';
import {Visual} from './visual';
import {Recogniser} from './recogniser';
import {Canvas2Image} from 'canvas2image';
import html2canvas from 'html2canvas';
import {alphabet_tangibles} from './alphabetTangibles';

export class AbstractTangibleController {

    constructor()
    {
        this.touchPointsLayer = new Konva.Layer();
        this.resizeFunc = this.onResize.bind(this);
        $(window).resize(this.resizeFunc);
    }

    destroy()
    {
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
     * @param scale
     * @returns {Array}
     */

    toPoints(rawPoints, scale=false) {
        let touchPoints = [];
        let rect = this.stage.container().getBoundingClientRect();

        for (let i = 0; i < rawPoints.length; i++) {
            let touch = rawPoints[i];
            let x = touch.clientX - rect.left;
            let y = touch.clientY - rect.top;

            if(scale)
            {
                let pointScaled = this.touchToStage({x: x, y: y});
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
            let container = document.getElementById(this.containerID);

            if(container != undefined)
            {
                let rect = container.getBoundingClientRect();
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
        for (let i = 0; i < touchPoints.length; i++) {

            if (i < this.touchPointsLayer.children.length) {
                let shape = this.touchPointsLayer.children[i];
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

    constructor(containerID, ootLevelCtrl) {
        super();
        this.visuals = {};
        this.scale = 1.0;
        this.selectedVisual = null;
        this.recogniser = new Recogniser();

        console.log("Creating Controller Object");
        this.levelCtrl = ootLevelCtrl

        this.containerID = containerID;
        this.enable = true;
        this.init = true;

        let rect = document.getElementById(containerID).getBoundingClientRect();

        this.width = rect.right - rect.left;
        this.height = rect.bottom - rect.top;

        //this.width = 964;
        this.height = 600;
        console.log("height of div: " + this.height);
        console.log("width of div: " + this.width);

        this.stage = new Konva.Stage({
            container: this.containerID,
            width: this.width,
            height: this.height,
            draggable: false,
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
        console.log('enter!');
        return new Promise(function(resolve, reject) {
            console.log('new Promise', resolve, reject);
            html2canvas($("#" + this.containerID)).then(function(canvas) {
                console.log('html2canvas');
                let thumbWidth = 100;
                let scale = thumbWidth / this.width;
                resolve(Canvas2Image.convertToImage(canvas, thumbWidth, this.height * scale).src.slice(22)); //currentSrc doesn't work in Cordova
            }.bind(this));
        }.bind(this));
    }

    onTap(visual) {
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

        //load library
        //this.library.tangibles = alphabet_tangibles;
        console.log(this.library);
        //Setup recogniser
        let features = []; //the data of the tangible
        let targets = []; //the id of the tangible

        for (let [id, tangible] of Object.entries(this.library.tangibles)) {
            features.push(tangible.registrationPoints);
            targets.push(id);
        }

        this.recogniser.fit(features, targets);

        //Centre diagram
        let points = [];
        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            points.push(instance.position);
        }

        let curCentre = Points.getCentroid(points);
        let newCentre = {x: this.stage.getWidth()/2, y: this.stage.getHeight()/2};
        let offset = Point.subtract(newCentre, curCentre);

        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            instance.position = Point.add(instance.position, offset);
        }

        //Setup visuals
        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            let template = this.library.tangibles[instance.type];
            this.addVisual(id, instance.type, instance, template, this.stage);
        }
    }

    addVisual(instanceId, typeId, model, template, stage) {
      console.log(this.$tgImages.getTangibleImage(typeId, this.library));
        let visual = new Visual(instanceId, template, stage, this.$tgImages.getTangibleImage(typeId, this.library), this.initVisual.bind(this, model));
        this.visuals[instanceId] = visual;
        visual.onTapCallback = this.onTap.bind(this);
        visual.onDragStartCallback = this.onDragStart.bind(this);
    }

    initZIndices()
    {
        for (let [id, instance] of Object.entries(this.diagram.tangibles)) {
            let visual = this.visuals[id];
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
        //disable orientation - always in right position
        //visual.setOrientation(model.orientation);
        this.tangibleLayer.add(visual.shape);

        if(this.tangibleLayer.children.length == Object.entries(this.diagram.tangibles).length && this.init)
        {
            this.initZIndices();
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
      console.log("i've been touched");
        if (this.enable) {
            let points = this.toPoints(event.touches);
            let scaledPoints = this.toPoints(event.touches, true);
            this.drawTouchPoints(scaledPoints); //Visualise touch points

            //Get recognised tangible and add to surface
            if (event.touches.length > 2) {
                let matches = this.recogniser.predict(points);

                if (matches.length > 0) {
                  console.log("match found!!!! Target: ");
                  console.log(matches[0].target);
                  this.levelCtrl.setLetter('a');

                    let closestMatch = matches[0];
                    let template = this.library.tangibles[closestMatch.target];

                    let position = Points.getCentroid(scaledPoints);
                    let orientation = Points.getOrientation(points) - Points.getOrientation(template.registrationPoints); //current-original orientation

                    let id = Random.id();
                    let instance = {type: closestMatch.target, position: position, orientation: orientation, zIndex: 0};
                    this.diagram.tangibles[id] = instance;
                    this.addVisual(id, instance.type, instance, template, this.stage);
                }
            }

            this.stage.batchDraw();
        }
    }
}
