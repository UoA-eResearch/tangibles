
var resizeFunc;
var openDiagramEvent;
var LIBRARY_TP_WINDOW = "touchPoints";



angular.module('capacitiveTangibles', ['ngRoute', 'facebookUtils', 'ngMaterial'])

.constant('facebookConfigSettings', {
    'appID' : '123111638040234',
    'oauth' : true
})

//.config(function (ezfbProvider) {
//    ezfbProvider.setInitParams({
//        appId: '123111638040234',
//        version: 'v2.3'
//    });
//})

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
    $scope.loggedInUser = {};

    //ezfb.api('/me', function (res) {
    //    $scope.loggedInUser = res;
    //});

    $rootScope.$on('fbLoginSuccess', function(name, response) {
        var uid = response.authResponse.userID;
        var accessToken = response.authResponse.accessToken;
        console.log('uid: ', uid);
        console.log('accessToken: ', accessToken);
        console.log('resp: ', response.authResponse);
        console.log('code: ', response.authResponse.signedRequest.code);

        facebookUser.then(function(user) {
            console.log(user);

            user.api('/me').then(function(response) {
                var request = new XMLHttpRequest();
                request.open("GET", "http://192.168.1.11:5984/_fb?code=" + response.authResponse.signedRequest, true);

                http://192.168.1.11:5984/_fb?code="Db2ROr6alkwWtVpWyfHYI7vUVcfSrlZbgK6_-a6J3jQ.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiJBUUFUV1hjYkFJU0lFTUFUQWxtRnl1cUF4bmVOeGotUnh6amplU0tNY21pSldJM28zSTUtUkRpSzQtWWR5b0gwUk55RUtwR2xhcGFPcDgwQnJuVzlEWDZpUkJVRFRZeVlaTVZBZjVCMUJIcmtFenlGd3ZrMV9tdVhXTzUxX25NNWYwZkttV3p5RGJrWFU2bjJFWHpPTUUtZUtSYVFCZ2paemtlWnRNLWRPaXZZa1Q5LUpDR2VvOFI2QVpNUlNlN1RZcVZoYk9QSXlJM1Z4cy1aWDlRY2dmVXg4Q3p2QWFEeFhvWHVKdlpDNld1XzRncHRqWkVTN1ZuaEY4d0gxc3VQUDAycW96b1A3REc2UTRYWUc3ZkRCM1pDQll5WUxkd1c0eVJPMTEwbjZPZGdJOXBsQktLTS1CdFJBQ1cxWTU1MEpTeUcyTkxGOUhtSkxkcDgtUTZERFNyLSIsImlzc3VlZF9hdCI6MTQ0MjI5MTEwNCwidXNlcl9pZCI6IjEwMTUzMTYyNTgwMzgyMDU4In0
                request.send(null);
                $rootScope.loggedInUser = response;
            });
        });
    });

    $rootScope.$on('fbLogoutSuccess', function() {
        $scope.$apply(function() {
            $rootScope.loggedInUser = {};
        });
    });

    $scope.stage = new TangibleStage('tangibleContainer');
    $.couch.urlPrefix = "http://192.168.1.11:5984";
    $scope.db = $.couch.db("test");
    $scope.loginUrl = "https://www.facebook.com/dialog/oauth?client_id=123111638040234&redirect_uri=http:%2F%2F192.168.1.11:5984%2F_fb";
    $scope.tangibleController = new TangibleController($scope.stage, $scope.db.uri);
    $scope.currentUser = null;

    //$scope.watchLoginChange();

    $scope.db.openDoc('4af774d88562315b657fbeacc8000f79', {
        success: function(data) {
            $scope.tangibleController.loadTangibleLibrary(data);
        },
        error: function(status) {
            console.log(status);
        }}
    );

    //$scope.login = function() {
    //    $.couch.session({
    //            success: function (data) {
    //                name = data.userCtx.name;
    //
    //                if(name == "null")
    //                {
    //                    var popupWidth = 1000;
    //                    var popupHeight = 560;
    //                    var x = screen.width/2 - popupWidth/2;
    //                    var y = screen.height/2 - popupHeight/2;
    //
    //                    var popup = window.open($scope.loginUrl, 'Tangibles Login','height=' + popupHeight + ', width=' + popupWidth + ', left=' + x + ', top=' + y);
    //
    //                    if(popup != null) {
    //                        popup.focus();
    //                    }
    //                }
    //                else
    //                {
    //                    $.couch.db(name).info({
    //                        success: function(data) {
    //                            console.log(data);
    //                        }
    //                    });
    //                }
    //            }
    //        })
    //};

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



    //$scope.watchLoginChange = function() {
    //
    //    var _self = this;
    //
    //    FB.Event.subscribe('auth.authResponseChange', function(res) {
    //
    //        if (res.status === 'connected') {
    //
    //            /*
    //             The user is already logged,
    //             is possible retrieve his personal info
    //             */
    //            _self.getUserInfo();
    //
    //            /*
    //             This is also the point where you should create a
    //             session for the current user.
    //             For this purpose you can use the data inside the
    //             res.authResponse object.
    //             */
    //
    //        }
    //        else {
    //
    //            /*
    //             The user is not logged to the app, or into Facebook:
    //             destroy the session on the server.
    //             */
    //
    //        }
    //
    //    });
    //
    //};
    //
    //$scope.getUserInfo = function() {
    //
    //    var _self = this;
    //
    //    FB.api('/me', function (res) {
    //
    //        $rootScope.$apply(function () {
    //
    //            $rootScope.user = _self.user = res;
    //
    //        });
    //
    //    });
    //};
    //
    //$scope.logout = function() {
    //
    //    var _self = this;
    //
    //    FB.logout(function (response) {
    //
    //        $rootScope.$apply(function () {
    //
    //            $rootScope.user = _self.user = {};
    //
    //        });
    //
    //    });
    //};

    //$scope.login();
})

//.run(['$rootScope', '$window', 'srvAuth',
//    function($rootScope, $window, sAuth) {
//
//        $rootScope.user = {};
//
//        $window.fbAsyncInit = function() {
//            FB.init({
//                appId: '123111638040234',
//                channelUrl: 'app/channel.html',
//                status: true,
//                cookie: true,
//                xfbml: true
//            });
//            sAuth.watchAuthenticationStatusChange();
//        };
//
//        (function(d){
//            var js,
//                id = 'facebook-jssdk',
//                ref = d.getElementsByTagName('script')[0];
//
//            if (d.getElementById(id)) {
//                return;
//            }
//
//            js = d.createElement('script');
//            js.id = id;
//            js.async = true;
//            js.src = "//connect.facebook.net/en_US/all.js";
//
//            ref.parentNode.insertBefore(js, ref);
//
//        }(document));
//
//    }]);