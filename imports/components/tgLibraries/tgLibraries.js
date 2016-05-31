import Konva from 'konva';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgLibraries.html';
import {Libraries} from '../../api/collections/libraries.js';
import {Images} from '../../api/collections/images.js';
import {SidenavCtrl} from '../tgSidenav/tgSidenav';
import {Visual} from '../../api/tangibles/visual';
import {Points, Point} from '../../api/tangibles/points';
import naifBase64 from 'angular-base64-upload';
import {Library} from './tgLibrary';

export class LibrariesCtrl {
    constructor($scope, $mdSidenav, $mdUtil, $q) {
        'ngInject';
        $scope.viewModel(this);
        this.touchWindow = 'Uneditable';
        this.$scope = $scope;

        this.$mdSidenav = $mdSidenav;
        this.$mdUtil = $mdUtil;
        this.selectedLibrary = undefined;
        this.selectedTangible = undefined;
        this.containerID = 'touchPointsContainer';
        this.image = undefined;


        this.imageObj = new Image();
        this.imageObj.onload = this.newImageLoaded.bind(this);

        this.subscribe('libraries');
        this.subscribe('images');

        this.helpers({
            libraries() {
                return Libraries.find({});
            }
        });

        $scope.imageUploaded = function(file, base64_object)
        {
            var deferred = $q.defer();
            $scope.tgLibraries.image = base64_object.base64;
            $scope.tgLibraries.setBase64Image(base64_object.base64);
            return deferred.promise;
        };
    }

    getImageUrl(typeId)
    {
        return Visual.getImageUrl(typeId);
    }

    newImageLoaded()
    {
        var width = this.imageObj.naturalWidth * this.selectedTangible.tangible.scale;
        var height = this.imageObj.naturalHeight * this.selectedTangible.tangible.scale;

        this.shape = new Konva.Image({
            image: this.imageObj,
            x: this.stage.getWidth() / 2,
            y: this.stage.getHeight() / 2,
            width: width,
            height: height,
            offsetX: width / 2,
            offsetY: height / 2,
            draggable: false
        });

        this.shape.rotation(this.selectedTangible.tangible.startAngle);

        this.imageLayer.destroyChildren();
        this.imageLayer.add(this.shape);
        this.stage.draw();

        this.$scope.$watch('tgLibraries.selectedTangible.tangible.scale', function() {

            var scale = 1;
            if(this.selectedTangible.tangible.scale != undefined)
            {
                scale = this.selectedTangible.tangible.scale;
            }

            if(this.selectedTangible.tangible.scale == 0)
            {
                scale = 0.0001;
            }

            var width = this.imageObj.naturalWidth * -scale;
            var height = this.imageObj.naturalHeight * -scale;
            this.shape.setWidth(width);
            this.shape.setHeight(height);
            this.shape.offsetX(width / 2);
            this.shape.offsetY(height / 2);
            this.stage.draw();
        }.bind(this), true);

        this.$scope.$watch('tgLibraries.selectedTangible.tangible.startAngle', function() {

            var startAngle = 0;
            if(this.selectedTangible.tangible.startAngle != undefined)
            {
                startAngle = this.selectedTangible.tangible.startAngle;
            }

            this.shape.rotation(startAngle);
            this.stage.draw();
        }.bind(this), true);
    }

    setBase64Image(base64)
    {
        this.imageObj.src = 'data:image/png;base64,' + base64;
    }

    setUrlImage(typeId)
    {
        this.imageObj.src = Visual.getImageUrl(typeId);
    }

    editLibrary(library)
    {
        this.selectedLibrary = angular.copy(library);
        console.log(this.selectedLibrary);
        SidenavCtrl.toggle('library-side-nav', this.$mdSidenav, this.$mdUtil);
    }

    editTangible(id, tangible)
    {
        this.selectedTangible = angular.copy({id: id, tangible: tangible});
        console.log(this.selectedTangible);
        SidenavCtrl.toggle('tangible-side-nav', this.$mdSidenav, this.$mdUtil, this.initTouchWindow.bind(this));
    }

    triggerImageUpload()
    {
        $('#file').trigger('click');
    }

    initTouchWindow()
    {
        var rect = document.getElementById(this.containerID).getBoundingClientRect();
        this.stage = new Konva.Stage({
            container: this.containerID,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top
        });
        this.touchPointsLayer = new Konva.Layer();
        this.imageLayer = new Konva.Layer();
        this.stage.add(this.imageLayer, this.touchPointsLayer); //Left param on bottom, right on top
        $(window).resize(this.onResize.bind(this));
        this.stage.getContent().addEventListener('touchstart', this.onTouch.bind(this));
        this.onTangibleLoaded();
    }

    deleteTangible(tangibleId)
    {
        delete this.selectedLibrary.tangibles[tangibleId];
        Images.remove(tangibleId);
        this.saveLibrary();
    }

    saveLibrary()
    {
        Libraries.update(this.selectedLibrary._id, {
            $set: {tangibles: this.selectedLibrary.tangibles, name: this.selectedLibrary.name},
        });
    }

    saveTangible()
    {
        if(this.image != undefined)
        {
            Images.remove(this.selectedTangible.id);
            var file = new FS.File();
            file._id = this.selectedTangible.id;
            file.attachData('data:image/png;base64,' + this.image, {type: 'image/png'}, function (err) {
                if (err) throw err;
                file.name('image.png');
                Images.insert(file);
            });
        }
        
        this.selectedLibrary.tangibles[this.selectedTangible.id] = this.selectedTangible.tangible;

        if(this.selectedTangible.tangible.icon)
        {
            for (let [id, tangible] of Object.entries(this.selectedLibrary.tangibles)) {
                if(id != this.selectedTangible.id) {
                    tangible.icon = false;
                }
            }
        }

        this.saveLibrary();

        SidenavCtrl.toggle('tangible-side-nav', this.$mdSidenav, this.$mdUtil)
    }

    addTangible()
    {
        this.selectedLibrary.tangibles[Random.id()] = {"name": "Untitled",
            "icon": false,
            "scale": 1,
            "startAngle": 90,
            "registrationPoints": []
        };
        this.saveLibrary();
    }

    getLibraryIcon(library)
    {
        return Library.getLibraryIcon(library);
    }

    addLibrary()
    {
        console.log(Random.id());
        Libraries.insert({_id: Random.id(), name: "Untitled", tangibles: {}});
    }

    deleteLibrary(library)
    {
        Libraries.remove(library._id);

        //remove all library images
        for (let [id, instance] of Object.entries(library.tangibles)) {
            Images.remove(id);
        }
    }

    onTangibleLoaded()
    {
        this.onResize();
        this.touchWindow = 'Uneditable';

        // Centre registration points and draw them
        var points = this.selectedTangible.tangible.registrationPoints;

        if(points.length > 0)
        {
            var curCentre = Points.getCentroid(points);
            var newCentre = {x: this.stage.getWidth()/2, y: this.stage.getHeight()/2};
            var offset = Point.subtract(newCentre, curCentre);

            for(var i = 0; i < points.length; i++)
            {
                points[i] = Point.add(points[i], offset);
            }

            this.drawTouchPoints(points);
        }

        this.setUrlImage(this.selectedTangible.id);
    }

    onTouch(event) {
        console.log(this.touchWindow);
        if (this.touchWindow == 'Editable') {
            var touchPoints = this.toPoints(event.touches);
            this.selectedTangible.tangible.registrationPoints = touchPoints;
            console.log(touchPoints);
            this.touchPointsLayer.destroyChildren();
            this.drawTouchPoints(touchPoints); //Visualise touch points
            this.stage.draw();
        }
    }

    /**
     *
     * @param rawPoints A Konvajs event with touch points, e.g. a touchstart event
     * @returns {Array}
     */

    toPoints(rawPoints) {
        var touchPoints = [];
        var rect = this.stage.container().getBoundingClientRect();

        for (var i = 0; i < rawPoints.length; i++) {
            var touch = rawPoints[i];
            var x = touch.clientX - rect.left;
            var y = touch.clientY - rect.top;

            touchPoints.push({x: x, y: y});
        }

        return touchPoints;
    }

    /**
     *
     * @param touchPoints
     */

    drawTouchPoints(touchPoints) {
        for (var i = 0; i < touchPoints.length; i++) {

            if (i < this.touchPointsLayer.children.length) {
                var shape = this.touchPointsLayer.children[i];
                shape.setX(touchPoints[i].x);
                shape.setY(touchPoints[i].y);
                shape.show();
            }
            else {
                this.touchPointsLayer.add(new Konva.Circle({
                    radius: 10,
                    fill: '#6eb3ca',
                    stroke: '#ffffff',
                    x: touchPoints[i].x,
                    y: touchPoints[i].y,
                    perfectDrawEnabled: false,
                    listening: false
                }));
            }
        }

        // //Hide all touch points
        // for (i = touchPoints.length; i < this.touchPointsLayer.children.length; i++) {
        //     this.touchPointsLayer.children[i].hide();
        // }

        this.touchPointsLayer.draw();
    }

    onResize() {
        if (this.stage != null) {
            var rect = document.getElementById(this.containerID).getBoundingClientRect();
            console.log("Resizing. " + this.containerID + ": w" + rect.width + ", h" + rect.height);
            this.stage.setWidth(rect.right - rect.left);
            this.stage.setHeight(rect.bottom - rect.top);

            //TODO: change center of image / reg points
            // this.width = rect.right - rect.left;
            // this.height = rect.bottom - rect.top;
            this.stage.draw();
            //console.log('Resizing surface', rect);
        }
    }
}

const name = 'tgLibraries';
export default angular.module('tgLibraries', [angularMeteor, 'naif.base64'])
    .component(name, {
        template,
        controllerAs: name,
        controller: LibrariesCtrl
    })