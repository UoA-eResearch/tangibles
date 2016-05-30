import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import angularUiRouter from 'angular-ui-router';
import login from '../imports/components/tgLogin/tgLogin'
import home from '../imports/components/tgHome/tgHome';
import diagram from '../imports/components/tgDiagram/tgDiagram';
import libraries from '../imports/components/tgLibraries/tgLibraries';
import entries from 'object.entries';
import {SharedData} from '../imports/components/tgSharedData/tgSharedData';
import 'pubsub-js/src/pubsub';

if (!Object.entries) {
    entries.shim();
}

angular.module('tangibles', [angularMeteor, ngMaterial, 'ui.router', home.name, diagram.name, login.name, libraries.name])
    .constant("$const", {
        "APP": "Tangibles",
        "NEW": "New diagram",
        "OPEN": "Open diagram",
        "RENAME": "Rename diagram",
        "COPY": "Copy diagram",
        "LIBRARIES": "Libraries",
        "LIBRARY": "Library",
        "DEFAULT_LIBRARY_ID": "M5q3SwPNcgCCKDWQL"
    })
    .config(function ($mdThemingProvider, $mdIconProvider, $stateProvider, $urlRouterProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('light-green');

        $mdIconProvider
            .icon('tg:tangibles', '/images/stamp.svg')
            .icon('tg:to_front', '/images/to_front.svg')
            .icon('tg:to_back', '/images/to_back.svg')
            .iconSet("file", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-file.svg")
            .iconSet("action", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg")
            .iconSet("hardware", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-hardware.svg")
            .iconSet("content", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-content.svg")
            .iconSet("navigation", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-navigation.svg")
            .iconSet("av", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-av.svg");

        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state('login', {
                url: "/login",
                views: {
                    'main-view': {
                        component: login.name
                    }
                }
            })
            .state('home', {
                url: "/home",
                abstract: true,
                views: {
                    'main-view': {
                        component: home.name
                    }
                }
            })
            .state('home.diagram', {
                url: "/diagram/:diagramId/:isNewDiagram/:libraryId",
                views: {
                    'home-view': {
                        component: diagram.name
                    }
                },
                onEnter: ['$tgSharedData', function ($tgSharedData) {
                    $tgSharedData.data.stateName = 'home.diagram';
                }],
                resolve: {
                    libraries: ['$rootScope', function ($rootScope) {
                        return $rootScope.subscribe('libraries');
                    }],
                    images: ['$rootScope', function ($rootScope) {
                        return $rootScope.subscribe('images');
                    }],
                    diagrams: ['$rootScope', function ($rootScope) {
                        return $rootScope.subscribe('diagrams');
                    }]
                }
            }).state('home.libraries', {
                url: "/libraries",
                views: {
                    'home-view': {
                        component: libraries.name
                    }
                },
                onEnter: ['$tgSharedData', function ($tgSharedData) {
                    $tgSharedData.data.stateName = 'home.libraries';
                }]
            });
    }).factory('$tgSharedData', function() {
        var service = {
            data: {
                stateName: '',
                diagramName: ''
            }
        };
        return service;
    });