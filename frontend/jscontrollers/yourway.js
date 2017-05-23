
pdapp.controller('yourWayCtrl', ['TopicChooserService', '$scope', '$rootScope' ,'$log',
				function(topicChooserService, scope, rootScope, log) {
	
	scope.yourtopics = [];

	scope.loaded = function(){
		topicChooserService.interestingtopics({}, function (response){
			scope.suggestedtopics = [scope.idtotopics["102"],scope.idtotopics["66"],scope.idtotopics["56"],
						scope.idtotopics["5"],scope.idtotopics["107"],scope.idtotopics["63"],scope.idtotopics["22"],scope.idtotopics["103"]];
						
			scope.yourtopics = [];
			angular.forEach(response["interestedtopics"], function(tid, key){ 
				this.push(scope.idtotopics[tid]);
				_.remove(scope.suggestedtopics, scope.idtotopics[tid]);
			},scope.yourtopics);
		});
	};

	scope.activatetopic = function(topic){
		scope.$emit('parenttopicchange2',topic);
	};      
                  
}]);

