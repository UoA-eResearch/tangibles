import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import template from './tgHome.html';
import toolbar from '../tgToolbar/tgToolbar'

export class HomeCtrl {
    constructor($scope, $reactive) {
        'ngInject';
        $reactive(this).attach($scope);
    }
}

const name = 'tgHome';
export default angular.module(name, [angularMeteor, ngMaterial, toolbar.name])
    .component(name, {
        template,
        controllerAs: name,
        controller: HomeCtrl
    })