
angular.module('tangiblesLoginApp', ['ngMaterial'])
    .controller('LoginCtrl', function($scope) {
        $scope.login = function() {
            location.href = loginUrl;
        };
    }
);