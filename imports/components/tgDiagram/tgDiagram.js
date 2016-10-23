import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgDiagram.html';
import {TangibleController} from '../../api/tangibles/controller';
import {Diagrams} from '../../api/collections/diagrams.js';
import {Libraries} from '../../api/collections/libraries.js';
import 'pubsub-js/src/pubsub';


class DiagramCtrl {
    constructor($scope, $reactive, $stateParams, $tgImages, $state, $tgSharedData, $const) {
        'ngInject';
        $reactive(this).attach($scope);
        this.$tgImages = $tgImages;
        this.$const = $const;
        this.$state = $state;
        this.sharedData = $tgSharedData.data;
        this.tangibleController = new TangibleController('diagramContainer');
        this.diagramId = $stateParams.diagramId;
        this.libraryId = $stateParams.libraryId;
        this.isNewDiagram = ($stateParams.isNewDiagram === "true");

        if(this.diagramId == "" || this.libraryId == "" || $stateParams.isNewDiagram == "")
        {
            this.openDefault();
        }

        this.helpers({
            remoteDiagram: ()=> {
                return Diagrams.findOne({_id: this.getReactively('diagramId')});
            },
            remoteLibrary: ()=> {
                return Libraries.findOne({_id: this.getReactively('libraryId')});
            }
        });

        this.deleteSelectedSub = this.tangibleController.deleteSelected.bind(this.tangibleController);
        this.deleteAllSub = this.tangibleController.deleteAll.bind(this.tangibleController);
        this.zoomInSub = this.tangibleController.zoomIn.bind(this.tangibleController);
        this.zoomOutSub = this.tangibleController.zoomOut.bind(this.tangibleController);
        this.bringForwardSub = this.tangibleController.bringForward.bind(this.tangibleController);
        this.sendBackwardSub = this.tangibleController.sendBackward.bind(this.tangibleController);
        this.bringToFrontSub = this.tangibleController.bringToFront.bind(this.tangibleController);
        this.sendToBackSub = this.tangibleController.sendToBack.bind(this.tangibleController);
        this.copyDiagramSub = this.copy.bind(this);
        this.saveDiagramSub =  this.save.bind(this);

        PubSub.subscribe('name', this.deleteSelectedSub);
        PubSub.subscribe('delete', this.deleteSelectedSub);
        PubSub.subscribe('deleteAll', this.deleteAllSub);
        PubSub.subscribe('zoomIn', this.zoomInSub);
        PubSub.subscribe('zoomOut', this.zoomOutSub);
        PubSub.subscribe('bringForward', this.bringForwardSub);
        PubSub.subscribe('sendBackward', this.sendBackwardSub);
        PubSub.subscribe('bringToFront', this.bringToFrontSub);
        PubSub.subscribe('sendToBack', this.sendToBackSub);
        PubSub.subscribe('copy', this.copyDiagramSub);
        PubSub.subscribe('save', this.saveDiagramSub);
        this.libraryWatch = $scope.$watch('tgDiagram.remoteLibrary', this.openNewDiagram.bind(this));
        this.diagramWatch = $scope.$watch('tgDiagram.remoteDiagram', this.openExistingDiagram.bind(this));
        $scope.$on("$destroy", this.destroy.bind(this));
    }

    openDefault()
    {
        if(Meteor.user())
            this.$state.go('home.diagram',{diagramId: Random.id(), isNewDiagram: true, libraryId: Meteor.user().profile.defaultLibraryId});
        else
            this.$state.go('home.diagram',{diagramId: Random.id(), isNewDiagram: true, libraryId: this.$const.DEFAULT_LIBRARY_ID});
    }

    destroy()
    {
        PubSub.unsubscribe(this.deleteSelectedSub);
        PubSub.unsubscribe(this.deleteAllSub);
        PubSub.unsubscribe(this.zoomInSub);
        PubSub.unsubscribe(this.zoomOutSub);
        PubSub.unsubscribe(this.bringForwardSub);
        PubSub.unsubscribe(this.sendBackwardSub);
        PubSub.unsubscribe(this.bringToFrontSub);
        PubSub.unsubscribe(this.sendToBackSub);
        PubSub.unsubscribe(this.copyDiagramSub);
        PubSub.unsubscribe(this.saveDiagramSub);
        this.tangibleController.destroy();
    }

    openNewDiagram(newVal, oldVal)
    {
        if(newVal != undefined && this.isNewDiagram)
        {
            this.libraryWatch(); //cancels watch
            this.localDiagram = {
                "_id": this.diagramId,
                "name": "Untitled",
                "library": {
                    "_id": this.libraryId
                },
                "image": "",
                "scale": 1.0,
                "position": {x:0, y:0},
                "tangibles": {}
            };

            this.sharedData.diagramName = this.localDiagram.name;
            PubSub.publish('updateName', this.localDiagram.name);
            this.tangibleController.openDiagram(this.localDiagram, angular.copy(newVal), this.$tgImages);
        }
    }

    openExistingDiagram(newVal, oldVal)
    {
        if(newVal != undefined && !this.isNewDiagram)
        {
            this.diagramWatch(); //cancels watch
            this.localDiagram = angular.copy(newVal);
            this.sharedData.diagramName = this.localDiagram.name;
            PubSub.publish('updateName', this.localDiagram.name);
            let library = Libraries.findOne({_id: this.libraryId});
            this.tangibleController.openDiagram(this.localDiagram, angular.copy(library), this.$tgImages);
        }
    }

    copy(msg, data)
    {
        if (this.localDiagram != undefined) {
            this.save();
            let copy = angular.copy(this.localDiagram);
            copy._id = Random.id();
            this.saveThumb(copy._id);
            copy.name = data;
            Meteor.call("diagrams.insert", copy);
            this.$state.go('home.diagram', {diagramId: copy._id, isNewDiagram: false, libraryId: copy.library._id});
        }
    }

    saveThumb(diagramId)
    {
        this.tangibleController.diagramThumb().then(function(imageData) {
            Meteor.call("diagrams.saveThumb", diagramId, imageData);
        }.bind(this));
    }

    save() {
        if (this.localDiagram != undefined)
        {
            this.saveThumb(this.diagramId);
            this.localDiagram.name = this.sharedData.diagramName;

            //get latest diagram state, could do from inside visuals if want diagram saving to be reactive
            for (let [id, visual] of Object.entries(this.tangibleController.visuals)) {
                this.localDiagram.tangibles[id].position.x = visual.shape.getX();
                this.localDiagram.tangibles[id].position.y = visual.shape.getY();
                this.localDiagram.tangibles[id].orientation = visual.shape.rotation() - visual.template.startAngle;
                this.localDiagram.tangibles[id].zIndex = visual.shape.getZIndex();
            }

            for(let [id, visual] of Object.entries(this.localDiagram.tangibles))
            {
                if(!(id in this.tangibleController.visuals))
                {
                    delete this.localDiagram.tangibles[id];
                }
            }

            this.localDiagram.scale = this.tangibleController.stage.scaleX();
            this.localDiagram.position = {x: this.tangibleController.stage.x(), y:  this.tangibleController.stage.y()};

            if (Diagrams.find({_id: this.diagramId}).count() == 0) {
                Meteor.call("diagrams.insert", this.localDiagram);
            }
            else {
                Meteor.call("diagrams.update", this.localDiagram._id, this.sharedData.diagramName, this.localDiagram.scale, this.localDiagram.position, this.localDiagram.tangibles);
            }
        }
    }
}

const name = 'tgDiagram';
export default angular.module(name, [angularMeteor])
    .component(name, {
        template,
        controllerAs: name,
        controller: DiagramCtrl,
        bindings: {library: '=', tangibles: '='}
    });