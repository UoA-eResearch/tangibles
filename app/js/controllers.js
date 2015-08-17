'use strict';

function Point(x, y) {
    this.x = x;
    this.y = y;
}


/* Controllers */

var stage;
var touchPointsLayer;
var touchPoints;
var resizeFunc;

$(window).resize(function() {
    if(stage != null)
    {
        var rect = document.getElementById('touch-points').getBoundingClientRect();
        stage.setWidth(rect.right - rect.left);
        stage.setHeight(rect.bottom - rect.top);
        console.log('Resizing stage', rect);
    }
});

angular.module('capacitiveTangibles', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdDialog, $http) {
    $scope.menuItems = [
        {'name': 'New', 'index': 1},
        {'name': 'Open', 'index': 2},
        {'name': 'Save', 'index': 3},
        {'name': 'Library', 'index': 4}
    ];

    $scope.menuAction = function(event, item) {
        switch(item.index) {
            case 1:
                newDiagram();
                break;
            case 2:
                openDiagram();
                break;
            case 3:
                saveDiagram();
                break;
            case 4: //Register tangible
                this.openRegisterDialog(event);
                break;
        }
    };

    $scope.openRegisterDialog = function(event)
    {
        $mdDialog.show({
            controller: LibraryController,
            templateUrl: 'dialog2.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        });
    };

    $scope.openDiagram = function() {

    };

    $scope.newDiagram = function() {

    };

    $scope.saveDiagram = function() {

    };
});

function LibraryController($scope, $mdDialog, $http, $mdSidenav, $mdUtil) {


    $http.get('libraries/oroo/tangibles.json').success(function(data) {
        $scope.tangibles = data.tangibles;
        console.log('Tangibles: ', data.tangibles)
    });

    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };

    $scope.initTouchWindow = function() {
        var container = 'touch-points';
        var width = window.innerWidth;
        var height = window.innerHeight;
        initTouchWindow(container, width, height);
    };

    $scope.editTangible = function (tangible, $event) {
        $scope.selectedTangible = tangible;
        $mdSidenav('right').open();

        var containerID = 'touch-points';
        var container = document.getElementById(containerID);
        container.addEventListener('onresize', function(){initTouchWindow(containerID);});
    };

    $scope.close = function () {
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
            });

        destroyTouchWindow();
    };

    $scope.toggleRight = buildToggler('right');

    function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        },300);
        return debounceFn;
    }
}

function initMainStage()
{
    var rect = document.getElementById(containerID).getBoundingClientRect();
    console.log('Rect', rect);

    stage = new Kinetic.Stage({
        container: containerID,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
    });
}

function initTouchWindow(containerID)
{
    var rect = document.getElementById(containerID).getBoundingClientRect();
    console.log('Rect', rect);

    stage = new Kinetic.Stage({
        container: containerID,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
    });

    touchPointsLayer = new Kinetic.Layer();
    stage.add(touchPointsLayer);

    stage.getContent().addEventListener('touchstart', function(event) {
        touchPoints = getTouchPoints(event);
        drawTouchPoints(touchPoints);
    });
}

function destroyTouchWindow()
{
    if(state != null)
    {
        stage.destroy();
    }

    if(touchPointsLayer != null)
    {
        touchPointsLayer.destroy();
    }

    var container = document.getElementById('touch-points');
    removeResizeListener(container, resizeFunc);
}



