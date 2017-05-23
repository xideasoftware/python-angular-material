

pdapp.controller('articleCtrl', ['ArticleService', 'TopicService', '$scope','$rootScope','$log','$http','$routeParams','$location','$route','modalService',
                                 function(articleService, topicService, scope, rootScope, log, http, routeParams, location, route, modal) {
	scope.topicid = 0;
	if (parseInt(routeParams.topicId) > 0){
		scope.topic = {'id':routeParams.topicId, 'name':''};
		topicService.query({"topic_id":scope.topic.id}, function(response){
			var res=response;
			scope.topic = res;
			scope.$broadcast('topicchange',scope.topic)
		});
	}
	else{
		scope.topic = {'id':-1, 'name':''};
		articleService.toptopic({"article_id":routeParams.articleId}, function(response){
    		var res = response;
			scope.topicid = res["id"];
    		scope.topic = res;
			scope.$broadcast('topicchange',scope.topic)
	    });
	}

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
