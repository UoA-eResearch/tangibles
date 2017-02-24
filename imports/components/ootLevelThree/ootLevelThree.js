import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './ootLevelThree.html';
import {TangibleController} from '../../api/tangibles/controller';
import {Diagrams} from '../../api/collections/diagrams.js';
import {Libraries} from '../../api/collections/libraries.js';
import 'pubsub-js/src/pubsub';
import Konva from 'konva';

import ootToolbar from '../ootToolbar/ootToolbar';

class LevelThreeCtrl {
  constructor($scope, $reactive, $stateParams, $tgImages, $state, $tgSharedData, $const, $mdDialog, $mdSidenav, $ootService){
    'ngInject';
    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$tgImages = $tgImages;
    this.$const = $const;
    this.$state = $state;
    this.sharedData = $tgSharedData.data;

    this.diagramId = Random.id();
    this.libraryId = this.$const.DEFAULT_LIBRARY_ID;
    this.isNewDiagram = "true";

    $scope.tangibleController = new TangibleController('tangibleContainer',this,$ootService);

    this.helpers({
        remoteDiagram: ()=> {
            return Diagrams.findOne({_id: this.getReactively('diagramId')});
        },
        remoteLibrary: ()=> {
            return Libraries.findOne({_id: this.getReactively('libraryId')});
        }
    });

    this.libraryWatch = $scope.$watch('ootLevelThree.remoteLibrary', this.openNewDiagram.bind(this));

    $scope.konvaStage = $scope.tangibleController.getKonvaStage();
    $scope.konvaLayer = $scope.tangibleController.getKonvaLayer();

    //=================FIELDS=================//

    $scope.editMode = false;
    $scope.complete = false;
    $scope.classEntered = false;
    $scope.class = "";
    $scope.attributes = [];
    $scope.attributeValues = [];

    //==============KONVA METHODS==============//

    $scope.createShape = function(shape){
      let index = $scope.attributes.indexOf("OutlineColour");
      let strokeColour = "";
      if(index === -1){
        strokeColour = "black";
      }else{
        strokeColour = "#D3D3D3";
      }
      if(shape === "Circle"){
        $scope.konvaShape = new Konva.Circle({
          x: 250,
          y: 200,
          radius: 80,
          stroke: strokeColour,
          strokeWidth: 10,
          lineCap: 'round',
          lineJoin: 'round',
          draggable: true
        });
        $scope.konvaLayer.add($scope.konvaShape);
      }else if (shape === "Triangle"){
        $scope.konvaShape = new Konva.RegularPolygon({
          x: 250,
          y: 250,
          sides: 3,
          radius: 80,
          stroke: strokeColour,
          strokeWidth: 10,
          lineCap: 'round',
          lineJoin: 'round',
          draggable: true
        });
        $scope.konvaLayer.add($scope.konvaShape);
      }else if(shape === "Square"){
        $scope.konvaShape = new Konva.Rect({
          x: 160,
          y: 110,
          width: 140,
          height: 140,
          stroke: strokeColour,
          strokeWidth: 10,
          lineCap: 'round',
          lineJoin: 'round',
          draggable: true
        });
        $scope.konvaLayer.add($scope.konvaShape);
      }
      return false;
    };

    $scope.updateShape = function(attributeClass, attributeValue){
      if(attributeClass === "Size"){
        if($scope.class === "Circle"){
          if(attributeValue === "Small"){
            $scope.konvaShape.width($ootService.konvaSizes.small.diameter);
          }else if(attributeValue === "Medium"){
            $scope.konvaShape.width($ootService.konvaSizes.medium.diameter);
          }else if(attributeValue === "Large"){
            $scope.konvaShape.width($ootService.konvaSizes.large.diameter);
          }
        }else if($scope.class === "Triangle"){
          if(attributeValue === "Small"){
            $scope.konvaShape.width($ootService.konvaSizes.small.diameter);
          }else if(attributeValue === "Medium"){
            $scope.konvaShape.width($ootService.konvaSizes.medium.diameter);
          }else if(attributeValue === "Large"){
            $scope.konvaShape.width($ootService.konvaSizes.large.diameter);
          }
        }else if($scope.class === "Square"){
          if(attributeValue === "Small"){
            $scope.konvaShape.width($ootService.konvaSizes.small.width);
            $scope.konvaShape.height($ootService.konvaSizes.small.height);
          }else if(attributeValue === "Medium"){
            $scope.konvaShape.width($ootService.konvaSizes.medium.width);
            $scope.konvaShape.height($ootService.konvaSizes.medium.height);
          }else if(attributeValue === "Large"){
            $scope.konvaShape.width($ootService.konvaSizes.large.width);
            $scope.konvaShape.height($ootService.konvaSizes.large.height);
          }
        }
      }else if(attributeClass === "Colour"){
        let colourToFill = attributeValue.toLowerCase();
        $scope.konvaShape.fill(colourToFill);
      }else if(attributeClass === "OutlineColour"){
        let outlineColourToFill = attributeValue.toLowerCase();
        $scope.konvaShape.stroke(outlineColourToFill);
      }else if(attributeClass === "StrokeStyle"){
        if(attributeValue === "Dashed"){
          $scope.konvaShape.dash([30,20]);
        }else if(attributeValue === "Alternating"){
          $scope.konvaShape.dash([30, 20, 0.001, 20]);
        }else if(attributeValue === "Dots"){
          $scope.konvaShape.dash([0.001,20]);
        }
      }
    };

    //=================METHODS=================//

    $scope.setup = function(className){
      $scope.class = className;
      let templates = $ootService.classTemplates;
      let indexOfClass = -1;

      //get index of the class and get fields
      for(i=0;i<templates.length;i++){
        if(templates[i].id === className){
          indexOfClass = i;
        }
      }
      $scope.attributes = templates[indexOfClass].attributes;

      //add attributeValues array
      for(j=0;j<$scope.attributes.length;j++){
        $scope.attributeValues.push("...")
      }
    };

    $scope.tangibleEntered = function(containerID){
      let currentTangible = $scope.tangibleController.currentTangible;
      if($scope.classEntered === false){//first tangible entered
        if(currentTangible.type === "Class"){
          $scope.classEntered = true;
          $scope.editMode = true;
          $scope.class = currentTangible.class;
          $scope.setup($scope.class);
          $scope.checkComplete();//TODO:what if class has no fields????
          $scope.createShape($scope.class);
          $scope.$apply();
          return false;
        }else{
          $scope.alertTitle = "Incorrect tangible";
          $scope.alertMessage= "Please enter a class tangible to instantiate.";
          $scope.showAlert();
          return false;
        }
      }else{//all other tangibles entered after first
        if(currentTangible.type === "AttributeValue"){
          let newAttributeClass = currentTangible.class;//"Size","Colour","OutlineColour", or "Pattern"
          let newAttributeValue = currentTangible.value;
          let indexOfAtt = $scope.attributes.indexOf(newAttributeClass);
          if(indexOfAtt === -1){
            $scope.alertTitle = "Attribute not found in your class";
            $scope.alertMessage= "Please enter an attribute value for one of the fields in your custom class";
            $scope.showAlert();
            return false;
          }else{
            $scope.attributeValues[indexOfAtt] = newAttributeValue;
            $scope.updateShape(newAttributeClass, newAttributeValue);
            $scope.checkComplete();
            $scope.$apply();
            return false;
          }
        }else{
          $scope.alertTitle = "Incorrect tangible";
          $scope.alertMessage= "Please enter an attribute value.";
          $scope.showAlert();
          return false;
        }
      }
      return false;
    };

    $scope.checkComplete = function(){
      for(i = 0; i < $scope.attributeValues.length ; i++){
        if($scope.attributeValues[i] === "..."){
          return;
        }
      }
      //all attributes have a value - finished instantiating
      $scope.complete = true;
    };

    $scope.clear = function(){
      $scope.konvaShape.destroy();
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
      $scope.editMode = false;
      $scope.complete = false;
      $scope.classEntered = false;
      $scope.class = "";
      $scope.attributes = [];
      $scope.attributeValues = [];
    };

    $scope.showAlert = function(){
      alert = $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title($scope.alertTitle)
        .textContent($scope.alertMessage)
        .ok('Got it!');
      $mdDialog.show(alert)
        .finally(function(){
        });
    };

    $scope.openSummary = function(){
      $mdSidenav('right').toggle();
    };

  }

  openNewDiagram(newVal, oldVal){
        if(true)
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
            this.$scope.tangibleController.openDiagram(this.localDiagram, angular.copy(newVal), this.$tgImages);
        }
    }

}

const name = 'ootLevelThree';
export default angular.module(name, [angularMeteor, ootToolbar.name])
  .component(name, {
    template,
    controllerAs: name,
    controller: LevelThreeCtrl,
    bindings: {library: '=', tangibles: '='}
  })
