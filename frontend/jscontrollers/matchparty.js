

pdapp.controller('matchpartyCtrl', ["MatchService", "ComparisonService", '$scope', '$rootScope', '$log', 'ShareService', 
    '$mdDialog', '$location', 'PartyService', '$q', 'StatementService', 
    function(matchesService, comparisonService, scope, rootScope, log, shareService, 
    mdDialog, location, partyService, q, statementService) {
        
        scope.statready = false;
        scope.topiccomparisons = [];
        scope.exactSourceEntity = true;
        scope.itemcount = 8;
        scope.matchType = "party";
        scope.clientid = 8;
        scope.citationinfo = {};
        
        scope.querymatches = function() {
            matchesService.querymatches({topicid: -1,matchtype: scope.matchType,clientid: scope.clientid,
                matchid: scope.stateParams.matchId}).then(function(response) {
                scope.matches = response['matches'];
                scope.topmatch = response['topmatch'];
                scope.activate(0);
            });
        };
        
        scope.querycomparisons = function(matchid) {
            var tids = _.map(scope.viewabletopics, 'id');
            comparisonService.querycomparisons({matchtype: scope.matchType,matchid: matchid,clientid: scope.clientid,
                exactsourceentity: scope.exactSourceEntity}).then(function(response) {
                scope.topiccomparisons = response;
            });
        };
        
        scope.statementsready = q.defer();
        scope.querystatementhistory = function() {
            scope.statementsready = q.defer();
            statementService.query({
                topicid: scope.topic.id,
                clientid: scope.clientid
            }, function(response) {
                scope.statements = {};
                angular.forEach(response["statements"], function(statement) {
                    if (!_.has(scope.visitorvotes, statement.id))
                        return
                    this[statement.id] = {"id": statement.id,"reaction": scope.visitorvotes[statement.id].reaction,"text": statement.text}
                }, scope.statements);
                scope.statementsready.resolve();
            });
        };
        
        scope.topiccomparecount = function(topiccomparisons) {
            var n = 0;
            angular.forEach(topiccomparisons, function(tc) {
                if (scope.filtertocurrenttopics(tc))
                    n += 1;
            });
            return n;
        };
        
        scope.citationstatements = [];
        
        scope.queryparty = function(matchid) {
            partyService.query({"party_id": matchid}, function(response) {
                var res = response;
                scope.party = res["party"];
                scope.page.setTitle(scope.party.name);
                scope.statementsready.promise.then(function() {
                    scope.citationstatements = [];
                    scope.partyset = true;
                    angular.forEach(scope.party.citations, function(citation) {
                        if (_.has(scope.statements, citation.statement))
                            scope.citationstatements.push({citation: citation,statement: scope.statements[citation.statement]});
                    });
                });
                scope.statready = true;
            });
        };
        
        scope.gettopicmatch = function() {
            return null;
        };
        
        scope.$on('topicchange', function(event, topic) {
            if(topic == scope.topic)
                return;
            scope.topic = topic;
            scope.querystatementhistory();
            scope.statementsready.promise.then(function() {
                scope.citationstatements = [];
                angular.forEach(scope.party.citations, function(citation) {
                    if (_.has(scope.statements, citation.statement))
                        scope.citationstatements.push({citation: citation,statement: scope.statements[citation.statement]});
                });
            });
            
        });

	    scope.$on('parenttopicchange', function(event, topic) {
            scope.activatetopic(topic);
	    });
        
        scope.activatetopic = function(topic) {
            rootScope.$broadcast('topicchange', topic);
        };
        
        scope.loaded = function() {
            scope.querymatches();
            scope.querystatementhistory();
        };
        
        scope.activeindex = -1;
        
        scope.activate = function(index) {
            scope.statready = true;
            scope.activeindex = index;
            scope.matchcardselected = scope.matches[index];
            var matchid = scope.matchcardselected["id"];
            scope.partydialid = matchid; //hack
            scope.$broadcast('dialchange', scope.matchType, matchid, scope.topic, scope.clientid, scope.matchType, matchid);
            log.info("$broadcast dialchange " + scope.matchType + " " + matchid);
            scope.querycomparisons(matchid);
            scope.queryparty(matchid);
            rootScope.$broadcast('matchchange', matchid, scope.matchcardselected.name);
        };
        
        scope.isCitationActivated = function(c) {
            if (_.isUndefined(c))
                return null;
            return _.has(scope.citationinfo, c.id);
        }
        
        scope.activateCitation = function(c) {
            if (scope.isCitationActivated(c)) {
                scope.gonewtab(c.url);
                return;
            }
            statementService.info({statementid: c.statement}, function(response) {
                var info = response["statementinfo"];
                scope.citationinfo[c.id] = info;
            });
        };
        
        scope.othercitations = function(c) {
            if (!scope.isCitationActivated(c))
                return [];
            return scope.citationinfo[c.id].citations;
        }
        
        scope.isActive = function(index) {
            return scope.activeindex === index;
        };
        
        scope.addmore = function() {
            scope.itemcount += 6;
        };
        
        scope.pic = function(party) {
            return scope.baseimgurl + "partyimg/" + party.pic;
        }
        
        scope.getparty = partyService.get;
        
        scope.$on("sendtoppartymatchtotw", function() {
            matchesService.sendtoppartymatchtotw(scope.topmatch)
        });
        scope.$on("sendtoppartymatchtofb", function() {
            matchesService.sendtoppartymatchtofb(scope.topmatch)
        });
        scope.$on("sendtoppartymatch", function(event, provider) {
            if (provider == 'fb')
                matchesService.sendtoppartymatchtofb(scope.topmatch);
            if (provider == 'tw')
                matchesService.sendtoppartymatchtotw(scope.topmatch);
        });

        scope.loaded();
    }]);
