
pdapp.controller('yourlevelCtrl', ['$scope', '$rootScope' ,'$log', '$timeout',
				function(scope, rootScope, log, timeout) {
	
                  
	scope.single = false;

	log.info("your level being loaded");
	scope.loaded = function(){
		log.info("your level loaded");
		scope.levels=scope.single?[-1]:[0,1,2];
		scope.csetlist = scope.single?['Progress']:['Level One','Level Two','Level Three'];
		scope.level = scope.single?-1:0;
		rootScope.subscribeupdates('generateprogressupdate');
	};

	scope.levelprogress = {};

	angular.forEach([-1,0,1,2],function(level){
		scope.levelprogress[level] = {'totalstatements':0, 'totalvotes':0, 'progress':0};
	},scope.levelprogress);

	scope.showtitle = false;

	scope.$on('progressupdate', function(event, dialtype, dialid, level, reactionlevelprogress){
		//log.info("received update "+level);
		//console.dir(JSON.stringify(reactionlevelprogress));
		scope.levelprogress[level] = reactionlevelprogress;
	});

	scope.$on('changelevel', function(event, level){
		scope.level = level;
	});

	scope.$on('statementchange', function(event, statement) {
		scope.level = statement.complexity;
	});

	scope.changelevel = function(level){
		if (scope.single)
			return;
		if (scope.reactionlevelhasnostatements(level))
			return;
		scope.level=level;
		scope.$emit('parentchangelevel', level);
	};
	
	scope.reactionlevelprogress = function(level){
		return scope.levelprogress[level]['progress'];
	};

	scope.reactionlevelprogresstext = function(level){
  		return ""+scope.reactionlevelprogress(level)+"%";
	};

	scope.reactionlevelmax = function(level){
	  	return 100; 	
	};

	scope.reactionlevelnotcomplete = function(level){
	  	var notcomplete = scope.reactionlevelprogress(level) < scope.reactionlevelmax(level);
	  	log.info("notcomplete "+notcomplete);
	  	return notcomplete;
	};

	scope.reactionlevelhasnostatements = function(level){
		return scope.levelprogress[level]['totalstatements'] == 0;
	};

	scope.reactionleveltext = function(level){
		if (level < 0){
			level = 0;
		}
		return scope.csetlist[level] + " " + scope.levelprogress[level]['totalvotes'].toString() + "/" + scope.levelprogress[level]['totalstatements'].toString();
	};

	scope.reactionleveltextprogress = function(level){
		var clevel = level;
		if (clevel < 0){
			clevel = 0;
		}
		return scope.csetlist[clevel] + " " + scope.levelprogress[level]['totalvotes'].toString() + "/" + scope.levelprogress[level]['totalstatements'].toString();
	};

	scope.reactionleveltooltiptext = function(level){
		return "React on "+scope.data.csetlist[level]+" below by hitting agree or disagree";
	};
	
}]);