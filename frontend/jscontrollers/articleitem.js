

pdapp.controller('articleItemCtrl', ['ArticleService', '$sce', '$scope','$rootScope','$log','$http','$routeParams','$location','$route', 'articleid' ,
		function(articleService, sce, scope, rootScope, log, http, routeParams, location, route, articleid) {
	scope.loadedcontent = false;	
	scope.articlehtmlsafe = "";
	
	scope.loaded = function() {
		scope.loadedcontent = false;
		http({method: 'GET', url: 'http://cdn.positiondial.com/articles/'+scope.articleid+'.html'}).
    		success(function(data, status, headers, config) {
    			var somehtml = data.replace(/<img[^>]*>/g,"").replace(/<a href/g,'<a target="_blank" href')
	    					.replace(/<style[^>]*>/g,"").replace(/<script[^>]*>/g,"");

    			scope.articlehtml=sce.trustAsHtml(somehtml);
    			scope.loadedcontent = true;
    		});

		scope.loadeddetails = false;		
		articleService.query({"article_id":scope.articleid}, function(response){
    		var res = response;
    		if(res["article"].isoffsite)
    			window.location = res["article"].link;
    		scope.article = res["article"];
    		scope.articleset = true;
    		scope.page.setTitle(scope.article.headline);
    		scope.readarticle(scope.articleid);
			scope.loadeddetails = true;		
	    });

	};
	if (angular.isUndefined(articleid) || articleid == -1)
		scope.articleid = routeParams.articleId;
	else{
		scope.articleid = articleid;
		scope.loaded();
	}
}]);
