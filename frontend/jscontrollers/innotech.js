
pdapp.controller('innotechCtrl', ['ClientService', '$scope', '$location', 'modalService',
     function(clientService, scope, location, modal) {

	scope.clientid = 5;
	scope.data = {};

	clientService.query({
		client_id: scope.clientid
	}, function(response) {
		scope.data.client = response["client"];
		scope.showlogo = scope.data.client["imageurl"] != null;
	});
	
	scope.getclientid = function(){
		return scope.clientid;
	};
	
	scope.topicid = null;
	scope.$on('statementchange', function(event, statement) {
		scope.page.setTitle(statement.text);
	});	
	
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
	
	scope.$on('parentchangelevel', function(event, complexity) {
		scope.$broadcast('changelevel',complexity);
	});	
	scope.$on('parentprogressupdate', function(event, dialtype, dialid, complexity, reactionlevelprogress){
		scope.$broadcast('progressupdate', dialtype, dialid, complexity, reactionlevelprogress);
	});	

}]);

pdapp.controller('logoCtrl', ['ClientService', 'CacheService', '$scope','$rootScope','$log','$http','$routeParams','$location','$route', 
				function(clientService, cache, scope, rootScope, log, http, routeParams, location, route) {
	
	scope.checktime = function(){
	    var date = new Date();
	    var hour = date.getHours();
	    var min  = date.getMinutes();
	    scope.afterhours = (hour >= 21);
		setTimeout(scope.checktime, 60000);
	};
	scope.checktime();
}]);
