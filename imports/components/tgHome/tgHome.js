import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgHome.html';
import toolbar from '../tgToolbar/tgToolbar';

class HomeCtrl {
    constructor($scope, $reactive) {
        'ngInject';
        $reactive(this).attach($scope);
    }
}

const name = 'tgHome';
export default angular.module(name, [angularMeteor, toolbar.name])
    .component(name, {
        template,
        controllerAs: name,
        controller: HomeCtrl
    })