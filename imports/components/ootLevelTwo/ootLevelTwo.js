import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './ootLevelTwo.html';
import {TangibleController} from '../../api/tangibles/controller';
import {Diagrams} from '../../api/collections/diagrams.js';
import {Libraries} from '../../api/collections/libraries.js';
import 'pubsub-js/src/pubsub';

import ootToolbar from '../ootToolbar/ootToolbar';

class LevelTwoCtrl {
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

    this.libraryWatch = $scope.$watch('ootLevelTwo.remoteLibrary', this.openNewDiagram.bind(this));

    //=================FIELDS=================//

    $scope.classEntered = false;
    $scope.classInEdit = "";
    $scope.attributeList = [];
    $scope.alertTitle = "";
    $scope.alertMessage= "";

    //=================METHODS=================//

    $scope.tangibleEntered = function(containerID){
      let currentTangible = $scope.tangibleController.currentTangible;
      if($scope.tangibleController.tangibleCount === 0){
        if(currentTangible.type === "Class"){
          $scope.classEntered = true;
          $scope.classInEdit = currentTangible.class;
          $scope.$apply();
          return true;
        }else{
          $scope.alertTitle = "Incorrect tangible";
          $scope.alertMessage= "Please enter a class tangible to edit";
          $scope.showAlert();
          return false;
        }
      }else{
        if(currentTangible.type === "AttributeType"){
          let newAttributeType = currentTangible.class;
          //if not already in the attribute list
          if($scope.attributeList.indexOf(newAttributeType) === -1){
            $scope.attributeList.push(newAttributeType);
          }
          $scope.$apply();
          return false;
        }else{
          $scope.alertTitle = "Incorrect tangible";
          $scope.alertMessage= "Please enter an attribute type to add to your class.\n Hint: attribute type tangibles look like a puzzle piece.";
          $scope.showAlert();
          return false;
        }
      }
    };

    $scope.remove = function(attributeToRemove){
      let index = $scope.attributeList.indexOf(attributeToRemove);
      if(index > -1){
        $scope.attributeList.splice(index,1);
      }
    };

    $scope.clear = function(){
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
      $scope.classEntered = false;
      $scope.classInEdit = "";
      $scope.attributeList = [];
      $ootService.classTemplates = [
        {id: "Circle", attributes: []},
        {id: "Square", attributes: []},
        {id: "Triangle", attributes: []}
      ];
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
      if($scope.attributeList.length === 0){
        $scope.alertTitle = "Insufficient number of attributes";
        $scope.alertMessage= "Please enter at least one attribute to your custom class";
        $scope.showAlert();
      }else{
        $mdSidenav('right').toggle();
        for(i=0;i<$ootService.classTemplates.length;i++){
          if($ootService.classTemplates[i].id === $scope.classInEdit){
            $ootService.classTemplates[i].attributes = $scope.attributeList;
          }
        }
      }
    };

    $scope.goToLevelThree = function(){
      $state.go("levelThree");
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

const name = 'ootLevelTwo';
export default angular.module(name, [angularMeteor, ootToolbar.name])
  .component(name, {
    template,
    controllerAs: name,
    controller: LevelTwoCtrl,
    bindings: {library: '=', tangibles: '='}
  })
