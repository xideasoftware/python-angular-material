pdapp.controller('discoversidesCtrl', [
    'TopicChooserService',
    '$scope',
    '$rootScope',
    '$log',
    function(topicChooserService, scope, rootScope, log) {
	    scope.itemcount = 5;
	    scope.topicids = [];
		scope.suggestedtopics = [ scope.idtotopics["102"], scope.idtotopics["66"], scope.idtotopics["56"], scope.idtotopics["5"], scope.idtotopics["107"],
			  scope.idtotopics["63"], scope.idtotopics["22"], scope.idtotopics["103"] ];

		scope.yourtopics = [];
		scope.yourtopics = scope.yourtopics.concat(scope.suggestedtopics);

	    scope.$on('parenttopicchange2', function(event, topic) {
		    scope.topicids = [ topic.id, ];
		    scope.topic = topic;
	    });

		scope.$on('topicchange', function(event, topic) {
		    scope.topicids = [ topic.id, ];
		    scope.topic = topic;
		});	

	    scope.filteredtopics = function(){
	    	var topicid = rootScope.getpathvalue('topicId');
	    	if( topicid != null)	
	    		return [scope.idtotopics[_.parseInt(topicid)],];
	    	else
	    		return scope.yourtopics;
	    };

	    scope.loaded = function() {
		    topicChooserService.interestingtopics({}, function(response) {
				scope.yourtopics = [];
				scope.yourtopics = scope.yourtopics.concat(scope.suggestedtopics);

			    angular.forEach(response["interestedtopics"], function(tid, key) {
				    if(!_.contains(this,scope.idtotopics[tid]))
					    this.push(scope.idtotopics[tid]);
			    }, scope.yourtopics);
		    });
	    };

	    scope.addmore = function() {
		    scope.itemcount += 4;
	    };

	    scope.loaded();

    } ]);
