
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
    $scope.libraries = [];
    $scope.userDb = null;
    $scope.currentUser = null;
    $scope.tangibleController = null;
    $.couch.urlPrefix = "http://localhost:5984";
    $scope.stage = new TangibleStage('tangibleContainer');
    $scope.logoutUrl = "https://www.facebook.com/logout.php?next=http:%2F%2Flocalhost:63342%2Fcapacitive-tangibles%2Fapp&access_token=";

    //Enables cross domain on jquery couchdb API
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true
    });

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
                $scope.showNewDiagramPopup(event);
                break;
            case 2:
                $scope.showOpenDiagramPopup(event);
                break;
            case 3:
                $scope.saveDiagram();
                break;
            case 4:
                $scope.showEditLibraryPopup(event);
                break;
            case 5:
                location.href = $scope.logoutUrl + $scope.currentUser.token;
        }
    };

    $scope.initialiseUser = function(userName)
    {
        var users = $.couch.db("_users");
        users.openDoc("org.couchdb.user:" + userName, {
                success: function (data) {
                    $scope.currentUser = {userName: userName, firstName: userName, lastName: userName, token: data.facebook.access_token};
                    $scope.userDb = $.couch.db(userName);
                    $scope.tangibleController = new TangibleController($scope.stage, $scope.userDb.uri);
                    $scope.userDb.openDoc('4af774d88562315b657fbeacc8000f79', {
                            success: function (data) {
                                $scope.tangibleController.loadTangibleLibrary(data);
                            },
                            error: function (status) {
                                console.log(status);
                            }
                        }
                    );
                },
                error: function (status) {
                    console.log(status);
                }
            }
        );
    };

    $scope.showEditLibraryPopup = function(event)
    {
        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'library.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event
        });
    };

    $scope.showOpenDiagramPopup = function(event) {
        $scope.userDb.view("views/get_diagrams", {
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

    $scope.showNewDiagramPopup = function(event) {
        this.userDb.view("views/get_libraries", {
            success: function(data) {
                //$scope.tangibleController.libraries = data.rows;
                $scope.libraries.length = 0;

                for(var i=0; i < data.rows.length; i++)
                {
                    var item = data.rows[i].key;
                    item.thumb = $scope.userDb.db_uri + '/' + item.id + '/' + item.thumb;
                    $scope.libraries.push(item);
                }

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

    $scope.openDiagram = function(diagramId, libraryId, event)
    {
        $scope.userDb.openDoc(libraryId, {
            success: function(data) {
                $scope.tangibleController.loadTangibleLibrary(data);

                $scope.userDb.openDoc(diagramId, {
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

    $scope.newDiagram = function(library, event) {
        $scope.userDb.openDoc(library.id, {
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
        var diagram = $scope.tangibleController.getDiagramDoc();

        $scope.userDb.saveDoc(diagram, {
            success: function(data) {
                $scope.openDiagram(diagram._id, diagram.libraryId);
                console.log(data);
            },
            error: function(status) {
                console.log(status);
            }
        });


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
        $scope.selectedTangible = JSON.parse(JSON.stringify(tangible));

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

    $.couch.session({
        success: function(data) {
            if(data.userCtx.name != null)
            {
                $scope.initialiseUser(data.userCtx.name);
            }
            else
            {
                location.href = "http://localhost:63342/capacitive-tangibles/app/index.html";
            }
        }
    });
});