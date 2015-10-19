
var resizeFunc;
var openDiagramEvent;
var LIBRARY_TP_WINDOW = "touchPoints";



angular.module('capacitiveTangibles', ['ngRoute', 'facebookUtils', 'ngMaterial', 'naif.base64'])

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

.controller('AppCtrl', function($scope, $mdDialog, $http, $mdSidenav, $mdUtil, $q) {
    $scope.libraries = [];
    $scope.selectedLibrary = null;
    $scope.selectedTangible = null;
    $scope.newImages = [];
    $scope.file = {};

    $scope.userDb = null;
    $scope.currentUser = null;
    $scope.tangibleController = null;
    $.couch.urlPrefix = "http://130.216.148.185:5984";
    $scope.stage = new TangibleStage('tangibleContainer');
    $scope.logoutUrl = "https://www.facebook.com/logout.php?next=http:%2F%2F130.216.148.185:63342%2Fapp&access_token=";

    //Enables cross domain on jquery couchdb API
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true
    });

    $scope.triggerImageUpload = function()
    {
        $('#file').trigger('click');
    };

    $scope.imageUploaded = function(file, base64_object)
    {
        var deferred = $q.defer();

        $scope.newImages.push({key: $scope.selectedTangible.id, value: base64_object.base64});
        $("#tangibleImage").attr('src', 'data:image/png;base64,' + base64_object.base64);
        return deferred.promise;
       // $scope.file = {};
    };

    $scope.menuItems = [
        {'name': 'New', 'index': 1},
        {'name': 'Open', 'index': 2},
        {'name': 'Save', 'index': 3},
        {'name': 'Libraries', 'index': 4},
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
                $scope.showLibrariesPopup(event);
                //$scope.showEditLibraryPopup(event);
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

    $scope.showEditLibraryPopup = function(library, event)
    {
        if(library == null)
        {
            $scope.selectedLibrary = {"name": "Untitled library", "tangibles": [], "type": "library"};
            $mdDialog.hide();
            $mdDialog.show({
                scope: $scope.$new(),
                templateUrl: 'library.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event
            });
        }
        else
        {
            $scope.userDb.openDoc(library.id, {
                success: function(data) {
                    $scope.selectedLibrary = data;
                    $mdDialog.hide();
                    $mdDialog.show({
                        scope: $scope.$new(),
                        templateUrl: 'library.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: event
                    });

                },
                error: function(status) {
                    console.log(status);
                }}
            );
        }



    };

    $scope.addTangible = function()
    {
        $scope.selectedLibrary.tangibles.push({"id": $.couch.newUUID(), "name": "Untitled", "scale": 1.0, "startAngle": 90, "image": "", "registrationPoints":[]})
    };

    $scope.removeTangible = function(tangible)
    {
        var i = $scope.selectedLibrary.tangibles.indexOf(tangible);
        if(i != -1) {
            $scope.selectedLibrary.tangibles.splice(i, 1);
        }
    };

    $scope.saveLibrary = function () {
        $scope.userDb.saveDoc($scope.selectedLibrary, {
            success: function(data) {
                $scope.closeDialog();
                console.log(data);
            },
            error: function(status) {
                $scope.closeDialog();
                console.log(status);
            }
        });
    };

    $scope.showLibrariesPopup = function(event)
    {
        $scope.userDb.view("views/get_libraries", {
            success: function(data) {
                $scope.libraries.length = 0;

                for(var i=0; i < data.rows.length; i++)
                {
                    var item = data.rows[i].key;
                    $scope.libraries.push(item);
                }

                $mdDialog.show({
                    scope: $scope.$new(),
                    templateUrl: 'libraries.tmpl.html',
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
        //if()

        $scope.touchPointsStage = new TangibleStage(LIBRARY_TP_WINDOW);
        //$scope.touchPointsStage.drawTouchPoints($scope.selectedTangible.registrationPoints);


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

    $scope.confirmDeleteTangible = function(tangible, event) {
        var confirm = $mdDialog.confirm()
                .title('Delete ' + tangible.name + "?")
                .content('Are you sure you want to delete the tangible ' + tangible.name)
                .ariaLabel('Secondary click demo')
                .ok('Delete')
                .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
            console.log('delete');
        }, function() {
            console.log('cancel');
        });
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