import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularUiRouter from 'angular-ui-router';
import template from './ootLevelOne.html';
import ootToolbar from '../ootToolbar/ootToolbar';

class LevelOneCtrl {
  constructor($scope,$reactive){
    'ngInject';
    $reactive(this).attach($scope);
  }
}

const name = 'ootLevelOne';
export default angular.module(name, [angularMeteor, ootToolbar.name])
  .component(name, {
    template: template,
    controllerAs: name,
    controller: LevelOneCtrl
  })
