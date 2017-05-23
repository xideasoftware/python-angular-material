
pdapp.controller('latestArticleCtrl', ['TopicLatestService','$scope','$rootScope','$log','pdTopicService',
                                       function(latestArticlesService, scope, rootScope, log, pdTopicService) {
	scope.loaded = function() {
		scope.fetchLatestArticles();
	};
	
	scope.fetchLatestArticles = function (){
		latestArticlesService.query({"topic_id":scope.topic.id, "ishome":scope.topic == scope.alltopics}, function(response){
    		var res = response;
    		scope.latestarticles = [];
			angular.forEach(res["latestarticles"], function(a, key){
				if (a["headline"] == null)
					return;
				a["headline"] = scope.fixheadline(a.headline);
				a["urllink"] = "/article/"+a.article_id+"/"+a.firsttopic+"/"+a.firstaxis+"/"+scope.makesafelink(a.headline);
				if (a.onsite == false){
					scope.offsitelinks[a.article_id]=a.link;
				}
				this.push(a);
			},scope.latestarticles);
		});
    };
                                
	scope.topicnamefiltered = function(){
		return pdTopicService.topicnamefiltered(scope.topic);
	}

	scope.$on('topicchange', function(event, topic) {
		scope.topic=topic;
		scope.fetchLatestArticles();
	});
		
}]);
