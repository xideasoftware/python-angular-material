
pdapp.controller('authorCtrl', ["MatchService", 'AuthorService', '$scope', '$rootScope', '$log', '$mdDialog', 'ShareService', 
'$q', "ComparisonService", 'StatementService', 
function(matchesService, authorService, scope, rootScope, log, mdDialog, shareService, q, comparisonService, statementService) {
    
    scope.matchid = _.parseInt(scope.stateParams.authorId);
    scope.matchType = 'authorstatement';
    scope.citationinfo = {};
    scope.statready = false;
    scope.resultsready = false;
    scope.topiccomparisons = [];
    scope.exactSourceEntity = true;
    scope.topicidtomatchpc = {};
    scope.printstatementids = [];
    
    scope.pic = function(author) {
        return scope.imgconfig[scope.matchType].base + author.authorpic;
    }
    
    scope.othercitations = function(c) {
        if (!scope.isActivated(c))
            return [];
        return scope.citationinfo[c.id].citations;
    }
    
    scope.getauthor = authorService.query;
    
    scope.isActivated = function(c) {
        return _.has(scope.citationinfo, c.id);
    }
    
    scope.authorready = q.defer();
    scope.loaded = function() {
        authorService.query({
            "author_id": scope.matchid
        }, function(response) {
            var res = response;
            scope.author = res["author"];
            scope.authorset = true;
            scope.page.setTitle(scope.author.name);
            scope.authorready.resolve(scope.author);
        }
        );
        
    }

    scope.gettopmatch = function(){
        matchesService.querymatches({
            matchtype: scope.matchType,
            matchid: scope.matchid,
            statementids: scope.printstatementids.join(','),
        }).then(function(matches) {
            scope.matches = matches["matches"];
        }
        );
    }
    
    scope.activate = function(c) {
        if (_.isUndefined(c.url) || _.isNull(c.url) || c.url.length < 10)
            return
        scope.gonewtab(c.url);
        return;
        if (scope.isActivated(c)) {
        }
        statementService.info({
            statementid: c.statement
        }, function(response) {
            var info = response["statementinfo"];
            scope.citationinfo[c.id] = info;
        }
        );
    }
    
    scope.querycomparisons = function(matchid) {
        scope.comparisonready = q.defer();
        var tids = _.map(scope.viewabletopics, 'id');
        comparisonService.querycomparisons({
            topicid: scope.topic.id,
            matchtype: scope.matchType,
            matchid: matchid,
            clientid: scope.clientid,
            exactsourceentity: scope.exactSourceEntity,
            filtertooriginaltopic: true,
        }).then(function(response) {
            scope.topiccomparisons = [];
            var statementids = [];
            angular.forEach(response, function(v) {
                scope.topiccomparisons.push(v);
                console.log("Here is the results of my comparison")
                console.log(v.matchpc)
                scope.topicidtomatchpc[v.topic.id] = v.matchpc;
                console.log("Here is my comparison statements")
                console.log(v.statements)
                statementids = _.union(statementids,v.statements);
                scope.printstatementids = statementids;
                console.log("Here are the statement ids:")
            	console.log(scope.printstatementids);
            }
            );
            scope.comparisonready.resolve(scope.topiccomparisons);
            statementService.prefetch(statementids);
            scope.gettopmatch();
        }
        );
    }
    
    scope.topiccomparecount = function(topiccomparisons) {
        var n = 0;
        angular.forEach(topiccomparisons, function(tc) {
            if (scope.filtertocurrenttopics(tc))
                n += 1;
        }
        );
        return n;
    }
    
    scope.jointstatements = [];
    
    scope.buildjointstatements = function(statements) {
        scope.resultsready = true;
        console.log("I just said results are ready");
        scope.jointstatementtopics = [];
        scope.statementtocitation = _.mapKeys(scope.author.authorstatementcitations, "statement");
        console.log("This is my mapped statementtocitation results");
        console.log(scope.statementtocitation);
        angular.forEach(scope.topiccomparisons, function(topiccomparison) {
            topiccomparison.jointstatements = [];
            angular.forEach(topiccomparison.statements, function(statementid) {
                if (!_.has(scope.statementtocitation, statementid))
                    return;
                var jointstatement = {
                    "citation": scope.statementtocitation[statementid],
                    "ihave": _.has(scope.visitorvotes, statementid)
                };
                this.push(jointstatement);
                statementService.getfuture(statementid).then(function(statement){
                    jointstatement.statement = statement;
                })
            }
            , topiccomparison.jointstatements);
            if (topiccomparison.jointstatements.length > 0)
                scope.jointstatementtopics.push(topiccomparison);
        }
        );
    }
    
    var generatejointpercentage 
        var total = 0;
        for(var i = 0; i < scope.jointstatements.length; i++) {
        	total += parseInt(scope.jointstatements[i]);
        }
     var avg = total / scope.jointstatements.length;
    
    
    scope.myreaction = function(statementid) {
        return scope.mapreaction(scope.visitorvotes[statementid].reaction);
    }
    
    scope.hasmyreaction = function(statementid) {
        return _.has(scope.visitorvotes, statementid);
    }

    scope.havevoted = function(statement, pos) {
       if(_.isUndefined(statement) || !_.has(scope.visitorvotes,statement.id))
            return false;
       reaction = scope.visitorvotes[statement.id].reaction;
       return (pos == reaction);
    };

    scope.topicmatch = function(topic) {
        return scope.topicidtomatchpc[topic.id];
    }
    
    scope.$on("sendgeneric", function(event, provider) {
        shareService.generategenericshare(provider);
    }
    );
    
    scope.$on('parenttopicchange', function(event, topic) {
        scope.$broadcast('topicchange', topic);
    }
    );
    
    scope.$on('topicchange', function(event, topic) {
        scope.topic = topic;
        scope.refreshresults();
    }
    );
    
    scope.activatetopic = function(topic) {
        scope.$emit('parenttopicchange', topic);
    }
    
    scope.$on("gotostatementpage", function(event) {
        rootScope.gonewpathstatement(scope.clientid, scope.topic, scope.trending);
    }
    );
    
   	scope.reactrefresh = function(statement, reaction) {
		log.info("reacted to statement "+statement.id+" complexity "+statement.complexity);
		scope.visitorvotes[statement.id] = {'reaction':reaction, 'time':new Date().getTime()};
		statementService.vote({
			visitorid : -1,
			topicid : scope.topic.id,
			id : statement.id,
			reaction : reaction,
			clientid: scope.clientid,
			comparetype: scope.comparetype,
			compareid: scope.compareid,
			trending: scope.trending
		}, function(response) {
			var res = response;
		    rootScope.$broadcast('updatedpositionset',"visitor",-1,scope.topic.id,scope.clientid,scope.comparetype,scope.compareid,scope.trending,res["positions"]);
            scope.querycomparisons(scope.matchid);
            scope.gettopmatch();
		});
		scope.$broadcast('generateprogressupdate');
	};

    scope.activeindex = -1;
    
    scope.refreshresults = function() {
        scope.resultsready = false;
        scope.$broadcast('dialchange', scope.matchType, scope.matchid, scope.topic, scope.clientid, scope.matchType, scope.matchid);
        log.info("$broadcast dialchange " + scope.matchType + " " + scope.matchid);
        scope.querycomparisons(scope.matchid);
        scope.ready.promise.then(function() {
            scope.authorready.promise.then(function() {
                scope.comparisonready.promise.then(function() {
                    scope.buildjointstatements(scope.statements);
                }
                );
            }
            );
        }
        );
    
    }
    
    scope.activejoint = null ;
    scope.activejointall = false;
    scope.activatejoint = function(activejoint) {
        if (scope.activejoint == activejoint) {
            scope.activejoint = null ;
            return;
        }
        scope.activejoint = activejoint;
        scope.activejointall = false;
    }
    
    scope.isActivatedJoint = function(activejoint) {
        return scope.activejoint == activejoint || scope.activejointall;
    }
    
    scope.activatealljoints = function() {
        scope.activejointall = _.isNull(scope.activejoint) ? (!scope.activejointall) : false;
        scope.activejoint = null ;
    }
    
    scope.mapreaction = rootScope.mapreaction

    scope.$on("sendauthormatchtotw", function() {
        rootScope.loadimage(scope.matches[0].pic, function(img) {
            var pngdataurl = generatematchpng(scope.matches[0].name, img, scope.matches[0].matchpc, scope.logoimg);
            var msg = "I match " + scope.matches[0].name + " " + scope.matches[0].twitter + " " + scope.matches[0].matchpc;
            var url = "/author/-1/-/" + scope.matches[0].id + "/" + scope.makesafelink(scope.matches[0].name);
            shareService.sendtotw(msg, url, pngdataurl, {
                match: scope.matches[0]
            });
        }
        );
    }
    );
    
    scope.$on("sendauthormatchtofb", function() {
        rootScope.loadimage(scope.matches[0].pic, function(img) {
            var pngdataurl = generatematchpng(scope.matches[0].name, img, scope.matches[0].matchpc, scope.logoimg);
            var msg = "I match " + scope.matches[0].name + " " + scope.matches[0].matchpc;
            var url = "/author/-1/-/" + scope.matches[0].id + "/" + scope.makesafelink(scope.matches[0].name);
            shareService.sendtofb(msg, url, pngdataurl, {
                match: scope.matches[0]
            });
        }
        );
    }
    );
    
    scope.loaded();
}
]);
