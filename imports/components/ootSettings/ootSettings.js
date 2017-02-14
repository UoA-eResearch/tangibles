import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './ootSettings.html';
import {TangibleController} from '../../api/tangibles/controller';
import {Diagrams} from '../../api/collections/diagrams.js';
import {Libraries} from '../../api/collections/libraries.js';
import 'pubsub-js/src/pubsub';
import {Points, Point} from '../../api/tangibles/points';

import ootToolbar from '../ootToolbar/ootToolbar';

class SettingsCtrl {
  constructor($scope, $reactive, $stateParams, $tgImages, $state, $tgSharedData, $const, $ootService){
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
    $scope.tangibleTestController = new TangibleController('tangibleTestContainer',this,$ootService);

    this.helpers({
        remoteDiagram: ()=> {
            return Diagrams.findOne({_id: this.getReactively('diagramId')});
        },
        remoteLibrary: ()=> {
            return Libraries.findOne({_id: this.getReactively('libraryId')});
        }
    });

    this.libraryWatch = $scope.$watch('ootSettings.remoteLibrary', this.openNewDiagram.bind(this));

    $scope.previousScale = $ootService.scale;

    $scope.tangibleEntered = function(containerID){
      if(containerID === $scope.tangibleController.containerID){//TODO: medium green triangle's touch points changed
        //only allow one tangible to be entered
        if($scope.tangibleController.tangibleCount === 0){
          $scope.tangibleController.enable = false;
          //get registered touchpoints for Medium Green Triangle and calculate distances
          let regPoints = $scope.library.tangibles.medium_green_triangle.registrationPoints;
          let regPointsDists = Points.sortClockwise(regPoints);
          let regDistA = Point.distance(regPointsDists[0], regPointsDists[1]);
          let regDistB = Point.distance(regPointsDists[0], regPointsDists[2]);
          let regDistC = Point.distance(regPointsDists[1], regPointsDists[2]);

          //get physical touch points' pixel distance
          let touchDist = $scope.tangibleController.getCurrentTangibleTouchDistance();

          //get average pixels per mm
          let averageRegistered = (regDistA/45 + regDistB/45 + regDistC/40)/3;
          let averageTouch = (touchDist[0]/45 + touchDist[1]/45 + touchDist[2]/40)/3;
          /*console.log(regDistA/45);
          console.log(regDistB/45);
          console.log(regDistC/40);
          console.log("    ");
          console.log(touchDist[0]/45);
          console.log(touchDist[1]/45);
          console.log(touchDist[2]/40);
          console.log("    ");
          console.log(averageRegistered);
          console.log(averageTouch);*/
          console.log("scale: "+averageRegistered/averageTouch);
          $ootService.scale = averageRegistered/averageTouch;
        }
        return false;
      }else{//the other container
        return true;
      }
    };

    $scope.clear = function(){
      $ootService.scale = $scope.previousScale;
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
    }

    $scope.clearTestArea = function(){
      $scope.tangibleTestController.clear();
    }

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
            this.$scope.library = angular.copy(newVal);

            this.sharedData.diagramName = this.localDiagram.name;
            PubSub.publish('updateName', this.localDiagram.name);
            this.$scope.tangibleController.openDiagram(this.localDiagram, angular.copy(newVal), this.$tgImages);
            this.$scope.tangibleTestController.openDiagram(this.localDiagram, angular.copy(newVal), this.$tgImages);
        }
    }

}

const name = 'ootSettings';
export default angular.module(name, [angularMeteor, ootToolbar.name])
  .component(name, {
    template,
    controllerAs: name,
    controller: SettingsCtrl,
    bindings: {library: '=', tangibles: '='}
  })
