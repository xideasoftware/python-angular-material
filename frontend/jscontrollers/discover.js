pdapp.controller('discoverCtrl', [ 'TopicService', '$scope', '$rootScope', '$log', '$http', '$routeParams', '$location', '$route', 'modalService',
    function(topicService, scope, rootScope, log, http, routeParams, location, route, modal) {
	    var topicid = routeParams.topicId;
	    scope.topic = scope.idtotopics[topicid];
	    scope.ishome = false;

	    scope.hashomefeatures = function() {
		    return !_.isEmpty(scope.topic.homefeatures);
	    };

	    scope.$on('parenttopicchangerequest', function(event, topic, axisid, side) {
		    var modalinstance = modal.open({ templateUrl : basepartialurl + 'statementpopup.html', resolve : { topic : function() {
			    return topic;
		    }, axisid : function() {
			    return axisid;
		    }, side : function() {
			    return side;
		    } }, controller : 'statementpopupCtrl' });
	    });

	    scope.$on('parentprogressupdate', function(event, dialtype, dialid, complexity, reactionlevelprogress) {
		    scope.$broadcast('progressupdate', dialtype, dialid, complexity, reactionlevelprogress);
	    });

	    scope.$on('statementchange', function(event, statement) {
		    location.search({ statementid : statement.id, statementtext : scope.makesafelink(statement.text.substring(0, 100)) });
		    scope.page.setTitle(scope.topic.name + " - " + statement.text);
	    });

    } ]);
