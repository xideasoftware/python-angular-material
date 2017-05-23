

pdapp.controller('matchmpCtrl', ["MatchService", "ComparisonService", '$scope','$rootScope','$log','AuthorService','ShareService', 
											'$mdDialog', '$q', 'StatementService',
                                       function(matchesService, comparisonService, scope, rootScope, log, authorService, shareService, 
                                       			mdDialog, q, statementService) {

	scope.statready = false;
	scope.topiccomparisons = [];
	scope.exactSourceEntity = true;
	scope.topicidtomatchpc = {};
    scope.itemcount = 8;
	scope.matchType = "authormp";

	scope.querymatches = function() {
		matchesService.query({topicid:-1,matchtype:scope.matchType,clientid:scope.clientid,matchid:scope.stateParams.matchId}, function(response){
			scope.statready = true;
        	var res=response;
			scope.matches = [];
			angular.forEach(res["matches"], function(e, k){
				var m = (e["matchpc"].toFixed(0));
				if (m > 99)
					m=100;
				if (m < -99)
					m=-100;
				var name = e["name"];
				if (name == null || name == "")
					return;
				var twitter = e["twitter"];
				var pic=(e["pic"]==null)?(scope.imgconfig[scope.matchType].default):(scope.imgconfig[scope.matchType].base+e["pic"]);
				var match = {"idx":scope.matches.length, "id":e["id"], "name":name, "twitter":twitter, "pic":pic, "matchpc":m+"%", "safelink":"/authormp/"+e["id"]+"/"+scope.makesafelink(e["name"])};
				scope.matches.push(match);
			});
			scope.activate(0);
			
		});
	};

	scope.querycomparisons = function(matchid) {
		var tids = _.map(scope.viewabletopics, 'id');
		comparisonService.compare({matchtype:scope.matchType, matchid:matchid, clientid:scope.clientid, exactsourceentity:scope.exactSourceEntity}, function(response){
        	var res=response;
			scope.topiccomparisons = [];
			angular.forEach(res["comparison"], function(e, k){
				var m = (e["matchpc"]*100).toFixed(0);
				if (m > 99)
					m=100;
				if (m < -99)
					m=-100;
				if(!_.has(scope.idtotopics, e.topic))
					return;
				if(!_.contains(tids, e.topic))
					return;
				var t = scope.idtotopics[e.topic];
				var match = {"matchpc":m+"%", "topic":t};
				if(e["matchpc"] != 0)
					scope.topiccomparisons.push(match);
				scope.topicidtomatchpc[t.id]=match["matchpc"];
			});			
		});
	};

	scope.statementsready = q.defer();
	scope.querystatementhistory = function(){
		scope.statementsready = q.defer();
		statementService.query({
			topicid : scope.topic.id,
			clientid : scope.clientid
		}, function(response) {
			scope.statements = {};
			angular.forEach(response["statements"], function(statement){
			if(!_.has(scope.visitorvotes,statement.id))
				return
			this[statement.id]={"id":statement.id, "reaction":scope.visitorvotes[statement.id].reaction, "text":statement.text}
			}, scope.statements);
			scope.statementsready.resolve();
		});
	};

	scope.mpvotestatements = [];

	scope.queryauthor = function(matchid){
		authorService.query({"author_id":matchid}, function(response){
			scope.statementsready.promise.then(function(){
    			var res = response;
    			scope.mpvotestatements = [];
    			scope.author = res["author"];
				scope.authorset = true;
				scope.page.setTitle("Match with "+scope.author.name);
				angular.forEach(scope.author.mpvotes, function(mpvote){
					if(_.has(scope.statements,mpvote.statement))
						
						scope.mpvotestatements.push({mpvote:mpvote, statement:scope.statements[mpvote.statement]});
				});
			});
	    });
	};

	scope.gettopicmatch = function(){
		if(_.has(scope.topicidtomatchpc, scope.topic.id))
			return scope.topicidtomatchpc[scope.topic.id];
	};
	
	scope.$on("sendtopmpmatchtotw",function(){
		rootScope.loadimage(scope.matches[0].pic, function(img){
	    	var pngdataurl = generatematchpng(scope.matches[0].name, img, scope.matches[0].matchpc, scope.logoimg);
			var msg = "My top matched MP is "+scope.matches[0].name + " " + scope.matches[0].twitter;
			var url = "/author/-1/-/"+scope.matches[0].id+"/"+scope.makesafelink(scope.matches[0].name);
			shareService.sendtotw(msg, url, pngdataurl, {match:scope.matches[0]});	
		});
	});

	scope.$on("sendtopmpmatchtofb",function(){
		rootScope.loadimage(scope.matches[0].pic, function(img){
	    	var pngdataurl = generatematchpng(scope.matches[0].name, img, scope.matches[0].matchpc, scope.logoimg);
			var msg = "My top matched MP is "+scope.matches[0].name + " " + scope.matches[0].twitter;
			var url = "/author/-1/-/"+scope.matches[0].id+"/"+scope.makesafelink(scope.matches[0].name);
			shareService.sendtofb(msg, url, pngdataurl, {match:scope.matches[0]});
		});
	});

	scope.$on('parenttopicchange', function(event, topic) {
		scope.topic = topic;
		scope.querystatementhistory();
		scope.statementsready.promise.then(function(){
    		scope.mpvotestatements = [];
			angular.forEach(scope.author.mpvotes, function(mpvote){
				if(_.has(scope.statements,mpvote.statement))
					scope.mpvotestatements.push({mpvote:mpvote, statement:scope.statements[mpvote.statement]});
			});
		});
		scope.$broadcast('topicchange',scope.topic);
	});		

	scope.activatetopic = function(topic){
		scope.$emit('parenttopicchange',topic);
	};
	
	scope.loaded = function() {
		scope.querymatches();
		scope.querystatementhistory();
	};

	scope.activeindex = -1;
	
	scope.activate = function(index) {
		scope.activeindex = index;
		scope.matchcardselected = scope.matches[index];
		var matchid = scope.matchcardselected["id"];
		scope.dialid = matchid; //hack
		scope.topic = scope.alltopics;
		scope.topicidtomatchpc[scope.topic.id] = scope.matchcardselected["matchpc"];
		scope.$broadcast('dialchange',scope.matchType, matchid, scope.topic, scope.clientid, scope.matchType, matchid );
		log.info("$broadcast dialchange "+scope.matchType);
		scope.querycomparisons(matchid);
		scope.queryauthor(matchid);
		rootScope.$broadcast('matchchange', matchid, scope.matchcardselected.name);
	};
	
	scope.isActive = function(index) {
		return scope.activeindex === index; 
	};
                                         
    scope.addmore = function(){
		scope.itemcount += 6;
  	};

	scope.loaded();
}]);
