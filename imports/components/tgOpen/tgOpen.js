import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularUiRouter from 'angular-ui-router';
import template from './tgOpen.html';
import {DialogCtrl} from '../tgDialog/tgDialog'
import {Diagrams} from '/imports/api/collections/diagrams';

class OpenDiagramCtrl extends DialogCtrl {
    constructor($scope, $mdDialog, $const, $state, $tgImages) {
        'ngInject';
        super($scope, $mdDialog, $const);
        $scope.viewModel(this);
        this.$state = $state;
        $scope.$tgImages = $tgImages;

        this.subscribe('diagrams');

        this.helpers({
            diagrams() {
                return Diagrams.find({});
            }
        });
    }

    openDiagram(diagram, $event)
    {
        this.$state.go('home.diagram', {"diagramId": diagram._id, "isNewDiagram": false, "libraryId": diagram.library._id});
        this.close($event);
    }

    //Update: call delete diagram fuction
    deleteDiagram (diagram) {
         Meteor.call("diagrams.remove", diagram._id);
    }
}


const name = 'tgOpen';
export default angular.module(name, [angularMeteor, 'ui.router'])
    .component(name, {
        template,
        controllerAs: name,
        controller: OpenDiagramCtrl
    });
