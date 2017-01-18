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

    $scope.letter = '~okay~~~~~~~~~~~~~~~~~~~~~~~~~~~~';
    $scope.isCorrect = false;

    //TODO
    $scope.clear = function(){
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
      $scope.tangibleController.count = 0;
      $scope.isCorrect = false;
    };

    //TODO
    $scope.check = function(){
      if($scope.tangibleController.count === 3){
        console.log("I'm at 3 now!~!~!~!~!~!~!~!~!");
        $scope.tangibleController.enable = false;
        $scope.showNoMatchAlert();
        if(true){//TODO: add if to check
          $scope.isCorrect = true;
        }
      }
        let shapeTangible = $scope.tangibleController.currentTangible;
        console.log("In lvl1Controller: ");
        console.log("Size: "+shapeTangible.size);
        console.log("Colour: "+shapeTangible.colour);
        console.log("Shape: "+shapeTangible.shape);
    };

    $scope.showNoMatchAlert = function(){
      alert = $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('Sorry. Please try again.')
        .textContent('There are no common attributes between these objects. Please clear the screen and try again.')
        .ok('Got it!');
      $mdDialog.show(alert)
        .finally(function(){
          console.log("PRETEND TO CLEAR SCREEN");//TODO: auto clear or manual
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
