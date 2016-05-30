import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularUiRouter from 'angular-ui-router';
import template from './tgNew.html';
import {DialogCtrl} from '../tgDialog/tgDialog';
import {Libraries} from '../../api/collections/libraries.js';

class NewDiagramCtrl extends DialogCtrl {
    constructor($scope, $mdDialog, $const, $state) {
        'ngInject';
        super($scope, $mdDialog, $const);
        $scope.viewModel(this);
        this.$state = $state;
        this.subscribe('libraries');

        this.helpers({
            libraries() {
                return Libraries.find({});
            }
        });
    }

    getLibraryIcon(library)
    {
        var iconId = '';

        for (let [id, instance] of Object.entries(library.tangibles)) {
            if(instance.icon)
            {
                iconId = id;
                break;
            }
        }

        return '/cfs/files/images/' + iconId + '/image.png';
    }

    openNewDiagram(library, $event)
    {
        this.$state.go('home.diagram', {"diagramId": Random.id(), "isNewDiagram": true, "libraryId": library._id});
        this.close($event);
    }
}

const name = 'tgNew';
export default angular.module(name, [angularMeteor, 'ui.router'])
    .component(name, {
        template,
        controllerAs: name,
        controller: NewDiagramCtrl
    });