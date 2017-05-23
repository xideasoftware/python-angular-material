pdapp.controller('allCtrl', ["MatchService", 'ClientService', "PartyService", '$scope', '$rootScope', '$location', '$mdDialog',
			'BadgeService', 'ShareServerService', 'ShareService',
     function(matchesService, clientService, partyService, scope, rootScope, location, dialog, badgeService, 
     			shareServerService, shareService) {

	scope.trending = false;
	scope.startedgame = false;
	scope.share = null;
	scope.data = {};
	scope.data.selectedIndex = 0;
	scope.visitoraggmatches = [];
	scope.visitormatches = [];
	scope.topic.id = 1;
	
	scope.setselectedindex = function(i){
		if(i > -1 && i < 4){
			scope.data.selectedIndex = i;
			location.search('tab', scope.data.selectedIndex);		
			if(i == 0)
				
			scope.one = true;
		    scope.two = false;
		    rootScope.subscribeupdates('generateprogressupdate');
		    
			if(i == 2)
				
			scope.two = true;
			scope.querymatches();
		}
	};
	
	   scope.showOne = function (){
		     scope.setselectedindex(2);
	    	  scope.one = false;
	    	  scope.two = true;
	    }; 
	    
	   scope.showTwo = function (){
	    scope.setselectedindex(0);
	     	  scope.one = true;
	      	  scope.two = false;
	    }; 

	scope.startgame = function(){
		scope.startedgame = true;
	};

    scope.querymatches = matchesService.refreshmatches;

	scope.$on("locationInternalChange", function(event, url){
		scope.setselectedindex(_.parseInt(location.search()["tab"]));
	});

    scope.querymatches = function(){

    };

    scope.$on("sendtopiccomplete", function(event, provider) {
        shareService.generatetopicshare(scope.topic, provider);
    });

	scope.$on("sendnbadgematchtotw", function(){ matchesService.sendtopicmatchtotw(scope.visitoraggmatches[0])});
	scope.$on("sendnbadgematchtofb", function(){ matchesService.sendtopicmatchtofb(scope.visitoraggmatches[0])});

    scope.loaded = function(){
    	var tab = _.has(location.search(),"tab")?_.parseInt(location.search()["tab"]):0;
		scope.data.selectedIndex = (tab < 0)?0:tab;		
		location.search('tab', scope.data.selectedIndex).replace();
		scope.setselectedindex(scope.data.selectedIndex);
		scope.querymatches();

		scope.shareready.then(function(share){
			if(!_.isNull(share)){
				scope.share = share;
				scope.querymatches();
			}
		});
    };

	scope.$on('statementchange', scope.settitlebystatement);
	
	 scope.$on('parenttopicchangerequest', function(event, topic, axisid, side) {
			var modalinstance = dialog.show({
				templateUrl : basepartialurl + 'allstatementpopup.html',
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

	scope.$on('completedgame', function(){
		scope.setselectedindex(2);
	});

    scope.loaded();
    
}]);