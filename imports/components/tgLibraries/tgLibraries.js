import Konva from 'konva';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgLibraries.html';
import {Libraries} from '../../api/collections/libraries.js';
import {SidenavCtrl} from '../tgSidenav/tgSidenav';
import {Points, Point} from '../../api/tangibles/points';
import {AbstractTangibleController} from '../../api/tangibles/controller';
import naifBase64 from 'angular-base64-upload';

export class LibrariesCtrl extends AbstractTangibleController{
    constructor($scope, $mdSidenav, $mdUtil, $q, $const, $tgImages) {
        'ngInject';
        super();
        $scope.viewModel(this);
        this.touchWindow = 'Uneditable';
        this.$scope = $scope;
        this.$const = $const;
        $scope.$tgImages = $tgImages;
        this.isCordova = Meteor.isCordova;
        this.$tgImages = $tgImages;

        this.$mdSidenav = $mdSidenav;
        this.$mdUtil = $mdUtil;
        this.selectedLibrary = undefined;
        this.selectedTangible = undefined;
        this.containerID = 'touchPointsContainer';
        this.image = undefined;

        this.imageObj = new Image();
        this.imageObj.onload = this.newImageLoaded.bind(this);

        this.helpers({
            libraries() {
                return Libraries.find({});
            }
        });

        $scope.imageUploaded = function(file, base64_object)
        {
            var deferred = $q.defer();
            $scope.tgLibraries.image = base64_object.base64;
            $scope.tgLibraries.imageObj.src = 'data:image/png;base64,' + base64_object.base64;
            return deferred.promise;
        };

        $scope.$on("$destroy", this.destroy.bind(this));
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

    editLibrary(library)
    {
        this.selectedLibrary = angular.copy(library);
        SidenavCtrl.toggle('library-side-nav', this.$mdSidenav, this.$mdUtil);
    }

    editTangible(id, tangible)
    {
        this.selectedTangible = angular.copy({id: id, tangible: tangible});
        SidenavCtrl.toggle('tangible-side-nav', this.$mdSidenav, this.$mdUtil, this.initTouchWindow.bind(this));
    }

    triggerImageUpload()
    {
        $('#file').trigger('click');
    }

    deleteTangible(tangibleId)
    {
        delete this.selectedLibrary.tangibles[tangibleId];
        delete this.selectedLibrary.images[tangibleId];

        Libraries.update(
            { _id: this.selectedLibrary._id },
            {$unset: { ['images.' + tangibleId]: "", ['tangibles.' + tangibleId]: ""}}
        );
    }

    saveTangible()
    {
        if(this.selectedTangible.tangible.icon)
        {
            for (let [id, tangible] of Object.entries(this.selectedLibrary.tangibles)) {
                if(id != this.selectedTangible.id) {
                    tangible.icon = false;
                }
            }
        }

        this.selectedLibrary.tangibles[this.selectedTangible.id] = this.selectedTangible.tangible;
        this.selectedLibrary.images[this.selectedTangible.id] = 'data:image/png;base64,' + this.image;

        if(this.image != undefined)
        {
            Libraries.update(
                { _id: this.selectedLibrary._id },
                {$set: { ['images.' + this.selectedTangible.id]: this.selectedLibrary.images[this.selectedTangible.id]}}
            );
        }

        Libraries.update(this.selectedLibrary._id, {
            $set: {tangibles: this.selectedLibrary.tangibles, name: this.selectedLibrary.name},
        });

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

        Libraries.update(this.selectedLibrary._id, {
            $set: {tangibles: this.selectedLibrary.tangibles, name: this.selectedLibrary.name},
        });
    }

    updateName()
    {
        Libraries.update(this.selectedLibrary._id, {
            $set: {name: this.selectedLibrary.name},
        });
    }

    addLibrary()
    {
        Libraries.insert({_id: Random.id(), name: "Untitled", images: {}, tangibles: {}});
    }

    deleteLibrary(library)
    {
        Libraries.remove(library._id);
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

        this.imageObj.src = this.$tgImages.getTangibleImage(this.selectedTangible.id, this.selectedLibrary);
    }

    closeTangibleEditor()
    {
        SidenavCtrl.toggle('tangible-side-nav', this.$mdSidenav, this.$mdUtil);
    }

    initTouchWindow()
    {
        var rect = document.getElementById(this.containerID).getBoundingClientRect();
        this.stage = new Konva.Stage({
            container: this.containerID,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top
        });
        this.imageLayer = new Konva.Layer();
        this.stage.add(this.imageLayer, this.touchPointsLayer); //Left param on bottom, right on top
        this.stage.getContent().addEventListener('touchstart', this.onTouch.bind(this));
        this.onTangibleLoaded();
    }

    onTouch(event) {
        if (this.touchWindow == 'Editable') {
            var touchPoints = this.toPoints(event.touches);
            this.selectedTangible.tangible.registrationPoints = touchPoints;
            this.touchPointsLayer.destroyChildren();
            this.drawTouchPoints(touchPoints); //Visualise touch points
            this.stage.draw();
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