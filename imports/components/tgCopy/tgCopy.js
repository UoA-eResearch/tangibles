import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgCopy.html';
import {DialogCtrl} from '../tgDialog/tgDialog';
import 'pubsub-js/src/pubsub';

class CopyDiagramCtrl extends DialogCtrl {
    constructor($scope, $mdDialog, $const) {
        'ngInject';
        super($scope, $mdDialog, $const);
        this.diagramName = '';
    }

    copy($event)
    {
        PubSub.publish('copy', this.diagramName);
        this.close($event);
    }
}

const name = 'tgCopy';
export default angular.module(name, [
    angularMeteor
]).component(name, {
    template,
    controllerAs: name,
    controller: CopyDiagramCtrl
});
