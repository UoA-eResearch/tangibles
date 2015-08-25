
var resizeFunc;
var openDiagramEvent;



angular.module('capacitiveTangibles', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdDialog, $http, $mdSidenav, $mdUtil) {
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
                $scope.editLibrary(event);
                break;
        }
    };

    $scope.editLibrary = function(event)
    {
        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'library.tmpl.html',
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
        //initTouchWindow(container, width, height);
    };

    $scope.editTangible = function (tangible, $event) {
        $scope.selectedTangible = tangible;
        $mdSidenav('right').open();

        var containerID = 'touch-points';
        var container = document.getElementById(containerID);
        //container.addEventListener('onresize', function(){initTouchWindow(containerID);});
    };

    $scope.close = function () {
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
            });

        //destroyTouchWindow();
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

});

//
//function LibraryController($scope, $mdDialog, $http, $mdSidenav, $mdUtil) {
//
//    $http.get('libraries/oroo/tangibles.json').success(function(data) {
//        $scope.tangibles = data.tangibleLibrary;
//        console.log('1 tangible: ', $scope.tangibleController.tangibleLibrary);
//        console.log('Tangibles: ', data.tangibleLibrary)
//    });
//
//
//};