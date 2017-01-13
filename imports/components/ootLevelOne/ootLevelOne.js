import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './ootLevelOne.html';
import {TangibleController} from '../../api/tangibles/controller';
import {Diagrams} from '../../api/collections/diagrams.js';
import {Libraries} from '../../api/collections/libraries.js';
import 'pubsub-js/src/pubsub';

import ootToolbar from '../ootToolbar/ootToolbar';

class LevelOneCtrl {
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

    this.tangibleController = new TangibleController('tangibleContainer',this);

    this.helpers({
        remoteDiagram: ()=> {
            return Diagrams.findOne({_id: this.getReactively('diagramId')});
        },
        remoteLibrary: ()=> {
            return Libraries.findOne({_id: this.getReactively('libraryId')});
        }
    });

    this.libraryWatch = $scope.$watch('ootLevelOne.remoteLibrary', this.openNewDiagram.bind(this));

    $scope.letter = 'z';

    $scope.setLetter = function(newLetter){
      $scope.letter = newLetter;
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

            let libraryDef = {
                "_id": "M5q3SwPNcgCCKDWQL",
                "name": "Alphabet",
                "owner": "everyone",
                "images": {},
                "tangibles": {}
            };

            this.sharedData.diagramName = this.localDiagram.name;
            PubSub.publish('updateName', this.localDiagram.name);
            this.tangibleController.openDiagram(this.localDiagram, libraryDef, this.$tgImages);
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
