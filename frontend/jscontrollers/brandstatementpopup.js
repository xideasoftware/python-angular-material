pdapp.controller('brandstatementpopupCtrl', [
    'StatementService',
    '$scope',
    '$rootScope',
    '$log',
    '$mdDialog', 
    'topic',
    'axisid',
    'side',
    '$location',
    function(statementService, scope, rootScope, log, mdDialog, topic, axisid, side, location) {

	    scope.topic = topic;
	    scope.axisid = axisid;
	    scope.side = side;

	    scope.iscenter = function() {
		    return (scope.side == 0);
	    }

	    scope.mapreaction = function(reaction) {
		    if (reaction == -2)
			    return "Strongly Against";
		    if (reaction == -1)
			    return "Moderately Against";
		    if (reaction == 0)
			    return "A mixture of For and Against";
		    if (reaction == 1)
			    return "Moderately For";
		    if (reaction == 2)
			    return "Strongly For";
	    };

	    scope.makesafelink = function(link) {
		    if (link == null)
			    return "";
		    return link.toLowerCase().replace(/ /g, "-").replace(/[^\w\s-]/gi, '');
	    };

	    scope.loaded = function() {
		    var topicid = scope.topic.id;
		    statementService.drillvotes({ dialtype : 'visitor', topicid : scope.topic.id, axisid : axisid,
		      clientid : scope.clientid, side : side }, function(response) {
			    scope.statements = [];
			    angular.forEach(response["statements"], function(value, key) {
				    scope.statements.push(value);
			    }, scope.statements);
		    });
	    };
	    scope.closemodal = function() {
		    mdDialog.hide();
	    };

	    scope.gostatement = function(statement) {
		    scope.closemodal();
		    rootScope.gostatement(statement);
	    };
	    
	    scope.go = function(url){
			rootScope.go(url);
			};

	    scope.loaded();
    } ]);
