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
    $scope.class = "";
    $scope.attributes = [];
    $scope.lowerCaseAttributes = [];
    $scope.attributeValues = [];

    //==============KONVA METHODS==============//

    $scope.createShape = function(shape){
      //TODO: merge this method's logic into the bottom of setup() method???
      if(shape === "Circle"){
        let circle = new Konva.Circle({
          x: 100,
          y: 100,
          radius: 70,
          fill: 'red',
          stroke: 'black',
          strokeWidth: 4
        });
        //testing purposes
        //TODO: get image path - get path from server through client
        /*var imageObj = new Image();
        imageObj.src = 'default_db/images/class_triangle';
        circle.fillPatternImage(imageObj);
        $scope.konvaLayer.add(circle);*/

      }else if (shape === "Triangle"){

      }else if(shape === "Square"){

      }
      return false;
    };

    $scope.updateShape = function(attribueClass, attributeValue){
      //TODO: check which class was entered - and call konva to update the shape

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

      //convert to lowercase and add attributeValues array
      for(j=0;j<$scope.attributes.length;j++){
        $scope.lowerCaseAttributes.push($scope.attributes[j].toLowerCase());
        $scope.attributeValues.push("...")
      }
      console.log("$scope.attributes: "+$scope.attributes);
      console.log("$scope.lowerCaseAttributes: "+$scope.lowerCaseAttributes);
      console.log("$scope.attributeValues: "+$scope.attributeValues);
    };

    $scope.tangibleEntered = function(containerID){
      let currentTangible = $scope.tangibleController.currentTangible;
      if($scope.tangibleController.tangibleCount === 0){//first tangible entered
        if(currentTangible.type === "Class"){
          $scope.editMode = true;
          $scope.class = currentTangible.class;
          $scope.setup($scope.class);
          $scope.checkComplete();//TODO:what if class has no fields????
          $scope.createShape($scope.class);
          $scope.$apply();
          return true;
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
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
      $scope.editMode = false;
      $scope.complete = false;
      $scope.class = "";
      $scope.attributes = [];
      $scope.lowerCaseAttributes = [];
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
