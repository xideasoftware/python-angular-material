pdapp.controller('electionquizCtrl', ["StatementService", 'QuizService', "PartyService", '$scope', '$rootScope', '$location', '$mdDialog',
			'BadgeService', 'ShareServerService', 'AuthorService', '$timeout',
     function(statementService, quizService, partyService, scope, rootScope, location, mdDialog, badgeService, 
     			shareServerService, authorService, timeout) {

	scope.selectedIndex = 0;
	scope.startedgame = false;
	scope.finishedgame = false;
	scope.data = {};
	scope.havesavedstatement = false;
	
	var opaquelink = scope.getpathvalue("opaquelink");

	scope.finished = function(){
	    scope.finishedgame = true;
	    timeout(function(){scope.setselectedindex(2)}, 1200);
	};

	scope.goauthorprofile = function(){
		var url = "/authorppc/-1/-/"+scope.author.id+"/"+scope.makesafelink(scope.author.name);
		scope.go(url);
	};
	
	scope.setselectedindex = function(i){
		if(i > -1 && i < 3){
			if(i > 0){
				scope.startedgame = true;
				scope.finishedgame = true;
			}
			if(i == scope.selectedIndex)
				return;
			scope.selectedIndex = i;
			location.search('tab', scope.selectedIndex);		
		    scope.savestatement();
		}
	};

	scope.savestatement = function(showdialog){
	    if(!_.isUndefined(scope.data.personalstatement) && !_.isNull(scope.data.personalstatement) && scope.data.personalstatement.length > 0)
	  		quizService.authorstatement( {opaquelink:opaquelink, statement:scope.data.personalstatement.split('\n').join('          '), time:new Date().getTime()},
	  			function(response){
	  				scope.havesavedstatement = true;
	  				if(showdialog)
	  					mdDialog.show({controller:'defaultPopupCtrl', template:generateModal("Thanks for your response!","Your personal statement has been saved")}); 
	  			});
	}

	scope.$on("locationInternalChange", function(event, url){
		scope.setselectedindex(_.parseInt(location.search()["tab"]));
	});

    scope.loaded = function(){
		if(_.has(location.search(),"tab"))
			scope.setselectedindex(_.parseInt(location.search()["tab"]));

	    authorService.query({opaquelink:opaquelink}, function(res){
	    	scope.author = res["author"];
	    });

	    quizService.authorreactionsget({opaquelink:opaquelink}, function(res){
	    	angular.forEach(res["reactions"], function(reaction){
	    		scope.privatevotes[reaction["statement_id"]] = reaction["reaction"];
	    	});
	    });

	    quizService.authorstatementget({opaquelink:opaquelink}, function(res){
	    	if(!_.isUndefined(res["statement"]))
	    		scope.data.personalstatement = res["statement"].split('          ').join('\n');
	    });

		statementService.query({
			clientid: 8,
		}, function(response) {
			scope.flatstatements=response["statements"];
			scope.totalstatements = scope.flatstatements.length;
			for (var i=0; i<scope.flatstatements.length; i++)
			   scope.flatstatements[i].index = i;
			scope.layoutstatements();
		});

    };

	scope.lastflatstatementcount = -1;

    scope.layoutstatements = function(){
        if(_.isUndefined(scope.flatstatements))
            return;
        var cols = 1;
        if (scope.mainviewwidth > 750)
            cols = 2;
        if (scope.mainviewwidth > 1200)
            cols = 3;          
        if(cols != scope.cols || scope.flatstatements.length != scope.lastflatstatementcount)
        	scope.statements=_.chunk(scope.flatstatements,cols);
        scope.cols = cols;
    };
    scope.$on("mainviewwidthchanged", scope.layoutstatements);

    scope.buttontext = ["Strongly Agree","Agree","Neither Really","Disagree","Strongly Disagree"];


	scope.$on('completedgame', function(){
		scope.setselectedindex(2);
	});
	
	scope.privatevotes = {};
	scope.reactrefresh = function (statement,reaction){
		scope.privatevotes[statement.id] = reaction;
    	quizService.authorreact( {opaquelink:opaquelink, id:statement.id, reaction:reaction, time:new Date().getTime()});
	};
	scope.havevoted = function (statement,reaction){
		return _.has(scope.privatevotes, statement.id) && scope.privatevotes[statement.id] == reaction;			
	};

	scope.$watch('data', function (newValue) {
        if (newValue.personalstatement && newValue.personalstatement.length > 2047) {
            scope.data.personalstatement = newValue.personalstatement.substring(0, 2047);
        }
    },true);

    scope.loaded();
    
}]);
