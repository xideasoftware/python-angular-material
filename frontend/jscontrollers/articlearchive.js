

pdapp.controller('articleArchiveCtrl', ['ArticleService', '$scope','$rootScope','$log','$http','$routeParams','$location','$route', 
						function(articleService, scope, rootScope, log, http, routeParams, location, route) {

	scope.fetcharchive = function(){
		scope.topicid = routeParams.topicId;
		scope.axisid = routeParams.axisId;
		articleService.archive({'article_id':routeParams.articleId, 'topic_id':routeParams.topicId, 'axis_id':routeParams.axisId} , function(response){
			var res = response;
			scope.articlearchive = res["articlearchive"];
			angular.forEach(scope.articlearchive, function(a, key){
              	a['headline'] = scope.fixheadline(a.headline);
				a['urllink'] = "/article/"+a.article_id+"/"+routeParams.topicId+"/"+routeParams.axisId+"/"+a.safelink;
				if (a.onsite == false){
					scope.offsitelinks[a.article_id]=a.link;
				}
			});
	    });
	}
	
	scope.loaded = function(){
		scope.fetcharchive();
	}
	
}])
