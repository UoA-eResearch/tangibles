import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularUiRouter from 'angular-ui-router';
import template from './ootHome.html';

class HomeCtrl {
  constructor($scope,$reactive,$state){
    'ngInject';
    $reactive(this).attach($scope);
    //$scope.viewModel(this);

    $scope.levels = [
      {stateName:"levelOne",title:"Level 1: Classes",description:""},
      {stateName:"levelTwo",title:"Level 2: Class Creation",description:""},
      {stateName:"levelThree",title:"Level 3: Object Instantiation",description:""}
    ];

    $scope.goToLevel = function(level){
      $state.go(level.stateName);
    };

  }
}

const name = 'ootHome';
export default angular.module('ootHome', [angularMeteor,angularUiRouter])
  .component(name, {
    template: template,
    controllerAs: name,
    controller: HomeCtrl
  })
