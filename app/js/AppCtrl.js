
var resizeFunc;
var openDiagramEvent;
var LIBRARY_TP_WINDOW = "touchPoints";
var fuckenWidth = 10;
var stage;

angular.module('capacitiveTangibles', ['ngMaterial', 'naif.base64'])

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
    $scope.newImages = {};
    $scope.file = {};
    $scope.touchPointsError = " ";

    $scope.userDb = null;
    $scope.currentUser = null;
    $scope.tangibleController = null;
    $.couch.urlPrefix = "https://" + domain + ":" + dbPort;
    $scope.stage = new TangibleStage('tangibleContainer');
    $scope.logoutUrl = "https://www.facebook.com/logout.php?next=https:%2F%2F" + domain + "&access_token=";

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
        $scope.userDb.openDoc('4af774d88562315b657fbeacc8000f79', {attachments: true}, {
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
                    $scope.$apply();
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
            $scope.userDb.openDoc(library._id, {attachments: true}, {
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
        $scope.selectedLibrary.tangibles.push({"id": $.couch.newUUID(), "name": "Untitled", "scale": 1, "startAngle": 0, "image": "", "registrationPoints":[]})
    };

    $scope.removeTangible = function(tangible)
    {
        var i = $scope.selectedLibrary.tangibles.indexOf(tangible);
        if(i != -1) {
            $scope.selectedLibrary.tangibles.splice(i, 1);
        }
    };

    $scope.saveLibrary = function () {

        $scope.selectedLibrary["thumb"] = "015_leaves.png";

        $scope.userDb.saveDoc($scope.selectedLibrary, {
            success: function (data) {
                $scope.closeDialog();
                console.log(data);
            },
            error: function (status) {
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
        $scope.userDb.openDoc(libraryId, {attachments: true}, {
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
        $scope.userDb.openDoc(library._id,  {attachments: true}, {
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

        html2canvas($("#tangibleContainer")).then(function(canvas) {
            var thumbWidth = 100;
            var scale = thumbWidth / $scope.stage.width;
            var imageData = Canvas2Image.convertToImage(canvas, thumbWidth, $scope.stage.height * scale).currentSrc.slice(22);
            diagram._attachments = {'thumb.png': {content_type: "image/png", data: imageData}};

            $scope.userDb.saveDoc(diagram, {
                success: function(data) {
                    $scope.openDiagram(diagram._id, diagram.libraryId);
                    console.log(data);
                },
                error: function(status) {
                    console.log(status);
                }
            });

        });
    };

    $scope.initTouchWindow = function() {
        $scope.editLibStage = new TangibleStage(LIBRARY_TP_WINDOW);
        $scope.editLibStage.onTouchCallback = function(touchPoints)
        {
            if(touchPoints.length == 3 && $scope.editLibStage.enable)
            {
                $scope.selectedTangible.registrationPoints = fromPoints(touchPoints);
                $scope.editLibStage.enable = false;
            }

            if(touchPoints.length != 3)
            {
                $scope.touchPointsError = "Three touch points are required.";
            }
            else
            {
                $scope.touchPointsError = " ";
            }

            $scope.$apply();
        };
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

        var debounce = $mdUtil.debounce(function(){
            $mdSidenav('right')
                .toggle()
                .then(function () {
                    $scope.editLibStage.onResize();
                    $scope.editLibStage.enable = false;

                    var attachment = $scope.selectedLibrary._attachments[$scope.selectedTangible.image];
                    var data = null;
                    if(attachment != undefined)
                    {
                        data = attachment.data;
                    }

                    $scope.selectedTangibleVisual = new Tangible($scope.selectedTangible.id, $scope.selectedTangible.name, $scope.selectedTangible.scale, $scope.selectedTangible.startAngle, data, [], $scope.loadEditTangible);

                    var regPoints = toPoints($scope.selectedTangible.registrationPoints);
                    $scope.editLibStage.clear();
                    if(regPoints.length > 0)
                    {
                        var curCentre = Tangible.getCentroid(regPoints);
                        var newCentre = new Point($scope.editLibStage.width/2, $scope.editLibStage.height/2);
                        var offset = newCentre.subtract(curCentre);

                        for(var i = 0; i < regPoints.length; i++)
                        {
                            regPoints[i] = regPoints[i].add(offset);
                        }

                        $scope.editLibStage.drawTouchPoints(regPoints);
                    }
                });
        }, 200);

        debounce();
    };

    $scope.imageUploaded = function(file, base64_object)
    {
        var deferred = $q.defer();

        delete $scope.selectedLibrary._attachments[$scope.selectedTangible.image];
        $scope.selectedTangible.image = base64_object.filename;
        $scope.selectedLibrary._attachments[$scope.selectedTangible.image] = {content_type: "image/png", data: base64_object.base64};
        $scope.selectedTangibleVisual.setImageData(base64_object.base64);

        return deferred.promise;
    };

    $scope.loadEditTangible = function(){
        $scope.selectedTangibleVisual.setOrientation(0);
        $scope.selectedTangibleVisual.setPosition(new Point($scope.editLibStage.width/2, $scope.editLibStage.height/2));
        $scope.selectedTangibleVisual.setTouchEnabled(false);
        $scope.editLibStage.addTangible($scope.selectedTangibleVisual);
        $scope.editLibStage.draw();

        $scope.$watch('selectedTangible.scale', function() {

            var scale = 1;
            if($scope.selectedTangible.scale != undefined)
            {
                scale = $scope.selectedTangible.scale;
            }

            console.log('selectedTangible.scale: ', scale);

            $scope.selectedTangibleVisual.setScale(scale);
            $scope.selectedTangibleVisual.setPosition(new Point($scope.editLibStage.width/2, $scope.editLibStage.height/2));
            $scope.editLibStage.draw();
        }, true);

        $scope.$watch('selectedTangible.startAngle', function() {

            var startAngle = 0;
            if($scope.selectedTangible.startAngle != undefined)
            {
                startAngle = $scope.selectedTangible.startAngle;
            }

            console.log('selectedTangible.startAngle: ', startAngle);

            $scope.selectedTangibleVisual.startAngle = startAngle;
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

    $.couch.session({
        success: function(data) {
            if(data.userCtx.name != null)
            {
                $scope.initialiseUser(data.userCtx.name);
            }
            else
            {
                location.href = "https://" + domain;
            }
        }
    });
});