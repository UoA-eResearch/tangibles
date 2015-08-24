
var resizeFunc;
var openDiagramEvent;



angular.module('capacitiveTangibles', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdDialog, $http) {
    $scope.stage = new TangibleStage('tangibleContainer');
    $scope.tangibleController = new TangibleController($scope.stage);
    $scope.tangibleController.loadTangibleLibrary('http://130.216.148.185:8000/app/libraries/oroo/tangibles.json');

    //$("#diagram-file").change(function() {
    //    alert('changed!');
    //});

    $scope.menuItems = [
        {'name': 'New', 'index': 1},
        {'name': 'Open', 'index': 2},
        {'name': 'Save', 'index': 3},
        {'name': 'Library', 'index': 4}
    ];

    $scope.menuAction = function(event, item) {
        switch(item.index) {
            case 1:
                $scope.newDiagram();
                break;
            case 2:
                openDiagramEvent = event;
                $('#diagram-file').trigger('click');
                break;
            case 3:
                $scope.saveDiagram();
                break;
            case 4: //Register tangible
                $scope.openRegisterDialog(event);
                break;
        }
    };

    $scope.openRegisterDialog = function(event)
    {
        $mdDialog.show({
            controller: LibraryController,
            templateUrl: 'dialog2.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event
        });
    };

    $scope.openDiagram = function(event) {
        var file = document.getElementById('diagram-file').files[0];
        var reader = new FileReader();
        reader.onloadend = $scope.tangibleController.openDiagram.bind($scope.tangibleController, $scope, openDiagramEvent);
        reader.readAsText(file/*, "UTF-8"*/);
        $("#diagram-file").replaceWith($("#diagram-file").clone(true)); //Clears file input field so file will be read again.
    };

    $scope.newDiagram = function() {
        $scope.tangibleController.clear();
    };

    $scope.saveDiagram = function() {
        $scope.tangibleController.saveDiagram();
    };

    /**
     *
     * @param event:
     * @param title:
     * @param content:
     */

    $scope.showAlert = function(event, title, content) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(title)
                .content(content)
                .ariaLabel(title)
                .ok('OK')
                .targetEvent(event)
        );
    };

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



