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
    $scope.fields = [];
    $scope.lowerCaseFields = [];
    $scope.attributeValues = [];

    //testing purposes
    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4
    });
    var imageObj = new Image();
    //TODO: get image path - get path from server through client
    imageObj.src = '../../../private/default_db/images/class_triangle';
    circle.fillPatternImage(imageObj);
    $scope.konvaLayer.add(circle);

    //=================METHODS=================//

    $scope.setup = function(className){
      $scope.class = className;
      let templates = $ootService.classTemplates;
      let indexOfClass = -1;

      //get index of the class
      for(i=0;i<templates.length;i++){
        if(templates[i].id === className){
          indexOfClass = i;
        }
      }

      //save the fields and convert to lowercase
      $scope.fields = templates[indexOfClass].attributes;
      $scope.lowerCaseFields = [];
      for(j=0;j<$scope.fields.length;j++){
        $scope.lowerCaseFields.push($scope.fields[j].toLowerCase());
        $scope.attributeValues.push("...")
      }
    };

    $scope.tangibleEntered = function(containerID){
      let currentTangible = $scope.tangibleController.currentTangible;
      //TODO: draw using Konva (shapes)
      if($scope.tangibleController.tangibleCount === 0){
        if(currentTangible.type === "Class"){
          $scope.editMode = true;
          $scope.class = currentTangible.class;
          $scope.setup($scope.class);
          $scope.$apply();
          return true;
        }else{
          $scope.alertTitle = "Incorrect tangible";
          $scope.alertMessage= "Please enter a class tangible to instantiate.";
          $scope.showAlert();
          return false;
        }
      }else{
        if(currentTangible.type === "AttributeValue"){
          let newAttributeValue = currentTangible.class;
          //TODO
          //TODO: check if all values have been entered
          $scope.$apply();
          return false;
        }else{
          $scope.alertTitle = "Incorrect tangible";
          $scope.alertMessage= "Please enter an attribute value.";
          $scope.showAlert();
          return false;
        }
      }
    };

    $scope.clear = function(){
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
      $scope.editMode = false;
      $scope.complete = false;
      $scope.class = "";
      $scope.fields = [];
      $scope.lowerCaseFields = [];
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
