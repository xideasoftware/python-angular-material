
pdapp.controller('authormplistCtrl', ["MatchesService",'AuthorService','$scope','$rootScope','$log','$http','$routeParams','$location','$route', 
                                 function(matchesService, authorService, scope, rootScope, log, http, routeParams, location, route) {

	scope.matchType = 'authormp';
    scope.authorcategoryType = 'mp';                        
                                   
	scope.loaded = function() {
		authorService.list({"author_category":scope.authorcategoryType}, function(response){
    		var res = response;
    		scope.authors = res["authors"];
    		scope.page.setTitle("MP A-Z");
	    });
	};
	
	scope.loaded();
}])
