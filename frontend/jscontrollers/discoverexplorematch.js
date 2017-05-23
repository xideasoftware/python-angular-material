
pdapp.controller('discoverexplorematchCtrl', ['HomeService', '$scope', '$rootScope', '$log', '$state', '$mdDialog',    
    function(homeservice, scope, rootScope, log, state, mdDialog) {
	    scope.init = function() {
	    };
	    scope.init();

		scope.$on('parenttopicchange2', function(event, topic){
			scope.topic = topic;
			scope.$broadcast('topicchange',scope.topic);
		});

		scope.$on('parentchangelevel', function(event, complexity) {
			scope.$broadcast('changelevel',complexity);
		});	

	    scope.$on('parenttopicchangerequest', function(event, topic, axisid, side) {
		    var modalinstance = mdDialog.show({ 
		    	templateUrl : basepartialurl + 'statementpopup.html', 
		    	resolve : { 
		    		topic : function() {
			    		return topic;
		    		}, 
		    		axisid : function() {
			    		return axisid;
		    		}, side : function() {
			    		return side;
		    		}}, 
		    	controller : 'statementpopupCtrl',
		    	targetEvent: event, })
    		.then(function(answer) {
    		}, function() {
    		});
	    });

	    scope.$on('parentprogressupdate', function(event, dialtype, dialid, complexity, reactionlevelprogress) {
		    scope.$broadcast('progressupdate', dialtype, dialid, complexity, reactionlevelprogress);
	    });

    } ]);
