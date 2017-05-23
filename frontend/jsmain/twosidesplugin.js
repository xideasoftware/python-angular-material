
var pdtwosides = angular.module('pdtwosides', [ 'ngResource']);

pdtwosides.controller('TwoSidesCtrl', ['$http', '$scope', function(http, scope) {

	scope.application_url = "http://www.positiondial.com";
    scope.data = {};
	scope.data.initialised = true;

}]);

