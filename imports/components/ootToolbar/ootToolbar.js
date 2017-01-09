import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './ootToolbar.html';
import angularUiRouter from 'angular-ui-router';

class ToolbarCtrl{
  constructor($scope,$reactive){
    'ngInject';
    $reactive(this).attach($scope);
  }
}

const name = 'ootToolbar';
export default angular.module(name, [angularMeteor, 'ngMaterial', 'ui.router'])
    .component(name, {
        template: template,
        controllerAs: name,
        controller: ToolbarCtrl
    });
