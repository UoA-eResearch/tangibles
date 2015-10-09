
var loginUrl = "https://www.facebook.com/dialog/oauth?client_id=123111638040234&redirect_uri=http:%2F%2Flocalhost:5984%2F_fb";

angular.module('tangiblesLoginApp', ['ngMaterial'])
    .controller('LoginCtrl', function($scope) {
        $scope.login = function() {
            location.href = loginUrl;
        };

        //jQuery(window).trigger('resize').trigger('scroll');
    }
);