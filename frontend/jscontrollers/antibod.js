
pdapp.controller('antibodCtrl', ["VisitorAntibodService",'$scope','$rootScope','$log','pdTopicService','ArticleService',
                                       function(visitorAntibodService, scope, rootScope, log, pdTopicService, articleService) {
	scope.loaded = function() {
		scope.fetchLatestArticles();
	};

	scope.loading = false;
	scope.fetchLatestArticles = function (){
		if(scope.loading)
			return;
		scope.loading = true;
		scope.articlestats = [];
		scope.seenheadlines = {};
    	scope.latestarticles = [];
    	scope.itemcount = 0;
    	visitorAntibodService.query({"topic_id":scope.topic.id}, function(response){
    		scope.articlestats = response["latestarticles"];
    		scope.addmore(14);
  		});
	};

	scope.addmore = function(extranum){
		var startind = scope.itemcount;
    	scope.itemcount += extranum;
    	if(scope.itemcount > scope.articlestats.length)
    		scope.itemcount = scope.articlestats.length;
    	extranum = scope.itemcount - startind;
    	if(!(extranum > 0)){ return};
    	var newarticles = _.map(_.slice(scope.articlestats, startind, scope.itemcount), 'article_id');
       	articleService.prefetch(newarticles);
		angular.forEach(newarticles, function(article_id){
            var fut=articleService.getfuture(article_id);
            fut["ready"]=false;
            fut.then(function(a) {
				scope.loading = false;
				if (a["headline"] == null)
					return;
				fut["headline"] = scope.fixheadline(a.headline);
				if(_.has(scope.seenheadlines, fut["headline"]))
					return;
				scope.seenheadlines[fut["headline"]] = true;
				fut["urllink"] = "/article/"+a.article_id+"/"+a.firsttopic+"/"+a.firstaxis+"/"+scope.makesafelink(a.headline);
            	fut["ready"]=true;
				scope.offsitelinks[a.article_id]=a.link;
			});
			scope.latestarticles.push(fut);
		});
	};
	               	
	scope.topicnamefiltered = function(){
		return pdTopicService.topicnamefiltered(scope.topic);
	};

    scope.$on('topicchange', function(event, topic) {
    	scope.topic = topic;
		scope.fetchLatestArticles();
    });
		
	scope.loaded();
}]);
