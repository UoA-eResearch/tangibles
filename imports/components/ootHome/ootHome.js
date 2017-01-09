import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularUiRouter from 'angular-ui-router';
import template from './ootHome.html';

class HomeCtrl {
  constructor($scope,$reactive,$state){
    'ngInject';
    $reactive(this).attach($scope);
    //$scope.viewModel(this);
  }
}

const name = 'ootHome';
export default angular.module('ootHome', [angularMeteor,angularUiRouter])
  .component(name, {
    template: template,
    controllerAs: name,
    controller: HomeCtrl
  })
