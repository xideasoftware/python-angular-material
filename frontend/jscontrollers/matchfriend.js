

pdapp.controller('matchfriendCtrl', ["MatchService", "ComparisonService", '$scope', '$rootScope', '$log', 'ShareService', 
'$mdDialog', '$location', '$q', 'StatementService', 'StatementHistoryService', 'ClientService', 
function(matchesService, comparisonService, scope, rootScope, log, shareService, 
mdDialog, location, q, statementService, statementHistoryService, clientService) {
    
    scope.statready = false;
    scope.topiccomparisons = [];
    scope.exactSourceEntity = true;
    scope.topicidtomatchpc = {};
    scope.itemcount = 8;
    scope.matchType = "friend";
    scope.activematchid = _.parseInt(scope.stateParams.matchId);
    scope.clientid = _.parseInt(scope.stateParams.clientId);
    scope.trending = scope.stateParams.trending;
    scope.activematch = null ;
    scope.comparisonready = q.defer();
    scope.resultsready = false;
    
    scope.querymatches = function() {
        matchesService.querymatches({
            topicid: scope.topic.id,
            clientid: scope.clientid,
            trending: scope.trending,
            matchtype: scope.matchType,
            matchid: scope.activematchid
        }).then(function(matches) {
            scope.matches = matches["matches"];
            angular.forEach(matches, function(match) {
                if (match.id == scope.activematchid)
                    scope.activematch = match;
            }
            );
            scope.activate(scope.matches[0]);
        }
        );
    }
    ;
    
    scope.matchsort = function() {
        var f = "";
        f += (_.isUndefined(scope.clientid) || ("" + scope.clientid) == "-1") ? "" : (makesafelink(clientService.idtoclients[scope.clientid].name) + " ");
        f += (_.isUndefined(scope.trending) || ("" + scope.trending) == "-1") ? ("") : ("Trending ");
        f += (scope.topic.id < 0) ? "" : (scope.topic.name + " ");
        return f;
    }
    
    scope.querycomparisons = function(matchid) {
        scope.comparisonready = q.defer();
        var tids = _.map(scope.viewabletopics, 'id');
        comparisonService.querycomparisons({
            topicid: scope.topic.id,
            matchtype: scope.matchType,
            matchid: matchid,
            clientid: scope.clientid,
            exactsourceentity: scope.exactSourceEntity
        }).then(function(response) {
            scope.topiccomparisons = [];
            angular.forEach(response, function(v) {
                if (_.contains(tids, v.topic.id))
                    scope.topiccomparisons.push(v);
            }
            );
            scope.comparisonready.resolve(scope.topiccomparisons);
        }
        );
    }
    ;
    
    scope.querystatementhistory = function() {
        if (scope.activematchid < 0)
            return;
        statementHistoryService.query({
            dialtype: 'friend',
            dialid: scope.activematchid,
            clientid: scope.clientid,
            trending: scope.trending,
            topicid: scope.topic.id
        }, function(response) {
            scope.statements = {};
            angular.forEach(response["statements"], function(v) {
                scope.statements[v["id"]] = v;
            }
            );
            scope.ready.promise.then(function() {
                scope.comparisonready.promise.then(function() {
                    scope.buildjointstatements(scope.statements);
                }
                );
            }
            );
        }
        );
    }
    ;
    
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
        scope.resultsready = scope.matches.length > 0;
        scope.jointstatementtopics = [];
        angular.forEach(scope.topiccomparisons, function(topiccomparison) {
            topiccomparison.jointstatements = [];
            angular.forEach(topiccomparison.statements, function(statementid) {
                if (!_.has(statements, statementid))
                    return;
                var jointstatement = {
                    "statement": statements[statementid]
                };
                jointstatement.onlyfriendhas = !_.has(scope.visitorvotes, jointstatement.statement.id);
                this.push(jointstatement);
            }
            , topiccomparison.jointstatements);
            if(topiccomparison.jointstatements.length > 0)
                scope.jointstatementtopics.push(topiccomparison);
        }
        );
    }
    
    scope.myreaction = function(statement) {
        return scope.mapreaction(scope.visitorvotes[statement.id].reaction);
    }
    
    scope.hasmyreaction = function(statement) {
        return _.has(scope.visitorvotes, statement.id);
    }
    
    scope.gettopicmatch = function() {
        return scope.topicidtomatchpc[scope.alltopics.id];
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
        scope.resultsready = false;
        scope.topic = topic;
        scope.querycomparisons(scope.activematchid);
        scope.querystatementhistory();
    }
    );
    
    scope.activatetopic = function(topic) {
        scope.$emit('parenttopicchange', topic);
    }
    
    scope.$on("gotostatementpage", function(event){
        rootScope.gonewpathstatement(scope.clientid, scope.topic, scope.trending);
    });

    scope.loaded = function() {
        scope.querymatches();
    }
    
    scope.activeindex = -1;
    
    scope.activate = function(match) {
        scope.resultsready = false;
        scope.statready = true;
        scope.matchcardselected = match;
        var matchid = scope.matchcardselected["id"];
        scope.activematchid = matchid;
        //scope.topic = scope.alltopics;
        scope.topicidtomatchpc[scope.topic.id] = scope.matchcardselected["matchpc"];
        scope.frienddialid = matchid;
        scope.$broadcast('dialchange', scope.matchType, matchid, scope.topic, scope.clientid, scope.matchType, matchid);
        log.info("$broadcast dialchange " + scope.matchType + " " + matchid);
        scope.querycomparisons(matchid);
        rootScope.$broadcast('matchchange', matchid, scope.matchcardselected.name);
        scope.querystatementhistory();
    }

    scope.activejoint = null;
    scope.activejointall = false;
    scope.activatejoint = function(activejoint){
        if(scope.activejoint == activejoint){
            scope.activejoint = null;
            return;
        };
        scope.activejoint = activejoint;
        scope.activejointall = false;
    };

    scope.isActivatedJoint = function(activejoint){
        return scope.activejoint == activejoint || scope.activejointall;
    };

    scope.activatealljoints = function(){
        scope.activejointall=_.isNull(scope.activejoint)?(!scope.activejointall):false;
        scope.activejoint = null;
    };
    
    scope.addmore = function() {
        scope.itemcount += 6;
    }
    
    scope.loaded();
}
]);
