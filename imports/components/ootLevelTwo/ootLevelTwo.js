import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './ootLevelTwo.html';
import {TangibleController} from '../../api/tangibles/controller';
import {Diagrams} from '../../api/collections/diagrams.js';
import {Libraries} from '../../api/collections/libraries.js';
import 'pubsub-js/src/pubsub';

import ootToolbar from '../ootToolbar/ootToolbar';

class LevelTwoCtrl {
  constructor($scope, $reactive, $stateParams, $tgImages, $state, $tgSharedData, $const, $mdDialog, $ootService){
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
    $scope.attributeList = ["Size","Shape"];

    //=================METHODS=================//

    $scope.tangibleEntered = function(containerID){
      $scope.classEntered = !$scope.classEntered;//placeholder
      $scope.showAlert();
      if($scope.tangibleController.tangibleCount === 0){
        if($scope.tangibleController.currentTangible.type === "Class"){
          $scope.classInEdit = $scope.tangibleController.currentTangible.class;//TODO
          //show popup inorder to refresh ngshow and ngdisable
          return true;
        }else{
          //TODO: show error popup: please enter a class tangible to edit
          return false;
        }
      }else{
        if($scope.tangibleController.currentTangible.type === "AttributeType"){

          return true;
        }else{
          //TODO: show error popup: please enter an attribute type to add to your custom class (puzzle piece shaped)
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
      $scope.classEntered = !$scope.classEntered;
      $scope.classInEdit = "";
      $scope.attributeList = ["Size"];
    };

    $scope.showAlert = function(){
      alert = $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title("wutwut")
        .textContent($scope.classEntered)
        .ok('Got it!');
      $mdDialog.show(alert)
        .finally(function(){
        });
    };

    $scope.openSummary = function(){
        //$mdSidenav('right').toggle();
        //TODO: add sidenav for summary
        //TODO: save attributes of the edited class to service
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
