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

        this.menuItems = [
            {'index': 1, 'name': 'New', icon: 'content:ic_add', component: tgNew.name, size: 'big'},
            {'index': 2, 'name': 'Open', icon: 'file:ic_folder_open', component: tgOpen.name, size: 'big'},
            {'index': 3, 'name': 'Save', icon: 'content:ic_save', func: this.saveDiagram.bind(this)},
            {'index': 4, 'name': 'Make a copy',  icon: 'content:ic_content_copy', component: tgCopy.name, size: 'small'},
            {'index': 5, 'name': 'Libraries', icon: 'av:ic_library_books', sref: 'home.libraries'},
            {'index': 6, 'name': 'Logout', icon: 'action:ic_power_settings_new',  sref: 'login'}
        ];

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

    navigateTo(menuItem, $event)
    {
        if('component' in menuItem)
        {
            DialogCtrl.open(this.$mdDialog, menuItem.component, $event, menuItem.size);
            SidenavCtrl.toggle('tg-menu', this.$mdSidenav, this.$mdUtil);
        }
        else if('sref' in menuItem)
        {
            this.$state.go(menuItem.sref);

            if(menuItem.sref != 'login')
            {
                SidenavCtrl.toggle('tg-menu', this.$mdSidenav, this.$mdUtil);
            }
        }
        else if('func' in menuItem)
        {
            menuItem.func();
            SidenavCtrl.toggle('tg-menu', this.$mdSidenav, this.$mdUtil);
        }
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