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
  constructor($scope, $reactive, $stateParams, $tgImages, $state, $tgSharedData, $const){
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

    this.libraryWatch = $scope.$watch('ootSettings.remoteLibrary', this.openNewDiagram.bind(this));

    $scope.tangibleEntered = function(containerID){
      //TODO: only allow one tangible to be entered
      if($scope.tangibleController.count === 1){
        $scope.tangibleController.enable = false;
        //get physical touch points' pixel distance
        let touchDist = $scope.tangibleController.getCurrentTangibleTouchDistance();
        //get registered touchpoints for Medium Green Triangle
        let regPoints = $scope.library.tangibles.medium_green_triangle.registrationPoints;

        let regPointsDists = Points.sortClockwise(regPoints);
        let regDistA = Point.distance(regPointsDists[0], regPointsDists[1]);
        let regDistB = Point.distance(regPointsDists[0], regPointsDists[2]);
        let regDistC = Point.distance(regPointsDists[1], regPointsDists[2]);

        console.log("regDistA: "+regDistA);
        console.log("regDistB: "+regDistB);
        console.log("regDistC: "+regDistC);
        console.log(touchDist);

        //get average pixels per mm
        let averageRegistered = (regDistA/39 + regDistB/35 + regDistC/18)/3;
        let averageTouch = (touchDist[0]/39 + touchDist[1]/35 + touchDist[2]/18)/3;
        console.log(averageRegistered);
        console.log(averageTouch);
        console.log(averageRegistered/averageTouch);
        //TODO: get registered distances
      }
      return true;
    };

    $scope.clear = function(){
      $scope.tangibleController.clear();
      $scope.tangibleController.enable = true;
      $scope.tangibleController.count = 0;
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
