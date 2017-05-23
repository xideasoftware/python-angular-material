

pdapp.controller('ifiwereinparliamentthurs6novCtrl', ['$scope','$rootScope','$log','$http','$routeParams','$location','$route', 'modalService', 
		function(scope, rootScope, log, http, routeParams, location, route, modal) {
	scope.topicid = null;
	scope.$on('parenttopicchange', function(event, topic) {
		scope.topic = topic;
		scope.$broadcast('topicchange',scope.topic);
	});	
	scope.$on('statementchange', function(event, statement) {
		scope.page.setTitle(statement.text);
	});	
	
	scope.$on('parentchangelevel', function(event, complexity) {
		scope.$broadcast('changelevel',complexity);
	});	
	
	scope.$on('parentprogressupdate', function(event, dialtype, dialid, complexity, reactionlevelprogress){
		scope.$broadcast('progressupdate', dialtype, dialid, complexity, reactionlevelprogress);
	});	

}]);

