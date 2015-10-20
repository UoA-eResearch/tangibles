
var resizeFunc;
var openDiagramEvent;
var LIBRARY_TP_WINDOW = "touchPoints";
var fuckenWidth = 10;
var stage;


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
    $.couch.urlPrefix = "http://" + domain + ":" + dbPort;
    $scope.stage = new TangibleStage('tangibleContainer');
    $scope.logoutUrl = "https://www.facebook.com/logout.php?next=http:%2F%2F" + domain + ":" + appPort + "%2Fapp&access_token=";



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

    $scope.loadDefaultLib = function(userName)
    {
        $scope.userDb.openDoc('4af774d88562315b657fbeacc8000f79', {
                success: function (data) {
                    $scope.tangibleController.loadTangibleLibrary(data);
                },
                error: function (status) { //If oroo library doesn't exist then replicate
                    console.log(status);

                    $.couch.replicate(publicDb, userName, {
                        success: function(data) {
                            console.log(data);
                            $scope.loadDefaultLib(userName);
                        },
                        error: function(status) {
                            console.log(status);
                        }
                    }, {continuous: true});
                }
            }
        );
    };

    $scope.initialiseUser = function(userName)
    {
        var users = $.couch.db("_users");
        users.openDoc("org.couchdb.user:" + userName, {
                success: function (data) {
                    $scope.currentUser = {userName: userName, firstName: userName, lastName: userName, token: data.facebook.access_token};
                    $scope.userDb = $.couch.db(userName);
                    $scope.tangibleController = new TangibleController($scope.stage, $scope.userDb.uri);
                    $scope.loadDefaultLib(userName);
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
        //
        //var width = 1000;
        //var height = 1000;
        //
        //$scope.editLibStage = new Konva.Stage({
        //    container: LIBRARY_TP_WINDOW,
        //    width: width,
        //    height: height
        //});
        //
        //$scope.layer = new Konva.Layer();
        //$scope.editLibStage.add($scope.layer);
        $scope.editLibStage = new TangibleStage(LIBRARY_TP_WINDOW);
        //$scope.editLibStage.drawTouchPoints($scope.selectedTangible.registrationPoints);


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

        $scope.editLibStage.clear();
        $scope.editLibStage.draw();

        //$scope.$watch($mdSidenav('right').isClosed(), function() {
        //    //if ($mdSidenav('right').isOpen()) {
        //        console.log('CLOSEDDDDDDDDDDDDD');
        //    //}
        //}, true);

        //var img = new Image();
        //
        //img.src = $scope.userDb.uri + $scope.selectedLibrary._id + '/' + $scope.selectedTangible.image;
        //img.crossOrigin="use-credentials";
        //img.onload = function() {
        //    $scope.selectedVisual = new Konva.Image({
        //        x: 300,
        //        y: 300 / 2,
        //        image: img,
        //        width: tangible.width * tangible.scale,
        //        height: tangible.height * tangible.scale,
        //        offsetX: (tangible.width * tangible.scale) /2,
        //        offsetY: (tangible.height * tangible.scale)/2
        //    });
        //
        //    var hammerStartAngle = 0;
        //    var hammer = Hammer($scope.selectedVisual);
        //    hammer.on("transformstart",
        //        function(event){
        //            hammerStartAngle = $scope.selectedVisual.rotation();
        //        }).on("transform",
        //        function(event){
        //            $scope.selectedVisual.rotation((hammerStartAngle || 0) + event.gesture.rotation);
        //            $scope.layer.draw();
        //        });
        //
        //    $scope.layer.add($scope.selectedVisual);
        //    $scope.layer.draw();
        //};

        var debounce = $mdUtil.debounce(function(){
            $mdSidenav('right')
                .toggle()
                .then(function () {




                    //if($mdSidenav('right'))
                    //{
                        $scope.editLibStage.onResize();
                        $scope.selectedTangibleVisual = new Tangible($scope.selectedTangible.id, $scope.selectedTangible.name, $scope.selectedTangible.scale, $scope.selectedTangible.startAngle, $scope.userDb.uri + $scope.selectedLibrary._id + '/' + $scope.selectedTangible.image, [], $scope.loadEditTangible)
                        console.log("OPEN");
                    //}
                    //else
                    //{
                        //.log("CLOSE");
                        //$scope.editLibStage.clear();
                        //$scope.editLibStage.draw();
                    //}
                });
        }, 200);

        debounce();
    };

    $scope.loadEditTangible = function(){
        //$scope.selectedTangibleVisual.setOrientation(0);
        $scope.selectedTangibleVisual.setPosition(new Point($scope.editLibStage.width/2, $scope.editLibStage.height/2));
        $scope.editLibStage.addTangible($scope.selectedTangibleVisual);
        $scope.editLibStage.draw();

        $scope.$watch('selectedTangible.scale', function() {
            console.log('selectedTangible.scale: ', $scope.selectedTangible.scale);

            $scope.selectedTangibleVisual.setScale($scope.selectedTangible.scale);
            $scope.selectedTangibleVisual.setPosition(new Point($scope.editLibStage.width/2, $scope.editLibStage.height/2));
            $scope.editLibStage.draw();
        }, true);

        $scope.$watch('selectedTangible.startAngle', function() {
            console.log('selectedTangible.startAngle: ', $scope.selectedTangible.startAngle);
            $scope.selectedTangibleVisual.startAngle = $scope.selectedTangible.startAngle;
            $scope.selectedTangibleVisual.setOrientation(0);
            $scope.selectedTangibleVisual.setPosition(new Point($scope.editLibStage.width/2, $scope.editLibStage.height/2));
            $scope.editLibStage.draw();
        }, true);
    };

    $scope.closeSideNav = function () {
        $mdSidenav('right').close()
            .then(function () {
                $scope.editLibStage.clear();
                $scope.editLibStage.draw();
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
                location.href = "http://" + domain + ":" + appPort + "/app/index.html";
            }
        }
    });

        //console.log('Side: ', $mdSidenav('right'));


});