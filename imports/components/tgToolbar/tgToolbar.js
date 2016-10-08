import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgToolbar.html';
import angularUiRouter from 'angular-ui-router';
import {DialogCtrl} from '../tgDialog/tgDialog';
import tgNew from '../tgNew/tgNew.js';
import tgOpen from '../tgOpen/tgOpen.js';
import tgCopy from '../tgCopy/tgCopy.js';
import {SidenavCtrl} from '../tgSidenav/tgSidenav';
import 'pubsub-js/src/pubsub';


class ToolbarCtrl {
    constructor($scope, $const, $state, $mdDialog, $mdUtil, $mdSidenav, $tgSharedData) {
        'ngInject';
        $scope.viewModel(this);
        this.$const = $const;
        this.sharedData = $tgSharedData.data;
        this.$state = $state;
        this.$mdDialog = $mdDialog;
        this.$mdUtil = $mdUtil;
        this.$mdSidenav = $mdSidenav;
        this.$scope = $scope;
        this.tgNew = tgNew;
        this.tgOpen = tgOpen;
        this.tgCopy = tgCopy;

        this.updateNameSub = PubSub.subscribe('updateName', this.updateName.bind(this));
        $scope.$on("$destroy", this.destroy.bind(this));
    }

    updateName(msg, data)
    {
        this.$scope.$apply();
    }

    destroy()
    {
        PubSub.unsubscribe(this.updateNameSub);
    }

    openDialog(component, $event, size)
    {
        DialogCtrl.open(this.$mdDialog, component, $event, size);
        SidenavCtrl.toggle('tg-menu', this.$mdSidenav, this.$mdUtil);
    }

    navigateTo(sref, $event)
    {
        this.$state.go(sref);

        if(sref != 'login')
        {
            SidenavCtrl.toggle('tg-menu', this.$mdSidenav, this.$mdUtil);
        }
    }

    isLoggedIn()
    {
        return Meteor.userId() != null;
    }

    deleteTangible()
    {
        PubSub.publishSync('delete', 0);
    }

    deleteAll()
    {
        PubSub.publishSync('deleteAll', 0);
    }

    zoomIn()
    {
        PubSub.publishSync('zoomIn', 0);
    }

    zoomOut()
    {
        PubSub.publishSync('zoomOut', 0);
    }

    bringForward()
    {
        PubSub.publishSync('bringForward', 0);
    }

    sendBackward()
    {
        PubSub.publishSync('sendBackward', 0);
    }

    bringToFront()
    {
        PubSub.publishSync('bringToFront', 0);
    }

    sendToBack()
    {
        PubSub.publishSync('sendToBack', 0);
    }

    saveDiagram()
    {
        PubSub.publishSync('save', 0);
        SidenavCtrl.toggle('tg-menu', this.$mdSidenav, this.$mdUtil);
    }

    openMenu()
    {
        SidenavCtrl.toggle('tg-menu', this.$mdSidenav, this.$mdUtil);
    }
}

const name = 'tgToolbar';
export default angular.module(name, [angularMeteor, 'ngMaterial', 'ui.router', tgNew.name, tgCopy.name, tgOpen.name])
    .component(name, {
        template,
        controllerAs: name,
        controller: ToolbarCtrl
    });
