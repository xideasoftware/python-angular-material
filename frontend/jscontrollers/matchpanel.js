
pdapp.controller('matchPanelCtrl', ["MatchesService", '$scope','$rootScope','$timeout','$log', 
                                       function(matchesService, scope, rootScope, timeout, log) {

		scope.data = {'hasmatches':false};
		scope.matchType = 'authormp';
		
		if (typeof scope.topic == 'undefined'){
			scope.topic = scope.alltopics;
		};
                                         
		if (typeof scope.amount == 'undefined'){
			scope.amount = 3;
		};        

	  	scope.loaded = function() {
			scope.querymatches();
	  	};
				
		scope.querymatches = function() {
            console.log("matchpanel - refreshing");
			scope.goingtorefresh = false;
			scope.statready = false;
			matchesService.query({topicid:scope.topic.id,matchtype:scope.matchtype,matchid:-1}, function(response){
            	console.log("matchpanel - refreshed");
				scope.statready = true;
	        	var res=response;
	        	scope.data['hasmatches'] = !_.isEmpty(res["authors"]);
				scope.matches = [];
				angular.forEach(res["authors"], function(e, k){
					var m = (e["matchpc"].toFixed(0));
					if (m > 99)
						m=100;
					if (m < -99)
						m=-100;
					var name = e["name"];
					if (name == null || name == "")
						return;
					name = name.replace(" MP","");
					var pic=(e["pic"]==null)?(scope.imgconfig[scope.matchType].default):(scope.imgconfig[scope.matchType].base+e["pic"]);
					var sourcelink = (scope.matchType=="authormp")?"author":"org";
					var match = {"idx":scope.matches.length, "id":e["id"], "name":name, "pic":pic, "matchpc":m+"%", 
					"safelink":"/author/-1/-/"+e["id"]+"/"+scope.makesafelink(e["name"])};
					scope.matches.push(match);
				});
			});
		};

		scope.goingtorefresh = false;
		scope.$on('progressupdate', function(event, dialtype, dialid, complexity, reactionlevelprogress){
			if (scope.goingtorefresh){
				return;
            };
			timeout(scope.querymatches, 10000);
			scope.goingtorefresh = true;
		});

}]);
