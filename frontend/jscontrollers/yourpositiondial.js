

pdapp.controller('yourpositiondialCtrl', ['$scope','$rootScope','$log','$http','$location','$mdDialog',
		function(scope, rootScope, log, http, location, mdDialog) {

	scope.$on('statementchange', function(event, statement) {
		scope.page.setTitle("Your PositionDial - "+statement.text);
	});

	scope.$on('parenttopicchange2', function(event, topic){
		scope.topic = topic;
		scope.$broadcast('topicchange',scope.topic);
	});

	scope.$on('parenttopicchangerequest', function(event, topic, axisid, side) {
		var modalinstance = mdDialog.show({
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

