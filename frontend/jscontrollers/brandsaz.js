pdapp.controller('brandsazCtrl', ["MatchesService",'AuthorService','$scope','$rootScope','$log', 'OrgService', '$mdDialog', 'ShareService', 
                                  '$q', "ComparisonService", 'StatementService','BrandService', 
                                 function(matchesService, authorService, scope, rootScope, log, orgService, mdDialog, shareService, q, comparisonService, statementService,brandService){
                       
                                
	scope.matchType = 'org';
	scope.getorg = orgService.query;
	scope.orgready = q.defer();
	scope.orgs=[];
		    
	scope.loaded = function() {
		        orgService.query({"org_id":199}, function(response) {
		            var res = response;
		            scope.org1 = res["org"];
		            scope.orgready.resolve(scope.org1);
		        }
		        );
		        brandService.query({}, function(response) {
		            var res = response;
		            scope.orgs = res["brandList"];
		        }
		        );
    	
	    }
	
        orgService.query({"org_id":514}, function(response) {
            var res = response;
            scope.org2 = res["org"];
            scope.orgready.resolve(scope.org2);
        }
        );  
	scope.loaded();
	
}	
]);