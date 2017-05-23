

pdapp.controller('authorPopupCtrl', ['AuthorService','$scope','$rootScope','$log','$mdDialog', 'topic', 'authorid',
                                 function(authorService, scope, rootScope, log, mdDialog, topic, authorid) {

	scope.authorid = authorid; 
	scope.topic = topic;                                	
	scope.loaded = function() {
		authorService.query({"author_id":scope.authorid, "topic_id":scope.topic.id}, function(response){
    		var res = response;
    		scope.author = res["author"];
    		scope.authorset = true;
	    });
	};
	
	scope.mapreaction = rootScope.mapreaction;

	scope.closemodal = function(){
		mdDialog.hide();
	};
	
	scope.loaded();
}]);
