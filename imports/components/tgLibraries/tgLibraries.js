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
    constructor($scope, $mdSidenav, $mdUtil, $q, $const, $tgImages, $meteor) {
        'ngInject';
        super();
        $scope.viewModel(this);
        this.touchWindow = 'Editable'; //Update: Made touchWindow always Editable
        this.$scope = $scope;
        this.$meteor = $meteor;
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
        //Update: Made touch points global to check conditionals for feedback
        this.points = undefined;

        this.imageObj = new Image();
        this.imageObj.onload = this.newImageLoaded.bind(this);

        this.helpers({
            libraries() {
                return Libraries.find({});
            }
        });

        $scope.imageUploaded = function(file, base64_object)
        {
            let deferred = $q.defer();
            var small = $scope.tgLibraries.resizeImage('data:image/png;base64,' + base64_object.base64, 1000);
            $scope.tgLibraries.image = small;
            $scope.tgLibraries.imageObj.src = small;
            return deferred.promise;
        };

        $scope.$on("$destroy", this.destroy.bind(this));
    }

    newImageLoaded()
    {
        let width = this.imageObj.naturalWidth * this.selectedTangible.tangible.scale;
        let height = this.imageObj.naturalHeight * this.selectedTangible.tangible.scale;

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

        //Update: Update visual feedback based on adding image
        if(this.points.length === 3 && this.shape !== undefined){
            document.getElementById(this.containerID).style.border = "2px solid #4caf50";
            document.getElementById("save").style.background = "#4caf50";
        }else{
            document.getElementById(this.containerID).style.border = "2px solid #DE6461";
            document.getElementById("save").style.background = "#757575";
        }

        this.$scope.$watch('tgLibraries.selectedTangible.tangible.scale', function() {

            let scale = 1;
            if(this.selectedTangible.tangible.scale != undefined)
            {
                scale = this.selectedTangible.tangible.scale;
            }

            if(this.selectedTangible.tangible.scale == 0)
            {
                scale = 0.5; 
            }

            let width = this.imageObj.naturalWidth * -scale;
            let height = this.imageObj.naturalHeight * -scale;
            this.shape.setWidth(width);
            this.shape.setHeight(height);
            this.shape.offsetX(width / 2);
            this.shape.offsetY(height / 2);
            this.stage.draw();
        }.bind(this), true);

        this.$scope.$watch('tgLibraries.selectedTangible.tangible.startAngle', function() {

            let startAngle = 0;
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

    getImage()
    {
        if(Meteor.isCordova)
            this.takePhoto();
        else
            this.triggerImageUpload();
    }

    resizeImage(img, maxLength) {
        // create an off-screen canvas
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        var imgElem = document.createElement('img');
        imgElem.src = img;

        var newWidth = 0;
        var newHeight = 0;

        if(imgElem.width > imgElem.height)
        {
            scale = maxLength / imgElem.width;
            newWidth = maxLength;
            newHeight = imgElem.height * scale;
        }
        else {
            scale = maxLength / imgElem.height;
            newHeight = maxLength;
            newWidth = imgElem.width * scale;
        }

        // set its dimension to target size
        canvas.width = newWidth;
        canvas.height = newHeight;

        // draw source image into the off-screen canvas:
        ctx.drawImage(imgElem, 0, 0, newWidth, newHeight);

        // encode image to data-uri with base64 version of compressed image
        return canvas.toDataURL('image/png');
    }

    white2transparent(img)
    {
        var imgElem = document.createElement('img');
        imgElem.src = img;

        var c = document.createElement('canvas');

        var w = imgElem.width, h = imgElem.height;

        c.width = w;
        c.height = h;

        var ctx = c.getContext('2d');

        ctx.drawImage(imgElem, 0, 0, w, h);
        var imageData = ctx.getImageData(0,0, w, h);
        var pixel = imageData.data;

        var r=0, g=1, b=2,a=3;
        for (var p = 0; p<pixel.length; p+=4)
        {
            var pr = pixel[p+r];
            var pg = pixel[p+g];
            var pb = pixel[p+b];

            var mean = (pr + pg + pb) / 3.0;
            var rg = Math.abs(pr - pg);
            var gb = Math.abs(pg - pb);
            var rb = Math.abs(pr - pb);
            var maxDiff = Math.max(Math.max(rg, gb), rb);

            if (maxDiff < 20 && mean > 120) //white
                pixel[p+a] = 0;
        }

        ctx.putImageData(imageData,0,0);

        return c.toDataURL('image/png');
    }

    takePhoto(){
        this.$meteor.getPicture().then(function(data){
            console.log('get image');
            var small = this.resizeImage(data, 1000);
            var whiteRemoved = this.white2transparent(small);
            this.$scope.tgLibraries.image = whiteRemoved;
            this.$scope.tgLibraries.imageObj.src = whiteRemoved;
        }.bind(this));
    }

    triggerImageUpload()
    {
        $('#file').trigger('click');
    }

    deleteTangible(tangibleId)
    {
        delete this.selectedLibrary.tangibles[tangibleId];
        delete this.selectedLibrary.images[tangibleId];

        Meteor.call("libraries.removeTangible", this.selectedLibrary._id, tangibleId);
    }

    saveTangible()
    {
        this.points = this.selectedTangible.tangible.registrationPoints;
        //Update: Allow save only if correctly created tangible
        if(this.points.length === 3 && this.imageObj.src.indexOf("stamp.png") === -1){
            
            if(this.selectedTangible.tangible.icon)
        {
            for (let [id, tangible] of Object.entries(this.selectedLibrary.tangibles)) {
                if(id != this.selectedTangible.id) {
                    tangible.icon = false;
                }
            }
        }
        
        this.selectedLibrary.tangibles[this.selectedTangible.id] = this.selectedTangible.tangible;
        this.selectedLibrary.images[this.selectedTangible.id] = this.image;

        if(this.image != undefined)
        {
            Meteor.call("libraries.updateTangibleImage", this.selectedLibrary._id, this.selectedTangible.id, this.selectedLibrary.images[this.selectedTangible.id]);
        }

        +        Meteor.call("libraries.updateTangible", this.selectedLibrary._id, this.selectedTangible.id, this.selectedTangible.tangible);
 +
 +        // this.deleteTangible(this.selectedTangible.id);
 +        // Meteor.call("libraries.addTangible", this.selectedLibrary._id, this.selectedTangible.id,this.selectedTangible.tangible);

        SidenavCtrl.toggle('tangible-side-nav', this.$mdSidenav, this.$mdUtil)

        }
    }

    addTangible()
    {
        let tangibleId = Random.id();
        let tangible = {"name": "Untitled",
            "icon": false,
            "scale": 1,
            "startAngle": 0,
            "registrationPoints": []
        };

        this.selectedLibrary.tangibles[tangibleId] = tangible;
        Meteor.call("libraries.addTangible", this.selectedLibrary._id, tangibleId, tangible);
    }

    updateName()
    {
        Meteor.call("libraries.updateName", this.selectedLibrary._id, this.selectedLibrary.name);
    }

    addLibrary()
    {
        Meteor.call("libraries.insert");
    }

    deleteLibrary(library)
    {
        Meteor.call("libraries.remove", library._id);
    }

    onTangibleLoaded()
    {
        this.onResize();

        // Centre registration points and draw them
        this.points = this.selectedTangible.tangible.registrationPoints;
        if(this.points.length > 0)
        {
            let curCentre = Points.getCentroid(this.points);
            let newCentre = {x: this.stage.getWidth()/2, y: this.stage.getHeight()/2};
            let offset = Point.subtract(newCentre, curCentre);

            for(let i = 0; i < this.points.length; i++)
            {
                this.points[i] = Point.add(this.points[i], offset);
            }

            this.drawTouchPoints(this.points);
        }else{
            //Update: Reset touch panel so no touch points are drawn if no points stored
            this.touchPointsLayer.destroyChildren();
        }

        this.imageObj.src = this.$tgImages.getTangibleImage(this.selectedTangible.id, this.selectedLibrary);

        //Update: Load tangible panel with correct feedback visualizations
        if(this.points.length === 3 && this.imageObj.src.indexOf("stamp.png") === -1){
            document.getElementById(this.containerID).style.border = "2px solid #4caf50";
            document.getElementById("save").style.background = "#4caf50";
        }else{
            document.getElementById(this.containerID).style.border = "2px solid #DE6461";
            document.getElementById("save").style.background = "#757575";
        }

    }

    closeTangibleEditor()
    {
        SidenavCtrl.toggle('tangible-side-nav', this.$mdSidenav, this.$mdUtil);
    }

    initTouchWindow()
    {
        let rect = document.getElementById(this.containerID).getBoundingClientRect();
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
        let touchPoints = this.toPoints(event.touches);
        this.selectedTangible.tangible.registrationPoints = touchPoints;
        this.points = this.selectedTangible.tangible.registrationPoints;

        //Update: Update visual feedback based on updating touch points
        if(this.points.length === 3 && this.imageObj.src.indexOf("stamp.png") === -1){
            document.getElementById(this.containerID).style.border = "2px solid #4caf50";
            document.getElementById("save").style.background = "#4caf50";
        }else{
            document.getElementById(this.containerID).style.border = "2px solid #DE6461";
            document.getElementById("save").style.background = "#757575";
        }

        this.touchPointsLayer.destroyChildren(); //Remove old touch points
        this.drawTouchPoints(touchPoints); //Visualise new touch points
        this.stage.draw();
    }
    
}

const name = 'tgLibraries';
export default angular.module('tgLibraries', [angularMeteor, 'naif.base64'])
    .component(name, {
        template,
        controllerAs: name,
        controller: LibrariesCtrl
    })