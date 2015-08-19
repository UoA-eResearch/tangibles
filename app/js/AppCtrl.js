
var resizeFunc;

var stage = new TangibleStage('tangibleContainer');
var tangibleController = new TangibleController(stage);

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

    this.tangibleController.loadTangibleLibrary('http://localhost:63342/capacitive-tangibles/app/libraries/oroo/tangibles.json');
});



//function initMainStage()
//{
//    var rect = document.getElementById(containerID).getBoundingClientRect();
//    console.log('Rect', rect);
//
//    stage = new Kinetic.Stage({
//        container: containerID,
//        width: rect.right - rect.left,
//        height: rect.bottom - rect.top
//    });
//}
//
//function initTouchWindow(containerID)
//{
//    var rect = document.getElementById(containerID).getBoundingClientRect();
//    console.log('Rect', rect);
//
//    stage = new Kinetic.Stage({
//        container: containerID,
//        width: rect.right - rect.left,
//        height: rect.bottom - rect.top
//    });
//
//    touchPointsLayer = new Kinetic.Layer();
//    stage.add(touchPointsLayer);
//
//    stage.getContent().addEventListener('touchstart', function(event) {
//        touchPoints = getTouchPoints(event);
//        drawTouchPoints(touchPoints);
//    });
//}
//
//function destroyTouchWindow()
//{
//    if(state != null)
//    {
//        stage.destroy();
//    }
//
//    if(touchPointsLayer != null)
//    {
//        touchPointsLayer.destroy();
//    }
//
//    var container = document.getElementById('touch-points');
//    removeResizeListener(container, resizeFunc);
//}



