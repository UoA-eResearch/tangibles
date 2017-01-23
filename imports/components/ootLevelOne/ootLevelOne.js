import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './ootLevelOne.html';
import {TangibleController} from '../../api/tangibles/controller';
import {Diagrams} from '../../api/collections/diagrams.js';
import {Libraries} from '../../api/collections/libraries.js';
import 'pubsub-js/src/pubsub';

import ootToolbar from '../ootToolbar/ootToolbar';

class LevelOneCtrl {
  constructor($scope, $reactive, $stateParams, $tgImages, $state, $tgSharedData, $const, $mdDialog){
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

    $scope.tangibleController = new TangibleController('tangibleContainer',this);

    this.helpers({
        remoteDiagram: ()=> {
            return Diagrams.findOne({_id: this.getReactively('diagramId')});
        },
        remoteLibrary: ()=> {
            return Libraries.findOne({_id: this.getReactively('libraryId')});
        }
    });

    this.libraryWatch = $scope.$watch('ootLevelOne.remoteLibrary', this.openNewDiagram.bind(this));

    //=================FIELDS=================//

    //Setup required fields
    $scope.isCorrect = false;
    $scope.tangibleShapes = [];
    //TODO: add attributes & class type to angular-card

    //=================METHODS=================//

    /*Clears the screen and resets all fields to default value*/
    $scope.clear = function(){
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
      $scope.tangibleController.count = 0;
      $scope.isCorrect = false;
      $scope.tangibleShapes = [];
    };

    $scope.tangibleEntered = function(){
      //save tangible info
      $scope.tangibleShapes[$scope.tangibleController.count-1] = $scope.tangibleController.currentTangible;
      console.log($scope.tangibleShapes);
      //User has entered 3 ans - CHECK ANS
      if($scope.tangibleController.count === 3){
        //Prevent additional tangibles to be added to screen
        $scope.tangibleController.enable = false;
        if($scope.checkAns()){
          //CORRECT
          console.log("CORRECT");
          $scope.isCorrect = true;
          $scope.showAlert();
        }else{
          //INCORRECT
          console.log("INCORRECT");
          $scope.isCorrect = false;
          $scope.showAlert();
        }
      }
    };

    $scope.checkAns = function(){
      $scope.alertTitle = 'Incorrect';
      $scope.alertMessage = 'There are no common attributes between these objects. Please clear the screen and try again.';
      let ans = false;
      let shape1 = $scope.tangibleShapes[0];
      let shape2 = $scope.tangibleShapes[1];
      let shape3 = $scope.tangibleShapes[2];
      //no duplicates
      if(shape1.name != shape2.name && shape2.name != shape3.name && shape1.name != shape3.name){
        //check colour
        if(shape1.colour == shape2.colour && shape2.colour == shape3.colour){
          ans = true;
          $scope.alertTitle = "Correct";
          $scope.alertMessage = "The common attribute is COLOUR";
        }
        //check size
        if(shape1.size == shape2.size && shape2.size == shape3.size){
          ans = true;
          $scope.alertTitle = "Correct";
          $scope.alertMessage = "The common attribute is SIZE";
        }
        //check shape
        if(shape1.shape == shape2.shape && shape2.shape == shape3.shape){
          ans = true;
          $scope.alertTitle = "Correct";
          $scope.alertMessage = "The common attribute is SHAPE";
        }
      }else{
        $scope.alertMessage = "Please enter 3 DIFFERENT tangibles. Please clear the screen and try again.";
        ans = false;
      }
      return ans;
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
          $scope.tangibleController.clearTouchPoints();
        });
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

            /*let libraryDef = {
                "_id": "M5q3SwPNcgCCKDWQL",
                "name": "Alphabet",
                "owner": "everyone",
                "images": {},
                "tangibles": {}
            };*/

            this.sharedData.diagramName = this.localDiagram.name;
            PubSub.publish('updateName', this.localDiagram.name);
            this.$scope.tangibleController.openDiagram(this.localDiagram, angular.copy(newVal), this.$tgImages);
        }
    }

}

const name = 'ootLevelOne';
export default angular.module(name, [angularMeteor, ootToolbar.name])
  .component(name, {
    template,
    controllerAs: name,
    controller: LevelOneCtrl,
    bindings: {library: '=', tangibles: '='}
  })
