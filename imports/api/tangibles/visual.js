import hammer from 'hammerjs/hammer';
import Konva from 'konva';

export class Visual {

    constructor(instanceId, template, stage, imageUrl, cb) {
        this.id = instanceId;
        this.template = template;


        this.onTapCallback = null;
        this.onDragStartCallback = null;
        this.onDragEndCallback = null;
        this.onloadCb = cb;
        this.isTouchEnabled = true;
        this.stage = stage;

        //Create shape to represent tangible
        this.imageObj = new Image();
        this.imageObj.onload = this.onLoad.bind(this);
        this.imageObj.src = imageUrl;
    }

    onLoad() {
        this.width = this.imageObj.naturalWidth * this.template.scale;
        this.height = this.imageObj.naturalHeight * this.template.scale;

        if (this.shape == undefined) {
            this.shape = new Konva.Image({
                image: this.imageObj,
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
                offsetX: this.width / 2,
                offsetY: this.height / 2,
                draggable: true,
                shadowColor: 'black',
                shadowBlur: 30,
                shadowOffset: {x: 0, y: 0},
                shadowOpacity: 0.0
            });

            this.shape.cache();

            if(this.template.transparentHit)
            {
                this.shape.drawHitFromCache();
            }

            this.shape.perfectDrawEnabled(false);
            this.shape.on('tap', this.onTap.bind(this));
            this.shape.on('dragstart', this.onDragStart.bind(this));
            this.shape.on('dragend', this.onDragEnd.bind(this));

            // Disable two finger rotation
            /*this.hammerStartAngle = 0;
            this.hammer = new hammer.Instance(this.shape, {});// hammer.Instance(this.shape, {});
            this.hammer.on("transformstart", this.onStartRotate.bind(this)).on("transform", this.onEndRotate.bind(this));*/
        }
        else {
            this.shape.image(this.imageObj);
            this.shape.width(this.width);
            this.shape.height(this.height);
            this.shape.offsetX(this.width / 2);
            this.shape.offsetY(this.height / 2);
        }

        this.onloadCb(this);

    }

    onStartRotate(event) {
        if (this.isTouchEnabled) {
            this.hammerStartAngle = this.shape.rotation() - this.template.startAngle;
        }
    }

    onEndRotate(event) {
        if (this.isTouchEnabled) {
            //this.shape.setDraggable(true);
            this.setOrientation(this.hammerStartAngle + event.gesture.rotation);
            let pos = event.gesture.center;
            this.setPosition(this.touchToStage({x: pos.clientX, y: pos.clientY}));
        }
    }

    touchToStage (point) {
        return {
            x: (point.x - this.stage.x() + this.stage.offsetX()*this.stage.scaleX()) / this.stage.scaleX(),
            y: (point.y - this.stage.y() + this.stage.offsetY()*this.stage.scaleY()) / this.stage.scaleY()
        };
    }

    onDragStart(event) {
        if (this.onDragStartCallback != null && this.isTouchEnabled) {
            this.onDragStartCallback(this);
        }
    }

    onDragEnd(event) {
        if (this.onDragEndCallback != null && this.isTouchEnabled) {
            this.onDragEndCallback(this);
        }
    }

    remove()
    {
        this.shape.destroy();
    }

    onTap(event) {
        if (this.isTouchEnabled) {
            event.cancelBubble = true;

            if (this.onTapCallback != null) {
                this.onTapCallback(this);
            }
        }
    }

    select() {
        this.shape.setAttrs({
            shadowColor: 'black',
            shadowOpacity: 0.7,
            shadowOffset: {x: 0, y: 0}
        });

        this.shape.cache();

        if(this.template.transparentHit)
        {
            this.shape.drawHitFromCache();
        }


    }

    deselect() {
        this.shape.setAttrs({
            shadowColor: 'black',
            shadowOpacity: 0.0,
            shadowOffset: {x: 0, y: 0}
        });

        this.shape.cache();

        if(this.template.transparentHit)
        {
            this.shape.drawHitFromCache();
        }

         //update model
    }

    /**
     *
     * @param point: Point
     */

    setPosition(point) {
        this.shape.setX(point.x);
        this.shape.setY(point.y);
    }

    /**
     *
     * @param angle
     */

    setOrientation(angle) {
        this.shape.rotation(angle + this.template.startAngle);
    }

    setZIndex(zIndex)
    {
        this.shape.setZIndex(zIndex);
    }

}
