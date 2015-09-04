
var resizeFunc;
var openDiagramEvent;



angular.module('capacitiveTangibles', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdDialog, $http, $mdSidenav, $mdUtil) {
    $scope.stage = new TangibleStage('tangibleContainer');
    $.couch.urlPrefix = "http://192.168.1.13:5984";
    $scope.db = $.couch.db("test");
    $scope.tangibleController = new TangibleController($scope.stage, $scope.db.uri);

    $scope.db.openDoc('4af774d88562315b657fbeacc8000f79', {
        success: function(data) {
            $scope.tangibleController.loadTangibleLibrary(data);
        },
        error: function(status) {
            console.log(status);
        }}
    );

    //$scope.tangibleController.loadTangibleLibrary();

    //$("#diagram-file").change(function() {
    //    alert('changed!');
    //});

    $scope.menuItems = [
        {'name': 'New', 'index': 1},
        {'name': 'Open', 'index': 2},
        {'name': 'Save', 'index': 3},
        {'name': 'Save As', 'index': 4},
        {'name': 'Library', 'index': 5}
    ];

    $scope.menuAction = function(event, item) {
        switch(item.index) {
            case 1:
                $scope.showDiagramTypes();
                break;
            case 2:
                $scope.showDiagrams();
                break;
            case 3:
                $scope.saveDiagram();
                break;
            case 4:
                break;
            case 5: //Register tangible
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

    $scope.showDiagrams = function(event) {

        this.db.view("tangibles/get_diagrams", {
            success: function(data) {
                $scope.tangibleController.loadDiagrams(data);
                $mdDialog.show({
                    scope: $scope.$new(),
                    templateUrl: 'open.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event
                });
            },
            error: function(status) {
                console.log(status);
            },
            reduce: false
        });
    };

    $scope.openDiagram = function(diagram, event)
    {
        $scope.db.openDoc(diagram.library_id, {
            success: function(data) {
                $scope.tangibleController.loadTangibleLibrary(data);

                $scope.db.openDoc(diagram.id, {
                    success: function(data) {
                        $scope.tangibleController.openDiagram(data);
                    },
                    error: function(status) {
                        console.log(status);
                    }});

                $mdDialog.cancel();
            },
            error: function(status) {
                console.log(status);
            }}
        );
    };

    $scope.showDiagramTypes = function() {
        this.db.view("tangibles/get_libraries", {
            success: function(data) {
                $scope.tangibleController.loadLibraries(data);

                $mdDialog.show({
                    scope: $scope.$new(),
                    templateUrl: 'new.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event
                });
            },
            error: function(status) {
                console.log(status);
            },
            reduce: false
        });
    };

    $scope.newDiagram = function(library, event) {
        $scope.db.openDoc(library.id, {
            success: function(data) {
                $scope.tangibleController.clear();
                $scope.tangibleController.loadTangibleLibrary(data);
                $mdDialog.cancel();
            },
            error: function(status) {
                console.log(status);
            }}
        );
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