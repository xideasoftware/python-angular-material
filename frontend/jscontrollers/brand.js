
pdapp.controller('orgCtrl', ["MatchService",'orgService','$scope','$rootScope','$log','$mdDialog','ShareService',
                                 function(matchesService, orgService, scope, rootScope, log, mdDialog, shareService) {

	scope.orgId = scope.stateParams.orgId;       
	scope.matchType = 'org';
                                   
	scope.loaded = function() {
		orgService.query({"org_id":scope.orgId}, function(response){
    		var res = response;
    		scope.org = res["org"];
			scope.orgset = true;
			scope.page.setTitle(scope.org.name);
	    });
	    
		matchesService.querymatches({matchtype:'orgstatement',matchid:scope.orgId}, function(response){
				scope.matches = response["orgs"];
		});
					
	};
                                   
	scope.$on("sendorgmatchtotw",function(){
		rootScope.loadimage(scope.matches[0].pic, function(img){
	    	var pngdataurl = generatematchpng(scope.matches[0].name, img, scope.matches[0].matchpc, scope.logoimg);
			var msg = "I match "+scope.matches[0].name + " " + scope.matches[0].twitter + " " + scope.matches[0].matchpc;
			var url = "/org/-1/-/"+scope.matches[0].id+"/"+scope.makesafelink(scope.matches[0].name);
			shareService.sendtotw(msg, url, pngdataurl, {match:scope.matches[0]});	
		});
	});

	scope.$on("sendorgmatchtofb",function(){
		rootScope.loadimage(scope.matches[0].pic, function(img){
	    	var pngdataurl = generatematchpng(scope.matches[0].name, img, scope.matches[0].matchpc, scope.logoimg);
			var msg = "I match "+scope.matches[0].name + " " + scope.matches[0].matchpc;
			var url = "/org/-1/-/"+scope.matches[0].id+"/"+scope.makesafelink(scope.matches[0].name);
			shareService.sendtofb(msg, url, pngdataurl, {match:scope.matches[0]});
		});
	});
	
	scope.loaded();
}]);
