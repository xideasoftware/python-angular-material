

pdapp.controller('hometestingCtrl', ['HomeService', '$scope','$rootScope','$log','$http','$routeParams','$location','$route', 'modalService',
			function(homeservice, scope, rootScope, log, http, routeParams, location, route, modal) {
	scope.init = function() {
	};
	scope.init();
	
	scope.$on('parenttopicchangerequest', function(event, topic, axisid, side) {
		var modalinstance = modal.open({
			templateUrl : basepartialurl + 'statementpopup.html',
			resolve : {
				topic : function() {
					return topic;
				},
				axisid : function() {
					return axisid;
				},
				side : function() {
					return side;
				}
			},
			controller : 'statementpopupCtrl'
		});
	});

	scope.$on('parentprogressupdate', function(event, dialtype, dialid, complexity, reactionlevelprogress){
		scope.$broadcast('progressupdate', dialtype, dialid, complexity, reactionlevelprogress);
	});	

}]);
