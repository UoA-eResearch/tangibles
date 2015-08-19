function LibraryController($scope, $mdDialog, $http, $mdSidenav, $mdUtil) {

    $http.get('libraries/oroo/tangibles.json').success(function(data) {
        $scope.tangibleLibrary = data.tangibleLibrary;
        console.log('Tangibles: ', data.tangibleLibrary)
    });

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
        initTouchWindow(container, width, height);
    };

    $scope.editTangible = function (tangible, $event) {
        $scope.selectedTangible = tangible;
        $mdSidenav('right').open();

        var containerID = 'touch-points';
        var container = document.getElementById(containerID);
        container.addEventListener('onresize', function(){initTouchWindow(containerID);});
    };

    $scope.close = function () {
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
            });

        destroyTouchWindow();
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
}