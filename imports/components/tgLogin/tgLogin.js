import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgLogin.html';

class LoginCtrl {
    constructor($scope, $const, $state) {
        'ngInject';
        $scope.viewModel(this);
        this.$const = $const;
        this.$state = $state;
    }

    openNewDiagram()
    {
        this.$state.go('home.diagram',{diagramId: Random.id(), isNewDiagram: true, libraryId: this.$const.DEFAULT_LIBRARY_ID});
    }
}

const name = 'tgLogin';
export default angular.module(name, [
        angularMeteor
    ])
    .component(name, {
        template,
        controllerAs: name,
        controller: LoginCtrl
    });