
var resizeFunc;
var openDiagramEvent;
var LIBRARY_TP_WINDOW = "touchPoints";



angular.module('capacitiveTangibles', ['ngRoute', 'facebookUtils', 'ngMaterial'])

.directive( 'elemReady', function( $parse ) {
    return {
        restrict: 'A',
        link: function( $scope, elem, attrs ) {
            elem.ready(function(){
                $scope.$apply(function(){
                    var func = $parse(attrs.elemReady);
                    func($scope);
                })
            })
        }
    }
})



.controller('AppCtrl', function($scope, $mdDialog, $http, $mdSidenav, $mdUtil, $rootScope, facebookUser) {
    $scope.stage = new TangibleStage('tangibleContainer');
    $.couch.urlPrefix = "http://130.216.148.185:5984";
    $scope.db = $.couch.db("tangibles");
    $scope.logoutUrl = "https://www.facebook.com/logout.php?next=http:%2F%2F130.216.148.185:8000%2Fapp%2Findex.html&access_token=";// "https://www.facebook.com/dialog/oauth?client_id=123111638040234&display=popup&redirect_uri=http:%2F%2F130.216.148.185:5984%2F_fb";
    //$scope.loginUrl = "https://www.facebook.com/dialog/oauth?client_id=123111638040234&display=popup&redirect_uri=http:%2F%2F130.216.148.185:5984%2F_fb";
    $scope.tangibleController = new TangibleController($scope.stage, $scope.db.uri);
    $scope.currentUser = null;
    $scope.currentUser = {firstName: "Jack", lastName: "Bauer"};

    $.couch.session({
        success: function(data) {
            console.log(data);
        }
    });

    //$scope.watchLoginChange();

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
        {'name': 'Library', 'index': 4},
        {'name': 'Logout', 'index': 5}
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
                $scope.editLibrary(event);
                break;
            case 5:
                var userToken = ""; //TODO: get user token from couchdb
                location.href = $scope.logoutUrl + userToken;
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

        this.db.view("views/get_diagrams", {
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
        this.db.view("views/get_libraries", {
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

        $scope.db.saveDoc()
    };

    $scope.initTouchWindow = function() {
        $scope.touchPointsStage = new TangibleStage(LIBRARY_TP_WINDOW);

        //var resizeCallback = function() {
        //    console.log('Resized!')
        //};
        //
        //$(LIBRARY_TP_WINDOW).resize(resizeCallback);

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
    $scope.closeDialog = function() {
        $mdDialog.hide('');
    };

    $scope.editTangible = function (tangible, $event) {
        $scope.selectedTangible = tangible;

        var debounce = $mdUtil.debounce(function(){
            $mdSidenav('right')
                .toggle()
                .then(function () {
                    $scope.touchPointsStage.onResize();
                    console.log("Resizing touchPointsStage");
                });
        }, 200);

        debounce();
    };

    $scope.closeSideNav = function () {
        $mdSidenav('right').close()
            .then(function () {
                console.log("close RIGHT is done");
            });

        //destroyTouchWindow();
    };

});